import { type ShallowRef, type Ref } from "vue";

type PlaybackSpeed = 1 | 2 | 3 | 4 | 5 | 10 | "loop";
type VideoHook = {
  src: Ref<HTMLVideoElement | null>;
  currentFrame: Ref<number | null>;
  isPlaying: Ref<boolean | null>;
  playbackDirection: Ref<boolean | null>;
  fastForward: (speed?: PlaybackSpeed) => void;
  rewind: (speed?: PlaybackSpeed) => void;
  play: () => void;
  pause: () => void;
};

export default interface ModeState {
  videoElement: Readonly<ShallowRef<HTMLVideoElement | null>>;
  playbackControls: VideoHook;
}
