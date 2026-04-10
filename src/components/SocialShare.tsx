import { useTranslation } from "react-i18next";
import { Share2, Twitter, MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SocialShareProps {
  title: string;
  url: string;
}

export default function SocialShare({ title, url }: SocialShareProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    {
      name: t("share.whatsapp"),
      icon: MessageCircle,
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    },
    {
      name: t("share.twitter"),
      icon: Twitter,
      color: "bg-[#1DA1F2]",
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-stone-400">
        <Share2 className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t("share.title")}</span>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {shareLinks.map((platform) => (
          <a
            key={platform.name}
            href={platform.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${platform.color} text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg`}
          >
            <platform.icon className="w-4 h-4" />
            {platform.name}
          </a>
        ))}
        
        <button
          onClick={copyToClipboard}
          className="bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-stone-700 transition-all border border-stone-200 dark:border-stone-700"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? t("share.copied") : t("share.copy")}
        </button>
      </div>
    </div>
  );
}
