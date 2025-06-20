import { ref, watch, onUnmounted } from "vue";
import type { Ref } from "vue";
import { throttle, simpleThrottle, createRafThrottle } from "@xihan-ui/utils";
import type { ThrottleOptions as BaseThrottleOptions } from "@xihan-ui/utils";

/**
 * useThrottle 专用配置选项
 */
export interface UseThrottleOptions extends Omit<BaseThrottleOptions, "leading"> {
  /** 节流时间（毫秒），默认300ms */
  wait?: number;
  /** 是否立即更新初始值，默认true */
  immediate?: boolean;
}

/**
 * 节流响应式值
 * @param value - 需要节流的响应式值
 * @param options - 配置选项
 * @returns 节流后的响应式值
 */
export function useThrottle<T>(value: Ref<T>, options: UseThrottleOptions = {}): Ref<T> {
  const { wait = 300, immediate = true, trailing = true, maxWait } = options;

  const throttledValue = ref<T>(value.value) as Ref<T>;

  // 创建节流更新函数
  const throttledUpdate = throttle(
    (newValue: T) => {
      throttledValue.value = newValue;
    },
    wait,
    {
      leading: immediate, // 将immediate映射为leading
      trailing,
      maxWait,
    },
  );

  // 监听原始值的变化
  const stopWatcher = watch(
    () => value.value,
    newValue => {
      throttledUpdate(newValue);
    },
    { immediate },
  );

  // 组件卸载时清理
  onUnmounted(() => {
    throttledUpdate.cancel();
    stopWatcher();
  });

  return throttledValue;
}

/**
 * 节流函数调用
 * @param fn - 需要节流的函数
 * @param wait - 节流时间（毫秒）
 * @param options - 配置选项
 * @returns 节流后的函数和控制方法
 */
export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  wait: number = 300,
  options: BaseThrottleOptions = {},
): {
  throttledFn: T;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
} {
  const throttledFn = throttle(fn, wait, options);

  // 组件卸载时自动取消
  onUnmounted(() => {
    throttledFn.cancel();
  });

  return {
    throttledFn,
    cancel: throttledFn.cancel,
    flush: throttledFn.flush,
  };
}

/**
 * 简单节流函数（仅trailing模式）
 * @param fn - 需要节流的函数
 * @param wait - 节流时间（毫秒）
 * @returns 节流后的函数
 */
export function useSimpleThrottle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number = 300,
): (...args: Parameters<T>) => void {
  const throttledFn = simpleThrottle(fn, wait);

  // 组件卸载时清理（simpleThrottle没有cancel方法，但会自动清理）
  onUnmounted(() => {
    // simpleThrottle会在定时器结束后自动清理
  });

  return throttledFn;
}

/**
 * 基于requestAnimationFrame的节流
 * @param fn - 需要节流的函数
 * @returns 节流后的函数
 */
export function useRafThrottle<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => void {
  const rafThrottledFn = createRafThrottle(fn);

  // RAF节流会自动清理，无需手动处理
  return rafThrottledFn;
}
