// 导出所有子包
export * from "@xihan-ui/utils";
export * from "@xihan-ui/constants";
export * from "@xihan-ui/directives";
export * from "@xihan-ui/hooks";
export * from "@xihan-ui/locales";
// export * from "@xihan-ui/themes";
export * from "@xihan-ui/components";

// 导出 Vue 插件安装函数
import type { App } from "vue";
import { installComponents } from "@xihan-ui/components";
// 引入样式
import "@xihan-ui/themes/index.scss";
import { useTheme } from "@xihan-ui/utils/themes/useTheme";

export const install = (app: App) => {
  installComponents(app);
  // 其他子包的安装逻辑
};

export { useTheme };

// 导出默认对象
const XihanUI = { install };
export default XihanUI;
