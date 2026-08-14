"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, Video, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

const CATEGORIES = [
  { slug: "face-care", label: "العناية بالوجه" },
  { slug: "body-care", label: "العناية بالجسم" },
  { slug: "hair-care", label: "العناية بالشعر" },
  { slug: "serums-oils", label: "السيروم والزيوت" },
  { slug: "masks", label: "الأقنعة" },
];

export interface ProductFormValues {
  id?: number;
  name: string;
  description: string;
  price: number | "";
  originalPrice: number | "";
  category: string;
  images: string[];
  video: string;
  ingredients: string;
  stock: number | "";
  featured: boolean;
  isNew: boolean;
  isBestseller: boolean;
}

const EMPTY_FORM: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "face-care",
  images: [],
  video: "",
  ingredients: "",
  stock: "",
  featured: false,
  isNew: false,
  isBestseller: false,
};

export default function ProductFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: ProductFormValues | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductFormValues>(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setForm(initial ?? EMPTY_FORM);
  }, [initial]);

  const update = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleImagesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (form.images.length + files.length > 6) {
      toast.error("الحد الأقصى 6 صور لكل منتج");
      return;
    }

    setUploadingImages(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const result = await api.uploadFile(file);
        urls.push(result.url);
      }
      update("images", [...form.images, ...urls]);
      toast.success("تم رفع الصور بنجاح");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر رفع الصور");
    } finally {
      setUploadingImages(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleVideoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const result = await api.uploadFile(file);
      update("video", result.url);
      toast.success("تم رفع الفيديو بنجاح");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر رفع الفيديو");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    update("images", form.images.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= form.images.length) return;
    const next = [...form.images];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    update("images", next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || form.price === "") {
      toast.error("يرجى تعبئة الحقول الأساسية");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      originalPrice: form.originalPrice === "" ? null : Number(form.originalPrice),
      category: form.category,
      images: form.images,
      video: form.video || null,
      ingredients: form.ingredients || null,
      stock: Number(form.stock) || 0,
      featured: form.featured,
      isNew: form.isNew,
      isBestseller: form.isBestseller,
    };

    try {
      if (isEdit && form.id) {
        await api.updateProduct(form.id, payload);
        toast.success("تم تحديث المنتج");
      } else {
        await api.createProduct(payload);
        toast.success("تمت إضافة المنتج");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ ما");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-brand-purple-dark/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl bg-white max-h-[92vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-brand-100 z-10">
            <h2 className="font-display text-xl font-bold text-brand-purple">
              {isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h2>
            <button onClick={onClose} className="icon-btn" aria-label="إغلاق">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <Field label="اسم المنتج *">
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="مثال: سيروم فيتامين سي"
                className="input-field"
              />
            </Field>

            <Field label="الوصف *">
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="اكتبي وصفاً للمنتج..."
                className="input-field !h-auto py-3 resize-none"
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="السعر (دج) *">
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value === "" ? "" : Number(e.target.value))}
                  className="input-field"
                />
              </Field>
              <Field label="السعر قبل الخصم (اختياري)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.originalPrice}
                  onChange={(e) => update("originalPrice", e.target.value === "" ? "" : Number(e.target.value))}
                  className="input-field"
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="الفئة *">
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="input-field"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="الكمية المتوفرة">
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value === "" ? "" : Number(e.target.value))}
                  className="input-field"
                />
              </Field>
            </div>

            {/* Images */}
            <Field label={`صور المنتج (${form.images.length}/6)`}>
              <div className="space-y-2">
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {form.images.map((img, i) => (
                      <div key={img + i} className="relative aspect-square rounded-xl overflow-hidden border border-brand-100 group">
                        <Image src={img} alt={`صورة ${i + 1}`} fill sizes="120px" className="object-cover" />
                        {i === 0 && (
                          <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-brand-purple text-white text-[9px] font-bold">
                            الرئيسية
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveImage(i, -1)}
                            disabled={i === 0}
                            className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-30"
                            aria-label="تحريك لليمين"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(i, 1)}
                            disabled={i === form.images.length - 1}
                            className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-30"
                            aria-label="تحريك لليسار"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="w-6 h-6 rounded-full bg-brand-pink text-white flex items-center justify-center"
                            aria-label="حذف"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImages || form.images.length >= 6}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-brand-100 text-sm font-bold text-brand-purple-dark/60 hover:border-brand-purple/40 hover:text-brand-purple transition-colors disabled:opacity-50"
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> جاري الرفع...
                    </>
                  ) : (
                    <>
                      <ImagePlus size={16} /> اختيار صور من الجهاز
                    </>
                  )}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesSelected}
                  className="hidden"
                />
              </div>
            </Field>

            {/* Video */}
            <Field label="فيديو عرض المنتج (اختياري)">
              <div className="space-y-2">
                {form.video ? (
                  <div className="relative rounded-xl overflow-hidden border border-brand-100 bg-brand-50 flex items-center gap-3 p-3">
                    <Video size={20} className="text-brand-purple shrink-0" />
                    <span className="text-sm text-brand-purple-dark/70 flex-1 truncate">تم رفع فيديو المنتج</span>
                    <button
                      type="button"
                      onClick={() => update("video", "")}
                      className="w-7 h-7 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center"
                      aria-label="حذف الفيديو"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-brand-100 text-sm font-bold text-brand-purple-dark/60 hover:border-brand-purple/40 hover:text-brand-purple transition-colors disabled:opacity-50"
                  >
                    {uploadingVideo ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Video size={16} /> اختيار فيديو من الجهاز
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelected}
                  className="hidden"
                />
              </div>
            </Field>

            <Field label="المكوّنات (اختياري)">
              <textarea
                rows={2}
                value={form.ingredients}
                onChange={(e) => update("ingredients", e.target.value)}
                className="input-field !h-auto py-3 resize-none"
              />
            </Field>

            <div className="flex flex-wrap gap-4 pt-1">
              <Checkbox label="منتج مميز" checked={form.featured} onChange={(v) => update("featured", v)} />
              <Checkbox label="جديد" checked={form.isNew} onChange={(v) => update("isNew", v)} />
              <Checkbox label="الأكثر مبيعاً" checked={form.isBestseller} onChange={(v) => update("isBestseller", v)} />
            </div>

            <button
              type="submit"
              disabled={saving || uploadingImages || uploadingVideo}
              className="btn-primary w-full mt-2"
            >
              {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none min-h-[44px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded accent-brand-purple"
      />
      <span className="text-sm font-medium text-brand-purple-dark">{label}</span>
    </label>
  );
}
