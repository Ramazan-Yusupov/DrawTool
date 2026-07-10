import { getSelectableSceneElements, sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import type { Rect } from "@/shared/types";
import { getElementsInSelectionBox } from "../lib/getElementsInSelectionBox";

export function selectByArea(selectionBox: Rect, append = false) {
  const elementIds = getElementsInSelectionBox(
    getSelectableSceneElements(sceneStore.get()),
    selectionBox,
  ).map((element) => element.id);

  selectionStore.setElementIds(
    append
      ? [...selectionStore.get().elementIds, ...elementIds]
      : elementIds,
  );
}
