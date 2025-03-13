export { copyText, copyImage, readText, readImage, checkPermission as clipboardCheckPermission } from "./clipboard";

export { get as cookieGet, set as cookieSet, remove as cookieRemove } from "./cookie";

export { getDeviceType, isTouchDevice, isIOS, isAndroid, getOrientation } from "./device";

export { hasClass, addClass, removeClass, toggleClass } from "./dom";

export { getFileExt, formatFileSize, downloadFile, readLocalFile } from "./file";

export {
  getDeviceInfo,
  getBrowserFeatures,
  getCanvasFingerprint,
  getAudioFingerprint,
  generateFingerprint,
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

export { get as storageGet, set as storageSet, remove as storageRemove, clear as storageClear } from "./storage";

export { getParams as urlGetParams, stringifyParams, addParams, removeParams, parse, isAbsolute, join } from "./url";
