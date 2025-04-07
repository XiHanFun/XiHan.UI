/**
 * 服务端渲染辅助模块
 * 提供SSR相关工具和优化方法
 */

import { ref, onMounted, onServerPrefetch, nextTick } from "vue";
import type { Ref } from "vue";

/**
 * 检测当前环境是否为服务器端
 */
export const isServer = typeof window === "undefined";

/**
 * 检测当前环境是否为客户端
 */
export const isClient = !isServer;

/**
 * 服务端预取数据辅助函数
 * @param fetchFunc 获取数据的异步函数
 * @returns 加载状态和结果
 */
export function useServerPrefetch<T>(fetchFunc: () => Promise<T>) {
  const data: Ref<T | null> = ref(null);
  const error = ref<Error | null>(null);
  const loading = ref(false);

  const fetch = async () => {
    loading.value = true;
    error.value = null;

    try {
      data.value = await fetchFunc();
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  if (isServer) {
    // 服务端预取
    onServerPrefetch(fetch);
  } else {
    // 客户端如果没有数据则获取
    onMounted(() => {
      if (data.value === null) {
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

/**
 * 客户端专用钩子
 * @param fn 仅在客户端执行的函数
 */
export function useClientOnly(fn: () => void) {
  if (isClient) {
    onMounted(fn);
  }
}

/**
 * 创建混合渲染上下文
 * @param serverState 服务器端状态
 * @returns 客户端激活方法
 */
export function createHydrationContext<T>(serverState: T) {
  const hydrated = ref(false);

  const hydrate = (clientState: T) => {
    // 合并服务端和客户端状态
    const mergedState = { ...serverState, ...clientState };
    hydrated.value = true;
    return mergedState;
  };

  return {
    hydrated,
    hydrate,
    isHydrated: () => hydrated.value,
  };
}

/**
 * 延迟激活组件 - 用于大型应用分批激活
 * @param delayMs 延迟毫秒数
 * @returns 激活状态
 */
export function useDeferredHydration(delayMs: number = 0) {
  const hydrated = ref(false);

  if (isClient) {
    onMounted(() => {
      if (delayMs > 0) {
        setTimeout(() => {
          hydrated.value = true;
        }, delayMs);
      } else {
        // 使用requestIdleCallback或setTimeout根据浏览器空闲时间激活
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            hydrated.value = true;
          });
        } else {
          setTimeout(() => {
            hydrated.value = true;
          }, 1);
        }
      }
    });
  } else {
    // 服务端渲染时默认为已激活
    hydrated.value = true;
  }

  return {
    hydrated,
    isHydrated: () => hydrated.value,
  };
}

/**
 * 分段激活大型页面
 * @param chunkSize 每段激活的组件数量
 * @param delayBetweenChunks 段之间的延迟(毫秒)
 * @returns 注册和检查组件激活状态的方法
 */
export function useProgressiveHydration(chunkSize: number = 5, delayBetweenChunks: number = 100) {
  // 存储组件ID和激活状态
  const components: Map<string, Ref<boolean>> = new Map();

  if (isClient) {
    onMounted(() => {
      const ids = Array.from(components.keys());
      const totalChunks = Math.ceil(ids.length / chunkSize);

      // 分段激活
      for (let i = 0; i < totalChunks; i++) {
        setTimeout(() => {
          const chunkIds = ids.slice(i * chunkSize, (i + 1) * chunkSize);
          chunkIds.forEach(id => {
            const state = components.get(id);
            if (state) {
              state.value = true;
            }
          });
        }, i * delayBetweenChunks);
      }
    });
  }

  // 注册组件
  const register = (id: string): Ref<boolean> => {
    const state = ref(isServer); // 服务端默认激活
    components.set(id, state);
    return state;
  };

  // 检查组件是否已激活
  const isHydrated = (id: string): boolean => {
    const state = components.get(id);
    return state ? state.value : false;
  };

  return {
    register,
    isHydrated,
    componentsCount: () => components.size,
  };
}

/**
 * 服务端异步操作超时控制
 * @param promise 异步操作
 * @param timeout 超时时间(毫秒)
 * @returns 带超时控制的Promise
 */
export function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  if (isServer) {
    // 在服务端应用超时控制
    return new Promise<T>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Server operation timed out after ${timeout}ms`));
        }, timeout);
      });

      Promise.race([promise, timeoutPromise])
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result as T);
        })
        .catch(err => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });
  }

  // 客户端直接返回原始Promise
  return promise;
}

/**
 * 安全地创建服务端的元数据
 * @param getMetadata 获取元数据的函数
 * @returns 元数据对象
 */
export function useSSRMetadata<T extends object>(getMetadata: () => T) {
  const metadata = isServer ? getMetadata() : {};

  return {
    metadata,
    getMetaValue: <K extends keyof T>(key: K): T[K] | undefined => {
      return (metadata as T)[key];
    },
  };
}

export default {
  isServer,
  isClient,
  useServerPrefetch,
  useClientOnly,
  createHydrationContext,
  useDeferredHydration,
  useProgressiveHydration,
  withTimeout,
  useSSRMetadata,
};
