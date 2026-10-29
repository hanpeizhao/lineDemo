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

function parseOptionalJson(payload: string) {
  return payload.trim() ? parseJson(payload) : undefined;
}

function methodRunner(method: (...args: any[]) => unknown, argumentParser?: (payload: string) => unknown[]) {
  return (payload: string, _context: any) => safely(() => method(...(argumentParser ? argumentParser(payload) : [])));
}

function liffMethod(name: string, argumentParser?: (payload: string) => unknown[]) {
  return (payload: string, context: any) => safely(() => {
    const method = name.split(".").reduce((value, key) => value?.[key], context.liff as any);
    if (typeof method !== "function") throw new Error(`${name} is not available in this LIFF SDK or environment`);
    const owner = name.includes(".") ? name.split(".").slice(0, -1).reduce((value, key) => value?.[key], context.liff as any) : context.liff;
    return method.apply(owner, argumentParser ? argumentParser(payload) : []);
  });
}

export const clientRunners = {
  getOs: liffMethod("getOS"),
  getAppLanguage: liffMethod("getAppLanguage"),
  getLanguage: liffMethod("getLanguage"),
  getVersion: liffMethod("getVersion"),
  getLineVersion: liffMethod("getLineVersion"),
  getContext: liffMethod("getContext"),
  isInClient: liffMethod("isInClient"),
  isLoggedIn: liffMethod("isLoggedIn"),
  isApiAvailable: liffMethod("isApiAvailable", (payload) => [payload.trim()]),
  login: liffMethod("login", (payload) => [parseOptionalJson(payload)]),
  logout: liffMethod("logout"),
  getAccessToken: liffMethod("getAccessToken"),
  getIdToken: liffMethod("getIDToken"),
  getDecodedIdToken: liffMethod("getDecodedIDToken"),
  getGrantedAll: liffMethod("permission.getGrantedAll"),
  permissionQuery: liffMethod("permission.query", (payload) => [payload.trim()]),
  permissionRequestAll: liffMethod("permission.requestAll", (payload) => [parseOptionalJson(payload)]),
  getProfile: liffMethod("getProfile"),
  getFriendship: liffMethod("getFriendship"),
  requestFriendship: liffMethod("requestFriendship"),
  openWindow: liffMethod("openWindow", (payload) => [parseJson(payload)]),
  closeWindow: liffMethod("closeWindow"),
  sendMessages: liffMethod("sendMessages", (payload) => [parseJson(payload)]),
  shareTargetPicker: liffMethod("shareTargetPicker", (payload) => {
    const value = parseJson(payload) as { messages: unknown[]; options?: object };
    return [value.messages, value.options];
  }),
  scanCodeV2: liffMethod("scanCodeV2"),
  scanCode: liffMethod("scanCode"),
  permanentLinkCreateUrlBy: liffMethod("permanentLink.createUrlBy", (payload) => [payload.trim()]),
  permanentLinkCreateUrl: liffMethod("permanentLink.createUrl"),
  permanentLinkSetExtraQueryParam: liffMethod("permanentLink.setExtraQueryParam", (payload) => [payload]),
  i18nSetLang: liffMethod("i18n.setLang", (payload) => [payload.trim()]),
  createShortcutOnHomeScreen: liffMethod("createShortcutOnHomeScreen", (payload) => [parseJson(payload)]),
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
