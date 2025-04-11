/**
 * 测试相关类型定义
 */

/**
 * Mock数据配置类型
 */
export type MockDataConfig<T> = {
  [K in keyof T]: T[K] | (() => T[K]) | [number, () => T[K]] | MockDataConfig<T[K]>;
};

/**
 * Mock选项类型
 */
export interface MockOptions {
  [key: string]: any;
}

/**
 * 测试夹具配置
 */
export interface FixtureConfig {
  setup?: () => Promise<void> | void;
  teardown?: () => Promise<void> | void;
  beforeEach?: () => Promise<void> | void;
  afterEach?: () => Promise<void> | void;
}

/**
 * 组件测试配置
 */
export interface ComponentTestConfig {
  props?: Record<string, any>;
  slots?: Record<string, any>;
  attrs?: Record<string, any>;
  global?: {
    components?: Record<string, any>;
    plugins?: any[];
    mocks?: Record<string, any>;
    stubs?: Record<string, any>;
  };
}

/**
 * 快照测试选项
 */
export interface SnapshotOptions {
  name?: string;
  update?: boolean;
  threshold?: number;
  serializer?: (value: any) => string;
}

/**
 * 异步测试选项
 */
export interface AsyncTestOptions {
  timeout?: number;
  interval?: number;
  retries?: number;
}
