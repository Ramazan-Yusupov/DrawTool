import { useCallback, useState } from "react";
import { importScene } from "./importScene";
import { parseSceneFile } from "./parseSceneFile";

/** File import controller with loading and error state for UI triggers. */
export function useImportScene() {
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const importFile = useCallback(async (file: File) => {
    setIsImporting(true);
    setError(null);

    try {
      importScene(await parseSceneFile(file));
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось импортировать сцену.");
      return false;
    } finally {
      setIsImporting(false);
    }
  }, []);

  return { error, importFile, isImporting };
}
