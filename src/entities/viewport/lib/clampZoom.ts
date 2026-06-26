import { CANVAS_CONFIG } from "@/shared/config";
import { clamp } from "@/shared/lib/math/clamp";

export function clampZoom(zoom: number) {
  return clamp(zoom, CANVAS_CONFIG.minZoom, CANVAS_CONFIG.maxZoom);
}
