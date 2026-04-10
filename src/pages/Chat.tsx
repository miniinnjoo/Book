import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/src/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, orderBy, onSnapshot, addDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ChatRoom, ChatMessage, UserProfile, BookListing } from "@/src/types";
import { Send, ArrowLeft, MoreVertical, BookOpen, User, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatPrice } from "@/src/lib/utils";
import { useTranslation } from "react-i18next";
import React from "react";

export default function Chat() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const chatId = searchParams.get("id");
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [book, setBook] = useState<BookListing | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const handleStartChat = async () => {
      const sellerId = location.state?.sellerId;
      const bookId = location.state?.bookId;

      if (sellerId && sellerId !== user.uid) {
        // Check if chat exists
        const q = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid)
        );
        const snap = await getDocs(q);
        const existingChat = snap.docs.find(doc => {
          const data = doc.data() as ChatRoom;
          return data.participants.includes(sellerId) && (!bookId || data.bookId === bookId);
        });

        if (existingChat) {
          navigate(`/chat?id=${existingChat.id}`, { replace: true });
        } else {
          // Create new chat
          const newChatRef = doc(collection(db, "chats"));
          await setDoc(newChatRef, {
            id: newChatRef.id,
            participants: [user.uid, sellerId],
            bookId: bookId || null,
            lastMessage: "",
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });
          navigate(`/chat?id=${newChatRef.id}`, { replace: true });
        }
      }
    };

    handleStartChat();

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const chatList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
      setChats(chatList);
      setLoading(false);
      
      if (chatId) {
        const current = chatList.find(c => c.id === chatId);
        if (current) setActiveChat(current);
      }
    });

    return () => unsubscribe();
  }, [user, chatId, location.state]);

  useEffect(() => {
    if (!activeChat || !user) return;

    const otherId = activeChat.participants.find(p => p !== user.uid);
    if (otherId) {
      getDoc(doc(db, "users", otherId)).then(snap => {
        if (snap.exists()) setOtherUser(snap.data() as UserProfile);
      });
    }

    getDoc(doc(db, "books", activeChat.bookId)).then(snap => {
      if (snap.exists()) setBook({ id: snap.id, ...snap.data() } as BookListing);
    });

    const q = query(
      collection(db, "chats", activeChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [activeChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;

    const text = newMessage;
    setNewMessage("");

    try {
      await addDoc(collection(db, "chats", activeChat.id, "messages"), {
        chatId: activeChat.id,
        senderId: user.uid,
        text,
        createdAt: new Date().toISOString(),
      });

      // Update chat last message
      await addDoc(collection(db, "notifications"), {
        userId: activeChat.participants.find(p => p !== user.uid),
        type: "message",
        title: t("notifications.new_message", { name: user.displayName || "Someone" }),
        message: text.slice(0, 50),
        link: `/chat?id=${activeChat.id}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) return <div className="py-24 text-center font-black uppercase tracking-widest text-stone-400">{t("common.loading")}</div>;

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-8">
      {/* Chat List */}
      <aside className="w-80 hidden md:flex flex-col bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-2xl shadow-stone-200/20">
        <div className="p-8 border-b border-stone-50">
          <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">{t("chat.title")}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => navigate(`/chat?id=${chat.id}`)}
              className={`w-full p-8 flex items-center gap-4 hover:bg-stone-50 transition-all duration-300 border-b border-stone-50 group ${
                activeChat?.id === chat.id ? "bg-stone-50" : ""
              }`}
            >
              <div className="w-14 h-14 bg-stone-100 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform" />
              <div className="text-left rtl:text-right overflow-hidden">
                <p className="font-black text-stone-900 tracking-tight truncate">Chat Room</p>
                <p className="text-xs font-medium text-stone-400 truncate">{chat.lastMessage || t("chat.no_chats")}</p>
              </div>
            </button>
          ))}
          {chats.length === 0 && (
            <div className="p-12 text-center text-stone-400 font-black uppercase tracking-widest text-xs">
              {t("chat.no_chats")}
            </div>
          )}
        </div>
      </aside>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-2xl shadow-stone-200/40">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-8 border-b border-stone-50 flex items-center justify-between bg-stone-50/30">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={otherUser?.photoURL || `https://ui-avatars.com/api/?name=${otherUser?.displayName}`} 
                    alt="" 
                    className="w-12 h-12 rounded-2xl shadow-sm border-2 border-white"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="font-black text-stone-900 tracking-tight text-lg">{otherUser?.displayName || "Loading..."}</p>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{t("chat.active_now")}</p>
                </div>
              </div>
              
              {book && (
                <div className="hidden sm:flex items-center gap-4 px-5 py-3 bg-white rounded-[1.5rem] border border-stone-100 shadow-sm hover:border-primary transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-stone-100 rounded-xl overflow-hidden shadow-inner">
                    <img src={book.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left rtl:text-right">
                    <p className="text-xs font-black text-stone-900 line-clamp-1 tracking-tight">{book.title}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{formatPrice(book.price)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-stone-50/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.uid ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-5 rounded-[1.5rem] text-sm font-medium shadow-sm ${
                      msg.senderId === user?.uid
                        ? "bg-primary text-white rounded-tr-none shadow-primary/20"
                        : "bg-white text-stone-900 rounded-tl-none border border-stone-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-8 border-t border-stone-50 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t("chat.placeholder")}
                  className="w-full pl-8 pr-20 py-5 bg-stone-50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8">
            <div className="w-32 h-32 bg-stone-50 rounded-[2.5rem] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] animate-pulse"></div>
              <MessageSquare className="w-16 h-16 text-stone-200 relative z-10" />
            </div>
            <div className="space-y-4 max-w-xs">
              <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tighter">{t("chat.inbox")}</h3>
              <p className="text-stone-500 font-medium leading-relaxed">{t("chat.select_chat")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
