/**
 * 事件处理函数类型
 */
export type EventHandler<T = any> = (payload: T) => void;

/**
 * 事件处理函数映射表类型
 */
export type EventHandlerMap = Map<string, Set<EventHandler>>;

/**
 * 事件发射器类
 * 提供事件的注册、触发和移除等功能
 */
export class Emitter {
  private events: EventHandlerMap = new Map();
  private maxListeners: number = 10;
  private defaultErrorHandler: ((error: Error, event: string) => void) | null = null;

  /**
   * 设置最大监听器数量
   * @param n 最大监听器数量
   */
  setMaxListeners(n: number): void {
    this.maxListeners = n;
  }

  /**
   * 设置默认错误处理器
   * @param handler 错误处理函数
   */
  setDefaultErrorHandler(handler: (error: Error, event: string) => void): void {
    this.defaultErrorHandler = handler;
  }

  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消监听的函数
   */
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const handlers = this.events.get(event)!;

    // 检查监听器数量限制
    if (handlers.size >= this.maxListeners) {
      console.warn(`警告: 事件 "${event}" 的监听器数量已达到最大限制 ${this.maxListeners}`);
    }

    handlers.add(handler as EventHandler);

    return () => this.off(event, handler as EventHandler);
  }

  /**
   * 注册一次性事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消监听的函数
   */
  once<T = any>(event: string, handler: EventHandler<T>): () => void {
    const onceHandler: EventHandler<T> = (payload: T) => {
      handler(payload);
      this.off(event, onceHandler as EventHandler);
    };

    return this.on(event, onceHandler);
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数（可选）
   */
  off<T = any>(event: string, handler?: EventHandler<T>): void {
    if (!this.events.has(event)) {
      return;
    }

    const handlers = this.events.get(event)!;

    if (handler) {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    } else {
      this.events.delete(event);
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param payload 事件数据
   */
  emit<T = any>(event: string, payload: T): void {
    if (!this.events.has(event)) {
      return;
    }

    const handlers = this.events.get(event)!;

    handlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        if (this.defaultErrorHandler) {
          this.defaultErrorHandler(error as Error, event);
        } else {
          console.error(`事件处理器执行出错: ${event}`, error);
        }
      }
    });
  }

  /**
   * 移除所有事件监听器
   * @param event 事件名称（可选）
   */
  clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * 获取特定事件的监听器数量
   * @param event 事件名称
   * @returns 监听器数量
   */
  listenerCount(event: string): number {
    return this.events.has(event) ? this.events.get(event)!.size : 0;
  }

  /**
   * 获取所有已注册的事件名称
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * 获取特定事件的所有监听器
   * @param event 事件名称
   * @returns 监听器数组
   */
  listeners(event: string): EventHandler[] {
    return this.events.has(event) ? Array.from(this.events.get(event)!) : [];
  }

  /**
   * 检查是否有特定事件的监听器
   * @param event 事件名称
   * @returns 是否有监听器
   */
  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }
}

/**
 * 创建一个新的事件发射器实例
 * @returns 事件发射器实例
 */
export function createEmitter(): Emitter {
  return new Emitter();
}
