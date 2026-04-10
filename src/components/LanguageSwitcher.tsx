import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  return (
    <div className="relative group flex justify-center">
      <button
        onClick={toggleLanguage}
        className={cn(
          "w-10 h-10 flex items-center justify-center text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
        )}
      >
        <Globe className="w-5 h-5" />
      </button>
      <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
        {i18n.language === "en" ? "تغيير للغة العربية" : "Switch to English"}
      </div>
    </div>
  );
}
