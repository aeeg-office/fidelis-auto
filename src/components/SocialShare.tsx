"use client";

import { useState } from "react";
import { MessageCircle, Mail, Link, Check } from "lucide-react";

type SocialShareProps = {
  url: string;
  title: string;
  /** Optional className for custom styling. */
  className?: string;
};

function FacebookIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function SocialShare({ url, title, className = "" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
      icon: MessageCircle,
      color: "hover:text-[#25D366]",
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: FacebookIcon,
      color: "hover:text-[#1877F2]",
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check this out: ${url}`)}`,
      icon: Mail,
      color: "hover:text-[var(--color-accent)]",
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
        Share
      </span>

      {shareLinks.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${s.name}`}
          className={`text-[var(--color-text-secondary)] ${s.color} transition-colors`}
        >
          <s.icon size={18} />
        </a>
      ))}

      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors relative"
      >
        {copied ? <Check size={18} className="text-green-500" /> : <Link size={18} />}
      </button>
    </div>
  );
}