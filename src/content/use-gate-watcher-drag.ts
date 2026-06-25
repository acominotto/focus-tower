import {
  clampPixels,
  normalizedToPixels,
  patchGateWatcherLayout,
  pixelsToNormalized,
  type GateWatcherLayout,
} from "../lib/gate-watcher-layout.js";

const DRAG_THRESHOLD_PX = 6;

export interface GateWatcherDragOptions {
  shell: HTMLElement;
  siteKey: string;
  trigger: HTMLElement;
  onTap: () => void;
  layout: GateWatcherLayout;
}

export function applyGateWatcherPosition(shell: HTMLElement, layout: GateWatcherLayout): void {
  const rect = shell.getBoundingClientRect();
  const width = rect.width || shell.offsetWidth || 80;
  const height = rect.height || shell.offsetHeight || 32;
  const { left, top } = normalizedToPixels(
    layout,
    window.innerWidth,
    window.innerHeight,
    width,
    height,
  );

  shell.dataset.positioned = "true";
  shell.style.right = "auto";
  shell.style.bottom = "auto";
  shell.style.left = `${left}px`;
  shell.style.top = `${top}px`;
}

export function useGateWatcherDrag({
  shell,
  siteKey,
  trigger,
  onTap,
  layout,
}: GateWatcherDragOptions): () => void {
  applyGateWatcherPosition(shell, layout);

  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let originLeft = 0;
  let originTop = 0;
  let dragging = false;

  const onResize = (): void => {
    const rect = shell.getBoundingClientRect();
    applyGateWatcherPosition(shell, {
      ...layout,
      ...pixelsToNormalized(
        rect.left,
        rect.top,
        window.innerWidth,
        window.innerHeight,
        rect.width,
        rect.height,
      ),
    });
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) {
      return;
    }

    const rect = shell.getBoundingClientRect();
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    originLeft = rect.left;
    originTop = rect.top;
    dragging = false;
    trigger.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (!dragging && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
      return;
    }

    if (!dragging) {
      dragging = true;
      shell.classList.add("is-dragging");
      trigger.classList.add("is-dragging");
    }

    const rect = shell.getBoundingClientRect();
    const next = clampPixels(
      originLeft + deltaX,
      originTop + deltaY,
      window.innerWidth,
      window.innerHeight,
      rect.width,
      rect.height,
    );

    shell.dataset.positioned = "true";
    shell.style.right = "auto";
    shell.style.bottom = "auto";
    shell.style.left = `${next.left}px`;
    shell.style.top = `${next.top}px`;
  };

  const finishPointer = async (event: PointerEvent): Promise<void> => {
    if (pointerId !== event.pointerId) {
      return;
    }

    trigger.releasePointerCapture(event.pointerId);
    pointerId = null;

    if (dragging) {
      dragging = false;
      shell.classList.remove("is-dragging");
      trigger.classList.remove("is-dragging");

      const rect = shell.getBoundingClientRect();
      await patchGateWatcherLayout(siteKey, {
        ...pixelsToNormalized(
          rect.left,
          rect.top,
          window.innerWidth,
          window.innerHeight,
          rect.width,
          rect.height,
        ),
      });
      return;
    }

    onTap();
  };

  const onPointerUp = (event: PointerEvent): void => {
    void finishPointer(event);
  };

  const onPointerCancel = (event: PointerEvent): void => {
    if (!dragging) {
      pointerId = null;
      return;
    }
    void finishPointer(event);
  };

  trigger.addEventListener("pointerdown", onPointerDown);
  trigger.addEventListener("pointermove", onPointerMove);
  trigger.addEventListener("pointerup", onPointerUp);
  trigger.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("resize", onResize);

  return () => {
    trigger.removeEventListener("pointerdown", onPointerDown);
    trigger.removeEventListener("pointermove", onPointerMove);
    trigger.removeEventListener("pointerup", onPointerUp);
    trigger.removeEventListener("pointercancel", onPointerCancel);
    window.removeEventListener("resize", onResize);
  };
}
