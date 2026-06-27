import { Download } from "lucide-react";
import { sceneStore } from "@/entities/scene";
import { Button } from "@/shared/ui";
import { downloadFile } from "../lib/downloadFile";
import { exportToJson } from "../model/exportToJson";
import { exportToSvg } from "../model/exportToSvg";
import type { ExportFormat } from "../model/types";
import { exportToPng } from "../model/exportToPng";

type ExportMenuProps = { className?: string; format?: ExportFormat };

/** Download action for JSON, SVG or PNG export. */
export function ExportMenu({ className, format = "json" }: ExportMenuProps) {
  async function handleExport() {
    const elements = sceneStore.get().elements;
    const file = format === "png"
      ? await exportToPng(elements)
      : format === "svg"
        ? exportToSvg(elements)
        : exportToJson(elements);
    downloadFile(file.blob, file.fileName);
  }

  return (
    <Button className={className} onClick={() => void handleExport()} type="button">
      <Download aria-hidden size={16} />
      Экспорт {format.toUpperCase()}
    </Button>
  );
}
