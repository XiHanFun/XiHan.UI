import { watch, type WatchOptions, type WatchSource } from "vue";

/**
 * 防抖监听
 * @param source - 源
 * @param callback - 回调
 * @param delay - 延迟
 * @param options - 选项
 * @returns 返回监听
 */
export const watchDebounced = <T>(
  source: WatchSource<T>,
  callback: (value: T) => void,
  delay = 300,
  options: WatchOptions = {},
) => {
  let timer: number;

  return watch(
    source,
    value => {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => {
        callback(value);
      }, delay);
    },
    options,
  );
};

/**
 * 节流监听
 * @param source - 源
 * @param callback - 回调
 * @param delay - 延迟
 * @param options - 选项
 * @returns 返回监听
 */
export const watchThrottled = <T>(
  source: WatchSource<T>,
  callback: (value: T) => void,
  delay = 300,
  options: WatchOptions = {},
) => {
  let lastTime = 0;

  return watch(
    source,
    value => {
      const now = Date.now();
      if (now - lastTime >= delay) {
        callback(value);
        lastTime = now;
      }
    },
    options,
  );
};

/**
 * 条件监听
 * @param source - 源
 * @param condition - 条件
 * @param callback - 回调
 * @returns 返回监听
 */
export const watchWhen = <T>(source: WatchSource<T>, condition: () => boolean, callback: (value: T) => void) => {
  return watch(source, value => {
    if (condition()) {
      callback(value);
    }
  });
};
