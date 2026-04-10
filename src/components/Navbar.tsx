import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Search, PlusCircle, User, LogIn, MessageSquare, ShieldCheck, Sun, Moon, Menu, X, Heart, ShoppingCart } from "lucide-react";
import { auth } from "@/src/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationCenter from "./NotificationCenter";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect, FormEvent } from "react";

export default function Navbar() {
  const { t } = useTranslation();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "transition-all duration-500 ease-in-out flex items-center justify-between px-4 md:px-8 py-4",
          "bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl",
          "border-b border-stone-200/50 dark:border-stone-800/50 shadow-sm",
          scrolled ? "py-3" : "py-4"
        )}
      >
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-stone-900 dark:text-stone-50">
              {t("app.name")}
            </span>
          </Link>
        </div>

        {/* Center: Nav Links */}
        <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <div className="relative group flex justify-center">
            <Link 
              to="/browse" 
              className={cn(
                "px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                location.pathname === "/browse" 
                  ? "bg-primary text-white" 
                  : "text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5"
              )}
            >
              <Search className="w-4 h-4" />
              {t("nav.browse")}
            </Link>
            <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
              {t("nav.browse_desc") || "تصفح الكتب المتاحة"}
            </div>
          </div>

          <div className="relative group flex justify-center">
            <Link 
              to="/sell" 
              className={cn(
                "px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                location.pathname === "/sell" 
                  ? "bg-primary text-white" 
                  : "text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5"
              )}
            >
              <PlusCircle className="w-4 h-4" />
              {t("nav.sell")}
            </Link>
            <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
              {t("nav.sell_desc") || "قم ببيع كتبك المستعملة"}
            </div>
          </div>

          <div className="relative group flex justify-center">
            <Link 
              to="/wishlist" 
              className={cn(
                "px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                location.pathname === "/wishlist" 
                  ? "bg-primary text-white" 
                  : "text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5"
              )}
            >
              <Heart className="w-4 h-4" />
              {t("nav.wishlist") || "المفضلة"}
            </Link>
            <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
              {t("nav.wishlist_desc") || "الكتب التي نالت إعجابك"}
            </div>
          </div>

          <div className="relative group flex justify-center">
            <Link 
              to="/blog" 
              className={cn(
                "px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                location.pathname === "/blog" 
                  ? "bg-primary text-white" 
                  : "text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5"
              )}
            >
              <BookOpen className="w-4 h-4" />
              {t("nav.blog") || "المدونة"}
            </Link>
            <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
              {t("nav.blog_desc") || "مقالات ونصائح القراءة"}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <div className="relative group flex justify-center">
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
                {theme === 'light' ? "الوضع الليلي" : "الوضع النهاري"}
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          <div className="w-px h-6 bg-stone-200 dark:bg-stone-800 mx-1 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <div className="relative group flex justify-center">
                <Link to="/chat" className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
                  {t("chat.title") || "المحادثات"}
                </div>
              </div>
              <div className="relative group flex justify-center">
                <Link to="/cart" className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
                <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
                  {t("nav.cart") || "السلة"}
                </div>
              </div>
              {user.email === "mini.innjoo@gmail.com" && (
                <div className="relative group flex justify-center">
                  <Link to="/admin" className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </Link>
                  <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
                    لوحة الإدارة
                  </div>
                </div>
              )}
              <div className="relative group flex justify-center">
                <Link to="/profile" className="flex items-center gap-2 p-1 hover:bg-primary/5 rounded-xl transition-colors group">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-lg object-cover border border-stone-200 dark:border-stone-800"
                  />
                </Link>
                <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
                  الملف الشخصي
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group flex justify-center">
              <Link 
                to="/login" 
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
              >
                {t("nav.login")}
              </Link>
              <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
                تسجيل الدخول
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 p-6 shadow-xl lg:hidden"
            >
              <div className="grid grid-cols-1 gap-4">
                <Link 
                  to="/browse" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl"
                >
                  <BookOpen className="w-6 h-6 text-primary" />
                  <span className="font-bold text-stone-900 dark:text-stone-50">{t("nav.browse")}</span>
                </Link>
                <Link 
                  to="/sell" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl"
                >
                  <PlusCircle className="w-6 h-6 text-primary" />
                  <span className="font-bold text-stone-900 dark:text-stone-50">{t("nav.sell")}</span>
                </Link>
                <Link 
                  to="/wishlist" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl"
                >
                  <Heart className="w-6 h-6 text-primary" />
                  <span className="font-bold text-stone-900 dark:text-stone-50">{t("nav.wishlist") || "المفضلة"}</span>
                </Link>
                <Link 
                  to="/blog" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl"
                >
                  <BookOpen className="w-6 h-6 text-primary" />
                  <span className="font-bold text-stone-900 dark:text-stone-50">{t("nav.blog") || "المدونة"}</span>
                </Link>
                {user && (
                  <>
                    <Link 
                      to="/chat" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl"
                    >
                      <MessageSquare className="w-6 h-6 text-primary" />
                      <span className="font-bold text-stone-900 dark:text-stone-50">{t("nav.chat")}</span>
                    </Link>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl"
                    >
                      <User className="w-6 h-6 text-primary" />
                      <span className="font-bold text-stone-900 dark:text-stone-50">{t("nav.profile")}</span>
                    </Link>
                  </>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleTheme}
                      className="w-12 h-12 flex items-center justify-center bg-stone-100 dark:bg-stone-900 rounded-2xl text-stone-500"
                    >
                      {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                    </button>
                    <LanguageSwitcher />
                  </div>
                  {!user && (
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="px-8 py-3 bg-primary text-white rounded-2xl font-bold"
                    >
                      {t("nav.login")}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
