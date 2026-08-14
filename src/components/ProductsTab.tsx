"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import ProductFormModal, { type ProductFormValues } from "./ProductFormModal";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  originalPrice: number | null;
  category: string;
  images: string[];
  ingredients: string | null;
  ingredientsAr: string | null;
  stock: number;
  featured: boolean;
  isNew: boolean;
  isBestseller: boolean;
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductFormValues | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const load = () => {
    setLoading(true);
    api
      .getProducts()
      .then((data) => setProducts(data.products ?? []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing({
      id: p.id,
      name: p.name,
      nameAr: p.nameAr,
      description: p.description,
      descriptionAr: p.descriptionAr,
      price: p.price,
      originalPrice: p.originalPrice ?? "",
      category: p.category,
      images: p.images.join("\n"),
      ingredients: p.ingredients ?? "",
      ingredientsAr: p.ingredientsAr ?? "",
      stock: p.stock,
      featured: p.featured,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
    });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteProduct(deleteTarget.id);
      toast.success("تم حذف المنتج");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر حذف المنتج");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-brand-purple-dark/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحثي عن منتج..."
            className="input-field pr-11"
          />
        </div>
        <button onClick={openAdd} className="btn-primary whitespace-nowrap">
          <Plus size={18} /> إضافة منتج
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-brand-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-purple-dark/50">
          <p className="font-display text-lg mb-1">لا توجد منتجات</p>
          <p className="text-sm">ابدئي بإضافة أول منتج من زر &quot;إضافة منتج&quot;.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="card-surface p-3 flex items-center gap-3"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-100 shrink-0">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.nameAr} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-purple/40">
                      لا صورة
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-brand-purple-dark truncate">{p.nameAr}</p>
                  <p className="text-xs text-brand-purple-dark/50">
                    {p.price.toLocaleString("ar")} دج · مخزون: {p.stock}
                  </p>
                </div>
                <button
                  onClick={() => openEdit(p)}
                  className="icon-btn"
                  aria-label="تعديل"
                >
                  <Pencil size={17} />
                </button>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="icon-btn text-brand-pink hover:bg-brand-pink/10"
                  aria-label="حذف"
                >
                  <Trash2 size={17} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {modalOpen && (
        <ProductFormModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={load}
        />
      )}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
            className="fixed inset-0 bg-brand-purple-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center"
            >
              <p className="font-bold text-brand-purple-dark mb-2">تأكيد الحذف</p>
              <p className="text-sm text-brand-purple-dark/60 mb-6">
                هل أنت متأكدة من حذف &quot;{deleteTarget.nameAr}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">
                  إلغاء
                </button>
                <button onClick={confirmDelete} className="btn-danger flex-1 bg-brand-pink text-white border-brand-pink">
                  حذف نهائياً
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
