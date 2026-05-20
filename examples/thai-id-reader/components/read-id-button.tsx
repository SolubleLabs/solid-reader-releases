"use client";

import { motion } from "framer-motion";

interface ReadIdButtonProps {
  onClick: () => void;
  disabled: boolean;
  isReading: boolean;
}

export function ReadIdButton({ onClick, disabled, isReading }: ReadIdButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={isReading}
      className={[
        "group relative min-w-[280px] overflow-hidden rounded-2xl px-10 py-6",
        "text-xl font-semibold transition-colors duration-200 md:min-w-[320px] md:px-12 md:py-8 md:text-2xl lg:min-w-[360px] lg:text-3xl",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
        disabled
          ? "cursor-not-allowed bg-muted text-muted-foreground"
          : "bg-primary text-primary-foreground shadow-2xl shadow-primary/25",
      ].join(" ")}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {!disabled && !isReading ? (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
          animate={{ translateX: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />
      ) : null}

      {isReading ? (
        <>
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border-2 border-primary-foreground/30"
            initial={{ scale: 1, opacity: 0.55 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border-2 border-primary-foreground/30"
            initial={{ scale: 1, opacity: 0.55 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
        </>
      ) : null}

      <span className="relative flex items-center justify-center gap-3">
        {isReading ? (
          <>
            <SpinnerIcon className="h-7 w-7 animate-spin" />
            <span>Reading Card...</span>
          </>
        ) : (
          <>
            <motion.span
              animate={{ rotateY: [0, 10, 0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <CardIcon className="h-8 w-8" />
            </motion.span>
            <span>Read Thai ID</span>
          </>
        )}
      </span>
    </motion.button>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4" />
      <path d="M14 14h4" />
    </svg>
  );
}
