import { ref } from "vue";
import type { Ref } from "vue";

export interface CounterOptions {
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 初始值 */
  initialValue?: number;
}

export interface Counter {
  /** 计数值 */
  count: Ref<number>;
  /** 增加 */
  increment: (delta?: number) => void;
  /** 减少 */
  decrement: (delta?: number) => void;
  /** 设置值 */
  set: (value: number) => void;
  /** 重置 */
  reset: () => void;
}

/**
 * 使用计数器
 * @param options - 配置选项
 * @returns 计数器
 */
export function useCounter(options: CounterOptions = {}): Counter {
  const { min = -Infinity, max = Infinity, step = 1, initialValue = 0 } = options;

  const count = ref(initialValue);

  const increment = (delta = step) => {
    count.value = Math.min(max, count.value + delta);
  };

  const decrement = (delta = step) => {
    count.value = Math.max(min, count.value - delta);
  };

  const set = (value: number) => {
    count.value = Math.min(max, Math.max(min, value));
  };

  const reset = () => {
    count.value = initialValue;
  };

  return {
    count,
    increment,
    decrement,
    set,
    reset,
  };
}
