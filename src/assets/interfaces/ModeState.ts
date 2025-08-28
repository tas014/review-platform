import { type Ref } from "vue";
export default interface ModeState {
  mode: Ref<boolean>;
  toggleMode: () => void;
}
