// 文档站的 lint 配置。
//
// 引号与分号跟库源码相反：示例是给使用者复制走的，沿用示例语料已有的写法，
// 规则在这里钉住，两种风格之间不来回改。
import xihanUi from "@xihan-ui/eslint-config";

export default xihanUi(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      ".vitepress/cache/**",
      "pnpm-lock.yaml",
    ],
    stylistic: {
      indent: 2,
      quotes: "double",
      semi: true,
    },
  },
  {
    // 示例的单行元素连内容写在一行，展开成三行只会让人多读两行
    files: ["**/*.vue"],
    rules: {
      "vue/singleline-html-element-content-newline": "off",
    },
  },
  {
    // 供应链策略不在这份工作区开：文档站吃 vitepress 钉住的 vite 5，
    // 那个版本当前过不了注册表的信任校验，开了策略连依赖都装不上
    files: ["pnpm-workspace.yaml"],
    rules: {
      "pnpm/yaml-enforce-settings": "off",
    },
  },
  {
    // 正文里的代码块：打印取值是文档的表达方式，一行写完的回调也是
    files: ["**/*.md/**"],
    rules: {
      "no-console": "off",
      "style/max-statements-per-line": "off",
    },
  },
);
