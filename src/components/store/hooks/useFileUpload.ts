import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { ref } from "vue";
import { basename } from "@tauri-apps/api/path";
import JSZip from "jszip";
import Breakpoint from "../../../assets/interfaces/BreakpointType";

export interface AnalysisExportData {
  breakpoints: Breakpoint[];
  videoStart: number | null;
  videoEnd: number | null;
}

const analysisData = ref<null | AnalysisExportData>(null);

const videoUrl = ref<null | string>(null);
const videoName = ref<null | string>(null);

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
      // We must encode the path BUT on Linux/Unix absolute paths start with /
      // so it becomes http://127.0.0.1:PORT//home/user/...
      // tiny_http will see path as "//home/user/..." and we decode it.
      const filePath = `http://127.0.0.1:${port}${encodeURI(selected)}`;
      const fileName = await basename(selected);

      if (fileName.endsWith(".an")) {
        const response = await fetch(filePath);
        const blob = await response.blob();
        const zip = await JSZip.loadAsync(blob);

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
          const videoBlob = await videoFile.async("blob");
          const videoObjUrl = URL.createObjectURL(videoBlob);
          videoUrl.value = videoObjUrl;
          videoName.value = fileName;
          console.log("Analysis loaded successfully");
        } else {
          throw new Error("Invalid .an archive: missing video file");
        }
      } else {
        videoUrl.value = filePath;
        videoName.value = fileName;
        analysisData.value = null;
        console.log("Video loaded successfully with URL:", videoUrl.value);
      }
    } else {
      console.log("No file selected.");
      videoUrl.value = null;
      analysisData.value = null;
    }
  } catch (error) {
    console.error("Error opening file dialog or converting path:", error);
  }
};

export { videoUrl, videoName, analysisData, selectVideo };
