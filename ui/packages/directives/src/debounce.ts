import type { Directive, DirectiveBinding } from "vue";

/**
 * v-debounce 指令
 * 防抖指令
 */
export const vDebounce: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, arg = "click", modifiers } = binding;
    const delay = Number(modifiers.delay) || 300;
    let timer: number;

    el.addEventListener(arg, (e: Event) => {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => {
        value(e);
      }, delay);
    });
  },
};
