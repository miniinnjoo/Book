import { useTranslation } from "react-i18next";
import { auth, googleProvider } from "@/src/firebase";
import { signInWithPopup } from "firebase/auth";
import { LogIn, ShieldCheck, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/50 dark:shadow-none space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white uppercase">
            {t("auth.welcome")}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium">
            {t("auth.subtitle") || "انضم إلى المجتمع العالمي لمحبي الكتب."}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 rounded-2xl font-black text-stone-900 dark:text-white hover:border-primary transition-all group shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            {t("auth.google")}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100 dark:border-stone-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-stone-400">
              <span className="bg-white dark:bg-stone-900 px-4">
                {t("auth.or") || "أو تابع باستخدام"}
              </span>
            </div>
          </div>

          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-stone-50 dark:bg-stone-800/50 border-2 border-transparent rounded-2xl font-black text-stone-400 cursor-not-allowed"
          >
            <Mail className="w-5 h-5" />
            {t("auth.email_soon") || "البريد الإلكتروني (قريباً)"}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[8px] text-stone-400 font-black uppercase tracking-widest pt-4">
          <ShieldCheck className="w-3 h-3" />
          {t("auth.secure") || "تسجيل دخول آمن ومشفر بواسطة Firebase"}
        </div>
      </motion.div>
    </div>
  );
}
