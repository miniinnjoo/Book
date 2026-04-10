import { useTranslation } from "react-i18next";
import { auth, googleProvider } from "@/src/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { LogIn, ShieldCheck, Mail, Lock, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err: any) {
      console.error("Auth Error:", err);
      let message = err.message;
      if (err.code === "auth/email-already-in-use") message = "البريد الإلكتروني مستخدم بالفعل";
      if (err.code === "auth/invalid-email") message = "البريد الإلكتروني غير صالح";
      if (err.code === "auth/weak-password") message = "كلمة المرور ضعيفة جداً";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") message = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      setError(message);
    } finally {
      setLoading(false);
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
            {isSignUp ? <UserPlus className="w-8 h-8 text-white" /> : <LogIn className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white uppercase">
            {isSignUp ? t("auth.signup_btn") : t("auth.welcome")}
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
          {!showEmailForm ? (
            <>
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
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-stone-100 dark:bg-stone-800 border-2 border-transparent rounded-2xl font-black text-stone-900 dark:text-white hover:border-primary transition-all group shadow-sm"
              >
                <Mail className="w-5 h-5 text-primary" />
                {t("auth.email_soon")}
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">
                      {t("profile.display_name")}
                    </label>
                    <div className="relative">
                      <LogIn className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">
                  {t("auth.email_label")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">
                  {t("auth.password_label")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {loading ? t("common.loading") : (isSignUp ? t("auth.signup_btn") : t("auth.login_btn"))}
              </button>

              <div className="flex flex-col gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                  {isSignUp ? t("auth.switch_to_login") : t("auth.switch_to_signup")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-600 transition-colors"
                >
                  {t("profile.cancel")}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-[8px] text-stone-400 font-black uppercase tracking-widest pt-4">
          <ShieldCheck className="w-3 h-3" />
          {t("auth.secure") || "تسجيل دخول آمن ومشفر بواسطة Firebase"}
        </div>
      </motion.div>
    </div>
  );
}
