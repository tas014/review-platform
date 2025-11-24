type BasicContent = {
	id: number;
	type: "text" | "voice" | "drawing";
	position: {
		top: number,
		left: number
	};
	dimensions: {
		width: number;
		height: number;
	}
}

interface TextContent extends BasicContent {
	content: string;
}

interface VoiceContent extends BasicContent {
	filename?: string;
	fileBlob?: Blob;
	duration: number;
}

type Point = {
	x: number;
	y: number;
}

type Vector = {
	line: Point[];
	color: string;
	lineWidth: number;
	lineCap: 'round' | 'square' | 'butt';
}

interface DrawingContent extends BasicContent {
	content: Vector[];
}

type Breakpoint = {
	timeStamp: number;
	textContent?: TextContent[];
	voiceContent?: VoiceContent[];
	drawingContent?: DrawingContent;
}

export default Breakpoint;
export type { TextContent, VoiceContent, DrawingContent, Vector }