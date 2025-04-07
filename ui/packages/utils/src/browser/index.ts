export { copyText, copyImage, readText, readImage, checkPermission as clipboardCheckPermission } from "./clipboard";
export { getDeviceType, isTouchDevice, isIOS, isAndroid, getOrientation } from "./device";
export { getFileExt, formatFileSize, downloadFile, readLocalFile } from "./file";
export {
  getDeviceInfo,
  getBrowserFeatures,
  getInstalledFonts,
  getCanvasFingerprint,
  getAudioFingerprint,
  getNetworkFingerprint,
  getBehavioralFingerprint,
  generateFingerprint,
  generateStableFingerprint,
} from "./fingerprint";
export { enter, exit, toggle, isFullscreen, onChange as fullscreenOnChange } from "./fullscreen";
export { back, forward, go, push, remove as historyRemove, replace } from "./history";
export { preload, preloadAll, isLoaded, getDominantColor, compress } from "./image";
export { getParams as locationGetParams, getParamByName, goto, reload } from "./location";
export {
  getPosition,
  getPagePosition,
  getRelativePosition,
  onMouseMove,
  isRightClick,
  preventRightClick,
  onDoubleClick,
  onHover,
} from "./mouse";
export { getLanguage, isOnline, isMobile as navigatorIsMobile, getInfo, supports } from "./navigator";
export { getStatus, onChange as networkOnChange, checkSpeed } from "./network";
export { checkPermission as notificationCheckPermission, show, showSimple, closeAll } from "./notification";
export { getSize, getViewport, scrollToTop, isRetina, isInViewport, onOrientationChange } from "./screen";
export { getParams as urlGetParams, stringifyParams, addParams, removeParams, parse, isAbsolute, join } from "./url";
export { get as cookieGet, set as cookieSet, remove as cookieRemove } from "./cookie";
export { get as storageGet, set as storageSet, remove as storageRemove, clear as storageClear } from "./storage";
export type { StorageType } from "./storage";

export { createIndexedDBStorage } from "./indexedDB";
export type { IDBConfig } from "./indexedDB";

export { createWorker, createWorkerPool, createInlineWorker, isWorkerSupported } from "./worker";
export type {
  WorkerOptions,
  WorkerMessageHandler,
  WorkerErrorHandler,
  WorkerPoolOptions,
  TaskExecutor,
} from "./worker";

// 其他模块导出
export * from "./audio";
export * from "./video";
export * from "./webrtc";
export * from "./bluetooth";
export * from "./vibration";
export * from "./compression";
export * from "./conversion";
export * from "./streaming";
export * from "./zip";
export * from "./share";
export * from "./payment";
export * from "./credentials";
export * from "./webassembly";
export * from "./webgpu";

import * as clipboard from "./clipboard";
import * as compression from "./compression";
import * as conversion from "./conversion";
import * as device from "./device";
import * as fullscreen from "./fullscreen";
import * as history from "./history";
import * as image from "./image";
import * as location from "./location";
import * as mouse from "./mouse";
import * as navigator from "./navigator";
import * as network from "./network";
import * as notification from "./notification";
import * as screen from "./screen";
import * as url from "./url";
import * as cookie from "./cookie";
import * as storage from "./storage";
import * as indexedDB from "./indexedDB";
import * as worker from "./worker";
import * as audio from "./audio";
import * as video from "./video";
import * as webrtc from "./webrtc";
import * as bluetooth from "./bluetooth";
import * as vibration from "./vibration";
import * as file from "./file";
import * as zip from "./zip";
import * as share from "./share";
import * as payment from "./payment";
import * as credentials from "./credentials";
import * as webassembly from "./webassembly";
import * as webgpu from "./webgpu";

// 默认导出命名空间对象
export const browser = {
  clipboard,
  compression,
  conversion,
  device,
  fullscreen,
  history,
  image,
  location,
  mouse,
  navigator,
  network,
  notification,
  screen,
  url,
  cookie,
  storage,
  indexedDB,
  worker,
  audio,
  video,
  webrtc,
  bluetooth,
  vibration,
  file,
  zip,
  share,
  payment,
  credentials,
  webassembly,
  webgpu,
};

// 默认导出命名空间对象
export default browser;
