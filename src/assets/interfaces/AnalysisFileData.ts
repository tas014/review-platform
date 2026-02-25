import Breakpoint from "./BreakpointType";

interface AnalysisExportData {
  breakpoints: Breakpoint[];
  videoStart: number | null;
  videoEnd: number | null;
}

type AnalysisExportFunction = (
  videoUrl: string | null,
  breakpoints: Breakpoint[],
  videoStart: number | null,
  videoEnd: number | null,
  savePath: string | null,
) => Promise<boolean>;

export type { AnalysisExportData, AnalysisExportFunction };
