// 基础工具
export { createAsyncComponent } from "./utils";

// 安装系统
export {
  makeInstaller,
  makeAsyncInstaller,
  makeComponentInstaller,
  registerComponents,
  registerDirectives,
  registerPlugins,
} from "./install";

// 组合式API
export {
  useDebounce,
  useThrottle,
  useStorage,
  useWindowSize,
  useClickOutside,
  useAsync,
  useCounter,
  useInterval,
  useNetwork,
} from "./hooks";
export type { AsyncState } from "./hooks";

// 监听系统
export { watchDebounced, watchThrottled, watchWhen } from "./watch";

// 选项式API
export { themeMixin, sizeMixin, disabledMixin } from "./mixins";

// 插件系统
export { createPlugin, createAsyncPlugin } from "./plugins";

// 指令系统
export { vClickOutside, vDebounce, vCopy, vLoading, vFocus, vResize } from "./directives";

// 状态管理辅助
export {
  createLocalState,
  createSessionState,
  createContextState,
  piniaPersistedState,
  defineSharedStore,
  useStoreRefs,
  useDerivedState,
} from "./store";

// 服务端渲染辅助
export {
  isServer,
  isClient,
  useServerPrefetch,
  useClientOnly,
  createHydrationContext,
  useDeferredHydration,
  useProgressiveHydration,
  withTimeout,
  useSSRMetadata,
} from "./ssr";

// Teleport 辅助
export {
  TeleportTargetManager,
  useTeleportTarget,
  ModalManager,
  useModal,
  useDynamicTeleport,
  createPopover,
} from "./teleport";

// Suspense 辅助
export {
  useAsyncComponent,
  useSuspenseWrapper,
  createLazyComponent,
  createErrorBoundary,
  withSuspense,
} from "./suspense";
