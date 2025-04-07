/**
 * WebWorker 工具集
 * 提供简化的 Worker 创建和通信方案
 */
import { isWebWorkerSupported, isSharedWorkerSupported, getHardwareConcurrency } from "./navigator";

/**
 * Worker 配置选项
 */
export interface WorkerOptions {
  /** 是否使用共享 Worker */
  shared?: boolean;
  /** Worker 名称 */
  name?: string;
  /** Worker 类型 */
  type?: WorkerType;
  /** Worker 凭证模式 */
  credentials?: RequestCredentials;
}

/**
 * Worker 消息处理器接口
 */
export interface WorkerMessageHandler<T = any, R = any> {
  (data: T): R | Promise<R> | void;
}

/**
 * Worker 错误处理器接口
 */
export interface WorkerErrorHandler {
  (error: ErrorEvent): void;
}

/**
 * 任务执行器接口
 */
export interface TaskExecutor<T = any, R = any> {
  /**
   * 执行任务
   * @param data 任务数据
   * @returns Promise 任务执行结果
   */
  execute(data: T): Promise<R>;

  /**
   * 终止执行
   */
  terminate(): void;
}

/**
 * Worker 任务对象接口
 */
interface WorkerTask<T, R> {
  data: T;
  resolve: (value: R | PromiseLike<R>) => void;
  reject: (reason?: any) => void;
  timeoutId?: number;
}

/**
 * 基于消息通信的 Worker 封装类
 */
class WorkerWrapper<T = any, R = any> implements TaskExecutor<T, R> {
  private worker!: Worker | SharedWorker;
  private isShared: boolean;
  private messageHandlers: Map<string, WorkerMessageHandler> = new Map();
  private pendingTasks: Map<string, { resolve: (value: any) => void; reject: (reason: any) => void }> = new Map();
  private errorHandler?: WorkerErrorHandler;
  private messageCount: number = 0;

  /**
   * 创建 Worker 包装器实例
   * @param scriptUrl Worker 脚本 URL
   * @param options Worker 配置选项
   */
  constructor(
    private readonly scriptUrl: string | URL,
    private options: WorkerOptions = {},
  ) {
    this.isShared = options.shared || false;
    this.initWorker();
  }

  /**
   * 初始化 Worker 实例
   */
  private initWorker(): void {
    if (this.isShared) {
      if (!isSharedWorkerSupported()) {
        throw new Error("当前环境不支持 SharedWorker");
      }
      this.worker = new SharedWorker(this.scriptUrl, {
        name: this.options.name,
        type: this.options.type,
        credentials: this.options.credentials,
      });
      this.setupSharedWorkerMessageHandlers();
    } else {
      this.worker = new Worker(this.scriptUrl, {
        name: this.options.name,
        type: this.options.type,
        credentials: this.options.credentials,
      });
      this.setupDedicatedWorkerMessageHandlers();
    }
  }

  /**
   * 设置普通 Worker 的消息处理
   */
  private setupDedicatedWorkerMessageHandlers(): void {
    const dedicatedWorker = this.worker as Worker;

    dedicatedWorker.onmessage = event => this.handleMessage(event.data);

    dedicatedWorker.onerror = event => {
      if (this.errorHandler) {
        this.errorHandler(event);
      } else {
        console.error("Worker 发生错误:", event);
      }
    };
  }

  /**
   * 设置共享 Worker 的消息处理
   */
  private setupSharedWorkerMessageHandlers(): void {
    const sharedWorker = this.worker as SharedWorker;

    sharedWorker.port.onmessage = event => this.handleMessage(event.data);

    sharedWorker.port.onmessageerror = event => {
      if (this.errorHandler) {
        this.errorHandler(event as unknown as ErrorEvent);
      } else {
        console.error("SharedWorker 消息错误:", event);
      }
    };

    // 启动端口连接
    sharedWorker.port.start();
  }

  /**
   * 处理从 Worker 接收的消息
   * @param data 消息数据
   */
  private handleMessage(data: any): void {
    if (data && data.type === "response" && data.taskId) {
      const pendingTask = this.pendingTasks.get(data.taskId);
      if (pendingTask) {
        if (data.error) {
          pendingTask.reject(new Error(data.error));
        } else {
          pendingTask.resolve(data.result);
        }
        this.pendingTasks.delete(data.taskId);
      }
    } else if (data && data.type && this.messageHandlers.has(data.type)) {
      const handler = this.messageHandlers.get(data.type);
      if (handler) {
        try {
          const result = handler(data.payload);
          if (result instanceof Promise) {
            result
              .then(value => this.sendResponse(data.taskId, value, null))
              .catch(err => this.sendResponse(data.taskId, null, err.message));
          } else if (result !== undefined) {
            this.sendResponse(data.taskId, result, null);
          }
        } catch (error) {
          if (error instanceof Error) {
            this.sendResponse(data.taskId, null, error.message);
          } else {
            this.sendResponse(data.taskId, null, "未知错误");
          }
        }
      }
    }
  }

  /**
   * 向 Worker 发送响应
   * @param taskId 任务 ID
   * @param result 响应结果
   * @param error 错误信息
   */
  private sendResponse(taskId: string, result: any, error: string | null): void {
    if (!taskId) return;

    const response = {
      type: "response",
      taskId,
      result,
      error,
    };

    this.postMessage(response);
  }

  /**
   * 向 Worker 发送消息
   * @param message 消息内容
   */
  private postMessage(message: any): void {
    if (this.isShared) {
      const sharedWorker = this.worker as SharedWorker;
      sharedWorker.port.postMessage(message);
    } else {
      const dedicatedWorker = this.worker as Worker;
      dedicatedWorker.postMessage(message);
    }
  }

  /**
   * 执行任务
   * @param data 任务数据
   * @returns Promise 任务执行结果
   */
  public execute<D = T, RD = R>(data: D): Promise<RD> {
    return new Promise((resolve, reject) => {
      const taskId = `task_${Date.now()}_${this.messageCount++}`;

      this.pendingTasks.set(taskId, { resolve, reject });

      this.postMessage({
        type: "task",
        taskId,
        payload: data,
      });
    });
  }

  /**
   * 注册消息处理器
   * @param type 消息类型
   * @param handler 处理函数
   * @returns this 实例引用，用于链式调用
   */
  public on<D = any, RD = any>(type: string, handler: WorkerMessageHandler<D, RD>): this {
    this.messageHandlers.set(type, handler);
    return this;
  }

  /**
   * 注册错误处理器
   * @param handler 错误处理函数
   * @returns this 实例引用，用于链式调用
   */
  public onError(handler: WorkerErrorHandler): this {
    this.errorHandler = handler;
    return this;
  }

  /**
   * 发送自定义消息
   * @param type 消息类型
   * @param payload 消息数据
   */
  public send(type: string, payload?: any): void {
    this.postMessage({
      type,
      payload,
    });
  }

  /**
   * 终止 Worker
   */
  public terminate(): void {
    if (this.isShared) {
      const sharedWorker = this.worker as SharedWorker;
      sharedWorker.port.close();
    } else {
      const dedicatedWorker = this.worker as Worker;
      dedicatedWorker.terminate();
    }
  }
}

/**
 * 任务执行池配置选项
 */
export interface WorkerPoolOptions extends WorkerOptions {
  /** 最大 Worker 数量 */
  maxWorkers?: number;
  /** 任务超时时间（毫秒） */
  taskTimeout?: number;
}

/**
 * Worker 任务池
 * 实现任务分发和负载均衡
 */
class WorkerPool<T = any, R = any> implements TaskExecutor<T, R> {
  private workers: WorkerWrapper<T, R>[] = [];
  private queue: WorkerTask<T, R>[] = [];
  private maxWorkers: number;
  private taskTimeout?: number;
  private workerBusy: boolean[] = [];

  /**
   * 创建 Worker 任务池
   * @param scriptUrl Worker 脚本 URL
   * @param options 任务池配置选项
   */
  constructor(
    private readonly scriptUrl: string | URL,
    options: WorkerPoolOptions = {},
  ) {
    this.maxWorkers = options.maxWorkers || getHardwareConcurrency();
    this.taskTimeout = options.taskTimeout;

    // 预创建 Worker
    for (let i = 0; i < this.maxWorkers; i++) {
      this.workers.push(new WorkerWrapper<T, R>(scriptUrl, options));
      this.workerBusy.push(false);
    }
  }

  /**
   * 执行任务
   * @param data 任务数据
   * @returns Promise 任务执行结果
   */
  public execute(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      const availableWorkerIndex = this.getAvailableWorkerIndex();

      const task: WorkerTask<T, R> = { data, resolve, reject };

      if (availableWorkerIndex !== -1) {
        this.runTask(availableWorkerIndex, task);
      } else {
        // 添加到队列
        if (this.taskTimeout) {
          const timeoutId = window.setTimeout(() => {
            const index = this.queue.findIndex(item => item === task);
            if (index !== -1) {
              this.queue.splice(index, 1);
              reject(new Error("任务执行超时"));
            }
          }, this.taskTimeout);

          task.timeoutId = timeoutId;
        }

        this.queue.push(task);
      }
    });
  }

  /**
   * 获取可用的 Worker 索引
   */
  private getAvailableWorkerIndex(): number {
    return this.workerBusy.findIndex(busy => !busy);
  }

  /**
   * 运行任务
   * @param workerIndex Worker 索引
   * @param task 任务对象
   */
  private runTask(workerIndex: number, task: WorkerTask<T, R>): void {
    // 清除超时计时器
    if (task.timeoutId) {
      clearTimeout(task.timeoutId);
    }

    // 标记为繁忙
    this.workerBusy[workerIndex] = true;

    const worker = this.workers[workerIndex];

    worker
      .execute(task.data)
      .then(result => {
        task.resolve(result);
        this.workerBusy[workerIndex] = false;
        this.processQueue();
      })
      .catch(error => {
        task.reject(error);
        this.workerBusy[workerIndex] = false;
        this.processQueue();
      });
  }

  /**
   * 处理队列中的任务
   */
  private processQueue(): void {
    if (this.queue.length === 0) return;

    const availableWorkerIndex = this.getAvailableWorkerIndex();

    if (availableWorkerIndex !== -1) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        this.runTask(availableWorkerIndex, nextTask);
      }
    }
  }

  /**
   * 终止所有 Worker
   */
  public terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.workerBusy = [];

    // 拒绝所有待处理任务
    this.queue.forEach(task => {
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
      task.reject(new Error("Worker 池已终止"));
    });
    this.queue = [];
  }
}

/**
 * 创建 Worker 包装器
 * @param scriptUrl Worker 脚本 URL
 * @param options Worker 配置选项
 * @returns Worker 包装器实例
 */
export function createWorker<T = any, R = any>(scriptUrl: string | URL, options?: WorkerOptions): WorkerWrapper<T, R> {
  if (!isWebWorkerSupported()) {
    throw new Error("当前环境不支持 Web Worker");
  }
  return new WorkerWrapper<T, R>(scriptUrl, options);
}

/**
 * 创建 Worker 任务池
 * @param scriptUrl Worker 脚本 URL
 * @param options 任务池配置选项
 * @returns Worker 任务池实例
 */
export function createWorkerPool<T = any, R = any>(
  scriptUrl: string | URL,
  options?: WorkerPoolOptions,
): WorkerPool<T, R> {
  if (!isWebWorkerSupported()) {
    throw new Error("当前环境不支持 Web Worker");
  }
  return new WorkerPool<T, R>(scriptUrl, options);
}

/**
 * 判断当前环境是否支持 Worker
 * @returns 是否支持 Worker
 */
export function isWorkerSupported(): boolean {
  return isWebWorkerSupported();
}

/**
 * 创建内联 Worker
 * @param fn Worker 函数体
 * @param options Worker 配置选项
 * @returns Worker 包装器实例
 */
export function createInlineWorker<T = any, R = any>(fn: Function, options?: WorkerOptions): WorkerWrapper<T, R> {
  if (!isWebWorkerSupported()) {
    throw new Error("当前环境不支持 Web Worker");
  }

  const blob = new Blob([`(${fn.toString()})(self);`], { type: "application/javascript" });

  const url = URL.createObjectURL(blob);
  const worker = createWorker<T, R>(url, options);

  return worker;
}

// 同时提供命名空间对象
export const workerUtils = {
  WorkerWrapper,
  WorkerPool,
};

// 默认导出命名空间对象
export default workerUtils;
