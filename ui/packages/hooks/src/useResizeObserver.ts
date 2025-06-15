import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface ResizeObserverOptions {
  /** 是否立即观察 */
  immediate?: boolean;
  /** 是否包含边框 */
  box?: "content-box" | "border-box" | "device-pixel-content-box";
}

export interface ResizeObserverSize {
  /** 内联尺寸 */
  inlineSize: number;
  /** 块级尺寸 */
  blockSize: number;
}

export interface ResizeObserverReturn {
  /** 目标元素引用 */
  targetRef: Ref<Element | null>;
  /** 尺寸信息 */
  entry: Ref<ResizeObserverEntry | null>;
  /** 开始观察 */
  observe: () => void;
  /** 停止观察 */
  unobserve: () => void;
  /** 断开连接 */
  disconnect: () => void;
}

/**
 * 使用 ResizeObserver
 * @param options - 配置选项
 * @returns ResizeObserver 控制
 */
export function useResizeObserver(options: ResizeObserverOptions = {}): ResizeObserverReturn {
  const { immediate = true, box = "content-box" } = options;
  const targetRef = ref<Element | null>(null);
  const entry = ref<ResizeObserverEntry | null>(null);
  let observer: ResizeObserver | null = null;

  const observe = () => {
    if (!targetRef.value || observer) return;

    observer = new ResizeObserver(entries => {
      entry.value = entries[0];
    });

    observer.observe(targetRef.value, { box });
  };

  const unobserve = () => {
    if (!targetRef.value || !observer) return;

    observer.unobserve(targetRef.value);
    observer = null;
  };

  const disconnect = () => {
    if (!observer) return;

    observer.disconnect();
    observer = null;
  };

  onMounted(() => {
    if (immediate) {
      observe();
    }
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    targetRef,
    entry,
    observe,
    unobserve,
    disconnect,
  };
}
