import type { Directive } from "vue";

/**
 * v-focus 指令
 * 聚焦指令
 */
export const vFocus: Directive = {
  mounted(el: HTMLElement) {
    el.focus();
  },
};
