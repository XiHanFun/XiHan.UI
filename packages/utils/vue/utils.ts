import { type Component, type App, defineAsyncComponent } from "vue";

/**
 * Vue 工具函数集
 */

/**
 * 批量注册全局组件（支持前缀）
 */
export function registerComponents(app: App, components: Record<string, Component>, options: { prefix?: string } = {}) {
  const { prefix = "" } = options;

  Object.entries(components).forEach(([name, component]) => {
    const componentName = prefix ? `${prefix}${name}` : name;
    app.component(componentName, component);
  });
}

/**
 * 批量注册全局指令
 */
export function registerDirectives(app: App, directives: Record<string, any>) {
  Object.entries(directives).forEach(([name, directive]) => {
    app.directive(name, directive);
  });
}

/**
 * 创建异步组件（支持更多配置）
 */
export function createAsyncComponent(
  loader: () => Promise<Component>,
  options: {
    delay?: number;
    timeout?: number;
    loadingComponent?: Component;
    errorComponent?: Component;
    onError?: (error: Error) => void;
  } = {}
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

/**
 * Props 类型推导工具
 */
export function defineProps<T extends Record<string, any>>(props: T) {
  return props;
}
