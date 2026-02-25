import { createApp } from "vue";
import App from "./App.vue";
import { remove, readDir, exists, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

const cleanupVoiceNotes = async () => {
  try {
    const dirExists = await exists("voice_notes", {
      baseDir: BaseDirectory.AppData,
    });

    if (dirExists) {
      const entries = await readDir("voice_notes", {
        baseDir: BaseDirectory.AppData,
      });

      for (const entry of entries) {
        if (entry.isFile) {
          const filePath = await join("voice_notes", entry.name);
          await remove(filePath, {
            baseDir: BaseDirectory.AppData,
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to cleanup voice notes on startup:", error);
  }
};

const cleanupTempData = async () => {
  try {
    const dirExists = await exists("temp", {
      baseDir: BaseDirectory.AppData,
    });

    if (dirExists) {
      await remove("temp", {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });
    }
  } catch (error) {
    console.error("Failed to cleanup temp data on startup:", error);
  }
};

// Run cleanup asynchronously
cleanupVoiceNotes();
cleanupTempData();

createApp(App).mount("#app");
