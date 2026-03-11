import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export interface FileWithPath {
  file: File;
  path: string;
  quickKey: string;
}

export interface FileDialogOptions {
  multiple?: boolean;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
}

const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/**
 * Open native file dialog and read selected files.
 * In Tauri builds, uses the native OS file picker.
 * In web builds, returns an empty array (caller should fall back to <input>).
 */
export async function openFileDialog(
  options?: FileDialogOptions
): Promise<FileWithPath[]> {
  if (!isTauri()) {
    return [];
  }

  const selected = await open({
    multiple: options?.multiple ?? true,
    filters: options?.filters?.map((f) => ({
      name: f.name,
      extensions: f.extensions,
    })),
  });

  if (!selected) return [];

  const paths = Array.isArray(selected) ? selected : [selected];
  const results: FileWithPath[] = [];

  for (const filePath of paths) {
    try {
      const bytes: number[] = await invoke("open_adf_file", { path: filePath });
      const uint8 = new Uint8Array(bytes);
      const name = filePath.split(/[\\/]/).pop() || "file";
      const ext = name.split(".").pop()?.toLowerCase() || "";
      const mimeMap: Record<string, string> = {
        pdf: "application/pdf",
        adf: "application/zip",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        tiff: "image/tiff",
        bmp: "image/bmp",
        html: "text/html",
        zip: "application/zip",
      };
      const mimeType = mimeMap[ext] || "application/octet-stream";
      const file = new File([uint8], name, { type: mimeType });
      const quickKey = `${name}-${file.size}-${Date.now()}`;
      results.push({ file, path: filePath, quickKey });
    } catch (err) {
      console.error("[fileDialogService] Failed to read file:", filePath, err);
    }
  }

  return results;
}
