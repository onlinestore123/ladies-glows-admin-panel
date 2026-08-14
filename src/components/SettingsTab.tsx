"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { api, setStoredPassword } from "@/lib/api";

export default function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور الجديدتان غير متطابقتين");
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setStoredPassword(newPassword);
      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر تغيير كلمة المرور");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="card-surface p-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white">
            <KeyRound size={18} />
          </span>
          <h3 className="font-bold text-brand-purple-dark">تغيير كلمة المرور</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">كلمة المرور الحالية</label>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">كلمة المرور الجديدة</label>
            <input
              required
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">تأكيد كلمة المرور الجديدة</label>
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              minLength={6}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-brand-pink mt-1.5">كلمتا المرور غير متطابقتين</p>
            )}
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
          </button>
        </form>
      </div>
    </div>
  );
}
