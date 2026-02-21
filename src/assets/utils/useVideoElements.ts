import { ref, type Ref, type ComponentPublicInstance } from "vue";
import type Breakpoint from "../interfaces/BreakpointType";
import type { TextContent, VoiceContent } from "../interfaces/BreakpointType";

type ElementType = "text" | "voice";

export function useVideoElements(
  activeBreakpoint: Ref<Breakpoint | null>,
  editing: Ref<null | "draw" | "trim" | "text" | "voice" | "delete">,
  container: Ref<HTMLElement | null>,
  checkDrawingCollision: (x: number, y: number) => void,
) {
  const isDeleting = ref(false);
  const itemRefs = ref<Record<number, ComponentPublicInstance | HTMLElement>>(
    {},
  );

  const setItemRef = (
    el: ComponentPublicInstance | HTMLElement | null,
    id: number,
  ) => {
    if (el) {
      itemRefs.value[id] = el;
    } else {
      delete itemRefs.value[id];
    }
  };

  const deleteElement = (id: number, type: ElementType, event?: MouseEvent) => {
    if (editing.value === "delete" && activeBreakpoint.value) {
      if (event) event.stopPropagation();
      if (type === "text" && activeBreakpoint.value.textContent) {
        activeBreakpoint.value.textContent =
          activeBreakpoint.value.textContent.filter(
            (t: TextContent) => t.id !== id,
          );
      } else if (type === "voice" && activeBreakpoint.value.voiceContent) {
        activeBreakpoint.value.voiceContent =
          activeBreakpoint.value.voiceContent.filter(
            (v: VoiceContent) => v.id !== id,
          );
      }
    }
  };

  const performBufferedDeletion = (x: number, y: number) => {
    checkDrawingCollision(x, y);

    for (const id in itemRefs.value) {
      const component = itemRefs.value[id as unknown as number];
      // Type guard for ComponentPublicInstance vs HTMLElement
      const el =
        component && "$el" in component
          ? (component.$el as HTMLElement)
          : (component as HTMLElement);

      if (el instanceof HTMLElement) {
        const rect = el.getBoundingClientRect();
        if (!container.value) continue;
        const containerRect = container.value.getBoundingClientRect();
        const elLeft = rect.left - containerRect.left;
        const elTop = rect.top - containerRect.top;

        if (
          x >= elLeft &&
          x <= elLeft + rect.width &&
          y >= elTop &&
          y <= elTop + rect.height
        ) {
          if (
            activeBreakpoint.value?.textContent?.some(
              (t: TextContent) => t.id === Number(id),
            )
          ) {
            deleteElement(Number(id), "text");
          } else if (
            activeBreakpoint.value?.voiceContent?.some(
              (v: VoiceContent) => v.id === Number(id),
            )
          ) {
            deleteElement(Number(id), "voice");
          }
        }
      }
    }
  };

  return {
    isDeleting,
    itemRefs,
    setItemRef,
    deleteElement,
    performBufferedDeletion,
  };
}
