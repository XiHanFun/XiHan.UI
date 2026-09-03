---
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**补齐两个适配器漏露的 headless 能力：七个浮层的 `dir`、五个元素的 `translations`、分页省略位浮层的四项。**

`dir` 是条真接线：机器把它交给定位引擎翻转行内轴，connect 把它写到被搬走的浮层落点上——那里继承不到作者子树的方向，只能由作者显式给。41 个组件在 headless 的作者面声明了它，`combobox` / `date-picker` / `mention` / `popover` / `time-picker` / `tooltip` / `tour` 这七个两个适配器一侧都没露，而文档站的 Props 表照登，RTL 下这七个浮层的 `-start` / `-end` 落点翻不过来。现在两侧都有：Vue 是 `dir` prop，Web Components 是 `dir` 属性（字段名 `direction`，避开 HTMLElement 自带的存取器）。

`translations` 是逐实例的读屏文案。Vue 侧 64 个组件全都做成了 prop，Web Components 侧 `dialog` / `resizable` / `sortable` / `table` / `tags-input` 五个没有这条通道，作者只能用 `<xh-config>` 改整棵子树。`sortable` 与 `table` 尤其吃亏：键盘拖拽的拾起 / 移动 / 放下 / 取消四句播报全在里面。五个元素现在都收 `translations` property（对象递不进属性）并转交进机器。

`pagination` 的省略位是个可展开的悬停浮层，headless 给了 `placement` / `offset` / `openDelay` / `closeDelay` 四项，`<xh-pagination>` 四项全露，`XhPaginationRoot` 一项都没有。Vue 侧补齐，缺省值仍由 connect 给。

两道门禁跟着立：新增 `check-dir-exposed`——headless 作者面声明了 `dir` 的组件，两个适配器都必须露出来且转交进机器，反向还查「适配器露了 headless 却没声明」（复合件登记进 `COMPOSED`，带过期反查）；`check-config-wiring` 的 translations 判据从「跑没跑机器」加严成「元素上有没有这个 property、有没有转交进 props」。
