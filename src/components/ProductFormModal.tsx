"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number | "";
  originalPrice: number | "";
  category: string;
  images: string;
  ingredients: string;
  ingredientsAr: string;
  stock: number | "";
  featured: boolean;
  isNew: boolean;
  isBestseller: boolean;
}

const EMPTY_FORM: ProductFormValues = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  price: "",
  originalPrice: "",
  category: "face-care",
  images: "",
  ingredients: "",
  ingredientsAr: "",
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
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setForm(initial ?? EMPTY_FORM);
  }, [initial]);

  const update = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameAr || !form.descriptionAr || !form.description || form.price === "") {
      toast.error("يرجى تعبئة الحقول الأساسية");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name || form.nameAr,
      nameAr: form.nameAr,
      description: form.description,
      descriptionAr: form.descriptionAr,
      price: Number(form.price),
      originalPrice: form.originalPrice === "" ? null : Number(form.originalPrice),
      category: form.category,
      images: form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      ingredients: form.ingredients || null,
      ingredientsAr: form.ingredientsAr || null,
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
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="اسم المنتج (عربي) *">
                <input
                  required
                  value={form.nameAr}
                  onChange={(e) => update("nameAr", e.target.value)}
                  className="input-field"
                />
              </Field>
              <Field label="اسم المنتج (إنجليزي)">
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="input-field"
                  dir="ltr"
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="الوصف (عربي) *">
                <textarea
                  required
                  rows={3}
                  value={form.descriptionAr}
                  onChange={(e) => update("descriptionAr", e.target.value)}
                  className="input-field !h-auto py-3 resize-none"
                />
              </Field>
              <Field label="الوصف (إنجليزي) *">
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="input-field !h-auto py-3 resize-none"
                  dir="ltr"
                />
              </Field>
            </div>

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

            <Field label="روابط الصور (رابط واحد في كل سطر)">
              <textarea
                rows={3}
                value={form.images}
                onChange={(e) => update("images", e.target.value)}
                placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
                className="input-field !h-auto py-3 resize-none"
                dir="ltr"
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="المكوّنات (عربي)">
                <textarea
                  rows={2}
                  value={form.ingredientsAr}
                  onChange={(e) => update("ingredientsAr", e.target.value)}
                  className="input-field !h-auto py-3 resize-none"
                />
              </Field>
              <Field label="المكوّنات (إنجليزي)">
                <textarea
                  rows={2}
                  value={form.ingredients}
                  onChange={(e) => update("ingredients", e.target.value)}
                  className="input-field !h-auto py-3 resize-none"
                  dir="ltr"
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <Checkbox label="منتج مميز" checked={form.featured} onChange={(v) => update("featured", v)} />
              <Checkbox label="جديد" checked={form.isNew} onChange={(v) => update("isNew", v)} />
              <Checkbox label="الأكثر مبيعاً" checked={form.isBestseller} onChange={(v) => update("isBestseller", v)} />
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
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
