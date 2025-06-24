import { ref, watch, onUnmounted } from "vue";
import type { Ref } from "vue";
import { getStorage, setStorage, removeStorage, StorageType } from "@xihan-ui/utils";
import type { StorageOptions as BaseStorageOptions } from "@xihan-ui/utils";

/**
 * useStorage 专用配置选项
 */
export interface UseStorageOptions extends BaseStorageOptions {
  /** 存储键名前缀 */
  prefix?: string;
  /** 是否在组件卸载时自动清理 */
  autoCleanup?: boolean;
  /** 是否启用深度监听 */
  deep?: boolean;
  /** 是否立即同步存储值 */
  immediate?: boolean;
}

/**
 * 使用本地存储的 Vue 组合式函数
 * @param key - 键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns [存储值的响应式引用, 设置方法, 移除方法]
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  options: UseStorageOptions = {},
): [Ref<T>, (value: T) => void, () => void] {
  const {
    prefix = "xh_",
    type = StorageType.LOCAL,
    autoCleanup = false,
    deep = true,
    immediate = true,
    ...storageOptions
  } = options;

  const storageKey = `${prefix}${key}`;

  // 创建响应式引用
  const storedValue = ref<T>(initialValue) as Ref<T>;

  // 读取存储的值
  const read = (): T => {
    try {
      const value = getStorage<T>(storageKey, { type, ...storageOptions });
      return value !== null ? value : initialValue;
    } catch (error) {
      console.error(`Error reading ${storageKey} from storage:`, error);
      return initialValue;
    }
  };

  // 写入存储的值
  const write = (value: T) => {
    try {
      setStorage(storageKey, value, { type, ...storageOptions });
      storedValue.value = value;
    } catch (error) {
      console.error(`Error writing ${storageKey} to storage:`, error);
    }
  };

  // 移除存储的值
  const removeValue = () => {
    try {
      removeStorage(storageKey, { type });
      storedValue.value = initialValue;
    } catch (error) {
      console.error(`Error removing ${storageKey} from storage:`, error);
    }
  };

  // 初始化时读取存储的值
  if (immediate) {
    storedValue.value = read();
  }

  // 监听值的变化并写入存储
  const stopWatcher = watch(
    storedValue,
    newValue => {
      write(newValue);
    },
    { deep },
  );

  // 组件卸载时的清理逻辑
  if (autoCleanup) {
    onUnmounted(() => {
      removeValue();
      stopWatcher();
    });
  }

  return [storedValue, write, removeValue];
}

/**
 * 使用本地存储（localStorage）
 */
export function useLocalStorage<T>(key: string, initialValue: T, options: Omit<UseStorageOptions, "type"> = {}) {
  return useStorage(key, initialValue, { ...options, type: StorageType.LOCAL });
}

/**
 * 使用会话存储（sessionStorage）
 */
export function useSessionStorage<T>(key: string, initialValue: T, options: Omit<UseStorageOptions, "type"> = {}) {
  return useStorage(key, initialValue, { ...options, type: StorageType.SESSION });
}
