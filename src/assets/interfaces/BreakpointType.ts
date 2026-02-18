import { Ref, DeepReadonly } from "vue";

type ElementPosition = {
  top: number;
  left: number;
};

type BasicContent = {
  id: number;
  type: "text" | "voice" | "drawing";
  position: ElementPosition;
  dimensions: {
    width: number;
    height: number;
  };
};

interface TextContent extends BasicContent {
  content: string;
  invertedX?: boolean;
  invertedY?: boolean;
  isCollapsed?: boolean;
}

interface VoiceContent extends BasicContent {
  filename?: string;
  fileBlob?: Blob;
  duration: number;
  isCollapsed?: boolean;
}

type Point = {
  x: number;
  y: number;
};

type Dimensions = {
  width: number;
  height: number;
};
type Vector = {
  line: Point[];
  color: string;
  lineWidth: number;
  lineCap: "round" | "square" | "butt";
};

interface DrawingContent extends BasicContent {
  content: Vector[];
}

type Breakpoint = {
  timeStamp: number;
  textContent?: TextContent[];
  voiceContent?: VoiceContent[];
  drawingContent?: DrawingContent;
};

type BreakpointHook = {
  breakpoints: DeepReadonly<Ref<Breakpoint[]>>;
  createBreakpoint: (timeStamp?: number) => Breakpoint;
  updateVideoData: (newData: string) => void;
  createTextContent: (
    timeStamp: number,
    content: string,
    position: ElementPosition,
    dimensions: Dimensions,
  ) => void;
  createVoiceContent: (
    timeStamp: number,
    fileBlob: Blob,
    position: ElementPosition,
    dimensions: Dimensions,
    duration: number,
  ) => void;
  createDrawingContent: (
    timeStamp: number,
    content: Vector[],
    position: ElementPosition,
    dimensions: Dimensions,
  ) => void;
  setCurrentBreakpoint: (timeStamp: number | null) => void;
  removeBreakpoint: (timeStamp: number) => void;
  removeAllBreakpoints: () => void;
  resetBreakpointState: () => void;
  cleanupBreakpoints: (minTime: number, maxTime: number) => void;
  activeBreakpoint: Ref<Breakpoint | null>;
};

type CurrentBreakpointInjection = Ref<number | null>;

export default Breakpoint;
export type {
  TextContent,
  VoiceContent,
  DrawingContent,
  Vector,
  BreakpointHook,
  CurrentBreakpointInjection,
  ElementPosition,
  Point,
};
