import { useTranslation } from "react-i18next";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface BookFilterProps {
  filters: any;
  setFilters: (filters: any) => void;
  onClear: () => void;
}

export default function BookFilter({ filters, setFilters, onClear }: BookFilterProps) {
  const { t } = useTranslation();

  const categories = ["Fiction", "Science", "Education", "History", "Children", "Biography", "Comics"];
  const languages = ["English", "Arabic", "French", "Spanish", "German"];
  const conditions = ["new", "like-new", "good", "acceptable"];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl md:rounded-[2rem] border border-stone-200 dark:border-stone-800 p-4 md:p-6 space-y-4 md:space-y-8 lg:sticky lg:top-32 shadow-2xl shadow-stone-200/30 dark:shadow-none transition-colors duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/5 dark:bg-primary/10 rounded-lg md:rounded-xl flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <h3 className="font-black text-stone-900 dark:text-stone-50 uppercase tracking-[0.2em] text-[10px] md:text-xs">{t("filter.title")}</h3>
        </div>
        <button 
          onClick={onClear}
          className="text-[10px] md:text-xs font-black text-stone-400 hover:text-secondary transition-colors flex items-center gap-1.5 md:gap-2 uppercase tracking-widest"
        >
          <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
          {t("filter.clear")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
        {/* Category */}
        <div className="space-y-3 md:space-y-4">
          <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] block">{t("filter.category")}</label>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: filters.category === cat ? "" : cat })}
                className={cn(
                  "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-black transition-all border-2 uppercase tracking-widest",
                  filters.category === cat 
                    ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                    : "bg-stone-50 dark:bg-stone-950 border-stone-50 dark:border-stone-950 text-stone-500 dark:text-stone-400 hover:border-stone-200 dark:hover:border-stone-800"
                )}
              >
                {t(`category.${cat.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3 md:space-y-4">
          <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] block">{t("filter.language")}</label>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setFilters({ ...filters, language: filters.language === lang ? "" : lang })}
                className={cn(
                  "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-black transition-all border-2 uppercase tracking-widest",
                  filters.language === lang 
                    ? "bg-secondary border-secondary text-white shadow-xl shadow-secondary/20" 
                    : "bg-stone-50 dark:bg-stone-950 border-stone-50 dark:border-stone-950 text-stone-500 dark:text-stone-400 hover:border-stone-200 dark:hover:border-stone-800"
                )}
              >
                {t(`language.${lang.toLowerCase().slice(0, 2)}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div className="space-y-3 md:space-y-4">
          <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] block">{t("filter.condition")}</label>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {conditions.map((cond) => (
              <button
                key={cond}
                onClick={() => setFilters({ ...filters, condition: filters.condition === cond ? "" : cond })}
                className={cn(
                  "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-black transition-all border-2 uppercase tracking-widest",
                  filters.condition === cond 
                    ? "bg-stone-900 dark:bg-stone-700 border-stone-900 dark:border-stone-700 text-white shadow-xl shadow-stone-900/20" 
                    : "bg-stone-50 dark:bg-stone-950 border-stone-50 dark:border-stone-950 text-stone-500 dark:text-stone-400 hover:border-stone-200 dark:hover:border-stone-800"
                )}
              >
                {t(`condition.${cond.replace("-", "_")}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3 md:space-y-4">
          <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] block">{t("filter.price")}</label>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative w-full">
              <input
                type="number"
                placeholder={t("filter.min")}
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-stone-50 dark:bg-stone-950 border-2 border-stone-50 dark:border-stone-950 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black focus:outline-none focus:border-primary transition-all text-stone-900 dark:text-stone-50"
              />
            </div>
            <span className="text-stone-300 dark:text-stone-700 font-black">-</span>
            <div className="relative w-full">
              <input
                type="number"
                placeholder={t("filter.max")}
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-stone-50 dark:bg-stone-950 border-2 border-stone-50 dark:border-stone-950 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black focus:outline-none focus:border-primary transition-all text-stone-900 dark:text-stone-50"
              />
            </div>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="space-y-3 md:space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800">
          <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] block">{t("filter.advanced") || "بحث متقدم"}</label>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="ISBN"
              value={filters.isbn}
              onChange={(e) => setFilters({ ...filters, isbn: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-stone-50 dark:bg-stone-950 border-2 border-stone-50 dark:border-stone-950 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black focus:outline-none focus:border-primary transition-all text-stone-900 dark:text-stone-50"
            />
            <input
              type="text"
              placeholder={t("filter.publisher") || "دار النشر"}
              value={filters.publisher}
              onChange={(e) => setFilters({ ...filters, publisher: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-stone-50 dark:bg-stone-950 border-2 border-stone-50 dark:border-stone-950 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black focus:outline-none focus:border-primary transition-all text-stone-900 dark:text-stone-50"
            />
            <input
              type="text"
              placeholder={t("filter.year") || "سنة النشر"}
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-stone-50 dark:bg-stone-950 border-2 border-stone-50 dark:border-stone-950 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black focus:outline-none focus:border-primary transition-all text-stone-900 dark:text-stone-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
