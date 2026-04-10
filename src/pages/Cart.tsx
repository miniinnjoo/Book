import { useTranslation } from "react-i18next";
import { auth, db } from "@/src/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { CartItem } from "@/src/types";
import { ShoppingCart, Trash2, ArrowRight, Package, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { formatPrice } from "@/src/lib/utils";

export default function Cart() {
  const { t } = useTranslation();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const snap = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUserProfile(data);
        setShippingAddress(data.address || "");
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "carts"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
        setCartItems(items);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  const removeFromCart = async (id: string) => {
    try {
      await deleteDoc(doc(db, "carts", id));
      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;
    if (!shippingAddress.trim()) {
      alert(t("cart.address_required") || "يرجى إدخال عنوان الشحن أولاً");
      return;
    }
    setCheckoutLoading(true);
    try {
      // In a real app, this would integrate with Stripe for multiple items
      // For this demo, we'll process each item as a transaction
      for (const item of cartItems) {
        await addDoc(collection(db, "transactions"), {
          bookId: item.bookId,
          bookTitle: item.bookTitle,
          buyerId: user.uid,
          sellerId: item.sellerId,
          amount: item.price,
          commission: item.price * 0.01,
          shippingAddress: shippingAddress.trim(),
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        await deleteDoc(doc(db, "carts", item.id));
      }
      
      // Update user address if it was empty
      if (!userProfile?.address) {
        await updateDoc(doc(db, "users", user.uid), { address: shippingAddress.trim() });
      }
      
      alert(t("cart.success") || "تم إتمام الشراء بنجاح!");
      setCartItems([]);
      navigate("/profile?tab=purchases");
    } catch (error) {
      console.error("Checkout Error:", error);
      alert(t("cart.error") || "حدث خطأ أثناء إتمام الشراء");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const commission = subtotal * 0.01;
  const total = subtotal + commission;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="w-24 h-24 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mx-auto">
          <ShoppingCart className="w-12 h-12 text-stone-300" />
        </div>
        <h2 className="text-3xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">
          {t("nav.login_required") || "يرجى تسجيل الدخول"}
        </h2>
        <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm">
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-stone-900 dark:text-white tracking-tighter uppercase leading-none">
          {t("cart.title") || "سلة المشتريات"}
        </h1>
        <p className="text-xl text-stone-400 font-medium tracking-tight">
          {cartItems.length} {t("cart.items") || "عناصر في سلتك"}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 dark:bg-stone-900/50 rounded-[3rem] border border-stone-100 dark:border-stone-800 space-y-8">
          <div className="w-32 h-32 bg-white dark:bg-stone-900 rounded-full flex items-center justify-center mx-auto shadow-xl">
            <ShoppingCart className="w-16 h-16 text-stone-200" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">
              {t("cart.empty") || "سلتك فارغة حالياً"}
            </h2>
            <p className="text-stone-400 font-medium">{t("cart.empty_desc") || "ابدأ بتصفح الكتب وأضف ما يعجبك إلى السلة."}</p>
          </div>
          <Link to="/browse" className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
            {t("nav.browse")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 flex items-center gap-6 group hover:shadow-xl transition-all duration-500"
                >
                  <div className="w-24 h-32 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden flex-shrink-0">
                    <img 
                      src={`https://picsum.photos/seed/${item.bookId}/200/300`} 
                      alt={item.bookTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link to={`/book/${item.bookId}`} className="text-xl font-black text-stone-900 dark:text-white hover:text-primary transition-colors line-clamp-1 tracking-tighter">
                      {item.bookTitle}
                    </Link>
                    <p className="text-stone-400 text-sm font-medium">
                      {t("profile.offered_by") || "بواسطة البائع"}: <span className="text-stone-600 dark:text-stone-300">{item.sellerId.slice(0, 8)}...</span>
                    </p>
                    <div className="pt-2">
                      <span className="text-2xl font-black text-primary tracking-tighter">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-4 text-stone-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-stone-900 dark:bg-stone-950 rounded-[2.5rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              
              <h3 className="text-2xl font-black uppercase tracking-tighter relative z-10">
                {t("cart.summary") || "ملخص الطلب"}
              </h3>

              <div className="space-y-3 relative z-10">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">{t("profile.address") || "عنوان الشحن"}</label>
                <input 
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder={t("profile.address_placeholder") || "المدينة، الشارع، رقم البناية"}
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                />
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-stone-400 font-medium">
                  <span>{t("cart.subtotal") || "المجموع الفرعي"}</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-400 font-medium">
                  <span>{t("cart.commission") || "رسوم المنصة (1%)"}</span>
                  <span className="text-white">{formatPrice(commission)}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-lg font-black uppercase tracking-widest text-primary">
                    {t("cart.total") || "الإجمالي"}
                  </span>
                  <span className="text-4xl font-black tracking-tighter">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-6 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50 group"
              >
                {checkoutLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    {t("cart.checkout") || "إتمام الشراء"}
                  </>
                )}
              </button>

              <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t("features.secure_payments_title") || "دفع آمن ومحمي"}
              </div>
            </div>

            <div className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-black text-stone-900 dark:text-white uppercase tracking-tighter">
                    {t("features.global_reach_title") || "توصيل عالمي"}
                  </h4>
                  <p className="text-xs text-stone-400 font-medium">
                    {t("features.global_reach_desc") || "نشحن لأكثر من 15 دولة"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
