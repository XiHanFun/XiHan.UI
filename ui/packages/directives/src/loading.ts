import type { Directive, DirectiveBinding } from "vue";

// 使用 WeakMap 存储元素的自定义属性
const loadingContainerMap = new WeakMap<HTMLElement, HTMLDivElement>();

/**
 * v-loading 指令
 * 加载指令
 */
export const vLoading: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const loadingContainer = document.createElement("div");
    loadingContainer.className = "xh-loading";
    loadingContainer.innerHTML = `
      <div class="xh-loading__spinner">
        <svg viewBox="25 25 50 50">
          <circle cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/>
        </svg>
      </div>
      ${binding.arg ? `<div class="xh-loading__text">${binding.arg}</div>` : ""}
    `;

    if (binding.value) {
      el.appendChild(loadingContainer);
      el.classList.add("xh-loading-parent");
    }

    loadingContainerMap.set(el, loadingContainer);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.value !== binding.oldValue) {
      const loadingContainer = loadingContainerMap.get(el);
      if (!loadingContainer) return;

      if (binding.value) {
        el.appendChild(loadingContainer);
        el.classList.add("xh-loading-parent");
      } else {
        el.removeChild(loadingContainer);
        el.classList.remove("xh-loading-parent");
      }
    }
  },
  unmounted(el: HTMLElement) {
    const loadingContainer = loadingContainerMap.get(el);
    if (loadingContainer) {
      loadingContainerMap.delete(el);
    }
  },
};
