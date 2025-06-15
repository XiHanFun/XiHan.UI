import { ref, onMounted } from "vue";
import type { Ref } from "vue";

export interface SSRState {
  /** 是否在服务端 */
  isServer: boolean;
  /** 是否在客户端 */
  isClient: boolean;
  /** 是否已水合 */
  isHydrated: Ref<boolean>;
}

/**
 * 使用服务端渲染
 * @returns SSR 状态
 */
export function useSSR(): SSRState {
  const isServer = typeof window === "undefined";
  const isClient = !isServer;
  const isHydrated = ref(false);

  onMounted(() => {
    isHydrated.value = true;
  });

  return {
    isServer,
    isClient,
    isHydrated,
  };
}
