import { ref, computed, readonly, watch, type Ref } from "vue";

type Nullable<T> = T | null;
type PlaybackSpeed = 1 | 2 | 3 | 4 | 5 | 10;
type VideoRef = Ref<HTMLVideoElement | null>;

export function useVideo(initialSrc: VideoRef = ref(null)) {
  // --- Private State (internal to the composable) ---
  const _src = initialSrc;
  const _currentFrame = ref<Nullable<number>>(null);
  const _playbackDirection = ref<Nullable<boolean>>(null); // null: paused, true: forwards, false: rewinding
  const _playbackSpeed = ref<PlaybackSpeed>(1);
  const _totalFrames = ref(100); // TODO: get actual max frames
  const _playbackSpeedValues: PlaybackSpeed[] = [1, 2, 3, 4, 5, 10];

  // --- Public Getters (Computed Properties) ---
  const currentFrame = readonly(_currentFrame);
  const isPlaying = computed(() => _playbackDirection.value !== null);

  // --- Public Methods ---
  const fastForward = (speed: PlaybackSpeed | "loop" = 1) => {
    if (speed === "loop") {
      const speedIndex = _playbackSpeedValues.indexOf(_playbackSpeed.value);
      const loopedIndex = (speedIndex + 1) % _playbackSpeedValues.length;
      _setPlayback(_playbackSpeedValues[loopedIndex]);
      return;
    }
    if (speed > 0 && speed <= 10) {
      _setPlayback(speed);
    } else {
      throw Error("Playback speed must be greater than 0 and a maximum of 10.");
    }
  };

  const rewind = (speed: PlaybackSpeed | "loop" = 1) => {
    if (speed === "loop") {
      const speedIndex = _playbackSpeedValues.indexOf(_playbackSpeed.value);
      const loopedIndex = (speedIndex + 1) % _playbackSpeedValues.length;
      _setPlayback(_playbackSpeedValues[loopedIndex], false);
      return;
    }
    if (speed > 0 && speed > 10) {
      _setPlayback(speed, false);
    } else {
      throw Error("Rewind speed must be greater than 0 and a maximum of 10.");
    }
  };

  const play = () => {
    if (_playbackDirection.value) return;
    _playbackDirection.value = true;
  };

  const pause = () => {
    if (!_playbackDirection.value) return;
    _playbackDirection.value = null;
  };

  // Watch for changes in `_playbackDirection` and update the video element
  watch(_playbackDirection, (newState) => {
    if (_src.value === null) return;
    switch (newState) {
      case true:
      case false:
        play();
        break;
      case null:
        pause();
        break;
      default:
        break;
    }
  });

  // --- Private Utility Methods ---

  const _setPlayback = (speed: PlaybackSpeed = 1, direction = true) => {
    if (_playbackDirection.value !== direction) {
      speed = 1;
    }
    _playbackDirection.value = direction;
    _playbackSpeed.value = speed;
  };

  // --- Return the Public API ---
  return {
    src: readonly(_src),
    currentFrame,
    isPlaying,
    playbackDirection: _playbackDirection,
    fastForward,
    rewind,
    play,
    pause,
  };
}
