/**
 * 获取屏幕尺寸
 * @returns 返回屏幕尺寸
 */
export const getSize = () => {
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    pixelRatio: window.devicePixelRatio,
  };
};

/**
 * 获取视口尺寸
 * @returns 返回视口尺寸
 */
export const getViewport = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  };
};

/**
 * 滚动到顶部
 * @returns 返回滚动到顶部的结果
 */
export const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

/**
 * 检查是否为视网膜屏幕
 * @returns 返回是否为视网膜屏幕
 */
export const isRetina = (): boolean => {
  return window.devicePixelRatio >= 2;
};

/**
 * 检查元素是否在视口中
 * @param element 需要检查的元素
 * @returns 返回是否在视口中
 */
export const isInViewport = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
};

/**
 * 监听屏幕方向变化
 * @param callback 回调函数
 * @returns 返回取消监听的函数
 */
export const onOrientationChange = (callback: (isPortrait: boolean) => void): (() => void) => {
  const handler = () => {
    callback(window.innerHeight > window.innerWidth);
  };
  window.addEventListener("orientationchange", handler);
  return () => window.removeEventListener("orientationchange", handler);
};

export const screenUtils = {
  getSize,
  getViewport,
  scrollToTop,
  isRetina,
  isInViewport,
  onOrientationChange,
} as const;

export default screenUtils;
