import { useSyncExternalStore } from "react";
import { TOOL_LABELS, toolStore } from "@/entities/tool";
import { Modal } from "@/shared/ui";
import { TOOL_SETTINGS_CAPABILITIES } from "../model/toolCapabilities";
import { toolSettingsStore } from "../model/toolSettingsStore";
import { SnapSection } from "./SnapSection";
import { ToolStyleSection } from "./ToolStyleSection";

type ToolSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ToolSettingsModal({ isOpen, onClose }: ToolSettingsModalProps) {
  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
  );

  const settings = useSyncExternalStore(
    toolSettingsStore.subscribe,
    toolSettingsStore.get,
    toolSettingsStore.get,
  );

  const capabilities = TOOL_SETTINGS_CAPABILITIES[activeTool];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Настройки: ${TOOL_LABELS[activeTool]}`}
    >
      <p className="mb-5 text-sm text-text-muted">
        Настройки применяются к следующим созданным элементам.
      </p>

      {(capabilities.stroke ||
        capabilities.fill ||
        capabilities.corner ||
        capabilities.opacity) && (
        <ToolStyleSection
          capabilities={capabilities}
          onChange={toolSettingsStore.patchStyle}
          style={settings.style}
        />
      )}

      {capabilities.snap && (
        <SnapSection
          checked={settings.snapToGrid}
          onChange={toolSettingsStore.setSnapToGrid}
        />
      )}
    </Modal>
  );
}
