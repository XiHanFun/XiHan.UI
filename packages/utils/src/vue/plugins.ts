import type { App, Plugin } from "vue";

export interface PluginOptions {
  prefix?: string;
  zIndex?: number;
  locale?: string;
}

/**
 * 创建插件
 */
export function createPlugin(options: PluginOptions = {}): Plugin {
  return {
    install(app: App) {
      // 注入全局配置
      app.config.globalProperties.$XIHAN = {
        zIndex: options.zIndex || 2000,
        locale: options.locale || "zh-CN",
      };

      // 注入主题
      app.provide("theme", {
        mode: "light",
        setMode: (mode: string) => {
          document.documentElement.setAttribute("data-theme", mode);
        },
      });
    },
  };
}
