"use client";

import { motion } from "framer-motion";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry: () => void;
  canRetry: boolean;
  actionLabel?: string;
  secondaryActions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
  thaiMessage?: string;
  tips?: string[];
}

const defaultTips = [
  "Check that SolId Reader is running on this computer.",
  "Confirm the card reader is connected.",
  "Insert the Thai ID card fully and try again.",
  "Remove and reinsert the card if the read fails.",
];

export function ErrorDisplay({
  title = "Read Error",
  message,
  onRetry,
  canRetry,
  actionLabel = "Try Again",
  secondaryActions = [],
  thaiMessage = "เกิดข้อผิดพลาดในการอ่านบัตร กรุณาลองใหม่อีกครั้ง",
  tips = defaultTips,
}: ErrorDisplayProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-6 py-16 md:py-24"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-destructive/30 bg-destructive/10 md:h-36 md:w-36"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
      >
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
        >
          <AlertIcon className="h-16 w-16 text-destructive" />
        </motion.span>
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border-2 border-destructive/50"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <motion.div
        className="max-w-md space-y-3 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <p className="text-lg font-semibold text-destructive md:text-xl">{title}</p>
        <p className="text-base text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">{thaiMessage}</p>
      </motion.div>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <motion.button
          type="button"
          onClick={onRetry}
          disabled={!canRetry}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          whileHover={canRetry ? { scale: 1.02 } : {}}
          whileTap={canRetry ? { scale: 0.98 } : {}}
        >
          {actionLabel}
        </motion.button>
        {secondaryActions.map((action) =>
          action.href ? (
            <motion.a
              key={action.label}
              href={action.href}
              download
              className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-lg shadow-black/10 transition hover:bg-muted"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {action.label}
            </motion.a>
          ) : (
            <motion.button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-lg shadow-black/10 transition hover:bg-muted"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {action.label}
            </motion.button>
          ),
        )}
      </motion.div>

      <motion.div
        className="mt-6 max-w-lg rounded-2xl border border-border/60 bg-card/80 p-5 shadow-xl shadow-black/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <p className="mb-3 text-sm font-medium text-muted-foreground">Troubleshooting</p>
        <ul className="space-y-2 text-sm text-muted-foreground/85">
          {tips.map((tip, index) => (
            <motion.li
              key={tip}
              className="flex items-start gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.08 }}
            >
              <span className="mt-0.5 text-muted-foreground/50">•</span>
              <span>{tip}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
