/**
 * Type safety declarations to prevent file.name/UUID confusion
 */

import { FileId, GenTechFile } from '@app/types/fileContext';

declare global {
  namespace FileIdSafety {
    // Mark functions that should never accept file.name as parameters
    type SafeFileIdFunction<T extends (...args: any[]) => any> = T extends (...args: infer P) => infer _R
      ? P extends readonly [string, ...any[]]
        ? never // Reject string parameters in first position for FileId functions
        : T
      : T;

    // Mark functions that should only accept GenTechFile, not regular File
    type GenTechFileOnlyFunction<T extends (...args: any[]) => any> = T extends (...args: infer P) => infer _R
      ? P extends readonly [File, ...any[]]
        ? never // Reject File parameters in first position for GenTechFile functions
        : T
      : T;

    // Utility type to enforce GenTechFile usage
    type RequireGenTechFile<T> = T extends File ? GenTechFile : T;
  }

  // Extend Window interface for debugging
  interface Window {
    __FILE_ID_DEBUG?: boolean;
  }
}

// Augment FileContext types to prevent bypassing GenTechFile
declare module '../contexts/FileContext' {
  export interface StrictFileContextActions {
    pinFile: (file: GenTechFile) => void; // Must be GenTechFile
    unpinFile: (file: GenTechFile) => void; // Must be GenTechFile
    addFiles: (files: File[], options?: { insertAfterPageId?: string }) => Promise<GenTechFile[]>; // Returns GenTechFile
    consumeFiles: (inputFileIds: FileId[], outputFiles: File[]) => Promise<GenTechFile[]>; // Returns GenTechFile
  }

  export interface StrictFileContextSelectors {
    getFile: (id: FileId) => GenTechFile | undefined; // Returns GenTechFile
    getFiles: (ids?: FileId[]) => GenTechFile[]; // Returns GenTechFile[]
    isFilePinned: (file: GenTechFile) => boolean; // Must be GenTechFile
  }
}

export {};
