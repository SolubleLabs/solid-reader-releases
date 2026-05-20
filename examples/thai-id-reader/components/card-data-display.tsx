"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { ThaiIdCardPayload, ThaiIdCardReadResponse } from "../lib/thai-id-card";

interface CardDataDisplayProps {
  data: ThaiIdCardPayload;
  rawJson: ThaiIdCardReadResponse | null;
  onClear: () => void;
}

interface FieldProps {
  label: string;
  value: string;
  className?: string;
  index: number;
}

function formatValue(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "-";
}

function formatGender(value: ThaiIdCardPayload["gender"]): string {
  return value === "M" ? "Male / ชาย" : "Female / หญิง";
}

function Field({ label, value, className = "", index }: FieldProps) {
  return (
    <motion.div
      className={`space-y-1.5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.04, ease: [0.23, 1, 0.32, 1] }}
    >
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="overflow-wrap-anywhere text-base font-medium text-foreground md:text-lg">{formatValue(value)}</dd>
    </motion.div>
  );
}

export function CardDataDisplay({ data, rawJson, onClear }: CardDataDisplayProps) {
  const [showRawJson, setShowRawJson] = useState(true);

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <motion.span
            className="h-3 w-3 rounded-full bg-success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
          />
          <motion.span
            className="text-lg font-semibold text-success"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            Card Read Successfully
          </motion.span>
        </div>

        <motion.button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-border bg-secondary/60 px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Clear &amp; Read Another
        </motion.button>
      </motion.div>

      <motion.div
        className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl shadow-black/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <div className="mb-2 text-xs font-medium text-muted-foreground">ID Photo</div>
                <div className="relative h-[200px] w-[160px] md:h-[225px] md:w-[180px]">
                  <Corner className="-left-2 -top-2 rounded-tl-lg border-l-2 border-t-2" delay={0.4} />
                  <Corner className="-right-2 -top-2 rounded-tr-lg border-r-2 border-t-2" delay={0.45} />
                  <Corner className="-bottom-2 -left-2 rounded-bl-lg border-b-2 border-l-2" delay={0.5} />
                  <Corner className="-bottom-2 -right-2 rounded-br-lg border-b-2 border-r-2" delay={0.55} />

                  <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-secondary">
                    {data.photoAsBase64Uri ? (
                      <motion.img
                        src={data.photoAsBase64Uri}
                        alt="Thai ID card holder"
                        className="h-full w-full object-cover"
                        initial={{ opacity: 0, scale: 1.08 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <PersonIcon className="h-16 w-16 opacity-50" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="min-w-0 flex-1">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                <Field label="Citizen ID / เลขประจำตัวประชาชน" value={data.citizenID} className="md:col-span-2" index={0} />
                <Field label="Thai Name / ชื่อภาษาไทย" value={data.fullNameTH} index={1} />
                <Field label="English Name / ชื่อภาษาอังกฤษ" value={data.fullNameEN} index={2} />
                <Field label="Date of Birth / วันเกิด" value={data.dateOfBirth} index={3} />
                <Field label="Gender / เพศ" value={formatGender(data.gender)} index={4} />
                <Field label="Card Issuer / สถานที่ออกบัตร" value={data.cardIssuer} index={5} />
                <Field label="Issue Date / วันออกบัตร" value={data.issueDate} index={6} />
                <Field label="Expire Date / วันหมดอายุ" value={data.expireDate} index={7} />
                <Field label="Address / ที่อยู่" value={data.address} className="md:col-span-2" index={8} />
              </dl>
            </div>
          </div>
        </div>
      </motion.div>

      {rawJson ? (
        <motion.div
          className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <motion.button
            type="button"
            onClick={() => setShowRawJson((current) => !current)}
            className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <span className="text-sm font-semibold text-muted-foreground">Raw JSON Response</span>
            <motion.span animate={{ rotate: showRawJson ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <ChevronIcon className="h-5 w-5 text-muted-foreground" />
            </motion.span>
          </motion.button>

          <AnimatePresence initial={false}>
            {showRawJson ? (
              <motion.div
                className="overflow-hidden px-6 pb-6"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <pre className="json-scroll max-h-[400px] overflow-auto rounded-lg bg-secondary/70 p-4 font-mono text-xs leading-relaxed text-foreground/85 md:text-sm">
                  <code className="whitespace-pre-wrap break-all">{JSON.stringify(rawJson, null, 2)}</code>
                </pre>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </div>
  );
}

function Corner({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`absolute h-6 w-6 border-primary ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay }}
    />
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
