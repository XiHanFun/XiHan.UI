import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface WindowSizeOptions {
  /** 是否立即获取尺寸 */
  immediate?: boolean;
  /** 是否监听窗口大小变化 */
  listen?: boolean;
  /** 是否包含滚动条宽度 */
  includeScrollbar?: boolean;
}

export interface WindowSize {
  /** 窗口宽度 */
  width: Ref<number>;
  /** 窗口高度 */
  height: Ref<number>;
  /** 更新尺寸 */
  update: () => void;
}

/**
 * 使用窗口尺寸
 * @param options - 配置选项
 * @returns 窗口尺寸
 */
export function useWindowSize(options: WindowSizeOptions = {}): WindowSize {
  const { immediate = true, listen = true, includeScrollbar = true } = options;

  const width = ref(0);
  const height = ref(0);

  const update = () => {
    if (includeScrollbar) {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
    } else {
      width.value = document.documentElement.clientWidth;
      height.value = document.documentElement.clientHeight;
    }
  };

  if (immediate) {
    update();
  }

  if (listen) {
    onMounted(() => {
      window.addEventListener("resize", update);
      window.addEventListener("orientationchange", update);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    });
  }

  return {
    width,
    height,
    update,
  };
}
