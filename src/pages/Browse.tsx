import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/src/firebase";
import { BookListing } from "@/src/types";
import BookCard from "@/src/components/BookCard";
import BookFilter from "@/src/components/BookFilter";
import { formatPrice, cn } from "@/src/lib/utils";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Browse() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<BookListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    language: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    isbn: "",
    publisher: "",
    year: "",
  });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, "books"), where("status", "==", "available"), orderBy("createdAt", "desc"));
      
      // Note: Complex queries in Firestore require indexes. 
      // For simplicity, we'll filter on the client side for this demo.
      const snap = await getDocs(q);
      let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookListing));

      // Client-side filtering
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        results = results.filter(b => 
          b.title.toLowerCase().includes(lowerQuery) || 
          b.author.toLowerCase().includes(lowerQuery) ||
          b.description.toLowerCase().includes(lowerQuery)
        );
      }

      if (filters.category) results = results.filter(b => b.category === filters.category);
      if (filters.language) results = results.filter(b => b.language === filters.language);
      if (filters.condition) results = results.filter(b => b.condition === filters.condition);
      if (filters.minPrice) results = results.filter(b => b.price >= Number(filters.minPrice));
      if (filters.maxPrice) results = results.filter(b => b.price <= Number(filters.maxPrice));
      if (filters.isbn) results = results.filter(b => b.isbn?.includes(filters.isbn));
      if (filters.publisher) results = results.filter(b => b.publisher?.toLowerCase().includes(filters.publisher.toLowerCase()));
      if (filters.year) results = results.filter(b => b.year === filters.year);

      setBooks(results);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, filters]);

  return (
    <div className="space-y-6 md:space-y-12 pb-24">
      <div className="relative p-4 md:p-10 bg-white dark:bg-stone-900 rounded-2xl md:rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-2xl shadow-stone-200/30 dark:shadow-none overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 blur-[80px] md:blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 -z-10 blur-[60px] md:blur-[80px]"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-10 relative z-10">
          <div className="space-y-1 md:space-y-4">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tighter text-stone-900 dark:text-stone-50 uppercase leading-none"
            >
              {t("nav.browse")}
            </motion.h1>
            <p className="text-xs md:text-xl text-stone-400 dark:text-stone-400 font-medium max-w-xl tracking-tight leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full max-w-xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 text-stone-400 group-focus-within:text-primary transition-all duration-500" />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 md:pl-16 pr-4 md:pr-8 py-3 md:py-5 bg-stone-50 dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-800 rounded-xl md:rounded-2xl focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all duration-500 shadow-xl shadow-stone-200/20 dark:shadow-none text-xs md:text-lg font-medium text-stone-900 dark:text-stone-50"
              />
            </div>
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden p-3 bg-stone-900 text-white rounded-xl shadow-lg shadow-stone-900/20"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-16">
        {/* Sidebar Filters */}
        <aside className={cn(
          "lg:col-span-1",
          !showMobileFilters && "hidden lg:block"
        )}>
          <div className="lg:sticky lg:top-32">
            <BookFilter 
              filters={filters} 
              setFilters={setFilters} 
              onClear={() => setFilters({ category: "", language: "", condition: "", minPrice: "", maxPrice: "", isbn: "", publisher: "", year: "" })} 
            />
          </div>
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-3 space-y-6 md:space-y-12">
          <div className="flex items-center justify-between px-2 md:px-4">
            <span className="text-[10px] md:text-sm font-black text-stone-400 uppercase tracking-[0.4em]">
              {books.length} {t("filter.no_results").split(' ')[1] || "نتائج وجدت"}
            </span>
            <div className="flex items-center gap-2 md:gap-4 p-1.5 md:p-2 bg-white dark:bg-stone-900 rounded-xl md:rounded-[1.5rem] shadow-sm border border-stone-200 dark:border-stone-800 transition-colors duration-500">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 ${viewMode === "grid" ? "bg-stone-900 dark:bg-stone-700 shadow-lg text-white" : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"}`}
              >
                <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 ${viewMode === "list" ? "bg-stone-900 dark:bg-stone-700 shadow-lg text-white" : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"}`}
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10" : "space-y-4 md:space-y-6"}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={viewMode === "grid" ? "aspect-[3/4] bg-white dark:bg-stone-800 rounded-2xl md:rounded-[3rem] animate-pulse border border-stone-100 dark:border-stone-700 shadow-sm" : "h-24 md:h-32 bg-white dark:bg-stone-800 rounded-xl md:rounded-[2rem] animate-pulse border border-stone-100 dark:border-stone-700 shadow-sm"}></div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {books.length > 0 ? (
                <motion.div 
                  layout
                  className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10" : "space-y-4 md:space-y-6"}
                >
                  {books.map((book) => (
                    viewMode === "grid" ? (
                      <BookCard key={book.id} book={book} />
                    ) : (
                      <motion.div
                        key={book.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white dark:bg-stone-800 rounded-xl md:rounded-2xl border border-stone-100 dark:border-stone-700 hover:shadow-xl hover:shadow-stone-200/30 dark:hover:shadow-none transition-all group"
                      >
                        <div className="w-16 h-24 md:w-20 md:h-28 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
                          <img src={book.images[0]} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0 text-left rtl:text-right">
                          <h3 className="text-sm md:text-lg font-black text-stone-900 dark:text-white tracking-tight line-clamp-1">{book.title}</h3>
                          <p className="text-stone-400 text-[10px] md:text-xs font-medium italic mb-1">{book.author}</p>
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className="text-sm md:text-base font-black text-primary tracking-tighter">{formatPrice(book.price)}</span>
                            <span className="px-1.5 py-0.5 bg-stone-50 dark:bg-stone-900 rounded-full text-[6px] md:text-[7px] font-black uppercase tracking-widest text-stone-400 border border-stone-100 dark:border-stone-700">
                              {t(`condition.${book.condition.replace("-", "_")}`)}
                            </span>
                          </div>
                        </div>
                        <Link to={`/book/${book.id}`} className="px-3 md:px-5 py-2 md:py-2.5 bg-stone-900 dark:bg-stone-700 text-white rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                          {t("book.view")}
                        </Link>
                      </motion.div>
                    )
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 md:py-40 text-center space-y-6 md:space-y-10 bg-white dark:bg-stone-900 rounded-[2rem] md:rounded-[4rem] border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/30 dark:shadow-none"
                >
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-stone-50 dark:bg-stone-800 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 md:mb-8 shadow-inner">
                    <Search className="w-10 h-10 md:w-16 md:h-16 text-stone-200 dark:text-stone-700" />
                  </div>
                  <div className="space-y-3 md:space-y-6">
                    <h3 className="text-2xl md:text-4xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">{t("filter.no_books")}</h3>
                    <p className="text-sm md:text-xl text-stone-400 dark:text-stone-500 max-w-xs md:max-w-md mx-auto font-medium leading-relaxed tracking-tight">
                      {t("filter.no_books_desc")}
                    </p>
                  </div>
                  <button 
                    onClick={() => setFilters({ category: "", language: "", condition: "", minPrice: "", maxPrice: "", isbn: "", publisher: "", year: "" })}
                    className="px-8 md:px-12 py-4 md:py-6 bg-primary text-white rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30"
                  >
                    {t("filter.clear")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
