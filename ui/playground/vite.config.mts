import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";

const packages = {
  utils: resolve(__dirname, "../packages/utils/src"),
  constants: resolve(__dirname, "../packages/constants/src"),
  hooks: resolve(__dirname, "../packages/hooks/src"),
  icons: resolve(__dirname, "../packages/icons/src"),
  directives: resolve(__dirname, "../packages/directives/src"),
  themes: resolve(__dirname, "../packages/themes/src"),
  locales: resolve(__dirname, "../packages/locales/src"),
  components: resolve(__dirname, "../packages/components/src"),
  xihanui: resolve(__dirname, "../packages/xihan-ui/src"),
};

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());

  return {
    // 基础配置
    base: env.VITE_PUBLIC_PATH,
    publicDir: "public",

    // 插件配置
    plugins: [vue(), vueJsx()],

    // 路径解析
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@xihan-ui/utils": packages.utils,
        "@xihan-ui/constants": packages.constants,
        "@xihan-ui/hooks": packages.hooks,
        "@xihan-ui/icons": packages.icons,
        "@xihan-ui/directives": packages.directives,
        "@xihan-ui/themes": packages.themes,
        "@xihan-ui/locales": packages.locales,
        "@xihan-ui/components": packages.components,
        "xihan-ui": packages.xihanui,
      },
      preserveSymlinks: true,
      extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue", ".scss", ".css"],
    },

    // CSS 处理
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },

    // 优化依赖
    optimizeDeps: {
      include: ["vue"],
    },

    // 服务器配置
    server: {
      host: "0.0.0.0",
      port: 9709,
      open: true,
      cors: true,
      proxy: {
        [env.VITE_API_URL_PREFIX]: {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp(`^${env.VITE_API_URL_PREFIX}`), ""),
        },
      },
    },
  };
});
