import type { RunResult } from "../api/types";

type Props = { result: RunResult | null; durationMs: number | null };

export default function ResultPanel({ result, durationMs }: Props) {
  if (!result) return null;
  return <div className={`result ${result.ok ? "result-success" : "result-error"}`}><div className="result-header"><strong>{result.ok ? "成功" : "失败"}</strong>{durationMs !== null && <span>{durationMs} ms</span>}</div><pre>{JSON.stringify(result.ok ? result.data ?? null : result.error, null, 2)}</pre></div>;
}
