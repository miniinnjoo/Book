import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, MessageSquare, Clock } from "lucide-react";
import { db } from "@/src/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Review } from "@/src/types";
import { motion } from "motion/react";

interface ReviewListProps {
  sellerId: string;
}

export default function ReviewList({ sellerId }: ReviewListProps) {
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, "reviews"),
          where("sellerId", "==", sellerId),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-stone-50 rounded-[2rem] animate-pulse border border-stone-100" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-20 text-center space-y-6 bg-stone-50/30 rounded-[3rem] border border-dashed border-stone-200">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <MessageSquare className="w-8 h-8 text-stone-200" />
        </div>
        <p className="text-stone-500 font-medium">{t("profile.no_reviews") || "لا يوجد تقييمات لهذا البائع بعد."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review, i) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/30 transition-all duration-500"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img 
                src={review.reviewerPhoto || `https://ui-avatars.com/api/?name=${review.reviewerName}`} 
                alt={review.reviewerName}
                className="w-12 h-12 rounded-xl object-cover shadow-md"
              />
              <div>
                <h4 className="font-black text-stone-900 tracking-tight">{review.reviewerName}</h4>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < review.rating ? "fill-secondary text-secondary" : "text-stone-200"}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-stone-400 text-[10px] font-black uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              {new Date(review.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
            </div>
          </div>
          <p className="text-stone-600 font-medium leading-relaxed italic">
            "{review.comment}"
          </p>
        </motion.div>
      ))}
    </div>
  );
}
