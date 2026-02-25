import { readDir, exists, mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { type } from "@tauri-apps/plugin-os";
import { ref } from "vue";
import { basename, appDataDir, join } from "@tauri-apps/api/path";
import type { AnalysisExportData } from "../../../assets/interfaces/AnalysisFileData";

const analysisData = ref<null | AnalysisExportData>(null);

const videoPath = ref<null | string>(null);
const videoUrl = ref<null | string>(null);
const videoName = ref<null | string>(null);
const pendingProcess = ref<string | null>(null);

const buildAssetUrl = (port: number, absolutePath: string) => {
  if (type() !== "windows") {
    const url = `http://127.0.0.1:${port}/?path=${encodeURIComponent(absolutePath)}`;
    return url;
  } else {
    // Windows WebView2 requires `http://asset.localhost/` formatting to bypass strict CORS
    const assetUrl = convertFileSrc(absolutePath);
    return type() === "windows"
      ? assetUrl.replace("asset://localhost/", "http://asset.localhost/")
      : assetUrl;
  }
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
      pendingProcess.value = "Loading file...";
      videoUrl.value = null; // Unmount current video so the new one triggers @loadedmetadata

      // Get the ephemeral port from the backend
      const port = await invoke<number>("get_video_server_port");

      // Construct local HTTP URL
      const filePath = buildAssetUrl(port, selected);
      const fileName = await basename(selected);

      if (fileName.endsWith(".an") || fileName.endsWith(".anal")) {
        // Unpack the archive using the Rust backend to completely bypass Javascript engine memory limits natively
        const appData = await appDataDir();
        const systemTempDir = await join(appData, "temp");

        const tempDirExists = await exists("temp", {
          baseDir: BaseDirectory.AppData,
        });
        if (!tempDirExists) {
          await mkdir("temp", {
            baseDir: BaseDirectory.AppData,
            recursive: true,
          });
        }

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

        // Dynamically find the exact video file name instead of assuming .mp4
        const entries = await readDir(extractionTarget);
        const videoEntry = entries.find(
          (e) => e.name && e.name.startsWith("video."),
        );

        if (!videoEntry || !videoEntry.name) {
          throw new Error("No video file found in .an archive.");
        }

        const exactVideoPath = await join(extractionTarget, videoEntry.name);
        videoPath.value = exactVideoPath;
        videoUrl.value = buildAssetUrl(port, exactVideoPath);
        videoName.value = fileName;
      } else {
        videoPath.value = selected;
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
    pendingProcess.value = null;
  }
};

export {
  videoUrl,
  videoPath,
  videoName,
  analysisData,
  pendingProcess,
  selectVideo,
};
