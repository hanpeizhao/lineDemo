import { normalizeError } from "./conditions";
import type { ApiRunner, RunResult } from "./types";

function success(data?: unknown): RunResult {
  return { ok: true, data };
}

async function safely(run: () => unknown | Promise<unknown>): Promise<RunResult> {
  try {
    return success(await run());
  } catch (error) {
    return { ok: false, error: normalizeError(error) };
  }
}

function parseJson(payload: string) {
  return JSON.parse(payload || "null") as unknown;
}

export const clientRunners = {
  commonProfileGet: (payload, context) => safely(() => {
    const { scopes, options } = parseJson(payload) as { scopes: string[]; options?: object };
    return (context.liff as any).$commonProfile.get(scopes, options);
  }),
  commonProfileGetDummy: (payload, context) => safely(() => {
    const { scopes, options, caseId } = parseJson(payload) as { scopes: string[]; options?: object; caseId: number };
    return (context.liff as any).$commonProfile.getDummy(scopes, options, caseId);
  }),
  commonProfileFill: (payload, context) => safely(() => {
    (context.liff as any).$commonProfile.fill(parseJson(payload));
  }),
  getPlatformProducts: (payload, context) => safely(() => {
    return (context.liff as any).iap.getPlatformProducts(parseJson(payload));
  }),
  requestConsentAgreement: (_payload, context) => safely(() => {
    return (context.liff as any).iap.requestConsentAgreement();
  }),
  createPayment: (payload, context) => safely(() => {
    return (context.liff as any).iap.createPayment(parseJson(payload));
  }),
} satisfies Record<string, ApiRunner>;
