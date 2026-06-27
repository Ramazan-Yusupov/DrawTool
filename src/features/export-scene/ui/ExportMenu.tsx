import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { sceneStore } from "@/entities/scene";
import { Button } from "@/shared/ui";
import { downloadFile } from "../lib/downloadFile";
import { exportToJson } from "../model/exportToJson";
import { exportToPng } from "../model/exportToPng";
import { exportToSvg } from "../model/exportToSvg";
import type { ExportFormat } from "../model/types";

type ExportMenuProps = {
  children?: ReactNode;
  className?: string;
  format?: ExportFormat;
  onExported?: () => void;
  title?: string;
};

/** Download action for JSON, SVG or PNG export. */
export function ExportMenu({
  children,
  className,
  format = "json",
  onExported,
  title,
}: ExportMenuProps) {
  async function handleExport() {
    const elements = sceneStore.get().elements;
    const file =
      format === "png"
        ? await exportToPng(elements)
        : format === "svg"
          ? exportToSvg(elements)
          : exportToJson(elements);

    downloadFile(file.blob, file.fileName);
    onExported?.();
  }

  return (
    <Button
      className={className}
      onClick={() => void handleExport()}
      title={title}
      type="button"
    >
      {children ?? (
        <>
          <Download aria-hidden size={16} />
          Экспорт {format.toUpperCase()}
        </>
      )}
    </Button>
  );
}
