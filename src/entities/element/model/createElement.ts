import { createId } from "@/shared/lib";
import { DEFAULT_ELEMENT_STYLE } from "./constants";
import type {
  ArrowElement,
  ArrowRouting,
  BoardElement,
  CloudElement,
  CodeSketchElement,
  DiamondElement,
  ElementStyle,
  ElementType,
  EllipseElement,
  EmbedElement,
  FrameElement,
  FreeDrawElement,
  HexagonElement,
  ImageElement,
  LineElement,
  RectangleElement,
  StarElement,
  TextAlign,
  TextElement,
  TriangleElement,
} from "./types";
import type { Point } from "@/shared/types";

type BaseCreateParams = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  style?: Partial<ElementStyle>;
};

type TextCreateParams = BaseCreateParams & {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: TextAlign;
};

type ArrowCreateParams = BaseCreateParams & {
  routing?: ArrowRouting;
};

type FreeDrawCreateParams = BaseCreateParams & {
  points?: Point[];
};

type ImageCreateParams = BaseCreateParams & {
  fileId: string;
  src: string;
  name?: string;
  mimeType?: string;
  originalWidth: number;
  originalHeight: number;
};

function createBase<T extends BoardElement>(
  type: T["type"],
  params: BaseCreateParams,
): Omit<T, "type"> & { type: T["type"] } {
  const now = Date.now();

  return {
    id: createId(type),
    type,
    x: params.x,
    y: params.y,
    width: params.width ?? 0,
    height: params.height ?? 0,
    angle: 0,
    createdAt: now,
    updatedAt: now,
    style: {
      ...DEFAULT_ELEMENT_STYLE,
      ...params.style,
    },
  } as Omit<T, "type"> & { type: T["type"] };
}

export function createRectangle(params: BaseCreateParams): RectangleElement {
  return createBase<RectangleElement>("rectangle", params);
}

export function createEllipse(params: BaseCreateParams): EllipseElement {
  return createBase<EllipseElement>("ellipse", params);
}

export function createDiamond(params: BaseCreateParams): DiamondElement {
  return createBase<DiamondElement>("diamond", params);
}

export function createTriangle(params: BaseCreateParams): TriangleElement {
  return createBase<TriangleElement>("triangle", params);
}

export function createHexagon(params: BaseCreateParams): HexagonElement {
  return createBase<HexagonElement>("hexagon", params);
}

export function createStar(params: BaseCreateParams): StarElement {
  return createBase<StarElement>("star", params);
}

export function createCloud(params: BaseCreateParams): CloudElement {
  return createBase<CloudElement>("cloud", params);
}

export function createLine(params: BaseCreateParams): LineElement {
  return createBase<LineElement>("line", params);
}

export function createArrow(params: ArrowCreateParams): ArrowElement {
  return {
    ...createBase<ArrowElement>("arrow", params),
    routing: params.routing ?? "elbow",
    elbowAxis: "horizontal",
    elbowOffset: 0.5,
  };
}

export function createFrame(params: BaseCreateParams & { name?: string }): FrameElement {
  return {
    ...createBase<FrameElement>("frame", params),
    name: params.name ?? "Frame",
  };
}

export function createEmbed(params: BaseCreateParams & { url?: string }): EmbedElement {
  return {
    ...createBase<EmbedElement>("embed", params),
    url: params.url ?? "https://example.com",
  };
}

export function createCodeSketch(
  params: BaseCreateParams & {
    title?: string;
    code?: string;
    language?: string;
  },
): CodeSketchElement {
  return {
    ...createBase<CodeSketchElement>("code", params),
    title: params.title ?? "Code sketch",
    code: params.code ?? "function component() {\n  return <main />;\n}",
    language: params.language ?? "tsx",
  };
}

export function createFreeDraw(
  params: FreeDrawCreateParams,
): FreeDrawElement {
  return {
    ...createBase<FreeDrawElement>("freedraw", params),
    points: params.points ?? [],
  };
}

export function createImage(params: ImageCreateParams): ImageElement {
  return {
    ...createBase<ImageElement>("image", params),
    fileId: params.fileId,
    src: params.src,
    name: params.name ?? "image",
    mimeType: params.mimeType ?? "image/*",
    originalWidth: params.originalWidth,
    originalHeight: params.originalHeight,
  };
}

export function createText(params: TextCreateParams): TextElement {
  return {
    ...createBase<TextElement>("text", params),
    text: params.text ?? "",
    fontSize: params.fontSize ?? 24,
    fontFamily:
      params.fontFamily ?? '"Segoe Print", "Comic Sans MS", cursive',
    textAlign: params.textAlign ?? "left",
  };
}

export function createElement(
  type: Exclude<ElementType, "image">,
  params: BaseCreateParams & TextCreateParams & ArrowCreateParams & FreeDrawCreateParams,
): BoardElement {
  switch (type) {
    case "rectangle":
      return createRectangle(params);
    case "ellipse":
      return createEllipse(params);
    case "diamond":
      return createDiamond(params);
    case "triangle":
      return createTriangle(params);
    case "hexagon":
      return createHexagon(params);
    case "star":
      return createStar(params);
    case "cloud":
      return createCloud(params);
    case "line":
      return createLine(params);
    case "arrow":
      return createArrow(params);
    case "frame":
      return createFrame(params);
    case "embed":
      return createEmbed(params);
    case "code":
      return createCodeSketch(params);
    case "freedraw":
      return createFreeDraw(params);
    case "text":
      return createText(params);
  }
}
