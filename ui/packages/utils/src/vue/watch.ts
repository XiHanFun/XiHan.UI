import { watch, type WatchOptions, type WatchSource } from "vue";

/**
 * 防抖监听
 */
export function watchDebounced<T>(
  source: WatchSource<T>,
  callback: (value: T) => void,
  delay = 300,
  options: WatchOptions = {}
) {
  let timer: number;

  return watch(
    source,
    value => {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => {
        callback(value);
      }, delay);
    },
    options
  );
}

/**
 * 节流监听
 */
export function watchThrottled<T>(
  source: WatchSource<T>,
  callback: (value: T) => void,
  delay = 300,
  options: WatchOptions = {}
) {
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
    options
  );
}

/**
 * 条件监听
 */
export function watchWhen<T>(source: WatchSource<T>, condition: () => boolean, callback: (value: T) => void) {
  return watch(source, value => {
    if (condition()) {
      callback(value);
    }
  });
}
