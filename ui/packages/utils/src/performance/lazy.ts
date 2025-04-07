/**
 * 延迟加载工具
 */

/**
 * 延迟加载选项
 */
export interface LazyLoadOptions {
  /**
   * 延迟时间（毫秒）
   */
  delay?: number;

  /**
   * 是否使用 requestIdleCallback 进行加载
   */
  useIdleCallback?: boolean;

  /**
   * 加载超时时间（毫秒）
   * 只在使用 requestIdleCallback 时有效
   */
  timeout?: number;

  /**
   * 加载前回调
   */
  onBeforeLoad?: () => void;

  /**
   * 加载成功回调
   */
  onSuccess?: (result: any) => void;

  /**
   * 加载失败回调
   */
  onError?: (error: Error) => void;
}

/**
 * 延迟加载结果
 */
export interface LazyLoadResult<T> {
  /**
   * 加载状态
   */
  loading: boolean;

  /**
   * 加载结果
   */
  result?: T;

  /**
   * 加载错误
   */
  error?: Error;

  /**
   * 手动触发加载
   */
  load: () => Promise<T>;

  /**
   * 取消加载
   */
  cancel: () => void;
}

/**
 * 判断当前环境是否支持 requestIdleCallback
 */
const hasRequestIdleCallback = typeof window !== "undefined" && "requestIdleCallback" in window;

/**
 * 创建一个延迟加载函数
 * @param factory 加载工厂函数，返回要加载的内容
 * @param options 延迟加载选项
 * @returns 延迟加载结果对象
 */
export function createLazyLoad<T>(factory: () => T | Promise<T>, options: LazyLoadOptions = {}): LazyLoadResult<T> {
  const { delay = 0, useIdleCallback = false, timeout = 2000, onBeforeLoad, onSuccess, onError } = options;

  let loading = false;
  let result: T | undefined;
  let error: Error | undefined;
  let timer: number | null = null;
  let idleCallbackId: number | null = null;

  // 加载函数
  const load = async (): Promise<T> => {
    // 如果已经加载完成，直接返回结果
    if (result) {
      return result;
    }

    // 如果正在加载中，返回 Promise
    if (loading) {
      return new Promise<T>((resolve, reject) => {
        const checkResult = () => {
          if (result) {
            resolve(result);
          } else if (error) {
            reject(error);
          } else {
            setTimeout(checkResult, 100);
          }
        };
        checkResult();
      });
    }

    // 开始加载
    loading = true;

    // 调用加载前回调
    onBeforeLoad?.();

    try {
      // 执行工厂函数并等待结果
      const factoryResult = factory();
      result = factoryResult instanceof Promise ? await factoryResult : factoryResult;

      // 调用成功回调
      onSuccess?.(result);

      loading = false;
      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));

      // 调用错误回调
      onError?.(error);

      loading = false;
      throw error;
    }
  };

  // 取消加载
  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }

    if (idleCallbackId !== null && hasRequestIdleCallback) {
      window.cancelIdleCallback(idleCallbackId);
      idleCallbackId = null;
    }

    loading = false;
  };

  // 返回延迟加载结果对象
  const lazyLoadResult: LazyLoadResult<T> = {
    get loading() {
      return loading;
    },
    get result() {
      return result;
    },
    get error() {
      return error;
    },
    load,
    cancel,
  };

  return lazyLoadResult;
}

/**
 * 延迟加载组件或模块
 * @param factory 加载工厂函数，返回要加载的组件或模块
 * @param options 延迟加载选项
 * @returns 延迟加载的组件或模块
 */
export function lazyLoad<T>(factory: () => Promise<T>, options: LazyLoadOptions = {}): () => Promise<T> {
  const { delay = 0, useIdleCallback = false, timeout = 2000 } = options;

  let loadPromise: Promise<T> | null = null;

  return () => {
    // 如果已经有加载 Promise，直接返回
    if (loadPromise) {
      return loadPromise;
    }

    // 创建加载 Promise
    loadPromise = new Promise<T>((resolve, reject) => {
      const startLoad = () => {
        try {
          // 执行工厂函数并返回结果
          factory()
            .then(component => {
              options.onSuccess?.(component);
              resolve(component);
            })
            .catch(err => {
              options.onError?.(err);
              reject(err);
            });
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          options.onError?.(error);
          reject(error);
        }
      };

      // 调用加载前回调
      options.onBeforeLoad?.();

      // 根据选项决定如何延迟加载
      if (useIdleCallback && hasRequestIdleCallback) {
        // 使用 requestIdleCallback 在浏览器空闲时加载
        window.requestIdleCallback(() => startLoad(), { timeout });
      } else if (delay > 0) {
        // 使用 setTimeout 延迟加载
        setTimeout(startLoad, delay);
      } else {
        // 直接加载
        startLoad();
      }
    });

    return loadPromise;
  };
}

/**
 * 图片延迟加载
 * @param src 图片源地址
 * @param options 延迟加载选项
 * @returns 图片加载 Promise
 */
export function lazyLoadImage(
  src: string,
  options: LazyLoadOptions & {
    crossOrigin?: boolean | string;
    width?: number;
    height?: number;
  } = {},
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // 设置尺寸（如果提供）
    if (options.width) img.width = options.width;
    if (options.height) img.height = options.height;

    // 设置跨域属性
    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin === true ? "anonymous" : options.crossOrigin;
    }

    // 设置加载事件
    img.onload = () => {
      options.onSuccess?.(img);
      resolve(img);
    };

    img.onerror = e => {
      const error = new Error(`Failed to load image: ${src}`);
      options.onError?.(error);
      reject(error);
    };

    // 调用加载前回调
    options.onBeforeLoad?.();

    // 延迟设置 src 以触发加载
    if (options.delay && options.delay > 0) {
      setTimeout(() => {
        img.src = src;
      }, options.delay);
    } else {
      img.src = src;
    }
  });
}

/**
 * 资源延迟加载工厂
 * 可用于延迟加载 CSS、JavaScript 等资源
 */
export const lazyResource = {
  /**
   * 延迟加载 CSS 文件
   * @param href CSS 文件 URL
   * @param options 加载选项
   * @returns Promise
   */
  css: (
    href: string,
    options: LazyLoadOptions & {
      id?: string;
      rel?: string;
      media?: string;
    } = {},
  ): Promise<HTMLLinkElement> => {
    return new Promise((resolve, reject) => {
      // 检查是否已经加载过该样式
      const id = options.id || `lazy-css-${href.replace(/[^\w]/g, "")}`;
      if (document.getElementById(id)) {
        resolve(document.getElementById(id) as HTMLLinkElement);
        return;
      }

      // 创建 link 标签
      const link = document.createElement("link");
      link.rel = options.rel || "stylesheet";
      link.id = id;

      if (options.media) {
        link.media = options.media;
      }

      // 设置加载事件
      link.onload = () => {
        options.onSuccess?.(link);
        resolve(link);
      };

      link.onerror = () => {
        const error = new Error(`Failed to load CSS: ${href}`);
        options.onError?.(error);
        reject(error);
      };

      // 调用加载前回调
      options.onBeforeLoad?.();

      // 延迟加载
      if (options.delay && options.delay > 0) {
        setTimeout(() => {
          link.href = href;
          document.head.appendChild(link);
        }, options.delay);
      } else {
        link.href = href;
        document.head.appendChild(link);
      }
    });
  },

  /**
   * 延迟加载 JavaScript 文件
   * @param src JavaScript 文件 URL
   * @param options 加载选项
   * @returns Promise
   */
  script: (
    src: string,
    options: LazyLoadOptions & {
      id?: string;
      async?: boolean;
      defer?: boolean;
      type?: string;
    } = {},
  ): Promise<HTMLScriptElement> => {
    return new Promise((resolve, reject) => {
      // 检查是否已经加载过该脚本
      const id = options.id || `lazy-script-${src.replace(/[^\w]/g, "")}`;
      if (document.getElementById(id)) {
        resolve(document.getElementById(id) as HTMLScriptElement);
        return;
      }

      // 创建 script 标签
      const script = document.createElement("script");
      script.id = id;

      if (options.async !== false) script.async = true;
      if (options.defer) script.defer = true;
      if (options.type) script.type = options.type;

      // 设置加载事件
      script.onload = () => {
        options.onSuccess?.(script);
        resolve(script);
      };

      script.onerror = () => {
        const error = new Error(`Failed to load script: ${src}`);
        options.onError?.(error);
        reject(error);
      };

      // 调用加载前回调
      options.onBeforeLoad?.();

      // 延迟加载
      if (options.delay && options.delay > 0) {
        setTimeout(() => {
          script.src = src;
          document.head.appendChild(script);
        }, options.delay);
      } else {
        script.src = src;
        document.head.appendChild(script);
      }
    });
  },
};
