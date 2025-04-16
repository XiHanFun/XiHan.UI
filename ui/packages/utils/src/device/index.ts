// Bluetooth 导出
export {
  isBluetoothSupported,
  BluetoothDevice,
  createBluetoothDevice,
  scanBluetoothDevices,
  connectBLE,
} from "./bluetooth";

// Clipboard 导出
export { copyText, copyImage, readText, readImage, checkPermission } from "./clipboard";

// Device 导出
export { getDeviceType, isTouchDevice, isIOS, isAndroid, getOrientation } from "./device";
export type { DeviceType } from "./device";

// Fingerprint 导出
export {
  getDeviceInfo as getFingerprintDeviceInfo,
  getBrowserFeatures,
  getInstalledFonts,
  getCanvasFingerprint,
  getAudioFingerprint,
  getNetworkFingerprint,
  getBehavioralFingerprint,
  generateFingerprint,
  generateStableFingerprint,
} from "./fingerprint";

// Navigator 导出
export {
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
} from "./navigator";

// Network 导出
export { getStatus as getNetworkStatus, onChange as onNetworkChange, checkSpeed as checkNetworkSpeed } from "./network";

// Mouse 导出
export {
  getPosition,
  getPagePosition,
  getRelativePosition,
  onMouseMove,
  isRightClick,
  preventRightClick,
  getButton,
  onDoubleClick,
  onHover,
} from "./mouse";

// Notification 导出
export {
  checkPermission as checkNotificationPermission,
  show as showNotification,
  showSimple as showSimpleNotification,
  closeAll as closeAllNotifications,
} from "./notification";

// Screen 导出
export {
  getSize as getScreenSize,
  getViewport,
  scrollToTop as scrollToTopScreen,
  isRetina,
  isInViewport,
  onOrientationChange,
} from "./screen";

// Vibration 导出
export {
  vibrate,
  stopVibration,
  createPattern,
  vibrateWithRhythm,
  createVibrationManager,
  defaultVibrationManager,
} from "./vibration";
