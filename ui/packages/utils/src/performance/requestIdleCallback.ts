/**
 * requestIdleCallback 工具
 * 提供利用浏览器空闲时间处理任务的封装
 */

/**
 * requestIdleCallback 选项
 */
export interface IdleCallbackOptions {
  /**
   * 超时时间（毫秒）
   */
  timeout?: number;
}

/**
 * requestIdleCallback 结果
 */
export interface IdleCallbackResult {
  /**
   * 是否已经执行
   */
  executed: boolean;

  /**
   * 取消任务
   */
  cancel: () => void;
}

/**
 * IdleDeadline 接口
 */
export interface IdleDeadline {
  /**
   * 判断当前空闲时间是否已用尽
   */
  didTimeout: boolean;

  /**
   * 获取当前可用的剩余时间（毫秒）
   */
  timeRemaining: () => number;
}

/**
 * 判断当前环境是否支持 requestIdleCallback
 */
export const hasIdleCallback = typeof window !== "undefined" && "requestIdleCallback" in window;

/**
 * requestIdleCallback 的 polyfill
 * @param callback 回调函数
 * @param options 选项
 * @returns 任务 ID
 */
function requestIdleCallbackPolyfill(
  callback: (deadline: IdleDeadline) => void,
  options?: IdleCallbackOptions,
): number {
  const start = Date.now();
  const timeout = options?.timeout || 50; // 默认超时 50ms

  return window.setTimeout(() => {
    callback({
      didTimeout: true,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, timeout);
}

/**
 * cancelIdleCallback 的 polyfill
 * @param id 任务 ID
 */
function cancelIdleCallbackPolyfill(id: number): void {
  window.clearTimeout(id);
}

/**
 * 安全的 requestIdleCallback
 * @param callback 回调函数
 * @param options 选项
 * @returns 任务 ID
 */
export function safeRequestIdleCallback(
  callback: (deadline: IdleDeadline) => void,
  options?: IdleCallbackOptions,
): number {
  if (hasIdleCallback) {
    return window.requestIdleCallback(callback, options);
  } else {
    return requestIdleCallbackPolyfill(callback, options);
  }
}

/**
 * 安全的 cancelIdleCallback
 * @param id 任务 ID
 */
export function safeCancelIdleCallback(id: number): void {
  if (hasIdleCallback) {
    window.cancelIdleCallback(id);
  } else {
    cancelIdleCallbackPolyfill(id);
  }
}

/**
 * 创建 IdleTask 类型
 */
type IdleTask<T = void> = () => T | Promise<T>;

/**
 * 任务队列管理器
 */
export class IdleTaskQueue {
  private tasks: Array<{
    task: IdleTask<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];
  private isProcessing = false;
  private options: IdleCallbackOptions;

  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options: IdleCallbackOptions = {}) {
    this.options = options;
  }

  /**
   * 添加任务到队列
   * @param task 任务函数
   * @returns 返回一个 Promise，任务完成时解析
   */
  public add<T>(task: IdleTask<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.tasks.push({ task, resolve, reject });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * 处理任务队列
   */
  private processQueue(): void {
    if (this.tasks.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    safeRequestIdleCallback(async deadline => {
      // 继续处理任务直到空闲时间用尽或队列为空
      while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && this.tasks.length > 0) {
        const { task, resolve, reject } = this.tasks.shift()!;

        try {
          const result = task();

          if (result instanceof Promise) {
            // 如果任务返回 Promise，等待其完成
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }

        // 如果空闲时间用尽且队列中仍有任务，先暂停处理
        if (deadline.timeRemaining() <= 0 && !deadline.didTimeout && this.tasks.length > 0) {
          break;
        }
      }

      // 如果队列中还有任务，安排下一次处理
      if (this.tasks.length > 0) {
        this.processQueue();
      } else {
        this.isProcessing = false;
      }
    }, this.options);
  }

  /**
   * 清空任务队列
   */
  public clear(): void {
    const error = new Error("Task queue cleared");

    for (const { reject } of this.tasks) {
      reject(error);
    }

    this.tasks = [];
  }

  /**
   * 获取队列中未完成的任务数量
   */
  public get size(): number {
    return this.tasks.length;
  }

  /**
   * 是否正在处理任务
   */
  public get busy(): boolean {
    return this.isProcessing;
  }
}

/**
 * 创建一个在空闲时执行的任务
 * @param callback 回调函数
 * @param options 选项
 * @returns 任务控制对象
 */
export function idle<T>(
  callback: () => T | Promise<T>,
  options?: IdleCallbackOptions,
): { promise: Promise<T>; cancel: () => void } {
  let id: number | null = null;
  let completed = false;

  const promise = new Promise<T>((resolve, reject) => {
    id = safeRequestIdleCallback(deadline => {
      try {
        const result = callback();

        if (result instanceof Promise) {
          result.then(resolve).catch(reject);
        } else {
          resolve(result);
        }

        completed = true;
      } catch (error) {
        reject(error);
      }
    }, options);
  });

  return {
    promise,
    cancel: () => {
      if (id !== null && !completed) {
        safeCancelIdleCallback(id);
        id = null;
      }
    },
  };
}

/**
 * 创建一个使用 requestIdleCallback 的防抖函数
 * @param fn 要执行的函数
 * @param options 选项
 * @returns 防抖函数
 */
export function idleDebounce<T extends (...args: any[]) => any>(
  fn: T,
  options?: IdleCallbackOptions & { maxWait?: number },
): (...args: Parameters<T>) => { cancel: () => void } {
  let id: number | null = null;
  let maxTimeoutId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const maxWait = options?.maxWait;

  const executeTask = () => {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
    }

    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }
  };

  const result = (...args: Parameters<T>) => {
    // 保存最后的参数
    lastArgs = args;

    // 如果已有待处理的任务，取消它
    if (id !== null) {
      safeCancelIdleCallback(id);
    }

    // 设置强制执行的最大等待时间
    if (maxWait && !maxTimeoutId) {
      maxTimeoutId = window.setTimeout(executeTask, maxWait);
    }

    // 创建新的空闲任务
    id = safeRequestIdleCallback(executeTask, options);

    return {
      cancel: () => {
        if (id !== null) {
          safeCancelIdleCallback(id);
          id = null;
        }

        if (maxTimeoutId) {
          clearTimeout(maxTimeoutId);
          maxTimeoutId = null;
        }

        lastArgs = null;
      },
    };
  };

  return result;
}

/**
 * 将工作分块处理，避免长时间占用主线程
 * @param items 要处理的数据项
 * @param processFn 处理每一项的函数
 * @param options 选项
 * @returns Promise，完成所有处理后解析
 */
export function idleChunk<T, R>(
  items: T[],
  processFn: (item: T, index: number) => R | Promise<R>,
  options?: IdleCallbackOptions & {
    chunkSize?: number; // 每个空闲周期处理的最大数据量
    onProgress?: (processed: number, total: number) => void; // 进度回调
  },
): Promise<R[]> {
  const { chunkSize = 5, onProgress, ...idleOptions } = options || {};

  return new Promise<R[]>((resolve, reject) => {
    const results: R[] = [];
    let index = 0;
    const total = items.length;

    // 如果没有项目要处理，则立即返回空数组
    if (total === 0) {
      resolve(results);
      return;
    }

    const processChunk = async (deadline: IdleDeadline) => {
      // 在空闲时间内尽可能多地处理数据项
      const shouldContinue = () => (deadline.timeRemaining() > 0 || deadline.didTimeout) && index < total;

      let processed = 0;

      while (shouldContinue() && processed < chunkSize) {
        try {
          const result = processFn(items[index], index);

          if (result instanceof Promise) {
            results[index] = await result;
          } else {
            results[index] = result;
          }

          index++;
          processed++;

          // 调用进度回调
          onProgress?.(index, total);
        } catch (error) {
          reject(error);
          return;
        }
      }

      // 如果还有更多项目需要处理，安排下一个块
      if (index < total) {
        safeRequestIdleCallback(processChunk, idleOptions);
      } else {
        // 所有项目处理完成
        resolve(results);
      }
    };

    // 开始处理第一个块
    safeRequestIdleCallback(processChunk, idleOptions);
  });
}

/**
 * 默认的空闲任务队列实例
 */
export const defaultIdleQueue = new IdleTaskQueue();
