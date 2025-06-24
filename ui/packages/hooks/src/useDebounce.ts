import { ref, watch, onUnmounted } from "vue";
import type { Ref, UnwrapRef } from "vue";

export interface DebounceOptions {
  /** 延迟时间（毫秒） */
  delay?: number;
  /** 是否立即执行 */
  immediate?: boolean;
  /** 最大等待时间（毫秒） */
  maxWait?: number;
}

/**
 * 使用防抖
 * @param value - 需要防抖的值
 * @param options - 配置选项
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: Ref<T>, options: DebounceOptions = {}): Ref<T> {
  const { delay = 300, immediate = false, maxWait = 0 } = options;

  const debouncedValue = ref<T>(value.value) as Ref<T>;
  let timer: number | null = null;
  let maxTimer: number | null = null;
  let lastCallTime = 0;

  const clearTimers = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (maxTimer) {
      clearTimeout(maxTimer);
      maxTimer = null;
    }
  };

  const updateValue = () => {
    debouncedValue.value = value.value;
    lastCallTime = Date.now();
  };

  watch(
    () => value.value,
    newValue => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      // 如果设置了最大等待时间，且已经超过最大等待时间
      if (maxWait > 0 && timeSinceLastCall >= maxWait) {
        clearTimers();
        updateValue();
        return;
      }

      // 如果是首次调用且设置了立即执行
      if (immediate && !timer) {
        updateValue();
      }

      // 清除之前的定时器
      if (timer) {
        clearTimeout(timer);
      }

      // 设置新的定时器
      timer = window.setTimeout(() => {
        updateValue();
        timer = null;
      }, delay);

      // 设置最大等待定时器
      if (maxWait > 0 && !maxTimer) {
        maxTimer = window.setTimeout(() => {
          updateValue();
          maxTimer = null;
        }, maxWait);
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    clearTimers();
  });

  return debouncedValue;
}
