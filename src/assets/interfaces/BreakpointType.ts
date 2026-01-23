import { Ref } from "vue";

type BasicContent = {
  id: number;
  type: "text" | "voice" | "drawing";
  position: {
    top: number;
    left: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
};

interface TextContent extends BasicContent {
  content: string;
}

interface VoiceContent extends BasicContent {
  filename?: string;
  fileBlob?: Blob;
  duration: number;
}

type Position = {
  x: number;
  y: number;
};

type Dimensions = {
  width: number;
  height: number;
};
type Vector = {
  line: Position[];
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
  breakpoints: Readonly<Ref<Breakpoint[]>>;
  createBreakpoint: (timeStamp: number) => Breakpoint;
  updateVideoData: (newData: string) => void;
  createTextContent: (
    timeStamp: number,
    content: string,
    position: Position,
    dimensions: Dimensions,
  ) => void;
  createVoiceContent: (
    timeStamp: number,
    fileBlob: Blob,
    position: Position,
    dimensions: Dimensions,
    duration: number,
  ) => void;
  createDrawingContent: (
    timeStamp: number,
    content: Vector[],
    position: Position,
    dimensions: Dimensions,
  ) => void;
  setCurrentBreakpoint: (timeStamp: number | null) => void;
  removeBreakpoint: (timeStamp: number) => void;
  removeAllBreakpoints: () => void;
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
};
