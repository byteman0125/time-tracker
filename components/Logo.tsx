"use client";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Professional icon with layered design */}
      <div className="relative flex h-11 w-11 items-center justify-center">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 via-primary/20 to-transparent blur-sm"></div>
        {/* Main gradient background */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg shadow-primary/30"></div>
        {/* Inner highlight */}
        <div className="absolute inset-[1px] rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950"></div>
        {/* Icon SVG */}
        <svg
          className="relative z-10 h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Clock/Time icon representing tracking */}
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M12 6V12L16 14"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Interview/Meeting dots */}
          <circle cx="8" cy="8" r="1.5" fill="url(#logoGradient)" />
          <circle cx="16" cy="8" r="1.5" fill="url(#logoGradient)" />
          <circle cx="12" cy="16" r="1.5" fill="url(#logoGradient)" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/90 leading-tight">
          Interview OS
        </span>
        <span className="text-sm font-semibold text-white leading-tight">
          Time Tracker
        </span>
      </div>
    </div>
  );
}

