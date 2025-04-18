/**
 * 设备处理工具函数
 */

/**
 * 设备类型
 */
export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * 获取设备类型
 */
export function getDeviceType(): DeviceType {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

/**
 * 检测是否支持触摸
 */
export function isTouchDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * 检测是否为 iOS 设备
 */
export function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * 检测是否为安卓设备
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * 获取设备方向
 */
export function getOrientation(): "portrait" | "landscape" {
  return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
}
