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
    // 正文里的代码块：打印取值是文档的表达方式，一行写完的回调也是
    files: ["**/*.md/**"],
    rules: {
      "no-console": "off",
      "style/max-statements-per-line": "off",
    },
  },
);
