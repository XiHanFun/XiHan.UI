/**
 * 事件处理函数类型
 */
export type EventHandler = (...args: any[]) => void;

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

  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消监听的函数
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(handler);
    
    // 返回取消监听的函数
    return () => this.off(event, handler);
  }

  /**
   * 注册一次性事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消监听的函数
   */
  once(event: string, handler: EventHandler): () => void {
    const onceHandler: EventHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    
    return this.on(event, onceHandler);
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数（可选，如果不提供则移除该事件的所有监听器）
   */
  off(event: string, handler?: EventHandler): void {
    if (!this.events.has(event)) {
      return;
    }
    
    const handlers = this.events.get(event)!;
    
    if (handler) {
      handlers.delete(handler);
      // 如果该事件没有监听器了，则删除该事件
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    } else {
      // 如果不提供handler，则移除该事件的所有监听器
      this.events.delete(event);
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 传递给事件处理函数的参数
   */
  emit(event: string, ...args: any[]): void {
    if (!this.events.has(event)) {
      return;
    }
    
    const handlers = this.events.get(event)!;
    
    handlers.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`事件处理器执行出错: ${event}`, error);
      }
    });
  }

  /**
   * 移除所有事件监听器
   * @param event 事件名称（可选，如果不提供则移除所有事件的监听器）
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
}

/**
 * 创建一个新的事件发射器实例
 * @returns 事件发射器实例
 */
export function createEmitter(): Emitter {
  return new Emitter();
}
