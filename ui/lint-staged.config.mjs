export default {
  // 处理 JavaScript 和 TypeScript 文件
  "*.{js,jsx,ts,tsx,vue,mjs,cjs}": ["eslint --fix", "prettier --write"],
  // 处理样式文件
  "*.{css,scss,less}": ["prettier --write"],
  // 处理 HTML 和 JSON 文件
  "*.{html,json}": ["prettier --write"],
  // 处理 Markdown 文件
  "*.md": ["prettier --write"],
};
