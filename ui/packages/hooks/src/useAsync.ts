import { ref, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface AsyncState<T, E = Error> {
  /** 数据 */
  data: Ref<T | null>;
  /** 错误信息 */
  error: Ref<E | null>;
  /** 加载状态 */
  loading: Ref<boolean>;
  /** 执行异步操作 */
  execute: (...args: any[]) => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}

export interface AsyncOptions<T, E = Error> {
  /** 是否立即执行 */
  immediate?: boolean;
  /** 初始数据 */
  initialData?: T;
  /** 错误处理函数 */
  onError?: (error: E) => void;
  /** 成功处理函数 */
  onSuccess?: (data: T) => void;
  /** 完成处理函数 */
  onFinally?: () => void;
}

/**
 * 使用异步操作
 * @param asyncFn - 异步函数
 * @param options - 配置选项
 * @returns 异步状态
 */
export function useAsync<T, E = Error>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: AsyncOptions<T, E> = {},
): AsyncState<T, E> {
  const { immediate = false, initialData = null, onError, onSuccess, onFinally } = options;

  const data = ref<T | null>(initialData) as Ref<T | null>;
  const error = ref<E | null>(null) as Ref<E | null>;
  const loading = ref(false);
  let abortController: AbortController | null = null;

  const execute = async (...args: any[]) => {
    // 取消之前的请求
    if (abortController) {
      abortController.abort();
    }

    // 创建新的 AbortController
    abortController = new AbortController();

    loading.value = true;
    error.value = null;

    try {
      const result = await asyncFn(...args, abortController.signal);
      data.value = result;
      onSuccess?.(result);
    } catch (err) {
      error.value = err as E;
      onError?.(err as E);
    } finally {
      loading.value = false;
      onFinally?.();
      abortController = null;
    }
  };

  const reset = () => {
    data.value = initialData;
    error.value = null;
    loading.value = false;
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  // 组件卸载时取消请求
  onUnmounted(() => {
    if (abortController) {
      abortController.abort();
    }
  });

  // 如果设置了立即执行，则在创建时执行
  if (immediate) {
    execute();
  }

  return {
    data,
    error,
    loading,
    execute,
    reset,
  };
}
