import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, Send, AlertCircle } from "lucide-react";
import { auth, db } from "@/src/firebase";
import { collection, addDoc, doc, getDoc, updateDoc, increment, query, where, getDocs, limit } from "firebase/firestore";
import { motion } from "motion/react";

interface ReviewFormProps {
  sellerId: string;
  onSuccess: () => void;
}

export default function ReviewForm({ sellerId, onSuccess }: ReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTransaction = async () => {
      if (!auth.currentUser || auth.currentUser.uid === sellerId) {
        setCanReview(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, "transactions"),
          where("buyerId", "==", auth.currentUser.uid),
          where("sellerId", "==", sellerId),
          where("status", "==", "completed"),
          limit(1)
        );
        
        const snap = await getDocs(q);
        setCanReview(!snap.empty);
      } catch (error) {
        console.error("Error checking transaction:", error);
        setCanReview(false);
      }
    };
    
    checkTransaction();
  }, [sellerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !comment.trim()) return;

    setSubmitting(true);
    try {
      // Add Review
      await addDoc(collection(db, "reviews"), {
        sellerId,
        reviewerId: auth.currentUser.uid,
        reviewerName: auth.currentUser?.displayName || "Anonymous",
        reviewerPhoto: auth.currentUser.photoURL || "",
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString()
      });

      // Update Seller Stats
      const sellerRef = doc(db, "users", sellerId);
      const sellerSnap = await getDoc(sellerRef);
      if (sellerSnap.exists()) {
        const data = sellerSnap.data();
        const currentRating = data.rating || 0;
        const currentCount = data.reviewCount || 0;
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;

        await updateDoc(sellerRef, {
          rating: Number(newRating.toFixed(1)),
          reviewCount: increment(1)
        });
      }

      setComment("");
      setRating(5);
      onSuccess();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!auth.currentUser) return null;
  if (auth.currentUser.uid === sellerId) return null;

  if (canReview === null) {
    return (
      <div className="p-8 bg-stone-50 rounded-[2.5rem] border border-stone-100 animate-pulse">
        <div className="h-6 w-48 bg-stone-200 rounded-lg mb-6"></div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-8 h-8 bg-stone-200 rounded-lg"></div>)}
        </div>
        <div className="h-24 w-full bg-stone-200 rounded-2xl"></div>
      </div>
    );
  }

  if (canReview === false) {
    return (
      <div className="p-8 bg-stone-50 rounded-[2.5rem] border border-stone-100 flex items-center gap-4 text-stone-500">
        <AlertCircle className="w-6 h-6 text-stone-400" />
        <p className="text-sm font-medium">
          {t("profile.review_restriction") || "يمكنك تقييم البائع فقط بعد إتمام عملية شراء ناجحة منه."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-stone-50 rounded-[2.5rem] border border-stone-100 space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-black text-stone-900 tracking-tight uppercase">{t("profile.leave_review") || "اترك تقييماً"}</h3>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star 
                className={`w-8 h-8 ${
                  (hover || rating) >= star 
                    ? "fill-secondary text-secondary" 
                    : "text-stone-300"
                } transition-colors`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("profile.review_placeholder") || "اكتب رأيك في البائع..."}
          rows={3}
          className="w-full px-6 py-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:border-primary font-medium resize-none"
          required
        />
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t("profile.submit_review") || "إرسال التقييم"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
