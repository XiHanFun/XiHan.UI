import type { App } from "vue";

// 导出所有子包
export * from "@xihan-ui/utils";
export * from "@xihan-ui/constants";
export * from "@xihan-ui/directives";
export * from "@xihan-ui/hooks";
export * from "@xihan-ui/locales";
export * from "@xihan-ui/components";
export * from "@xihan-ui/themes";
export * from "./xihan";

// 在导出子包后，导入需要使用的函数
import { createLogger, assert, throwError } from "@xihan-ui/utils";
import { XhButton, XhButtonGroup } from "@xihan-ui/components";

// 引入样式 - 使用别名
import "@xihan-ui/themes";
import { XiHan } from "./xihan";
// import { useTheme } from "@xihan-ui/hooks";

// 创建日志记录器
const logger = createLogger({
  prefix: "XihanUI",
  level: import.meta.env.DEV ? "debug" : "error",
});

// 安装函数
export const install = (app: App) => {
  try {
    logger.group("XihanUI Info");
    logger.success(XiHan.Logo);
    logger.success(XiHan.Version);
    logger.success(XiHan.Copyright);
    logger.success(XiHan.Doc);
    logger.success(XiHan.Org);
    logger.success(XiHan.Rep);
    logger.success(XiHan.SendWord);
    logger.success(XiHan.Tagline);
    logger.groupEnd();

    assert(!!app, "App instance is required");

    // 注册组件
    app.component("XhButton", XhButton);
    app.component("XhButtonGroup", XhButtonGroup);

    // 注入全局配置
    app.config.globalProperties.$XIHAN = {
      version: XiHan.Version,
      mode: "light",
    };

    // 添加错误处理
    app.config.errorHandler = (err, vm, info) => {
      logger.error("Vue Error:", err, vm, info);
    };

    // 添加警告处理
    app.config.warnHandler = (msg, vm, trace) => {
      logger.warn("Vue Warning:", msg, vm, trace);
    };

    logger.info("XihanUI installed successfully");
  } catch (err) {
    if (err instanceof Error) {
      throwError(`Failed to install XihanUI: ${err.message}`, "UNKNOWN");
    }
    throw err;
  }
};

// 导出工具函数
// export { useTheme };

// 导出默认对象
export default { install };
