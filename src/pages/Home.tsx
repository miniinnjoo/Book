import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, TrendingUp, ShieldCheck, Globe2, Zap, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { collection, query, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/src/firebase";
import { BookListing } from "@/src/types";
import BookCard from "@/src/components/BookCard";
import { cn } from "@/src/lib/utils";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState<BookListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "books"), where("status", "==", "available"), limit(4));
        const snap = await getDocs(q);
        const books = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookListing));
        setFeaturedBooks(books);
      } catch (error) {
        console.error("Error fetching featured books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 md:space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl md:rounded-[3rem] bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 transition-colors duration-500 shadow-2xl shadow-stone-200/50 dark:shadow-none">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-books opacity-40 dark:opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-50/20 to-stone-50 dark:via-stone-950/20 dark:to-stone-950"></div>
        </div>
        
        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 space-y-6 md:space-y-10 py-10 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 md:gap-3 px-5 md:px-6 py-2 md:py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white shadow-xl"
          >
            <div className="bg-primary p-1 md:p-1.5 rounded-lg">
              <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <div className="flex flex-col -space-y-1 text-left rtl:text-right">
              <span className="text-xs md:text-base font-black tracking-tighter uppercase">
                {t("hero.trending")}
              </span>
            </div>
          </motion.div>

          <div className="space-y-3 md:space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-stone-900 dark:text-white leading-[0.95] md:leading-[0.85] drop-shadow-2xl"
            >
              {t("hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-sm md:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed font-medium tracking-tight px-4"
            >
              {t("hero.subtitle")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-5 pt-3 md:pt-6"
          >
            <Link
              to="/browse"
              className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-primary text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg uppercase tracking-widest hover:bg-primary/90 transition-all duration-500 flex items-center justify-center gap-3 shadow-xl shadow-primary/30 group"
            >
              {t("nav.browse")}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform duration-500" />
            </Link>
            <Link
              to="/sell"
              className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-primary text-white border-2 border-primary rounded-xl md:rounded-2xl font-black text-base md:text-lg uppercase tracking-widest hover:opacity-90 transition-all duration-500 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              {t("nav.sell")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: t("stats.users"), value: "10K+" },
          { label: t("stats.books"), value: "50K+" },
          { label: t("stats.countries"), value: "15+" },
          { label: t("stats.chats"), value: "5K+" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-4 md:p-8 bg-white dark:bg-stone-900 rounded-xl md:rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/10 dark:shadow-none transition-colors duration-500"
          >
            <p className="text-xl md:text-3xl font-black text-primary tracking-tighter mb-0.5 md:mb-1">{stat.value}</p>
            <p className="text-[7px] md:text-[9px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        {[
          { icon: ShieldCheck, title: t("features.secure_payments_title"), desc: t("features.secure_payments_desc"), color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
          { icon: Globe2, title: t("features.global_reach_title"), desc: t("features.global_reach_desc"), color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" },
          { icon: Zap, title: t("features.instant_chat_title"), desc: t("features.instant_chat_desc"), color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group p-6 md:p-10 bg-white dark:bg-stone-900 rounded-2xl md:rounded-[2rem] border border-stone-200 dark:border-stone-800 hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
          >
            <div className={`w-12 h-12 md:w-16 md:h-16 ${feature.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-8 group-hover:scale-110 transition-all duration-500`}>
              <feature.icon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-lg md:text-2xl font-black text-stone-900 dark:text-stone-50 mb-2 md:mb-4 tracking-tight">{feature.title}</h3>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-xs md:text-base font-medium">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Featured Categories / Gallery */}
      <section className="space-y-8 md:space-y-12">
        <div className="flex items-end justify-between px-4">
          <div className="space-y-2 md:space-y-4 text-left rtl:text-right">
            <h2 className="text-3xl md:text-6xl font-black text-stone-900 dark:text-white tracking-tighter uppercase leading-none">
              {t("gallery.title").split(' ')[0]} <span className="text-primary">{t("gallery.title").split(' ')[1]}</span>
            </h2>
            <p className="text-base md:text-xl text-stone-400 font-medium tracking-tight">{t("gallery.subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {[
            { title: t("gallery.fiction"), id: "fiction", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800", count: t("gallery.books_count", { count: "1,200" }), className: "col-span-1" },
            { title: t("gallery.history"), id: "history", img: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800", count: t("gallery.books_count", { count: "850" }), className: "col-span-1" },
            { title: t("gallery.science"), id: "science", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800", count: t("gallery.books_count", { count: "600" }), className: "col-span-1" }
          ].map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              onClick={() => navigate("/browse", { state: { category: cat.id } })}
              className={cn(
                "relative aspect-[16/9] sm:aspect-[3/4] md:aspect-[4/5] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl shadow-stone-200/50 dark:shadow-none",
                cat.className
              )}
            >
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-4 md:bottom-10 left-4 md:left-10 right-4 md:right-10 space-y-0.5 md:space-y-2 text-left rtl:text-right">
                <p className="text-[7px] md:text-[10px] font-black text-secondary uppercase tracking-[0.2em] md:tracking-[0.3em]">{cat.count}</p>
                <h3 className="text-lg md:text-4xl font-black text-white tracking-tighter uppercase leading-tight">{cat.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-2 md:space-y-4">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-6xl font-black tracking-tighter text-stone-900 dark:text-white uppercase"
            >
              {t("featured.title").split(' ')[0]} <span className="text-primary">{t("featured.title").split(' ')[1]}</span>
            </motion.h2>
            <p className="text-base md:text-2xl text-stone-500 dark:text-stone-400 font-medium tracking-tight">{t("featured.subtitle")}</p>
          </div>
          <Link to="/browse" className="inline-flex items-center gap-4 px-10 py-5 bg-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all group shadow-xl shadow-primary/20">
            {t("hero.view_all")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-stone-100 rounded-[1.5rem] md:rounded-[2.5rem] animate-pulse border border-stone-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            {featuredBooks.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative p-10 md:p-20 bg-stone-100 dark:bg-stone-900 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden text-center space-y-8 md:space-y-10 border border-stone-200 dark:border-stone-800 transition-colors duration-500">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 space-y-4 md:space-y-6">
          <h2 className="text-3xl md:text-7xl font-black text-stone-900 dark:text-white tracking-tighter uppercase leading-none">{t("cta.title")}</h2>
          <p className="text-base md:text-xl text-stone-600 dark:text-stone-300 font-medium max-w-2xl mx-auto">{t("cta.subtitle")}</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/sell" className="inline-flex items-center gap-4 px-10 md:px-16 py-5 md:py-8 bg-primary text-white rounded-[1.5rem] md:rounded-[2.5rem] font-black text-base md:text-xl uppercase tracking-widest hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30">
            {t("cta.button")}
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
