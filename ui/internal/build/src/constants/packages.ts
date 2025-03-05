import { resolve } from "path";

export const packages = {
  utils: resolve(process.cwd(), "packages/utils"),
  constants: resolve(process.cwd(), "packages/constants"),
  hooks: resolve(process.cwd(), "packages/hooks"),
  icons: resolve(process.cwd(), "packages/icons"),
  directives: resolve(process.cwd(), "packages/directives"),
  locales: resolve(process.cwd(), "packages/locales"),
  components: resolve(process.cwd(), "packages/components"),
  themes: resolve(process.cwd(), "packages/themes"),
  xihanui: resolve(process.cwd(), "xihan-ui"),
};

export const entries = {
  "@xihan-ui/utils": resolve(packages.utils, "src/index.ts"),
  "@xihan-ui/constants": resolve(packages.constants, "src/index.ts"),
  "@xihan-ui/hooks": resolve(packages.hooks, "src/index.ts"),
  "@xihan-ui/icons": resolve(packages.icons, "src/index.ts"),
  "@xihan-ui/directives": resolve(packages.directives, "src/index.ts"),
  "@xihan-ui/themes": resolve(packages.themes, "src/index.scss"),
  "@xihan-ui/locales": resolve(packages.locales, "src/index.ts"),
  "@xihan-ui/components": resolve(packages.components, "src/index.ts"),
  "xihan-ui": resolve(packages.xihanui, "src/index.ts"),
};
