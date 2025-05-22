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
  prefix: "XiHan",
  level: import.meta.env.DEV ? "debug" : "error",
  disabled: import.meta.env.VITE_UI_LOG_DISABLED === "true",
});

// 安装函数
export const install = (app: App) => {
  try {
    // ============ 项目信息 ============
    logger.group("XiHan", true);
    logger.info(XiHan.SayHello());
    logger.groupEnd();

    // ============ 加载组件 ============
    logger.group("XiHan Load", true);
    logger.time("Load");
    assert(!!app, "App instance is required");
    // 注册组件
    app.component("XhButton", XhButton);
    app.component("XhButtonGroup", XhButtonGroup);
    // 注入全局配置
    app.config.globalProperties.$XIHAN = XiHan;
    // 添加错误处理
    app.config.errorHandler = (err, vm, info) => {
      logger.error("Vue Error:", err, vm, info);
    };
    // 添加警告处理
    app.config.warnHandler = (msg, vm, trace) => {
      logger.warn("Vue Warning:", msg, vm, trace);
    };
    logger.success("XiHan loaded successfully");
    logger.timeEnd("Load");
    logger.groupEnd();
  } catch (err) {
    if (err instanceof Error) {
      throwError(`Failed to load XiHan: ${err.message}`, "UNKNOWN");
    }
    throw err;
  }
};

// 导出工具函数
// export { useTheme };

// 导出默认对象
export default { install };
