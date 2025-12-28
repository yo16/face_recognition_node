import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";

import { detectFaces } from "./faceDetector";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Express!" });
});

app.post(
  "/api/analyze",
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const buf = req.file.buffer;

    const faceBoxes = await detectFaces(buf);
    //console.log({faceBoxes});
    
    const meta = await sharp(buf).metadata();
    const stats = await sharp(buf).stats();

    const mean = stats.channels.map((c) => Math.round(c.mean));

    return res.json({
      originalName: req.file.originalname,
      mime: req.file.mimetype,
      sizeBytes: req.file.size,
      width: meta.width ?? null,
      height: meta.height ?? null,
      format: meta.format ?? null,
      meanRgb: mean.slice(0, 3),
      faceBoxes: faceBoxes,
      faceCount: faceBoxes.length,
    });
  }
);

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
