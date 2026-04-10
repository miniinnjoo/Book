import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { BookOpen, Calendar, User, ArrowRight, Search, Mail, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CATEGORIES = ["الكل", "نصائح القراءة", "ريادة أعمال", "تطوير الذات", "مراجعات الكتب", "أخبار المنصة"];

const POSTS = [
  {
    id: "1",
    title: "كيف تختار كتابك القادم؟ دليل شامل للمبتدئين",
    excerpt: "نصائح عملية لمساعدتك في اختيار الكتاب الذي يناسب ذوقك واهتماماتك الحالية. سنتطرق إلى كيفية قراءة المراجعات وفهم تصنيفات الكتب...",
    author: "أحمد محمد",
    date: "2024-04-10",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=1200",
    category: "نصائح القراءة",
    featured: true,
    readTime: "5 دقائق"
  },
  {
    id: "2",
    title: "أفضل 5 كتب في ريادة الأعمال لعام 2024",
    excerpt: "قائمة مختارة بعناية لأهم الكتب التي ستغير طريقة تفكيرك في عالم المال والأعمال...",
    author: "سارة خالد",
    date: "2024-04-08",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    category: "ريادة أعمال",
    readTime: "7 دقائق"
  },
  {
    id: "3",
    title: "تحدي القراءة: كيف تقرأ 50 كتاباً في السنة؟",
    excerpt: "خطة مجربة ومنظمة لمساعدتك على زيادة معدل قراءتك السنوي بشكل ملحوظ...",
    author: "عمر فاروق",
    date: "2024-04-05",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",
    category: "تطوير الذات",
    readTime: "4 دقائق"
  },
  {
    id: "4",
    title: "لماذا تعتبر القراءة الورقية أفضل من الإلكترونية؟",
    excerpt: "دراسة حديثة تكشف عن فوائد ملموسة للقراءة من الكتب الورقية وتأثيرها على التركيز...",
    author: "ليلى حسن",
    date: "2024-04-01",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800",
    category: "نصائح القراءة",
    readTime: "6 دقائق"
  },
  {
    id: "5",
    title: "مراجعة كتاب: 'العادات الذرية' لجيمس كلير",
    excerpt: "كيف يمكن لتغييرات بسيطة جداً أن تؤدي إلى نتائج مذهلة في حياتك الشخصية والمهنية...",
    author: "ياسين علي",
    date: "2024-03-28",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
    category: "مراجعات الكتب",
    readTime: "8 دقائق"
  },
  {
    id: "6",
    title: "مستقبل تجارة الكتب المستعملة في العصر الرقمي",
    excerpt: "كيف تساهم التكنولوجيا في إحياء سوق الكتب القديمة وربط القراء حول العالم...",
    author: "نور الدين",
    date: "2024-03-25",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800",
    category: "أخبار المنصة",
    readTime: "5 دقائق"
  }
];

export default function Blog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const featuredPost = POSTS.find(p => p.featured);
  const regularPosts = POSTS.filter(p => !p.featured && (activeCategory === "الكل" || p.category === activeCategory));

  return (
    <div className="space-y-20 pb-24">
      {/* Header Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-primary/10"
        >
          <BookOpen className="w-3 h-3" />
          {t("blog.badge") || "المدونة"}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tighter text-stone-900 dark:text-white leading-[1.1]"
        >
          {t("blog.title") || "عالم القراءة والمعرفة"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-stone-500 dark:text-stone-400 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          {t("blog.subtitle") || "اكتشف أحدث المقالات والنصائح والمراجعات في عالم الكتب"}
        </motion.p>
      </div>

      {/* Featured Post Section */}
      {featuredPost && activeCategory === "الكل" && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group cursor-pointer"
          onClick={() => navigate(`/blog/${featuredPost.id}`)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white dark:bg-stone-900 rounded-[3.5rem] overflow-hidden border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/40 dark:shadow-none">
            <div className="aspect-[16/10] lg:aspect-auto relative overflow-hidden">
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="p-10 md:p-16 flex flex-col justify-center space-y-8">
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                  مقال مميز
                </span>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  {featuredPost.readTime} قراءة
                </span>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-stone-900 dark:text-white tracking-tighter leading-tight group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-lg text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-black text-stone-500">
                    {featuredPost.author[0]}
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-900 dark:text-white">{featuredPost.author}</p>
                    <p className="text-[10px] font-bold text-stone-400">{featuredPost.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  {t("blog.read_more") || "اقرأ المزيد"}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xl" 
                : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 group">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="ابحث في المقالات..."
            className="w-full pr-12 pl-6 py-4 bg-stone-100 dark:bg-stone-800 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Regular Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {regularPosts.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer flex flex-col h-full"
            onClick={() => navigate(`/blog/${post.id}`)}
          >
            <div className="space-y-6 flex-1">
              <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-stone-200/30 dark:shadow-none">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-white/95 backdrop-blur-md text-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
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
                    <BookOpen className="w-3.5 h-3.5" />
                    {post.readTime}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-stone-500 dark:text-stone-400 font-medium leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </div>
            
            <div className="pt-6 px-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-black text-[10px] text-stone-500">
                    {post.author[0]}
                  </div>
                  <span className="text-[10px] font-black text-stone-600 dark:text-stone-300 uppercase tracking-widest">{post.author}</span>
                </div>
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                  {t("blog.read_more") || "اقرأ المزيد"}
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Newsletter Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-12 md:p-20 bg-stone-900 dark:bg-stone-950 rounded-[4rem] relative overflow-hidden text-center space-y-10"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary rounded-full blur-[120px]" />
        </div>

        <div className="relative space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">لا تفوت أي جديد</h2>
          <p className="text-stone-400 font-medium text-lg">اشترك في نشرتنا البريدية لتصلك أحدث المقالات والكتب المختارة مباشرة إلى بريدك الإلكتروني.</p>
        </div>

        <div className="relative max-w-md mx-auto flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            placeholder="بريدك الإلكتروني"
            className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white text-sm font-bold focus:ring-2 focus:ring-primary/50 transition-all outline-none"
          />
          <button className="px-10 py-5 bg-primary text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
            اشترك الآن
          </button>
        </div>
        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">نحن نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.</p>
      </motion.div>
    </div>
  );
}
