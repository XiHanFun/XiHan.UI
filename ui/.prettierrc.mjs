export default {
  // 在语句末尾添加分号
  semi: true,
  // 使用双引号
  singleQuote: false,
  // 缩进使用 2 个空格
  tabWidth: 2,
  // 使用空格而不是制表符进行缩进
  useTabs: false,
  // 在对象、数组等最后一个元素后添加逗号
  trailingComma: "all",
  // 一行最多 120 字符
  printWidth: 120,
  // 对象字面量的大括号间使用空格 { foo: bar }
  bracketSpacing: true,
  // 箭头函数，只有一个参数的时候，不加括号
  arrowParens: "avoid",
  // 换行符使用 lf
  endOfLine: "lf",
  // 缩进 Vue 文件中的 script 和 style 标签
  vueIndentScriptAndStyle: true,
  // HTML 空白敏感度
  // 'css' - 遵循 CSS display 属性的默认值
  htmlWhitespaceSensitivity: "css",
  // 控制标签的闭合位置
  bracketSameLine: false,
  // 在 JSX 中使用单引号
  jsxSingleQuote: false,
  // 对象属性引号使用规则
  quoteProps: "as-needed",
  // 嵌入式代码格式化
  embeddedLanguageFormatting: "auto",
  // 特定文件类型的配置
  overrides: [
    {
      files: "*.{ts,tsx}",
      options: {
        parser: "typescript",
      },
    },
    {
      files: "*.vue",
      options: {
        parser: "vue",
      },
    },
    {
      files: "*.{css,scss,less}",
      options: {
        parser: "css",
      },
    },
    {
      files: "*.html",
      options: {
        parser: "html",
      },
    },
  ],
};
