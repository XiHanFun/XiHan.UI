import type { Directive, DirectiveBinding } from "vue";

// 使用 WeakMap 存储元素的自定义属性
const clickOutsideMap = new WeakMap<HTMLElement, (event: Event) => void>();
const copyHandlerMap = new WeakMap<HTMLElement, () => void>();
const loadingContainerMap = new WeakMap<HTMLElement, HTMLDivElement>();

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

/**
 * v-debounce 指令
 * 防抖指令
 */
export const vDebounce: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, arg = "click" } = binding;
    let timer: number;

    el.addEventListener(arg, (e: Event) => {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => {
        value(e);
      }, 300);
    });
  },
};

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

/**
 * v-loading 指令
 * 加载指令
 */
export const vLoading: Directive = {
  /**
   * 挂载指令
   * @param el 元素
   * @param binding 指令绑定
   */
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const loadingContainer = document.createElement("div");

    loadingContainer.className = "v-loading";
    loadingContainer.innerHTML = `
      <div class="v-loading__spinner">
        <svg viewBox="25 25 50 50">
          <circle cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/>
        </svg>
      </div>
    `;

    if (binding.value) {
      el.appendChild(loadingContainer);
      el.classList.add("v-loading-parent");
    }

    loadingContainerMap.set(el, loadingContainer);
  },
  /**
   * 更新指令
   * @param el 元素
   * @param binding 指令绑定
   */
  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.value !== binding.oldValue) {
      const loadingContainer = loadingContainerMap.get(el);
      if (!loadingContainer) return;

      if (binding.value) {
        el.appendChild(loadingContainer);
        el.classList.add("v-loading-parent");
      } else {
        el.removeChild(loadingContainer);
        el.classList.remove("v-loading-parent");
      }
    }
  },
};

/**
 * v-focus 指令
 * 聚焦指令
 */
export const vFocus: Directive = {
  /**
   * 挂载指令
   * @param el 元素
   */
  mounted(el: HTMLElement) {
    el.focus();
  },
};

/**
 * v-resize 指令
 * 调整大小指令
 */
export const vResize: Directive = {
  /**
   * 挂载指令
   * @param el 元素
   * @param binding 指令绑定
   */
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const observer = new ResizeObserver(entries => {
      binding.value(entries[0]);
    });
    observer.observe(el);

    // 存储observer以便清理
    const resizeMap = new WeakMap<HTMLElement, ResizeObserver>();
    resizeMap.set(el, observer);
  },
  /**
   * 卸载指令
   * @param el 元素
   */
  unmounted(el: HTMLElement) {
    const resizeMap = new WeakMap<HTMLElement, ResizeObserver>();
    const observer = resizeMap.get(el);
    if (observer) {
      observer.disconnect();
      resizeMap.delete(el);
    }
  },
};
