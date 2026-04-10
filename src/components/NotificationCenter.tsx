import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch, getDocs } from "firebase/firestore";
import { db, auth } from "@/src/firebase";
import { AppNotification } from "@/src/types";
import { Bell, Check, Trash2, MessageSquare, ShoppingBag, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotificationCenter() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification)));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  const markAllAsRead = async () => {
    if (!auth.currentUser) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  const clearAll = async () => {
    if (!auth.currentUser) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
      batch.delete(doc(db, "notifications", n.id));
    });
    await batch.commit();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "order": return <ShoppingBag className="w-4 h-4 text-green-500" />;
      case "offer": return <Tag className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative group flex justify-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-primary dark:text-stone-400 dark:hover:text-primary hover:bg-primary/5 rounded-xl transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-stone-950 shadow-sm" />
          )}
        </button>
        <div className="absolute top-full mt-2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
          التنبيهات
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 md:w-96 bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-stone-900 dark:text-white uppercase tracking-tighter">
                {t("notifications.title")}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className="p-2 text-stone-400 hover:text-primary transition-colors"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAll}
                  className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 border-b border-stone-50 dark:border-stone-800 transition-colors relative group ${
                      !notification.read ? "bg-stone-50/50 dark:bg-stone-800/30" : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm font-black tracking-tight ${notification.read ? "text-stone-600 dark:text-stone-400" : "text-stone-900 dark:text-white"}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-500 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[8px] font-black text-stone-300 dark:text-stone-600 uppercase tracking-widest">
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-100 dark:border-stone-700 transition-all"
                        >
                          <Check className="w-3 h-3 text-primary" />
                        </button>
                      )}
                    </div>
                    {notification.link && (
                      <Link
                        to={notification.link}
                        onClick={() => {
                          markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                        className="absolute inset-0 z-0"
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8 text-stone-200 dark:text-stone-700" />
                  </div>
                  <p className="text-xs font-black text-stone-400 dark:text-stone-600 uppercase tracking-widest">
                    {t("notifications.none")}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
