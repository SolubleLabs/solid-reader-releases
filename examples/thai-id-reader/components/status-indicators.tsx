"use client";

import { motion } from "framer-motion";
import type { BridgeStatus, CardStatus, ReaderStatus } from "../app/page";

type StatusVariant = "success" | "warning" | "error" | "checking" | "unknown";

interface StatusIndicatorsProps {
  bridgeStatus: BridgeStatus;
  readerStatus: ReaderStatus;
  cardStatus: CardStatus;
}

interface StatusBadgeProps {
  label: string;
  status: string;
  variant: StatusVariant;
  index: number;
}

const badgeStyles: Record<StatusVariant, string> = {
  success: "border-success/30 bg-success/15 text-success",
  warning: "border-warning/40 bg-warning/15 text-warning",
  error: "border-destructive/35 bg-destructive/15 text-destructive",
  checking: "border-info/35 bg-info/15 text-info",
  unknown: "border-border bg-muted/60 text-muted-foreground",
};

const dotStyles: Record<StatusVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  checking: "bg-info",
  unknown: "bg-muted-foreground",
};

function StatusBadge({ label, status, variant, index }: StatusBadgeProps) {
  return (
    <motion.div
      className="flex min-w-[150px] flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-xl shadow-black/10 backdrop-blur-sm"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2.5">
        <motion.span
          className={`h-3 w-3 rounded-full ${dotStyles[variant]}`}
          animate={
            variant === "checking"
              ? { scale: [1, 1.35, 1], opacity: [1, 0.58, 1] }
              : variant === "success"
                ? { scale: [1, 1.12, 1] }
                : {}
          }
          transition={
            variant === "checking"
              ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.35, ease: "easeOut" }
          }
        />
        <motion.span
          key={status}
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${badgeStyles[variant]}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.24 }}
        >
          {status}
        </motion.span>
      </div>
    </motion.div>
  );
}

function getBridgeVariant(status: BridgeStatus): StatusVariant {
  switch (status) {
    case "connected":
      return "success";
    case "checking":
      return "checking";
    case "not_running":
    case "not_responding":
      return "error";
  }
}

function getBridgeLabel(status: BridgeStatus): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "checking":
      return "Checking...";
    case "not_running":
      return "Not running";
    case "not_responding":
      return "Not responding";
  }
}

function getReaderVariant(status: ReaderStatus): StatusVariant {
  switch (status) {
    case "ready":
      return "success";
    case "checking":
      return "checking";
    case "no_reader":
      return "error";
    case "unknown":
      return "unknown";
  }
}

function getReaderLabel(status: ReaderStatus): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "checking":
      return "Checking...";
    case "no_reader":
      return "No reader";
    case "unknown":
      return "Unknown";
  }
}

function getCardVariant(status: CardStatus): StatusVariant {
  switch (status) {
    case "inserted":
      return "success";
    case "checking":
      return "checking";
    case "no_card":
      return "warning";
    case "read_error":
      return "error";
    case "unknown":
      return "unknown";
  }
}

function getCardLabel(status: CardStatus): string {
  switch (status) {
    case "inserted":
      return "Card inserted";
    case "checking":
      return "Reading...";
    case "no_card":
      return "No card";
    case "read_error":
      return "Read error";
    case "unknown":
      return "Unknown";
  }
}

export function StatusIndicators({
  bridgeStatus,
  readerStatus,
  cardStatus,
}: StatusIndicatorsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      <StatusBadge label="Bridge" status={getBridgeLabel(bridgeStatus)} variant={getBridgeVariant(bridgeStatus)} index={0} />
      <StatusBadge label="Reader" status={getReaderLabel(readerStatus)} variant={getReaderVariant(readerStatus)} index={1} />
      <StatusBadge label="Card" status={getCardLabel(cardStatus)} variant={getCardVariant(cardStatus)} index={2} />
    </div>
  );
}
