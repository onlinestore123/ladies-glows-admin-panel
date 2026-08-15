"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginScreen from "@/components/LoginScreen";
import AdminHeader, { type AdminTab } from "@/components/AdminHeader";
import DashboardTab from "@/components/DashboardTab";
import ProductsTab from "@/components/ProductsTab";
import OrdersTab from "@/components/OrdersTab";
import SettingsTab from "@/components/SettingsTab";
import { getStoredPassword } from "@/lib/api";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  useEffect(() => {
    setAuthed(Boolean(getStoredPassword()));
  }, []);

  if (authed === null) {
    return <div className="min-h-screen bg-brand-50" />;
  }

  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <AdminHeader activeTab={activeTab} onChangeTab={setActiveTab} onLogout={() => setAuthed(false)} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "products" && <ProductsTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "settings" && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
