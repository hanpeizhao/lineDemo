import { describe, expect, it } from "vitest";
import { API_TABS, GROUPS_BY_TAB } from "../groups";

describe("API tabs", () => {
  it("defines Chinese tabs for MINI App and LIFF APIs", () => {
    expect(API_TABS.map((tab) => tab.id)).toEqual(["mini-app", "liff"]);
    expect(API_TABS.map((tab) => tab.label)).toEqual(["LINE MINI App APIs", "LIFF APIs"]);
  });

  it("keeps MINI App and LIFF groups separate", () => {
    expect(GROUPS_BY_TAB["mini-app"]).toEqual([
      "service-messages", "common-profile", "iap-client", "iap-server", "webhook",
    ]);
    expect(GROUPS_BY_TAB.liff).toContain("liff-environment");
    expect(GROUPS_BY_TAB.liff).not.toContain("service-messages");
  });
});
