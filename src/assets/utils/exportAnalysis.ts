import { create, exists, mkdir } from "@tauri-apps/plugin-fs";
import { join, appDataDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import { Command } from "@tauri-apps/plugin-shell";
import type {
  AnalysisExportData,
  AnalysisExportFunction,
} from "../interfaces/AnalysisFileData";

export const exportAnalysisFile: AnalysisExportFunction = async (
  videoPath,
  breakpoints,
  videoStart,
  videoEnd,
  savePath,
): Promise<boolean> => {
  if (!videoPath) {
    return false;
  }

  try {
    let finalVideoPath = videoPath;
    let finalVideoStart = videoStart;
    let finalVideoEnd = videoEnd;

    const appData = await appDataDir();
    const systemTempDir = await join(appData, "temp");

    if (!(await exists(systemTempDir))) {
      await mkdir(systemTempDir, { recursive: true });
    }

    // Check if we need to trim the video
    if (videoStart !== null && videoEnd !== null && videoEnd > videoStart) {
      const extension = videoPath.split(".").pop() || "mp4";
      const trimmedFilename = `trimmed_${Date.now()}.${extension}`;
      finalVideoPath = await join(systemTempDir, trimmedFilename);

      const trimDuration = videoEnd - videoStart;
      const command = Command.sidecar("binaries/creative-ffmpeg", [
        "-ss",
        videoStart.toString(),
        "-i",
        videoPath,
        "-t",
        trimDuration.toString(),
        "-c",
        "copy",
        "-y",
        finalVideoPath,
      ]);

      const output = await command.execute();

      if (output.code !== 0) {
        console.error("FFmpeg Error:", output.stderr);
        throw new Error("FFmpeg failed to trim video.");
      }

      // Zero-out the bounds for the JSON payload since the video is literally cut to those bounds
      finalVideoStart = null;
      finalVideoEnd = videoEnd - videoStart;
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

    // If trimmed, shift their timestamps to 0
    if (videoStart !== null && videoEnd !== null && videoEnd > videoStart) {
      clonedBreakpoints.forEach((bp) => {
        bp.timeStamp = bp.timeStamp - videoStart;
      });
    }

    // Extract audio local paths and prepare JSON data
    const audioPaths: Record<string, string> = {};

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
      videoStart: finalVideoStart,
      videoEnd: finalVideoEnd,
    };

    // Zip using native Rust bindings with absolute file paths mapping perfectly bypassing all RAM limitations
    await invoke("pack_analysis_file", {
      savePath: savePath,
      videoPath: finalVideoPath,
      dataJson: JSON.stringify(exportData, null, 2),
      audioPaths: audioPaths,
    });

    return true;
  } catch (error) {
    console.error("Error exporting analysis file:", error);
    return false;
  }
};
