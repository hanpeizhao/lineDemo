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

  it("uses the configured LIFF ID as the init default", () => {
    const init = miniAppApiRegistry.find((api) => api.id === "liff-init");

    expect(init?.input.type).toBe("json");
    if (init?.input.type !== "json") return;
    expect(JSON.parse(init.input.defaultValue)).toEqual({
      liffId: import.meta.env.VITE_LIFF_ID ?? "",
    });
  });

  it("runs LIFF property displays without repeating plugin registration", async () => {
    const properties = ["liff-id", "liff-ready", "liff-use"]
      .map((id) => miniAppApiRegistry.find((api) => api.id === id));
    const context = {
      initialized: true,
      isInClient: false,
      isLoggedIn: false,
      isMiniApp: true,
      isVerifiedMiniApp: true,
      hasCommonProfilePlugin: true,
      iapEnabled: false,
      hasServerAdapter: false,
      liff: {
        id: "test-liff-id",
        ready: Promise.resolve("ready"),
        use: () => { throw new Error("liff.use must not be called by the display runner"); },
      },
    } as never;

    expect(properties.every((definition) => definition?.runner)).toBe(true);
    await expect(properties[0]?.runner?.("", context)).resolves.toMatchObject({ ok: true, data: { id: "test-liff-id" } });
    await expect(properties[1]?.runner?.("", context)).resolves.toMatchObject({ ok: true, data: { ready: "ready" } });
    await expect(properties[2]?.runner?.("", context)).resolves.toMatchObject({ ok: true, data: { registered: true } });
  });

  it("shows when the startup plugin was not registered", async () => {
    const definition = miniAppApiRegistry.find((api) => api.id === "liff-use");
    const context = { hasCommonProfilePlugin: false } as never;

    await expect(definition?.runner?.("", context)).resolves.toMatchObject({ ok: true, data: { registered: false } });
  });
});
