export interface IconSource {
  downloadUrl: string;
  localName: string;
  subFolders: string;
}

export interface IconContents {
  subFolders: string;
  fileFilter: string;
  exportName: (name: string) => string;
  declareName: (name: string) => string;
  processWithSvgo?: boolean;
  multiColor?: boolean;
}

export interface IconPack {
  id: string;
  name: string;
  website: string;
  projectUrl: string;
  license: string;
  licenseUrl: string;
  source: IconSource;
  contents: IconContents[];
}
