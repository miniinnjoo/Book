import { useTranslation } from "react-i18next";
import { Shield, Lock, Eye, FileText, Globe, Bell, UserCheck, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export default function Privacy() {
  const { t } = useTranslation();

  const sections = [
    {
      title: "1. المعلومات التي نجمعها",
      content: "نجمع المعلومات التي تقدمها مباشرة عند إنشاء حساب، بما في ذلك اسمك، بريدك الإلكتروني، رقم هاتفك، وعنوان الشحن. كما نجمع بيانات تقنية مثل عنوان IP ونوع المتصفح لتحسين أداء المنصة.",
      icon: Eye
    },
    {
      title: "2. كيف نستخدم معلوماتك",
      content: "نستخدم بياناتك لتشغيل المنصة، وتسهيل المعاملات بين البائعين والمشترين، وإرسال تحديثات حول طلباتك، وتحسين ميزاتنا بناءً على سلوك المستخدمين.",
      icon: FileText
    },
    {
      title: "3. حماية وأمن البيانات",
      content: "نطبق إجراءات أمنية صارمة وتشفير (SSL) لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الإفصاح. يتم تخزين جميع البيانات في خوادم آمنة ومشفرة.",
      icon: Shield
    },
    {
      title: "4. ملفات تعريف الارتباط (Cookies)",
      content: "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح، وتذكر تفضيلاتك، وتحليل حركة المرور على الموقع. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من متصفحك.",
      icon: Globe
    },
    {
      title: "5. مشاركة البيانات مع أطراف ثالثة",
      content: "لا نقوم ببيع أو تأجير بياناتك الشخصية لأي طرف ثالث. نشارك فقط المعلومات الضرورية مع شركاء الشحن أو بوابات الدفع لإتمام طلباتك بنجاح.",
      icon: Lock
    },
    {
      title: "6. حقوقك كمستخدم",
      content: "لديك الحق في الوصول إلى بياناتك الشخصية، وتصحيحها، أو طلب حذفها بالكامل من خوادمنا في أي وقت عبر إعدادات الملف الشخصي أو التواصل مع الدعم.",
      icon: UserCheck
    },
    {
      title: "7. الاحتفاظ بالبيانات",
      content: "نحتفظ ببياناتك طالما كان حسابك نشطاً أو طالما كان ذلك ضرورياً لتزويدك بالخدمات. يمكنك طلب حذف حسابك وبياناتك المرتبطة به في أي وقت.",
      icon: Trash2
    },
    {
      title: "8. التغييرات في سياسة الخصوصية",
      content: "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو عبر إشعار بارز على المنصة.",
      icon: Bell
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-20 space-y-16">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-primary/10"
        >
          <Shield className="w-3 h-3" />
          الأمان والخصوصية
        </motion.div>
        <h1 className="text-6xl font-black tracking-tighter text-stone-900 dark:text-white uppercase">
          {t("footer.privacy")}
        </h1>
        <p className="text-xl text-stone-500 dark:text-stone-400 font-medium max-w-2xl mx-auto">
          خصوصيتك هي أولويتنا القصوى. نحن نلتزم بالشفافية الكاملة حول كيفية جمع واستخدام وحماية بياناتك.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-10 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none flex flex-col md:flex-row gap-8 items-start md:items-center"
          >
            <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <section.icon className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tight">{section.title}</h2>
              <p className="text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{section.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-12 bg-stone-50 dark:bg-stone-800/50 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-700 text-center">
        <p className="text-stone-400 font-medium italic">
          آخر تحديث: 10 أبريل 2024. إذا كان لديك أي استفسارات حول سياسة الخصوصية، يرجى التواصل مع فريقنا القانوني.
        </p>
      </div>
    </div>
  );
}
