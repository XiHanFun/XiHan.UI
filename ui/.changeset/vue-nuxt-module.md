---
'@xihan-ui/vue': minor
---

**新增** `@xihan-ui/vue/nuxt`：Nuxt 模块，`nuxt.config` 里写 `modules: ['@xihan-ui/vue/nuxt']` 即可。模块把主入口的全部组件登记给 Nuxt，模板里直接写 `<XhButton>` / `<xh-button>`，按用到的组件从主入口导入，照常摇树；应用自己同名的组件不被顶掉。令牌与皮肤注入在应用样式之前，`styles: 'unlayered'` 换无层的一份，`false` 不注入。SSR 首帧主题：服务端把八轴视觉环境渲染到 `<html>` 上，head 里一段内联脚本在首帧前按与控制器同一套规则读回读者存过的偏好并解出系统轴，客户端随后接管成视觉环境控制器，经 `useNuxtApp().$xhVisual` 交给应用；服务端每个请求也有一个，`<html>` 上的属性跟着它。选项写在 `xihanUI` 下或模块元组的第二项，`nuxt.config` 里有类型提示，写错的值在构建时就报。模块不依赖 `@nuxt/kit` 与 nuxt 的类型包。

仓库根新增 `examples/nuxt` 示例，CI 每轮把本仓的包打出来装进示例，类型检查、构建并起服务检查首屏（`pnpm gate:nuxt`）。
