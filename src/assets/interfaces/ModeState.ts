import { type Ref } from "vue";
export default interface ModeState {
  mode: Ref<"replay" | "analysis">;
  toggleMode: () => void;
}
