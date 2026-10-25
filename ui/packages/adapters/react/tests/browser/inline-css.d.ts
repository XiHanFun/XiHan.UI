// Vite 的 ?inline 查询把样式模块换成它的文本；测试的 tsconfig 不带 vite/client，这里补一条。
declare module '*.css?inline' {
  const css: string
  export default css
}
