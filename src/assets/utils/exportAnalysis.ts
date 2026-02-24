import JSZip from "jszip";
import { save } from "@tauri-apps/plugin-dialog";
import { create, readFile } from "@tauri-apps/plugin-fs";
import type {
  AnalysisExportData,
  AnalysisExportFunction,
} from "../interfaces/AnalysisFileData";

export const exportAnalysisFile: AnalysisExportFunction = async (
  videoUrl,
  breakpoints,
  videoStart,
  videoEnd,
): Promise<boolean> => {
  if (!videoUrl) {
    return false;
  }

  try {
    const zip = new JSZip();

    // Parse the local path from the asset URL
    const urlObj = new URL(videoUrl);
    const localPath = urlObj.searchParams.get("path");

    if (!localPath) {
      throw new Error("Invalid video URL: missing path parameter");
    }

    // Read the video directly using the native filesystem plugin instead of fetch.
    // This resolves WebView2 memory limits on Windows for large files.
    const videoUint8Array = await readFile(localPath);
    const videoBlob = new Blob([videoUint8Array]);

    // Determine video extension from the file path
    const extension = localPath.split(".").pop()?.toLowerCase() || "mp4";
    zip.file(`video.${extension}`, videoBlob);

    // Deep clone the breakpoints so we don't mutate the app state
    const clonedBreakpoints = breakpoints.map((bp) => ({
      ...bp,
      textContent: bp.textContent
        ? bp.textContent.map((tc) => ({ ...tc }))
        : undefined,
      voiceContent: bp.voiceContent
        ? bp.voiceContent.map((vc) => ({ ...vc }))
        : undefined,
      drawingContent: bp.drawingContent ? { ...bp.drawingContent } : undefined,
    }));

    // Extract audio blobs and prepare JSON data
    const audioFolder = zip.folder("audio");
    clonedBreakpoints.forEach((bp) => {
      if (bp.voiceContent) {
        bp.voiceContent.forEach((vc) => {
          if (vc.fileBlob && audioFolder) {
            // Assign a filename to the voice content
            const filename = `voice_${vc.id}.webm`;
            vc.filename = filename;

            // Add the actual binary audio data to the zip and delete the blob from the JSON payload since it cannot be serialized
            audioFolder.file(filename, vc.fileBlob);
            delete vc.fileBlob;
          }
        });
      }
    });

    const exportData: AnalysisExportData = {
      breakpoints: clonedBreakpoints,
      videoStart,
      videoEnd,
    };

    // Add data to zip
    zip.file("data.json", JSON.stringify(exportData, null, 2));

    // Generate the zip file blob
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Prompt user to save the file
    const savePath = await save({
      filters: [
        {
          name: "Analysis File",
          extensions: ["an"],
        },
      ],
      defaultPath: "my_analysis.an",
    });

    if (!savePath) {
      // User canceled the dialog
      return false;
    }

    // Stream the file to disk using Tauri FS plugin to prevent IPC memory exhaustion
    const reader = zipBlob.stream().getReader();
    const file = await create(savePath);
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await file.write(value);
      }
    } finally {
      await file.close();
    }

    return true;
  } catch (error) {
    console.error("Error exporting analysis file:", error);
    return false;
  }
};
