import { createApp } from "vue";
import App from "./App.vue";
import { remove, readDir, exists, BaseDirectory } from "@tauri-apps/plugin-fs";

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
          await remove(`voice_notes/${entry.name}`, {
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
