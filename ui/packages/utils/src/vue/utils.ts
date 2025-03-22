import { type Component, defineAsyncComponent } from "vue";

/**
 * 创建异步组件（支持更多配置）
 * @param loader - 加载器
 * @param options - 选项
 */
export function createAsyncComponent(
  loader: () => Promise<Component>,
  options: {
    delay?: number;
    timeout?: number;
    loadingComponent?: Component;
    errorComponent?: Component;
    onError?: (error: Error) => void;
  } = {},
) {
  const { delay = 200, timeout = 3000, loadingComponent, errorComponent, onError } = options;

  return defineAsyncComponent({
    loader,
    loadingComponent,
    errorComponent,
    delay,
    timeout,
    onError,
  });
}
