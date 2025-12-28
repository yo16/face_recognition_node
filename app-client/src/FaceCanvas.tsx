import { useEffect, useRef } from "react";

export type FaceBox = {
    xMin: number;
    yMin: number;
    width: number;
    height: number;
};

export type FaceCanvasProps = {
    imageUrl: string;
    boxes: FaceBox[];
    maxWidth?: number;
    strokeStyle?: string;
    baseLineWidth?: number;
};

export function FaceCanvas(props: FaceCanvasProps) {
    const {
        imageUrl,
        boxes,
        maxWidth = 800,
        strokeStyle = "red",
        baseLineWidth = 2,
    } = props;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const renderIdRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rid = ++renderIdRef.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!imageUrl) return;

        const img = new Image();

        img.onload = () => {
            if (renderIdRef.current !== rid) return;

            const imgW = img.naturalWidth;
            const imgH = img.naturalHeight;

            const scale = imgW > maxWidth ? maxWidth / imgW : 1;

            canvas.width = Math.round(imgW * scale);
            canvas.height = Math.round(imgH * scale);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            ctx.lineWidth = baseLineWidth * Math.max(1, scale);
            ctx.strokeStyle = strokeStyle;

            for (const b of boxes) {
                ctx.strokeRect(
                b.xMin * scale,
                b.yMin * scale,
                b.width * scale,
                b.height * scale
                );
            }
        };

        img.onerror = () => {
            if (renderIdRef.current !== rid) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        img.src = imageUrl;
    }, [
        imageUrl,
        boxes,
        maxWidth,
        strokeStyle,
        baseLineWidth,
    ]);

  return (
    <canvas
        ref={canvasRef}
        style={{ border: "1px solid #ccc" }}
    />
  );
}
