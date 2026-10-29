import { describe, expect, it } from "vitest";
// The test reads the source stylesheet directly; the app does not need Node types at runtime.
// @ts-expect-error The project intentionally does not include @types/node.
import { readFileSync } from "node:fs";
// @ts-expect-error The project intentionally does not include @types/node.
import { resolve } from "node:path";

const appCss = readFileSync(resolve((globalThis as unknown as { process: { cwd(): string } }).process.cwd(), "src/App.css"), "utf8");

describe("移动端响应式布局契约", () => {
  it("为窄屏提供独立的响应式布局规则", () => {
    expect(appCss).toMatch(/@media\s*\(max-width:\s*767px\)/);
    expect(appCss).toMatch(/\.api-tabs[^{}]*\{[^}]*overflow-x:\s*auto/s);
    expect(appCss).toMatch(/\.api-grid[^{}]*\{[^}]*grid-template-columns:\s*1fr/s);
    expect(appCss).toMatch(/\.api-card-header[^{}]*\{[^}]*flex-direction:\s*column/s);
  });

  it("保证移动端操作和长文本不会挤出卡片", () => {
    expect(appCss).toMatch(/\.api-card\s+button[^{}]*\{[^}]*width:\s*100%/s);
    expect(appCss).toMatch(/\.api-card\s+button[^{}]*\{[^}]*min-height:\s*44px/s);
    expect(appCss).toMatch(/\.result\s+pre[^{}]*\{[^}]*overflow-wrap:\s*anywhere/s);
  });
  it("keeps mobile api cards within the tab container", () => {
    expect(appCss).toMatch(/\.api-group,\s*\.api-grid,\s*\.api-card\s*\{[^}]*min-width:\s*0[^}]*width:\s*100%[^}]*max-width:\s*100%/s);
    expect(appCss).toMatch(/\.field,\s*\.notice,\s*\.blocked,\s*\.result\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/s);
  });
});
