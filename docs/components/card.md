# Card <Badge type="info" text="卡片" />

一块有边界的内容容器：封面、标题、正文与页脚各占一段。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/card" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/card.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/card" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/card" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/card.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

除了 root，封面、头、身、脚都可选；只写用得上的那几段

<XhDemo src="card/01-basic" />

## 示例

### 形态

variant 只改描边、底色与投影怎么用，各段的排版三档一致

<XhDemo src="card/02-variant" />

### 尺寸

size 换的是各段的内边距与标题字号，不写 size 即默认档

<XhDemo src="card/03-size" />

### 分段与悬停

split 在段与段之间画一条分隔线；hoverable 只在能用指针的设备上抬起

<XhDemo src="card/04-split" />

### 带封面

封面顶到根的边上、不吃内边距，圆角由根统一裁

<XhDemo src="card/05-cover" />

## 设计指引

### 何时使用

- 把一组相关信息收成一个可以整体感知的单元。
- 内容块之间需要视觉边界。

### 何时不用

- 页面上每一块都套卡片：边界失效，只剩噪音。
- 只是要一条分隔：用[分隔线](./separator)。

### 特性

- 七个部件全部可选，只写用得上的那几段。
- `split` 在各段之间画线，`hoverable` 给出悬停反馈。


默认 outline 使用 M1 柔和实体面：细边、单像素顶光和轻接触影；正文保持不透明，卡片不模糊背后内容。subtle 保留淡底无影，elevated 使用 raised 投影，ghost 保持透明。hoverable 在可悬停设备上提升边界与投影，不移动布局。高对比模式取消装饰高光并增强边界，打印时移除高光与投影。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-card>` |
| Vue 组件 | `XhCardBody` `XhCardDescription` `XhCardFooter` `XhCardHeader` `XhCardMedia` `XhCardRoot` `XhCardTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/card.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="card"`：**`root`** · `media` · `header` · `title` · `description` · `body` · `footer`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `hoverable` | `boolean` |  | 指针悬停时抬起：只落 data-hoverable，抬多少由皮肤定。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定各段的内边距与标题字号。 |
| `split` | `boolean` |  | 分段：在头、身、脚之间画分隔线。 |
| `variant` | `CardVariant` |  | 形态：outline / subtle / elevated / ghost，决定描边、底色与投影怎么用。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getMediaProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/card.css` 按部件选择：`[data-scope="card"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-card-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-material-soft-bg` | card 的 root 部件 background 覆盖槽。 |
| `--xh-card-body-pt` | `body`<br>`header` | `padding-block-start` | `default` | `--xh-space-2` | card 的 body、header 部件 padding-block-start 覆盖槽。 |
| `--xh-card-border` | `root` | `border-color` | `variant=outline` | `--xh-border-default` | card 的 root 部件 border-color 覆盖槽。 |
| `--xh-card-border-hover` | `root` | `border-color` | `@media (hover: hover)`<br>`hover`<br>`hoverable` | `--xh-border-strong` | card 的 root 部件 border-color 覆盖槽。 |
| `--xh-card-description-fg` | `description` | `color` | `default` | `--xh-material-soft-fg-muted` | card 的 description 部件 color 覆盖槽。 |
| `--xh-card-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | card 的 description 部件 font-size 覆盖槽。 |
| `--xh-card-divider` | `body`<br>`footer`<br>`root` | `border-block-start` | `split` | `--xh-material-soft-separator` | card 的 body、footer、root 部件 border-block-start 覆盖槽。 |
| `--xh-card-fg` | `root` | `color` | `default` | `--xh-material-soft-fg` | card 的 root 部件 color 覆盖槽。 |
| `--xh-card-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | card 的 footer 部件 gap 覆盖槽。 |
| `--xh-card-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` | card 的 footer 部件 padding-block-start 覆盖槽。 |
| `--xh-card-header-gap` | `header` | `gap` | `default` | `--xh-space-1` | card 的 header 部件 gap 覆盖槽。 |
| `--xh-card-header-pb` | `header` | `padding-block-end` | `default` | `--xh-space-2` | card 的 header 部件 padding-block-end 覆盖槽。 |
| `--xh-card-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | card 的 root 部件 border-radius 覆盖槽。 |
| `--xh-card-shadow` | `root` | `box-shadow` | `default`<br>`variant=elevated` | `--xh-elevation-raised`<br>`--xh-material-soft-shadow` | card 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-card-shadow-hover` | `root` | `box-shadow` | `@media (hover: hover)`<br>`hover`<br>`hoverable` | `--xh-elevation-lifted` | card 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-card-title-font-size` | `root`<br>`title` | `font-size` | `default`<br>`size=lg` | `--xh-control-font-lg`<br>`--xh-text-label-size` | card 的 root、title 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`border-color` · `box-shadow` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`hover: hover`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## 组合

- 里面放[描述列表](./descriptions)、[表格](./table)、[统计数值](./statistic)；页脚放[按钮组](./button-group)。

## 最佳实践

- 整卡可点时要有明显的悬停与聚焦反馈，并让整卡进 Tab 序列。
- 卡片内的留白统一，别让每张卡的内边距不一样。

## 反模式

- 卡片套卡片：两层边界互相削弱。
- 整卡可点的同时卡内还有别的按钮：点哪里会发生什么不可预期。
