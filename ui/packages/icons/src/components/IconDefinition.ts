/**
 * 图标定义
 */
export interface IconDefinition {
  /** 图标名称 */
  name: string;
  /** 原始 SVG 内容 */
  raw: string;
  /** 最小 X 坐标 */
  minX?: number;
  /** 最小 Y 坐标 */
  minY?: number;
  /** 图标宽度 */
  width?: number;
  /** 图标高度 */
  height?: number;
  /** SVG 属性 */
  attr?: Record<string, any>;
  /** 路径数据（可选） */
  paths?: Array<{ d: string }>;
  /** 多边形数据（可选） */
  polygons?: Array<{ points: string }>;
}

/**
 * 图标集元信息
 */
export interface IconSetInfo {
  /** 图标集 ID */
  id: string;
  /** 图标集名称 */
  name: string;
  /** 官方网站 */
  website: string;
  /** 项目地址 */
  projectUrl: string;
  /** 许可证 */
  license: string;
  /** 许可证地址 */
  licenseUrl: string;
  /** 总图标数量 */
  total: number;
  /** 是否包含彩色图标 */
  hasMultiColor: boolean;
  /** 图标变体数量 */
  variants: number;
}

/**
 * 图标属性
 */
export interface IconProps {
  /** 图标名称 */
  name?: string;
  /** 图标定义（直接传入图标数据） */
  icon?: IconDefinition;
  /** 图标标题 */
  title?: string;
  /** 填充颜色 */
  fill?: string;
  /** 缩放比例 */
  scale?: number | string;
  /** 动画效果 */
  animation?: "spin" | "spin-pulse" | "wrench" | "ring" | "pulse" | "flash" | "float";
  /** 悬停效果 */
  hover?: boolean;
  /** 翻转方向 */
  flip?: "horizontal" | "vertical" | "both";
  /** 动画速度 */
  speed?: "fast" | "slow";
  /** 标签 */
  label?: string;
  /** 反色 */
  inverse?: boolean;
}
