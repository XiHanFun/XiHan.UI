import type { Directive, DirectiveBinding } from "vue";

// 使用 WeakMap 存储元素的自定义属性
const resizeMap = new WeakMap<HTMLElement, ResizeObserver>();

/**
 * v-resize 指令
 * 调整大小指令
 */
export const vResize: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const observer = new ResizeObserver(entries => {
      binding.value(entries[0]);
    });
    observer.observe(el);
    resizeMap.set(el, observer);
  },
  unmounted(el: HTMLElement) {
    const observer = resizeMap.get(el);
    if (observer) {
      observer.disconnect();
      resizeMap.delete(el);
    }
  },
};
