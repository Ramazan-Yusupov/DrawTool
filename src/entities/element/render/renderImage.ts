type RenderImageOptions = {
  height: number;
  image: CanvasImageSource;
  opacity?: number;
  width: number;
  x: number;
  y: number;
};

/** Draws an already-loaded image without leaking image-specific logic into renderScene. */
export function renderImage(
  context: CanvasRenderingContext2D,
  { image, x, y, width, height, opacity = 1 }: RenderImageOptions,
) {
  context.save();
  context.globalAlpha *= opacity;
  context.drawImage(image, x, y, width, height);
  context.restore();
}
