---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** 视觉隐藏组件 `VisuallyHidden`（Vue / React 的 `XhVisuallyHidden`，Web Components 的 `<xh-visually-hidden>`）：包住的内容在屏幕上看不见、读屏照读，仍留在无障碍树、布局与表单里，用来给同名链接补上下文、把只靠样式传达的意思写成文字。与 `hidden`、`display: none` 不同，内容不被拿出无障碍树；与 `aria-label` 不同，藏起来的是真实的文字节点，放在任何元素里都读得到。

- 新增 `focusable`（缺省为假）：里面的链接或按钮获得焦点时整段撤掉隐藏、回到正常排版，焦点离开再藏回去，给「跳到正文」这类跳转链接用；根上落 `data-focusable`。显出来的样子与聚焦环都归里面那个可聚焦元素，组件不另铺面。
- 解剖只有 `root`，渲染为行内的 `span`；Web Components 由作者写 `data-xh-part="root"` 的行内容器，元素不改动其中的节点。没有状态机、事件与文案。
- 皮肤 `visually-hidden.css` 的藏法与工具类 `.xh-visually-hidden` 是同一组声明；工具类照旧可用，给不经组件渲染的节点用。
