import { Emitter, createEmitter, type EventHandler } from './emitter';

/**
 * 全局事件总线实例
 */
const eventBus = createEmitter();

/**
 * 通用事件总线类型
 */
export type EventBus = {
  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消监听的函数
   */
  on: (event: string, handler: EventHandler) => () => void;
  
  /**
   * 注册一次性事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消监听的函数
   */
  once: (event: string, handler: EventHandler) => () => void;
  
  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数（可选）
   */
  off: (event: string, handler?: EventHandler) => void;
  
  /**
   * 触发事件
   * @param event 事件名称
   * @param args 传递给事件处理函数的参数
   */
  emit: (event: string, ...args: any[]) => void;
  
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
};

/**
 * Vue插件选项
 */
export interface EventBusPluginOptions {
  /**
   * 全局属性名称，默认为 '$eventBus'
   */
  propertyName?: string;
}

// 插件安装函数类型
type PluginInstallFunction = (app: any, options?: EventBusPluginOptions) => void;

/**
 * Vue事件总线插件
 */
const eventBusPlugin = {
  install: ((app, options = {}) => {
    const propertyName = options.propertyName || '$eventBus';
    
    // 将事件总线注册为全局属性
    app.config.globalProperties[propertyName] = eventBus;
    
    // 提供事件总线作为全局依赖注入
    app.provide('eventBus', eventBus);
  }) as PluginInstallFunction
};

/**
 * 使用组合式API的事件总线钩子
 * @returns 事件总线实例
 */
export function useEventBus(): EventBus {
  return eventBus;
}

// 导出事件总线相关内容
export { 
  Emitter,
  createEmitter,
  eventBus,
  eventBusPlugin
};

// 默认导出插件
export default eventBusPlugin;
