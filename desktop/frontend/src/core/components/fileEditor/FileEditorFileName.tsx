import React from 'react';
import { GenTechFileStub } from '@app/types/fileContext';
import { PrivateContent } from '@app/components/shared/PrivateContent';

interface FileEditorFileNameProps {
  file: GenTechFileStub;
}

const FileEditorFileName = ({ file }: FileEditorFileNameProps) => (
  <PrivateContent>{file.name}</PrivateContent>
);

export default FileEditorFileName;
