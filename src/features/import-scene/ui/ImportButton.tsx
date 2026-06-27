import { Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/shared/ui";
import { useImportScene } from "../model/useImportScene";

type ImportButtonProps = { className?: string };

/** File-picker button for replacing the current board with a DrawTool JSON scene. */
export function ImportButton({ className }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { error, importFile, isImporting } = useImportScene();

  return (
    <div className="relative">
      <Button
        className={className}
        disabled={isImporting}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <Upload aria-hidden size={16} />
        {isImporting ? "Импорт…" : "Импорт"}
      </Button>
      <input
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void importFile(file);
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      {error && <p className="absolute left-0 top-full mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
