/**
 * Navigator 工具集
 * 封装浏览器 Navigator API 的常用功能
 */

/**
 * 获取浏览器语言
 * @returns 返回浏览器语言
 */
export const getLanguage = (): string => {
  return window.navigator.language;
};

/**
 * 检查是否在线
 * @returns 返回是否在线
 */
export const isOnline = (): boolean => {
  return window.navigator.onLine;
};

/**
 * 添加网络状态变化监听器
 * @param onlineCallback 在线回调
 * @param offlineCallback 离线回调
 * @returns 用于移除监听器的函数
 */
export const addNetworkListeners = (onlineCallback: () => void, offlineCallback: () => void): (() => void) => {
  window.addEventListener("online", onlineCallback);
  window.addEventListener("offline", offlineCallback);

  return () => {
    window.removeEventListener("online", onlineCallback);
    window.removeEventListener("offline", offlineCallback);
  };
};

/**
 * 检查是否为移动设备
 * @returns 返回是否为移动设备
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
};

/**
 * 获取浏览器信息
 * @returns 返回浏览器信息
 */
export const getInfo = (): {
  name: string;
  version: string;
  userAgent: string;
  platform: string;
  language: string;
  vendor: string;
} => {
  const ua = window.navigator.userAgent;
  const browserRegExp = {
    Chrome: /Chrome/,
    Firefox: /Firefox/,
    Safari: /Safari/,
    Edge: /Edge/,
    IE: /MSIE|Trident/,
    Opera: /Opera|OPR/,
  };

  const browser = Object.entries(browserRegExp).find(([_, regexp]) => regexp.test(ua))?.[0] || "Unknown";
  const version = ua.match(new RegExp(`${browser}\\/(\\d+)`))?.[1] || "Unknown";

  return {
    name: browser,
    version,
    userAgent: ua,
    platform: window.navigator.platform,
    language: window.navigator.language,
    vendor: window.navigator.vendor,
  };
};

/**
 * 获取用户代理信息
 * @returns 用户代理字符串
 */
export const getUserAgent = (): string => {
  return navigator.userAgent;
};

/**
 * 检查浏览器功能支持
 */
export const supports = {
  touch: () => "ontouchstart" in window,

  webGL: () => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  },
  webP: async () => {
    const webP = new Image();
    webP.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
    return new Promise(resolve => {
      webP.onload = webP.onerror = () => resolve(webP.height === 1);
    });
  },
};

/**
 * 检查浏览器的硬件并发数 (CPU 核心数)
 * @returns CPU 核心数，如果不支持则返回默认值
 */
export const getHardwareConcurrency = (defaultValue: number = 4): number => {
  return navigator.hardwareConcurrency || defaultValue;
};

/**
 * 检查 Service Worker 是否受支持
 * @returns 是否支持 Service Worker
 */
export const isServiceWorkerSupported = (): boolean => {
  return "serviceWorker" in navigator;
};

/**
 * 注册 Service Worker
 * @param scriptURL Service Worker 脚本 URL
 * @param options 注册选项
 * @returns Promise 包含注册结果
 */
export const registerServiceWorker = async (
  scriptURL: string,
  options?: RegistrationOptions,
): Promise<ServiceWorkerRegistration | null> => {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register(scriptURL, options);
  } catch (error) {
    console.error("Service Worker 注册失败:", error);
    return null;
  }
};

/**
 * 获取当前活跃的 Service Worker 注册
 * @returns Promise 包含 Service Worker 注册结果
 */
export const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error("获取 Service Worker 注册失败:", error);
    return null;
  }
};

/**
 * 检查 Web Worker 是否受支持
 * @returns 是否支持 Web Worker
 */
export const isWebWorkerSupported = (): boolean => {
  return typeof Worker !== "undefined";
};

/**
 * 检查 Shared Worker 是否受支持
 * @returns 是否支持 Shared Worker
 */
export const isSharedWorkerSupported = (): boolean => {
  return typeof SharedWorker !== "undefined";
};

/**
 * 获取地理位置
 * @param options 地理位置选项
 * @returns Promise 包含地理位置信息
 */
export const getGeolocation = (options?: PositionOptions): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("浏览器不支持地理位置"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

/**
 * 监听地理位置变化
 * @param successCallback 成功回调
 * @param errorCallback 错误回调
 * @param options 地理位置选项
 * @returns 位置监听器ID，用于取消监听
 */
export const watchGeolocation = (
  successCallback: PositionCallback,
  errorCallback?: PositionErrorCallback,
  options?: PositionOptions,
): number => {
  if (!navigator.geolocation) {
    if (errorCallback) {
      errorCallback({
        code: 2,
        message: "浏览器不支持地理位置",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    }
    return -1;
  }

  return navigator.geolocation.watchPosition(successCallback, errorCallback, options);
};

/**
 * 取消地理位置监听
 * @param watchId 位置监听器ID
 */
export const clearGeolocationWatch = (watchId: number): void => {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// 同时提供命名空间对象
export const navigatorUtils = {
  getLanguage,
  isOnline,
  addNetworkListeners,
  isMobile,
  getInfo,
  getUserAgent,
  supports,
  getHardwareConcurrency,
  isServiceWorkerSupported,
  registerServiceWorker,
  getServiceWorkerRegistration,
  isWebWorkerSupported,
  isSharedWorkerSupported,
  getGeolocation,
  watchGeolocation,
  clearGeolocationWatch,
};

// 默认导出命名空间对象
export default navigatorUtils;
