import type { App } from "vue";

/**
 * 插件选项
 */
export interface PluginOptions {
  /** 插件前缀 */
  prefix?: string;
  /** z-index 起始值 */
  zIndex?: number;
  /** 默认语言 */
  locale?: string;
}

/**
 * 创建插件
 * @param options - 插件选项
 * @returns 返回插件
 */
export function createPlugin(options: PluginOptions = {}) {
  return {
    install(app: App) {
      // 注入全局配置
      app.config.globalProperties.$XIHAN = {
        zIndex: options.zIndex || 2000,
        locale: options.locale || "zh-CN",
      };
    },
  };
}

/**
 * 创建异步插件
 * @param options - 插件选项
 * @returns 返回异步插件
 */
export function createAsyncPlugin(options: PluginOptions = {}) {
  return {
    async install(app: App) {
      // 注入全局配置
      app.config.globalProperties.$XIHAN = {
        zIndex: options.zIndex || 2000,
        locale: options.locale || "zh-CN",
      };
    },
  };
}

/**
 * 创建组合式插件
 * @param options - 插件选项
 * @returns 返回组合式插件
 */
export function createComposablePlugin(options: PluginOptions = {}) {
  const plugin = createPlugin(options);

  return {
    ...plugin,
    usePlugin() {
      return {
        zIndex: options.zIndex || 2000,
        locale: options.locale || "zh-CN",
      };
    },
  };
}

/**
 * 创建异步组合式插件
 * @param options - 插件选项
 * @returns 返回异步组合式插件
 */
export function createAsyncComposablePlugin(options: PluginOptions = {}) {
  const plugin = createAsyncPlugin(options);

  return {
    ...plugin,
    async usePlugin() {
      return {
        zIndex: options.zIndex || 2000,
        locale: options.locale || "zh-CN",
      };
    },
  };
}
