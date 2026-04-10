import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, User, BookOpen, Share2, MessageSquare, Heart } from "lucide-react";

const POSTS = [
  {
    id: "1",
    title: "كيف تختار كتابك القادم؟ دليل شامل للمبتدئين",
    content: `
      <p>اختيار الكتاب القادم قد يكون تجربة محيرة، خاصة مع وجود ملايين العناوين المتاحة. إليك بعض النصائح التي ستساعدك في اتخاذ القرار الصحيح:</p>
      
      <h2>1. حدد اهتماماتك الحالية</h2>
      <p>هل تبحث عن الهروب من الواقع في رواية خيالية؟ أم تريد تعلم مهارة جديدة في تطوير الذات؟ تحديد "لماذا" تريد القراءة الآن سيقلص خياراتك بشكل كبير.</p>
      
      <h2>2. اقرأ المراجعات بذكاء</h2>
      <p>لا تعتمد فقط على عدد النجوم. اقرأ المراجعات التي تشرح "لماذا" أعجبهم الكتاب أو لم يعجبهم. ابحث عن مراجعين يشاركونك نفس الذوق الأدبي.</p>
      
      <h2>3. قاعدة الـ 50 صفحة</h2>
      <p>الحياة قصيرة جداً لقراءة كتب لا تستمتع بها. إذا وصلت للصفحة 50 ولم تجد نفسك منجذباً للكتاب، فلا بأس بتركه والبحث عن غيره.</p>
      
      <blockquote>"الكتاب الجيد هو الذي يجعلك تشعر بأنك تعيش حياة أخرى بجانب حياتك."</blockquote>
      
      <h2>4. استكشف تصنيفات جديدة</h2>
      <p>أحياناً نجد أفضل الكتب في أماكن لم نتوقعها. جرب قراءة كتاب في تصنيف لم تعتد عليه مرة كل شهر.</p>
    `,
    author: "أحمد محمد",
    date: "2024-04-10",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=1200",
    category: "نصائح القراءة",
    readTime: "5 دقائق"
  },
  {
    id: "2",
    title: "أفضل 5 كتب في ريادة الأعمال لعام 2024",
    content: `
      <p>عالم الأعمال يتغير بسرعة، وهذه الكتب ستساعدك على مواكبة هذا التغيير وبناء مشاريع ناجحة ومستدامة:</p>
      
      <h2>1. "من الصفر إلى الواحد" - بيتر ثيل</h2>
      <p>كتاب كلاسيكي حديث يشرح كيف تبني شركات تخلق أشياء جديدة تماماً بدلاً من تقليد ما هو موجود.</p>
      
      <h2>2. "الشركة الناشئة المرنة" - إريك ريس</h2>
      <p>منهجية علمية لبناء وإدارة الشركات الناشئة الناجحة في عصر يتسم بعدم اليقين.</p>
      
      <h2>3. "العادات الذرية" - جيمس كلير</h2>
      <p>رغم أنه كتاب تطوير ذات، إلا أن تطبيقه في بيئة العمل يؤدي لنتائج مذهلة في الإنتاجية والابتكار.</p>
    `,
    author: "سارة خالد",
    date: "2024-04-08",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200",
    category: "ريادة أعمال",
    readTime: "7 دقائق"
  },
  {
    id: "3",
    title: "تحدي القراءة: كيف تقرأ 50 كتاباً في السنة؟",
    content: `
      <p>القراءة هي مهارة يمكن تطويرها بالتدريب والالتزام. إليك خطة عملية للوصول لهدف 50 كتاباً في السنة:</p>
      
      <h2>1. خصص وقتاً ثابتاً</h2>
      <p>سواء كان ذلك 30 دقيقة قبل النوم أو أثناء التنقل، الالتزام بوقت محدد هو المفتاح.</p>
      
      <h2>2. احمل كتابك معك دائماً</h2>
      <p>استغل أوقات الانتظار الصغيرة. 5 دقائق هنا و10 دقائق هناك ستتراكم لتصبح ساعات من القراءة.</p>
      
      <h2>3. نوع في أحجام الكتب</h2>
      <p>لا تقتصر على الكتب الضخمة. الكتب القصيرة تعطيك شعوراً بالإنجاز وتحفزك للاستمرار.</p>
    `,
    author: "عمر فاروق",
    date: "2024-04-05",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=1200",
    category: "تطوير الذات",
    readTime: "4 دقائق"
  },
  {
    id: "4",
    title: "لماذا تعتبر القراءة الورقية أفضل من الإلكترونية؟",
    content: `
      <p>في عصر الشاشات، يظل للكتاب الورقي سحر خاص وفوائد علمية مثبتة:</p>
      
      <h2>1. تركيز أعمق</h2>
      <p>الكتب الورقية لا تحتوي على إشعارات أو روابط تشتت انتباهك، مما يسمح بدخول حالة "التدفق" الذهني.</p>
      
      <h2>2. ذاكرة بصرية أفضل</h2>
      <p>تساعدنا الحواس المتعددة (اللمس، الرائحة، تقليب الصفحات) على تذكر المعلومات ومكانها في الكتاب بشكل أفضل.</p>
      
      <h2>3. راحة للعين</h2>
      <p>الابتعاد عن الضوء الأزرق المنبعث من الشاشات يقلل من إجهاد العين ويحسن جودة النوم.</p>
    `,
    author: "ليلى حسن",
    date: "2024-04-01",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1200",
    category: "نصائح القراءة",
    readTime: "6 دقائق"
  },
  {
    id: "5",
    title: "مراجعة كتاب: 'العادات الذرية' لجيمس كلير",
    content: `
      <p>يعتبر هذا الكتاب من أكثر الكتب تأثيراً في السنوات الأخيرة. إليك أهم الأفكار التي ناقشها:</p>
      
      <h2>1. قوة الـ 1%</h2>
      <p>التحسن البسيط والمستمر بنسبة 1% يومياً يؤدي لنتائج هائلة على المدى الطويل.</p>
      
      <h2>2. التركيز على الأنظمة لا الأهداف</h2>
      <p>الأهداف هي النتائج التي تريد تحقيقها، أما الأنظمة فهي العمليات التي تؤدي لتلك النتائج.</p>
      
      <h2>3. تغيير الهوية</h2>
      <p>أكثر الطرق فعالية لتغيير عاداتك هي التركيز ليس على ما تريد تحقيقه، بل على من تريد أن تصبح.</p>
    `,
    author: "ياسين علي",
    date: "2024-03-28",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200",
    category: "مراجعات الكتب",
    readTime: "8 دقائق"
  },
  {
    id: "6",
    title: "مستقبل تجارة الكتب المستعملة في العصر الرقمي",
    content: `
      <p>التكنولوجيا لا تقتل الكتب، بل تعيد تشكيل كيفية تداولها:</p>
      
      <h2>1. المنصات المتخصصة</h2>
      <p>ظهور تطبيقات مثل "كتابي" يسهل عملية الربط بين البائع والمشتري في أي مكان في العالم.</p>
      
      <h2>2. الاقتصاد الدائري</h2>
      <p>زيادة الوعي البيئي تدفع الناس لإعادة تدوير الكتب ومشاركتها بدلاً من تكديسها.</p>
      
      <h2>3. المجتمعات الرقمية</h2>
      <p>الإنترنت يسمح للقراء بتبادل الآراء والمراجعات، مما يزيد من قيمة الكتاب المستعمل بناءً على شهرته.</p>
    `,
    author: "نور الدين",
    date: "2024-03-25",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200",
    category: "أخبار المنصة",
    readTime: "5 دقائق"
  }
];

export default function BlogPost() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const post = POSTS.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter">المقال غير موجود</h2>
        <Link to="/blog" className="px-8 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
          العودة للمدونة
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-12">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/blog")}
        className="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        العودة للمدونة
      </motion.button>

      {/* Header */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10"
        >
          {post.category}
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-stone-900 dark:text-white tracking-tighter leading-[1.1]"
        >
          {post.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-8 py-6 border-y border-stone-100 dark:border-stone-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-black text-stone-500">
              {post.author[0]}
            </div>
            <div>
              <p className="text-xs font-black text-stone-900 dark:text-white">{post.author}</p>
              <p className="text-[10px] font-bold text-stone-400">كاتب محتوى</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.date}
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {post.readTime} قراءة
            </div>
          </div>
        </motion.div>
      </div>

      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl shadow-stone-200/50 dark:shadow-none"
      >
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="prose prose-stone dark:prose-invert max-w-none prose-h2:text-3xl prose-h2:font-black prose-h2:tracking-tighter prose-p:text-lg prose-p:leading-relaxed prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:not-italic prose-blockquote:font-black prose-blockquote:text-2xl prose-blockquote:tracking-tighter"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-12 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-primary/10 hover:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            <Heart className="w-4 h-4" />
            أعجبني
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-primary/10 hover:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            <MessageSquare className="w-4 h-4" />
            التعليقات
          </button>
        </div>
        
        <button className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-xl shadow-stone-900/20">
          <Share2 className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Related Posts Placeholder */}
      <div className="pt-20 space-y-10">
        <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">قد يعجبك أيضاً</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {POSTS.filter(p => p.id !== id).slice(0, 2).map(p => (
            <Link key={p.id} to={`/blog/${p.id}`} className="group space-y-4">
              <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-xl">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
              <h4 className="text-xl font-black text-stone-900 dark:text-white tracking-tighter group-hover:text-primary transition-colors">{p.title}</h4>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
