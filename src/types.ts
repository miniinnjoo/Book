export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  coverURL?: string;
  bio?: string;
  address?: string;
  phoneNumber?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  booksSold?: number;
  role: "user" | "admin";
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
}

export interface BookListing {
  id: string;
  sellerId: string;
  title: string;
  author: string;
  category: string;
  language: string;
  condition: "new" | "like-new" | "good" | "acceptable";
  price: number;
  images: string[];
  description: string;
  isbn?: string;
  publisher?: string;
  year?: string;
  status: "available" | "sold" | "pending";
  createdAt: string;
  isFeatured?: boolean;
}

export interface Transaction {
  id: string;
  bookId: string;
  bookTitle?: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  commission: number;
  shippingAddress?: string;
  status: "pending" | "completed" | "cancelled" | "shipped" | "delivered";
  paymentIntentId?: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  bookId: string;
  bookTitle?: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  price: number;
  sellerId: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  bookId: string;
  lastMessage?: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: "message" | "order" | "offer" | "review" | "system";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  sellerId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto: string;
  rating: number;
  comment: string;
  createdAt: string;
}
