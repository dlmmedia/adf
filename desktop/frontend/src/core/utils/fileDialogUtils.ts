export function getDocumentFileDialogFilter() {
  return [
    {
      name: 'ADF & PDF Documents',
      extensions: ['adf', 'pdf']
    },
    {
      name: 'All Supported Files',
      extensions: ['adf', 'pdf', 'jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'html', 'zip']
    }
  ];
}
