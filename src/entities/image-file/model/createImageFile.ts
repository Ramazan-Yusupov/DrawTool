import { createId } from "@/shared/lib";
import { getImageDimensions } from "../lib/getImageDimensions";
import type { ImageFile } from "./types";

/** Converts a browser File into board-friendly image metadata. */
export async function createImageFile(file: File): Promise<ImageFile> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Поддерживаются только изображения.");
  }

  const url = URL.createObjectURL(file);

  try {
    const dimensions = await getImageDimensions(url);
    return {
      id: createId("image"),
      name: file.name || "image",
      mimeType: file.type,
      url,
      createdAt: Date.now(),
      ...dimensions,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
