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
      alias: {
        "@xihan-ui/*": resolve(__dirname, "../packages/*"),
        "xihan-ui": resolve(__dirname, "../xihan-ui"),
      },
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
