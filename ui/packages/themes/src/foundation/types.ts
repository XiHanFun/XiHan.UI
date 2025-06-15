/**
 * 核心基础类型定义
 * 统一整个样式系统的基础类型
 */

// =============================================
// 基础样式类型
// =============================================

/**
 * CSS 属性值类型
 */
export type CSSValue = string | number;

/**
 * 样式对象接口
 * 支持嵌套选择器和伪类
 */
export interface StyleObject {
  [property: string]: CSSValue | StyleObject | undefined;
}

/**
 * 编译后的样式结果
 */
export interface CompiledStyle {
  /** 生成的唯一类名 */
  className: string;
  /** CSS 字符串 */
  css: string;
  /** 内容哈希值 */
  hash: string;
  /** 样式优先级 */
  priority: number;
}

// =============================================
// 主题系统类型
// =============================================

/**
 * 主题令牌接口
 */
export interface ThemeTokens {
  color: Record<string, string>;
  fontSize: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadow: Record<string, string>;
  zIndex: Record<string, number>;
  transition: Record<string, string>;
  breakpoint: Record<string, string>;
}

/**
 * 主题配置
 */
export interface ThemeConfig extends ThemeTokens {
  mode: "light" | "dark";
  prefix: string;
}

/**
 * 主题上下文
 */
export interface ThemeContext {
  config: ThemeConfig;
  cssVars: Record<string, string>;
  utils: ThemeUtils;
}

/**
 * 主题工具函数接口
 */
export interface ThemeUtils {
  getToken: (path: string) => string;
  setToken: (path: string, value: string) => void;
  generateCSSVars: () => Record<string, string>;
  switchMode: (mode: "light" | "dark") => void;
}

// =============================================
// 响应式系统类型
// =============================================

/**
 * 断点定义
 */
export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
}

/**
 * 响应式值类型
 */
export type ResponsiveValue<T> = T | Partial<Record<keyof Breakpoints, T>>;

/**
 * 媒体查询配置
 */
export interface MediaQueryConfig {
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  orientation?: "portrait" | "landscape";
  hover?: "none" | "hover";
  pointer?: "none" | "coarse" | "fine";
}

// =============================================
// 动画系统类型
// =============================================

/**
 * 缓动函数类型
 */
export type EasingFunction = (t: number) => number;

/**
 * 动画配置
 */
export interface AnimationConfig {
  duration: number;
  easing: EasingFunction;
  delay?: number;
  iterations?: number | "infinite";
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fillMode?: "none" | "forwards" | "backwards" | "both";
}

/**
 * 过渡配置
 */
export interface TransitionConfig {
  property: string;
  duration: number;
  easing: EasingFunction;
  delay: number;
}

/**
 * 动画控制器接口
 */
export interface AnimationController {
  play(): void;
  pause(): void;
  stop(): void;
  finish(): void;
  reverse(): void;
  readonly progress: number;
  readonly isRunning: boolean;
  readonly isCompleted: boolean;
  onComplete?: () => void;
}

// =============================================
// 样式引擎类型
// =============================================

/**
 * 样式引擎配置
 */
export interface StyleEngineConfig {
  prefix: string;
  hashLength: number;
  enableCache: boolean;
  enableMinification: boolean;
  enableSourceMap: boolean;
  insertionPoint?: HTMLElement;
}

/**
 * 样式引擎接口
 */
export interface StyleEngine {
  compile: (styles: StyleObject) => CompiledStyle;
  inject: (css: string, id?: string) => HTMLStyleElement;
  remove: (id: string) => boolean;
  clear: () => void;
  getConfig: () => StyleEngineConfig;
  compileAndInject: (styles: StyleObject, id?: string) => { className: ClassName; element: HTMLStyleElement };
}

/**
 * 样式缓存接口
 */
export interface StyleCache {
  get: (key: string) => CompiledStyle | undefined;
  set: (key: string, value: CompiledStyle) => void;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  clear: () => void;
  size: () => number;
}

// =============================================
// 调试系统类型
// =============================================

/**
 * 性能报告
 */
export interface PerformanceReport {
  totalStyles: number;
  compilationTime: number;
  injectionTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  recommendations: string[];
}

/**
 * 样式冲突报告
 */
export interface ConflictReport {
  property: string;
  conflicts: Array<{
    selector: string;
    value: string;
    specificity: number;
    source: string;
  }>;
  winner: {
    selector: string;
    value: string;
    reason: "specificity" | "importance" | "order";
  };
}

/**
 * 调试配置
 */
export interface DebugConfig {
  enabled: boolean;
  logLevel: "error" | "warn" | "info" | "debug";
  showPerformance: boolean;
  showConflicts: boolean;
  autoAnalyze: boolean;
}

// =============================================
// 工具类型
// =============================================

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 品牌类型 - 用于类型安全
 */
export type Brand<K, T> = K & { __brand: T };

/**
 * CSS 类名品牌类型
 */
export type ClassName = Brand<string, "className">;

/**
 * CSS 变量名品牌类型
 */
export type CSSVarName = Brand<string, "cssVar">;

// =============================================
// 事件系统类型
// =============================================

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (event: T) => void;

/**
 * 事件映射接口
 */
export interface EventMap {
  "cache-hit": { key: string; value: any };
  "cache-set": { key: string; value: any };
  "theme-changed": { theme: string; tokens: any; previousTheme: string };
  "theme-registered": { name: string; tokens: any };
  "style-injected": { id: string; css: string };
  "style-removed": { id: string };
  "breakpoint-changed": { current: string; previous: string; width: number; height: number };
  "animation-start": { id: string };
  "animation-end": { id: string };
  "performance-warning": PerformanceReport;
}

/**
 * 事件发射器接口
 */
export interface EventEmitter<T extends Record<string, any> = EventMap> {
  on: <K extends keyof T>(event: K, listener: EventListener<T[K]>) => () => void;
  off: <K extends keyof T>(event: K, listener: EventListener<T[K]>) => void;
  emit: <K extends keyof T>(event: K, data: T[K]) => void;
  once: <K extends keyof T>(event: K, listener: EventListener<T[K]>) => () => void;
}

// =============================================
// 性能监控类型
// =============================================

export interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  timestamp: number;
}

export interface DebugEvent {
  type: string;
  data?: any;
  timestamp: number;
}
