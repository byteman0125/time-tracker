"use client";

import Link from "next/link";

export function Logo() {
  return (
    <Link href="/calendar" className="flex items-center gap-3 group">
      {/* Modern professional icon with sophisticated design */}
      <div className="relative flex h-12 w-12 items-center justify-center">
        {/* Animated outer glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/40 via-primary/20 to-blue-600/20 blur-md opacity-60 group-hover:opacity-80 transition-opacity"></div>
        {/* Main gradient background with depth */}
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-primary/80 shadow-xl shadow-primary/40 ring-1 ring-primary/30">
          {/* Inner shine effect */}
          <div className="absolute inset-[2px] rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
          {/* Modern icon design - Calendar with clock hands */}
          <svg
            className="relative z-10 h-7 w-7 text-white"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {/* Calendar base */}
            <rect
              x="4"
              y="5"
              width="16"
              height="15"
              rx="2"
              stroke="url(#logoIconGradient)"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Calendar top binding */}
            <rect
              x="4"
              y="5"
              width="16"
              height="4"
              rx="2"
              fill="url(#logoIconGradient)"
              fillOpacity="0.3"
            />
            {/* Calendar rings */}
            <circle cx="7" cy="7" r="0.8" fill="url(#logoIconGradient)" />
            <circle cx="17" cy="7" r="0.8" fill="url(#logoIconGradient)" />
            {/* Clock hands in center */}
            <circle cx="12" cy="13" r="1.5" fill="url(#logoIconGradient)" />
            <line
              x1="12"
              y1="13"
              x2="12"
              y2="10"
              stroke="url(#logoIconGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="13"
              x2="14.5"
              y2="13"
              stroke="url(#logoIconGradient)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      
      {/* Typography with modern spacing */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80 leading-none mb-0.5 group-hover:text-primary transition-colors">
          Interview OS
        </span>
        <span className="text-[15px] font-semibold text-white leading-tight tracking-tight group-hover:text-slate-100 transition-colors">
          Time Tracker
        </span>
      </div>
    </Link>
  );
}

