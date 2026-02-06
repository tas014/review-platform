import { reactive, Reactive, readonly, toRef } from "vue";
import Breakpoint from "../../../assets/interfaces/BreakpointType";
import {
  TextContent,
  VoiceContent,
  DrawingContent,
  Vector,
} from "../../../assets/interfaces/BreakpointType";

type BreakpointStoreState = Reactive<{
  videoData: string | null;
  breakpoints: Breakpoint[];
  activeBreakpoint: Breakpoint | null;
}>;

type Position = {
  top: number;
  left: number;
};

type Dimensions = {
  width: number;
  height: number;
};

const useBreakpoint = () => {
  // internal state
  let currentId = 0;
  const _state: BreakpointStoreState = reactive({
    videoData: null,
    breakpoints: [],
    activeBreakpoint: null,
  });

  // public methods

  const createBreakpoint = (timeStamp: number = 0) => {
    const newBreakpoint: Breakpoint = {
      timeStamp,
    };
    const timeStampExists = _state.breakpoints.find(
      (bp) => bp.timeStamp === timeStamp,
    );
    if (timeStampExists) return;
    _state.breakpoints.push(newBreakpoint);
    _state.activeBreakpoint = newBreakpoint;
    return newBreakpoint;
  };

  const updateVideoData = (newData: string) => {
    _state.videoData = newData;
  };

  const createTextContent = (
    timeStamp: number,
    content: string,
    position: Position,
    dimensions: Dimensions,
  ) => {
    const currentBreakpoint = _state.breakpoints.find(
      (bp) => bp.timeStamp === timeStamp,
    );
    if (!currentBreakpoint)
      throw new Error("No breakpoint detected on timestamp " + timeStamp);
    const newTextContent: TextContent = {
      id: _createNewId(),
      type: "text",
      content,
      position,
      dimensions,
    };
    if (!currentBreakpoint.textContent) {
      currentBreakpoint.textContent = [newTextContent];
    } else {
      currentBreakpoint.textContent.push(newTextContent);
    }
  };

  const createVoiceContent = (
    timeStamp: number,
    fileBlob: Blob,
    position: Position,
    dimensions: Dimensions,
    duration: number,
  ) => {
    const currentBreakpoint = _state.breakpoints.find(
      (bp) => bp.timeStamp === timeStamp,
    );
    if (!currentBreakpoint)
      throw new Error("No breakpoint detected on timestamp " + timeStamp);
    const newVoiceContent: VoiceContent = {
      id: _createNewId(),
      type: "voice",
      fileBlob,
      duration,
      position,
      dimensions,
    };
    if (!currentBreakpoint.voiceContent) {
      currentBreakpoint.voiceContent = [newVoiceContent];
    } else {
      currentBreakpoint.voiceContent.push(newVoiceContent);
    }
  };

  const createDrawingContent = (
    timeStamp: number,
    content: Vector[],
    position: Position,
    dimensions: Dimensions,
  ) => {
    const currentBreakpoint = _state.breakpoints.find(
      (bp) => bp.timeStamp === timeStamp,
    );
    if (!currentBreakpoint)
      throw new Error("No breakpoint detected on timestamp " + timeStamp);
    const newDrawingTextContent: DrawingContent = {
      id: _createNewId(),
      type: "drawing",
      content,
      position,
      dimensions,
    };
    currentBreakpoint.drawingContent = newDrawingTextContent;
  };

  const setCurrentBreakpoint = (timeStamp: number | null) => {
    if (!timeStamp) {
      _state.activeBreakpoint = null;
      return;
    }
    const currentBreakpoint = _state.breakpoints.find(
      (bp) => bp.timeStamp === timeStamp,
    );
    if (!currentBreakpoint)
      throw new Error("No breakpoint detected on timestamp " + timeStamp);
    _state.activeBreakpoint = currentBreakpoint;
  };

  const removeBreakpoint = (timeStamp: number) => {
    const currentBreakpoint = _state.breakpoints.find(
      (bp) => bp.timeStamp === timeStamp,
    );
    if (!currentBreakpoint)
      throw new Error("No breakpoint detected on timestamp " + timeStamp);
    _state.breakpoints = _state.breakpoints.filter(
      (bp) => bp.timeStamp !== timeStamp,
    );
    _state.activeBreakpoint = null;
  };

  const removeAllBreakpoints = () => {
    _state.breakpoints = [];
    _state.activeBreakpoint = null;
  };

  const resetBreakpointState = () => {
    removeAllBreakpoints();
    _state.videoData = null;
  };

  const cleanupBreakpoints = (minTime: number, maxTime: number) => {
    _state.breakpoints = _state.breakpoints.filter(
      (bp) => bp.timeStamp >= minTime && bp.timeStamp <= maxTime,
    );
    // If the active breakpoint was removed, clear it
    if (
      _state.activeBreakpoint &&
      (_state.activeBreakpoint.timeStamp < minTime ||
        _state.activeBreakpoint.timeStamp > maxTime)
    ) {
      _state.activeBreakpoint = null;
    }
  };

  // private methods

  /* const _setCurrentId = (newId?: number) => {
		if (!newId) {
			currentId++
		} else {
			currentId = ++newId
		}
	} */

  const _createNewId = () => {
    return currentId++;
  };

  const exports = {
    breakpoints: readonly(toRef(_state, "breakpoints")),
    createBreakpoint,
    updateVideoData,
    createTextContent,
    createVoiceContent,
    createDrawingContent,
    setCurrentBreakpoint,
    removeBreakpoint,
    removeAllBreakpoints,
    resetBreakpointState,
    cleanupBreakpoints,
    activeBreakpoint: toRef(_state, "activeBreakpoint"),
  };

  return exports;
};
export default useBreakpoint;
