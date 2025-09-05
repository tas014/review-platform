import Video from "./Video";

type Mode = null | "draw" | "voice" | "text" | "trim";

class Analysis {
  #videoObj;
  #breakpoints;
  #currentMode: Mode = null;
  constructor(video: Video | null = null, breakpoints = [null]) {
    this.#videoObj = video;
    this.#breakpoints = breakpoints;
  }

  // video getter and setter
  get video() {
    return this.#videoObj;
  }

  set video(newVid: Video | null) {
    if (newVid === null) console.log("Removed video");
    if (newVid instanceof Video) console.log("Changed video");
  }

  // breakpoints getter
  get breakpoints() {
    return this.#breakpoints;
  }

  // behavior methods
  drawMode() {
    this.#saveAndSwitchMode("draw");
    console.log("Swapped to draw mode");
  }

  textMode() {
    this.#saveAndSwitchMode("text");
    console.log("Swapped to text mode");
  }

  voiceMode() {
    this.#saveAndSwitchMode("voice");
    console.log("Swapped to voice mode");
  }

  trimMode() {
    this.#saveAndSwitchMode("trim");
    console.log("Swapped to trim mode");
  }

  // private utility methods
  #saveAndSwitchMode(newMode: Mode) {
    console.log(`Saved data from ${this.#currentMode}`);
    this.#currentMode = newMode;
  }
}

export default Analysis;
