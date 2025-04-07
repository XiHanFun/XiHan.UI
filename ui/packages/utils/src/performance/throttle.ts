/**
 * 增强的节流函数工具
 */

/**
 * 节流函数配置选项
 */
export interface ThrottleOptions {
  /**
   * 是否在延迟开始前调用函数，默认为false
   */
  leading?: boolean;

  /**
   * 是否在延迟结束后调用函数，默认为true
   */
  trailing?: boolean;

  /**
   * 最大等待时间，超过此时间强制执行，默认不限制
   */
  maxWait?: number;
}

/**
 * 增强的节流函数
 * @param func 要节流的函数
 * @param wait 延迟时间（毫秒）
 * @param options 配置选项
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: ThrottleOptions = {},
): T & {
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
} {
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let timerId: number | null = null;
  let lastArgs: any[] | null = null;
  let lastThis: any = null;
  let result: ReturnType<T>;
  let lastExecutedTime = 0;

  const leading = options.leading !== false;
  const trailing = options.trailing !== false;
  const maxWait = options.maxWait || 0;

  // 确保wait和maxWait都是有效的数值
  wait = +wait || 0;

  // 获取当前时间戳
  const now = () => new Date().getTime();

  // 判断是否应该执行函数
  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    // 满足以下任一条件时执行函数：
    // 1. 首次调用
    // 2. 超过等待时间
    // 3. 系统时间被调整为更早的时间
    // 4. 如果设置了maxWait，且超过了最大等待时间
    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait > 0 && timeSinceLastInvoke >= maxWait)
    );
  };

  // 执行函数
  const invokeFunc = (time: number) => {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = null;
    lastInvokeTime = time;
    lastExecutedTime = time;

    if (args) {
      result = func.apply(thisArg, args);
    }

    return result;
  };

  // 启动定时器
  const startTimer = (pendingFunc: () => void, wait: number) => {
    return window.setTimeout(pendingFunc, wait);
  };

  // 取消定时器
  const cancelTimer = (timerId: number | null) => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
  };

  // 待执行的函数（用于trailing效果）
  const trailingEdge = (time: number) => {
    timerId = null;

    // 只有启用了trailing且有参数时才执行
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }

    lastArgs = lastThis = null;
    return result;
  };

  // 计算剩余等待时间
  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    // 如果设置了maxWait，取两者的最小值
    return maxWait > 0 ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  };

  // 检查是否应该调用函数
  const shouldExecute = (time: number) => {
    if (shouldInvoke(time)) {
      const timeSinceLastExecute = time - lastExecutedTime;
      // 确保至少间隔wait时间
      return timeSinceLastExecute >= wait;
    }
    return false;
  };

  // 定时器回调函数
  const timerExpired = () => {
    const time = now();

    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }

    // 重新计算剩余时间并重启定时器
    timerId = startTimer(timerExpired, remainingWait(time));
  };

  // 主函数
  const throttled = function (this: any, ...args: any[]) {
    const time = now();
    const isInvoking = shouldExecute(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    // 如果定时器不存在且不应立即执行，启动定时器
    if (timerId === null) {
      if (isInvoking && leading) {
        // 如果是leading模式且应该执行，立即执行
        return invokeFunc(time);
      }

      // 否则启动定时器
      timerId = startTimer(timerExpired, wait);
    }

    // 如果应该立即执行且符合leading模式，立即执行
    if (isInvoking && leading) {
      return invokeFunc(time);
    }

    return result;
  } as T & {
    cancel: () => void;
    flush: () => ReturnType<T> | undefined;
  };

  // 取消功能
  throttled.cancel = function () {
    cancelTimer(timerId);
    lastInvokeTime = 0;
    lastCallTime = 0;
    timerId = null;
    lastArgs = null;
    lastThis = null;
  };

  // 立即执行功能
  throttled.flush = function () {
    return timerId === null ? result : trailingEdge(now());
  };

  return throttled;
}

/**
 * 简单节流函数（仅trailing）
 * @param func 要节流的函数
 * @param wait 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function simpleThrottle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;

  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    if (timeout === null) {
      timeout = window.setTimeout(() => {
        func.apply(lastThis, lastArgs!);
        timeout = null;
        lastArgs = null;
        lastThis = null;
      }, wait);
    }
  };
}

/**
 * 创建帧率限制器
 * @param fps 目标帧率，默认为60
 * @returns 节流函数
 */
export function createFpsThrottle(
  fps: number = 60,
): <T extends (...args: any[]) => any>(callback: T) => (...args: Parameters<T>) => void {
  const interval = 1000 / fps;

  return <T extends (...args: any[]) => any>(callback: T) => {
    return simpleThrottle(callback, interval);
  };
}

/**
 * 创建请求动画帧节流函数
 * @returns 基于requestAnimationFrame的节流函数
 */
export function createRafThrottle<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;

  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(lastThis, lastArgs!);
        rafId = null;
        lastArgs = null;
        lastThis = null;
      });
    }
  };
}
