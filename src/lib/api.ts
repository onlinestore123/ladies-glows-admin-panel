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

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
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
};
