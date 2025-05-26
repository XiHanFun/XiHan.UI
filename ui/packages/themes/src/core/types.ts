/**
 * 核心引擎类型定义
 * 基于 @utils 功能构建的样式引擎类型系统
 */

import type { StyleObject } from "../css-in-js/types";

/**
 * 样式引擎配置
 */
export interface StyleEngineConfig {
  /** CSS 类名前缀 */
  prefix?: string;
  /** Hash 长度 */
  hashLength?: number;
  /** 样式插入点 */
  insertionPoint?: HTMLElement;
  /** 是否启用开发模式 */
  dev?: boolean;
  /** 是否启用缓存 */
  cache?: boolean;
}

/**
 * 样式注入器配置
 */
export interface StyleInjectorConfig {
  /** 插入点元素 */
  target?: HTMLElement;
  /** 是否插入到头部 */
  insertToHead?: boolean;
  /** 样式标签属性 */
  attributes?: Record<string, string>;
}

/**
 * 样式缓存配置
 */
export interface StyleCacheConfig {
  /** 最大缓存数量 */
  maxSize?: number;
  /** 缓存过期时间（毫秒） */
  ttl?: number;
  /** 是否启用 LRU 策略 */
  lru?: boolean;
}

/**
 * 样式规则
 */
export interface StyleRule {
  /** 选择器 */
  selector: string;
  /** 样式对象 */
  styles: StyleObject;
  /** 规则优先级 */
  priority?: number;
}

/**
 * 编译后的样式
 */
export interface CompiledStyle {
  /** 生成的类名 */
  className: string;
  /** CSS 字符串 */
  css: string;
  /** 样式 Hash */
  hash: string;
}

/**
 * 样式引擎接口
 */
export interface IStyleEngine {
  /** 编译样式 */
  compile(styles: StyleObject): CompiledStyle;
  /** 注入样式 */
  inject(css: string, id?: string): void;
  /** 移除样式 */
  remove(id: string): void;
  /** 清空所有样式 */
  clear(): void;
  /** 获取配置 */
  getConfig(): StyleEngineConfig;
}

/**
 * 样式缓存接口
 */
export interface IStyleCache {
  /** 获取缓存 */
  get(key: string): CompiledStyle | undefined;
  /** 设置缓存 */
  set(key: string, value: CompiledStyle): void;
  /** 检查是否存在 */
  has(key: string): boolean;
  /** 删除缓存 */
  delete(key: string): boolean;
  /** 清空缓存 */
  clear(): void;
  /** 获取缓存大小 */
  size(): number;
}

/**
 * 样式注入器接口
 */
export interface IStyleInjector {
  /** 注入样式 */
  inject(css: string, id?: string): HTMLStyleElement;
  /** 移除样式 */
  remove(id: string): boolean;
  /** 清空所有样式 */
  clear(): void;
  /** 获取所有样式元素 */
  getElements(): HTMLStyleElement[];
}
