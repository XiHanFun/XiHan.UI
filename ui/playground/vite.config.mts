import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";

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
      alias: [
        { find: "@", replacement: resolve(__dirname, "src") },
        { find: "@xihan-ui/icons/packs", replacement: resolve(__dirname, "../packages/icons/packs") },
        { find: "@xihan-ui/utils", replacement: resolve(__dirname, "../packages/utils/src") },
        { find: "@xihan-ui/constants", replacement: resolve(__dirname, "../packages/constants/src") },
        { find: "@xihan-ui/hooks", replacement: resolve(__dirname, "../packages/hooks/src") },
        { find: "@xihan-ui/icons", replacement: resolve(__dirname, "../packages/icons/src") },
        { find: "@xihan-ui/directives", replacement: resolve(__dirname, "../packages/directives/src") },
        { find: "@xihan-ui/themes", replacement: resolve(__dirname, "../packages/themes/src") },
        { find: "@xihan-ui/locales", replacement: resolve(__dirname, "../packages/locales/src") },
        { find: "@xihan-ui/components", replacement: resolve(__dirname, "../packages/components/src") },
        { find: "xihan-ui", replacement: resolve(__dirname, "../packages/xihan-ui/src") },
      ],
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
