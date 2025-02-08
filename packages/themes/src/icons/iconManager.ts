import type { App } from "vue";
import type { IconConfig, IconRegisterOptions, IconSet, IconComponent } from "./types";
import * as Icons from "./components";

class IconManager {
  private icons: IconSet = {};
  private config: IconConfig = {
    defaultSize: "medium",
    defaultTheme: "outline",
    defaultColor: "currentColor",
    prefix: "xh-icon",
  };

  constructor() {
    // 自动注册所有图标
    Object.entries(Icons).forEach(([name, component]) => {
      if (name !== "BaseIcon") {
        this.register({
          name: `Icon${name}`,
          component: component as IconComponent,
        });
      }
    });
  }

  // 设置全局配置
  setConfig(config: Partial<IconConfig>) {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  getConfig(): IconConfig {
    return this.config;
  }

  // 注册单个图标
  register(options: IconRegisterOptions) {
    this.icons[options.name] = options.component;
  }

  // 批量注册图标
  registerBatch(iconSet: IconSet) {
    Object.assign(this.icons, iconSet);
  }

  // 获取图标
  getIcon(name: string) {
    return this.icons[name];
  }

  // 安装到 Vue 应用
  install(app: App) {
    // 注册所有图标组件
    Object.entries(this.icons).forEach(([name, component]) => {
      app.component(`Xh${name}`, component);
    });

    // 提供全局配置
    app.provide("iconConfig", this.config);
  }
}

export const iconManager = new IconManager() as IconManager & { install: (app: App) => void };
