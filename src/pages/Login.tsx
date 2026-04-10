import { useTranslation } from "react-i18next";
import { auth, googleProvider } from "@/src/firebase";
import { signInWithPopup } from "firebase/auth";
import { LogIn, ShieldCheck, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">
            {t("auth.welcome")}
          </h1>
          <p className="text-stone-500 font-medium">
            {t("auth.subtitle") || "انضم إلى المجتمع العالمي لمحبي الكتب."}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-stone-100 rounded-2xl font-black text-stone-900 hover:border-stone-900 hover:bg-stone-50 transition-all group"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            {t("auth.google")}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-stone-400 font-black tracking-widest">
                {t("auth.or") || "أو تابع باستخدام"}
              </span>
            </div>
          </div>

          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-stone-50 border-2 border-transparent rounded-2xl font-black text-stone-400 cursor-not-allowed"
          >
            <Mail className="w-5 h-5" />
            {t("auth.email_soon") || "البريد الإلكتروني (قريباً)"}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-stone-400 font-black uppercase tracking-widest pt-4">
          <ShieldCheck className="w-4 h-4" />
          {t("auth.secure") || "تسجيل دخول آمن ومشفر بواسطة Firebase"}
        </div>
      </motion.div>
    </div>
  );
}
