const API_URL = process.env.NEXT_PUBLIC_STORE_API_URL ?? "";
const SESSION_KEY = "ladies-glows-admin-password";

export function getStoredPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function setStoredPassword(password: string) {
  sessionStorage.setItem(SESSION_KEY, password);
}

export function clearStoredPassword() {
  sessionStorage.removeItem(SESSION_KEY);
}

async function request(path: string, options: RequestInit = {}, authed = true) {
  if (!API_URL) {
    throw new Error("لم يتم ضبط رابط المتجر (NEXT_PUBLIC_STORE_API_URL)");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (authed) {
    const password = getStoredPassword();
    if (password) {
      (headers as Record<string, string>)["x-admin-password"] = password;
    }
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredPassword();
    }
    throw new Error(data.error ?? "حدث خطأ في الاتصال بالخادم");
  }

  return data;
}

export const api = {
  login: (password: string) =>
    request("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) }, false),

  changePassword: (currentPassword: string, newPassword: string) =>
    request("/api/admin/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getProducts: () => request("/api/products", { method: "GET" }, false),

  createProduct: (payload: unknown) =>
    request("/api/products", { method: "POST", body: JSON.stringify(payload) }),

  updateProduct: (id: number, payload: unknown) =>
    request(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  deleteProduct: (id: number) => request(`/api/products/${id}`, { method: "DELETE" }),

  getOrders: () => request("/api/orders", { method: "GET" }),

  updateOrderStatus: (id: number, status: string) =>
    request(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  deleteOrder: (id: number) => request(`/api/orders/${id}`, { method: "DELETE" }),

  getStats: () => request("/api/stats", { method: "GET" }),

  getSettings: () => request("/api/settings", { method: "GET" }, false),

  updateSettings: (payload: unknown) =>
    request("/api/settings", { method: "PUT", body: JSON.stringify(payload) }),

  /**
   * يصغّر الصورة في المتصفح قبل الرفع (أقصى بعد 1600px، جودة 80%) حتى يكون الرفع أسرع بكثير،
   * خصوصاً لصور الهاتف عالية الدقة. لا يُطبَّق على الفيديو.
   */
  compressImage: (file: File): Promise<File> =>
    new Promise((resolve) => {
      if (!file.type.startsWith("image/") || file.type === "image/gif") {
        resolve(file);
        return;
      }
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              resolve(file);
              return;
            }
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    }),

  /**
   * رفع مباشر إلى Cloudinary من المتصفح (بدون المرور عبر المتجر) باستخدام
   * "Upload Preset" غير موقّع. أسرع وأبسط، ولا يحتاج أي سر (secret) في كود المتصفح.
   */
  uploadFile: async (fileIn: File): Promise<{ url: string }> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "لم يتم ضبط إعدادات Cloudinary (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)"
      );
    }

    const file = await api.compressImage(fileIn);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "ladies-glows");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error?.message ?? "تعذر رفع الملف إلى Cloudinary");
    }

    return { url: data.secure_url as string };
  },

  /**
   * حذف ملف من Cloudinary. يمرّ عبر المتجر لأن الحذف يحتاج توقيعاً سرياً
   * (CLOUDINARY_API_SECRET) لا يجب أن يظهر أبداً في كود لوحة التحكم.
   */
  deleteFile: (url: string) =>
    request("/api/media/delete", { method: "POST", body: JSON.stringify({ url }) }),
};
