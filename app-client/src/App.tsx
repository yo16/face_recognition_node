import { useState } from 'react'
import './App.css'

type AnalyzeResult = {
  originalName: string;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  format: string | null;
  meanRgb: number[];
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [res, setRes] = useState<AnalyzeResult | null>(null);
  const [err, setErr] = useState<string>("");

  const onSend = async () => {
    if (!file) return;

    setErr("");
    setRes(null);

    const fd = new FormData();
    fd.append("image", file);

    const r = await fetch("/api/analyze", {
      method: "POST",
      body: fd,
    });

    if (!r.ok) {
      setErr(`error: ${r.status}`);
      return;
    }

    const json = (await r.json()) as AnalyzeResult;
    setRes(json);
  }

  return (
    <>
      <div style={{ padding: 16 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button onClick={onSend}>Send</button>

        {err && <p style={{ color: "red" }}>{err}</p>}
        {res && <pre>{JSON.stringify(res, null, 2)}</pre>}
      </div>
    </>
  )
}

export default App
