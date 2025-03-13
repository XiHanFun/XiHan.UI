import type { App, Plugin } from "vue";

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
export function createPlugin(options: PluginOptions = {}): Plugin {
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
