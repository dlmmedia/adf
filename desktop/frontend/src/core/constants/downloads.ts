const GITHUB_REPO = 'dlmmedia/adf';
const GITHUB_RELEASES = `https://github.com/${GITHUB_REPO}/releases`;

export const DOWNLOAD_URLS = {
  WINDOWS: `${GITHUB_RELEASES}/latest/download/DLM.ADF_x64-setup.exe`,
  WINDOWS_MSI: `${GITHUB_RELEASES}/latest/download/DLM.ADF_x64_en-US.msi`,
  MAC_APPLE_SILICON: `${GITHUB_RELEASES}/latest/download/DLM.ADF_aarch64.dmg`,
  MAC_INTEL: `${GITHUB_RELEASES}/latest/download/DLM.ADF_x64.dmg`,
  LINUX_DEB: `${GITHUB_RELEASES}/latest/download/dlm-adf_amd64.deb`,
  LINUX_RPM: `${GITHUB_RELEASES}/latest/download/dlm-adf.x86_64.rpm`,
  LINUX_DOCS: 'https://dlmworld.com/docs/installation/linux/',
  ALL_RELEASES: GITHUB_RELEASES,
  LATEST_RELEASE: `${GITHUB_RELEASES}/latest`,
} as const;

export const DOWNLOAD_BASE_URL = `${GITHUB_RELEASES}/latest/download/`;
