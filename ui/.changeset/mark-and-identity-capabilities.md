---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**标记与身份族补齐四项能力**，全是新增：不写新 prop、不加新部件的既有用法逐值不变。

**`separator` 补带分节文字的三段形态。** 解剖由 `['root']` 扩为 `['root', 'line', 'content']`：
渲染了 `content` 之后 `root` 改当容器，两条 `line` 夹着文字，间距、字号与靠边时的线长全部走令牌。
形态由部件在不在决定，没有开关。Vue 侧新增 `XhSeparatorRoot` / `XhSeparatorLine` /
`XhSeparatorContent` 三个部件组件；`XhSeparator` 保留为一体式入口——不给插槽仍是今天那一条线，
给了插槽自动排成三段。此前 `XhSeparator` 收到插槽会投一条 `core.ignored-slot` 诊断并丢掉内容，
这条诊断随之删除。同批补三个 prop：`align`（`start` / `center` / `end`，缺省居中）、
`variant`（`default` / `subtle` / `strong`，三档只换线的深浅）、`dashed`（虚线，横竖两个朝向
各自成立，段长走 `--xh-separator-dash-length` / `--xh-separator-dash-gap`）。
三者缺省档都不落 DOM 属性。

**`avatar` 补 `tone` 语气轴。** 落 `root` 的 `data-tone`，换的是淡底与回退字的配色族；
整块规则带 `[data-tone]` 限定，没写语气的头像逐值不变。不开形态轴——头像只有「淡底 + 字/图」
一种形态，实心底会压住图片。

**`watermark` 补字体与图片两项能力。** `fontFamily` 指定印文字的字体（缺省 `sans-serif`，
与从前产出逐字相同）；`image` 在文字上方印一张图，`imageSize` 给它的像素尺寸（缺省 64 × 64）。
两条约束写在类型里也写在文档里：印子是当遮罩用的 SVG，遮罩只取透明度，所以图印出来是**剪影**，
颜色仍由 `--xh-watermark-fg` 给；`image` 只收 `data:image/` 开头的内联图片，别的来源在入口挡下并
报一条诊断——SVG 当图片用时取不到外部资源，收了也印不出东西。文字与图片都空了才落
`data-state="empty"`。

**`tag` 的纯文字自动包 `label`（仅 Vue）。** `<XhTagRoot>前端</XhTagRoot>` 这种写法此前拿不到
`label` 上的截断规则，文字过长会把关闭钮挤出去；现在默认插槽里只有文字时自动包一层
`XhTagLabel`，作者自己写了节点就一个都不动。Web Components 侧是 Light DOM，作者自己写节点，
这件事改到不了，`tag` 的文档里加了一条反模式。
