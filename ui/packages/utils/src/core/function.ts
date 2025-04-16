/**
 * 防抖函数生成器
 * 防抖技术是指在一定时间内多次触发某个函数，只在最后一次触发后等待指定时间后再执行该函数
 * 如果在等待期间内再次被触发，则重新计时，以此来限制函数的执行频率
 * @param fn 要进行防抖处理的函数，它可以接受任意数量的参数
 * @param delay 延迟时间，即在等待期间内再次触发函数，则重新计时的延迟时间（以毫秒为单位）
 * @returns 返回一个新的防抖函数，它接受与原函数相同的参数，但确保原函数在指定时间内只执行一次
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: number | null = null;
  return function (this: any, ...args: Parameters<T>) {
    // 如果已存在定时器，则清除之前的定时器，确保在等待期间内再次触发时，重新计时
    if (timer) clearTimeout(timer);
    // 设置新的定时器，延迟指定时间后执行原函数
    timer = window.setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 函数节流器，用于在指定时间内部分更新函数的执行
 * 这对于限制高频操作的执行速率非常有用，例如窗口滚动或调整大小事件
 * @param fn 要节流的函数
 * @param delay 节流的时间间隔，单位为毫秒
 * @returns 返回一个新的节流函数，它将在调用时根据指定的延迟执行原始函数
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  // 定时器ID，用于 clearTimeout 操作
  let timer: number | null = null;
  // 上次执行的时间戳
  let last = 0;
  // 返回一个新的函数，该函数会在调用时应用节流逻辑
  return function (this: any, ...args: Parameters<T>) {
    // 当前时间戳
    const now = Date.now();
    // 如果上次执行时间存在且当前时间未超过节流间隔
    if (last && now < last + delay) {
      // 清除之前的定时器，以确保最新的节流周期
      if (timer) clearTimeout(timer);
      // 设置新的定时器，以延迟执行原始函数
      timer = window.setTimeout(() => {
        last = now;
        fn.apply(this, args);
      }, delay);
    } else {
      // 如果当前时间超过了节流间隔，直接执行原始函数并更新上次执行时间
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 函数重试
 * @param fn 要重试的函数
 * @param options 重试选项
 * @returns 返回重试后的结果
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delay?: number; onRetry?: (attempt: number, error: any) => void } = {},
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, onRetry } = options;
  let attempt = 1;

  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      if (onRetry) onRetry(attempt, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }

  throw new Error("Max retry attempts reached");
}

/**
 * 函数缓存
 * @param fn 要缓存的函数
 * @param options 缓存选项
 * @returns 返回缓存后的函数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number;
    ttl?: number;
  } = {},
): T {
  const { maxSize = 1000, ttl } = options;
  const cache = new Map<string, { value: any; timestamp: number }>();

  return function (this: any, ...args: Parameters<T>) {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && (!ttl || now - cached.timestamp < ttl)) {
      return cached.value;
    }

    const result = fn.apply(this, args);
    cache.set(key, { value: result, timestamp: now });

    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    return result;
  } as T;
}

/**
 * 异步函数超时控制
 * @param promise 要超时的异步函数
 * @param ms 超时时间（毫秒）
 * @param error 超时错误
 * @returns 返回超时后的结果
 */
export async function timeout<T>(
  promise: Promise<T>,
  ms: number,
  error = new Error("Operation timed out"),
): Promise<T> {
  let timeoutId: number | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(error), ms);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
