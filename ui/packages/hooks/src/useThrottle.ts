import { ref, watch, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface ThrottleOptions {
  /** 节流时间（毫秒） */
  wait?: number;
  /** 是否立即执行 */
  immediate?: boolean;
  /** 是否在节流结束后执行 */
  trailing?: boolean;
}

/**
 * 使用节流
 * @param value - 需要节流的值
 * @param options - 配置选项
 * @returns 节流后的值
 */
export function useThrottle<T>(value: Ref<T>, options: ThrottleOptions = {}): Ref<T> {
  const { wait = 300, immediate = true, trailing = true } = options;

  const throttledValue = ref<T>(value.value) as Ref<T>;
  let lastCallTime = 0;
  let timer: number | null = null;
  let lastValue: T = value.value;

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const updateValue = (newValue: T) => {
    throttledValue.value = newValue;
    lastCallTime = Date.now();
  };

  watch(
    () => value.value,
    newValue => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      // 如果是首次调用且设置了立即执行
      if (immediate && lastCallTime === 0) {
        updateValue(newValue);
        return;
      }

      // 如果距离上次调用时间小于等待时间
      if (timeSinceLastCall < wait) {
        // 如果设置了在节流结束后执行，则保存最新值
        if (trailing) {
          lastValue = newValue;
          clearTimer();
          timer = window.setTimeout(() => {
            updateValue(lastValue);
          }, wait - timeSinceLastCall);
        }
        return;
      }

      // 更新值
      updateValue(newValue);
    },
    { immediate: true },
  );

  onUnmounted(() => {
    clearTimer();
  });

  return throttledValue;
}
