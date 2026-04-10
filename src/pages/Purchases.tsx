import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { auth, db } from "@/src/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { ShoppingBag, Package, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Transaction } from "@/src/types";

export default function Purchases() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "transactions"),
          where("buyerId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setPurchases(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      } catch (error) {
        console.error("Error fetching purchases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("profile.cancel")}
        </button>
        <h1 className="text-4xl font-black tracking-tighter text-stone-900 dark:text-white uppercase">
          {t("profile.my_purchases")}
        </h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-stone-50 dark:bg-stone-900 rounded-[2rem] animate-pulse border border-stone-100 dark:border-stone-800" />
          ))}
        </div>
      ) : purchases.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {purchases.map((tx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={tx.id} 
              className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between shadow-sm hover:shadow-2xl hover:shadow-stone-200/30 dark:hover:shadow-none transition-all duration-500 group gap-6"
            >
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-black text-stone-900 dark:text-white text-lg tracking-tight">Order #{tx.id.slice(0, 8)}</p>
                  <p className="text-xs font-medium text-stone-400">{new Date(tx.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                <div className="text-right rtl:text-left">
                  <p className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter">{formatPrice(tx.amount)}</p>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full inline-block mt-2">{tx.status}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center space-y-8 bg-stone-50/30 dark:bg-stone-900/30 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-800">
          <div className="w-24 h-24 bg-white dark:bg-stone-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-10 h-10 text-stone-200 dark:text-stone-700" />
          </div>
          <div className="space-y-4">
            <p className="text-stone-500 dark:text-stone-400 font-medium text-lg">{t("profile.no_purchases")}</p>
            <button onClick={() => navigate("/browse")} className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              {t("profile.explore")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
