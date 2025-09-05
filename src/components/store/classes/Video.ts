type NullableString = string | null;
type NullableNumber = number | null;
type PlaybackSpeed = 1 | 2 | 3 | 4 | 5 | 10;
class Video {
  #src;
  #current_frame;
  #playback_direction: null | boolean; // null if not playing, true if playback forwards and false if rewinding
  #playback_speed: PlaybackSpeed = 1;
  #total_frames = 100; // TODO: get actual max frames
  #playback_speed_values: PlaybackSpeed[] = [1, 2, 3, 4, 5, 10];

  constructor(
    src: NullableString = null,
    current_frame: NullableNumber = null,
    playback_direction = null
  ) {
    this.#src = src;
    this.#current_frame = current_frame;
    this.#playback_direction = playback_direction;
  }

  // Current frame getter and setter
  get currentFrame() {
    return this.#current_frame;
  }
  set currentFrame(newFrame: number | "end" | "start" | null) {
    switch (typeof newFrame) {
      case null:
        this.#dropPlayback();
        return;
      case "string":
        if (newFrame === "start") {
          this.#current_frame = 0;
        }
        if (newFrame === "end") {
          this.#current_frame = this.#total_frames;
        }
        return;
      case "number":
        if (typeof newFrame !== "number") return; // redundant line because of typescript not reading switch statement cases correctly
        if (newFrame >= 0 && newFrame <= this.#total_frames) {
          this.#current_frame = newFrame;
        } else {
          throw new Error(
            "new frame must be equal or greater than 0 and less or equal to the max frame count."
          );
        }
        return;

      default:
        break;
    }
  }

  // src getter and setter
  get src() {
    return this.#src;
  }
  set src(newSrc) {
    if (newSrc === null) {
      this.#dropReplay();
    }
    if (typeof newSrc === "string") {
      if (newSrc !== this.#src) this.#switchReplay(newSrc);
    }
  }

  // video behavior methods
  play() {
    if (this.#playback_direction) return;
    this.#playback_direction = true;
  }
  pause() {
    if (!this.#playback_direction) return;
    this.#playback_direction = null;
  }
  fastForward(speed: PlaybackSpeed | "loop" = 2) {
    if (speed === "loop") {
      const speedIndex = this.#playback_speed_values.indexOf(
        this.#playback_speed
      );
      const loopedIndex = (speedIndex + 1) % this.#playback_speed_values.length;
      this.#setPlayback(this.#playback_speed_values[loopedIndex]);
      return;
    }
    if (speed <= 0 || speed > 10) {
      this.#setPlayback(speed);
    } else
      throw Error("Playback speed must be greater than 0 and a maximum of 10.");
  }
  rewind(speed: PlaybackSpeed | "loop") {
    if (speed === "loop") {
      const speedIndex = this.#playback_speed_values.indexOf(
        this.#playback_speed
      );
      const loopedIndex = (speedIndex + 1) % this.#playback_speed_values.length;
      this.#setPlayback(this.#playback_speed_values[loopedIndex], false);
      return;
    }
    if (speed <= 0 || speed > 10) {
      this.#setPlayback(speed, false);
    } else
      throw Error("Rewind speed must be greater than 0 and a maximum of 10.");
  }

  // private utility methods
  #dropPlayback() {
    console.log("Dropped playback UI");
    this.#current_frame = null;
    this.#playback_direction = null;
  }
  #dropReplay() {
    console.log("Dropped replay");
    this.#current_frame = null;
  }
  #switchReplay(newSrc: string) {
    console.log("Switched replays");
    this.#src = newSrc;
  }
  #setPlayback(speed: PlaybackSpeed = 1, direction = true) {
    if (this.#playback_direction !== direction) {
      speed = 1;
    }
    this.#playback_direction = direction;
    if (direction) {
      console.log(`playing video at ${speed}x speed`);
      this.#playback_direction = true;
    }
    if (!direction) {
      console.log(`rewinding video at ${speed}x speed`);
      this.#playback_direction = false;
    }
    this.#playback_speed = speed;
  }
}

export default Video;
