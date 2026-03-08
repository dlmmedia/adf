import { GenTechFile, FileId, GenTechFileStub, createGenTechFile, ProcessedFileMetadata, createNewGenTechFileStub } from '@app/types/fileContext';

/**
 * Builds parallel inputFileIds and inputGenTechFileStubs arrays from the valid input files.
 * Falls back to a fresh stub when the file is not found in the current context state
 * (e.g. it was removed between operation start and this point).
 */
export function buildInputTracking(
  validFiles: GenTechFile[],
  selectors: { getGenTechFileStub: (id: FileId) => GenTechFileStub | undefined }
): { inputFileIds: FileId[]; inputGenTechFileStubs: GenTechFileStub[] } {
  const inputFileIds: FileId[] = [];
  const inputGenTechFileStubs: GenTechFileStub[] = [];
  for (const file of validFiles) {
    const fileId = file.fileId;
    const record = selectors.getGenTechFileStub(fileId);
    if (record) {
      inputFileIds.push(fileId);
      inputGenTechFileStubs.push(record);
    } else {
      console.warn(`No file stub found for file: ${file.name}`);
      inputFileIds.push(fileId);
      inputGenTechFileStubs.push(createNewGenTechFileStub(file, fileId));
    }
  }
  return { inputFileIds, inputGenTechFileStubs };
}

/**
 * Creates parallel outputGenTechFileStubs and outputGenTechFiles arrays from processed files.
 * The stubFactory determines how each stub is constructed (child version vs fresh root).
 */
export function buildOutputPairs(
  processedFiles: File[],
  thumbnails: string[],
  metadataArray: Array<ProcessedFileMetadata | undefined>,
  stubFactory: (file: File, thumbnail: string, metadata: ProcessedFileMetadata | undefined, index: number) => GenTechFileStub
): { outputGenTechFileStubs: GenTechFileStub[]; outputGenTechFiles: GenTechFile[] } {
  const outputGenTechFileStubs = processedFiles.map((file, index) =>
    stubFactory(file, thumbnails[index], metadataArray[index], index)
  );
  const outputGenTechFiles = processedFiles.map((file, index) =>
    createGenTechFile(file, outputGenTechFileStubs[index].id)
  );
  return { outputGenTechFileStubs, outputGenTechFiles };
}
