export interface ObjType {
  [key: string]: string;
}

export interface IconType {
  name: string;
  minX: number;
  minY: number;
  width: number;
  height: number;
  raw: string;
  attr?: ObjType;
}

export interface IconTypeCustomized extends IconType {
  points?: string;
  polygons?: ObjType[];
  d?: string;
  paths?: ObjType[];
}
