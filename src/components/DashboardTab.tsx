"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ShoppingCart, Clock, Package } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  productCount: number;
  topProducts: { name: string; quantity: number }[];
  monthlyRevenue: { label: string; revenue: number }[];
}

export default function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .getStats()
      .then(setStats)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-brand-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "إجمالي الإيرادات", value: `${stats.totalRevenue.toLocaleString("en-US")} دج`, icon: Wallet },
    { label: "إجمالي الطلبات", value: stats.totalOrders, icon: ShoppingCart },
    { label: "طلبات قيد الانتظار", value: stats.pendingOrders, icon: Clock },
    { label: "عدد المنتجات", value: stats.productCount, icon: Package },
  ];

  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-surface p-5 flex items-center gap-4"
          >
            <span className="w-12 h-12 shrink-0 rounded-full bg-brand-gradient flex items-center justify-center text-white">
              <card.icon size={20} />
            </span>
            <div>
              <p className="text-xs text-brand-purple-dark/50 font-medium mb-0.5">{card.label}</p>
              <p className="text-xl font-bold text-brand-purple-dark">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-surface p-5">
          <h3 className="font-bold text-brand-purple-dark mb-4">الأكثر مبيعاً</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-brand-purple-dark/40 text-center py-8">لا توجد مبيعات بعد</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-purple">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-brand-purple-dark truncate">{p.name}</span>
                  <span className="text-sm font-bold text-brand-purple">{p.quantity} قطعة</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-surface p-5">
          <h3 className="font-bold text-brand-purple-dark mb-4">الإيرادات - آخر 6 أشهر</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {stats.monthlyRevenue.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 3)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full max-w-[28px] rounded-t-lg bg-brand-gradient"
                />
                <span className="text-[10px] text-brand-purple-dark/50 whitespace-nowrap">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
