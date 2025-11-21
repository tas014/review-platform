import { ref, computed, readonly, watch, type Ref } from "vue";
import { videoUrl } from "./useFileUpload";
import { VideoHook } from "../../../assets/interfaces/VideoState";

type Nullable<T> = T | null;
type PlaybackSpeed = 1 | 2 | 3 | 4 | 5 | 10;
type VideoRef = Ref<HTMLVideoElement | null>;

export function useVideo(initialSrc: VideoRef = ref(null)): VideoHook {
  // --- Private State (internal to the composable) ---
  const _videoElementRef = initialSrc;
  const _videoSrc = ref<string | null>(null);
  const _currentFrame = ref<Nullable<number>>(null);
  const _playbackDirection = ref<Nullable<boolean>>(null); // null: paused, true: forwards, false: rewinding
  const _playbackSpeed = ref<PlaybackSpeed>(1);
  const _playbackSpeedValues: PlaybackSpeed[] = [1, 2, 3, 4, 5, 10];
  const _customVideoEnd = ref<Nullable<number>>(null);
  const _customVideoStart = ref<Nullable<number>>(null);
  const updateTickrate = 300;

  // --- Public Getters (Computed Properties) ---
  const currentFrame = readonly(_currentFrame);
  const isPlaying = computed(() => _playbackDirection.value !== null);
  const _totalDuration = computed(() => {
    if (!_videoElementRef.value) return null;
    if (_customVideoEnd.value) return _customVideoEnd.value;
    return _videoElementRef.value.duration;
  });
  const _startTime = computed(() => {
    if (!_customVideoStart.value) return 0;
    return _customVideoStart.value;
  });
  const _progressPercent = computed(() => {
    if (
      !_totalDuration.value ||
      _currentFrame.value === null ||
      _startTime.value === null
    )
      return 0;
    const segmentDuration = _totalDuration.value - _startTime.value;
    const elapsedTime = _currentFrame.value - _startTime.value;
    if (segmentDuration > 0 && elapsedTime >= 0) {
      const rawPercentage = (elapsedTime / segmentDuration) * 100;
      return Math.round(rawPercentage);
    }
    // If the elapsed time is outside the segment bounds, return 0 or 100 depending on the case
    if (_currentFrame.value >= _totalDuration.value) return 100;
    return 0;
  });

  // --- Public Methods ---
  const initializePlayback = () => {
    if (!_videoElementRef.value) return;
    // CRITICAL STEP: forces _totalDuration (Dependency 1) to re-run and return a number on call. To be used with the @loadedmetadata event.
    _customVideoEnd.value = _videoElementRef.value.duration;
    _currentFrame.value = _startTime.value;
  };

  const fastForward = (speed: PlaybackSpeed | "loop" = 1) => {
    if (!_videoSrc.value) return;
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
    if (!_videoSrc.value) return;
    if (speed === "loop") {
      const speedIndex = _playbackSpeedValues.indexOf(_playbackSpeed.value);
      const loopedIndex = (speedIndex + 1) % _playbackSpeedValues.length;
      _setPlayback(_playbackSpeedValues[loopedIndex], false);
      return;
    }
    if (speed > 0 && speed <= 10) {
      _setPlayback(speed, false);
    } else {
      throw Error("Rewind speed must be greater than 0 and a maximum of 10.");
    }
  };

  const play = () => {
    if (!_videoSrc.value) return;
    if (_progressPercent.value === 100) skipToStart();
    _setPlayback(1, true);
  };

  const pause = () => {
    if (!_videoSrc.value) return;
    _setPlayback(1, null);
  };

  const skipToEnd = () => {
    if (!_videoSrc.value) return;
    if (
      _videoElementRef.value === null ||
      videoUrl.value === null ||
      !_totalDuration.value
    )
      return;
    _videoElementRef.value.currentTime = _totalDuration.value;
    _currentFrame.value = _totalDuration.value;
    pause();
  };

  const skipToStart = () => {
    if (!_videoSrc.value) return;
    if (_videoElementRef.value === null || videoUrl.value === null) return;
    _videoElementRef.value.currentTime = _startTime.value;
    _currentFrame.value = _startTime.value;
    pause();
  };

  const updateVideoSrc = (newSrc: string | null = null) => {
    _videoSrc.value = newSrc;
  };

  // Watch for changes in `_playbackDirection` and update the video element
  watch(_playbackDirection, (newState) => {
    if (_videoElementRef.value === null || videoUrl.value === null) return;
    _clearAllIntervals();
    switch (newState) {
      case true: // FORWARD (native playback)
        _videoElementRef.value.playbackRate = _playbackSpeed.value;
        _videoElementRef.value.play();
        // Start the progress reporting interval
        _intervalTracker = setInterval(() => {
          if (!_videoElementRef.value) throw new Error("video ref is missing");
          const currentTime = _videoElementRef.value.currentTime;
          if (_customVideoEnd.value && currentTime >= _customVideoEnd.value) {
            _currentFrame.value = _customVideoEnd.value;
            return clearInterval(_intervalTracker);
          }
          _currentFrame.value = currentTime;
          if (_totalDuration.value && currentTime >= _totalDuration.value) {
            pause();
          }
        }, updateTickrate);
        break;

      case false: // REWIND (tauri doesnt support negative playback so I use reverse seeking workaround)
        _videoElementRef.value.pause();
        _playReverseSeek();
        break;

      case null: // PAUSED
        _videoElementRef.value.pause();
        _currentFrame.value = _videoElementRef.value.currentTime;
        break;
    }
  });

  // Watch for changes in playback speed and apply them to element
  watch(_playbackSpeed, (newSpeed) => {
    if (!_videoElementRef.value || !videoUrl.value) return;
    if (_playbackDirection.value)
      _videoElementRef.value.playbackRate = newSpeed;
    if (_playbackDirection.value === false) _playReverseSeek(newSpeed);
  });

  watch(_progressPercent, (progress) => {
    if (progress === 100) pause();
  });

  // --- Private Utility Methods ---

  const _setPlayback = (
    speed: PlaybackSpeed = 1,
    direction: Nullable<boolean> = true
  ) => {
    _playbackDirection.value = direction;
    _playbackSpeed.value = speed;
  };

  let _intervalTracker: undefined | number;
  const _clearAllIntervals = () => {
    if (_intervalTracker) {
      clearInterval(_intervalTracker);
    }
  };

  const _playReverseSeek = (rate: PlaybackSpeed = 1) => {
    const TARGET_FPS = 30;
    const INTERVAL_MS = 1000 / TARGET_FPS;

    _clearAllIntervals();
    if (_videoElementRef.value) {
      _videoElementRef.value.pause();
      _videoElementRef.value.playbackRate = 1;
    }
    // reactive state for UI display
    _playbackDirection.value = false;
    _playbackSpeed.value = rate;

    _intervalTracker = setInterval(() => {
      const video = _videoElementRef.value;
      if (!video) return;
      // Check if we hit the start of the video or the trimStart
      if (video.currentTime <= _startTime.value) {
        video.currentTime = _startTime.value;
        pause(); // Stop at the custom start point
        return;
      }
      const jumpSeconds = (rate * INTERVAL_MS) / 1000;
      video.currentTime -= jumpSeconds;
      // update the reactive frame time
      _currentFrame.value = video.currentTime;
    }, INTERVAL_MS);
  };

  const skipToTime = (percent: number) => {
    if (percent < 0 || percent > 1)
      throw new Error("Percentage must be a number between 0 and 1.");
    if (
      _videoElementRef.value === null ||
      videoUrl.value === null ||
      !_totalDuration.value
    )
      return;

    const newTime = _startTime.value + _totalDuration.value * percent;
    _videoElementRef.value.currentTime = newTime;
    _currentFrame.value = newTime;
    pause();
  };

  // --- Return the Public API ---
  return {
    videoElement: readonly(_videoElementRef) as VideoRef,
    videoSrc: readonly(_videoSrc),
    currentTime: readonly(currentFrame),
    totalDuration: readonly(_totalDuration),
    videoStart: readonly(_startTime),
    progress: readonly(_progressPercent),
    isPlaying: readonly(isPlaying),
    playbackDirection: readonly(_playbackDirection),
    transitionTime: `${updateTickrate / 1000}s`,
    fastForward,
    rewind,
    play,
    pause,
    skipToEnd,
    skipToStart,
    skipToTime,
    initializePlayback,
    updateVideoSrc,
  };
}
