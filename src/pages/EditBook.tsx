import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "@/src/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Upload, Plus, X, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { geminiService } from "@/src/services/geminiService";
import { BookListing, WishlistItem } from "@/src/types";
import React from "react";

export default function EditBook() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [formData, setFormData] = useState<Partial<BookListing>>({
    title: "",
    author: "",
    category: "",
    language: "English",
    condition: "good",
    price: 0,
    description: "",
    location: "",
    images: [],
  });
  const [oldPrice, setOldPrice] = useState(0);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id || !auth.currentUser) return;
      try {
        const snap = await getDoc(doc(db, "books", id));
        if (snap.exists()) {
          const data = snap.data() as BookListing;
          if (data.sellerId !== auth.currentUser.uid) {
            navigate("/");
            return;
          }
          setFormData(data);
          setOldPrice(data.price);
        }
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // For demo purposes, we'll just use placeholders
      const newImages = Array.from(files).slice(0, 5).map((_, i) => `https://picsum.photos/seed/editbook${i}/400/600`);
      setFormData({ ...formData, images: [...(formData.images || []), ...newImages].slice(0, 5) });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !auth.currentUser) return;

    setLoading(true);
    try {
      const newPrice = Number(formData.price);
      await updateDoc(doc(db, "books", id), {
        ...formData,
        price: newPrice,
        updatedAt: new Date().toISOString(),
      });

      // Price drop notification
      if (newPrice < oldPrice) {
        const wishlistQuery = query(collection(db, "wishlists"), where("bookId", "==", id));
        const wishlistSnap = await getDocs(wishlistQuery);
        
        const notifications = wishlistSnap.docs.map(wishDoc => {
          const wishData = wishDoc.data() as WishlistItem;
          return addDoc(collection(db, "notifications"), {
            userId: wishData.userId,
            type: "offer",
            title: t("notifications.price_drop", { title: formData.title, price: newPrice }),
            message: t("notifications.price_drop", { title: formData.title, price: newPrice }),
            link: `/book/${id}`,
            read: false,
            createdAt: new Date().toISOString(),
          });
        });
        await Promise.all(notifications);
      }

      navigate(`/book/${id}`);
    } catch (error) {
      console.error("Error updating book:", error);
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
        setFormData({ ...formData, condition: result.condition as any });
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  if (fetching) return <div className="py-24 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" />
        {t("profile.cancel")}
      </button>

      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tighter text-stone-900 dark:text-white leading-tight">
          {t("profile.edit")} {t("nav.sell")}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left: Image Upload */}
        <div className="md:col-span-1 space-y-6">
          <label className="block aspect-[3/4] bg-stone-50 dark:bg-stone-800 rounded-[2.5rem] border-2 border-dashed border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center p-8 text-center group hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden relative">
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            {formData.images?.[0] ? (
              <img src={formData.images[0]} alt="" className="w-full h-full object-cover rounded-[2rem]" />
            ) : (
              <>
                <div className="w-16 h-16 bg-white dark:bg-stone-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                  <Upload className="w-8 h-8 text-stone-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-black text-stone-900 dark:text-stone-200 uppercase tracking-widest">{t("sell.upload_images")}</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-2 font-medium">{t("sell.upload_desc")}</p>
              </>
            )}
          </label>
          
          <div className="flex gap-3 flex-wrap">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 flex items-center justify-center text-stone-300 overflow-hidden relative group">
                {formData.images?.[i] ? (
                  <>
                    <img src={formData.images[i]} alt="" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form Details */}
        <div className="md:col-span-2 space-y-8 bg-white dark:bg-stone-900 p-10 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/30 dark:shadow-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">{t("sell.book_title")}</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-primary dark:text-white transition-all font-medium"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">{t("sell.author")}</label>
              <input
                required
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-primary dark:text-white transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">{t("sell.price")}</label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-primary dark:text-white transition-all font-medium"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">{t("sell.location")}</label>
              <input
                required
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-primary dark:text-white transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{t("sell.description")}</label>
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={aiAnalyzing || !formData.description}
                className="flex items-center gap-2 text-[10px] font-black text-primary hover:text-primary/80 disabled:text-stone-300 transition-all uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full"
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
              className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-primary dark:text-white transition-all resize-none font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:bg-stone-200"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("profile.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
