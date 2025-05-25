/**
 * 对象类型
 */
export interface ObjType {
  [key: string]: string;
}

/**
 * 图标类型
 */
export interface IconType {
  name: string;
  minX: number;
  minY: number;
  width: number;
  height: number;
  raw: string;
  attr?: ObjType;
}

/**
 * 自定义图标类型
 */
export interface IconTypeCustomized extends IconType {
  points?: string;
  polygons?: ObjType[];
  d?: string;
  paths?: ObjType[];
}
