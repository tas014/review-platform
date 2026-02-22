import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { ref } from "vue";
import { basename, tempDir, join } from "@tauri-apps/api/path";
import { writeFile, readFile } from "@tauri-apps/plugin-fs";
import JSZip from "jszip";
import type { AnalysisExportData } from "../../../assets/interfaces/AnalysisFileData";

const analysisData = ref<null | AnalysisExportData>(null);

const videoUrl = ref<null | string>(null);
const videoName = ref<null | string>(null);

// Helper to safely convert OS paths to URL paths (handles Windows C:\... absolute paths)
const buildAssetUrl = (port: number, absolutePath: string) => {
  const cleanPath = absolutePath.replace(/\\/g, "/");
  const urlPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `http://127.0.0.1:${port}${encodeURI(urlPath)}`;
};

const selectVideo = async () => {
  try {
    // Tauri Dialog API opens the file selection window
    const selected = await open({
      multiple: false,
      title: "Select a videogame replay file (e.g., .mp4, .webm)",
      filters: [
        {
          name: "Video or Analysis",
          extensions: ["mp4", "webm", "mov", "an"],
        },
      ],
    });

    // Check if the user selected a file
    if (typeof selected === "string") {
      // Get the ephemeral port from the backend
      const port = await invoke<number>("get_video_server_port");

      // Construct local HTTP URL
      const filePath = buildAssetUrl(port, selected);
      const fileName = await basename(selected);

      if (fileName.endsWith(".an")) {
        // Read the .an zip file directly from disk using Tauri FS to bypass Windows CORS restrictions
        const zipFileBytes = await readFile(selected);
        const zip = await JSZip.loadAsync(zipFileBytes);

        const dataJsonFile = zip.file("data.json");
        if (!dataJsonFile)
          throw new Error("Invalid .an archive: missing data.json");
        const dataJsonStr = await dataJsonFile.async("string");
        const parsedData = JSON.parse(dataJsonStr) as AnalysisExportData;

        // Reconstruct audio blobs
        for (const bp of parsedData.breakpoints) {
          if (bp.voiceContent) {
            for (const vc of bp.voiceContent) {
              if (vc.filename) {
                const audioFile = zip.file(`audio/${vc.filename}`);
                if (audioFile) {
                  vc.fileBlob = await audioFile.async("blob");
                }
              }
            }
          }
        }

        analysisData.value = parsedData;

        // Find video file
        const videoFile = Object.values(zip.files).find((f) =>
          f.name.startsWith("video."),
        );
        if (videoFile) {
          const videoUint8Array = await videoFile.async("uint8array");
          const systemTempDir = await tempDir();
          const tempVideoPath = await join(systemTempDir, videoFile.name);
          await writeFile(tempVideoPath, videoUint8Array);

          videoUrl.value = buildAssetUrl(port, tempVideoPath);
          videoName.value = fileName;
        } else {
          throw new Error("Invalid .an archive: missing video file");
        }
      } else {
        videoUrl.value = filePath;
        videoName.value = fileName;
        analysisData.value = null;
      }
    } else {
      videoUrl.value = null;
      videoName.value = null;
      analysisData.value = null;
    }
  } catch (error) {
    console.error("Error opening file dialog or converting path:", error);
  }
};

export { videoUrl, videoName, analysisData, selectVideo };
