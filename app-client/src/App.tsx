import { useState, useEffect, useMemo } from 'react'

import { FaceCanvas, type FaceBox } from "./FaceCanvas";

import './App.css'

type AnalyzeResult = {
  originalName: string;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  format: string | null;
  meanRgb: number[];
  faceBoxes: FaceBox[];
  faceCount: number;
};

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [res, setRes] = useState<AnalyzeResult | null>(null);
    const [err, setErr] = useState<string>("");

    const previewUrl = useMemo(() => {
        if (!file) return "";
        return URL.createObjectURL(file);
    }, [file]);

    useEffect(() => {
        setRes(null);
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    }, [previewUrl]);

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
        //console.log(json);
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
                
                {previewUrl &&  (
                    <div style={{ marginTop: 16 }}>
                        <FaceCanvas
                            imageUrl={previewUrl}
                            boxes={res?.faceBoxes ?? []}
                            maxWidth={800}
                            strokeStyle="red"
                            baseLineWidth={2}
                        />
                    </div>
                )}

                {res && <pre>{JSON.stringify(res, null, 2)}</pre>}
                </div>
        </>
    )
}

export default App
