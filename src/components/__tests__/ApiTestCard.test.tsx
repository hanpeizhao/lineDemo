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

  it("shows a requirement error without disabling the run button", async () => {
    render(<ApiTestCard definition={definition} context={{ ...context, initialized: false }} />);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect((await screen.findAllByText(/LIFF/)).length).toBeGreaterThan(0);
    expect(definition.runner).not.toHaveBeenCalled();
  });

  it("does not show a run button for webhook events", () => {
    render(<ApiTestCard definition={{ ...definition, kind: "event", runner: undefined }} context={context} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Webhook/).length).toBeGreaterThan(0);
  });

  it("shows an availability error without disabling the run button", async () => {
    const runner = vi.fn().mockResolvedValue({ ok: true, data: "unexpected" });
    const isApiAvailable = vi.fn().mockResolvedValue(false);
    const unavailableDefinition = {
      ...definition,
      availability: "shareTargetPicker",
      runner,
    } as ApiDefinition;
    const unavailableContext = {
      ...context,
      liff: { isApiAvailable } as unknown as RunContext["liff"],
    };

    render(<ApiTestCard definition={unavailableDefinition} context={unavailableContext} />);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
    fireEvent.click(button);

    expect(await screen.findByText(/shareTargetPicker/)).toBeInTheDocument();
    expect(isApiAvailable).toHaveBeenCalledWith("shareTargetPicker");
    expect(runner).not.toHaveBeenCalled();
  });
});
