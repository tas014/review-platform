import { type Ref } from "vue";
export default interface ModeState {
  mode: Ref<"replay" | "analysis">;
  toggleMode: () => void;
}
type SelectedTool = Ref<"draw" | "text" | "voice" | "delete" | "trim" | null>;
export type { SelectedTool };
