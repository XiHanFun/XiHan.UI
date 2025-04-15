/**
 * 事件选项类型
 * @param capture 是否捕获
 * @param once 是否只执行一次
 * @param passive 是否被动
 */
export interface EventOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
}

/**
 * 事件监听器
 * @param target 目标元素
 * @param event 事件名称
 * @param handler 事件处理函数
 * @param options 事件选项
 * @returns 返回事件监听器
 */
export function on(
  target: EventTarget,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: EventOptions,
): void {
  target.addEventListener(event, handler, options);
}

/**
 * 移除事件监听器
 * @param target 目标元素
 * @param event 事件名称
 * @param handler 事件处理函数
 * @param options 事件选项
 * @returns 返回移除事件监听器
 */
export function off(
  target: EventTarget,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: EventOptions,
): void {
  target.removeEventListener(event, handler, options);
}

/**
 * 只执行一次的事件监听器
 * @param target 目标元素
 * @param event 事件名称
 * @param handler 事件处理函数
 * @param options 事件选项
 * @returns 返回只执行一次的事件监听器
 */
export function once(target: EventTarget, event: string, handler: Function, options?: EventOptions): void {
  const wrapper = (...args: any[]) => {
    handler.apply(null, args);
    off(target, event, wrapper);
  };
  on(target, event, wrapper, options);
}

/**
 * 防抖事件
 * @param func 事件处理函数
 * @param wait 等待时间
 * @returns 返回防抖事件
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}

/**
 * 节流事件
 * @param func 事件处理函数
 * @param wait 等待时间
 * @returns 返回节流事件
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let previous = 0;

  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - previous > wait) {
      func.apply(this, args);
      previous = now;
    }
  } as T;
}

/**
 * 阻止事件冒泡
 * @param e 事件对象
 * @returns 返回阻止事件冒泡
 */
export function stopPropagation(e: Event): void {
  e.stopPropagation();
}

/**
 * 阻止默认行为
 * @param e 事件对象
 * @returns 返回阻止默认行为
 */
export function preventDefault(e: Event): void {
  e.preventDefault();
}

/**
 * 获取事件目标元素
 * @param e 事件对象
 * @returns 返回事件目标元素
 */
export function getEventTarget<T extends EventTarget>(e: Event): T {
  return e.target as T;
}

/**
 * 创建自定义事件
 * @param eventName 事件名称
 * @param detail 事件详情
 * @param options 事件选项
 * @returns 返回自定义事件
 */
export function createCustomEvent<T = any>(eventName: string, detail?: T, options?: CustomEventInit): CustomEvent<T> {
  return new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

/**
 * 派发自定义事件
 * @param target 目标元素
 * @param eventName 事件名称
 * @param detail 事件详情
 * @param options 事件选项
 * @returns 返回派发自定义事件
 */
export function dispatchCustomEvent<T = any>(
  target: EventTarget,
  eventName: string,
  detail?: T,
  options?: CustomEventInit,
): boolean {
  const event = createCustomEvent(eventName, detail, options);
  return target.dispatchEvent(event);
}
