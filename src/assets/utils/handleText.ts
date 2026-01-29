import { Ref } from "vue";
import type { TextContent, VoiceContent } from "../interfaces/BreakpointType";

// We'll create a generic calculate position function maybe?
// Or just replicate the logic for now.

export const addTextNote = (
  e: MouseEvent,
  container: HTMLElement | null,
  items: Ref<(TextContent | VoiceContent)[]>,
) => {
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const xPercent = Number(((x / rect.width) * 100).toFixed(2));
  const yPercent = Number(((y / rect.height) * 100).toFixed(2));

  items.value.push({
    id: Date.now(),
    type: "text",
    position: {
      left: xPercent,
      top: yPercent,
    },
    dimensions: {
      width: 30, // Default sizing
      height: 20,
    },
    content: "",
  });
};
