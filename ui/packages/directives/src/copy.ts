import type { Directive, DirectiveBinding } from "vue";

// 使用 WeakMap 存储元素的自定义属性
const copyHandlerMap = new WeakMap<HTMLElement, () => void>();

/**
 * v-copy 指令
 * 复制指令
 */
export const vCopy: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const handler = () => {
      const value = binding.value;
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);

      // 触发复制成功事件
      el.dispatchEvent(new CustomEvent("copy-success", { detail: value }));
    };
    copyHandlerMap.set(el, handler);
    el.addEventListener("click", handler);
  },
  unmounted(el: HTMLElement) {
    const handler = copyHandlerMap.get(el);
    if (handler) {
      el.removeEventListener("click", handler);
      copyHandlerMap.delete(el);
    }
  },
};
