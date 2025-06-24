import { ref } from "vue";
import type { Ref } from "vue";

export interface SSRMetadataOptions<T extends object> {
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 缓存键名 */
  cacheKey?: string;
}

export interface SSRMetadataState<T extends object> {
  /** 元数据 */
  metadata: T;
  /** 获取元数据值 */
  getMetaValue: <K extends keyof T>(key: K) => T[K] | undefined;
  /** 设置元数据值 */
  setMetaValue: <K extends keyof T>(key: K, value: T[K]) => void;
  /** 更新元数据 */
  updateMetadata: (newMetadata: Partial<T>) => void;
}

/**
 * 使用服务端元数据
 * @param getMetadata - 获取元数据的函数
 * @param options - 配置选项
 * @returns 元数据状态
 */
export function useSSRMetadata<T extends object>(
  getMetadata: () => T,
  options: SSRMetadataOptions<T> = {},
): SSRMetadataState<T> {
  const { enableCache = true, cacheKey = "ssr-metadata" } = options;
  const isServer = typeof window === "undefined";
  const metadata = ref<T>(isServer ? getMetadata() : ({} as T));

  // 从缓存加载元数据
  if (!isServer && enableCache) {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        metadata.value = JSON.parse(cached);
      }
    } catch (error) {
      console.error("Failed to load metadata from cache:", error);
    }
  }

  // 获取元数据值
  const getMetaValue = <K extends keyof T>(key: K): T[K] | undefined => {
    return metadata.value[key];
  };

  // 设置元数据值
  const setMetaValue = <K extends keyof T>(key: K, value: T[K]) => {
    metadata.value[key] = value;
    if (!isServer && enableCache) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(metadata.value));
      } catch (error) {
        console.error("Failed to save metadata to cache:", error);
      }
    }
  };

  // 更新元数据
  const updateMetadata = (newMetadata: Partial<T>) => {
    metadata.value = { ...metadata.value, ...newMetadata };
    if (!isServer && enableCache) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(metadata.value));
      } catch (error) {
        console.error("Failed to save metadata to cache:", error);
      }
    }
  };

  return {
    metadata: metadata.value,
    getMetaValue,
    setMetaValue,
    updateMetadata,
  };
}
