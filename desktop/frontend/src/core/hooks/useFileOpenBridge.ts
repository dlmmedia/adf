import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useAdf } from "@app/contexts/AdfContext";
import { useFileHandler } from "@app/hooks/useFileHandler";
import { isAdfFile } from "@app/utils/adf-loader";
import { pendingFilePathMappings } from "@app/services/pendingFilePathMappings";

const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/**
 * Bridges Tauri file-open events (file associations, drag-drop, CLI args) to
 * the React frontend.  Listens for the Rust-side `files-changed` event,
 * retrieves pending file paths via the `pop_opened_files` command, then routes
 * each file to the appropriate handler:
 *   - `.adf` files → AdfContext (unzips and loads the ADF container)
 *   - `.pdf` files → auto-converts to ADF, then loads into AdfContext
 *   - other files  → FileContext workbench (for Stirling tools)
 *
 * Also runs once on mount to pick up files passed as startup arguments.
 */
export function useFileOpenBridge(): void {
  const { loadAdf, convertAndLoadPdf } = useAdf();
  const { addFiles } = useFileHandler();
  const processingRef = useRef(false);

  const processOpenedFiles = async () => {
    if (!isTauri() || processingRef.current) return;
    processingRef.current = true;

    try {
      const paths: string[] = await invoke("pop_opened_files");
      if (paths.length === 0) return;

      const adfPaths: string[] = [];
      const pdfPaths: string[] = [];
      const otherPaths: string[] = [];

      for (const p of paths) {
        if (isAdfFile(p)) {
          adfPaths.push(p);
        } else if (p.toLowerCase().endsWith(".pdf")) {
          pdfPaths.push(p);
        } else {
          otherPaths.push(p);
        }
      }

      // Load ADF files directly into the ADF viewer
      for (const adfPath of adfPaths) {
        try {
          const bytes: number[] = await invoke("open_adf_file", { path: adfPath });
          const uint8 = new Uint8Array(bytes);
          const name = adfPath.split(/[\\/]/).pop() || "document.adf";
          const adfFile = new File([uint8], name, { type: "application/zip" });
          await loadAdf(adfFile);
        } catch (err) {
          console.error("[FileOpenBridge] Failed to load ADF file:", adfPath, err);
        }
      }

      // Auto-convert PDFs to ADF and load into the ADF viewer
      for (const pdfPath of pdfPaths) {
        try {
          const bytes: number[] = await invoke("open_adf_file", { path: pdfPath });
          const uint8 = new Uint8Array(bytes);
          const name = pdfPath.split(/[\\/]/).pop() || "document.pdf";
          const pdfFile = new File([uint8], name, { type: "application/pdf" });
          await convertAndLoadPdf(pdfFile);
        } catch (err) {
          console.error("[FileOpenBridge] Failed to convert PDF:", pdfPath, err);
        }
      }

      // Other file types go to the workbench
      if (otherPaths.length > 0) {
        const files: File[] = [];
        for (const filePath of otherPaths) {
          try {
            const bytes: number[] = await invoke("open_adf_file", { path: filePath });
            const uint8 = new Uint8Array(bytes);
            const name = filePath.split(/[\\/]/).pop() || "file";
            const file = new File([uint8], name, { type: "application/octet-stream" });
            const quickKey = `${name}-${file.size}-${Date.now()}`;
            pendingFilePathMappings.set(quickKey, filePath);
            files.push(file);
          } catch (err) {
            console.error("[FileOpenBridge] Failed to read file:", filePath, err);
          }
        }
        if (files.length > 0) {
          await addFiles(files);
        }
      }
    } catch (err) {
      console.error("[FileOpenBridge] Error processing opened files:", err);
    } finally {
      processingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isTauri()) return;

    processOpenedFiles();

    const unlistenPromise = listen("files-changed", () => {
      processOpenedFiles();
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);
}
