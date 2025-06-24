import type { App, Component, DefineComponent } from "vue";
import { XiHan, XH_CAMELCASE_PREFIX } from "@xihan-ui/constants";

type ComponentType = any;

export interface XiHanInstance {
  version: string;
  componentPrefix: string;
  install: (app: App) => void;
}

interface XiHanCreateOptions {
  components?: ComponentType[];
  componentPrefix?: string;
}

function create({ componentPrefix = XH_CAMELCASE_PREFIX, components = [] }: XiHanCreateOptions = {}): XiHanInstance {
  const installTargets: App[] = [];
  function registerComponent(app: App, name: string, component: ComponentType): void {
    const registered = app.component(componentPrefix + name);
    if (!registered) {
      app.component(componentPrefix + name, component as Component<any> | DefineComponent<any>);
    }
  }
  function install(app: App): void {
    if (installTargets.includes(app)) return;
    installTargets.push(app);
    components.forEach(component => {
      const { name, alias } = component;
      registerComponent(app, name as string, component);
      if (alias) {
        alias.forEach((aliasName: string) => {
          registerComponent(app, aliasName, component);
        });
      }
    });
  }
  return {
    version: XiHan.Version,
    componentPrefix,
    install,
  };
}

export default create;
