import { ref, watch } from "vue";
import type { Ref } from "vue";

export interface StorageOptions {
  /** 存储键名前缀 */
  prefix?: string;
  /** 是否启用加密 */
  encrypt?: boolean;
  /** 是否启用压缩 */
  compress?: boolean;
  /** 存储类型 */
  type?: "local" | "session";
}

/**
 * 使用本地存储
 * @param key - 键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 存储值和设置方法
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions = {},
): [Ref<T>, (value: T) => void] {
  const { prefix = "xh_", type = "local", encrypt = false, compress = false } = options;
  const storageKey = `${prefix}${key}`;
  const storage = type === "local" ? localStorage : sessionStorage;

  // 创建响应式引用
  const storedValue = ref<T>(initialValue) as Ref<T>;

  // 读取存储的值
  const read = (): T => {
    try {
      const item = storage.getItem(storageKey);
      if (item === null) return initialValue;

      let value = item;
      if (encrypt) {
        // TODO: 实现解密逻辑
        value = item;
      }
      if (compress) {
        // TODO: 实现解压逻辑
        value = item;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(`Error reading ${storageKey} from ${type}Storage:`, error);
      return initialValue;
    }
  };

  // 写入存储的值
  const write = (value: T) => {
    try {
      let serializedValue = JSON.stringify(value);
      if (compress) {
        // TODO: 实现压缩逻辑
      }
      if (encrypt) {
        // TODO: 实现加密逻辑
      }
      storage.setItem(storageKey, serializedValue);
    } catch (error) {
      console.error(`Error writing ${storageKey} to ${type}Storage:`, error);
    }
  };

  // 初始化时读取存储的值
  storedValue.value = read();

  // 监听值的变化并写入存储
  watch(
    storedValue,
    newValue => {
      write(newValue);
    },
    { deep: true },
  );

  return [storedValue, write];
}
