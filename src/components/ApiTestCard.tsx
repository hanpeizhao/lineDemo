import { useMemo, useState } from "react";
import { getRunState } from "../api/conditions";
import type { ApiDefinition, RunContext, RunResult } from "../api/types";
import JsonEditor from "./JsonEditor";
import ResultPanel from "./ResultPanel";

const labels = { client: "客户端", server: "服务端", event: "Webhook", property: "属性" } as const;
type Props = { definition: ApiDefinition; context: RunContext };

export default function ApiTestCard({ definition, context }: Props) {
  const [payload, setPayload] = useState(definition.input.type === "none" ? "" : definition.input.defaultValue ?? "");
  const [result, setResult] = useState<RunResult | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const requirementState = useMemo(() => getRunState(definition.requirements, context), [definition.requirements, context]);
  const runState = useMemo(() => ({ ...requirementState, canRun: true }), [requirementState]);

  async function run() {
    if (!definition.runner || running) return;
    setRunning(true);
    const started = performance.now();
    try {
      if (runState.reasons.length > 0) {
        setResult({
          ok: false,
          error: {
            code: "REQUIREMENT_NOT_MET",
            message: runState.reasons.join("；"),
          },
        });
        return;
      }
      if (definition.availability) {
        try {
          const available = await context.liff.isApiAvailable(definition.availability);
          if (!available) {
            setResult({
              ok: false,
              error: {
                code: "API_NOT_AVAILABLE",
                message: `当前环境不支持 ${definition.name}（liff.isApiAvailable(\"${definition.availability}\") 返回 false）`,
              },
            });
            return;
          }
        } catch (error) {
          setResult({
            ok: false,
            error: {
              code: "API_AVAILABILITY_CHECK_FAILED",
              message: `检查 ${definition.name} 可用性失败：${error instanceof Error ? error.message : String(error)}`,
              raw: error,
            },
          });
          return;
        }
      }
      setResult(await definition.runner(payload, context));
    }
    finally { setDurationMs(Math.round(performance.now() - started)); setRunning(false); }
  }

  return <article className="api-card">
    <header className="api-card-header"><div><div className="api-card-title-row"><h3>{definition.name}</h3><span className="tag">{labels[definition.kind]}</span></div><p>{definition.description}</p></div><a href={definition.docUrl} target="_blank" rel="noreferrer">查看文档</a></header>
    {definition.input.type !== "none" && <JsonEditor input={definition.input} value={payload} onChange={setPayload} disabled={running} />}
    {definition.kind === "event" ? <p className="notice">Webhook 事件，仅展示 Payload 示例</p> : !definition.runner ? <p className="notice">只读或启动阶段 API，由应用初始化流程处理。</p> : <><p className="notice">{definition.autoRun === false ? "需要手动运行，避免触发外部副作用。" : "可手动运行。"}</p>{runState.reasons.length > 0 && <p className="blocked">{runState.reasons.join("；")}</p>}<button type="button" onClick={run} disabled={!runState.canRun || running}>{running ? "运行中…" : "运行"}</button></>}
    <ResultPanel result={result} durationMs={durationMs} />
  </article>;
}
