/**
 * 函数结果缓存工具
 */

/**
 * 记忆化函数配置选项
 */
export interface MemoizeOptions {
  /**
   * 最大缓存数量，默认不限制
   */
  maxSize?: number;

  /**
   * 缓存过期时间（毫秒），默认不过期
   */
  ttl?: number;

  /**
   * 自定义缓存键生成函数
   */
  resolver?: (...args: any[]) => string;
}

/**
 * 缓存项
 */
interface CacheItem<T> {
  /**
   * 缓存值
   */
  value: T;

  /**
   * 过期时间戳
   */
  expiry?: number;

  /**
   * 最后访问时间
   */
  lastAccessed: number;
}

/**
 * LRU (最近最少使用) 缓存
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private keysAge = new Map<K, number>();
  private maxSize: number;
  private counter = 0;

  /**
   * 创建LRU缓存
   * @param maxSize 最大缓存数量
   */
  constructor(maxSize: number = Infinity) {
    this.maxSize = maxSize;
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // 更新访问时间
    this.keysAge.set(key, ++this.counter);
    return this.cache.get(key);
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   */
  set(key: K, value: V): void {
    // 如果已达到最大容量且添加的是新键，需要删除最旧的项
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.removeOldest();
    }

    this.cache.set(key, value);
    this.keysAge.set(key, ++this.counter);
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   */
  delete(key: K): boolean {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.keysAge.delete(key);
      return true;
    }
    return false;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.keysAge.clear();
    this.counter = 0;
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 判断是否包含指定键
   * @param key 缓存键
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 获取所有缓存键
   */
  keys(): K[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 删除最旧的项
   */
  private removeOldest(): void {
    if (this.cache.size === 0) return;

    let oldestKey: K | null = null;
    let oldestAge = Infinity;

    for (const [key, age] of this.keysAge.entries()) {
      if (age < oldestAge) {
        oldestAge = age;
        oldestKey = key;
      }
    }

    if (oldestKey !== null) {
      this.delete(oldestKey);
    }
  }
}

/**
 * 创建记忆化函数
 * @param func 要缓存结果的函数
 * @param options 缓存配置选项
 * @returns 带缓存的函数
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  options: MemoizeOptions = {},
): T & {
  cache: {
    get: (key: string) => ReturnType<T> | undefined;
    set: (key: string, value: ReturnType<T>) => void;
    delete: (key: string) => boolean;
    clear: () => void;
    size: () => number;
    has: (key: string) => boolean;
    keys: () => string[];
  };
} {
  const { maxSize = Infinity, ttl, resolver = (...args: any[]) => JSON.stringify(args) } = options;

  const cache = new LRUCache<string, CacheItem<ReturnType<T>>>(maxSize);

  // 清理过期缓存的函数
  const cleanExpired = () => {
    if (!ttl) return;

    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const key of cache.keys()) {
      const item = cache.get(key);
      if (item && item.expiry && item.expiry <= now) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      cache.delete(key);
    }
  };

  // 创建记忆化函数
  const memoized = function (this: any, ...args: Parameters<T>): ReturnType<T> {
    // 先清理过期缓存
    cleanExpired();

    // 生成缓存键
    const key = resolver(...args);

    // 检查缓存
    const cachedItem = cache.get(key);

    if (cachedItem) {
      // 更新最后访问时间
      cachedItem.lastAccessed = Date.now();
      return cachedItem.value;
    }

    // 执行原函数
    const result = func.apply(this, args);

    // 存入缓存
    const newItem: CacheItem<ReturnType<T>> = {
      value: result,
      lastAccessed: Date.now(),
    };

    // 设置过期时间
    if (ttl) {
      newItem.expiry = Date.now() + ttl;
    }

    cache.set(key, newItem);

    return result;
  } as T & {
    cache: {
      get: (key: string) => ReturnType<T> | undefined;
      set: (key: string, value: ReturnType<T>) => void;
      delete: (key: string) => boolean;
      clear: () => void;
      size: () => number;
      has: (key: string) => boolean;
      keys: () => string[];
    };
  };

  // 添加缓存操作方法
  memoized.cache = {
    get: (key: string) => {
      const item = cache.get(key);
      return item ? item.value : undefined;
    },
    set: (key: string, value: ReturnType<T>) => {
      const newItem: CacheItem<ReturnType<T>> = {
        value,
        lastAccessed: Date.now(),
      };

      if (ttl) {
        newItem.expiry = Date.now() + ttl;
      }

      cache.set(key, newItem);
    },
    delete: (key: string) => cache.delete(key),
    clear: () => cache.clear(),
    size: () => cache.size(),
    has: (key: string) => cache.has(key),
    keys: () => cache.keys(),
  };

  return memoized;
}

/**
 * 创建一次性函数（只执行一次，后续调用返回第一次的结果）
 * @param func 要包装的函数
 * @returns 一次性函数
 */
export function once<T extends (...args: any[]) => any>(func: T): T {
  let result: ReturnType<T>;
  let called = false;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      result = func.apply(this, args);
      called = true;
    }
    return result;
  } as T;
}

/**
 * 创建防抖记忆函数（结合防抖和记忆功能）
 * @param func 要包装的函数
 * @param wait 防抖等待时间
 * @param options 记忆化选项
 * @returns 防抖记忆函数
 */
export function debounceMemoize<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: MemoizeOptions = {},
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  // 使用记忆化包装原函数
  const memoized = memoize(func, options);
  const resolver = options.resolver || ((...args: any[]) => JSON.stringify(args));

  // 防抖队列
  const queue = new Map<
    string,
    {
      timer: number;
      promise: Promise<ReturnType<T>>;
      resolve: (value: ReturnType<T>) => void;
    }
  >();

  return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    const key = resolver(...args);

    // 检查缓存
    if (memoized.cache.has(key)) {
      return Promise.resolve(memoized.cache.get(key)!);
    }

    // 检查是否已经有相同参数的调用在队列中
    if (queue.has(key)) {
      const item = queue.get(key)!;
      clearTimeout(item.timer);

      // 重置定时器
      item.timer = window.setTimeout(() => {
        const result = memoized.apply(this, args);
        item.resolve(result);
        queue.delete(key);
      }, wait);

      return item.promise;
    }

    // 创建新的Promise
    let promiseResolve!: (value: ReturnType<T>) => void;
    const promise = new Promise<ReturnType<T>>(resolve => {
      promiseResolve = resolve;
    });

    // 设置定时器
    const timer = window.setTimeout(() => {
      const result = memoized.apply(this, args);
      promiseResolve(result);
      queue.delete(key);
    }, wait);

    // 添加到队列
    queue.set(key, { timer, promise, resolve: promiseResolve });

    return promise;
  };
}
