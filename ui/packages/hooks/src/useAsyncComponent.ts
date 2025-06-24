import { ref } from "vue";
import type { Ref, Component, AsyncComponentLoader } from "vue";

export interface AsyncComponentState {
  /** 是否正在加载 */
  loading: Ref<boolean>;
  /** 加载错误（如果有） */
  error: Ref<Error | null>;
  /** 是否加载完成 */
  loaded: Ref<boolean>;
  /** 重新加载组件 */
  retry: () => void;
}

/**
 * 使用异步组件加载
 * @param loader - 异步组件加载函数
 * @returns 加载状态与组件引用
 */
export function useAsyncComponent(loader: AsyncComponentLoader): {
  component: Ref<Component | null>;
  state: AsyncComponentState;
} {
  const component: Ref<Component | null> = ref(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);
  const loaded = ref(false);

  // 加载组件
  const load = () => {
    loading.value = true;
    error.value = null;

    loader()
      .then(comp => {
        component.value = comp.default || comp;
        loaded.value = true;
      })
      .catch(err => {
        error.value = err;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  // 初始加载
  load();

  // 返回状态与组件
  return {
    component,
    state: {
      loading,
      error,
      loaded,
      retry: load,
    },
  };
}
