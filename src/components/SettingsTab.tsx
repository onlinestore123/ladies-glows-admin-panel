"use client";

import { useEffect, useState } from "react";
import { KeyRound, MessageCircle, Store, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { api, setStoredPassword } from "@/lib/api";
import { WILAYAS, getDefaultWilayaPricing, type WilayaPricing } from "@/lib/wilayas";

export default function SettingsTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <PasswordSection />
      <ContactSection />
      <DeliverySection />
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white">
        {icon}
      </span>
      <h3 className="font-bold text-brand-purple-dark">{title}</h3>
    </div>
  );
}

function PasswordSection() {
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
    <div className="card-surface p-5">
      <SectionHeader icon={<KeyRound size={18} />} title="تغيير كلمة المرور" />
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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
  );
}

function ContactSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");

  useEffect(() => {
    api
      .getSettings()
      .then((data) => {
        const s = data.settings;
        setWhatsappNumber(s?.whatsappNumber ?? "");
        setInstagramUrl(s?.instagramUrl ?? "");
        setFacebookUrl(s?.facebookUrl ?? "");
        setPickupEnabled(Boolean(s?.pickupEnabled));
        setPickupAddress(s?.pickupAddress ?? "");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "تعذر جلب الإعدادات"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupEnabled && !pickupAddress.trim()) {
      toast.error("يرجى إدخال عنوان الاستلام قبل تفعيل هذا الخيار");
      return;
    }
    setSaving(true);
    try {
      await api.updateSettings({
        whatsappNumber: whatsappNumber.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        facebookUrl: facebookUrl.trim() || null,
        pickupEnabled,
        pickupAddress: pickupAddress.trim() || null,
      });
      toast.success("تم حفظ الإعدادات");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-brand-100 animate-pulse" />;
  }

  return (
    <div className="card-surface p-5">
      <SectionHeader icon={<MessageCircle size={18} />} title="معلومات التواصل والاستلام" />
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">
            رقم واتساب (بالصيغة الدولية، مثال: 213555000000)
          </label>
          <input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="213555000000"
            dir="ltr"
            className="input-field"
          />
          <p className="text-xs text-brand-purple-dark/50 mt-1">
            سيظهر كزر تواصل عائم في صفحات المتجر. اتركيه فارغاً لإخفاء الزر.
          </p>
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">رابط إنستغرام (اختياري)</label>
          <input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/..."
            dir="ltr"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">رابط فيسبوك (اختياري)</label>
          <input
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="https://facebook.com/..."
            dir="ltr"
            className="input-field"
          />
        </div>

        <div className="pt-2 border-t border-brand-100">
          <label className="flex items-center gap-2 cursor-pointer select-none min-h-[44px]">
            <input
              type="checkbox"
              checked={pickupEnabled}
              onChange={(e) => setPickupEnabled(e.target.checked)}
              className="w-5 h-5 rounded accent-brand-purple"
            />
            <span className="text-sm font-bold text-brand-purple-dark flex items-center gap-1.5">
              <Store size={15} /> تفعيل "استلام من عند البائع" (بدون رسوم توصيل)
            </span>
          </label>
          {pickupEnabled && (
            <div className="mt-3">
              <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">عنوان الاستلام</label>
              <textarea
                rows={2}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="مثال: حي كذا، شارع كذا، بلدية كذا، ولاية الجزائر"
                className="input-field !h-auto py-3 resize-none"
              />
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}

function DeliverySection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState<WilayaPricing>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .getSettings()
      .then((data) => {
        setPricing(data.settings?.wilayaPricing ?? getDefaultWilayaPricing());
      })
      .catch(() => setPricing(getDefaultWilayaPricing()))
      .finally(() => setLoading(false));
  }, []);

  const updatePrice = (code: string, field: "desk" | "home", value: number) => {
    setPricing((p) => ({ ...p, [code]: { ...p[code], [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings({ wilayaPricing: pricing });
      toast.success("تم حفظ أسعار التوصيل");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر حفظ الأسعار");
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setPricing(getDefaultWilayaPricing());
    toast.success("تمت استعادة الأسعار الافتراضية التقديرية - لا تنسي حفظ التغييرات");
  };

  const filtered = WILAYAS.filter(
    (w) => w.nameAr.includes(search) || w.code.includes(search) || w.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="h-64 rounded-2xl bg-brand-100 animate-pulse" />;
  }

  return (
    <div className="card-surface p-5">
      <SectionHeader icon={<Truck size={18} />} title="أسعار التوصيل حسب الولاية" />

      <p className="text-xs text-brand-purple-dark/60 bg-brand-50 rounded-xl p-3 mb-4 leading-relaxed">
        الأسعار المعبّأة افتراضياً <strong>تقديرية</strong> فقط (متوسط تقريبي حسب المنطقة). يُرجى تعديلها هنا
        حسب أسعار شركة التوصيل الفعلية التي تتعاملين معها، لأن الأسعار الحقيقية تتغير وتختلف بين الشركات.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="بحث عن ولاية..."
        className="input-field mb-3"
      />

      <div className="max-h-96 overflow-y-auto rounded-xl border border-brand-100">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-brand-50 z-10">
            <tr className="text-brand-purple-dark/70 text-xs">
              <th className="text-right py-2 px-3 font-bold">الولاية</th>
              <th className="text-right py-2 px-3 font-bold">للمكتب (دج)</th>
              <th className="text-right py-2 px-3 font-bold">للمنزل (دج)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.code} className="border-t border-brand-100">
                <td className="py-1.5 px-3 font-medium text-brand-purple-dark whitespace-nowrap">
                  {w.code} - {w.nameAr}
                </td>
                <td className="py-1.5 px-3">
                  <input
                    type="number"
                    min={0}
                    value={pricing[w.code]?.desk ?? 0}
                    onChange={(e) => updatePrice(w.code, "desk", Number(e.target.value) || 0)}
                    className="w-24 h-9 rounded-lg border border-brand-100 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                  />
                </td>
                <td className="py-1.5 px-3">
                  <input
                    type="number"
                    min={0}
                    value={pricing[w.code]?.home ?? 0}
                    onChange={(e) => updatePrice(w.code, "home", Number(e.target.value) || 0)}
                    className="w-24 h-9 rounded-lg border border-brand-100 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-4">
        <button type="button" onClick={resetDefaults} className="btn-secondary flex-1">
          استعادة الافتراضي
        </button>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? "جاري الحفظ..." : "حفظ أسعار التوصيل"}
        </button>
      </div>
    </div>
  );
}
