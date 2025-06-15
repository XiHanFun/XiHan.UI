import { ref, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface TimeoutOptions {
  /** 是否立即执行 */
  immediate?: boolean;
  /** 是否自动启动 */
  autoStart?: boolean;
}

export interface TimeoutControls {
  /** 是否正在运行 */
  isRunning: Ref<boolean>;
  /** 启动定时器 */
  start: () => void;
  /** 停止定时器 */
  stop: () => void;
  /** 重置定时器 */
  reset: () => void;
}

/**
 * 使用定时器
 * @param callback - 回调函数
 * @param delay - 延迟时间（毫秒）
 * @param options - 配置选项
 * @returns 定时器控制
 */
export function useTimeout(callback: () => void, delay: number | null, options: TimeoutOptions = {}): TimeoutControls {
  const { immediate = false, autoStart = true } = options;
  const isRunning = ref(false);
  let timer: number | null = null;

  const start = () => {
    if (timer) return;
    if (delay === null) return;

    isRunning.value = true;
    timer = window.setTimeout(() => {
      callback();
      isRunning.value = false;
      timer = null;
    }, delay);
  };

  const stop = () => {
    if (!timer) return;

    window.clearTimeout(timer);
    timer = null;
    isRunning.value = false;
  };

  const reset = () => {
    stop();
    if (immediate) {
      callback();
    }
    start();
  };

  onUnmounted(() => {
    stop();
  });

  if (autoStart) {
    if (immediate) {
      callback();
    }
    start();
  }

  return {
    isRunning,
    start,
    stop,
    reset,
  };
}
