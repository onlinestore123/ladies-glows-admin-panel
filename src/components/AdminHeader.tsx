"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LayoutDashboard, Package, ClipboardList, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { clearStoredPassword } from "@/lib/api";

export type AdminTab = "dashboard" | "products" | "orders" | "settings";

const TABS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "لوحة القيادة", icon: LayoutDashboard },
  { id: "products", label: "المنتجات", icon: Package },
  { id: "orders", label: "الطلبات", icon: ClipboardList },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

export default function AdminHeader({
  activeTab,
  onChangeTab,
  onLogout,
}: {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearStoredPassword();
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <span className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-brand-gold/40">
              <Image src="/logo.png" alt="Ladies Glows" fill sizes="36px" className="object-cover" priority />
            </span>
            <span className="font-display italic text-lg font-bold bg-brand-gradient bg-clip-text text-transparent">
              Ladies Glows
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-brand-gradient text-white shadow-brand"
                    : "text-brand-purple-dark/60 hover:bg-brand-100"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button onClick={handleLogout} className="icon-btn hidden md:flex" aria-label="تسجيل الخروج">
              <LogOut size={18} />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="icon-btn md:hidden"
              aria-label="القائمة"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="md:hidden border-t border-brand-100 bg-white overflow-hidden"
        >
          <div className="flex flex-col p-3 gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onChangeTab(tab.id);
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-colors ${
                  activeTab === tab.id
                    ? "bg-brand-gradient text-white"
                    : "text-brand-purple-dark hover:bg-brand-100"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold text-brand-pink hover:bg-brand-pink/10 transition-colors"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </motion.nav>
      )}
    </header>
  );
}
