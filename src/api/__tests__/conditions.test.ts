import { describe, expect, it } from "vitest";
import { getRunState, normalizeError } from "../conditions";
import type { RunContext } from "../types";

const context = (overrides: Partial<RunContext> = {}): RunContext => ({
  initialized: true,
  isInClient: true,
  isLoggedIn: true,
  isMiniApp: true,
  isVerifiedMiniApp: true,
  hasCommonProfilePlugin: true,
  iapEnabled: true,
  hasServerAdapter: true,
  liff: {} as RunContext["liff"],
  ...overrides,
});

describe("API run conditions", () => {
  it("reports every unmet requirement", () => {
    const state = getRunState(["initialized", "loggedIn", "serverAdapter"], context({
      initialized: false,
      isLoggedIn: false,
      hasServerAdapter: false,
    }));

    expect(state.canRun).toBe(false);
    expect(state.reasons).toEqual(["LIFF 尚未初始化", "请先登录 LINE 用户", "尚未配置服务端适配器"]);
  });

  it("allows a test when all requirements are satisfied", () => {
    expect(getRunState(["initialized", "miniApp"], context())).toEqual({ canRun: true, reasons: [] });
  });

  it("normalizes unknown errors into a stable shape", () => {
    expect(normalizeError({ message: "Bad request", code: "400" })).toMatchObject({
      message: "Bad request",
      code: "400",
    });
    expect(normalizeError("network failed").message).toBe("network failed");
  });
});
