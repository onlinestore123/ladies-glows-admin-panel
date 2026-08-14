"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { api, setStoredPassword } from "@/lib/api";

export default function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      await api.login(password);
      setStoredPassword(password);
      toast.success("تم تسجيل الدخول بنجاح");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gradient-soft px-4 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-purple/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-brand-gold/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm card-surface p-8 shadow-brand"
      >
        <div className="flex flex-col items-center mb-6">
          <span className="relative w-20 h-20 rounded-full overflow-hidden ring-1 ring-brand-gold/40 shadow-gold mb-4">
            <Image src="/logo.png" alt="Ladies Glows" fill sizes="80px" className="object-cover" priority />
          </span>
          <h1 className="font-display italic text-2xl font-bold text-brand-purple-dark">Ladies Glows</h1>
          <p className="text-sm text-brand-purple-dark/50 mt-1">لوحة تحكم التاجر</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={18} className="absolute top-1/2 -translate-y-1/2 right-4 text-brand-purple-dark/40" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              autoFocus
              className="w-full h-12 rounded-xl border border-brand-100 pr-11 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 left-3 text-brand-purple-dark/40 hover:text-brand-purple transition-colors"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={loading || !password} className="btn-primary w-full">
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
