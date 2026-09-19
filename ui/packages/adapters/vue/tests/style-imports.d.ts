// 浏览器态用例以副作用方式引样式表；这两个模块只出 CSS，没有类型入口。
declare module '@xihan-ui/styles'
declare module '*.css'

// 有的用例要查皮肤源码本身（比如同一属性写了两条声明，CSSOM 只留胜出的那条，看不见另一条），
// 用 Vite 的 ?raw 把文件按字符串取进来。
declare module '*?raw' {
  const content: string
  export default content
}

// 有的用例要把一份产物装进 iframe 的 <link>，用 Vite 的 ?url 取它的服务地址。
declare module '*?url' {
  const url: string
  export default url
}
