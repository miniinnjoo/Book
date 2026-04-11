import { useTranslation } from "react-i18next";
import { auth, db } from "@/src/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc, addDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { BookListing, Transaction, UserProfile, Offer } from "@/src/types";
import BookCard from "@/src/components/BookCard";
import { User, Package, ShoppingBag, Settings, LogOut, Star, Clock, ShieldCheck, Heart, Check, X as CloseIcon, Phone, Mail, Camera, MessageSquare, TrendingUp, Tag, Truck, Grid, Share2, Bookmark, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { formatPrice, cn } from "@/src/lib/utils";
import { updateProfile } from "firebase/auth";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const [user] = useAuthState(auth);
  const { id: profileId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState<BookListing[]>([]);
  const [myPurchases, setMyPurchases] = useState<Transaction[]>([]);
  const [myWishlist, setMyWishlist] = useState<BookListing[]>([]);
  const [mySales, setMySales] = useState<Transaction[]>([]);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "purchases" | "wishlist" | "reviews" | "earnings" | "offers" | "dashboard">("listings");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["listings", "purchases", "wishlist", "reviews", "earnings", "offers", "dashboard"].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const targetUid = profileId || user?.uid;
  const isOwnProfile = !profileId || profileId === user?.uid;
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    address: "",
    photoURL: "",
    coverURL: "",
    phoneNumber: ""
  });
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    if (!targetUid) return;
    const collectionName = isOwnProfile ? "users" : "public_profiles";
    const docRef = doc(db, collectionName, targetUid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      setProfileData(data);
      if (isOwnProfile) {
        setEditForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          address: data.address || "",
          photoURL: data.photoURL || "",
          coverURL: data.coverURL || "",
          phoneNumber: data.phoneNumber || ""
        });
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetUid]);

  const handleUpdateProfile = async () => {
    if (!user || !editForm.displayName.trim()) return;
    setUpdating(true);
    try {
      // Update Auth Profile
      await updateProfile(user, { 
        displayName: editForm.displayName.trim(),
        photoURL: editForm.photoURL.trim()
      });
      
      // Update Firestore Profile
      const docRef = doc(db, "users", user.uid);
      const updateData = {
        displayName: editForm.displayName.trim(),
        bio: editForm.bio.trim(),
        address: editForm.address.trim(),
        photoURL: editForm.photoURL.trim(),
        coverURL: editForm.coverURL.trim(),
        phoneNumber: editForm.phoneNumber.trim()
      };
      await updateDoc(docRef, updateData);
      
      // Update Public Profile
      const publicRef = doc(db, "public_profiles", user.uid);
      await setDoc(publicRef, {
        uid: user.uid,
        displayName: updateData.displayName,
        photoURL: updateData.photoURL,
        bio: updateData.bio,
      }, { merge: true });
      
      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!targetUid) return;
      try {
        // Fetch listings
        const listingsQuery = query(collection(db, "books"), where("sellerId", "==", targetUid), orderBy("createdAt", "desc"));
        const listingsSnap = await getDocs(listingsQuery);
        setMyListings(listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookListing)));

          if (isOwnProfile) {
            // Fetch purchases
            const purchasesQuery = query(collection(db, "transactions"), where("buyerId", "==", targetUid), orderBy("createdAt", "desc"));
            const purchasesSnap = await getDocs(purchasesQuery);
            setMyPurchases(purchasesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));

            // Fetch sales for earnings
            const salesQuery = query(collection(db, "transactions"), where("sellerId", "==", targetUid), orderBy("createdAt", "desc"));
            const salesSnap = await getDocs(salesQuery);
            setMySales(salesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));

            // Fetch wishlist
            const wishlistQuery = query(collection(db, "wishlists"), where("userId", "==", targetUid));
            const wishlistSnap = await getDocs(wishlistQuery);
            const wishlistBookIds = wishlistSnap.docs.map(doc => doc.data().bookId);
            
            if (wishlistBookIds.length > 0) {
              const booksQuery = query(collection(db, "books"), where("__name__", "in", wishlistBookIds));
              const booksSnap = await getDocs(booksQuery);
              setMyWishlist(booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookListing)));
            } else {
              setMyWishlist([]);
            }

            // Fetch offers
            const sentOffersQuery = query(collection(db, "offers"), where("buyerId", "==", targetUid), orderBy("createdAt", "desc"));
            const sentOffersSnap = await getDocs(sentOffersQuery);
            setMyOffers(sentOffersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer)));

            const receivedOffersQuery = query(collection(db, "offers"), where("sellerId", "==", targetUid), orderBy("createdAt", "desc"));
            const receivedOffersSnap = await getDocs(receivedOffersQuery);
            setReceivedOffers(receivedOffersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer)));
          }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [targetUid, isOwnProfile]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const handleUpdateOrderStatus = async (transactionId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "transactions", transactionId), { status: newStatus });
      setMySales(prev => prev.map(s => s.id === transactionId ? { ...s, status: newStatus as any } : s));
      setMyPurchases(prev => prev.map(p => p.id === transactionId ? { ...p, status: newStatus as any } : p));
      
      // Notify buyer
      const transaction = [...mySales, ...myPurchases].find(t => t.id === transactionId);
      if (transaction) {
        await addDoc(collection(db, "notifications"), {
          userId: transaction.buyerId,
          type: "order",
          title: t("notifications.order_update") || "تحديث على طلبك",
          message: t("notifications.order_status_message", { title: transaction.bookTitle, status: newStatus }),
          link: `/profile?tab=purchases`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleOfferAction = async (offerId: string, action: "accepted" | "rejected") => {
    try {
      await updateDoc(doc(db, "offers", offerId), { status: action });
      setReceivedOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: action } : o));
      
      const offer = receivedOffers.find(o => o.id === offerId);
      if (offer) {
        // Notify buyer
        await addDoc(collection(db, "notifications"), {
          userId: offer.buyerId,
          type: "offer",
          title: action === "accepted" ? (t("notifications.offer_accepted") || "تم قبول عرضك") : (t("notifications.offer_rejected") || "تم رفض عرضك"),
          message: t("notifications.offer_action_message", { title: offer.bookTitle, action: action === "accepted" ? "قبول" : "رفض" }),
          link: action === "accepted" ? `/book/${offer.bookId}` : `/profile?tab=offers`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating offer status:", error);
    }
  };

  if (!targetUid) return null;

  const isVerified = profileData?.isEmailVerified && 
                     profileData?.isPhoneVerified && 
                     (profileData?.booksSold || 0) > 100 && 
                     (profileData?.rating || 0) > 4.5;

  return (
    <div className="space-y-12">
      {/* Instagram Style Header */}
      <div className="bg-white dark:bg-stone-900 md:rounded-[2.5rem] md:border md:border-stone-100 md:dark:border-stone-800 md:shadow-2xl md:shadow-stone-200/10 md:dark:shadow-none overflow-hidden">
        <div className="px-4 md:px-12 py-8 md:py-12">
          <div className="flex flex-col gap-8">
            {/* Top Row: Avatar and Stats */}
            <div className="flex items-center gap-6 md:gap-12">
              <div className="relative shrink-0">
                <div className="w-20 h-20 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-primary to-secondary">
                  <div className="w-full h-full rounded-full border-2 md:border-4 border-white dark:border-stone-900 overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img 
                      src={profileData?.photoURL || `https://ui-avatars.com/api/?name=${profileData?.displayName || user?.displayName || "User"}`} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {isVerified && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white border-2 md:border-4 border-white dark:border-stone-900">
                    <ShieldCheck className="w-3 h-3 md:w-6 md:h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex justify-around md:justify-start md:gap-16">
                <div className="text-center md:text-right">
                  <p className="text-lg md:text-2xl font-black text-stone-900 dark:text-white">{myListings.length}</p>
                  <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest">{t("profile.listings") || "الكتب"}</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-lg md:text-2xl font-black text-stone-900 dark:text-white">{profileData?.booksSold || 0}</p>
                  <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest">{t("profile.sales") || "المبيعات"}</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-lg md:text-2xl font-black text-stone-900 dark:text-white">{profileData?.rating || "0.0"}</p>
                  <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest">{t("profile.rating") || "التقييم"}</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                  {profileData?.displayName || (isOwnProfile ? user?.displayName : "Anonymous")}
                  {isVerified && <ShieldCheck className="w-5 h-5 text-blue-500 fill-current" />}
                </h1>
                {profileData?.bio && (
                  <p className="text-sm md:text-base text-stone-600 dark:text-stone-400 font-medium leading-relaxed whitespace-pre-wrap">
                    {profileData.bio}
                  </p>
                )}
                {profileData?.address && (
                  <p className="text-xs text-stone-400 font-medium flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {profileData.address}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {isOwnProfile ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex-1 md:flex-none px-6 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl font-bold text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                    >
                      {t("profile.edit")}
                    </button>
                    <button 
                      onClick={() => {
                        const url = window.location.href;
                        navigator.clipboard.writeText(url);
                        alert("تم نسخ رابط الملف الشخصي");
                      }}
                      className="flex-1 md:flex-none px-6 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl font-bold text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      {t("common.share") || "مشاركة"}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-10 h-10 flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-rose-500 rounded-xl hover:bg-rose-50 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate("/chat", { state: { sellerId: targetUid } })}
                      className="flex-1 md:flex-none px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      {t("book.contact_seller") || "تواصل مع البائع"}
                    </button>
                    <button 
                      className="w-10 h-10 flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black tracking-tighter text-stone-900 uppercase">{t("profile.edit")}</h2>
                  <button onClick={() => setIsEditing(false)} className="p-3 hover:bg-stone-100 rounded-2xl transition-colors">
                    <CloseIcon className="w-6 h-6 text-stone-400" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">{t("profile.display_name") || "الاسم"}</label>
                      <input 
                        type="text" 
                        value={editForm.displayName}
                        onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                        className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">{t("profile.address") || "عنوان الشحن"}</label>
                      <input 
                        type="text" 
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        placeholder={t("profile.address_placeholder") || "المدينة، الشارع، رقم البناية"}
                        className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">{t("profile.phone")}</label>
                      <input 
                        type="text" 
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                        className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">{t("profile.bio")}</label>
                    <textarea 
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      placeholder={t("profile.bio_placeholder")}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:border-primary font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">{t("profile.photo_url")}</label>
                    <label className="block w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700 transition-all text-center">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setEditForm({...editForm, photoURL: URL.createObjectURL(e.target.files[0])});
                          }
                        }}
                      />
                      <span className="text-stone-500 font-medium">{editForm.photoURL ? "✓ Image Selected" : "Upload Photo"}</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">{t("profile.cover_url")}</label>
                    <label className="block w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700 transition-all text-center">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setEditForm({...editForm, coverURL: URL.createObjectURL(e.target.files[0])});
                          }
                        }}
                      />
                      <span className="text-stone-500 font-medium">{editForm.coverURL ? "✓ Image Selected" : "Upload Cover"}</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="flex-1 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {updating ? t("common.loading") : t("profile.save")}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-5 bg-stone-100 text-stone-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-200 transition-all"
                  >
                    {t("profile.cancel")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tabs - Instagram Style */}
      <div className="space-y-6">
        <div className="flex items-center justify-around border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={() => setActiveTab("listings")}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
              activeTab === "listings" ? "text-primary" : "text-stone-400"
            )}
          >
            <Grid className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">{t("profile.listings")}</span>
            {activeTab === "listings" && (
              <motion.div layoutId="tab-indicator" className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
                activeTab === "dashboard" ? "text-primary" : "text-stone-400"
              )}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">{t("profile.dashboard")}</span>
              {activeTab === "dashboard" && (
                <motion.div layoutId="tab-indicator" className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("purchases")}
              className={cn(
                "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
                activeTab === "purchases" ? "text-primary" : "text-stone-400"
              )}
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">{t("profile.my_purchases")}</span>
              {activeTab === "purchases" && (
                <motion.div layoutId="tab-indicator" className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("earnings")}
              className={cn(
                "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
                activeTab === "earnings" ? "text-primary" : "text-stone-400"
              )}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">{t("profile.earnings")}</span>
              {activeTab === "earnings" && (
                <motion.div layoutId="tab-indicator" className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("offers")}
              className={cn(
                "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
                activeTab === "offers" ? "text-primary" : "text-stone-400"
              )}
            >
              <Tag className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">{t("profile.offers")}</span>
              {activeTab === "offers" && (
                <motion.div layoutId="tab-indicator" className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("wishlist")}
              className={cn(
                "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
                activeTab === "wishlist" ? "text-primary" : "text-stone-400"
              )}
            >
              <Bookmark className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">{t("nav.wishlist")}</span>
              {activeTab === "wishlist" && (
                <motion.div layoutId="tab-indicator" className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
              activeTab === "reviews" ? "text-primary" : "text-stone-400"
            )}
          >
            <Star className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">{t("profile.reviews")}</span>
            {activeTab === "reviews" && (
              <motion.div layoutId="tab-indicator" className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-1 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-stone-100 dark:bg-stone-800 animate-pulse"></div>
            ))}
          </div>
        ) : activeTab === "listings" ? (
          myListings.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:gap-8">
              {myListings.map((book) => (
                <div key={book.id} className="aspect-square relative group cursor-pointer overflow-hidden" onClick={() => navigate(`/book/${book.id}`)}>
                  <img src={book.images[0]} alt={book.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold">{book.wishlistCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold">{book.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-10 h-10 text-stone-400" />
              </div>
              <p className="text-stone-500 font-bold">{t("profile.no_listings")}</p>
              {isOwnProfile && (
                <button onClick={() => navigate("/sell")} className="text-primary font-bold text-sm">
                  {t("profile.start_selling")}
                </button>
              )}
            </div>
          )
        ) : activeTab === "wishlist" ? (
          myWishlist.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:gap-8">
              {myWishlist.map((book) => (
                <div key={book.id} className="aspect-square relative group cursor-pointer overflow-hidden" onClick={() => navigate(`/book/${book.id}`)}>
                  <img src={book.images[0]} alt={book.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto">
                <Bookmark className="w-10 h-10 text-stone-400" />
              </div>
              <p className="text-stone-500 font-bold">{t("profile.no_wishlist") || "قائمة الأمنيات فارغة"}</p>
            </div>
          )
        ) : activeTab === "dashboard" ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none space-y-2">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("profile.total_sales")}</p>
                <h4 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter">{mySales.length}</h4>
              </div>
              <div className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none space-y-2">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("profile.total_earnings")}</p>
                <h4 className="text-3xl font-black text-primary tracking-tighter">{formatPrice(mySales.reduce((acc, s) => acc + s.amount, 0))}</h4>
              </div>
              <div className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none space-y-2">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("profile.active_listings")}</p>
                <h4 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter">{myListings.length}</h4>
              </div>
              <div className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none space-y-2">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("profile.received_offers_count")}</p>
                <h4 className="text-3xl font-black text-secondary tracking-tighter">{receivedOffers.length}</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-10 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/10 space-y-8">
                <h3 className="text-xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">{t("profile.sales_performance")}</h3>
                <div className="h-64 flex items-end gap-4 px-4">
                  {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 space-y-3">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="w-full bg-primary/10 rounded-t-xl relative group"
                      >
                        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
                      </motion.div>
                      <p className="text-[8px] font-black text-stone-400 text-center uppercase tracking-widest">{t("profile.day")} {i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-10 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/10 space-y-8">
                <h3 className="text-xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">{t("profile.recent_activity")}</h3>
                <div className="space-y-6">
                  {mySales.slice(0, 3).map((sale) => (
                    <div key={sale.id} className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-stone-900 dark:text-white">{t("profile.sold_notification", { title: sale.bookTitle })}</p>
                        <p className="text-[10px] text-stone-400 font-medium">{new Date(sale.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm font-black text-primary">{formatPrice(sale.amount)}</p>
                    </div>
                  ))}
                  {receivedOffers.slice(0, 2).map((offer) => (
                    <div key={offer.id} className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-stone-900 dark:text-white">{t("profile.new_offer_notification", { title: offer.bookTitle })}</p>
                        <p className="text-[10px] text-stone-400 font-medium">{new Date(offer.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm font-black text-secondary">{formatPrice(offer.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "earnings" ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none space-y-4">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("profile.total_balance")}</p>
                <h4 className="text-4xl font-black text-primary tracking-tighter">
                  {formatPrice(mySales.reduce((acc, sale) => acc + sale.amount, 0))}
                </h4>
              </div>
              <div className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none space-y-4">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("profile.books_sold_count")}</p>
                <h4 className="text-4xl font-black text-stone-900 dark:text-white tracking-tighter">
                  {mySales.length}
                </h4>
              </div>
              <div className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none space-y-4">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("profile.commission_paid")}</p>
                <h4 className="text-4xl font-black text-stone-400 tracking-tighter">
                  {formatPrice(mySales.reduce((acc, sale) => acc + sale.amount, 0) * 0.01)}
                </h4>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">{t("profile.recent_sales")}</h3>
              {mySales.length > 0 ? (
                <div className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 overflow-hidden">
                  <table className="w-full text-left rtl:text-right">
                    <thead className="bg-stone-50 dark:bg-stone-800/50">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("sell.book_title")}</th>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("admin.status")}</th>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("profile.address") || "العنوان"}</th>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">{t("admin.date")}</th>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right rtl:text-left">{t("book.price")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                      {mySales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                          <td className="px-8 py-6 font-bold text-stone-900 dark:text-white">{sale.bookTitle}</td>
                          <td className="px-8 py-6">
                            <select 
                              value={sale.status}
                              onChange={(e) => handleUpdateOrderStatus(sale.id, e.target.value)}
                              className="px-3 py-1 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-full text-[8px] font-black uppercase tracking-widest border border-stone-100 dark:border-stone-700 focus:outline-none focus:border-primary"
                            >
                              <option value="pending">Pending</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-8 py-6 text-xs text-stone-500 max-w-[200px] truncate">
                            {sale.shippingAddress || "N/A"}
                          </td>
                          <td className="px-8 py-6 text-xs text-stone-500">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 text-right rtl:text-left font-black text-stone-900 dark:text-white">
                            {formatPrice(sale.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center bg-stone-50/30 rounded-[3rem] border border-dashed border-stone-200">
                  <p className="text-stone-400 font-medium">{t("profile.no_sales")}</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "purchases" ? (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">{t("profile.my_purchases")}</h3>
            {myPurchases.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {myPurchases.map((purchase) => (
                  <div key={purchase.id} className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-24 bg-stone-100 rounded-2xl flex-shrink-0 overflow-hidden shadow-inner">
                        <ShoppingBag className="w-10 h-10 text-stone-200 m-auto mt-7" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">{purchase.bookTitle}</h4>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                            purchase.status === "completed" ? "bg-green-50 text-green-600 border-green-100" :
                            purchase.status === "shipped" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            purchase.status === "delivered" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-stone-50 text-stone-400 border-stone-100"
                          )}>
                            {purchase.status}
                          </span>
                          {purchase.shippingAddress && (
                            <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {purchase.shippingAddress}
                            </span>
                          )}
                          <span className="text-xs text-stone-400 font-medium">{new Date(purchase.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right rtl:text-left">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t("book.price")}</p>
                        <p className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter">{formatPrice(purchase.amount)}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/book/${purchase.bookId}`)}
                        className="p-4 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-primary rounded-2xl transition-all"
                      >
                        <Package className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-stone-50/30 rounded-[3rem] border border-dashed border-stone-200">
                <p className="text-stone-400 font-medium">{t("profile.no_purchases")}</p>
              </div>
            )}
          </div>
        ) : activeTab === "offers" ? (
          <div className="space-y-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">{t("profile.received_offers") || "العروض المستلمة"}</h3>
              {receivedOffers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {receivedOffers.map((offer) => (
                    <div key={offer.id} className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
                          <Tag className="w-8 h-8 text-stone-200" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-stone-900 dark:text-white tracking-tight">{offer.bookTitle}</h4>
                          <p className="text-xs text-stone-400 font-medium">{t("profile.offered_by")}: {offer.buyerId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right rtl:text-left">
                          <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t("profile.offer_amount")}</p>
                          <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(offer.amount)}</p>
                        </div>
                        {offer.status === "pending" ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOfferAction(offer.id, "accepted")}
                              className="px-6 py-3 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                            >
                              {t("common.accept") || "قبول"}
                            </button>
                            <button 
                              onClick={() => handleOfferAction(offer.id, "rejected")}
                              className="px-6 py-3 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-200 transition-all"
                            >
                              {t("common.reject") || "رفض"}
                            </button>
                          </div>
                        ) : (
                          <span className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                            offer.status === "accepted" ? "bg-green-50 text-green-600 border-green-100" : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                            {offer.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-stone-50/30 rounded-[3rem] border border-dashed border-stone-200">
                  <p className="text-stone-400 font-medium">{t("profile.no_received_offers")}</p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">{t("profile.sent_offers") || "العروض المرسلة"}</h3>
              {myOffers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {myOffers.map((offer) => (
                    <div key={offer.id} className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
                          <TrendingUp className="w-8 h-8 text-stone-200" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-stone-900 dark:text-white tracking-tight">{offer.bookTitle}</h4>
                          <p className="text-xs text-stone-400 font-medium">{new Date(offer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right rtl:text-left">
                          <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t("profile.your_offer")}</p>
                          <p className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter">{formatPrice(offer.amount)}</p>
                        </div>
                        <span className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                          offer.status === "accepted" ? "bg-green-50 text-green-600 border-green-100" :
                          offer.status === "rejected" ? "bg-rose-50 text-rose-600 border-rose-100" :
                          "bg-stone-50 text-stone-400 border-stone-100"
                        )}>
                          {offer.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-stone-50/30 rounded-[3rem] border border-dashed border-stone-200">
                  <p className="text-stone-400 font-medium">{t("profile.no_sent_offers")}</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "reviews" ? (
          <div className="max-w-4xl space-y-12">
            {!isOwnProfile && user && (
              <ReviewForm sellerId={targetUid} onSuccess={fetchProfile} />
            )}
            <ReviewList sellerId={targetUid} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
