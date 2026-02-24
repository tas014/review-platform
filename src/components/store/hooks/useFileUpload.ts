import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { ref } from "vue";
import { basename, tempDir, join } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import JSZip from "jszip";
import type { AnalysisExportData } from "../../../assets/interfaces/AnalysisFileData";

const analysisData = ref<null | AnalysisExportData>(null);

const videoUrl = ref<null | string>(null);
const videoName = ref<null | string>(null);
const isLoading = ref<boolean>(false);

// Helper to safely convert OS paths to URL paths (handles Windows C:\... absolute paths)
const buildAssetUrl = (port: number, absolutePath: string) => {
  const url = `http://127.0.0.1:${port}/?path=${encodeURIComponent(absolutePath)}`;
  return url;
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
          extensions: ["mp4", "webm", "mov", "an", "anal"],
        },
      ],
    });

    // Check if the user selected a file
    if (typeof selected === "string") {
      isLoading.value = true;
      videoUrl.value = null; // Unmount current video so the new one triggers @loadedmetadata

      // Get the ephemeral port from the backend
      const port = await invoke<number>("get_video_server_port");

      // Construct local HTTP URL
      const filePath = buildAssetUrl(port, selected);
      const fileName = await basename(selected);

      if (fileName.endsWith(".an") || fileName.endsWith(".anal")) {
        // Fetch the .an zip file using the local server to avoid OS file reading restrictions
        const response = await fetch(filePath);
        if (!response.ok) throw new Error("Failed to fetch .an archive");
        const zipFileBytes = new Uint8Array(await response.arrayBuffer());
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
      // User canceled the file selection, so we retain the current file on screen.
      return;
    }
  } catch (error) {
    console.error("Error opening file dialog or converting path:", error);
  } finally {
    isLoading.value = false;
  }
};

export { videoUrl, videoName, analysisData, isLoading, selectVideo };
