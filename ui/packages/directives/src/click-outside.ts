import type { Directive, DirectiveBinding } from "vue";

// 使用 WeakMap 存储元素的自定义属性
const clickOutsideMap = new WeakMap<HTMLElement, (event: Event) => void>();

/**
 * v-click-outside 指令
 * 点击元素外部时触发回调
 */
export const vClickOutside: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const handler = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    clickOutsideMap.set(el, handler);
    document.addEventListener("click", handler);
  },
  unmounted(el: HTMLElement) {
    const handler = clickOutsideMap.get(el);
    if (handler) {
      document.removeEventListener("click", handler);
      clickOutsideMap.delete(el);
    }
  },
};
