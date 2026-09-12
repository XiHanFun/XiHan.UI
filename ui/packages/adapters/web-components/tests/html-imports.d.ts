/** 浏览器测试通过 Vite 原样读取 HTML 示例，不把它当可执行模块。 */
declare module '*.html?raw' {
  const source: string
  export default source
}
