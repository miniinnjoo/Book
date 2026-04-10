import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/src/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Upload, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { geminiService } from "@/src/services/geminiService";
import { cn } from "@/src/lib/utils";
import React from "react";

export default function SellBook() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    language: "English",
    condition: "good",
    price: "",
    description: "",
    isbn: "",
    publisher: "",
    year: "",
    images: [] as string[],
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // For demo purposes, we'll just use placeholders since we don't have a storage backend here
      // In a real app, you'd upload to Firebase Storage
      const newImages = Array.from(files).slice(0, 5).map((_, i) => `https://picsum.photos/seed/book${i}/400/600`);
      setFormData({ ...formData, images: newImages });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "books"), {
        ...formData,
        price: Number(formData.price),
        sellerId: auth.currentUser.uid,
        status: "available",
        createdAt: new Date().toISOString(),
      });
      navigate("/browse");
    } catch (error) {
      console.error("Error listing book:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalyze = async () => {
    if (!formData.description) return;
    setAiAnalyzing(true);
    try {
      const result = await geminiService.analyzeBookCondition(formData.description);
      if (result && result.condition) {
        setFormData({ ...formData, condition: result.condition });
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-4xl font-black tracking-tighter text-stone-900 dark:text-white leading-tight"
        >
          {t("sell.title")}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-stone-500 dark:text-stone-400 font-medium max-w-lg mx-auto"
        >
          {t("sell.subtitle")}
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Image Upload */}
        <div className="md:col-span-1 space-y-4">
          <label className="block aspect-[3/4] bg-stone-50 dark:bg-stone-800 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center p-6 text-center group hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden">
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            {formData.images.length > 0 ? (
              <img src={formData.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-stone-700 rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                  <Upload className="w-6 h-6 md:w-8 md:h-8 text-stone-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-xs md:text-sm font-black text-stone-900 dark:text-stone-200 uppercase tracking-widest">{t("sell.upload_images")}</p>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-medium">{t("sell.upload_desc")}</p>
              </>
            )}
          </label>
          
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-12 h-12 md:w-14 md:h-14 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 flex items-center justify-center text-stone-300 overflow-hidden">
                {formData.images[i] ? (
                  <img src={formData.images[i]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form Details */}
        <div className="md:col-span-2 space-y-6 md:space-y-8 bg-white dark:bg-stone-900 p-6 md:p-10 rounded-2xl md:rounded-[2rem] border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/10 dark:shadow-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] ml-1">{t("sell.book_title")}</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-stone-900 text-sm"
                placeholder={t("sell.book_title_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] ml-1">{t("sell.author")}</label>
              <input
                required
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-stone-900 text-sm"
                placeholder={t("sell.author_placeholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] ml-1">{t("sell.category")}</label>
              <div className="relative">
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none font-medium text-stone-900 text-sm"
                >
                  <option value="">{t("sell.select_category")}</option>
                  <option value="Fiction">{t("category.fiction")}</option>
                  <option value="Science">{t("category.science")}</option>
                  <option value="Education">{t("category.education")}</option>
                  <option value="History">{t("category.history")}</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <Plus className="w-4 h-4 text-stone-400 rotate-45" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] ml-1">{t("filter.language")}</label>
              <div className="relative">
                <select
                  required
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none font-medium text-stone-900 text-sm"
                >
                  <option value="English">{t("language.en")}</option>
                  <option value="Arabic">{t("language.ar")}</option>
                  <option value="French">{t("language.fr")}</option>
                  <option value="Spanish">{t("language.es")}</option>
                  <option value="German">{t("language.de")}</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <Plus className="w-4 h-4 text-stone-400 rotate-45" />
                </div>
              </div>
            </div>
          </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] ml-1">{t("sell.price")}</label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-stone-900 text-sm"
                placeholder={t("sell.price_placeholder")}
              />
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] ml-1">ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-stone-900 text-sm"
                placeholder="978-..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] ml-1">{t("sell.publisher") || "دار النشر"}</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-stone-900 text-sm"
                placeholder={t("sell.publisher_placeholder") || "اسم دار النشر"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] ml-1">{t("sell.year") || "سنة النشر"}</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-stone-900 text-sm"
                placeholder="2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em]">{t("sell.description")}</label>
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={aiAnalyzing || !formData.description}
                className="flex items-center gap-2 text-[9px] font-black text-primary hover:text-primary/80 disabled:text-stone-300 transition-all uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full"
              >
                {aiAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {t("sell.ai_check")}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none font-medium text-stone-900 text-sm"
              placeholder={t("sell.description_placeholder")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] ml-1">{t("sell.condition")}</label>
            <div className="relative">
              <select
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-50 border border-stone-100 dark:border-stone-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none font-medium text-stone-900 text-sm"
              >
                <option value="new">{t("condition.new")}</option>
                <option value="like-new">{t("condition.like_new")}</option>
                <option value="good">{t("condition.good")}</option>
                <option value="acceptable">{t("condition.acceptable")}</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <Plus className="w-4 h-4 text-stone-400 rotate-45" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("sell.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
