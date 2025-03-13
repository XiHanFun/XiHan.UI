import { ref, onMounted, onUnmounted, watch } from "vue";
import type { Ref } from "vue";

/**
 * 使用防抖
 * @param value - 值
 * @param delay - 延迟
 * @returns 返回防抖值
 */
export function useDebounce<T>(value: Ref<T>, delay: number) {
  const debounced = ref(value.value) as Ref<T>;
  let timer: number;

  watch(value, newValue => {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      debounced.value = newValue;
    }, delay);
  });

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return debounced;
}

/**
 * 使用节流
 * @param value - 值
 * @param delay - 延迟
 * @returns 返回节流值
 */
export function useThrottle<T>(value: Ref<T>, delay: number) {
  const throttled = ref(value.value) as Ref<T>;
  let timer: number | null = null;
  let lastTime = 0;

  watch(value, newValue => {
    const now = Date.now();
    if (lastTime && now < lastTime + delay) {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => {
        lastTime = now;
        throttled.value = newValue;
      }, delay);
    } else {
      lastTime = now;
      throttled.value = newValue;
    }
  });

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return throttled;
}

/**
 * 使用本地存储
 * @param key - 键
 * @param initialValue - 初始值
 * @returns 返回本地存储值
 */
export function useStorage<T>(key: string, initialValue: T): readonly [Ref<T>, (value: T) => void] {
  const storedValue = ref<T>(initialValue) as Ref<T>;

  const setValue = (value: T) => {
    storedValue.value = value;
    localStorage.setItem(key, JSON.stringify(value));
  };

  onMounted(() => {
    const value = localStorage.getItem(key);
    if (value) {
      storedValue.value = JSON.parse(value);
    }
  });

  return [storedValue, setValue] as const;
}

/**
 * 使用窗口尺寸
 * @returns 返回窗口尺寸
 */
export function useWindowSize() {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  const update = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  onMounted(() => window.addEventListener("resize", update));
  onUnmounted(() => window.removeEventListener("resize", update));

  return { width, height };
}

/**
 * 使用点击外部
 * @param elementRef - 元素引用
 * @param callback - 回调
 */
export function useClickOutside(elementRef: Ref<HTMLElement | null>, callback: () => void) {
  const handleClick = (e: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(e.target as Node)) {
      callback();
    }
  };

  onMounted(() => document.addEventListener("click", handleClick));
  onUnmounted(() => document.removeEventListener("click", handleClick));
}

interface AsyncState<T, E> {
  data: Ref<T | null>;
  error: Ref<E | null>;
  loading: Ref<boolean>;
  execute: () => Promise<void>;
}

/**
 * 使用异步状态
 * @param asyncFn - 异步函数
 * @returns 返回异步状态
 */
export function useAsync<T, E = Error>(asyncFn: () => Promise<T>): AsyncState<T, E> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<E | null>(null) as Ref<E | null>;

  const loading = ref(false);

  const execute = async () => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await asyncFn();
    } catch (e) {
      error.value = e as E;
    } finally {
      loading.value = false;
    }
  };

  return { data, error, loading, execute };
}

/**
 * 使用计数器
 * @param initialValue - 初始值
 * @param options - 选项
 * @returns 返回计数器
 */
export function useCounter(initialValue = 0, options = { min: -Infinity, max: Infinity }) {
  const count = ref(initialValue);
  const { min, max } = options;

  const increment = (delta = 1) => {
    count.value = Math.min(max, count.value + delta);
  };

  const decrement = (delta = 1) => {
    count.value = Math.max(min, count.value - delta);
  };

  const reset = () => {
    count.value = initialValue;
  };

  return { count, increment, decrement, reset };
}

/**
 * 使用定时器
 * @param callback - 回调
 * @param delay - 延迟
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = ref(callback);

  onMounted(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.value(), delay);
    return () => clearInterval(id);
  });
}

/**
 * 网络状态
 * @returns 返回网络状态
 */
export function useNetwork() {
  const isOnline = ref(navigator.onLine);

  const update = () => {
    isOnline.value = navigator.onLine;
  };

  onMounted(() => {
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
  });

  onUnmounted(() => {
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
  });

  return { isOnline };
}

export const hooksUtils = {
  useDebounce,
  useThrottle,
  useStorage,
  useWindowSize,
  useClickOutside,
  useAsync,
  useCounter,
  useInterval,
  useNetwork,
} as const;

export default hooksUtils;
