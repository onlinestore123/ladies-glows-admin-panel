// قائمة ولايات الجزائر الـ58 مرتبة برقمها الرسمي.
// أسعار التوصيل هنا "تقديرية" فقط (متوسط تقريبي حسب المنطقة)، وهي قابلة للتعديل بالكامل
// من لوحة التحكم (تبويب الإعدادات > أسعار التوصيل). يُنصح بمراجعتها وتحديثها فعلياً
// حسب اتفاقك مع شركة التوصيل، لأن الأسعار الحقيقية تتغير باستمرار.

export interface Wilaya {
  code: string; // "01".."58"
  nameAr: string;
  name: string;
}

// تصنيف تقريبي للمناطق لتوليد أسعار افتراضية منطقية (الأقرب للعاصمة أرخص، الجنوب أغلى)
type Zone = "A" | "B" | "C" | "D";

const ZONE_DEFAULT_PRICES: Record<Zone, { desk: number; home: number }> = {
  A: { desk: 300, home: 450 }, // الجزائر الكبرى وضواحيها القريبة
  B: { desk: 450, home: 650 }, // شمال قريب
  C: { desk: 600, home: 850 }, // شمال/داخلي أبعد
  D: { desk: 900, home: 1300 }, // الجنوب والمناطق النائية
};

const WILAYAS_RAW: { code: string; nameAr: string; name: string; zone: Zone }[] = [
  { code: "01", nameAr: "أدرار", name: "Adrar", zone: "D" },
  { code: "02", nameAr: "الشلف", name: "Chlef", zone: "B" },
  { code: "03", nameAr: "الأغواط", name: "Laghouat", zone: "C" },
  { code: "04", nameAr: "أم البواقي", name: "Oum El Bouaghi", zone: "C" },
  { code: "05", nameAr: "باتنة", name: "Batna", zone: "C" },
  { code: "06", nameAr: "بجاية", name: "Béjaïa", zone: "B" },
  { code: "07", nameAr: "بسكرة", name: "Biskra", zone: "C" },
  { code: "08", nameAr: "بشار", name: "Béchar", zone: "D" },
  { code: "09", nameAr: "البليدة", name: "Blida", zone: "A" },
  { code: "10", nameAr: "البويرة", name: "Bouira", zone: "B" },
  { code: "11", nameAr: "تمنراست", name: "Tamanrasset", zone: "D" },
  { code: "12", nameAr: "تبسة", name: "Tébessa", zone: "C" },
  { code: "13", nameAr: "تلمسان", name: "Tlemcen", zone: "B" },
  { code: "14", nameAr: "تيارت", name: "Tiaret", zone: "C" },
  { code: "15", nameAr: "تيزي وزو", name: "Tizi Ouzou", zone: "B" },
  { code: "16", nameAr: "الجزائر", name: "Alger", zone: "A" },
  { code: "17", nameAr: "الجلفة", name: "Djelfa", zone: "C" },
  { code: "18", nameAr: "جيجل", name: "Jijel", zone: "B" },
  { code: "19", nameAr: "سطيف", name: "Sétif", zone: "C" },
  { code: "20", nameAr: "سعيدة", name: "Saïda", zone: "C" },
  { code: "21", nameAr: "سكيكدة", name: "Skikda", zone: "B" },
  { code: "22", nameAr: "سيدي بلعباس", name: "Sidi Bel Abbès", zone: "C" },
  { code: "23", nameAr: "عنابة", name: "Annaba", zone: "B" },
  { code: "24", nameAr: "قالمة", name: "Guelma", zone: "C" },
  { code: "25", nameAr: "قسنطينة", name: "Constantine", zone: "C" },
  { code: "26", nameAr: "المدية", name: "Médéa", zone: "B" },
  { code: "27", nameAr: "مستغانم", name: "Mostaganem", zone: "B" },
  { code: "28", nameAr: "المسيلة", name: "M'Sila", zone: "C" },
  { code: "29", nameAr: "معسكر", name: "Mascara", zone: "C" },
  { code: "30", nameAr: "ورقلة", name: "Ouargla", zone: "D" },
  { code: "31", nameAr: "وهران", name: "Oran", zone: "B" },
  { code: "32", nameAr: "البيض", name: "El Bayadh", zone: "D" },
  { code: "33", nameAr: "إليزي", name: "Illizi", zone: "D" },
  { code: "34", nameAr: "برج بوعريريج", name: "Bordj Bou Arréridj", zone: "C" },
  { code: "35", nameAr: "بومرداس", name: "Boumerdès", zone: "A" },
  { code: "36", nameAr: "الطارف", name: "El Tarf", zone: "C" },
  { code: "37", nameAr: "تندوف", name: "Tindouf", zone: "D" },
  { code: "38", nameAr: "تيسمسيلت", name: "Tissemsilt", zone: "C" },
  { code: "39", nameAr: "الوادي", name: "El Oued", zone: "D" },
  { code: "40", nameAr: "خنشلة", name: "Khenchela", zone: "C" },
  { code: "41", nameAr: "سوق أهراس", name: "Souk Ahras", zone: "C" },
  { code: "42", nameAr: "تيبازة", name: "Tipaza", zone: "A" },
  { code: "43", nameAr: "ميلة", name: "Mila", zone: "C" },
  { code: "44", nameAr: "عين الدفلى", name: "Aïn Defla", zone: "B" },
  { code: "45", nameAr: "النعامة", name: "Naâma", zone: "D" },
  { code: "46", nameAr: "عين تموشنت", name: "Aïn Témouchent", zone: "B" },
  { code: "47", nameAr: "غرداية", name: "Ghardaïa", zone: "D" },
  { code: "48", nameAr: "غليزان", name: "Relizane", zone: "B" },
  { code: "49", nameAr: "تيميمون", name: "Timimoun", zone: "D" },
  { code: "50", nameAr: "برج باجي مختار", name: "Bordj Badji Mokhtar", zone: "D" },
  { code: "51", nameAr: "أولاد جلال", name: "Ouled Djellal", zone: "C" },
  { code: "52", nameAr: "بني عباس", name: "Béni Abbès", zone: "D" },
  { code: "53", nameAr: "إن صالح", name: "In Salah", zone: "D" },
  { code: "54", nameAr: "إن قزام", name: "In Guezzam", zone: "D" },
  { code: "55", nameAr: "تقرت", name: "Touggourt", zone: "D" },
  { code: "56", nameAr: "جانت", name: "Djanet", zone: "D" },
  { code: "57", nameAr: "المغير", name: "El M'Ghair", zone: "D" },
  { code: "58", nameAr: "المنيعة", name: "El Meniaa", zone: "D" },
];

export const WILAYAS: Wilaya[] = WILAYAS_RAW.map(({ code, nameAr, name }) => ({
  code,
  nameAr,
  name,
}));

export type DeliveryMethod = "desk" | "home" | "pickup";

export interface WilayaPriceEntry {
  desk: number;
  home: number;
}

export type WilayaPricing = Record<string, WilayaPriceEntry>;

// أسعار افتراضية تُستخدم فقط أول مرة (قبل ما يعدّلها البائع من الإعدادات)
export function getDefaultWilayaPricing(): WilayaPricing {
  const pricing: WilayaPricing = {};
  for (const w of WILAYAS_RAW) {
    pricing[w.code] = { ...ZONE_DEFAULT_PRICES[w.zone] };
  }
  return pricing;
}

export function getWilayaByCode(code: string): Wilaya | undefined {
  return WILAYAS.find((w) => w.code === code);
}
