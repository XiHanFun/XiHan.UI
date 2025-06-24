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
export type { InstallOptions } from "./install";

// 监听系统
export { watchDebounced, watchThrottled, watchWhen } from "./watch";

// 选项式API
export { themeMixin, sizeMixin, disabledMixin } from "./mixins";
