import type { AdvancedElement } from "../model/types";
import { drawRoundedRectPath } from "./drawRoundedRectPath";

const PAD = 12;

function getAdvancedElementBounds(element: AdvancedElement) {
  const x = Math.min(element.x, element.x + element.width);
  const y = Math.min(element.y, element.y + element.height);

  return {
    x,
    y,
    width: Math.abs(element.width),
    height: Math.abs(element.height),
  };
}

function textLines(
  context: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight = 18,
) {
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
}

function drawPanel(
  context: CanvasRenderingContext2D,
  element: AdvancedElement,
) {
  const bounds = getAdvancedElementBounds(element);
  context.globalAlpha = element.style.opacity;
  context.lineWidth = element.style.strokeWidth;
  context.strokeStyle = element.style.strokeColor;
  context.fillStyle =
    element.style.fillStyle === "solid"
      ? element.style.backgroundColor
      : "transparent";
  drawRoundedRectPath(
    context,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    12,
  );
  context.fill();
  context.stroke();
  return bounds;
}

function drawTitle(
  context: CanvasRenderingContext2D,
  element: AdvancedElement,
  y: number,
) {
  const bounds = getAdvancedElementBounds(element);
  context.fillStyle = element.style.strokeColor;
  context.font = "700 15px Inter, ui-sans-serif, system-ui, sans-serif";
  context.textBaseline = "top";
  context.fillText(element.title, bounds.x + PAD, y);
}

export function renderAdvanced(
  context: CanvasRenderingContext2D,
  element: AdvancedElement,
) {
  const bounds = drawPanel(context, element);
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  context.save();
  context.fillStyle = "#dbeafe";
  context.font = "13px Inter, ui-sans-serif, system-ui, sans-serif";
  context.textBaseline = "top";

  if (element.kind === "bpmn-event") {
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      Math.min(bounds.width, bounds.height) * 0.36,
      0,
      Math.PI * 2,
    );
    context.stroke();
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      Math.min(bounds.width, bounds.height) * 0.27,
      0,
      Math.PI * 2,
    );
    context.stroke();
    context.textAlign = "center";
    context.fillText(element.title, centerX, centerY - 8);
    context.restore();
    return;
  }

  if (element.kind === "bpmn-gateway") {
    context.beginPath();
    context.moveTo(centerX, bounds.y + PAD);
    context.lineTo(bounds.x + bounds.width - PAD, centerY);
    context.lineTo(centerX, bounds.y + bounds.height - PAD);
    context.lineTo(bounds.x + PAD, centerY);
    context.closePath();
    context.stroke();
    context.textAlign = "center";
    context.fillText(element.title, centerX, centerY - 8);
    context.restore();
    return;
  }

  drawTitle(context, element, bounds.y + PAD);

  if (element.kind === "swimlane" || element.kind === "kanban-board") {
    const lanes = Math.max(1, element.body.length);
    const laneWidth = bounds.width / lanes;
    element.body.forEach((lane, index) => {
      const x = bounds.x + laneWidth * index;
      if (index > 0) {
        context.beginPath();
        context.moveTo(x, bounds.y + 36);
        context.lineTo(x, bounds.y + bounds.height);
        context.stroke();
      }
      context.fillStyle = "#bfdbfe";
      context.fillText(lane, x + PAD, bounds.y + 46);
      if (element.kind === "kanban-board") {
        context.fillStyle = "rgb(30 41 59 / 82%)";
        drawRoundedRectPath(
          context,
          x + 10,
          bounds.y + 78,
          laneWidth - 20,
          46,
          8,
        );
        context.fill();
      }
    });
    context.restore();
    return;
  }

  if (element.kind === "uml-class" || element.kind === "erd-table") {
    context.beginPath();
    context.moveTo(bounds.x, bounds.y + 42);
    context.lineTo(bounds.x + bounds.width, bounds.y + 42);
    context.stroke();
    textLines(context, element.body, bounds.x + PAD, bounds.y + 56);
    context.restore();
    return;
  }

  if (element.kind === "uml-actor") {
    context.textAlign = "center";
    context.beginPath();
    context.arc(centerX, bounds.y + 58, 18, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(centerX, bounds.y + 76);
    context.lineTo(centerX, bounds.y + 132);
    context.moveTo(centerX - 35, bounds.y + 98);
    context.lineTo(centerX + 35, bounds.y + 98);
    context.moveTo(centerX, bounds.y + 132);
    context.lineTo(centerX - 30, bounds.y + bounds.height - 22);
    context.moveTo(centerX, bounds.y + 132);
    context.lineTo(centerX + 30, bounds.y + bounds.height - 22);
    context.stroke();
    context.fillText(element.title, centerX, bounds.y + bounds.height - 18);
    context.restore();
    return;
  }

  if (element.kind === "timeline") {
    const y = centerY + 18;
    context.beginPath();
    context.moveTo(bounds.x + PAD, y);
    context.lineTo(bounds.x + bounds.width - PAD, y);
    context.stroke();
    element.body.forEach((item, index) => {
      const x =
        bounds.x +
        PAD +
        (bounds.width - PAD * 2) *
          (index / Math.max(1, element.body.length - 1));
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.fill();
      context.fillText(item, x - 28, y + 14);
    });
    context.restore();
    return;
  }

  if (element.kind === "wireframe") {
    context.strokeRect(
      bounds.x + PAD,
      bounds.y + 44,
      bounds.width - PAD * 2,
      28,
    );
    context.strokeRect(
      bounds.x + PAD,
      bounds.y + 84,
      bounds.width * 0.48,
      bounds.height - 104,
    );
    context.strokeRect(
      bounds.x + bounds.width * 0.56,
      bounds.y + 84,
      bounds.width * 0.32,
      34,
    );
    context.strokeRect(
      bounds.x + bounds.width * 0.56,
      bounds.y + 132,
      bounds.width * 0.32,
      34,
    );
    context.restore();
    return;
  }

  if (element.kind === "cloud-service") {
    context.fillStyle = "rgb(59 130 246 / 18%)";
    context.beginPath();
    context.arc(bounds.x + 62, centerY, 34, Math.PI * 0.8, Math.PI * 1.95);
    context.arc(bounds.x + 103, centerY - 26, 40, Math.PI, Math.PI * 2);
    context.arc(bounds.x + 154, centerY, 35, Math.PI * 1.15, Math.PI * 0.25);
    context.closePath();
    context.fill();
    context.stroke();
  }

  textLines(context, element.body, bounds.x + PAD, bounds.y + 48);
  context.restore();
}
