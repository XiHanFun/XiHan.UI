import { ref, onMounted } from "vue";
import type { Ref } from "vue";

export interface DeferredHydrationOptions {
  /** 延迟毫秒数 */
  delay?: number;
  /** 是否使用 requestIdleCallback */
  useIdleCallback?: boolean;
}

export interface DeferredHydrationState {
  /** 是否已激活 */
  hydrated: Ref<boolean>;
  /** 是否已激活 */
  isHydrated: () => boolean;
}

/**
 * 延迟激活组件
 * @param options - 配置选项
 * @returns 激活状态
 */
export function useDeferredHydration(options: DeferredHydrationOptions = {}): DeferredHydrationState {
  const { delay = 0, useIdleCallback = true } = options;
  const hydrated = ref(false);

  if (typeof window !== "undefined") {
    onMounted(() => {
      if (delay > 0) {
        setTimeout(() => {
          hydrated.value = true;
        }, delay);
      } else if (useIdleCallback && window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          hydrated.value = true;
        });
      } else {
        setTimeout(() => {
          hydrated.value = true;
        }, 1);
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
