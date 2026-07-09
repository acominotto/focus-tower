export interface GateWatcherLayout {
  /** Normalized horizontal position (0 = left edge, 1 = right edge). */
  x: number;
  /** Normalized vertical position (0 = top edge, 1 = bottom edge). */
  y: number;
  hidden: boolean;
}

export type GateWatcherLayouts = Record<string, GateWatcherLayout>;

export const DEFAULT_GATE_WATCHER_LAYOUT: GateWatcherLayout = {
  x: 1,
  y: 1,
  hidden: false,
};

export function clampNormalized(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function normalizedToPixels(
  layout: Pick<GateWatcherLayout, "x" | "y">,
  viewportWidth: number,
  viewportHeight: number,
  widgetWidth: number,
  widgetHeight: number,
): { left: number; top: number } {
  const maxX = Math.max(0, viewportWidth - widgetWidth);
  const maxY = Math.max(0, viewportHeight - widgetHeight);
  return {
    left: clampNormalized(layout.x) * maxX,
    top: clampNormalized(layout.y) * maxY,
  };
}

export function pixelsToNormalized(
  left: number,
  top: number,
  viewportWidth: number,
  viewportHeight: number,
  widgetWidth: number,
  widgetHeight: number,
): Pick<GateWatcherLayout, "x" | "y"> {
  const maxX = Math.max(0, viewportWidth - widgetWidth);
  const maxY = Math.max(0, viewportHeight - widgetHeight);
  return {
    x: maxX === 0 ? 0 : clampNormalized(left / maxX),
    y: maxY === 0 ? 0 : clampNormalized(top / maxY),
  };
}

export function clampPixels(
  left: number,
  top: number,
  viewportWidth: number,
  viewportHeight: number,
  widgetWidth: number,
  widgetHeight: number,
): { left: number; top: number } {
  const maxX = Math.max(0, viewportWidth - widgetWidth);
  const maxY = Math.max(0, viewportHeight - widgetHeight);
  return {
    left: Math.min(maxX, Math.max(0, left)),
    top: Math.min(maxY, Math.max(0, top)),
  };
}
