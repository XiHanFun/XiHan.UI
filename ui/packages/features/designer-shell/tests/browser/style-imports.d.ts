// 测试里按副作用引入样式表；构建与类型检查只需要知道这类模块存在。
declare module '*.css'

// 有的用例要把一份样式表装进 iframe 的 <link>，用 Vite 的 ?url 取它的服务地址。
declare module '*?url' {
  const url: string
  export default url
}
