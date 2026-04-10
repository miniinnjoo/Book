import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/src/firebase";
import { BookListing, UserProfile } from "@/src/types";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/src/lib/utils";
import { MapPin, User, ShieldCheck, MessageSquare, CreditCard, ArrowLeft, Star, Clock, Heart, Edit3, TrendingUp, Zap, X, Loader2, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { loadStripe } from "@stripe/stripe-js";
import { useWishlist } from "@/src/hooks/useWishlist";

import SocialShare from "@/src/components/SocialShare";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export default function BookDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookListing | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist(id);

  useEffect(() => {
    const checkCart = async () => {
      if (!auth.currentUser || !id) return;
      const q = query(
        collection(db, "carts"),
        where("userId", "==", auth.currentUser.uid),
        where("bookId", "==", id)
      );
      const snap = await getDocs(q);
      setIsInCart(!snap.empty);
    };
    checkCart();
  }, [id, auth.currentUser]);

  const handleAddToCart = async () => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    if (!book || isInCart) return;

    setCartLoading(true);
    try {
      await addDoc(collection(db, "carts"), {
        userId: auth.currentUser.uid,
        bookId: book.id,
        bookTitle: book.title,
        price: book.price,
        sellerId: book.sellerId,
        createdAt: new Date().toISOString(),
      });
      setIsInCart(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const bookSnap = await getDoc(doc(db, "books", id));
        if (bookSnap.exists()) {
          const bookData = { id: bookSnap.id, ...bookSnap.data() } as BookListing;
          setBook(bookData);
          
          const sellerSnap = await getDoc(doc(db, "public_profiles", bookData.sellerId));
          if (sellerSnap.exists()) {
            setSeller(sellerSnap.data() as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    if (!book) return;

    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(book.price * 100),
          bookId: book.id,
          buyerId: auth.currentUser.uid,
          sellerId: book.sellerId,
        }),
      });

      const { clientSecret } = await response.json();
      // In a real app, you'd redirect to a Stripe Checkout page or open a modal
      // For this demo, we'll simulate a successful payment
      alert("Payment simulation: In a real app, this would open Stripe Checkout. Commission of 1% will be deducted.");
      
      // Create transaction record
      await addDoc(collection(db, "transactions"), {
        bookId: book.id,
        bookTitle: book.title,
        buyerId: auth.currentUser.uid,
        sellerId: book.sellerId,
        amount: book.price,
        commission: book.price * 0.01,
        status: "completed",
        createdAt: new Date().toISOString(),
      });

      navigate("/profile");
    } catch (error) {
      console.error("Checkout Error:", error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    if (!book) return;

    try {
      // Check if chat already exists
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", auth.currentUser.uid),
        where("bookId", "==", book.id)
      );
      const snap = await getDocs(q);
      
      let chatId;
      if (snap.empty) {
        const newChat = await addDoc(collection(db, "chats"), {
          participants: [auth.currentUser.uid, book.sellerId],
          bookId: book.id,
          updatedAt: new Date().toISOString(),
        });
        chatId = newChat.id;
      } else {
        chatId = snap.docs[0].id;
      }
      navigate(`/chat?id=${chatId}`);
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  const handleMakeOffer = async () => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    if (!book || !offerAmount) return;

    setOfferLoading(true);
    try {
      await addDoc(collection(db, "offers"), {
        bookId: book.id,
        bookTitle: book.title,
        buyerId: auth.currentUser.uid,
        sellerId: book.sellerId,
        amount: Number(offerAmount),
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Create notification for seller
      await addDoc(collection(db, "notifications"), {
        userId: book.sellerId,
        type: "offer",
        title: t("notifications.new_offer") || "عرض سعر جديد",
        message: t("notifications.offer_message", { title: book.title, amount: formatPrice(Number(offerAmount)) }),
        link: `/profile?tab=offers`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      setIsOfferModalOpen(false);
      setOfferAmount("");
      alert(t("book.offer_sent") || "تم إرسال العرض بنجاح");
    } catch (error) {
      console.error("Error making offer:", error);
    } finally {
      setOfferLoading(false);
    }
  };

  if (loading) return <div className="py-24 text-center font-black uppercase tracking-widest text-stone-400">{t("common.loading")}</div>;
  if (!book) return <div className="py-24 text-center">Book not found.</div>;

  return (
    <div className="space-y-6 md:space-y-12 pb-24">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 md:gap-3 text-stone-400 hover:text-primary transition-colors font-black text-[10px] md:text-xs uppercase tracking-[0.2em]"
      >
        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
        {t("nav.browse")}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        {/* Left: Images */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3 md:space-y-6"
        >
          <div className="aspect-[3/4] rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/50 dark:shadow-none">
            <img
              src={book.images[0] || "https://picsum.photos/seed/book/800/1200"}
              alt={book.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {book.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-lg md:rounded-2xl overflow-hidden border-2 border-stone-100 dark:border-stone-800 cursor-pointer hover:border-primary transition-all">
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 md:space-y-10"
        >
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 md:px-3 py-0.5 md:py-1 bg-stone-50 dark:bg-stone-800 text-stone-400 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] border border-stone-100 dark:border-stone-700">
                {t(`category.${book.category.toLowerCase()}`)}
              </span>
              <span className="px-2 md:px-3 py-0.5 md:py-1 bg-primary text-white rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                {t(`condition.${book.condition.replace("-", "_")}`)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tighter text-stone-900 dark:text-white leading-[1] flex-1">
                {book.title}
              </h1>
              {auth.currentUser?.uid === book.sellerId && (
                <button
                  onClick={() => navigate(`/book/${book.id}/edit`)}
                  className="p-2 md:p-3 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white rounded-lg md:rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>
            <p className="text-base md:text-xl text-stone-400 font-medium italic">
              {t("book.by") || "بواسطة"} {book.author}
            </p>
          </div>

          <div className="flex items-center justify-between p-6 md:p-8 bg-white dark:bg-stone-900 rounded-2xl md:rounded-[2rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/10 dark:shadow-none">
            <div className="space-y-1">
              <p className="text-[8px] md:text-[9px] font-black text-stone-400 uppercase tracking-[0.3em]">{t("filter.price")}</p>
              <p className="text-2xl md:text-4xl font-black text-primary tracking-tighter">{formatPrice(book.price)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {book.isbn && (
              <div className="space-y-1">
                <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.3em]">ISBN</p>
                <p className="text-xs font-black text-stone-900 dark:text-white">{book.isbn}</p>
              </div>
            )}
            {book.publisher && (
              <div className="space-y-1">
                <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.3em]">{t("sell.publisher") || "الناشر"}</p>
                <p className="text-xs font-black text-stone-900 dark:text-white">{book.publisher}</p>
              </div>
            )}
            {book.year && (
              <div className="space-y-1">
                <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.3em]">{t("sell.year") || "السنة"}</p>
                <p className="text-xs font-black text-stone-900 dark:text-white">{book.year}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 md:space-y-3">
            <h3 className="text-[8px] md:text-[9px] font-black text-stone-400 uppercase tracking-[0.3em]">{t("book.description") || "الوصف"}</h3>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-sm md:text-lg font-medium">
              {book.description}
            </p>
          </div>

          <SocialShare title={book.title} url={window.location.href} />

          {/* Seller Card */}
          <Link 
            to={`/profile/${book.sellerId}`}
            className="p-6 md:p-8 bg-stone-50 dark:bg-stone-900 rounded-2xl md:rounded-[2rem] border border-stone-100 dark:border-stone-800 flex items-center justify-between group hover:border-primary/20 transition-all duration-500"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative">
                <img 
                  src={seller?.photoURL || `https://ui-avatars.com/api/?name=${seller?.displayName}`} 
                  alt="" 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white dark:border-stone-800 shadow-xl"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 bg-green-500 border-2 md:border-4 border-stone-50 dark:border-stone-900 rounded-full"></div>
              </div>
              <div>
                <p className="text-[8px] md:text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] mb-0.5 md:mb-1">{t("book.seller") || "البائع"}</p>
                <p className="text-lg md:text-xl font-black text-stone-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">{seller?.displayName || "Anonymous"}</p>
                <div className="flex items-center gap-1 text-secondary">
                  <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                  <span className="text-[10px] md:text-xs font-black tracking-widest">
                    {seller?.rating || "0.0"} ({seller?.reviewCount || 0} {t("profile.reviews") || "التقييمات"})
                  </span>
                </div>
              </div>
            </div>
            <div 
              className="p-4 md:p-5 bg-white dark:bg-stone-800 text-primary rounded-xl md:rounded-2xl border-2 border-stone-100 dark:border-stone-700 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xl shadow-stone-200/50 dark:shadow-none"
            >
              <User className="w-6 h-6 md:w-7 md:h-7" />
            </div>
          </Link>
        </motion.div>
      </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-12 bg-white dark:bg-stone-900 rounded-[2rem] md:rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            
            <div className="space-y-2 md:space-y-4 text-center lg:text-left relative z-10">
              <h3 className="text-2xl md:text-4xl font-black text-stone-900 dark:text-white tracking-tighter leading-none">{t("book.ready_to_buy") || "جاهز للشراء؟"}</h3>
              <p className="text-sm md:text-lg text-stone-500 dark:text-stone-400 font-medium max-w-xl leading-relaxed">
                {t("book.secure_copy") || "احصل على نسختك من"} <span className="text-primary font-black">"{book.title}"</span> {t("book.now") || "الآن"}. 
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full lg:w-auto relative z-10">
              <button
                onClick={toggleWishlist}
                className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all duration-500 ${
                  isInWishlist 
                    ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-500 shadow-xl shadow-rose-200/50" 
                    : "bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-300 hover:border-rose-500 hover:text-rose-500 hover:shadow-xl hover:shadow-rose-200/50"
                }`}
              >
                <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isInWishlist ? "fill-current" : ""}`} />
              </button>
              
              <div className="flex flex-col gap-2 md:gap-3 w-full sm:w-auto">
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || book.sellerId === auth.currentUser?.uid}
                  className="px-6 md:px-10 py-4 md:py-5 bg-primary text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-primary/90 transition-all duration-500 flex items-center justify-center gap-3 md:gap-4 shadow-xl shadow-primary/20 disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:shadow-none group"
                >
                  <Zap className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                  {t("book.buy")} — {formatPrice(book.price)}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || isInCart || book.sellerId === auth.currentUser?.uid}
                  className="px-6 md:px-10 py-4 md:py-5 bg-white dark:bg-stone-800 text-primary border-2 border-primary rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-primary/5 transition-all duration-500 flex items-center justify-center gap-3 md:gap-4 shadow-xl shadow-primary/5 disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  {isInCart ? t("book.already_in_cart") : t("book.add_to_cart")}
                </button>
                
                <div className="flex gap-2 md:gap-3">
                  <button
                    onClick={handleContactSeller}
                    disabled={book.sellerId === auth.currentUser?.uid}
                    className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-stone-800 text-stone-900 dark:text-white border-2 border-stone-100 dark:border-stone-700 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:border-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                    {t("book.message") || "مراسلة"}
                  </button>
                  <button
                    onClick={() => setIsOfferModalOpen(true)}
                    disabled={book.sellerId === auth.currentUser?.uid}
                    className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-secondary text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                    {t("book.offer") || "عرض"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
      {/* Offer Modal */}
      <AnimatePresence>
        {isOfferModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">{t("book.make_offer") || "تقديم عرض"}</h2>
                    <p className="text-xs font-medium text-stone-400">{t("book.original_price")}: {formatPrice(book.price)}</p>
                  </div>
                  <button 
                    onClick={() => setIsOfferModalOpen(false)}
                    className="p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6 text-stone-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{t("book.offer_amount") || "قيمة العرض"}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all font-black text-lg"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleMakeOffer}
                  disabled={offerLoading || !offerAmount}
                  className="w-full py-5 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {offerLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                  {t("book.send_offer") || "إرسال العرض"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
