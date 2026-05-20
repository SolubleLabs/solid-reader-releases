"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  isReading: boolean;
}

export function EmptyState({ isReading }: EmptyStateProps) {
  if (isReading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-16 md:py-24">
        <div className="relative">
          <motion.div
            className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-info/30 bg-card/80 shadow-2xl shadow-info/10 backdrop-blur-sm md:h-36 md:w-36"
            animate={{
              boxShadow: [
                "0 0 20px 0 rgba(80, 145, 220, 0.12)",
                "0 0 46px 10px rgba(80, 145, 220, 0.24)",
                "0 0 20px 0 rgba(80, 145, 220, 0.12)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              aria-hidden="true"
              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-info to-transparent"
              animate={{ top: ["20%", "80%", "20%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              animate={{ opacity: [0.55, 1, 0.55], scale: [0.95, 1, 0.95] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <CardScanIcon className="h-16 w-16 text-info" />
            </motion.span>
          </motion.div>

          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border-2 border-info/40"
            animate={{ scale: [1, 1.3, 1.3], opacity: [0.6, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border-2 border-info/40"
            animate={{ scale: [1, 1.3, 1.3], opacity: [0.6, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
          />
        </div>

        <motion.div
          className="space-y-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.p
            className="text-lg font-medium text-foreground md:text-xl"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Reading Card...
          </motion.p>
          <p className="text-sm text-muted-foreground">กำลังอ่านข้อมูลจากบัตร</p>
        </motion.div>

        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="h-2 w-2 rounded-full bg-info"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: index * 0.2, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-6 py-16 md:py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/60 backdrop-blur-sm md:h-36 md:w-36"
        animate={{
          borderColor: [
            "color-mix(in oklch, var(--border) 55%, transparent)",
            "color-mix(in oklch, var(--border) 95%, transparent)",
            "color-mix(in oklch, var(--border) 55%, transparent)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span
          animate={{ y: [0, -5, 0], opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <CardPlaceholderIcon className="h-16 w-16 text-muted-foreground/60" />
        </motion.span>

        <span className="absolute left-2 top-2 h-3 w-3 rounded-tl border-l border-t border-muted-foreground/25" />
        <span className="absolute right-2 top-2 h-3 w-3 rounded-tr border-r border-t border-muted-foreground/25" />
        <span className="absolute bottom-2 left-2 h-3 w-3 rounded-bl border-b border-l border-muted-foreground/25" />
        <span className="absolute bottom-2 right-2 h-3 w-3 rounded-br border-b border-r border-muted-foreground/25" />
      </motion.div>

      <div className="space-y-2 text-center">
        <p className="text-lg font-medium text-muted-foreground md:text-xl">No Card Data</p>
        <p className="text-sm text-muted-foreground/80">Insert a Thai ID card and press “Read Thai ID”.</p>
        <p className="text-sm text-muted-foreground/80">กรุณาใส่บัตรประชาชนและกด “Read Thai ID”</p>
      </div>
    </motion.div>
  );
}

function CardPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function CardScanIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4" />
      <path d="M14 14h4" />
    </svg>
  );
}
