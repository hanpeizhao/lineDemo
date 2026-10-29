import type { ApiInput } from "../api/types";

type Props = { input: ApiInput; value: string; onChange: (value: string) => void; disabled?: boolean };

export default function JsonEditor({ input, value, onChange, disabled = false }: Props) {
  if (input.type === "none") return null;
  if (input.type === "text") {
    return <label className="field"><span>{input.label}</span><input type={input.secret ? "password" : "text"} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} /></label>;
  }
  return <label className="field"><span>{input.label}</span><textarea rows={input.rows ?? 5} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} spellCheck={false} /></label>;
}
