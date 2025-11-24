import { reactive, Reactive, readonly } from "vue"
import Breakpoint from "../../../assets/interfaces/BreakpointType"
import { TextContent, VoiceContent, DrawingContent, Vector } from "../../../assets/interfaces/BreakpointType";

type BreakpointStoreState = Reactive<{
	videoData: string | null;
	breakpoints: Breakpoint[];
}>

type Position = {
	top: number;
	left: number
}

type Dimensions = {
	width: number;
	height: number;
}

const useBreakpoint = () => {
	// internal state
	let currentId = 0;
	const _state : BreakpointStoreState = reactive({
		videoData: null,
    breakpoints: []
	})
	
	// public methods

	const addBreakpoint = (timeStamp:number = 0) => {
		const newBreakpoint : Breakpoint = {
			timeStamp
		}
		_state.breakpoints.push(newBreakpoint);
	}

	const updateVideoData = (newData:string) => {
		_state.videoData = newData;
	}

	const createTextContent = (
		timeStamp:number, 
		content:string,
		position : Position,
		dimensions : Dimensions
	) => {
		const breakpointFilter = _state.breakpoints.filter(bp => bp.timeStamp === timeStamp);
		const currentBreakpoint = breakpointFilter.length > 0 ? breakpointFilter[0] : null;
		if (!currentBreakpoint) throw new Error("No breakpoint detected on timestamp "+ timeStamp);
		const newTextContent : TextContent= {
			id: _createNewId(),
			type: 'text',
			content,
			position,
			dimensions
		}
		if (!currentBreakpoint.textContent) {
			currentBreakpoint.textContent = [newTextContent];
		} else {
			currentBreakpoint.textContent.push(newTextContent)
		}
	}

	const createVoiceContent = (
		timeStamp:number, 
		fileBlob:Blob,
		position : Position,
		dimensions : Dimensions,
		duration:number
	) => {
		const breakpointFilter = _state.breakpoints.filter(bp => bp.timeStamp === timeStamp);
		const currentBreakpoint = breakpointFilter.length > 0 ? breakpointFilter[0] : null;
		if (!currentBreakpoint) throw new Error("No breakpoint detected on timestamp "+ timeStamp);
		const newVoiceContent : VoiceContent= {
			id: _createNewId(),
			type: 'voice',
			fileBlob,
			duration,
			position,
			dimensions
		}
		if (!currentBreakpoint.voiceContent) {
			currentBreakpoint.voiceContent = [newVoiceContent];
		} else {
			currentBreakpoint.voiceContent.push(newVoiceContent)
		}
	}

	const createDrawingContent = (
		timeStamp:number, 
		content:Vector[],
		position : Position,
		dimensions : Dimensions
	) => {
		const breakpointFilter = _state.breakpoints.filter(bp => bp.timeStamp === timeStamp);
		const currentBreakpoint = breakpointFilter.length > 0 ? breakpointFilter[0] : null;
		if (!currentBreakpoint) throw new Error("No breakpoint detected on timestamp "+ timeStamp);
		const newDrawingTextContent : DrawingContent= {
			id: _createNewId(),
			type: 'drawing',
			content,
			position,
			dimensions
		}
		currentBreakpoint.drawingContent = newDrawingTextContent;
	}

	// private methods

	const _setCurrentId = (newId?: number) => {
		if (!newId) {
			currentId++
		} else {
			currentId = ++newId
		}
	}

	const _createNewId = () => {
		return currentId++
	}

	const exports = {
		breakpoints: readonly(_state),
		addBreakpoint,
		updateVideoData,
		createTextContent,
		createVoiceContent,
		createDrawingContent,
	}

	return exports
}
export default useBreakpoint