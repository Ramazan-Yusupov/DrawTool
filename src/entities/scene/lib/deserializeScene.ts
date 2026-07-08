import type { BoardElement } from "@/entities/element";
import { validateScene } from "./validateScene";

/** Parses a DrawTool JSON scene and applies safe defaults for older scenes. */
export function deserializeScene(source: string): BoardElement[] {
  const parsed: unknown = JSON.parse(source);

  if (!validateScene(parsed)) {
    throw new Error("Файл не похож на сцену DrawTool.");
  }

  return parsed.elements.map((element) => ({
    ...element,
    angle: typeof element.angle === "number" ? element.angle : 0,
    ...(element.type === "arrow"
      ? {
          routing:
            element.routing === "straight" || element.routing === "curve"
              ? element.routing
              : "elbow",
          routeCornerStyle:
            element.routeCornerStyle === "rounded" ? "rounded" : "sharp",
          elbowAxis: element.elbowAxis ?? "horizontal",
          elbowOffset:
            typeof element.elbowOffset === "number" ? element.elbowOffset : 0.5,
          curveOffset:
            typeof element.curveOffset === "number" ? element.curveOffset : 0.22,
        }
      : {}),
    ...(element.type === "markdown"
      ? {
          title: typeof element.title === "string" ? element.title : "Markdown note",
          content: typeof element.content === "string" ? element.content : "",
          fontSize: typeof element.fontSize === "number" ? element.fontSize : 15,
        }
      : {}),
    style: { ...element.style },
  }));
}
