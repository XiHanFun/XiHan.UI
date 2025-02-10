/**
 * 提供对浏览器本地存储的操作方法
 */
export const storageUtils = {
  /**
   * 从本地存储中获取指定键的值，并尝试将其解析为JSON对象
   * 如果解析失败，则返回原始字符串
   *
   * @param key 要获取的值的键
   * @returns 返回解析后的JSON对象或原始字符串，如果键不存在则返回null
   */
  get(key: string) {
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  },

  /**
   * 将指定键的值存储到本地存储中，并将其转换为JSON字符串
   *
   * @param key 要存储的值的键
   * @param value 要存储的值，可以是任何类型
   */
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * 从本地存储中移除指定键的值
   *
   * @param key 要移除的值的键
   */
  remove(key: string) {
    localStorage.removeItem(key);
  },

  /**
   * 清空本地存储中的所有键值对
   */
  clear() {
    localStorage.clear();
  },
};
