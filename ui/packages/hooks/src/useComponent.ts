import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface ComponentOptions {
  /** 组件名称 */
  name?: string;
  /** 是否自动挂载 */
  autoMount?: boolean;
  /** 挂载目标 */
  target?: string | Element;
}

export interface ComponentInstance {
  /** 组件实例 */
  instance: Ref<any>;
  /** 挂载状态 */
  isMounted: Ref<boolean>;
  /** 挂载组件 */
  mount: (props?: Record<string, any>) => void;
  /** 卸载组件 */
  unmount: () => void;
  /** 更新组件 */
  update: (props: Record<string, any>) => void;
}

/**
 * 使用组件实例
 * @param component - 组件
 * @param options - 配置选项
 * @returns 组件实例
 */
export function useComponent(component: any, options: ComponentOptions = {}): ComponentInstance {
  const { name, autoMount = true, target = "body" } = options;
  const instance = ref<any>(null);
  const isMounted = ref(false);

  const mount = (props?: Record<string, any>) => {
    if (isMounted.value) return;

    const targetElement = typeof target === "string" ? document.querySelector(target) : target;
    if (!targetElement) {
      console.warn(`Target element "${target}" not found`);
      return;
    }

    instance.value = new component({
      propsData: props,
      parent: null,
    });

    instance.value.$mount();
    targetElement.appendChild(instance.value.$el);
    isMounted.value = true;
  };

  const unmount = () => {
    if (!isMounted.value) return;

    instance.value.$destroy();
    instance.value = null;
    isMounted.value = false;
  };

  const update = (props: Record<string, any>) => {
    if (!isMounted.value) return;

    Object.assign(instance.value.$props, props);
  };

  onMounted(() => {
    if (autoMount) {
      mount();
    }
  });

  onUnmounted(() => {
    unmount();
  });

  return {
    instance,
    isMounted,
    mount,
    unmount,
    update,
  };
}
