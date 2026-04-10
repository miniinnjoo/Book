import { useTranslation } from "react-i18next";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-20 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black tracking-tighter text-stone-900 dark:text-white uppercase">
          {t("footer.privacy")}
        </h1>
        <p className="text-xl text-stone-500 dark:text-stone-400 font-medium max-w-2xl mx-auto">
          نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية. تعرف على كيفية تعاملنا مع معلوماتك.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {[
          {
            title: "جمع البيانات",
            content: "نقوم بجمع المعلومات التي تقدمها لنا عند إنشاء حساب، مثل اسمك وبريدك الإلكتروني ورقم هاتفك.",
            icon: Eye
          },
          {
            title: "استخدام المعلومات",
            content: "نستخدم بياناتك لتحسين تجربتك على المنصة، وتسهيل عمليات البيع والشراء، والتواصل معك بشأن طلباتك.",
            icon: FileText
          },
          {
            title: "حماية البيانات",
            content: "نستخدم تقنيات تشفير متقدمة لحماية بياناتك من الوصول غير المصرح به.",
            icon: Shield
          },
          {
            title: "مشاركة البيانات",
            content: "لا نقوم ببيع بياناتك لأطراف ثالثة. نشارك فقط المعلومات الضرورية لإتمام المعاملات بين البائع والمشتري.",
            icon: Lock
          }
        ].map((section, i) => (
          <div key={i} className="p-10 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none flex gap-8 items-start">
            <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center shrink-0">
              <section.icon className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tight">{section.title}</h2>
              <p className="text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{section.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
