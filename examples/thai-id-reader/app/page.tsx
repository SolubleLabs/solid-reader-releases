"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isLocalBridgeUnreachableError,
  pingLocalBridgeWithTimeout,
} from "../lib/local-bridge-client";
import {
  ensureThaiIdBridgeReady,
  formatThaiIdReadError,
  readThaiIdPayload,
  type ThaiIdCardPayload,
  ThaiIdReadUserError,
} from "../lib/thai-id-card";

type BridgeStatus = "checking" | "connected" | "not_running" | "not_responding";
type ReaderStatus = "unknown" | "checking" | "ready" | "no_reader";
type CardStatus = "unknown" | "checking" | "inserted" | "no_card" | "read_error";

interface Field {
  label: string;
  value: string;
  full?: boolean;
}

function displayValue(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "-";
}

function genderLabel(value: ThaiIdCardPayload["gender"]): string {
  return value === "M" ? "Male" : "Female";
}

function FieldRow({ label, value, full = false }: Field) {
  return (
    <div className={full ? "field-row full" : "field-row"}>
      <span className="field-label">{label}</span>
      <span className="field-value">{displayValue(value)}</span>
    </div>
  );
}

function statusText(kind: "bridge", status: BridgeStatus): string;
function statusText(kind: "reader", status: ReaderStatus): string;
function statusText(kind: "card", status: CardStatus): string;
function statusText(
  kind: "bridge" | "reader" | "card",
  status: BridgeStatus | ReaderStatus | CardStatus,
): string {
  if (kind === "bridge") {
    switch (status) {
      case "checking":
        return "Checking SolId Reader...";
      case "connected":
        return "SolId Reader detected";
      case "not_running":
        return "SolId Reader not running";
      case "not_responding":
        return "SolId Reader not responding";
    }
  }

  if (kind === "reader") {
    switch (status) {
      case "checking":
        return "Checking reader...";
      case "ready":
        return "Reader responded";
      case "no_reader":
        return "No reader detected";
      case "unknown":
        return "Reader not checked";
    }
  }

  switch (status) {
    case "checking":
      return "Checking card...";
    case "inserted":
      return "Card inserted and read";
    case "no_card":
      return "No card inserted";
    case "read_error":
      return "Card read error";
    case "unknown":
      return "Card not checked";
  }

  return "Status unavailable";
}

function StatusPill({
  label,
  children,
  tone,
}: {
  label: string;
  children: string;
  tone: "neutral" | "good" | "bad" | "working";
}) {
  return (
    <div className={`status-pill ${tone}`}>
      <span className="status-label">{label}</span>
      <span className="status-value">{children}</span>
    </div>
  );
}

export default function Home() {
  const [card, setCard] = useState<ThaiIdCardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>("checking");
  const [readerStatus, setReaderStatus] = useState<ReaderStatus>("unknown");
  const [cardStatus, setCardStatus] = useState<CardStatus>("unknown");

  const checkBridgeStatus = useCallback(async () => {
    try {
      const response = await pingLocalBridgeWithTimeout(4_000);
      const text = await response.text();
      setBridgeStatus(response.ok && text.trim() === "pong" ? "connected" : "not_responding");
    } catch {
      setBridgeStatus("not_running");
    }
  }, []);

  const fields = useMemo<Field[]>(() => {
    if (!card) {
      return [];
    }

    return [
      { label: "Citizen ID", value: card.citizenID },
      { label: "Date of birth", value: card.dateOfBirth },
      { label: "Thai name", value: card.fullNameTH },
      { label: "English name", value: card.fullNameEN },
      { label: "Gender", value: genderLabel(card.gender) },
      { label: "Card issuer", value: card.cardIssuer },
      { label: "Issue date", value: card.issueDate },
      { label: "Expire date", value: card.expireDate },
      { label: "Address", value: card.address, full: true },
    ];
  }, [card]);

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

  async function handleReadThaiId(): Promise<void> {
    setLoading(true);
    setError(null);
    setCard(null);
    setReaderStatus("checking");
    setCardStatus("checking");

    try {
      await ensureThaiIdBridgeReady();
      setBridgeStatus("connected");
      const payload = await readThaiIdPayload();
      setReaderStatus("ready");
      setCardStatus("inserted");
      setCard(payload);
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
        } else if (readError.code === "CARD_ERROR") {
          setReaderStatus("ready");
          setCardStatus("read_error");
        }
      }

      setError(formatThaiIdReadError(readError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="reader-panel" aria-labelledby="reader-title">
        <div className="reader-header">
          <div>
            <h1 id="reader-title" className="reader-title">
              Thai ID Reader
            </h1>
            <p className="reader-subtitle">SolId Reader local bridge</p>
          </div>
          <button
            type="button"
            className="read-button"
            onClick={handleReadThaiId}
            disabled={loading}
          >
            {loading ? "Reading..." : "Read Thai ID"}
          </button>
        </div>

        <div className="status-grid" aria-live="polite">
          <StatusPill
            label="Bridge"
            tone={
              bridgeStatus === "connected"
                ? "good"
                : bridgeStatus === "checking"
                  ? "working"
                  : "bad"
            }
          >
            {statusText("bridge", bridgeStatus)}
          </StatusPill>
          <StatusPill
            label="Reader"
            tone={
              readerStatus === "ready"
                ? "good"
                : readerStatus === "checking"
                  ? "working"
                  : readerStatus === "no_reader"
                    ? "bad"
                    : "neutral"
            }
          >
            {statusText("reader", readerStatus)}
          </StatusPill>
          <StatusPill
            label="Card"
            tone={
              cardStatus === "inserted"
                ? "good"
                : cardStatus === "checking"
                  ? "working"
                  : cardStatus === "no_card" || cardStatus === "read_error"
                    ? "bad"
                    : "neutral"
            }
          >
            {statusText("card", cardStatus)}
          </StatusPill>
        </div>

        <p className="status-line" aria-live="polite">
          {loading ? "Reading card data..." : card ? "Card read complete." : ""}
        </p>

        {error ? (
          <div className="error-box" role="alert">
            {error}
          </div>
        ) : null}

        {card ? (
          <div className="result-stack">
            <div className="card-result">
              <div className="photo-frame">
                {card.photoAsBase64Uri ? (
                  // Bridge photos are already data URIs, so Next image optimization is not useful here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.photoAsBase64Uri} alt="Thai ID card holder" />
                ) : null}
              </div>
              <div className="field-grid">
                {fields.map((field) => (
                  <FieldRow
                    key={field.label}
                    label={field.label}
                    value={field.value}
                    full={field.full}
                  />
                ))}
              </div>
            </div>
            <section className="json-panel" aria-labelledby="json-heading">
              <h2 id="json-heading" className="section-title">
                Raw JSON
              </h2>
              <pre>{JSON.stringify(card, null, 2)}</pre>
            </section>
          </div>
        ) : (
          <div className="empty-state">No card data loaded.</div>
        )}
      </section>
    </main>
  );
}
