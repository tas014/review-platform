import { type ShallowRef, type Ref } from "vue";

type PlaybackSpeed = 1 | 2 | 3 | 4 | 5 | 10 | "loop";
type Nullable<T> = T | null;
type VideoRef = Ref<HTMLVideoElement | null>;
type ProvidedContext = {
  videoElement: VideoRef;
  playbackControls: Ref<VideoHook>;
};
type VideoHook = {
  videoElement: Readonly<VideoRef>;
  totalDuration: Readonly<Ref<number | null>>;
  videoStart: Readonly<Ref<Nullable<number>>>;
  progress: Readonly<Ref<number>>;
  currentTime: Ref<number | null>;
  isPlaying: Ref<boolean | null>;
  playbackDirection: Ref<boolean | null>;
  fastForward: (speed?: PlaybackSpeed) => void;
  rewind: (speed?: PlaybackSpeed) => void;
  play: () => void;
  pause: () => void;
  skipToStart: () => void;
  skipToEnd: () => void;
  skipToTime: (percent: number) => void;
  initializePlayback: () => void;
};

export default interface ModeState {
  videoElement: Readonly<ShallowRef<HTMLVideoElement | null>>;
  playbackControls: VideoHook;
}

export { type VideoHook, type ProvidedContext };
