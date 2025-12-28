import * as faceDetection from "@tensorflow-models/face-detection";
import * as tf from "@tensorflow/tfjs";
import sharp from "sharp";

let detectorPromise:
    | Promise<faceDetection.FaceDetector>
    | null = null;

export async function getFaceDetector() {
    if (detectorPromise) return detectorPromise;

    detectorPromise = (async () => {
        await tf.ready();

        const model =
            faceDetection.SupportedModels.MediaPipeFaceDetector;

        const detectorConfig:
            faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
                runtime: "tfjs",
                maxFaces: 10,
                // modelType: "short", // 軽め（速め）
                modelType: "full", // 重め（遅い）
            };

        return faceDetection.createDetector(model, detectorConfig);
    })();

    return detectorPromise;
}

export async function detectFaces(image: Buffer) {
    const detector = await getFaceDetector();
    
    const { data, info } = await sharp(image)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const imageTensor = tf.tensor3d(
        new Uint8Array(data),
        [info.height, info.width, info.channels],
        "int32"
    );

    try {
        const faces = await detector.estimateFaces(imageTensor, {
            flipHorizontal: false,
        });
        console.log({faces});
      
        const boxes = faces.map((f) => {
            const b = f.box;
            return {
                xMin: b.xMin,
                yMin: b.yMin,
                xMax: b.xMax,
                yMax: b.yMax,
                width: b.width,
                height: b.height,
            };
        });
      
        return boxes;
    } finally {
        imageTensor.dispose();
    }
}
