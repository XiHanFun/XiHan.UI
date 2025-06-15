import { ref, onMounted } from "vue";
import type { Ref } from "vue";

export interface HydrationOptions {
  /** 是否立即水合 */
  immediate?: boolean;
  /** 水合延迟时间（毫秒） */
  delay?: number;
}

export interface HydrationState {
  /** 是否已水合 */
  isHydrated: Ref<boolean>;
  /** 开始水合 */
  hydrate: () => void;
  /** 延迟水合 */
  hydrateWithDelay: (delay?: number) => void;
}

/**
 * 使用水合状态
 * @param options - 配置选项
 * @returns 水合状态
 */
export function useHydration(options: HydrationOptions = {}): HydrationState {
  const { immediate = true, delay = 0 } = options;
  const isHydrated = ref(false);

  const hydrate = () => {
    isHydrated.value = true;
  };

  const hydrateWithDelay = (customDelay = delay) => {
    setTimeout(hydrate, customDelay);
  };

  onMounted(() => {
    if (immediate) {
      if (delay > 0) {
        hydrateWithDelay();
      } else {
        hydrate();
      }
    }
  });

  return {
    isHydrated,
    hydrate,
    hydrateWithDelay,
  };
}
