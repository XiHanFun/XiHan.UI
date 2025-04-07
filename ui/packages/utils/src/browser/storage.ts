/**
 * 存储类型枚举
 */
export enum StorageType {
  LOCAL = "local",
  SESSION = "session",
}

/**
 * 获取存储对象
 * @param type 存储类型，默认为本地存储
 * @returns 存储对象
 */
const getStorageObject = (type: StorageType = StorageType.LOCAL): Storage => {
  return type === StorageType.LOCAL ? localStorage : sessionStorage;
};

/**
 * 从存储中获取指定键的值，并尝试将其解析为JSON对象
 * 如果解析失败，则返回原始字符串
 * @param key 要获取的值的键
 * @param type 存储类型，默认为本地存储
 * @returns 返回解析后的JSON对象或原始字符串，如果键不存在则返回null
 */
export const get = (key: string, type: StorageType = StorageType.LOCAL) => {
  const storage = getStorageObject(type);
  const value = storage.getItem(key);
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return value;
  }
};

/**
 * 将指定键的值存储到存储中，并将其转换为JSON字符串
 * @param key 要存储的值的键
 * @param value 要存储的值，可以是任何类型
 * @param type 存储类型，默认为本地存储
 */
export const set = (key: string, value: any, type: StorageType = StorageType.LOCAL) => {
  const storage = getStorageObject(type);
  storage.setItem(key, JSON.stringify(value));
};

/**
 * 从存储中移除指定键的值
 * @param key 要移除的值的键
 * @param type 存储类型，默认为本地存储
 */
export const remove = (key: string, type: StorageType = StorageType.LOCAL) => {
  const storage = getStorageObject(type);
  storage.removeItem(key);
};

/**
 * 清空存储中的所有键值对
 * @param type 存储类型，默认为本地存储
 */
export const clear = (type: StorageType = StorageType.LOCAL) => {
  const storage = getStorageObject(type);
  storage.clear();
};

// 同时提供命名空间对象
export const storageUtils = {
  get,
  set,
  remove,
  clear,
};

// 默认导出命名空间对象
export default storageUtils;
