import { useTranslation } from "react-i18next";

// تعریف زبان‌ها با اطلاعات کامل
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ru", name: "Русский", flag: "🇷🇺" }, // روسی
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" }, // هندی
];

const languageFonts: Record<string, string> = {
  en: "'Noto Sans', sans-serif",
  ru: "'Noto Sans', sans-serif",
  fa: "'Noto Sans Arabic', sans-serif",
  ar: "'Noto Sans Arabic', sans-serif",
  hi: "'Noto Sans Devanagari', sans-serif",
  zh: "'Noto Sans SC', sans-serif",
};

interface LanguageSelectorProps {
  onLanguageSelect: () => void;
}

const LanguageSelector = ({ onLanguageSelect }: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("userHasSelectedLanguage", "true");

    const font = languageFonts[langCode] || "'Noto Sans', sans-serif";
    document.body.style.fontFamily = font;

    onLanguageSelect();
  };

  return (
    // لایه پس‌زمینه که کل صفحه رو می‌پوشونه
    <div
      style={{ backgroundImage: `url('/images/bg.png')` }}
      className="fixed inset-0 z-50 bg-cover bg-center flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm overflow-y-auto pb-26"
    >
      {/* کانتینر اصلی دیالوگ با انیمیشن */}
      <div className="bg-white/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-6 w-11/12 max-w-sm text-white transform transition-all animate-fade-in-up ">
        {/* هدر دیالوگ */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-wider">
            {t("choose_your_language")}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t("welcome_to_brics")}</p>
        </div>

        {/* لیست زبان‌ها */}
        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-700 bg-opacity-50 hover:bg-yellow-500 hover:text-black transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-semibold text-lg">{lang.name}</span>
              {/* این اسپیسر برای حفظ تقارن در طراحی هست */}
              <span className="text-lg w-6"></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
