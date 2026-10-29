import { describe, expect, it } from "vitest";
import { miniAppApiRegistry } from "../registry";

describe("LINE MINI App API registry", () => {
  it("contains all MINI App and LIFF groups", () => {
    expect(new Set(miniAppApiRegistry.map((api) => api.group))).toEqual(
      new Set([
        "service-messages", "common-profile", "iap-client", "iap-server", "webhook",
        "liff-properties", "liff-initialization", "liff-environment", "liff-auth",
        "liff-profile", "liff-window", "liff-message", "liff-scan", "liff-permanent-link",
        "liff-plugins", "liff-mini-app",
      ]),
    );
  });

  it("contains ten active APIs and two webhook events", () => {
    expect(miniAppApiRegistry.filter((api) => api.kind === "client" || api.kind === "server")).toHaveLength(42);
    expect(miniAppApiRegistry.filter((api) => api.kind === "event")).toHaveLength(2);
    expect(miniAppApiRegistry.filter((api) => api.kind === "property")).toHaveLength(3);
  });

  it("uses unique IDs and official documentation links", () => {
    const ids = miniAppApiRegistry.map((api) => api.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(miniAppApiRegistry.every((api) => api.docUrl.startsWith("https://developers.line.biz/"))).toBe(true);
    expect(miniAppApiRegistry.filter((api) => api.kind === "client").every((api) => api.runner)).toBe(true);
  });

  it("only adds supported isApiAvailable lookup names", () => {
    const checkedIds = miniAppApiRegistry
      .filter((api) => api.availability)
      .map((api) => api.id);

    expect(checkedIds).toEqual([
      "liff-share-target-picker",
      "liff-scan-code-v2",
      "liff-scan-code",
      "liff-create-shortcut",
    ]);
    expect(miniAppApiRegistry.find((api) => api.id === "liff-share-target-picker")?.availability).toBe("shareTargetPicker");
    expect(miniAppApiRegistry.find((api) => api.id === "liff-get-app-language")?.availability).toBeUndefined();
    expect(miniAppApiRegistry.find((api) => api.id === "iap-create-payment")?.availability).toBeUndefined();
  });
});
