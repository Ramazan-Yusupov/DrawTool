import type { ReactNode } from "react";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/shared/ui";
import { useImportScene } from "../model/useImportScene";

type ImportButtonProps = {
  children?: ReactNode;
  className?: string;
  onImported?: () => void;
  title?: string;
};

/** File-picker action for replacing the active board with a DrawTool JSON scene. */
export function ImportButton({
  children,
  className,
  onImported,
  title,
}: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { error, importFile, isImporting } = useImportScene();

  async function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    const imported = await importFile(file);

    if (imported) {
      onImported?.();
    }
  }

  return (
    <div className="relative">
      <Button
        className={className}
        disabled={isImporting}
        onClick={() => inputRef.current?.click()}
        title={title}
        type="button"
      >
        {children ?? (
          <>
            <Upload aria-hidden size={16} />
            {isImporting ? "Импорт…" : "Импорт"}
          </>
        )}
      </Button>
      <input
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          void handleFileChange(event.currentTarget.files?.[0]);
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      {error && (
        <p className="absolute left-0 top-full z-[60] mt-1 w-56 rounded-md border border-red-500/30 bg-panel px-2 py-1 text-xs text-red-500 shadow-panel">
          {error}
        </p>
      )}
    </div>
  );
}
