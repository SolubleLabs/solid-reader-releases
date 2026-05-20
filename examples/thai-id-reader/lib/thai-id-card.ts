import {
  LocalBridgeUnreachableError,
  isLocalBridgeUnreachableError,
  pingLocalBridgeWithTimeout,
  readThaiIdCard,
} from "./local-bridge-client";

export type ReadIdErrorCode = "NO_READER" | "NO_CARD" | "CARD_ERROR";

export interface ThaiIdCardPayload {
  citizenID: string;
  titleTH: string;
  titleEN: string;
  fullNameTH: string;
  fullNameEN: string;
  firstNameTH: string;
  firstNameEN: string;
  lastNameTH: string;
  lastNameEN: string;
  dateOfBirth: string;
  gender: "M" | "F";
  cardIssuer: string;
  issueDate: string;
  expireDate: string;
  address: string;
  photoAsBase64Uri: string;
}

interface ThaiIdCardReadSuccessResponse {
  success: true;
  data: ThaiIdCardPayload;
}

interface ThaiIdCardReadErrorResponse {
  success: false;
  error?: string;
  code?: ReadIdErrorCode;
}

export type ThaiIdCardReadResponse =
  | ThaiIdCardReadSuccessResponse
  | ThaiIdCardReadErrorResponse;

export interface ThaiIdPayloadReadResult {
  payload: ThaiIdCardPayload;
  rawJson: ThaiIdCardReadResponse;
}

export class ThaiIdReadUserError extends Error {
  readonly code?: ReadIdErrorCode | "BAD_JSON" | "HTTP_ERROR";

  constructor(
    message: string,
    options?: {
      cause?: unknown;
      code?: ReadIdErrorCode | "BAD_JSON" | "HTTP_ERROR";
    },
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "ThaiIdReadUserError";
    this.code = options?.code;
  }
}

export const THAI_ID_BRIDGE_READY_PING_MS = 4_000;

function thaiIdReadErrorFromBridgeResponse(
  code: ReadIdErrorCode | undefined,
  rawError: string | undefined,
): Error {
  const trimmed = rawError?.trim();

  switch (code) {
    case "NO_READER":
      return new ThaiIdReadUserError(
        "No card reader detected. Connect a reader and try again.",
        { code },
      );
    case "NO_CARD":
      return new ThaiIdReadUserError(
        "No card inserted. Insert the Thai ID card and try again.",
        { code },
      );
    case "CARD_ERROR":
      return new ThaiIdReadUserError(
        trimmed || "Card read failed. Reinsert the card and try again.",
        { code },
      );
    default:
      return new ThaiIdReadUserError(
        trimmed || "Failed to read Thai ID card.",
      );
  }
}

export async function ensureThaiIdBridgeReady(): Promise<void> {
  const bridgeMessage = "SolId Reader is not running. Start SolId Reader and try again.";

  let response: Response;
  try {
    response = await pingLocalBridgeWithTimeout(THAI_ID_BRIDGE_READY_PING_MS);
  } catch (error) {
    throw new LocalBridgeUnreachableError(bridgeMessage, { cause: error });
  }

  const text = await response.text();
  if (!response.ok || text.trim() !== "pong") {
    throw new LocalBridgeUnreachableError(bridgeMessage);
  }
}

export async function readThaiIdPayloadWithRaw(): Promise<ThaiIdPayloadReadResult> {
  const response = await readThaiIdCard();

  let json: ThaiIdCardReadResponse;
  try {
    json = (await response.json()) as ThaiIdCardReadResponse;
  } catch (error) {
    if (!response.ok) {
      throw new ThaiIdReadUserError(
        `Thai ID bridge returned HTTP ${response.status}.`,
        { cause: error, code: "HTTP_ERROR" },
      );
    }

    throw new ThaiIdReadUserError("Thai ID bridge returned bad JSON.", {
      cause: error,
      code: "BAD_JSON",
    });
  }

  if (json.success) {
    return {
      payload: json.data,
      rawJson: json,
    };
  }

  throw thaiIdReadErrorFromBridgeResponse(json.code, json.error);
}

export async function readThaiIdPayload(): Promise<ThaiIdCardPayload> {
  const result = await readThaiIdPayloadWithRaw();
  return result.payload;
}

export function formatThaiIdReadError(error: unknown): string {
  if (isLocalBridgeUnreachableError(error)) {
    return error.message;
  }

  if (error instanceof ThaiIdReadUserError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return "Cannot reach SolId Reader. Start SolId Reader and try again.";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Failed to read Thai ID card.";
}
