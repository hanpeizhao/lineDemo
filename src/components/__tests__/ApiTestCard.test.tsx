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
    fireEvent.click(screen.getByRole("button", { name: "运行" }));
    expect(await screen.findByText(/value/)).toBeInTheDocument();
    expect(definition.runner).toHaveBeenCalledWith('{"value":1}', context);
  });

  it("disables run when a requirement is not met", () => {
    render(<ApiTestCard definition={definition} context={{ ...context, initialized: false }} />);
    expect(screen.getByRole("button", { name: "运行" })).toBeDisabled();
    expect(screen.getByText("LIFF 尚未初始化")).toBeInTheDocument();
  });

  it("does not show a run button for webhook events", () => {
    render(<ApiTestCard definition={{ ...definition, kind: "event", runner: undefined }} context={context} />);
    expect(screen.queryByRole("button", { name: "运行" })).not.toBeInTheDocument();
    expect(screen.getByText("Webhook 事件，仅展示 Payload 示例")).toBeInTheDocument();
  });
});
