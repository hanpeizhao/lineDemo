import type liff from "@line/liff";

export type ApiGroup =
  | "service-messages"
  | "common-profile"
  | "iap-client"
  | "iap-server"
  | "webhook";

export type ApiKind = "client" | "server" | "event";

export type ApiRequirement =
  | "initialized"
  | "inLineClient"
  | "loggedIn"
  | "miniApp"
  | "verifiedMiniApp"
  | "commonProfilePlugin"
  | "iapEnabled"
  | "serverAdapter";

export type ApiInput =
  | { type: "none" }
  | { type: "text"; label: string; defaultValue?: string; secret?: boolean }
  | { type: "json"; label: string; defaultValue: string; rows?: number };

export type RunContext = {
  initialized: boolean;
  isInClient: boolean;
  isLoggedIn: boolean;
  isMiniApp: boolean;
  isVerifiedMiniApp: boolean;
  hasCommonProfilePlugin: boolean;
  iapEnabled: boolean;
  hasServerAdapter: boolean;
  liff: typeof liff;
};

export type RunState = {
  canRun: boolean;
  reasons: string[];
};

export type RunError = {
  message: string;
  code?: string;
  details?: unknown;
  raw?: unknown;
};

export type RunResult =
  | { ok: true; data?: unknown }
  | { ok: false; error: RunError };

export type ApiRunner = (payload: string, context: RunContext) => Promise<RunResult>;

export type ApiDefinition = {
  id: string;
  group: ApiGroup;
  name: string;
  kind: ApiKind;
  docUrl: string;
  description: string;
  input: ApiInput;
  requirements: ApiRequirement[];
  autoRun: boolean;
  runner?: ApiRunner;
  example?: unknown;
};
