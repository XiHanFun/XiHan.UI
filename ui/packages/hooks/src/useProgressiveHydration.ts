import { ref, onMounted } from "vue";
import type { Ref } from "vue";

export interface ProgressiveHydrationOptions {
  /** 每段激活的组件数量 */
  chunkSize?: number;
  /** 段之间的延迟(毫秒) */
  delayBetweenChunks?: number;
}

export interface ProgressiveHydrationState {
  /** 注册组件 */
  register: (id: string) => Ref<boolean>;
  /** 检查组件是否已激活 */
  isHydrated: (id: string) => boolean;
  /** 组件数量 */
  componentsCount: () => number;
}

/**
 * 分段激活大型页面
 * @param options - 配置选项
 * @returns 注册和检查组件激活状态的方法
 */
export function useProgressiveHydration(options: ProgressiveHydrationOptions = {}): ProgressiveHydrationState {
  const { chunkSize = 5, delayBetweenChunks = 100 } = options;
  const components = new Map<string, Ref<boolean>>();
  const isServer = typeof window === "undefined";

  if (!isServer) {
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
