import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface ClickOutsideOptions {
  /** 是否启用 */
  enabled?: boolean;
  /** 忽略的元素选择器 */
  ignore?: string[];
  /** 点击外部时的回调 */
  handler?: (event: MouseEvent) => void;
}

/**
 * 使用点击外部检测
 * @param options - 配置选项
 * @returns 点击外部状态
 */
export function useClickOutside(options: ClickOutsideOptions = {}) {
  const { enabled = true, ignore = [], handler } = options;
  const targetRef = ref<HTMLElement | null>(null);
  const isOutside = ref(false);

  const handleClick = (event: MouseEvent) => {
    if (!enabled || !targetRef.value) return;

    // 检查是否点击了忽略的元素
    const clickedElement = event.target as HTMLElement;
    const shouldIgnore = ignore.some(selector => {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements).some(el => el.contains(clickedElement));
    });

    if (shouldIgnore) return;

    // 检查是否点击了目标元素外部
    isOutside.value = !targetRef.value.contains(clickedElement);

    if (isOutside.value && handler) {
      handler(event);
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClick);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClick);
  });

  return {
    targetRef,
    isOutside,
  };
}
