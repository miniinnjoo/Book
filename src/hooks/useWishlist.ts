import { useState, useEffect } from "react";
import { db, auth } from "@/src/firebase";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { WishlistItem } from "@/src/types";

export function useWishlist(bookId?: string) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser || !bookId) {
      setIsInWishlist(false);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "wishlists"),
      where("userId", "==", auth.currentUser.uid),
      where("bookId", "==", bookId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setIsInWishlist(true);
        setWishlistItemId(snapshot.docs[0].id);
      } else {
        setIsInWishlist(false);
        setWishlistItemId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookId]);

  const toggleWishlist = async () => {
    if (!auth.currentUser || !bookId) return;

    try {
      if (isInWishlist && wishlistItemId) {
        await deleteDoc(doc(db, "wishlists", wishlistItemId));
      } else {
        await addDoc(collection(db, "wishlists"), {
          userId: auth.currentUser.uid,
          bookId: bookId,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  return { isInWishlist, toggleWishlist, loading };
}
