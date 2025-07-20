// Cookie 导出
export {
  get as getCookie,
  set as setCookie,
  remove as removeCookie,
  clear as clearCookie,
  getAll as getAllCookie,
  has as hasCookie,
} from "./cookie";
export type { CookieOptions } from "./cookie";

// Credentials 导出
export { createPasswordCredential, createFederatedCredential } from "./credentials";
export type { CredentialType, PasswordCredentialOptions, FederatedCredentialOptions } from "./credentials";

// Fullscreen 导出
export {
  enter as enterFullscreen,
  exit as exitFullscreen,
  toggle as toggleFullscreen,
  isFullscreen,
  onChange as onFullscreenChange,
} from "./fullscreen";

// History 导出
export { back, forward, go, push, remove as removeHistory, replace } from "./history";

// IndexedDB 导出
export { createIndexedDBStorage } from "./indexedDB";
export type { IDBConfig } from "./indexedDB";

// Location 导出
export { getParams as getLocationParams, getParamByName, goto, reload } from "./location";

// Storage 导出
export {
  get as getStorage,
  set as setStorage,
  remove as removeStorage,
  clear as clearStorage,
  getAll as getAllStorage,
  StorageType,
} from "./storage";
export type { StorageOptions } from "./storage";

// Share 导出
export {
  isShareSupported,
  isFileShareSupported,
  canShare,
  share,
  shareText,
  shareUrl,
  shareCurrentPage,
  shareImage,
  shareFiles,
  shareCanvas,
  shareFallback,
  smartShare,
} from "./share";
export type { ShareData } from "./share";

// URL 导出
export {
  getParams as getUrlParams,
  stringifyParams,
  addParams,
  removeParams,
  parse as parseUrl,
  isAbsolute,
  join as joinUrl,
} from "./url";

// WebAssembly 导出
export { wasmManager, loadWasmModule, createWasmHelper } from "./webassembly";
export type { WasmModuleDescriptor, WasmModuleInfo, WasmProgressEvent } from "./webassembly";

// WebRTC 导出
export {
  checkWebRTCSupport,
  createRTCConnection,
  createPeerConnection,
  createDataChannel,
  createWebSocketSignaling,
  getDefaultIceServers,
  createSimplePeer,
} from "./webrtc";
export type { RTCConnectionConfig, SignalingChannel, RTCConnectionEvents, DataChannelOptions } from "./webrtc";

// Worker 导出
export { createWorker, createWorkerPool, isWorkerSupported, createInlineWorker } from "./worker";
export type {
  WorkerOptions,
  WorkerMessageHandler,
  WorkerErrorHandler,
  TaskExecutor,
  WorkerPoolOptions,
} from "./worker";
