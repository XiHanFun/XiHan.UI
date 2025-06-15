import { Emitter, createEmitter, type EventHandler } from "./emitter";

/**
 * 全局事件总线实例
 */
const eventBus = createEmitter();

/**
 * 通用事件总线类型
 */
export type EventBus = {
  /**
   * 设置最大监听器数量
   * @param n 最大监听器数量
   */
  setMaxListeners: (n: number) => void;

  /**
   * 设置默认错误处理器
   * @param handler 错误处理函数
   */
  setDefaultErrorHandler: (handler: (error: Error, event: string) => void) => void;

  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消监听的函数
   */
  on: <T = any>(event: string, handler: EventHandler<T>) => () => void;

  /**
   * 注册一次性事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消监听的函数
   */
  once: <T = any>(event: string, handler: EventHandler<T>) => () => void;

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数（可选）
   */
  off: <T = any>(event: string, handler?: EventHandler<T>) => void;

  /**
   * 触发事件
   * @param event 事件名称
   * @param payload 事件数据
   */
  emit: <T = any>(event: string, payload: T) => void;

  /**
   * 移除所有事件监听器
   * @param event 事件名称（可选）
   */
  clear: (event?: string) => void;

  /**
   * 获取特定事件的监听器数量
   * @param event 事件名称
   * @returns 监听器数量
   */
  listenerCount: (event: string) => number;

  /**
   * 获取所有已注册的事件名称
   * @returns 事件名称数组
   */
  eventNames: () => string[];

  /**
   * 获取特定事件的所有监听器
   * @param event 事件名称
   * @returns 监听器数组
   */
  listeners: (event: string) => EventHandler[];

  /**
   * 检查是否有特定事件的监听器
   * @param event 事件名称
   * @returns 是否有监听器
   */
  hasListeners: (event: string) => boolean;
};

/**
 * Vue插件选项
 */
export interface EventBusPluginOptions {
  /**
   * 全局属性名称，默认为 '$eventBus'
   */
  propertyName?: string;
  /**
   * 最大监听器数量
   */
  maxListeners?: number;
  /**
   * 默认错误处理器
   */
  defaultErrorHandler?: (error: Error, event: string) => void;
}

// 插件安装函数类型
type PluginInstallFunction = (app: any, options?: EventBusPluginOptions) => void;

/**
 * Vue事件总线插件
 */
const eventBusPlugin = {
  install: ((app, options = {}) => {
    const { propertyName = "$eventBus", maxListeners, defaultErrorHandler } = options;

    // 配置事件总线
    if (maxListeners) {
      eventBus.setMaxListeners(maxListeners);
    }
    if (defaultErrorHandler) {
      eventBus.setDefaultErrorHandler(defaultErrorHandler);
    }

    // 将事件总线注册为全局属性
    app.config.globalProperties[propertyName] = eventBus;

    // 提供事件总线作为全局依赖注入
    app.provide("eventBus", eventBus);
  }) as PluginInstallFunction,
};

/**
 * 使用组合式API的事件总线钩子
 * @returns 事件总线实例
 */
export function useEventBus(): EventBus {
  return eventBus;
}

export { eventBusPlugin as default };
