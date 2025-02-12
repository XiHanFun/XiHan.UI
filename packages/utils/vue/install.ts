import type { App, Component, Directive, Plugin } from "vue";

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
 */
function registerComponents(app: App, components: Record<string, Component>, prefix = "Xh") {
  for (const [name, component] of Object.entries(components)) {
    const componentName = prefix + name;
    app.component(componentName, component);
  }
}

/**
 * 注册指令
 */
function registerDirectives(app: App, directives: Record<string, Directive>) {
  for (const [name, directive] of Object.entries(directives)) {
    app.directive(name, directive);
  }
}

/**
 * 注册插件
 */
function registerPlugins(app: App, plugins: Plugin[]) {
  plugins.forEach(plugin => app.use(plugin));
}

/**
 * 创建安装器
 */
export function makeInstaller(options: InstallOptions = {}) {
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
    if (process.env.NODE_ENV === "development") {
      app.config.performance = true;
    }
  };

  return {
    install,
    version: "__VERSION__", // 在构建时替换
  };
}

/**
 * 创建异步安装器
 */
export function makeAsyncInstaller(loader: () => Promise<InstallOptions>) {
  return {
    async install(app: App) {
      const options = await loader();
      const installer = makeInstaller(options);
      await installer.install(app);
    },
  };
}

/**
 * 创建组件安装器
 */
export function makeComponentInstaller<T extends Component>(component: T) {
  return {
    install(app: App) {
      app.component(component.name || "", component);
    },
  };
}
