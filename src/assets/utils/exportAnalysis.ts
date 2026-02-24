import JSZip from "jszip";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
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

    // Fetch the video directly using the internal local asset server instead of explicit FS paths
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error("Failed to fetch video for export");
    const videoBlob = await response.blob();

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
    const arrayBuffer = await zipBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

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

    // Write the file to disk using Tauri FS plugin
    await writeFile(savePath, uint8Array);

    return true;
  } catch (error) {
    console.error("Error exporting analysis file:", error);
    return false;
  }
};
