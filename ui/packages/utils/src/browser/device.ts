/**
 * 获取设备类型
 */
export const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

/**
 * 检测是否支持触摸
 */
export const isTouchDevice = (): boolean => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

/**
 * 检测是否为 iOS 设备
 */
export const isIOS = (): boolean => {
  return (
    /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

/**
 * 检测是否为安卓设备
 */
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

/**
 * 获取设备方向
 */
export const getOrientation = (): "portrait" | "landscape" => {
  return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
};

export const deviceUtils = {
  getDeviceType,
  isTouchDevice,
  isIOS,
  isAndroid,
  getOrientation,
} as const;

export default deviceUtils;
