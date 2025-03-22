import type { App } from "vue";

/**
 * 插件选项
 */
export interface PluginOptions {
  prefix?: string;
  zIndex?: number;
  locale?: string;
}

/**
 * 创建插件
 * @param options - 插件选项
 * @returns 返回插件
 */
export const createPlugin = (options: PluginOptions = {}) => {
  return {
    install(app: App) {
      // 注入全局配置
      app.config.globalProperties.$XIHAN = {
        zIndex: options.zIndex || 2000,
        locale: options.locale || "zh-CN",
      };
    },
  };
};

/**
 * 创建异步插件
 * @param options - 插件选项
 * @returns 返回异步插件
 */
export const createAsyncPlugin = (options: PluginOptions = {}) => {
  return {
    async install(app: App) {
      // 注入全局配置
      app.config.globalProperties.$XIHAN = {
        zIndex: options.zIndex || 2000,
        locale: options.locale || "zh-CN",
      };
    },
  };
};
