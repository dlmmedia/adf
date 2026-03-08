/**
 * Test utilities for creating GenTechFile objects in tests
 */

import { GenTechFile, createGenTechFile } from '@app/types/fileContext';

/**
 * Create a GenTechFile object for testing purposes
 */
export function createTestGenTechFile(
  name: string,
  content: string = 'test content',
  type: string = 'application/pdf'
): GenTechFile {
  const file = new File([content], name, { type });
  return createGenTechFile(file);
}

/**
 * Create multiple GenTechFile objects for testing
 */
export function createTestFilesWithId(
  files: Array<{ name: string; content?: string; type?: string }>
): GenTechFile[] {
  return files.map(({ name, content = 'test content', type = 'application/pdf' }) =>
    createTestGenTechFile(name, content, type)
  );
}