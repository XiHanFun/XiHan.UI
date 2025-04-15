/**
 * Suspense 辅助函数模块
 * 提供异步组件加载与Suspense相关的工具
 */

import { ref, onErrorCaptured, defineComponent, h, Suspense, Fragment, shallowRef } from "vue";
import type { Ref, Component, AsyncComponentLoader } from "vue";

/**
 * 异步组件加载状态
 */
export interface AsyncComponentState {
  /**
   * 是否正在加载
   */
  loading: Ref<boolean>;

  /**
   * 加载错误（如果有）
   */
  error: Ref<Error | null>;

  /**
   * 是否加载完成
   */
  loaded: Ref<boolean>;

  /**
   * 重新加载组件
   */
  retry: () => void;
}

/**
 * 使用异步组件加载
 * @param loader 异步组件加载函数
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

/**
 * 使用Suspense包装
 * @param loader 异步组件加载函数
 * @param loadingComponent 加载中显示的组件
 * @param errorComponent 错误时显示的组件
 * @returns 封装好的组件和状态
 */
export function useSuspenseWrapper(
  loader: AsyncComponentLoader,
  loadingComponent?: Component,
  errorComponent?: Component,
) {
  const { component, state } = useAsyncComponent(loader);
  const { loading, error, retry } = state;

  // 创建Suspense包装组件
  const SuspenseWrapper = defineComponent({
    name: "SuspenseWrapper",

    setup(_, { slots, attrs }) {
      // 捕获异步错误
      onErrorCaptured(err => {
        error.value = err as Error;
        return false; // 阻止错误继续传播
      });

      return () => {
        // 显示错误组件
        if (error.value && errorComponent) {
          return h(errorComponent, {
            error: error.value,
            retry,
          });
        }

        // 组件已加载
        if (component.value) {
          return h(
            Suspense,
            {
              onPending: () => {
                loading.value = true;
              },
              onResolve: () => {
                loading.value = false;
              },
              onFallback: () => {
                loading.value = true;
              },
            },
            {
              default: () => h(component.value!, attrs),
              fallback: () => (loadingComponent ? h(loadingComponent) : slots.loading?.() || h("div", "Loading...")),
            },
          );
        }

        // 默认加载中状态
        return loadingComponent ? h(loadingComponent) : slots.loading?.() || h("div", "Loading...");
      };
    },
  });

  return {
    SuspenseWrapper,
    state,
  };
}

/**
 * 创建懒加载组件
 * @param loader 异步组件加载函数
 * @param options 选项
 * @returns 懒加载组件
 */
export function createLazyComponent(
  loader: AsyncComponentLoader,
  options: {
    loadingComponent?: Component;
    errorComponent?: Component;
    timeout?: number;
    suspensible?: boolean;
    onError?: (error: Error, retry: () => void) => void;
  } = {},
) {
  const { loadingComponent, errorComponent, timeout = 30000, suspensible = true, onError } = options;

  // 创建异步组件
  return defineComponent({
    name: "LazyComponent",

    async setup(_, { attrs, slots }) {
      const loaded = ref(false);
      const error = ref<Error | null>(null);
      let component: any = null;

      try {
        // 设置超时
        let timeoutId: number | null = null;

        if (timeout > 0) {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = window.setTimeout(() => {
              reject(new Error(`Lazy component load timed out after ${timeout}ms`));
            }, timeout);
          });

          // 使用Promise.race实现超时控制
          component = await Promise.race([loader(), timeoutPromise]);
        } else {
          component = await loader();
        }

        // 清除超时定时器
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }

        loaded.value = true;
      } catch (err) {
        error.value = err as Error;

        if (onError) {
          onError(error.value, () => {
            error.value = null;
            // 重新渲染将触发重试
          });
        }
      }

      return () => {
        if (error.value && errorComponent) {
          return h(errorComponent, {
            error: error.value,
            retry: () => {
              error.value = null;
              // 重新渲染将触发重试
            },
          });
        }

        if (loaded.value && component) {
          const Comp = component.default || component;
          return h(Comp, attrs, slots);
        }

        return loadingComponent ? h(loadingComponent) : slots.loading?.() || h("div", "Loading...");
      };
    },
  });
}

/**
 * 创建错误边界组件
 * @param fallback 发生错误时显示的组件
 * @returns 错误边界组件
 */
export function createErrorBoundary(fallback: Component) {
  return defineComponent({
    name: "ErrorBoundary",

    props: {
      onError: Function,
    },

    setup(props, { slots }) {
      const error = ref<Error | null>(null);
      const info = ref<string>("");

      onErrorCaptured((err, instance, infoMsg) => {
        error.value = err as Error;
        info.value = infoMsg;

        if (props.onError) {
          props.onError(err, instance, infoMsg);
        }

        // 阻止错误继续传播
        return false;
      });

      return () => {
        if (error.value) {
          return h(fallback, {
            error: error.value,
            info: info.value,
            reset: () => {
              error.value = null;
            },
          });
        }

        return h(Fragment, {}, slots.default?.());
      };
    },
  });
}

/**
 * 包装异步函数以用于Suspense
 * @param asyncFn 异步函数
 * @returns 可用于Suspense的函数
 */
export function withSuspense<T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>,
): (...args: Args) => {
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  result: Ref<T | null>;
  then: Promise<T>["then"];
} {
  return (...args: Args) => {
    const loading = ref(true);
    const error = ref<Error | null>(null);
    const result = shallowRef<T | null>(null);
    const suspensePromise = asyncFn(...args);

    suspensePromise
      .then(value => {
        result.value = value;
      })
      .catch(err => {
        error.value = err;
      })
      .finally(() => {
        loading.value = false;
      });

    return {
      loading,
      error,
      result,
      then: suspensePromise.then.bind(suspensePromise),
    };
  };
}
