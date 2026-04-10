import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { auth, db } from "@/src/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Heart, Package, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BookListing, WishlistItem } from "@/src/types";
import BookCard from "@/src/components/BookCard";

export default function Wishlist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [wishlist, setWishlist] = useState<BookListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }
      }
      const uid = user?.uid || auth.currentUser?.uid;
      if (!uid) return;

      try {
        const q = query(collection(db, "wishlists"), where("userId", "==", uid));
        const snap = await getDocs(q);
        const bookIds = snap.docs.map(doc => (doc.data() as WishlistItem).bookId);
        
        if (bookIds.length > 0) {
          const booksQuery = query(collection(db, "books"), where("__name__", "in", bookIds));
          const booksSnap = await getDocs(booksQuery);
          setWishlist(booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookListing)));
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("profile.cancel")}
        </button>
        <h1 className="text-4xl font-black tracking-tighter text-stone-900 dark:text-white uppercase">
          {t("profile.wishlist")}
        </h1>
        <div className="w-20" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[3/4] bg-stone-50 dark:bg-stone-900 rounded-[2rem] animate-pulse border border-stone-100 dark:border-stone-800" />
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlist.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center space-y-8 bg-stone-50/30 dark:bg-stone-900/30 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-800">
          <div className="w-24 h-24 bg-white dark:bg-stone-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-10 h-10 text-stone-200 dark:text-stone-700" />
          </div>
          <div className="space-y-4">
            <p className="text-stone-500 dark:text-stone-400 font-medium text-lg">{t("profile.no_wishlist")}</p>
            <button onClick={() => navigate("/browse")} className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              {t("profile.explore")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
