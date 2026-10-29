import { useMemo, useState } from "react";
import { getRunState } from "../api/conditions";
import type { ApiDefinition, RunContext, RunResult } from "../api/types";
import JsonEditor from "./JsonEditor";
import ResultPanel from "./ResultPanel";

const labels = { client: "CLIENT", server: "SERVER", event: "WEBHOOK" } as const;
type Props = { definition: ApiDefinition; context: RunContext };

export default function ApiTestCard({ definition, context }: Props) {
  const [payload, setPayload] = useState(definition.input.type === "none" ? "" : definition.input.defaultValue ?? "");
  const [result, setResult] = useState<RunResult | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const runState = useMemo(() => getRunState(definition.requirements, context), [definition.requirements, context]);

  async function run() {
    if (!definition.runner || !runState.canRun || running) return;
    setRunning(true);
    const started = performance.now();
    try { setResult(await definition.runner(payload, context)); }
    finally { setDurationMs(Math.round(performance.now() - started)); setRunning(false); }
  }

  return <article className="api-card">
    <header className="api-card-header"><div><div className="api-card-title-row"><h3>{definition.name}</h3><span className="tag">{labels[definition.kind]}</span></div><p>{definition.description}</p></div><a href={definition.docUrl} target="_blank" rel="noreferrer">DOCUMENT</a></header>
    {definition.input.type !== "none" && <JsonEditor input={definition.input} value={payload} onChange={setPayload} disabled={running} />}
    {definition.kind === "event" ? <p className="notice">Webhook 事件，仅展示 Payload 示例</p> : <><p className="notice">{definition.autoRun === false ? "需要手动运行，避免触发外部副作用。" : "可手动运行。"}</p>{runState.reasons.length > 0 && <p className="blocked">{runState.reasons.join("；")}</p>}<button type="button" onClick={run} disabled={!runState.canRun || running}>{running ? "RUNNING…" : "RUN"}</button></>}
    <ResultPanel result={result} durationMs={durationMs} />
  </article>;
}
