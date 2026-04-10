import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { BookOpen, Calendar, User, ArrowRight } from "lucide-react";

const POSTS = [
  {
    id: "1",
    title: "كيف تختار كتابك القادم؟",
    excerpt: "نصائح عملية لمساعدتك في اختيار الكتاب الذي يناسب ذوقك واهتماماتك الحالية...",
    author: "أحمد محمد",
    date: "2024-04-10",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800",
    category: "نصائح القراءة"
  },
  {
    id: "2",
    title: "أفضل 5 كتب في ريادة الأعمال لعام 2024",
    excerpt: "قائمة مختارة بعناية لأهم الكتب التي ستغير طريقة تفكيرك في عالم المال والأعمال...",
    author: "سارة خالد",
    date: "2024-04-08",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    category: "ريادة أعمال"
  },
  {
    id: "3",
    title: "تحدي القراءة: كيف تقرأ 50 كتاباً في السنة؟",
    excerpt: "خطة مجربة ومنظمة لمساعدتك على زيادة معدل قراءتك السنوي بشكل ملحوظ...",
    author: "عمر فاروق",
    date: "2024-04-05",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",
    category: "تطوير الذات"
  }
];

export default function Blog() {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 pb-24">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em]"
        >
          {t("blog.badge") || "المدونة"}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tighter text-stone-900 dark:text-white leading-tight"
        >
          {t("blog.title") || "عالم القراءة والمعرفة"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-stone-500 dark:text-stone-400 font-medium"
        >
          {t("blog.subtitle") || "اكتشف أحدث المقالات والنصائح والمراجعات في عالم الكتب"}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {POSTS.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="space-y-6">
              <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-stone-200/50 dark:shadow-none">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 px-2">
                <div className="flex items-center gap-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    {post.author}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-stone-500 dark:text-stone-400 font-medium leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                    {t("blog.read_more") || "اقرأ المزيد"}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
