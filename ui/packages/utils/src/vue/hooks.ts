import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  computed,
  readonly,
  reactive,
  isRef,
  Ref,
  ComputedRef,
  ToRef,
  unref,
} from "vue";

/**
 * 网络信息接口
 */
interface NetworkInformation extends EventTarget {
  readonly downlink: number;
  readonly downlinkMax?: number;
  readonly effectiveType: string;
  readonly rtt: number;
  readonly saveData: boolean;
  readonly type: string;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

/**
 * 扩展 Navigator 接口
 */
interface NavigatorNetworkInformation extends Navigator {
  readonly connection?: NetworkInformation;
  readonly mozConnection?: NetworkInformation;
  readonly webkitConnection?: NetworkInformation;
}

/**
 * 检查是否在浏览器环境中
 */
const isBrowser = typeof window !== "undefined";

/**
 * 返回空的 ref 和空的函数（用于 SSR）
 */
const createEmptyRef = <T>(defaultValue: T) => ref(defaultValue);
const noop = () => {};

/**
 * 使用防抖
 * @param value 需要防抖的值
 * @param delay 延迟时间
 * @param immediate 是否立即执行
 * @returns 返回防抖后的值
 */
export function useDebounce<T>(value: Ref<T>, delay: number, immediate = false) {
  const debounced = ref(value.value) as Ref<T>;
  let timer: number | undefined;

  const update = (newValue: T) => {
    debounced.value = newValue;
  };

  watch(
    value,
    newValue => {
      if (timer) clearTimeout(timer);

      if (immediate) {
        const callNow = !timer;
        timer = window.setTimeout(() => {
          timer = undefined;
        }, delay);

        if (callNow) update(newValue);
      } else {
        timer = window.setTimeout(() => {
          update(newValue);
        }, delay);
      }
    },
    { immediate },
  );

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return readonly(debounced);
}

/**
 * 使用节流
 * @param value 需要节流的值
 * @param delay 延迟时间
 * @param options 节流选项
 * @returns 返回节流后的值
 */
export function useThrottle<T>(value: Ref<T>, delay: number, options: { leading?: boolean; trailing?: boolean } = {}) {
  const { leading = true, trailing = true } = options;
  const throttled = ref(value.value) as Ref<T>;
  let timer: number | undefined;
  let lastExecTime = 0;

  watch(
    value,
    newValue => {
      const now = Date.now();
      const remaining = delay - (now - lastExecTime);

      if (remaining <= 0 || remaining > delay) {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }

        lastExecTime = now;
        if (leading) {
          throttled.value = newValue;
        }
      } else if (!timer && trailing) {
        timer = window.setTimeout(() => {
          lastExecTime = Date.now();
          timer = undefined;
          throttled.value = newValue;
        }, remaining);
      }
    },
    { immediate: leading },
  );

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return readonly(throttled);
}

/**
 * 存储钩子的返回类型
 */
type UseStorageReturn<T> = readonly [Readonly<Ref<T>>, (value: T) => void];

/**
 * 使用本地存储
 * @param key 键
 * @param initialValue 初始值
 * @param options 选项
 * @returns 返回本地存储的值和设置值的方法
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  options: { serializer?: { read: (v: string) => T; write: (v: T) => string }; storage?: Storage } = {},
): UseStorageReturn<T> {
  if (!isBrowser) {
    return [ref(initialValue), noop] as const;
  }

  const {
    serializer = {
      read: (v: string) => JSON.parse(v),
      write: (v: T) => JSON.stringify(v),
    },
    storage = localStorage,
  } = options;

  const storedValue = ref<T>(initialValue) as Ref<T>;

  // 从存储中读取值
  const readValue = (): T => {
    try {
      const item = storage.getItem(key);
      return item ? serializer.read(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 设置值到存储中
  const setValue = (value: T) => {
    try {
      storedValue.value = value;
      storage.setItem(key, serializer.write(value));
      // 触发存储事件以同步标签页
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: serializer.write(value) }));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 监听存储变化（跨标签页同步）
  const handleStorage = (event: StorageEvent) => {
    if (event.key === key && event.newValue !== null) {
      storedValue.value = serializer.read(event.newValue);
    }
  };

  // 初始化值
  onMounted(() => {
    storedValue.value = readValue();
    window.addEventListener("storage", handleStorage);
  });

  onUnmounted(() => {
    window.removeEventListener("storage", handleStorage);
  });

  return [readonly(storedValue), setValue] as const;
}

/**
 * 使用窗口尺寸
 * @param initialWidth 初始宽度
 * @param initialHeight 初始高度
 * @returns 返回窗口尺寸
 */
export function useWindowSize(initialWidth = 0, initialHeight = 0) {
  if (!isBrowser) {
    return { width: ref(initialWidth), height: ref(initialHeight) };
  }

  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  const update = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  onMounted(() => {
    update();
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return { width: readonly(width), height: readonly(height) };
}

/**
 * 使用屏幕断点检测
 * @param breakpoints 断点配置
 * @returns 当前活动的断点
 */
export function useBreakpoints(breakpoints: Record<string, number>) {
  if (!isBrowser) {
    return { active: ref(""), matches: {} as Record<string, Ref<boolean>> };
  }

  const screens = reactive(Object.fromEntries(Object.entries(breakpoints).map(([key]) => [key, false])));

  const active = computed(() => {
    const points = Object.entries(breakpoints)
      .filter(([, width]) => window.innerWidth >= width)
      .sort(([, widthA], [, widthB]) => widthB - widthA);

    return points.length ? points[0][0] : "";
  });

  const update = () => {
    for (const [key, width] of Object.entries(breakpoints)) {
      screens[key] = window.innerWidth >= width;
    }
  };

  const matches = Object.keys(breakpoints).reduce(
    (acc, key) => {
      acc[key] = computed(() => screens[key]);
      return acc;
    },
    {} as Record<string, ComputedRef<boolean>>,
  );

  onMounted(() => {
    update();
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return { active, matches };
}

/**
 * 使用点击外部
 * @param targetRef 目标元素引用
 * @param callback 回调函数
 * @param events 触发事件
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  targetRef: Ref<T | null> | Ref<T | null>[],
  callback: (event: MouseEvent | TouchEvent) => void,
  events: string[] = ["mousedown", "touchstart"],
) {
  if (!isBrowser) return;

  const targets = Array.isArray(targetRef) ? targetRef : [targetRef];

  const handler = (event: MouseEvent | TouchEvent) => {
    const isOutside = targets.every(target => {
      const el = unref(target);
      return !el || !el.contains(event.target as Node);
    });

    if (isOutside) {
      callback(event);
    }
  };

  onMounted(() => {
    events.forEach(event => document.addEventListener(event, handler as EventListener));
  });

  onUnmounted(() => {
    events.forEach(event => document.removeEventListener(event, handler as EventListener));
  });
}

/**
 * 异步状态接口
 */
export interface UseAsyncReturn<T, E = Error> {
  data: Ref<T | null>;
  error: Ref<E | null>;
  loading: Ref<boolean>;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * 使用异步状态
 * @param asyncFn 异步函数
 * @param initialData 初始数据
 * @param immediate 是否立即执行
 * @returns 返回异步状态
 */
export function useAsync<T, E = Error>(
  asyncFn: (...args: any[]) => Promise<T>,
  initialData: T | null = null,
  immediate = false,
): UseAsyncReturn<T, E> {
  const data = ref<T | null>(initialData) as Ref<T | null>;
  const error = ref<E | null>(null) as Ref<E | null>;
  const loading = ref(false);

  // 重置状态
  const reset = () => {
    data.value = initialData;
    error.value = null;
    loading.value = false;
  };

  // 执行异步函数
  const execute = async (...args: any[]): Promise<T | null> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await asyncFn(...args);
      data.value = result;
      return result;
    } catch (e) {
      error.value = e as E;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // 如果需要立即执行
  if (immediate) {
    onMounted(() => {
      execute();
    });
  }

  return {
    data: readonly(data),
    error: readonly(error),
    loading: readonly(loading),
    execute,
    reset,
  };
}

/**
 * 使用计数器
 * @param initialValue 初始值
 * @param options 选项
 * @returns 返回计数器
 */
export function useCounter(initialValue = 0, options: { min?: number; max?: number; step?: number } = {}) {
  const { min = -Infinity, max = Infinity, step = 1 } = options;
  const count = ref(initialValue);

  const increment = (delta = step) => {
    count.value = Math.min(max, count.value + delta);
  };

  const decrement = (delta = step) => {
    count.value = Math.max(min, count.value - delta);
  };

  const reset = (value = initialValue) => {
    count.value = value;
  };

  const update = (value: number) => {
    count.value = Math.max(min, Math.min(max, value));
  };

  return {
    count,
    increment,
    decrement,
    reset,
    update,
  };
}

/**
 * 使用定时器
 * @param callback 回调函数
 * @param interval 间隔时间
 * @param options 选项
 * @returns 定时器控制器
 */
export function useInterval(
  callback: () => void,
  interval = 1000,
  options: { immediate?: boolean; startOnMount?: boolean } = {},
) {
  if (!isBrowser) {
    return {
      isActive: ref(false),
      start: noop,
      stop: noop,
      reset: noop,
    };
  }

  const { immediate = false, startOnMount = true } = options;
  const isActive = ref(false);
  let timer: number | undefined;

  const clear = () => {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  const stop = () => {
    isActive.value = false;
    clear();
  };

  const start = () => {
    if (isActive.value) return;
    isActive.value = true;
    clear();
    timer = window.setInterval(callback, interval);
  };

  const reset = () => {
    stop();
    start();
  };

  if (immediate) {
    callback();
  }

  onMounted(() => {
    if (startOnMount) {
      start();
    }
  });

  onUnmounted(() => {
    stop();
  });

  return {
    isActive: readonly(isActive),
    start,
    stop,
    reset,
  };
}

/**
 * 使用网络状态
 * @returns 返回网络状态
 */
export function useNetwork() {
  if (!isBrowser) {
    return {
      isOnline: ref(true),
      offlineAt: ref<number | null>(null),
      onlineAt: ref<number | null>(null),
      downlink: ref<number | null>(null),
      downlinkMax: ref<number | null>(null),
      effectiveType: ref<string | null>(null),
      rtt: ref<number | null>(null),
      saveData: ref<boolean | null>(null),
      type: ref<string | null>(null),
    };
  }

  const isOnline = ref(navigator.onLine);
  const offlineAt = ref<number | null>(null);
  const onlineAt = ref<number | null>(null);

  // 高级网络信息
  const connection =
    (navigator as NavigatorNetworkInformation).connection ||
    (navigator as NavigatorNetworkInformation).mozConnection ||
    (navigator as NavigatorNetworkInformation).webkitConnection;

  const downlink = ref<number | null>(connection?.downlink ?? null);
  const downlinkMax = ref<number | null>(connection?.downlinkMax ?? null);
  const effectiveType = ref<string | null>(connection?.effectiveType ?? null);
  const rtt = ref<number | null>(connection?.rtt ?? null);
  const saveData = ref<boolean | null>(connection?.saveData ?? null);
  const type = ref<string | null>(connection?.type ?? null);

  const updateNetworkInformation = () => {
    if (connection) {
      downlink.value = connection.downlink;
      downlinkMax.value = connection.downlinkMax;
      effectiveType.value = connection.effectiveType;
      rtt.value = connection.rtt;
      saveData.value = connection.saveData;
      type.value = connection.type;
    }
  };

  const onOffline = () => {
    isOnline.value = false;
    offlineAt.value = Date.now();
  };

  const onOnline = () => {
    isOnline.value = true;
    onlineAt.value = Date.now();
  };

  onMounted(() => {
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    if (connection) {
      updateNetworkInformation();
      connection.addEventListener("change", updateNetworkInformation);
    }
  });

  onUnmounted(() => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);

    if (connection) {
      connection.removeEventListener("change", updateNetworkInformation);
    }
  });

  return {
    isOnline: readonly(isOnline),
    offlineAt: readonly(offlineAt),
    onlineAt: readonly(onlineAt),
    downlink: readonly(downlink),
    downlinkMax: readonly(downlinkMax),
    effectiveType: readonly(effectiveType),
    rtt: readonly(rtt),
    saveData: readonly(saveData),
    type: readonly(type),
  };
}

/**
 * 使用地理位置
 * @param options 配置选项
 * @returns 返回地理位置状态
 */
export function useGeolocation(options: PositionOptions = {}) {
  if (!isBrowser || !("geolocation" in navigator)) {
    return {
      position: ref<GeolocationPosition | null>(null),
      error: ref<GeolocationPositionError | null>(null),
      isLoading: ref(false),
      refresh: noop,
    };
  }

  const position = ref<GeolocationPosition | null>(null);
  const error = ref<GeolocationPositionError | null>(null);
  const isLoading = ref(false);
  let watchId: number | undefined;

  // 获取当前位置
  const getCurrentPosition = () => {
    isLoading.value = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        position.value = pos;
        isLoading.value = false;
        error.value = null;
      },
      err => {
        error.value = err;
        isLoading.value = false;
      },
      options,
    );
  };

  // 刷新位置
  const refresh = () => {
    if (isLoading.value) return;
    getCurrentPosition();
  };

  onMounted(() => {
    // 初始化位置
    getCurrentPosition();

    // 监听位置变化
    watchId = navigator.geolocation.watchPosition(
      pos => {
        position.value = pos;
        error.value = null;
      },
      err => {
        error.value = err;
      },
      options,
    );
  });

  onUnmounted(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  });

  return {
    position: readonly(position),
    error: readonly(error),
    isLoading: readonly(isLoading),
    refresh,
  };
}

/**
 * 使用标题
 * @param newTitle 新标题
 * @param options 选项
 * @returns 标题控制器
 */
export function useTitle(newTitle?: string | Ref<string>, options: { restoreOnUnmount?: boolean } = {}) {
  if (!isBrowser) {
    const title = isRef(newTitle) ? newTitle : ref(newTitle || "");
    return { title, setTitle: noop };
  }

  const { restoreOnUnmount = false } = options;
  const originalTitle = document.title;
  const title = isRef(newTitle) ? newTitle : ref(newTitle || originalTitle);

  const setTitle = (value: string) => {
    title.value = value;
  };

  watch(
    title,
    value => {
      if (value) document.title = value;
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (restoreOnUnmount) {
      document.title = originalTitle;
    }
  });

  return { title, setTitle };
}

/**
 * 使用滚动位置
 * @param element 元素引用
 * @returns 滚动位置
 */
export function useScrollPosition(element?: Ref<HTMLElement | null | undefined>) {
  if (!isBrowser) {
    return {
      x: ref(0),
      y: ref(0),
      scrollTo: noop,
      scrollToTop: noop,
      scrollToBottom: noop,
    };
  }

  const x = ref(0);
  const y = ref(0);

  const update = () => {
    if (element?.value) {
      x.value = element.value.scrollLeft;
      y.value = element.value.scrollTop;
    } else {
      x.value = window.scrollX;
      y.value = window.scrollY;
    }
  };

  const scrollTo = (options: ScrollToOptions) => {
    if (element?.value) {
      element.value.scrollTo(options);
    } else {
      window.scrollTo(options);
    }
  };

  const scrollToTop = () => {
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    if (element?.value) {
      scrollTo({ top: element.value.scrollHeight, behavior: "smooth" });
    } else {
      scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  onMounted(() => {
    update();

    const target = element?.value ? element.value : window;
    target.addEventListener("scroll", update, { passive: true });
  });

  onUnmounted(() => {
    const target = element?.value ? element.value : window;
    target.removeEventListener("scroll", update);
  });

  return {
    x: readonly(x),
    y: readonly(y),
    scrollTo,
    scrollToTop,
    scrollToBottom,
  };
}

/**
 * 使用窗口焦点
 * @returns 窗口焦点状态
 */
export function useWindowFocus() {
  if (!isBrowser) {
    return { isFocused: ref(true) };
  }

  const isFocused = ref(document.hasFocus());

  const onFocus = () => {
    isFocused.value = true;
  };

  const onBlur = () => {
    isFocused.value = false;
  };

  onMounted(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
  });

  onUnmounted(() => {
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("blur", onBlur);
  });

  return { isFocused: readonly(isFocused) };
}

/**
 * 使用页面可见性
 * @returns 页面可见性状态
 */
export function usePageVisibility() {
  if (!isBrowser) {
    return { isVisible: ref(true), visibility: ref("visible") };
  }

  const isVisible = ref(document.visibilityState === "visible");
  const visibility = ref<DocumentVisibilityState>(document.visibilityState);

  const update = () => {
    visibility.value = document.visibilityState;
    isVisible.value = document.visibilityState === "visible";
  };

  onMounted(() => {
    document.addEventListener("visibilitychange", update);
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", update);
  });

  return {
    isVisible: readonly(isVisible),
    visibility: readonly(visibility),
  };
}

/**
 * 使用媒体查询
 * @param query 媒体查询
 * @returns 匹配状态
 */
export function useMediaQuery(query: string) {
  if (!isBrowser) {
    return ref(false);
  }

  const matches = ref(false);
  const mediaQuery = window.matchMedia(query);

  const update = () => {
    matches.value = mediaQuery.matches;
  };

  onMounted(() => {
    update();
    mediaQuery.addEventListener("change", update);
  });

  onUnmounted(() => {
    mediaQuery.removeEventListener("change", update);
  });

  return readonly(matches);
}

/**
 * 使用鼠标位置
 * @param options 选项
 * @returns 鼠标位置
 */
export function useMouse(
  options: {
    target?: Ref<HTMLElement | null | undefined>;
    touch?: boolean;
    resetOnTouchEnds?: boolean;
    initialValue?: { x: number; y: number };
  } = {},
) {
  const { target, touch = true, resetOnTouchEnds = false, initialValue = { x: 0, y: 0 } } = options;

  if (!isBrowser) {
    return {
      x: ref(initialValue.x),
      y: ref(initialValue.y),
      sourceType: ref<string | null>(null),
    };
  }

  const x = ref(initialValue.x);
  const y = ref(initialValue.y);
  const sourceType = ref<string | null>(null);

  const update = (event: Event) => {
    sourceType.value = "mouse";
    const mouseEvent = event as MouseEvent;
    if (target && unref(target)) {
      const targetElement = unref(target);
      const rect = targetElement!.getBoundingClientRect();
      x.value = mouseEvent.clientX - rect.left;
      y.value = mouseEvent.clientY - rect.top;
    } else {
      x.value = mouseEvent.clientX;
      y.value = mouseEvent.clientY;
    }
  };

  const updateTouchMove = (event: Event) => {
    sourceType.value = "touch";
    const touchEvent = event as TouchEvent;
    if (touchEvent.touches.length > 0) {
      const touch = touchEvent.touches[0];
      if (target && unref(target)) {
        const targetElement = unref(target);
        const rect = targetElement!.getBoundingClientRect();
        x.value = touch.clientX - rect.left;
        y.value = touch.clientY - rect.top;
      } else {
        x.value = touch.clientX;
        y.value = touch.clientY;
      }
    }
  };

  const reset = () => {
    x.value = initialValue.x;
    y.value = initialValue.y;
  };

  onMounted(() => {
    const element = target ? unref(target) : window;

    if (element) {
      element.addEventListener("mousemove", update);
      if (touch) {
        element.addEventListener("touchmove", updateTouchMove, { passive: true });
        if (resetOnTouchEnds) {
          element.addEventListener("touchend", reset);
        }
      }
    }
  });

  onUnmounted(() => {
    const element = target ? unref(target) : window;

    if (element) {
      element.removeEventListener("mousemove", update);
      if (touch) {
        element.removeEventListener("touchmove", updateTouchMove);
        if (resetOnTouchEnds) {
          element.removeEventListener("touchend", reset);
        }
      }
    }
  });

  return {
    x: readonly(x),
    y: readonly(y),
    sourceType: readonly(sourceType),
  };
}

/**
 * 使用 CSS 变量
 * @param targetRef 目标元素引用
 * @returns CSS 变量控制器
 */
export function useCssVar(targetRef: Ref<HTMLElement | null | undefined>) {
  if (!isBrowser) {
    return {
      set: noop,
      remove: noop,
      get: () => "",
      getAll: () => ({}),
    };
  }

  /**
   * 设置 CSS 变量
   * @param prop 变量名
   * @param value 变量值
   */
  const set = (prop: string, value: string) => {
    const target = unref(targetRef);
    if (target) {
      target.style.setProperty(prop, value);
    }
  };

  /**
   * 移除 CSS 变量
   * @param prop 变量名
   */
  const remove = (prop: string) => {
    const target = unref(targetRef);
    if (target) {
      target.style.removeProperty(prop);
    }
  };

  /**
   * 获取 CSS 变量值
   * @param prop 变量名
   * @returns 变量值
   */
  const get = (prop: string): string => {
    const target = unref(targetRef);
    if (!target) return "";

    return getComputedStyle(target).getPropertyValue(prop).trim();
  };

  /**
   * 获取全部 CSS 变量
   * @returns 所有变量
   */
  const getAll = (): Record<string, string> => {
    const target = unref(targetRef);
    if (!target) return {};

    const styles = getComputedStyle(target);
    const result: Record<string, string> = {};

    for (const prop of Array.from(styles)) {
      if (prop.startsWith("--")) {
        result[prop] = styles.getPropertyValue(prop).trim();
      }
    }

    return result;
  };

  return { set, remove, get, getAll };
}

/**
 * 使用深色模式
 * @param options 选项
 * @returns 深色模式控制器
 */
export function useDarkMode(
  options: {
    initialValue?: boolean;
    storageKey?: string;
    storage?: Storage;
    attribute?: string;
    value?: { dark: string; light: string };
  } = {},
) {
  const {
    initialValue = false,
    storageKey = "vueuse-dark-mode",
    storage = isBrowser ? localStorage : undefined,
    attribute = "data-theme",
    value = { dark: "dark", light: "light" },
  } = options;

  // 检查系统偏好
  const getSystemPreference = (): boolean => {
    if (!isBrowser) return initialValue;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  // 先从存储获取或使用系统偏好
  const getSavedValue = (): boolean => {
    try {
      if (!storage) return getSystemPreference();
      const saved = storage.getItem(storageKey);
      return saved ? JSON.parse(saved) : getSystemPreference();
    } catch {
      return getSystemPreference();
    }
  };

  const isDark = ref(getSavedValue());

  // 设置主题
  const updateHtml = (dark: boolean) => {
    if (!isBrowser) return;
    document.documentElement.setAttribute(attribute, dark ? value.dark : value.light);
  };

  // 切换主题
  const toggle = () => {
    isDark.value = !isDark.value;
  };

  watch(
    isDark,
    dark => {
      updateHtml(dark);
      if (storage) {
        storage.setItem(storageKey, JSON.stringify(dark));
      }
    },
    { immediate: true },
  );

  if (isBrowser) {
    // 监听系统主题变化
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      isDark.value = mediaQuery.matches;
    };

    onMounted(() => {
      updateHtml(isDark.value);
      mediaQuery.addEventListener("change", onSystemChange);
    });

    onUnmounted(() => {
      mediaQuery.removeEventListener("change", onSystemChange);
    });
  }

  return {
    isDark: readonly(isDark),
    toggle,
  };
}

// 更多钩子
export const useEventListener = <T extends Window | Document | HTMLElement | Element>(
  target: Ref<T | null | undefined> | T,
  event: string,
  handler: (event: any) => void,
  options?: boolean | AddEventListenerOptions,
) => {
  if (!isBrowser) return;

  onMounted(() => {
    const el = unref(target);
    if (!el) return;

    el.addEventListener(event, handler, options);
  });

  onUnmounted(() => {
    const el = unref(target);
    if (!el) return;

    el.removeEventListener(event, handler, options);
  });
};

// 导出所有钩子
export const hookUtils = {
  useDebounce,
  useThrottle,
  useStorage,
  useWindowSize,
  useBreakpoints,
  useClickOutside,
  useAsync,
  useCounter,
  useInterval,
  useNetwork,
  useGeolocation,
  useTitle,
  useScrollPosition,
  useWindowFocus,
  usePageVisibility,
  useMediaQuery,
  useMouse,
  useCssVar,
  useDarkMode,
  useEventListener,
};

export default hookUtils;
