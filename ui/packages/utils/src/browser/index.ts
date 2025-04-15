/**
 * 浏览器相关工具
 */

// 音频处理
export * from "./audio";

// 蓝牙设备
export * from "./bluetooth";

// 剪贴板操作
export { copyText, copyImage, readText, readImage, checkPermission as checkClipboardPermission } from "./clipboard";

// 数据压缩
export * from "./compression";

// 数据转换
export * from "./conversion";

// Cookie 操作
export { get as getCookie, set as setCookie, remove as removeCookie } from "./cookie";

// 凭证管理
export * from "./credentials";

// 设备信息
export * from "./device";

// 文件操作
export * from "./file";

// 指纹识别
export * from "./fingerprint";

// 全屏控制
export {
  enter as enterFullscreen,
  exit as exitFullscreen,
  toggle as toggleFullscreen,
  isFullscreen,
  onChange as onFullscreenChange,
} from "./fullscreen";

// 历史记录
export {
  back as historyBack,
  forward as historyForward,
  go as historyGo,
  push as historyPush,
  replace as historyReplace,
} from "./history";

// 图片处理
export * from "./image";

// IndexedDB 操作
export * from "./indexedDB";

// 位置信息
export {
  getParams as getLocationParams,
  getParamByName as getLocationParamByName,
  goto as gotoLocation,
  reload as reloadLocation,
} from "./location";

// 鼠标事件
export * from "./mouse";

// 导航器信息
export * from "./navigator";

// 网络状态
export * from "./network";

// 通知管理
export {
  show as showNotification,
  showSimple as showSimpleNotification,
  closeAll as closeAllNotifications,
  checkPermission as checkNotificationPermission,
} from "./notification";

// 支付处理
export * from "./payment";

// 屏幕信息
export * from "./screen";

// 分享功能
export * from "./share";

// 存储操作
export { get as getStorage, set as setStorage, remove as removeStorage, clear as clearStorage } from "./storage";

// 流媒体处理
export * from "./streaming";

// URL 处理
export * from "./url";

// 振动控制
export * from "./vibration";

// 视频处理
export * from "./video";

// WebAssembly 支持
export * from "./webassembly";

// WebRTC 支持
export * from "./webrtc";

// Web Worker 支持
export * from "./worker";

// ZIP 压缩
export * from "./zip";
