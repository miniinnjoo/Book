import { useTranslation } from "react-i18next";
import { MessageSquare, ChevronDown, HelpCircle, Book, CreditCard, Truck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const FAQS = [
  {
    category: "عام",
    icon: HelpCircle,
    questions: [
      {
        q: "ما هي منصة كتابي؟",
        a: "كتابي هي منصة عالمية تتيح لمحبي الكتب بيع وشراء الكتب المستعملة والجديدة بكل سهولة وأمان، مع توفير أدوات تواصل مباشرة بين البائع والمشتري."
      },
      {
        q: "هل التسجيل في المنصة مجاني؟",
        a: "نعم، التسجيل في منصة كتابي مجاني تماماً لجميع المستخدمين."
      }
    ]
  },
  {
    category: "البيع والشراء",
    icon: Book,
    questions: [
      {
        q: "كيف يمكنني عرض كتاب للبيع؟",
        a: "يمكنك الضغط على زر 'بيع كتاب' في القائمة العلوية، ثم ملء تفاصيل الكتاب (العنوان، المؤلف، الحالة، السعر) ورفع صور واضحة له."
      },
      {
        q: "كيف أتواصل مع البائع؟",
        a: "في صفحة أي كتاب، ستجد زر 'اتصل بالبائع' الذي يفتح دردشة مباشرة وفورية معه للاستفسار عن التفاصيل."
      }
    ]
  },
  {
    category: "الدفع والعمولة",
    icon: CreditCard,
    questions: [
      {
        q: "ما هي عمولة المنصة؟",
        a: "تأخذ منصة كتابي عمولة رمزية قدرها 1% فقط من قيمة كل عملية بيع ناجحة، وذلك لضمان استمرارية وتطوير الخدمات."
      },
      {
        q: "كيف يتم استلام الأرباح؟",
        a: "يتم تحويل الأرباح إلى محفظتك الإلكترونية في المنصة، ويمكنك طلب سحبها عبر وسائل الدفع المتاحة في بلدك."
      }
    ]
  }
];

export default function Support() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto py-20 space-y-16">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-primary/10"
        >
          <HelpCircle className="w-3 h-3" />
          الأسئلة الشائعة
        </motion.div>
        <h1 className="text-6xl font-black tracking-tighter text-stone-900 dark:text-white uppercase">
          {t("footer.support")}
        </h1>
        <p className="text-xl text-stone-500 dark:text-stone-400 font-medium max-w-2xl mx-auto">
          كل ما تحتاج لمعرفته حول استخدام منصة كتابي في مكان واحد.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-4">
        {FAQS.map((cat, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveCategory(i);
              setOpenIndex(null);
            }}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              activeCategory === i 
                ? "bg-primary text-white shadow-xl shadow-primary/20" 
                : "bg-white dark:bg-stone-900 text-stone-400 border border-stone-100 dark:border-stone-800 hover:border-primary/20"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.category}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {FAQS[activeCategory].questions.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-8 flex items-center justify-between text-right group"
            >
              <span className="text-lg font-black text-stone-900 dark:text-white group-hover:text-primary transition-colors">
                {faq.q}
              </span>
              <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-500 ${openIndex === i ? "rotate-180 text-primary" : ""}`} />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8"
                >
                  <p className="text-stone-500 dark:text-stone-400 leading-relaxed font-medium border-t border-stone-50 dark:border-stone-800 pt-6">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="p-12 bg-stone-900 dark:bg-primary rounded-[3rem] text-center space-y-8 shadow-2xl shadow-stone-900/20">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">لم تجد إجابتك؟</h2>
          <p className="text-stone-400 dark:text-white/70 font-medium">فريق الدعم الفني لدينا متاح لمساعدتك في أي وقت.</p>
        </div>
        <button 
          onClick={() => window.open("https://t.me/kitabi_support", "_blank")}
          className="px-12 py-6 bg-white text-stone-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all flex items-center gap-3 mx-auto"
        >
          <MessageSquare className="w-5 h-5" />
          تواصل معنا الآن
        </button>
      </div>
    </div>
  );
}
