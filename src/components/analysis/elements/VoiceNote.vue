<script setup lang="ts">
import { computed, ref, onUnmounted, watch } from "vue";
import {
  startRecording as pluginStart,
  stopRecording as pluginStop,
} from "tauri-plugin-audio-recorder-api";
import { readFile, mkdir, exists, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join, appDataDir } from "@tauri-apps/api/path";
import VoiceIcon from "../../icons/Voice.vue";
import AudioWaveIcon from "../../icons/AudioWave.vue";
import PlayPause from "../../icons/PlayPause.vue";
import Stop from "../../icons/Stop.vue";
import Record from "../../icons/Record.vue";

const props = defineProps<{
  x: number;
  y: number;
}>();

// Using defineModel for voiceData which will store the blob
const voiceData = defineModel<Blob | null>();

const isRecording = ref(false);
const isPlaying = ref(false);
const audioPlayer = ref<HTMLAudioElement | null>(null);
const audioUrl = ref<string | null>(null);
const duration = ref(0);
const currentTime = ref(0);
const isCollapsed = defineModel<boolean>("isCollapsed", { default: false });
const isVisible = computed(() => !isCollapsed.value);
let recordingInterval: ReturnType<typeof setInterval> | null = null;
const startPos = { x: 0, y: 0 };

const hasAudio = computed(() => {
  return voiceData.value && voiceData.value.size > 0;
});

const formattedDuration = computed(() => {
  if (!hasAudio.value && !isRecording.value) return "no audio";

  const timeToFormat = isPlaying.value ? currentTime.value : duration.value;

  const m = Math.floor(timeToFormat / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(timeToFormat % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
});

const emit = defineEmits<{
  (e: "dragStart", event: MouseEvent): void;
}>();

const isFlippedX = computed(() => props.x > 85);

const stylePosition = computed(() => {
  const style: Record<string, string> = {
    position: "absolute",
  };

  if (isFlippedX.value) {
    // Compensate for icon width (5rem) to keep the visual anchor point consistent
    style.right = `calc(${100 - props.x}% - 5rem)`;
    style.marginRight = "0";
    style.maxWidth = `${props.x}%`;
  } else {
    style.left = `${props.x}%`;
    style.marginLeft = "0";
    style.maxWidth = `${100 - props.x}%`;
  }

  style.top = `${props.y}%`;

  return style;
});

// Create URL from Blob when model changes
const updateAudioUrl = () => {
  // Revoke previous URL if there is one
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }

  if (voiceData.value instanceof Blob && voiceData.value.size > 0) {
    audioUrl.value = URL.createObjectURL(voiceData.value);
    setupAudioPlayer(audioUrl.value);
  } else {
    // If voiceData is null/undefined or empty, clear player
    if (audioPlayer.value) {
      audioPlayer.value.pause();
      audioPlayer.value = null;
      isPlaying.value = false;
    }
    duration.value = 0;
    currentTime.value = 0;
  }
};

const handleIconMouseDown = (event: MouseEvent) => {
  startPos.x = props.x;
  startPos.y = props.y;
  emit("dragStart", event);
};

const handleIconClick = () => {
  // If position hasn't changed, consider it a click -> toggle
  if (
    Math.abs(props.x - startPos.x) < 1.0 &&
    Math.abs(props.y - startPos.y) < 1.0
  ) {
    isCollapsed.value = !isCollapsed.value;
  }
};

const startRecording = async () => {
  try {
    const appData = await appDataDir();
    const recordingsDir = await join(appData, "voice_notes");

    // Ensure directory exists
    const dirExists = await exists("voice_notes", {
      baseDir: BaseDirectory.AppData,
    });
    if (!dirExists) {
      await mkdir("voice_notes", {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });
    }

    /* 
      Audio files are stored in the application data directory:
      Linux: ~/.local/share/creative/voice_notes/
      macOS: ~/Library/Application Support/creative/voice_notes/
      Windows: %APPDATA%\creative\voice_notes\
      
      This folder is cleared on app startup.
    */
    const filePath = await join(recordingsDir, `recording_${Date.now()}`);

    await pluginStart({
      outputPath: filePath,
    });
    isRecording.value = true;
    duration.value = 0;
    currentTime.value = 0;

    // Start timer
    if (recordingInterval) clearInterval(recordingInterval);
    recordingInterval = setInterval(() => {
      duration.value++;
    }, 1000);
  } catch (error) {
    console.error("Error starting recording:", error);
  }
};

const stopRecording = async () => {
  try {
    const result = await pluginStop();
    isRecording.value = false;

    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }

    // Read the file content
    const content = await readFile(result.filePath);
    const audioBlob = new Blob([content], { type: "audio/wav" });

    // Update the model with the new Blob
    voiceData.value = audioBlob;
  } catch (error) {
    isRecording.value = false;
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }
  }
};

const setupAudioPlayer = (url: string) => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value = null;
  }

  const audio = new Audio(url);
  audio.onended = () => {
    isPlaying.value = false;
    currentTime.value = 0;
  };
  audio.onloadedmetadata = () => {
    if (isFinite(audio.duration)) {
      duration.value = audio.duration;
    }
  };
  audio.ontimeupdate = () => {
    currentTime.value = audio.currentTime;
  };
  audioPlayer.value = audio;
};

const togglePlayback = () => {
  if (!audioPlayer.value) return;

  if (isPlaying.value) {
    audioPlayer.value.pause();
  } else {
    audioPlayer.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

// Cleanup object URL on unmount
onUnmounted(() => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  if (recordingInterval) {
    clearInterval(recordingInterval);
  }
});

// Watch for changes in the model
watch(
  voiceData,
  () => {
    updateAudioUrl();
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="voice-note"
    :class="{ 'flipped-x': isFlippedX }"
    :style="stylePosition"
  >
    <div
      class="icon-wrapper drag-handle-container"
      :class="isVisible ? 'active' : 'is-collapsed'"
      @mousedown="handleIconMouseDown"
      @click="handleIconClick"
    >
      <VoiceIcon class="voice-icon" />
    </div>
    <div class="audio-container" v-if="isVisible">
      <div class="wave-wrapper">
        <AudioWaveIcon
          :isPlaying="isPlaying || isRecording"
          class="wave-icon"
        />
      </div>
      <span class="duration">{{ formattedDuration }}</span>
      <div class="recording-container">
        <Record
          v-if="!hasAudio && !isRecording"
          @click="startRecording"
          class="action-icon"
        />
        <Stop v-if="isRecording" @click="stopRecording" class="action-icon" />
        <PlayPause
          v-if="hasAudio && !isRecording"
          :isPlaying="isPlaying ? isPlaying : null"
          @click="togglePlayback"
          class="action-icon"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.voice-note {
  display: flex;
  align-items: center;
  width: fit-content;
  gap: 0.5rem;
}

.voice-note.flipped-x {
  flex-direction: row-reverse;
}
.audio-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--background);
  border-radius: 2rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.icon-wrapper {
  height: 5rem;
  width: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.is-collapsed {
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 5rem;
  color: var(--title-color);
  transition: all 0.2s linear;
}
.is-collapsed:hover,
.active {
  background-color: var(--light-green);
  color: white;
}
.active {
  border-radius: 5rem;
}
.icon-wrapper:active {
  cursor: grabbing;
}
.voice-icon {
  width: 4rem;
  height: 4rem;

  cursor: pointer;
}

.wave-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wave-icon {
  width: 40px;
  height: 20px;
  color: var(--light-green, #4ade80);
}

.record {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: var(--danger-color);
}

.action-icon {
  cursor: pointer;
  width: 2rem;
  height: 2rem;
}

.duration {
  color: var(--text-color);
  font-size: 0.8em;
  min-width: 5rem;
  text-align: center;
}

.action-icon:hover {
  color: var(--title-color);
}
</style>
