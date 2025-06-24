import { ref, onMounted, onServerPrefetch } from "vue";
import type { Ref } from "vue";

export interface ServerPrefetchOptions<T> {
  /** 是否立即执行 */
  immediate?: boolean;
  /** 初始数据 */
  initialData?: T;
  /** 错误处理函数 */
  onError?: (error: Error) => void;
  /** 成功处理函数 */
  onSuccess?: (data: T) => void;
}

/**
 * 使用服务端预取数据
 * @param fetchFunc - 获取数据的异步函数
 * @param options - 配置选项
 * @returns 加载状态和结果
 */
export function useServerPrefetch<T>(fetchFunc: () => Promise<T>, options: ServerPrefetchOptions<T> = {}) {
  const { immediate = true, initialData = null, onError, onSuccess } = options;
  const data = ref<T | null>(initialData) as Ref<T | null>;
  const error = ref<Error | null>(null);
  const loading = ref(false);

  const fetch = async () => {
    loading.value = true;
    error.value = null;

    try {
      const result = await fetchFunc();
      data.value = result;
      onSuccess?.(result);
    } catch (err) {
      error.value = err as Error;
      onError?.(err as Error);
    } finally {
      loading.value = false;
    }
  };

  if (typeof window === "undefined") {
    // 服务端预取
    onServerPrefetch(fetch);
  } else {
    // 客户端如果没有数据则获取
    onMounted(() => {
      if (immediate && data.value === null) {
        fetch();
      }
    });
  }

  return {
    data,
    error,
    loading,
    refetch: fetch,
  };
}
