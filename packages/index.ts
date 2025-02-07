// 导出所有子包
export * from "@xihan-ui/utils";
export * from "@xihan-ui/components";
export * from "@xihan-ui/constants";
export * from "@xihan-ui/directives";
export * from "@xihan-ui/themes";

// 导出 Vue 插件安装函数
import type { App } from "vue";
import { install as installComponents } from "@xihan-ui/components";

export const install = (app: App) => {
  installComponents(app);
  // 其他子包的安装逻辑
};

export default {
  install,
};
