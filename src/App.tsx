import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import BookDetails from "./pages/BookDetails";
import SellBook from "./pages/SellBook";
import EditBook from "./pages/EditBook";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Cart from "./pages/Cart";
import Purchases from "./pages/Purchases";
import Wishlist from "./pages/Wishlist";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./i18n";

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    if (user) {
      const syncUser = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const userData = {
            uid: user.uid,
            displayName: user.displayName || "Anonymous",
            email: user.email,
            photoURL: user.photoURL || "",
            role: "user",
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, userData);
          
          // Sync to public profile
          await setDoc(doc(db, "public_profiles", user.uid), {
            uid: user.uid,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            rating: 0,
            reviewCount: 0
          });
        }
      };
      syncUser();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-900 font-sans text-stone-900 dark:text-stone-50 relative transition-colors duration-500">
        {/* Global Background Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] right-[-5%] w-[30%] h-[30%] bg-primary/3 rounded-full blur-[100px]"></div>
        </div>

        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-8 md:pb-12 relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/book/:id/edit" element={user ? <EditBook /> : <Navigate to="/login" />} />
            <Route path="/sell" element={user ? <SellBook /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
            <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
            <Route path="/purchases" element={user ? <Purchases /> : <Navigate to="/login" />} />
            <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/support" element={<Support />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <footer className="bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 py-16 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left rtl:md:text-right">
                <p className="text-primary font-black text-3xl mb-2 tracking-tighter uppercase">كتابي - Kitabi</p>
                <p className="text-stone-400 text-sm font-medium max-w-xs">
                  {t("hero.subtitle")}
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <a href="#" className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-400 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm border border-stone-100 dark:border-stone-700">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-400 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm border border-stone-100 dark:border-stone-700">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.058-1.69-.072-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://t.me/kitabi_app" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-400 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm border border-stone-100 dark:border-stone-700">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 8.146l-2.003 9.464c-.149.659-.54 1.21-.943 1.21-.38 0-.704-.333-1.029-.54l-3.388-2.497-1.637 1.57c-.179.17-.33.315-.634.315-.386 0-.339-.144-.339-.403l.001-3.623 6.591-5.95c.287-.255-.063-.396-.446-.142l-8.146 5.13-3.509-1.098c-.76-.238-.775-.76.158-1.125l13.698-5.282c.633-.233 1.187.149.978.97z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-stone-50 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-stone-400 text-xs font-black uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} {t("app.name")}
              </p>
              <div className="flex items-center gap-8">
                <Link to="/privacy" className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">{t("footer.privacy")}</Link>
                <Link to="/support" className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">{t("footer.support")}</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
