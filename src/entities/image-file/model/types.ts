/** Metadata for an image kept in memory through an object URL. */
export type ImageFile = {
  createdAt: number;
  height: number;
  id: string;
  mimeType: string;
  name: string;
  url: string;
  width: number;
};

export type ImageDimensions = Pick<ImageFile, "width" | "height">;
