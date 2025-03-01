import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";

// 定义包目录（指向构建后的包，而非源码）
const packages = {
  utils: resolve(__dirname, "../packages/utils"),
  constants: resolve(__dirname, "../packages/constants"),
  hooks: resolve(__dirname, "../packages/hooks"),
  icons: resolve(__dirname, "../packages/icons"),
  directives: resolve(__dirname, "../packages/directives"),
  themes: resolve(__dirname, "../packages/themes"),
  locales: resolve(__dirname, "../packages/locales"),
  components: resolve(__dirname, "../packages/components"),
  xihanui: resolve(__dirname, "../xihan-ui"),
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
    },

    // CSS 处理
    css: {
      preprocessorOptions: {
        scss: {},
      },
      devSourcemap: true,
    },

    // 优化依赖
    optimizeDeps: {
      include: ["vue"],
      exclude: ["xihan-ui", "@xihan-ui/icons"],
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
