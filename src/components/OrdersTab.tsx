"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trash2, Phone, MapPin, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface OrderItem {
  productId: number;
  productName: string;
  productNameAr: string;
  quantity: number;
  price: number;
  image: string;
  variant?: string;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  customerCity: string;
  wilayaName: string | null;
  deliveryMethod: string;
  deliveryPrice: number;
  notes: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

const DELIVERY_LABELS: Record<string, string> = {
  desk: "توصيل للمكتب",
  home: "توصيل للمنزل",
  pickup: "استلام من المتجر",
};

const STATUSES = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "processing", label: "قيد المعالجة" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغى" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  const load = () => {
    setLoading(true);
    api
      .getOrders()
      .then((data) => setOrders(data.orders ?? []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const changeStatus = async (order: Order, status: string) => {
    try {
      await api.updateOrderStatus(order.id, status);
      toast.success("تم تحديث حالة الطلب");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر تحديث الطلب");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteOrder(deleteTarget.id);
      toast.success("تم حذف الطلب");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر حذف الطلب");
    }
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`shrink-0 px-4 py-2 min-h-[40px] rounded-full text-sm font-bold border transition-all duration-200 ${
              filter === s.value
                ? "bg-brand-gradient text-white border-transparent shadow-brand"
                : "bg-white text-brand-purple-dark/70 border-brand-100"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-brand-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-purple-dark/50">
          <p className="font-display text-lg">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <motion.div key={order.id} layout className="card-surface overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full flex items-center gap-3 p-4 text-right"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-brand-purple-dark">{order.customerName}</p>
                  <p className="text-xs text-brand-purple-dark/50">
                    طلب #{order.id} · {new Date(order.createdAt).toLocaleDateString("ar-u-nu-latn")}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_STYLES[order.status]}`}>
                  {STATUSES.find((s) => s.value === order.status)?.label}
                </span>
                <span className="font-bold text-brand-purple whitespace-nowrap">
                  {order.total.toLocaleString("en-US")} دج
                </span>
                <motion.span animate={{ rotate: expanded === order.id ? 180 : 0 }}>
                  <ChevronDown size={18} className="text-brand-purple-dark/40" />
                </motion.span>
              </button>

              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-brand-100"
                  >
                    <div className="p-4 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <p className="flex items-center gap-2 text-brand-purple-dark/70">
                          <Phone size={15} /> <span dir="ltr">{order.customerPhone}</span>
                        </p>
                        <p className="flex items-center gap-2 text-brand-purple-dark/70">
                          <Truck size={15} /> {DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}
                          {order.deliveryMethod !== "pickup" && (
                            <span className="text-brand-purple-dark/50">
                              ({order.deliveryPrice.toLocaleString("en-US")} دج)
                            </span>
                          )}
                        </p>
                        {order.deliveryMethod !== "pickup" && (
                          <p className="flex items-center gap-2 text-brand-purple-dark/70 sm:col-span-2">
                            <MapPin size={15} /> {order.wilayaName ?? order.customerCity}
                            {order.customerAddress ? ` - ${order.customerAddress}` : ""}
                          </p>
                        )}
                      </div>
                      {order.notes && (
                        <p className="text-sm text-brand-purple-dark/60 bg-brand-50 rounded-xl p-3">
                          ملاحظات: {order.notes}
                        </p>
                      )}

                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-brand-100 shrink-0">
                              {item.image && (
                                <Image src={item.image} alt={item.productNameAr} fill sizes="40px" className="object-cover" />
                              )}
                            </div>
                            <span className="flex-1 text-sm text-brand-purple-dark truncate">
                              {item.productNameAr}
                              {item.variant && (
                                <span className="text-brand-purple-dark/50"> ({item.variant})</span>
                              )}
                            </span>
                            <span className="text-xs text-brand-purple-dark/50">
                              {item.quantity} × {item.price.toLocaleString("en-US")} دج
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-100">
                        <span className="text-xs font-bold text-brand-purple-dark/60">تغيير الحالة:</span>
                        {STATUSES.filter((s) => s.value !== "all").map((s) => (
                          <button
                            key={s.value}
                            onClick={() => changeStatus(order, s.value)}
                            disabled={order.status === s.value}
                            className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-bold transition-colors ${
                              order.status === s.value
                                ? "bg-brand-purple text-white"
                                : "bg-brand-100 text-brand-purple-dark/70 hover:bg-brand-purple/10"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                        <button
                          onClick={() => setDeleteTarget(order)}
                          className="ms-auto flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-bold text-brand-pink hover:bg-brand-pink/10 transition-colors"
                        >
                          <Trash2 size={14} /> حذف الطلب
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
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
              <p className="font-bold text-brand-purple-dark mb-2">تأكيد حذف الطلب</p>
              <p className="text-sm text-brand-purple-dark/60 mb-6">
                هل أنت متأكدة من حذف طلب &quot;{deleteTarget.customerName}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
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
