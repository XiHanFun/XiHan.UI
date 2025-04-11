/**
 * 测试夹具工具
 * 提供测试环境的设置和清理功能
 */
import type { FixtureConfig } from "./types";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * 创建测试夹具
 * @param config 夹具配置
 * @returns 夹具实例
 */
export function createFixture(config: FixtureConfig = {}) {
  const { setup, teardown, beforeEach, afterEach } = config;
  let setupDone = false;

  return {
    /**
     * 执行夹具设置
     */
    async setup() {
      if (setup && !setupDone) {
        await setup();
        setupDone = true;
      }
    },

    /**
     * 执行夹具清理
     */
    async teardown() {
      if (teardown && setupDone) {
        await teardown();
        setupDone = false;
      }
    },

    /**
     * 执行每个测试前的设置
     */
    async beforeEach() {
      if (beforeEach) {
        await beforeEach();
      }
    },

    /**
     * 执行每个测试后的清理
     */
    async afterEach() {
      if (afterEach) {
        await afterEach();
      }
    },

    /**
     * 包装测试函数
     * @param fn 测试函数
     */
    async wrapTest(fn: () => Promise<void> | void) {
      await this.setup();
      await this.beforeEach();
      try {
        await fn();
      } finally {
        await this.afterEach();
        await this.teardown();
      }
    },
  };
}

/**
 * 创建临时目录夹具
 * @param prefix 目录前缀
 * @returns 夹具实例
 */
export function createTempDirFixture(prefix = "test-") {
  const tempDirs: string[] = [];

  return createFixture({
    setup: async () => {
      const tempDir = await fs.mkdtemp(join(tmpdir(), prefix));
      tempDirs.push(tempDir);
      return tempDir;
    },
    teardown: async () => {
      for (const dir of tempDirs) {
        try {
          await fs.rm(dir, { recursive: true, force: true });
        } catch (error) {
          console.warn(`Failed to remove temp dir: ${dir}`, error);
        }
      }
      tempDirs.length = 0;
    },
  });
}

/**
 * 创建数据库夹具
 * @param config 数据库配置
 * @returns 夹具实例
 */
export function createDatabaseFixture(config: { type: "sqlite" | "postgres" | "mysql"; options: Record<string, any> }) {
  let connection: any;

  return createFixture({
    setup: async () => {
      // 根据配置创建数据库连接
      switch (config.type) {
        case "sqlite":
          // 实现SQLite连接
          break;
        case "postgres":
          // 实现PostgreSQL连接
          break;
        case "mysql":
          // 实现MySQL连接
          break;
      }
      return connection;
    },
    teardown: async () => {
      if (connection) {
        await connection.close();
        connection = null;
      }
    },
    beforeEach: async () => {
      if (connection) {
        // 开始事务
        await connection.beginTransaction();
      }
    },
    afterEach: async () => {
      if (connection) {
        // 回滚事务
        await connection.rollback();
      }
    },
  });
}
