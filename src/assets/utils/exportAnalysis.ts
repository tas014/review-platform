import { save } from "@tauri-apps/plugin-dialog";
import { create } from "@tauri-apps/plugin-fs";
import { tempDir, join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
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
    // Parse the local path from the asset URL
    const urlObj = new URL(videoUrl);
    const localPath = urlObj.searchParams.get("path");

    if (!localPath) {
      throw new Error("Invalid video URL: missing path parameter");
    }

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

    // Extract audio local paths and prepare JSON data
    const audioPaths: Record<string, string> = {};
    const systemTempDir = await tempDir();

    // We must write all VoiceNote blobs to physical disk temp files first because Rust ZipWriter
    // can only read from absolute file paths, not JS Memory blobs.
    for (const bp of clonedBreakpoints) {
      if (bp.voiceContent) {
        for (const vc of bp.voiceContent) {
          if (vc.fileBlob) {
            const filename = `voice_${vc.id}.webm`;
            vc.filename = filename;

            const tempWavePath = await join(systemTempDir, filename);
            const audioData = await vc.fileBlob.arrayBuffer();

            // This is safe because audio blobs are tiny (kilobytes) unlike the huge video blobs
            const audioFile = await create(tempWavePath);
            await audioFile.write(new Uint8Array(audioData));
            await audioFile.close();

            audioPaths[filename] = tempWavePath;
            // Delete the blob layer so we can cleanly serialize the JSON payload
            delete vc.fileBlob;
          }
        }
      }
    }

    const exportData: AnalysisExportData = {
      breakpoints: clonedBreakpoints,
      videoStart,
      videoEnd,
    };

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

    // Zip using native Rust bindings with absolute file paths mapping perfectly bypassing all RAM limitations
    await invoke("pack_analysis_file", {
      savePath: savePath,
      videoPath: localPath,
      dataJson: JSON.stringify(exportData, null, 2),
      audioPaths: audioPaths,
    });

    return true;
  } catch (error) {
    console.error("Error exporting analysis file:", error);
    return false;
  }
};
