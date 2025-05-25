export interface IconSource {
  downloadUrl: string;
  localName: string;
  subFolders: string;
}

export interface IconContents {
  subFolders: string;
  fileFilter: string;
  formatter: (name: string) => string;
  exportName: (name: string) => string;
  declareName: (name: string) => string;
  scale?: number;
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
