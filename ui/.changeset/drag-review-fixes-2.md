---
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
---

**修复** 拖动中版面滚走之后落点全错。落点矩形是按下那一刻量的，而拖动中页面、祖先或
容器自己都可能滚动，快照不跟着动，指示线就指着另一项。参照取**拖动源自己**而不是容器：
容器自己内部滚动时它的矩形一动不动，量不出来；而拖动中被拖的项原地不动（只画指示线、
不做跟手让位），它挪了多远，所有人就挪了多远。

命中与激活分在两个坐标系里判：命中要减掉版面漂移换算回快照坐标，激活看的是「手指动没动」，
用原始视口坐标——内容滚过去了但手没动，不算拖了一段。

**修复** `table` 的 `Alt` + 方向键在没打开 `rowReorderable` 时也吞键。另外三处（列、树、
标签）都是「开关关着就放行给页面」，只有它不一样。降级（排序中、树形行、只渲了一段）时
照样挡住——键是认下了的，只是这张表此刻搬不动。

**修复** 八个 Vue 组件收不到全局配置里的读屏文案：`combobox` / `popselect` / `resizable` /
`sortable` / `table` / `tabs` / `text-field` / `tree`。跑机器的组件经 `useMachine` 只并了
`locale` 与 `size`（`fillXhConfigDefaults` 只认这两个键），而 `translations` 按组件名分桶、
只有 `withXhConfig` 认得出自己是谁。`table` 连实例上的 `translations` prop 都没有，一并补上。

`check-config-wiring` 把「跑了机器」当作 translations 已接线，是这八个一起漏网的原因。
判据拆开：`size` 认 `useMachine` 或 `withXhConfig`，`translations` 只认 `withXhConfig`。
