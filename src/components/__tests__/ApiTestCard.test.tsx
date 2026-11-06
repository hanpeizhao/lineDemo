// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ApiTestCard from "../ApiTestCard";
import type { ApiDefinition, RunContext } from "../../api/types";

const context: RunContext = {
  initialized: true,
  isInClient: true,
  isLoggedIn: true,
  isMiniApp: true,
  isVerifiedMiniApp: true,
  hasCommonProfilePlugin: true,
  iapEnabled: true,
  hasServerAdapter: false,
  liff: {} as RunContext["liff"],
};

const definition: ApiDefinition = {
  id: "test-api",
  group: "iap-client",
  name: "Test API",
  kind: "client",
  docUrl: "https://developers.line.biz/en/reference/line-mini-app/",
  description: "Test description",
  input: { type: "json", label: "Arguments", defaultValue: '{"value":1}' },
  requirements: ["initialized"],
  autoRun: false,
  runner: vi.fn().mockResolvedValue({ ok: true, data: { value: 2 } }),
};

describe("ApiTestCard", () => {
  afterEach(cleanup);

  it("runs the API and shows its JSON result", async () => {
    render(<ApiTestCard definition={definition} context={context} />);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(/value/)).toBeInTheDocument();
    expect(definition.runner).toHaveBeenCalledWith('{"value":1}', context);
  });

  it("runs even when the page requirements are unmet", async () => {
    const runner = vi.fn().mockResolvedValue({ ok: true, data: "native-scan-result" });
    const webContext = { ...context, initialized: false, isInClient: false, isLoggedIn: false };
    render(<ApiTestCard definition={{ ...definition, requirements: ["initialized", "inLineClient", "loggedIn"], runner }} context={webContext} />);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(await screen.findByText(/native-scan-result/)).toBeInTheDocument();
    expect(runner).toHaveBeenCalledWith('{"value":1}', webContext);
  });

  it("does not show a run button for webhook events", () => {
    render(<ApiTestCard definition={{ ...definition, kind: "event", runner: undefined }} context={context} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Webhook/).length).toBeGreaterThan(0);
  });

  it("does not preflight availability and displays the actual API failure", async () => {
    const runner = vi.fn().mockResolvedValue({ ok: false, error: { code: "FORBIDDEN", message: "actual LIFF rejection" } });
    const isApiAvailable = vi.fn(() => { throw new Error("must not preflight"); });
    const webContext = { ...context, isInClient: false, liff: { ...context.liff, isApiAvailable } };
    render(<ApiTestCard definition={{ ...definition, requirements: ["inLineClient"], runner }} context={webContext} />);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(/actual LIFF rejection/)).toBeInTheDocument();
    expect(isApiAvailable).not.toHaveBeenCalled();
    expect(runner).toHaveBeenCalledOnce();
  });
});
