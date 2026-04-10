import { useEffect, useState } from "react";
import { auth, db } from "@/src/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { BookListing, Transaction, UserProfile } from "@/src/types";
import { BarChart3, Users, BookOpen, DollarSign, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { formatPrice } from "@/src/lib/utils";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

export default function Admin() {
  const { t, i18n } = useTranslation();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalSales: 0,
    totalCommission: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists() && userSnap.data().role === "admin") {
        setIsAdmin(true);
        fetchStats();
      } else if (user.email === "mini.innjoo@gmail.com") {
        setIsAdmin(true);
        fetchStats();
      } else {
        navigate("/");
      }
    };
    checkAdmin();
  }, [user]);

  const fetchStats = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const booksSnap = await getDocs(collection(db, "books"));
      const txSnap = await getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(10)));
      
      const transactions = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      const totalSales = transactions.reduce((acc, tx) => acc + tx.amount, 0);
      const totalCommission = transactions.reduce((acc, tx) => acc + tx.commission, 0);

      setStats({
        totalUsers: usersSnap.size,
        totalListings: booksSnap.size,
        totalSales,
        totalCommission,
      });
      setRecentTransactions(transactions);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-stone-900 dark:text-white uppercase">
            {user?.email === "mini.innjoo@gmail.com" ? "لوحة المؤسس" : t("admin.dashboard")}
          </h1>
          <p className="text-xl text-stone-500 dark:text-stone-400 font-medium">
            {t("admin.overview") || "نظرة عامة على المنصة وإدارتها"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => navigate("/admin/payments")}
            className="flex items-center gap-3 px-6 py-3 bg-stone-100 text-stone-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-stone-200 transition-all"
          >
            <DollarSign className="w-4 h-4" />
            {t("nav.payment_gateway")}
          </button>
          <div className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-stone-900/20">
            <ShieldAlert className="w-4 h-4" />
            {t("admin.access") || "وصول المسؤول"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t("admin.users"), value: stats.totalUsers, icon: Users, color: "text-blue-600" },
          { label: t("admin.listings"), value: stats.totalListings, icon: BookOpen, color: "text-purple-600" },
          { label: t("admin.transactions"), value: formatPrice(stats.totalSales), icon: DollarSign, color: "text-green-600" },
          { label: user?.email === "mini.innjoo@gmail.com" ? "Founder's Profit / أرباح المؤسس (1%)" : t("admin.commission") || "العمولة (1%)", value: formatPrice(stats.totalCommission), icon: BarChart3, color: "text-amber-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="p-10 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/30 dark:shadow-none space-y-6 hover:scale-105 transition-transform duration-500"
          >
            <div className={`w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className="text-4xl font-black text-stone-900 dark:text-stone-50 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="space-y-8">
        <h2 className="text-3xl font-black text-stone-900 dark:text-stone-50 uppercase tracking-tighter">
          {t("admin.recent_transactions") || "أحدث المعاملات"}
        </h2>
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 overflow-hidden shadow-2xl shadow-stone-200/30 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead>
                <tr className="bg-stone-50/50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                  <th className="px-8 py-6 text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em]">ID</th>
                  <th className="px-8 py-6 text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em]">{t("book.price")}</th>
                  <th className="px-8 py-6 text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em]">{t("admin.commission") || "العمولة"}</th>
                  <th className="px-8 py-6 text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em]">{t("admin.status") || "الحالة"}</th>
                  <th className="px-8 py-6 text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em]">{t("admin.date") || "التاريخ"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/30 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="px-8 py-6 font-mono text-xs text-stone-400 dark:text-stone-500">{tx.id.slice(0, 8)}...</td>
                    <td className="px-8 py-6 font-black text-stone-900 dark:text-stone-50 text-lg">{formatPrice(tx.amount)}</td>
                    <td className="px-8 py-6 font-black text-green-600 dark:text-green-400">{formatPrice(tx.commission)}</td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle className="w-3 h-3" />
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-stone-500 dark:text-stone-400 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentTransactions.length === 0 && (
            <div className="py-20 text-center text-stone-400 dark:text-stone-500 font-black uppercase tracking-widest">
              {t("admin.no_transactions") || "لا توجد معاملات بعد."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
