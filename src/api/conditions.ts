import type { ApiRequirement, RunContext, RunState } from "./types";

const messages: Record<ApiRequirement, string> = {
  initialized: "LIFF 尚未初始化",
  inLineClient: "此 API 仅能在 LINE 客户端中运行",
  loggedIn: "请先登录 LINE 用户",
  miniApp: "此 API 仅能在 LINE MINI App 中运行",
  verifiedMiniApp: "此功能仅限已认证的 LINE MINI App",
  commonProfilePlugin: "Common Profile 插件尚未安装",
  iapEnabled: "当前 MINI App 未开通应用内购买",
  serverAdapter: "尚未配置服务端适配器",
};

export function getRunState(requirements: ApiRequirement[], context: RunContext): RunState {
  const checks: Record<ApiRequirement, boolean> = {
    initialized: context.initialized,
    inLineClient: context.isInClient,
    loggedIn: context.isLoggedIn,
    miniApp: context.isMiniApp,
    verifiedMiniApp: context.isVerifiedMiniApp,
    commonProfilePlugin: context.hasCommonProfilePlugin,
    iapEnabled: context.iapEnabled,
    serverAdapter: context.hasServerAdapter,
  };
  const reasons = requirements.filter((requirement) => !checks[requirement]).map((requirement) => messages[requirement]);
  return { canRun: reasons.length === 0, reasons };
}

export function normalizeError(error: unknown) {
  if (error && typeof error === "object") {
    const value = error as { message?: unknown; code?: unknown; details?: unknown };
    return {
      message: typeof value.message === "string" ? value.message : "API 调用失败",
      ...(typeof value.code === "string" ? { code: value.code } : {}),
      ...(value.details !== undefined ? { details: value.details } : {}),
      raw: error,
    };
  }
  return { message: typeof error === "string" ? error : "API 调用失败", raw: error };
}
