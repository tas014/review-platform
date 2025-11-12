import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ref } from "vue";
import { basename } from "@tauri-apps/api/path";

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
          name: "Video",
          extensions: ["mp4", "webm", "mov"],
        },
      ],
    });

    // Check if the user selected a file
    if (typeof selected === "string") {
      const filePath = convertFileSrc(selected);
      const fileName = await basename(selected);

      videoUrl.value = filePath;
      videoName.value = fileName;
      console.log("Video loaded successfully with URL:", videoUrl.value);
    } else {
      console.log("No file selected.");
      videoUrl.value = null;
    }
  } catch (error) {
    console.error("Error opening file dialog or converting path:", error);
  }
};

export { videoUrl, videoName, selectVideo };
