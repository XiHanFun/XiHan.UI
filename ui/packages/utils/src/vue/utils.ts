import { type Component, type App, defineAsyncComponent } from "vue";

/**
 * 批量注册全局组件（支持前缀）
 * @param app - 应用实例
 * @param components - 组件列表
 * @param options - 选项
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
 * @param app - 应用实例
 * @param directives - 指令列表
 */
export function registerDirectives(app: App, directives: Record<string, any>) {
  Object.entries(directives).forEach(([name, directive]) => {
    app.directive(name, directive);
  });
}

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

/**
 * Props 类型推导工具
 * @param props - 属性
 * @returns 返回属性
 */
export function defineProps<T extends Record<string, any>>(props: T) {
  return props;
}
