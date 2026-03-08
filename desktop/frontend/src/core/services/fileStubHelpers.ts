import { GenTechFile, GenTechFileStub } from '@app/types/fileContext';
import { createChildStub, generateProcessedFileMetadata } from '@app/contexts/file/fileActions';
import { createGenTechFile } from '@app/types/fileContext';
import { ToolId } from '@app/types/toolId';

/**
 * Create GenTechFiles and GenTechFileStubs from exported files
 * Used when saving page editor changes to create version history
 */
export async function createGenTechFilesAndStubs(
  files: File[],
  parentStub: GenTechFileStub,
  toolId: ToolId
): Promise<{ adfFiles: GenTechFile[], stubs: GenTechFileStub[] }> {
  const adfFiles: GenTechFile[] = [];
  const stubs: GenTechFileStub[] = [];

  for (const file of files) {
    const processedFileMetadata = await generateProcessedFileMetadata(file);
    const childStub = createChildStub(
      parentStub,
      { toolId, timestamp: Date.now() },
      file,
      processedFileMetadata?.thumbnailUrl,
      processedFileMetadata
    );

    const adfFile = createGenTechFile(file, childStub.id);
    adfFiles.push(adfFile);
    stubs.push(childStub);
  }

  return { adfFiles, stubs };
}
