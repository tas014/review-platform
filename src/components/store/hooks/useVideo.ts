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
  let rafId: number | null = null;

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
      return rawPercentage;
    }
    // If the elapsed time is outside the segment bounds, return 0 or 100 depending on the case
    if (_currentFrame.value >= _totalDuration.value) return 100;
    return 0;
  });

  // --- Public Methods ---
  const initializePlayback = () => {
    if (!_videoElementRef.value) return;
    // CRITICAL STEP: forces _totalDuration (Dependency 1) to re-run and return a number on call. To be used with the @loadedmetadata event.
    _customVideoStart.value = null;
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
    // If we are within 0.5s of the end (accommodating FF boundaries), restart
    const isNearEnd =
      _totalDuration.value &&
      _currentFrame.value !== null &&
      _totalDuration.value - _currentFrame.value <= 0.5;
    if (isNearEnd) {
      if (_videoElementRef.value !== null && videoUrl.value !== null) {
        _videoElementRef.value.currentTime = _startTime.value;
        _currentFrame.value = _startTime.value;
      }
    }
    _setPlayback(1, true);
  };

  const pause = () => {
    if (!_videoSrc.value) return;
    _setPlayback(1, null);
  };

  const skipToEnd = () => {
    _clearAllIntervals();
    _cancelLoop();
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
    _clearAllIntervals();
    _cancelLoop();
    if (!_videoSrc.value) return;
    if (_videoElementRef.value === null || videoUrl.value === null) return;
    _videoElementRef.value.currentTime = _startTime.value;
    _currentFrame.value = _startTime.value;
    pause();
  };

  const updateVideoSrc = (newSrc: string | null = null) => {
    _videoSrc.value = newSrc;
  };

  // Watch for changes in playback state (direction or speed)
  watch(
    [_playbackDirection, _playbackSpeed],
    ([newDirection, newSpeed], [oldDirection, oldSpeed]) => {
      if (_videoElementRef.value === null || videoUrl.value === null) return;

      // If nothing changed effectively (e.g. speed changed but we are paused), do minimal work
      // checking strict equality for direction and speed
      if (newDirection === oldDirection && newSpeed === oldSpeed) return;

      _clearAllIntervals();
      _cancelLoop();

      switch (newDirection) {
        case true: // FORWARD
          if (newSpeed === 1) {
            // Normal 1x playback uses native play
            _videoElementRef.value.playbackRate = 1;
            _videoElementRef.value.play().catch((e) => {
              const err = _videoElementRef.value?.error;
              console.error("Video playback failed:", e, {
                code: err?.code,
                message: err?.message,
                src: _videoElementRef.value?.currentSrc,
              });
            });
            // Start the progress reporting loop
            _loop();
          } else {
            // Fast forward (>1x) uses manual seeking
            _videoElementRef.value.pause();
            _playManualSeek(newSpeed, true);
          }
          break;

        case false: // REWIND
          _videoElementRef.value.pause();
          _playManualSeek(newSpeed, false);
          break;

        case null: // PAUSED
          _videoElementRef.value.pause();
          if (!_videoElementRef.value.seeking) {
            _currentFrame.value = _videoElementRef.value.currentTime;
          }
          break;
      }
    },
    { flush: "post" },
  );

  // --- Private Utility Methods ---

  const _setPlayback = (
    speed: PlaybackSpeed = 1,
    direction: Nullable<boolean> = true,
  ) => {
    _playbackDirection.value = direction;
    _playbackSpeed.value = speed;
  };

  const _cancelLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const _loop = () => {
    if (!_videoElementRef.value) return;

    if (_videoElementRef.value.seeking) {
      if (_playbackDirection.value === true) {
        rafId = requestAnimationFrame(_loop);
      }
      return;
    }

    const currentTime = _videoElementRef.value.currentTime;

    // Only pause if the video is actually playing normally, not if it's currently seeking back to the start
    if (
      !_videoElementRef.value.seeking &&
      _customVideoEnd.value &&
      currentTime >= _customVideoEnd.value
    ) {
      _currentFrame.value = _customVideoEnd.value;
      pause();
      return;
    }

    _currentFrame.value = currentTime;

    // Only pause if the video is actually playing normally, not if it's currently seeking back to the start
    if (
      !_videoElementRef.value.seeking &&
      _totalDuration.value &&
      currentTime >= _totalDuration.value
    ) {
      pause();
      return;
    }

    if (_playbackDirection.value === true) {
      rafId = requestAnimationFrame(_loop);
    }
  };

  let _intervalTracker: undefined | number;
  const _clearAllIntervals = () => {
    if (_intervalTracker) {
      clearInterval(_intervalTracker);
      _intervalTracker = undefined;
    }
  };

  /**
   * Manually seeks the video to simulate playback at a specific speed and direction.
   * Used for Rewind (all speeds) and Fast Forward (>1x).
   */
  const _playManualSeek = (
    rate: PlaybackSpeed = 1,
    direction: boolean = false, // false = reverse, true = forward
  ) => {
    const TARGET_FPS = 30;
    const INTERVAL_MS = 1000 / TARGET_FPS;

    _clearAllIntervals();
    if (_videoElementRef.value) {
      _videoElementRef.value.pause();
      _videoElementRef.value.playbackRate = 1;
    }
    // reactive state for UI display
    _playbackDirection.value = direction;
    _playbackSpeed.value = rate;

    _intervalTracker = setInterval(() => {
      // Ghost interval check: if the reactive state no longer matches our intended direction, die quietly
      if (_playbackDirection.value !== direction) {
        _clearAllIntervals();
        return;
      }

      const video = _videoElementRef.value;
      if (!video) return;

      const jumpSeconds = (rate * INTERVAL_MS) / 1000;

      if (!direction) {
        // REWIND
        if (video.currentTime <= _startTime.value) {
          _clearAllIntervals();
          video.currentTime = _startTime.value;
          _currentFrame.value = _startTime.value;
          pause(); // Stop at the custom start point
          return;
        }
        video.currentTime -= jumpSeconds;
      } else {
        // FAST FORWARD
        const endPoint =
          _customVideoEnd.value || _totalDuration.value || video.duration;

        const nextTime = video.currentTime + jumpSeconds;

        if (nextTime >= endPoint) {
          // GStreamer/WebKit can emit warnings if we seek exactly to or past the duration.
          // Clamp to slightly before the end to be safe.
          _clearAllIntervals();
          const targetTime = Math.max(0, endPoint - 0.1);
          video.currentTime = targetTime;
          _currentFrame.value = targetTime;
          pause();
          return;
        }
        video.currentTime = nextTime;
      }

      // update the reactive frame time
      _currentFrame.value = video.currentTime;
    }, INTERVAL_MS);
  };

  const skipToTime = (percent: number) => {
    _clearAllIntervals();
    _cancelLoop();
    if (percent < 0 || percent > 1)
      throw new Error("Percentage must be a number between 0 and 1.");
    if (
      _videoElementRef.value === null ||
      videoUrl.value === null ||
      !_totalDuration.value
    )
      return;

    // Fix: Calculate based on segment duration, not absolute totalDuration
    const start = _startTime.value || 0;
    const end = _totalDuration.value;
    const segmentDuration = end - start;

    const newTime = start + segmentDuration * percent;
    _videoElementRef.value.currentTime = newTime;
    _currentFrame.value = newTime;
    pause();
  };

  const setTrim = (start: number, end: number) => {
    // start and end are relative to the current visible clip (which starts at _startTime)
    const currentAbsoluteStart = _startTime.value || 0;

    // Validations could be added here to ensure start < end, boundaries, etc.
    const newStart = currentAbsoluteStart + start;
    const newEnd = currentAbsoluteStart + end;

    _customVideoStart.value = newStart;
    _customVideoEnd.value = newEnd;

    // Update current frame if we trimmed past the current position
    if (_videoElementRef.value) {
      const currentTime = _videoElementRef.value.currentTime;
      if (currentTime < newStart || currentTime > newEnd) {
        _videoElementRef.value.currentTime = newStart;
        _currentFrame.value = newStart;
      }
    }
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
    transitionTime: `0s`,
    playbackSpeed: readonly(_playbackSpeed),
    fastForward,
    rewind,
    play,
    pause,
    skipToEnd,
    skipToStart,
    skipToTime,
    initializePlayback,
    updateVideoSrc,
    setTrim,
  };
}
