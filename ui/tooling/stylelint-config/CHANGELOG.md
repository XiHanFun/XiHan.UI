# @xihan-ui/stylelint-config

## 0.1.0

### Minor Changes

- b9b6e1a: **原生细条迁到 reset 层，新增 `data-xh-scroll` 作者入口。**

  组件内滚动面只有两档（设计真源 §6.6）：Overlay 家族与定高小列表接自绘条，页内结构容器走原生细条。此前那套细条规则（`scrollbar-width: thin` + 令牌色阶 + `::-webkit-scrollbar` 五条）住在 `scrollbar.css` 的 `xihan.components` 层，只有引了 Scrollbar 皮肤才生效，且只命中 `[data-scope][data-part]`——作者自己的滚动容器、文档示例、Typography prose 里的 `<pre>` 都吃不到。现在整段迁进 `reset.css`：选择器扩成 `:where([data-scope][data-part], [data-xh-scroll], [data-scope='typography'][data-part='prose'] pre)`，特指度仍是 (0,0,0)。作者在自建滚动容器上写 `data-xh-scroll` 即得同一套细条，不必引任何组件；`data-xh-scroll` 只挂样式，不进任何组件契约。原来那条 `scrollbar-gutter: auto` 不再写——它是初始值，`stable` 只给内容高度会变的容器由皮肤显式写。

  按需只引 `scrollbar.css` 的用户注意：细条规则不再随它带出，改由 `reset.css` 提供（`index.css` / `index.unlayered.css` 两份入口都已含）。`[data-xh-scrollbar]` 藏原生条那两条仍留在 `scrollbar.css`，它是 Scrollbar 组件的契约，(0,1,0) 在两种产物里都压得过 reset。

  随之收口的手写：`time-picker` / `time-range-picker` 的时间列与快捷列删掉自带的 `scrollbar-width: thin`（reset 已覆盖）；`menubar` / `popconfirm` 的 positioner 删掉死声明 `--xh-scrollbar-track-bg: transparent`（两者都没接自绘条，接线时随壳一起加回）。

  `@xihan-ui/stylelint-config` 新增两条：`scrollbar-width` 只许写 `none`（挂了自绘条时藏原生条），`scrollbar-color` 一律不许写；`reset.css` 与内联它的 `index.unlayered.css` 通过 override 放开这两条，其余禁用项原样保留。

  `check-scrollbar-hosts` 扩成滚动面归档门禁：`scroll-surface-registry.json` 逐面登记两档归属与 `overscroll` / `gutter` 该不该写；皮肤里每一处 `overflow: auto|scroll` 都得在表里、表里每一条都得扫得到；自绘面核三端接线、轴齐全、浮层壳 `size: 'sm'`；原生面不得自己写 `scrollbar-width` / `scrollbar-color`；`--xh-scrollbar-track-bg` 只有宿主的壳才有资格声明。尚未达标的面记在同一份 JSON 的 backlog 段，逐条理由，命中即删、只减不增。

  文档站的页面与侧栏滚动条回到与组件同一 `type`（`scroll-hover`）与令牌色阶，不再另写 `type="scroll"` 与三条滑块色覆写。

  `reset.css` 里原生细条的 `::-webkit-scrollbar-thumb` 圆角改取 `var(--xh-shape-pill)`：原生滑块与自绘 `scrollbar:thumb` 同为一维对象，形状身份是胶囊，不再按厚度折半凑半圆（三档厚度下可见形状不变）。`check-shape-scale` 的 NO_SLOT 登记 `reset:*::-webkit-scrollbar-thumb`，主体为 `:where(…)` 一组宿主的规则部件位记作 `*`。
