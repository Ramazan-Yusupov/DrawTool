import type { Point } from "@/shared/types";

export type ElementType =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "hexagon"
  | "star"
  | "cloud"
  | "line"
  | "arrow"
  | "freedraw"
  | "highlighter"
  | "text"
  | "sticky"
  | "callout"
  | "measure"
  | "table"
  | "sticker"
  | "frame"
  | "embed"
  | "code"
  | "image";

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type FillStyle = "transparent" | "solid";
export type CornerStyle = "sharp" | "rounded";
export type ArrowRouting = "straight" | "elbow";
export type ElbowAxis = "horizontal" | "vertical";
export type TextAlign = "left" | "center" | "right";

export type ElementStyle = {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  fillStyle: FillStyle;
  cornerStyle: CornerStyle;
  opacity: number;
};

/** Connection metadata for an endpoint attached to another board element. */
export type ElementBinding = {
  elementId: string;
  /** Reserved normalized anchor focus. Existing scenes can safely omit it. */
  focus: number;
};

export type BaseElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Rotation in radians. It may exceed 2π while the user keeps rotating. */
  angle: number;
  /** Optional containing Frame. Frame children move and resize with their parent. */
  parentId?: string;
  /** Optional external link opened with Ctrl/Cmd + click while using selection. */
  link?: string;
  createdAt: number;
  updatedAt: number;
  style: ElementStyle;
};

export type RectangleElement = BaseElement & { type: "rectangle" };
export type EllipseElement = BaseElement & { type: "ellipse" };
export type DiamondElement = BaseElement & { type: "diamond" };
export type TriangleElement = BaseElement & { type: "triangle" };
export type HexagonElement = BaseElement & { type: "hexagon" };
export type StarElement = BaseElement & { type: "star" };
export type CloudElement = BaseElement & { type: "cloud" };
export type LineElement = BaseElement & { type: "line" };

export type ArrowElement = BaseElement & {
  type: "arrow";
  routing: ArrowRouting;
  elbowAxis: ElbowAxis;
  elbowOffset: number;
  startBinding?: ElementBinding;
  endBinding?: ElementBinding;
};

export type FreeDrawElement = BaseElement & {
  type: "freedraw";
  points: Point[];
};

/** Wide semi-transparent freehand stroke. */
export type HighlighterElement = BaseElement & {
  type: "highlighter";
  points: Point[];
};

export type FrameElement = BaseElement & {
  type: "frame";
  name: string;
};

export type EmbedElement = BaseElement & {
  type: "embed";
  url: string;
};

/** A self-contained, resizable code card. Its title and source stay inside the card. */
export type CodeSketchElement = BaseElement & {
  type: "code";
  title: string;
  code: string;
  language: string;
};

/** A portable image. The data URL keeps the asset available after save/export/import. */
export type ImageElement = BaseElement & {
  type: "image";
  fileId: string;
  src: string;
  name: string;
  mimeType: string;
  originalWidth: number;
  originalHeight: number;
};

export type TextElement = BaseElement & {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: TextAlign;
};

/** Sticky note with independently editable text and a folded corner. */
export type StickyElement = BaseElement & {
  type: "sticky";
  text: string;
  fontSize: number;
  fontFamily: string;
};

/** Review comment card. targetPoint is synchronized from targetId when attached. */
export type CalloutElement = BaseElement & {
  type: "callout";
  text: string;
  fontSize: number;
  fontFamily: string;
  targetId?: string;
  targetPoint?: Point;
};

/** A line that permanently displays distance, dimensions and angle. */
export type MeasureElement = BaseElement & { type: "measure" };

/** Lightweight table with a grid and serialized cell values. */
export type TableElement = BaseElement & {
  type: "table";
  rows: number;
  columns: number;
  cells: string[];
};

/** Emoji or symbol sticker. Symbols are deliberately portable in scene JSON. */
export type StickerElement = BaseElement & {
  type: "sticker";
  content: string;
  fontSize: number;
};

export type BoardElement =
  | RectangleElement
  | EllipseElement
  | DiamondElement
  | TriangleElement
  | HexagonElement
  | StarElement
  | CloudElement
  | LineElement
  | ArrowElement
  | FreeDrawElement
  | HighlighterElement
  | TextElement
  | StickyElement
  | CalloutElement
  | MeasureElement
  | TableElement
  | StickerElement
  | FrameElement
  | EmbedElement
  | CodeSketchElement
  | ImageElement;

export type ElementEndpoints = {
  start: Point;
  end: Point;
};
