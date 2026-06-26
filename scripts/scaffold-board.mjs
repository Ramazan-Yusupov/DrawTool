import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const groups = {
  "src/app": "App.tsx index.ts",
  "src/app/providers": "AppProviders.tsx withProviders.tsx index.ts",
  "src/app/routes": "AppRouter.tsx routePaths.ts index.ts",
  "src/app/styles": "globals.css tokens.css tailwind.css index.ts",

  "src/entities/element/model":
    "types.ts constants.ts createElement.ts cloneElement.ts updateElement.ts",
  "src/entities/element/lib":
    "getElementBounds.ts hitTestElement.ts normalizeElement.ts getElementCenter.ts getElementRotation.ts",
  "src/entities/element/render":
    "renderElement.ts renderRectangle.ts renderEllipse.ts renderDiamond.ts renderLine.ts renderArrow.ts renderText.ts renderFreeDraw.ts renderImage.ts",
  "src/entities/element": "index.ts",

  "src/entities/history/model":
    "types.ts historyStore.ts createHistoryEntry.ts applyHistoryEntry.ts",
  "src/entities/history/lib": "getHistorySnapshot.ts",
  "src/entities/history": "index.ts",

  "src/entities/image-file/model":
    "types.ts imageFileStore.ts createImageFile.ts",
  "src/entities/image-file/lib":
    "loadImage.ts getImageDimensions.ts revokeImageUrl.ts",
  "src/entities/image-file": "index.ts",

  "src/entities/scene/model":
    "types.ts sceneStore.ts sceneSelectors.ts createScene.ts resetScene.ts",
  "src/entities/scene/lib":
    "serializeScene.ts deserializeScene.ts validateScene.ts",
  "src/entities/scene": "index.ts",

  "src/entities/selection/model":
    "types.ts selectionStore.ts selectionSelectors.ts createSelection.ts",
  "src/entities/selection/lib":
    "getSelectedElements.ts getSelectionBounds.ts isElementSelected.ts",
  "src/entities/selection": "index.ts",

  "src/entities/viewport/model": "types.ts viewportStore.ts createViewport.ts",
  "src/entities/viewport/lib":
    "screenToWorld.ts worldToScreen.ts getVisibleBounds.ts clampZoom.ts zoomAtPoint.ts",
  "src/entities/viewport": "index.ts",

  "src/features/change-style/model":
    "types.ts changeElementStyle.ts useChangeStyle.ts",
  "src/features/change-style/ui": "StyleControl.tsx",
  "src/features/change-style": "index.ts",

  "src/features/delete-elements/model":
    "deleteElements.ts useDeleteElements.ts",
  "src/features/delete-elements": "index.ts",

  "src/features/draw-shape/model":
    "types.ts drawShape.ts useDrawShape.ts createElementByTool.ts",
  "src/features/draw-shape/lib": "getShapePreview.ts",
  "src/features/draw-shape": "index.ts",

  "src/features/duplicate-elements/model":
    "duplicateElements.ts useDuplicateElements.ts",
  "src/features/duplicate-elements": "index.ts",

  "src/features/export-scene/model":
    "types.ts exportToJson.ts exportToPng.ts exportToSvg.ts",
  "src/features/export-scene/lib": "downloadFile.ts createSvgDocument.ts",
  "src/features/export-scene/ui": "ExportMenu.tsx",
  "src/features/export-scene": "index.ts",

  "src/features/import-scene/model":
    "importScene.ts parseSceneFile.ts useImportScene.ts",
  "src/features/import-scene/ui": "ImportButton.tsx",
  "src/features/import-scene": "index.ts",

  "src/features/move-elements/model": "moveElements.ts useMoveElements.ts",
  "src/features/move-elements/lib": "snapToGrid.ts snapToElements.ts",
  "src/features/move-elements": "index.ts",

  "src/features/resize-elements/model":
    "types.ts resizeElements.ts useResizeElements.ts",
  "src/features/resize-elements/lib": "getResizeCursor.ts calculateResize.ts",
  "src/features/resize-elements": "index.ts",

  "src/features/save-scene/model":
    "saveScene.ts useAutoSave.ts useRestoreScene.ts",
  "src/features/save-scene/api": "localSceneRepository.ts",
  "src/features/save-scene": "index.ts",

  "src/features/select-elements/model":
    "selectElement.ts selectByArea.ts useSelectElements.ts",
  "src/features/select-elements/lib": "getElementsInSelectionBox.ts",
  "src/features/select-elements": "index.ts",

  "src/features/toggle-theme/model": "types.ts themeStore.ts toggleTheme.ts",
  "src/features/toggle-theme/ui": "ThemeToggle.tsx",
  "src/features/toggle-theme": "index.ts",

  "src/features/undo-redo/model": "undo.ts redo.ts useUndoRedo.ts",
  "src/features/undo-redo/ui": "UndoRedoButtons.tsx",
  "src/features/undo-redo": "index.ts",

  "src/pages/board/ui": "BoardPage.tsx",
  "src/pages/board/model": "useBoardShortcuts.ts useBoardLifecycle.ts",
  "src/pages/board": "index.ts",

  "src/shared/api": "httpClient.ts apiError.ts apiTypes.ts index.ts",
  "src/shared/config":
    "appConfig.ts canvasConfig.ts env.ts keyboardConfig.ts storageConfig.ts index.ts",
  "src/shared/lib/canvas": "clearCanvas.ts prepareCanvas.ts resizeCanvas.ts",
  "src/shared/lib/dom": "getCanvasPointerPosition.ts preventBrowserZoom.ts",
  "src/shared/lib/math": "clamp.ts distance.ts isPointInRect.ts round.ts",
  "src/shared/lib/performance": "rafThrottle.ts debounce.ts idleCallback.ts",
  "src/shared/lib/storage": "indexedDb.ts localStorage.ts",
  "src/shared/lib": "cn.ts createId.ts index.ts",
  "src/shared/types":
    "common.ts geometry.ts keyboard.ts pointer.ts utility.ts index.ts",

  "src/shared/ui/Button": "Button.tsx types.ts",
  "src/shared/ui/Divider": "Divider.tsx",
  "src/shared/ui/IconButton": "IconButton.tsx types.ts",
  "src/shared/ui/Panel": "Panel.tsx",
  "src/shared/ui/Popover": "Popover.tsx usePopover.ts",
  "src/shared/ui/Tooltip": "Tooltip.tsx",
  "src/shared/ui": "index.ts",

  "src/shared/assets": "logo.svg index.ts",
  "src/shared/assets/icons":
    "arrow.svg download.svg image.svg redo.svg select.svg undo.svg zoom-in.svg zoom-out.svg",
  "src/shared/assets/cursors":
    "cursor-hand.svg cursor-pencil.svg cursor-eraser.svg",

  "src/widgets/board-shell/ui":
    "BoardShell.tsx BoardCanvas.tsx CanvasOverlay.tsx SelectionFrame.tsx ShapePreview.tsx",
  "src/widgets/board-shell/model":
    "useBoardRenderer.ts useCanvasSize.ts useCanvasPointerEvents.ts useCanvasWheel.ts",
  "src/widgets/board-shell/lib":
    "renderScene.ts renderGrid.ts renderSelection.ts renderPreview.ts",
  "src/widgets/board-shell": "index.ts",

  "src/widgets/layers-panel/ui": "LayersPanel.tsx LayerRow.tsx",
  "src/widgets/layers-panel/model": "useLayersPanel.ts getLayers.ts",
  "src/widgets/layers-panel": "index.ts",

  "src/widgets/properties-panel/ui":
    "PropertiesPanel.tsx FillSection.tsx StrokeSection.tsx OpacitySection.tsx GeometrySection.tsx",
  "src/widgets/properties-panel/model": "usePropertiesPanel.ts",
  "src/widgets/properties-panel": "index.ts",

  "src/widgets/toolbar/ui":
    "Toolbar.tsx ToolButton.tsx ShapeTools.tsx ActionTools.tsx",
  "src/widgets/toolbar/model": "toolItems.ts useActiveTool.ts",
  "src/widgets/toolbar": "index.ts",

  "src/widgets/zoom-controls/ui": "ZoomControls.tsx ZoomValue.tsx",
  "src/widgets/zoom-controls/model": "useZoomControls.ts",
  "src/widgets/zoom-controls": "index.ts",
};

const getContent = (filePath) => {
  if (filePath.endsWith(".svg")) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>\n';
  }

  if (filePath.endsWith(".css")) {
    return "/* TODO: styles */\n";
  }

  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    return "export {};\n";
  }

  return "";
};

const paths = Object.entries(groups).flatMap(([folder, files]) =>
  files.split(" ").map((file) => `${folder}/${file}`),
);

let created = 0;

for (const relativePath of paths) {
  const absolutePath = resolve(process.cwd(), relativePath);

  mkdirSync(dirname(absolutePath), { recursive: true });

  if (existsSync(absolutePath)) {
    continue;
  }

  writeFileSync(absolutePath, getContent(relativePath), "utf8");
  created += 1;
}

console.log(`Created ${created} files. Existing files were not changed.`);
