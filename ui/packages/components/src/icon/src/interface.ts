import type { ExtractPropTypes, PropType, CSSProperties } from "vue";

/**
 * Icon 组件的尺寸类型
 */
export type IconSize = "tiny" | "small" | "medium" | "large" | "huge" | number | string;

/**
 * Icon 组件的主题类型
 */
export type IconType = "default" | "primary" | "success" | "warning" | "error" | "info";

/**
 * Icon 组件的动画类型
 */
export type IconAnimation =
  | "spin"
  | "spin-pulse"
  | "wrench"
  | "ring"
  | "pulse"
  | "flash"
  | "float"
  | "bounce"
  | "shake";

/**
 * Icon 组件的翻转类型
 */
export type IconFlip = "horizontal" | "vertical" | "both";

/**
 * Icon 组件的旋转角度
 */
export type IconRotate = 0 | 90 | 180 | 270 | number;

/**
 * Icon 组件的速度类型
 */
export type IconSpeed = "slow" | "normal" | "fast";

/**
 * Icon 组件的渲染模式
 */
export type IconRenderMode = "svg" | "img" | "font";

/**
 * Icon 组件的 Props 定义
 */
export const iconProps = {
  /**
   * 图标名称或图标数据
   */
  name: {
    type: String,
    default: "",
  },
  /**
   * 图标源（URL、base64等）
   */
  src: {
    type: String,
    default: "",
  },
  /**
   * SVG 原始内容
   */
  svg: {
    type: String,
    default: "",
  },
  /**
   * 组件尺寸
   */
  size: {
    type: [String, Number] as PropType<IconSize>,
    default: "medium",
  },
  /**
   * 图标颜色
   */
  color: {
    type: String,
    default: "",
  },
  /**
   * 组件类型/主题
   */
  type: {
    type: String as PropType<IconType>,
    default: "default",
  },
  /**
   * 图标缩放比例
   */
  scale: {
    type: [Number, String] as PropType<number | string>,
    default: 1,
  },
  /**
   * 图标动画
   */
  animation: {
    type: String as PropType<IconAnimation>,
    default: undefined,
  },
  /**
   * 动画速度
   */
  speed: {
    type: String as PropType<IconSpeed>,
    default: "normal",
  },
  /**
   * 图标翻转
   */
  flip: {
    type: String as PropType<IconFlip>,
    default: undefined,
  },
  /**
   * 图标旋转角度
   */
  rotate: {
    type: [Number, String] as PropType<IconRotate>,
    default: 0,
  },
  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否可点击
   */
  clickable: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否显示悬停效果
   */
  hover: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否反转颜色
   */
  inverse: {
    type: Boolean,
    default: false,
  },
  /**
   * 图标标题（用于无障碍访问）
   */
  title: {
    type: String,
    default: "",
  },
  /**
   * 图标描述（用于无障碍访问）
   */
  description: {
    type: String,
    default: "",
  },
  /**
   * 渲染模式
   */
  mode: {
    type: String as PropType<IconRenderMode>,
    default: "svg",
  },
  /**
   * 是否懒加载
   */
  lazy: {
    type: Boolean,
    default: false,
  },
  /**
   * 加载占位符
   */
  placeholder: {
    type: String,
    default: "",
  },
  /**
   * 错误时的回退图标
   */
  fallback: {
    type: String,
    default: "",
  },
  /**
   * 自定义类名
   */
  class: {
    type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    default: "",
  },
  /**
   * 自定义样式
   */
  style: {
    type: [String, Object] as PropType<string | CSSProperties>,
    default: "",
  },
  /**
   * 图标前缀
   */
  prefix: {
    type: String,
    default: "xh-icon",
  },
  /**
   * 是否保持宽高比
   */
  preserveAspectRatio: {
    type: String,
    default: "xMidYMid meet",
  },
  /**
   * SVG viewBox
   */
  viewBox: {
    type: String,
    default: "",
  },
  /**
   * 图标宽度
   */
  width: {
    type: [String, Number],
    default: undefined,
  },
  /**
   * 图标高度
   */
  height: {
    type: [String, Number],
    default: undefined,
  },
  /**
   * 是否显示加载状态
   */
  loading: {
    type: Boolean,
    default: false,
  },
  /**
   * 加载超时时间（毫秒）
   */
  timeout: {
    type: Number,
    default: 5000,
  },
  /**
   * 是否缓存图标
   */
  cache: {
    type: Boolean,
    default: true,
  },
  /**
   * 自定义属性
   */
  attrs: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
} as const;

/**
 * Icon 组件的 Props 类型
 */
export type IconProps = ExtractPropTypes<typeof iconProps>;

/**
 * Icon 组件的实例类型
 */
export interface IconInstance {
  /**
   * 组件的 DOM 元素
   */
  $el: HTMLElement | SVGElement;
  /**
   * 获取组件的当前状态
   */
  getState(): {
    loading: boolean;
    error: boolean;
    loaded: boolean;
    name: string;
    size: IconSize;
    color: string;
  };
  /**
   * 重置组件状态
   */
  reset(): void;
  /**
   * 重新加载图标
   */
  reload(): Promise<void>;
  /**
   * 获取图标数据
   */
  getIconData(): any;
  /**
   * 设置图标颜色
   */
  setColor(color: string): void;
  /**
   * 设置图标大小
   */
  setSize(size: IconSize): void;
  /**
   * 播放动画
   */
  playAnimation(animation: IconAnimation, duration?: number): void;
  /**
   * 停止动画
   */
  stopAnimation(): void;
}

/**
 * Icon 组件的事件类型
 */
export interface IconEvents {
  /**
   * 点击事件
   */
  click: (event: MouseEvent) => void;
  /**
   * 双击事件
   */
  dblclick: (event: MouseEvent) => void;
  /**
   * 鼠标进入事件
   */
  mouseenter: (event: MouseEvent) => void;
  /**
   * 鼠标离开事件
   */
  mouseleave: (event: MouseEvent) => void;
  /**
   * 焦点事件
   */
  focus: (event: FocusEvent) => void;
  /**
   * 失焦事件
   */
  blur: (event: FocusEvent) => void;
  /**
   * 加载开始事件
   */
  "load-start": () => void;
  /**
   * 加载成功事件
   */
  "load-success": (data: any) => void;
  /**
   * 加载失败事件
   */
  "load-error": (error: Error) => void;
  /**
   * 加载完成事件（无论成功失败）
   */
  "load-complete": () => void;
  /**
   * 动画开始事件
   */
  "animation-start": (animation: IconAnimation) => void;
  /**
   * 动画结束事件
   */
  "animation-end": (animation: IconAnimation) => void;
}

/**
 * Icon 组件的插槽类型
 */
export interface IconSlots {
  /**
   * 默认插槽（图标内容）
   */
  default?: () => any;
  /**
   * 加载中插槽
   */
  loading?: () => any;
  /**
   * 错误插槽
   */
  error?: () => any;
  /**
   * 占位符插槽
   */
  placeholder?: () => any;
}

/**
 * 图标缓存接口
 */
export interface IconCache {
  get(key: string): any;
  set(key: string, value: any): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
}

/**
 * 图标加载器接口
 */
export interface IconLoader {
  load(name: string, options?: any): Promise<any>;
  preload(names: string[]): Promise<void>;
  getIconData(name: string): any;
  isLoaded(name: string): boolean;
}

/**
 * 图标注册表接口
 */
export interface IconRegistry {
  register(name: string, data: any): void;
  unregister(name: string): void;
  get(name: string): any;
  has(name: string): boolean;
  list(): string[];
  clear(): void;
}
