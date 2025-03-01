import type { App, Component } from "vue";
import * as icons from "./src/icons";

// 导出所有图标组件
export * from "./src/icons";

// 导出类型
export type { IconBaseProps } from "./src/components/IconBase";

// 安装函数
export function install(app: App) {
  Object.values(icons).forEach(icon => {
    if ((icon as Component).name) {
      app.component((icon as Component).name as string, icon as Component);
    }
  });
}

export default {
  install,
};
