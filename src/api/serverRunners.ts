import type { ApiRunner } from "./types";

export function createUnavailableServerRunner(message: string): ApiRunner {
  return async () => ({
    ok: false,
    error: {
      code: "SERVER_ADAPTER_UNAVAILABLE",
      message,
    },
  });
}
