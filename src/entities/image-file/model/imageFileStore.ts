import { revokeImageUrl } from "../lib/revokeImageUrl";
import type { ImageFile } from "./types";

type ImageFileListener = () => void;

let files: ImageFile[] = [];
const listeners = new Set<ImageFileListener>();

function notify() {
  listeners.forEach((listener) => listener());
}

/** In-memory registry for object URLs used by future image elements. */
export const imageFileStore = {
  get() {
    return files;
  },

  add(file: ImageFile) {
    files = [...files, file];
    notify();
  },

  getById(id: string) {
    return files.find((file) => file.id === id) ?? null;
  },

  remove(id: string) {
    const file = files.find((item) => item.id === id);
    if (!file) return false;
    revokeImageUrl(file.url);
    files = files.filter((item) => item.id !== id);
    notify();
    return true;
  },

  clear() {
    files.forEach((file) => revokeImageUrl(file.url));
    files = [];
    notify();
  },

  subscribe(listener: ImageFileListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
