import { useTranslation } from "react-i18next";
import { MessageSquare, Mail, LifeBuoy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/firebase";

export default function Support() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleStartChat = async () => {
    try {
      const q = query(collection(db, "users"), where("email", "==", "mini.innjoo@gmail.com"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const founderUid = snap.docs[0].id;
        navigate("/chat", { state: { sellerId: founderUid } });
      } else {
        navigate("/chat");
      }
    } catch (error) {
      console.error("Error starting support chat:", error);
      navigate("/chat");
    }
  };

  const channels = [
    {
      title: "الدردشة المباشرة",
      content: "تحدث مع فريق الدعم لدينا مباشرة عبر المنصة.",
      icon: MessageSquare,
      action: "ابدأ الدردشة الآن",
      onClick: handleStartChat
    },
    {
      title: "أسئلة وأجوبة",
      content: "تصفح الأسئلة الشائعة.",
      icon: LifeBuoy,
      action: "زيارة المركز",
      onClick: () => window.open("https://t.me/kitabi_support", "_blank")
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-20 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black tracking-tighter text-stone-900 dark:text-white uppercase">
          {t("footer.support")}
        </h1>
        <p className="text-xl text-stone-500 dark:text-stone-400 font-medium max-w-2xl mx-auto">
          فريقنا هنا لمساعدتك في أي وقت. تواصل معنا عبر القنوات التالية.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {channels.map((channel, i) => (
          <div key={i} className="p-10 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none space-y-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-stone-50 dark:bg-stone-800 rounded-[2.5rem] flex items-center justify-center">
              <channel.icon className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-4 flex-1">
              <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tight">{channel.title}</h2>
              <p className="text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{channel.content}</p>
            </div>
            <button 
              onClick={channel.onClick}
              className="w-full py-4 bg-stone-900 dark:bg-stone-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 dark:hover:bg-stone-700 transition-all shadow-xl shadow-stone-900/20"
            >
              {channel.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
