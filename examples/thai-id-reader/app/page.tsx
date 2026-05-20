"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { CardDataDisplay } from "../components/card-data-display";
import { EmptyState } from "../components/empty-state";
import { ErrorDisplay } from "../components/error-display";
import { ReadIdButton } from "../components/read-id-button";
import { StatusIndicators } from "../components/status-indicators";
import {
  isLocalBridgeUnreachableError,
  pingLocalBridgeWithTimeout,
} from "../lib/local-bridge-client";
import {
  ensureThaiIdBridgeReady,
  formatThaiIdReadError,
  readThaiIdPayloadWithRaw,
  type ThaiIdCardPayload,
  type ThaiIdCardReadResponse,
  ThaiIdReadUserError,
} from "../lib/thai-id-card";

export type BridgeStatus = "checking" | "connected" | "not_running" | "not_responding";
export type ReaderStatus = "unknown" | "checking" | "ready" | "no_reader";
export type CardStatus = "unknown" | "checking" | "inserted" | "no_card" | "read_error";

interface ReadState {
  isReading: boolean;
  cardData: ThaiIdCardPayload | null;
  error: string | null;
  rawJson: ThaiIdCardReadResponse | null;
}

function getBridgeIssue(status: BridgeStatus): {
  title: string;
  message: string;
  thaiMessage: string;
} | null {
  if (status === "not_running") {
    return {
      title: "SolId Reader Not Running",
      message: "Start SolId Reader on this computer, then check again.",
      thaiMessage: "กรุณาเปิดโปรแกรม SolId Reader บนเครื่องนี้ แล้วลองตรวจสอบอีกครั้ง",
    };
  }

  if (status === "not_responding") {
    return {
      title: "SolId Reader Not Responding",
      message: "SolId Reader replied unexpectedly. Restart SolId Reader, then check again.",
      thaiMessage: "โปรแกรม SolId Reader ตอบกลับไม่ถูกต้อง กรุณาเปิดใหม่แล้วลองอีกครั้ง",
    };
  }

  return null;
}

export default function ThaiIdReaderPage() {
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>("checking");
  const [readerStatus, setReaderStatus] = useState<ReaderStatus>("unknown");
  const [cardStatus, setCardStatus] = useState<CardStatus>("unknown");
  const [readState, setReadState] = useState<ReadState>({
    isReading: false,
    cardData: null,
    error: null,
    rawJson: null,
  });

  const checkBridgeStatus = useCallback(async () => {
    try {
      const response = await pingLocalBridgeWithTimeout(4_000);
      const text = await response.text();
      setBridgeStatus(response.ok && text.trim() === "pong" ? "connected" : "not_responding");
    } catch {
      setBridgeStatus("not_running");
    }
  }, []);

  useEffect(() => {
    const initialCheckId = window.setTimeout(() => {
      void checkBridgeStatus();
    }, 0);

    const intervalId = window.setInterval(() => {
      void checkBridgeStatus();
    }, 10_000);

    return () => {
      window.clearTimeout(initialCheckId);
      window.clearInterval(intervalId);
    };
  }, [checkBridgeStatus]);

  const handleReadId = useCallback(async () => {
    setReadState({
      isReading: true,
      cardData: null,
      error: null,
      rawJson: null,
    });
    setReaderStatus("checking");
    setCardStatus("checking");

    try {
      await ensureThaiIdBridgeReady();
      setBridgeStatus("connected");

      const result = await readThaiIdPayloadWithRaw();
      setReaderStatus("ready");
      setCardStatus("inserted");
      setReadState({
        isReading: false,
        cardData: result.payload,
        error: null,
        rawJson: result.rawJson,
      });
    } catch (readError) {
      if (isLocalBridgeUnreachableError(readError)) {
        setBridgeStatus("not_running");
        setReaderStatus("unknown");
        setCardStatus("unknown");
      } else if (readError instanceof ThaiIdReadUserError) {
        setBridgeStatus("connected");

        if (readError.code === "NO_READER") {
          setReaderStatus("no_reader");
          setCardStatus("unknown");
        } else if (readError.code === "NO_CARD") {
          setReaderStatus("ready");
          setCardStatus("no_card");
        } else {
          setReaderStatus("ready");
          setCardStatus("read_error");
        }
      } else {
        setCardStatus("read_error");
      }

      setReadState({
        isReading: false,
        cardData: null,
        error: formatThaiIdReadError(readError),
        rawJson: null,
      });
    }
  }, []);

  const handleClearData = useCallback(() => {
    setReadState({
      isReading: false,
      cardData: null,
      error: null,
      rawJson: null,
    });
    setCardStatus("unknown");
  }, []);

  const canRead = bridgeStatus === "connected" && !readState.isReading;
  const bridgeIssue =
    !readState.isReading && !readState.cardData ? getBridgeIssue(bridgeStatus) : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background p-4 text-foreground md:p-6 lg:p-8">
      <div className="kiosk-grid pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        <motion.header
          className="space-y-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Thai ID Card Reader
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">เครื่องอ่านบัตรประชาชน</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <StatusIndicators
            bridgeStatus={bridgeStatus}
            readerStatus={readerStatus}
            cardStatus={cardStatus}
          />
        </motion.div>

        <motion.div
          className="flex justify-center py-4 md:py-6"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <ReadIdButton onClick={handleReadId} disabled={!canRead} isReading={readState.isReading} />
        </motion.div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {bridgeIssue ? (
              <motion.div
                key="bridge-error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ErrorDisplay
                  title={bridgeIssue.title}
                  message={bridgeIssue.message}
                  thaiMessage={bridgeIssue.thaiMessage}
                  onRetry={checkBridgeStatus}
                  canRetry
                  actionLabel="Check Again"
                  tips={[
                    "Open SolId Reader on this Windows computer.",
                    "Confirm the bridge uses the same secret as .env.local.",
                    "Keep this browser and SolId Reader on the same clinic PC.",
                  ]}
                />
              </motion.div>
            ) : readState.error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ErrorDisplay message={readState.error} onRetry={handleReadId} canRetry={canRead} />
              </motion.div>
            ) : readState.cardData ? (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <CardDataDisplay data={readState.cardData} rawJson={readState.rawJson} onClear={handleClearData} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EmptyState isReading={readState.isReading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
