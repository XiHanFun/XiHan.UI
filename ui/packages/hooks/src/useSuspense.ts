import { ref, onErrorCaptured, defineComponent, h, Suspense, Fragment } from "vue";
mport type { Component, AsyncComponentLoader } from "vue";
import { useAsyncComponent } from "./useAsyncComponent";

/**
 * 使用Suspense
 * @param loader - 异步组件加载函数
 * @param loadingComponent - 加载中显示的组件
 * @param errorComponent - 错误时显示的组件
 * @returns 封装好的组件和状态
 */
export function useSuspense(
  loader: AsyncComponentLoader,
  loadingComponent?: Component,
  errorComponent?: Component,
) {
  const { component, state } = useAsyncComponent(loader);
  const { loading, error, retry } = state;

  // 创建Suspense组件
  const SuspenseComponent = defineComponent({
    name: "SuspenseComponent",

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
