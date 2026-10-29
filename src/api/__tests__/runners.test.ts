import { describe, expect, it, vi } from "vitest";
import { clientRunners } from "../clientRunners";
import { createUnavailableServerRunner } from "../serverRunners";
import type { RunContext } from "../types";

const context = (liff: unknown): RunContext => ({
  initialized: true,
  isInClient: true,
  isLoggedIn: true,
  isMiniApp: true,
  isVerifiedMiniApp: true,
  hasCommonProfilePlugin: true,
  iapEnabled: true,
  hasServerAdapter: true,
  liff: liff as RunContext["liff"],
});

describe("API runners", () => {
  it("passes parsed product arguments to the IAP client API", async () => {
    const getPlatformProducts = vi.fn().mockResolvedValue({ product: { price: 100 } });
    const result = await clientRunners.getPlatformProducts(
      '{"productIds":["product"]}',
      context({ iap: { getPlatformProducts } }),
    );

    expect(getPlatformProducts).toHaveBeenCalledWith({ productIds: ["product"] });
    expect(result).toEqual({ ok: true, data: { product: { price: 100 } } });
  });

  it("returns a normalized error for invalid JSON", async () => {
    const result = await clientRunners.commonProfileFill("{", context({ $commonProfile: { fill: vi.fn() } }));
    expect(result).toMatchObject({ ok: false, error: { message: expect.any(String) } });
  });

  it("fails safely when a server adapter is not configured", async () => {
    const result = await createUnavailableServerRunner("Server adapter is not configured")("{}", context({}));
    expect(result).toEqual({
      ok: false,
      error: { code: "SERVER_ADAPTER_UNAVAILABLE", message: "Server adapter is not configured" },
    });
  });
});
