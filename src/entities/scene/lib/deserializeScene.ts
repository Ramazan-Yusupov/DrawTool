import type { BoardElement } from "@/entities/element";
import { validateScene } from "./validateScene";

const MAX_ARROW_WAYPOINTS = 10;

/** Parses a DrawTool JSON scene and applies safe defaults for older scenes. */
export function deserializeScene(source: string): BoardElement[] {
  const parsed: unknown = JSON.parse(source);

  if (!validateScene(parsed)) {
    throw new Error("Файл не похож на сцену DrawTool.");
  }

  return parsed.elements.map((element) => ({
    ...element,
    angle:
      element.type === "arrow"
        ? 0
        : typeof element.angle === "number"
          ? element.angle
          : 0,
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
          waypoints:
            element.routing === "straight" && Array.isArray(element.waypoints)
              ? element.waypoints.slice(0, MAX_ARROW_WAYPOINTS)
              : undefined,
          waypointBindings:
            element.routing === "straight" &&
            Array.isArray(element.waypoints) &&
            Array.isArray(element.waypointBindings)
              ? element.waypointBindings
                  .slice(
                    0,
                    Math.min(element.waypoints.length, MAX_ARROW_WAYPOINTS),
                  )
                  .map((binding) => binding ?? null)
              : undefined,
        }
      : {}),
    ...(element.type === "markdown"
      ? {
          title: typeof element.title === "string" ? element.title : "Markdown note",
          content: typeof element.content === "string" ? element.content : "",
          fontSize: typeof element.fontSize === "number" ? element.fontSize : 15,
        }
      : {}),
    ...(element.type === "image"
      ? {
          cornerRadius:
            typeof element.cornerRadius === "number" ? element.cornerRadius : 0,
          objectFit:
            element.objectFit === "contain" ||
            element.objectFit === "cover" ||
            element.objectFit === "scale-down" ||
            element.objectFit === "none"
              ? element.objectFit
              : "fill",
          objectPosition:
            element.objectPosition === "top" ||
            element.objectPosition === "bottom" ||
            element.objectPosition === "left" ||
            element.objectPosition === "right"
              ? element.objectPosition
              : "center",
          shape: element.shape === "circle" ? "circle" : "rectangle",
        }
      : {}),
    style: { ...element.style },
  }));
}
