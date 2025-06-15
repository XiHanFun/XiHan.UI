import type { App } from "vue";
import { createLogger, type LoggerOptions } from "./logger";

export interface LoggerPluginOptions extends LoggerOptions {
  /** 是否在开发环境启用 */
  devOnly?: boolean;
  /** 是否持久化日志 */
  persist?: boolean;
  /** 最大日志条数 */
  maxLogs?: number;
  /** 日志存储键名 */
  storageKey?: string;
  /** 是否自动加载持久化日志 */
  autoLoad?: boolean;
}

export const logger = {
  install(app: App, options: LoggerPluginOptions = {}) {
    const {
      prefix = "[XiHan]",
      devOnly = false,
      persist = false,
      maxLogs = 1000,
      storageKey = "xihan_logs",
      autoLoad = true,
      ...restOptions
    } = options;

    // 检查是否在开发环境
    if (devOnly && process.env.NODE_ENV !== "development") {
      return;
    }

    // 创建日志实例
    const logger = createLogger({ prefix, ...restOptions });
    const logs: any[] = [];

    // 加载持久化日志
    const loadPersistedLogs = () => {
      if (!persist) return;
      try {
        const storedLogs = localStorage.getItem(storageKey);
        if (storedLogs) {
          const parsedLogs = JSON.parse(storedLogs);
          logs.push(...parsedLogs);
        }
      } catch (error) {
        console.error("加载持久化日志失败:", error);
      }
    };

    // 保存持久化日志
    const savePersistedLogs = () => {
      if (!persist) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(logs));
      } catch (error) {
        console.error("保存持久化日志失败:", error);
      }
    };

    // 自动加载日志
    if (autoLoad) {
      loadPersistedLogs();
    }

    // 创建日志实例
    const loggerInstance = {
      ...logger,
      getLogs: () => [...logs],
      clearLogs: () => {
        logs.length = 0;
        if (persist) savePersistedLogs();
      },
      saveLogs: savePersistedLogs,
      loadLogs: loadPersistedLogs,
    };

    // 注册为全局属性
    app.config.globalProperties.$log = loggerInstance;

    // 提供日志实例作为全局依赖注入
    app.provide("logger", loggerInstance);
  },
};
