import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { ref } from "vue";
import { basename, tempDir, join } from "@tauri-apps/api/path";
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
        // Unpack the archive using the Rust backend to completely bypass Javascript engine memory limits natively
        const systemTempDir = await tempDir();
        const extractionTarget = await join(
          systemTempDir,
          fileName + "_extracted",
        );

        const dataJsonStr = await invoke<string>("unpack_analysis_file", {
          archivePath: selected,
          targetDir: extractionTarget,
        });

        const parsedData = JSON.parse(dataJsonStr) as AnalysisExportData;

        // Reconstruct audio blobs using fetch() to load the extracted wav files into Memory
        for (const bp of parsedData.breakpoints) {
          if (bp.voiceContent) {
            for (const vc of bp.voiceContent) {
              if (vc.filename) {
                const audioPath = await join(
                  extractionTarget,
                  "audio",
                  vc.filename,
                );
                const audioUrl = buildAssetUrl(port, audioPath);
                try {
                  const res = await fetch(audioUrl);
                  if (res.ok) {
                    vc.fileBlob = await res.blob();
                  }
                } catch (e) {
                  console.warn("Failed to reconstruct audio blob", e);
                }
              }
            }
          }
        }

        analysisData.value = parsedData;

        // Try to guess the video format by appending common extensions (or we could read the dir, but let's assume standard names)
        // A better approach is to have Rust give us the exact video path if there are multiple formats,
        // but for now, we will use the same buildAssetUrl over the target directory
        videoUrl.value = buildAssetUrl(
          port,
          await join(extractionTarget, "video.mp4"),
        );
        videoName.value = fileName;
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
