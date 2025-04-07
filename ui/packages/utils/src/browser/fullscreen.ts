/**
 * 进入全屏
 * @param element 要全屏显示的元素，默认为 document.documentElement
 */
export const enter = async (element: Element = document.documentElement): Promise<void> => {
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    await (element as any).webkitRequestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    await (element as any).mozRequestFullScreen();
  } else if ((element as any).msRequestFullscreen) {
    await (element as any).msRequestFullscreen();
  }
};

/**
 * 退出全屏
 */
export const exit = async (): Promise<void> => {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    await (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    await (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    await (document as any).msExitFullscreen();
  }
};

/**
 * 切换全屏状态
 * @param element 要全屏显示的元素
 */
export const toggle = async (element: Element = document.documentElement): Promise<void> => {
  if (isFullscreen()) {
    await exit();
  } else {
    await enter(element);
  }
};

/**
 * 判断是否处于全屏状态
 */
export const isFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};

/**
 * 监听全屏状态变化
 * @param callback 回调函数
 */
export const onChange = (callback: (isFullscreen: boolean) => void): (() => void) => {
  const handler = () => callback(isFullscreen());
  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);
  document.addEventListener("mozfullscreenchange", handler);
  document.addEventListener("MSFullscreenChange", handler);

  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler);
    document.removeEventListener("mozfullscreenchange", handler);
    document.removeEventListener("MSFullscreenChange", handler);
  };
};

// 同时提供命名空间对象
export const fullscreenUtils = {
  enter,
  exit,
  toggle,
  isFullscreen,
  onChange,
};

// 默认导出命名空间对象
export default fullscreenUtils;
