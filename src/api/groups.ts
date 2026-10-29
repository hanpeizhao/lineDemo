import type { ApiGroup } from "./types";

export const API_TABS = [
  { id: "mini-app", label: "LINE MINI App APIs" },
  { id: "liff", label: "LIFF APIs" },
] as const;

export type ApiTabId = (typeof API_TABS)[number]["id"];

export const GROUPS_BY_TAB: Record<ApiTabId, readonly ApiGroup[]> = {
  "mini-app": ["service-messages", "common-profile", "iap-client", "iap-server", "webhook"],
  liff: [
    "liff-properties", "liff-initialization", "liff-environment", "liff-auth", "liff-profile",
    "liff-window", "liff-message", "liff-scan", "liff-permanent-link", "liff-plugins", "liff-mini-app",
  ],
};
