import { createId } from "@/shared/lib";
import { DEFAULT_ELEMENT_STYLE } from "./constants";
import type { RectangleElement } from "./types";

type CreateRectangleParams = Pick<
  RectangleElement,
  "x" | "y" | "width" | "height"
> &
  Partial<Pick<RectangleElement, "style">>;

export function createRectangle(
  params: CreateRectangleParams,
): RectangleElement {
  const now = Date.now();

  return {
    id: createId("rectangle"),
    type: "rectangle",
    x: params.x,
    y: params.y,
    width: params.width,
    height: params.height,
    createdAt: now,
    updatedAt: now,
    style: {
      ...DEFAULT_ELEMENT_STYLE,
      ...params.style,
    },
  };
}
