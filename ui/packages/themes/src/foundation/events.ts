/**
 * 事件系统
 * 统一的事件发射器和监听器实现
 */

import type { EventListener, EventEmitter, EventMap } from "./types";

/**
 * 基础事件发射器实现
 */
export class BaseEventEmitter<T extends Record<string, any> = EventMap> implements EventEmitter<T> {
  private listeners = new Map<keyof T, Set<EventListener<any>>>();

  /**
   * 添加事件监听器
   */
  on<K extends keyof T>(event: K, listener: EventListener<T[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.add(listener);

    // 返回取消监听的函数
    return () => {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof T>(event: K, listener: EventListener<T[K]>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 发射事件
   */
  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // 复制监听器列表，避免在触发过程中被修改
      const listenersArray = Array.from(eventListeners);
      for (const listener of listenersArray) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for "${String(event)}":`, error);
        }
      }
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once<K extends keyof T>(event: K, listener: EventListener<T[K]>): () => void {
    const onceListener = (data: T[K]) => {
      this.off(event, onceListener);
      listener(data);
    };

    return this.on(event, onceListener);
  }

  /**
   * 移除指定事件的所有监听器
   */
  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 获取指定事件的监听器数量
   */
  listenerCount<K extends keyof T>(event: K): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): (keyof T)[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 检查是否有监听器
   */
  hasListeners<K extends keyof T>(event?: K): boolean {
    if (event) {
      return this.listenerCount(event) > 0;
    }
    return this.listeners.size > 0;
  }
}

/**
 * 全局事件发射器实例
 */
export const globalEvents = new BaseEventEmitter<EventMap>();

/**
 * 创建新的事件发射器
 */
export function createEventEmitter<T extends Record<string, any> = EventMap>(): EventEmitter<T> {
  return new BaseEventEmitter<T>();
}

/**
 * 事件工具函数
 */
export const eventUtils = {
  /**
   * 等待事件发生
   */
  waitForEvent<K extends keyof EventMap>(
    emitter: EventEmitter<EventMap>,
    event: K,
    timeout?: number,
  ): Promise<EventMap[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: number | undefined;

      const cleanup = emitter.once(event, data => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(data);
      });

      if (timeout) {
        timeoutId = window.setTimeout(() => {
          cleanup();
          reject(new Error(`Event "${String(event)}" timeout after ${timeout}ms`));
        }, timeout);
      }
    });
  },

  /**
   * 创建事件代理
   */
  createEventProxy<T extends Record<string, any>>(
    source: EventEmitter<T>,
    target: EventEmitter<T>,
    events: (keyof T)[],
  ): () => void {
    const cleanupFunctions: (() => void)[] = [];

    for (const event of events) {
      const cleanup = source.on(event, data => {
        target.emit(event, data);
      });
      cleanupFunctions.push(cleanup);
    }

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  },

  /**
   * 事件过滤器
   */
  createEventFilter<T extends Record<string, any>, K extends keyof T>(
    emitter: EventEmitter<T>,
    event: K,
    filter: (data: T[K]) => boolean,
  ): EventEmitter<Pick<T, K>> {
    const filteredEmitter = createEventEmitter<Pick<T, K>>();

    emitter.on(event, data => {
      if (filter(data)) {
        filteredEmitter.emit(event, data);
      }
    });

    return filteredEmitter;
  },

  /**
   * 事件转换器
   */
  createEventTransformer<T extends Record<string, any>, U extends Record<string, any>>(
    emitter: EventEmitter<T>,
    transformer: (event: keyof T, data: T[keyof T]) => { event: keyof U; data: U[keyof U] } | null,
  ): EventEmitter<U> {
    const transformedEmitter = createEventEmitter<U>();

    (emitter as BaseEventEmitter<T>).eventNames().forEach(event => {
      emitter.on(event, data => {
        const result = transformer(event, data);
        if (result) {
          transformedEmitter.emit(result.event, result.data);
        }
      });
    });

    return transformedEmitter;
  },

  /**
   * 防抖事件
   */
  debounceEvent<T extends Record<string, any>, K extends keyof T>(
    emitter: EventEmitter<T>,
    event: K,
    delay: number,
  ): EventEmitter<Pick<T, K>> {
    const debouncedEmitter = createEventEmitter<Pick<T, K>>();
    let timeoutId: number | undefined;

    emitter.on(event, data => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        debouncedEmitter.emit(event, data);
      }, delay);
    });

    return debouncedEmitter;
  },

  /**
   * 节流事件
   */
  throttleEvent<T extends Record<string, any>, K extends keyof T>(
    emitter: EventEmitter<T>,
    event: K,
    interval: number,
  ): EventEmitter<Pick<T, K>> {
    const throttledEmitter = createEventEmitter<Pick<T, K>>();
    let lastEmitTime = 0;

    emitter.on(event, data => {
      const now = Date.now();
      if (now - lastEmitTime >= interval) {
        lastEmitTime = now;
        throttledEmitter.emit(event, data);
      }
    });

    return throttledEmitter;
  },

  /**
   * 事件批处理
   */
  batchEvents<T extends Record<string, any>, K extends keyof T>(
    emitter: EventEmitter<T>,
    event: K,
    batchSize: number,
    timeout?: number,
  ): EventEmitter<{ [P in K]: T[K][] }> {
    const batchedEmitter = createEventEmitter<{ [P in K]: T[K][] }>();
    const batch: T[K][] = [];
    let timeoutId: number | undefined;

    const flushBatch = () => {
      if (batch.length > 0) {
        const batchData = [...batch];
        batch.length = 0;
        batchedEmitter.emit(event, batchData as any);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    emitter.on(event, data => {
      batch.push(data);

      if (batch.length >= batchSize) {
        flushBatch();
      } else if (timeout && !timeoutId) {
        timeoutId = window.setTimeout(flushBatch, timeout);
      }
    });

    return batchedEmitter;
  },
};

/**
 * DOM 事件代理工具
 */
export const domEventUtils = {
  /**
   * 添加 DOM 事件监听器
   */
  on<K extends keyof HTMLElementEventMap>(
    element: HTMLElement | Window | Document,
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): () => void {
    element.addEventListener(event, listener as any, options);

    return () => {
      element.removeEventListener(event, listener as any, options);
    };
  },

  /**
   * 添加一次性 DOM 事件监听器
   */
  once<K extends keyof HTMLElementEventMap>(
    element: HTMLElement | Window | Document,
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): () => void {
    const onceListener = (e: HTMLElementEventMap[K]) => {
      listener(e);
      cleanup();
    };

    const cleanup = this.on(element, event, onceListener, options);
    return cleanup;
  },

  /**
   * 事件委托
   */
  delegate<K extends keyof HTMLElementEventMap>(
    container: HTMLElement,
    selector: string,
    event: K,
    listener: (event: HTMLElementEventMap[K], target: HTMLElement) => void,
    options?: boolean | AddEventListenerOptions,
  ): () => void {
    const delegateListener = (e: HTMLElementEventMap[K]) => {
      const target = (e.target as HTMLElement).closest(selector);
      if (target && container.contains(target)) {
        listener(e, target as HTMLElement);
      }
    };

    return this.on(container, event, delegateListener, options);
  },

  /**
   * 等待 DOM 事件
   */
  waitForEvent<K extends keyof HTMLElementEventMap>(
    element: HTMLElement | Window | Document,
    event: K,
    timeout?: number,
  ): Promise<HTMLElementEventMap[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: number | undefined;

      const cleanup = this.once(element, event, e => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(e);
      });

      if (timeout) {
        timeoutId = window.setTimeout(() => {
          cleanup();
          reject(new Error(`DOM event "${event}" timeout after ${timeout}ms`));
        }, timeout);
      }
    });
  },
};
