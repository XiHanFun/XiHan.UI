---
'@xihan-ui/headless': major
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**CodeView 的折叠条接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
代码块此前没有状态机，按 button 的先例补最小机器 `codeViewMachine`（state `idle`，context `pressed`，事件 `PRESS.START` / `PRESS.END`，
守卫 `canPress` 只在代码可折叠时放行——不可折叠时折叠条带 `hidden`；按住途中代码或阈值变了、折叠条随之收起时由机器松开）。

**破坏性：`connectCodeView` 由 `(props, scope, normalize)` 改为 `(service, normalize)`**，与其余跑机器的组件同构；`CodeViewProps` 仍导出
（= `CodeViewSchema['props']`），新增导出 `codeViewMachine`、`CodeViewSchema` 与 `isCodeViewFoldable`（connect 与守卫共用的可折叠判据）。
直接调用 headless 的使用者需改为先建机器并把 scope 交给它。

三端：Vue / React / Web Components 的 CodeView 改跑 `codeViewMachine`（公开 props、事件与部件不变）；`<xh-code-view>` 只在作者未给
`highlighter` 时于 wire 阶段请求默认着色包，读 props 的路径不再触发加载。键盘表新增 `code-view.kbd.press`。
