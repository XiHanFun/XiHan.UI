import type { App, Component, Directive, Plugin } from "vue";

/**
 * 安装选项
 */
export interface InstallOptions {
  prefix?: string;
  zIndex?: number;
  locale?: string;
  components?: Record<string, Component>;
  directives?: Record<string, Directive>;
  plugins?: Plugin[];
}

/**
 * 注册组件
 * @param app - 应用实例
 * @param components - 组件列表
 * @param prefix - 组件前缀
 */
export const registerComponents = (app: App, components: Record<string, Component>, prefix = "Xh") => {
  for (const [name, component] of Object.entries(components)) {
    const componentName = prefix + name;
    app.component(componentName, component);
  }
};

/**
 * 注册指令
 * @param app - 应用实例
 * @param directives - 指令列表
 */
export const registerDirectives = (app: App, directives: Record<string, Directive>) => {
  for (const [name, directive] of Object.entries(directives)) {
    app.directive(name, directive);
  }
};

/**
 * 注册插件
 * @param app - 应用实例
 * @param plugins - 插件列表
 */
export const registerPlugins = (app: App, plugins: Plugin[]) => {
  plugins.forEach(plugin => app.use(plugin));
};

/**
 * 创建安装器
 * @param options - 安装选项
 */
export const makeInstaller = (options: InstallOptions = {}) => {
  const { prefix = "Xh", components = {}, directives = {}, plugins = [], zIndex = 2000, locale = "zh-CN" } = options;

  const install: Plugin["install"] = (app: App) => {
    // 注册组件
    registerComponents(app, components, prefix);

    // 注册指令
    registerDirectives(app, directives);

    // 注册插件
    registerPlugins(app, plugins);

    // 注入全局配置
    app.config.globalProperties.$XIHAN = {
      zIndex,
      locale,
    };

    // 提供主题配置
    app.provide("theme", {
      mode: "light",
      setMode: (mode: string) => {
        document.documentElement.setAttribute("data-theme", mode);
      },
    });

    // 添加错误处理
    app.config.errorHandler = (err, vm, info) => {
      console.error("XihanUI Error:", err, vm, info);
    };

    // 添加警告处理
    app.config.warnHandler = (msg, vm, trace) => {
      console.warn("XihanUI Warning:", msg, vm, trace);
    };

    // 性能追踪（开发模式）
    if (import.meta.env.DEV) {
      app.config.performance = true;
    }
  };

  return {
    install,
    version: "__VERSION__", // 在构建时替换
  };
};

/**
 * 创建异步安装器
 * @param loader - 加载器
 */
export const makeAsyncInstaller = (loader: () => Promise<InstallOptions>) => {
  return {
    async install(app: App) {
      const options = await loader();
      const installer = makeInstaller(options);
      await installer.install(app);
    },
  };
};

/**
 * 创建组件安装器
 * @param component - 组件
 */
export const makeComponentInstaller = <T extends Component>(component: T) => {
  return {
    install(app: App) {
      app.component(component.name || "", component);
    },
  };
};
