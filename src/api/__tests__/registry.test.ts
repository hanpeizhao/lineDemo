import { describe, expect, it } from "vitest";
import { miniAppApiRegistry } from "../registry";

describe("LINE MINI App API registry", () => {
  it("contains all five groups", () => {
    expect(new Set(miniAppApiRegistry.map((api) => api.group))).toEqual(
      new Set(["service-messages", "common-profile", "iap-client", "iap-server", "webhook"]),
    );
  });

  it("contains ten active APIs and two webhook events", () => {
    expect(miniAppApiRegistry.filter((api) => api.kind !== "event")).toHaveLength(10);
    expect(miniAppApiRegistry.filter((api) => api.kind === "event")).toHaveLength(2);
  });

  it("uses unique IDs and official documentation links", () => {
    const ids = miniAppApiRegistry.map((api) => api.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(miniAppApiRegistry.every((api) => api.docUrl.startsWith("https://developers.line.biz/"))).toBe(true);
  });
});
