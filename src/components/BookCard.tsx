import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookListing } from "@/src/types";
import { formatPrice } from "@/src/lib/utils";
import { MapPin, User, Star, Heart, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useWishlist } from "@/src/hooks/useWishlist";
import { auth, db } from "@/src/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export default function BookCard({ book, onDelete }: any) {
  const { t } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist(book.id);
  const isOwner = auth.currentUser?.uid === book.sellerId;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(t("common.confirm_delete") || "هل أنت متأكد من حذف هذا الإعلان؟")) {
      try {
        await deleteDoc(doc(db, "books", book.id));
        if (onDelete) onDelete(book.id);
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group relative bg-white dark:bg-stone-900 rounded-[1.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-xl hover:shadow-stone-200/30 dark:hover:shadow-none transition-all duration-500"
    >
      {/* Action Buttons */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 flex flex-col gap-1 md:gap-2">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist();
          }}
          className={`p-2 md:p-2.5 rounded-lg md:rounded-xl backdrop-blur-md transition-all duration-500 ${
            isInWishlist 
              ? "bg-rose-500 text-white shadow-lg shadow-rose-200" 
              : "bg-white/80 dark:bg-stone-950/80 text-stone-400 hover:text-rose-500 hover:bg-white dark:hover:bg-stone-950 shadow-sm"
          }`}
        >
          <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isInWishlist ? "fill-current" : ""}`} />
        </button>

        {isOwner && (
          <button 
            onClick={handleDelete}
            className="p-2 md:p-2.5 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md text-stone-400 hover:text-primary hover:bg-white dark:hover:bg-stone-950 rounded-lg md:rounded-xl shadow-sm transition-all duration-500"
          >
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        )}
      </div>

      <Link to={`/book/${book.id}`} className="block relative aspect-[3/4] overflow-hidden m-2 md:m-3 rounded-lg md:rounded-[1.2rem]">
        <img
          src={book.images[0] || `https://picsum.photos/seed/${book.id}/400/600`}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-stone-900/80 dark:bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white shadow-lg uppercase tracking-widest">
          {t(`condition.${book.condition.replace("-", "_")}`)}
        </div>
      </Link>

      <div className="p-3 md:p-6 pt-1">
        <div className="space-y-1 mb-2 md:mb-4">
          <Link to={`/book/${book.id}`} className="block text-base md:text-xl font-black text-stone-900 dark:text-stone-50 hover:text-primary transition-colors line-clamp-1 tracking-tighter leading-tight">
            {book.title}
          </Link>
          <p className="text-[9px] md:text-xs text-stone-500 dark:text-stone-400 font-medium italic">
            {t("book.by") || "بواسطة"} {book.author}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-stone-100 dark:border-stone-800">
          <span className="text-base md:text-xl font-black text-primary tracking-tighter">
            {formatPrice(book.price)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
