/**
 * 存储类型枚举
 */
export enum StorageType {
  LOCAL = "local",
  SESSION = "session",
}

/**
 * 存储配置选项
 */
export interface StorageOptions {
  /**
   * 存储类型，默认为本地存储
   */
  type?: StorageType;
  /**
   * 过期时间（毫秒）
   */
  expire?: number;
  /**
   * 是否自动序列化/反序列化
   */
  autoSerialize?: boolean;
}

/**
 * 存储项接口
 */
interface StorageItem<T = any> {
  value: T;
  expire?: number;
  timestamp: number;
}

/**
 * 获取存储对象
 * @param type 存储类型
 * @returns 存储对象
 * @throws 当存储不可用时抛出错误
 */
const getStorageObject = (type: StorageType = StorageType.LOCAL): Storage => {
  try {
    const storage = type === StorageType.LOCAL ? localStorage : sessionStorage;
    // 测试存储是否可用
    storage.setItem("_test", "_test");
    storage.removeItem("_test");
    return storage;
  } catch (error) {
    throw new Error(`Storage ${type} is not available`);
  }
};

/**
 * 序列化存储项
 */
const serializeItem = <T>(value: T, options: StorageOptions = {}): string => {
  const item: StorageItem<T> = {
    value,
    timestamp: Date.now(),
  };

  if (options.expire) {
    item.expire = options.expire;
  }

  return JSON.stringify(item);
};

/**
 * 反序列化存储项
 */
const deserializeItem = <T>(value: string | null, options: StorageOptions = {}): T | null => {
  if (!value) return null;

  try {
    const item = JSON.parse(value) as StorageItem<T>;

    // 检查是否过期
    if (item.expire && Date.now() - item.timestamp > item.expire) {
      return null;
    }

    return item.value;
  } catch {
    return options.autoSerialize !== false ? (value as T) : null;
  }
};

/**
 * 从存储中获取指定键的值
 * @param key 键名
 * @param options 存储选项
 * @returns 存储的值，如果不存在或已过期则返回 null
 */
export function get<T = any>(key: string, options: StorageOptions = {}): T | null {
  const storage = getStorageObject(options.type);
  const value = storage.getItem(key);
  return deserializeItem<T>(value, options);
}

/**
 * 将值存储到指定键
 * @param key 键名
 * @param value 要存储的值
 * @param options 存储选项
 * @throws 当存储失败时抛出错误
 */
export function set<T = any>(key: string, value: T, options: StorageOptions = {}): void {
  const storage = getStorageObject(options.type);
  const serialized = options.autoSerialize !== false ? serializeItem(value, options) : String(value);
  storage.setItem(key, serialized);
}

/**
 * 从存储中移除指定键的值
 * @param key 键名
 * @param options 存储选项
 */
export function remove(key: string, options: StorageOptions = {}): void {
  const storage = getStorageObject(options.type);
  storage.removeItem(key);
}

/**
 * 清空存储中的所有键值对
 * @param options 存储选项
 */
export function clear(options: StorageOptions = {}): void {
  const storage = getStorageObject(options.type);
  storage.clear();
}

/**
 * 获取存储中的所有键值对
 * @param options 存储选项
 * @returns 所有键值对的对象
 */
export function getAll<T = any>(options: StorageOptions = {}): Record<string, T> {
  const storage = getStorageObject(options.type);
  const result: Record<string, T> = {};

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = get<T>(key, options);
      if (value !== null) {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * 检查存储中是否存在指定键
 * @param key 键名
 * @param options 存储选项
 * @returns 是否存在
 */
export function has(key: string, options: StorageOptions = {}): boolean {
  const storage = getStorageObject(options.type);
  return storage.getItem(key) !== null;
}

/**
 * 获取存储中键的数量
 * @param options 存储选项
 * @returns 键的数量
 */
export function size(options: StorageOptions = {}): number {
  const storage = getStorageObject(options.type);
  return storage.length;
}

/**
 * 获取存储中所有键的数组
 * @param options 存储选项
 * @returns 键的数组
 */
export function keys(options: StorageOptions = {}): string[] {
  const storage = getStorageObject(options.type);
  const result: string[] = [];

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      result.push(key);
    }
  }

  return result;
}
