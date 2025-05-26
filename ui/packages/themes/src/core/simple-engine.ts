/**
 * 简化样式引擎
 * 基于 css-in-js/simple.ts 的轻量级样式引擎
 */

import { inject, provide } from "vue";
import {
  css as simpleCss,
  cx as simpleCx,
  mergeStyles as simpleMergeStyles,
  type SimpleStyleObject,
} from "../css-in-js/simple";

/**
 * 简化样式引擎类
 */
export class SimpleStyleEngine {
  private readonly prefix: string;

  constructor(prefix = "xh") {
    this.prefix = prefix;
  }

  /**
   * 创建样式
   */
  css(styles: SimpleStyleObject): string {
    return simpleCss(styles);
  }

  /**
   * 合并类名
   */
  cx(...classNames: Array<string | undefined | null | false>): string {
    return simpleCx(...classNames);
  }

  /**
   * 合并样式
   */
  merge(...styles: SimpleStyleObject[]): SimpleStyleObject {
    return simpleMergeStyles(...styles);
  }

  /**
   * 创建带前缀的类名
   */
  className(name: string): string {
    return `${this.prefix}-${name}`;
  }

  /**
   * 获取前缀
   */
  getPrefix(): string {
    return this.prefix;
  }
}

/**
 * 创建简化样式引擎实例
 */
export function createSimpleStyleEngine(prefix?: string): SimpleStyleEngine {
  return new SimpleStyleEngine(prefix);
}

/**
 * Vue 注入键
 */
export const SIMPLE_STYLE_ENGINE_KEY = Symbol("xihan-ui-simple-style-engine");

/**
 * 提供简化样式引擎
 */
export function provideSimpleStyleEngine(engine?: SimpleStyleEngine): SimpleStyleEngine {
  const styleEngine = engine ?? createSimpleStyleEngine();
  provide(SIMPLE_STYLE_ENGINE_KEY, styleEngine);
  return styleEngine;
}

/**
 * 使用简化样式引擎
 */
export function useSimpleStyleEngine(): SimpleStyleEngine {
  const engine = inject<SimpleStyleEngine>(SIMPLE_STYLE_ENGINE_KEY);
  if (!engine) {
    throw new Error("SimpleStyleEngine not provided. Please use provideSimpleStyleEngine() first.");
  }
  return engine;
}

/**
 * 全局简化样式引擎实例
 */
export const globalSimpleStyleEngine = createSimpleStyleEngine("xh");

// 重新导出类型
export type { SimpleStyleObject };
