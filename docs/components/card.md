# Card 卡片

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

## 组件结构

加粗的是必需部件。

`data-scope="card"`：**`root`** · `media` · `header` · `title` · `description` · `body` · `footer`

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


默认形态使用 HeroUI 式纯净实体面、透明边界和轻接触影；`outline` 提供显式描边，`subtle` 使用淡色底，`elevated` 提升投影层级，`ghost` 保持透明。`hoverable` 会按形态增强边界、底色或投影，不移动布局。高对比模式为有实体边界的形态补足系统描边，打印时移除投影。

标题与正文统一到 14px 基准排版，描述降为 13px 次级字号；相邻的头、身、脚只产生一份 8 / 12 / 16px 纵向间距，单独使用任一部件时仍保留完整内边距。这个间距模型保留 XiHan 的可选部件与 `split` 结构，不采用 HeroUI 将全部内容压进单一 `gap + padding` 容器的做法。

### 组合

- 里面放[描述列表](./descriptions)、[表格](./table)、[统计数值](./statistic)；页脚放[按钮组](./button-group)。

### 最佳实践

- 整卡可点时要有明显的悬停与聚焦反馈，并让整卡进 Tab 序列。
- 卡片内的留白统一，别让每张卡的内边距不一样。

### 反模式

- 卡片套卡片：两层边界互相削弱。
- 整卡可点的同时卡内还有别的按钮：点哪里会发生什么不可预期。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-card>` |
| Vue 组件 | `XhCardBody` `XhCardDescription` `XhCardFooter` `XhCardHeader` `XhCardMedia` `XhCardRoot` `XhCardTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/card.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `hoverable` | `boolean` |  | 指针悬停时抬起：只落 data-hoverable，抬多少由皮肤定。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定各段的内边距与标题字号。 |
| `split` | `boolean` |  | 分段：在头、身、脚之间画分隔线。 |
| `variant` | `CardVariant` |  | 形态：outline / subtle / elevated / ghost，决定描边、底色与投影怎么用。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getMediaProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/card.css` 使用 `[data-scope="card"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-card-bg` | `root` | `background`<br>`background-color` | `default`<br>`variant=elevated`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface`<br>`--xh-bg-surface-raised` | card 的 root 部件 background、background-color 覆盖槽。 |
| `--xh-card-bg-hover` | `root` | `background-color` | `@media (hover: hover)`<br>`hover`<br>`hoverable`<br>`variant=elevated`<br>`variant=ghost`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-subtle-hover`<br>`--xh-bg-surface`<br>`--xh-bg-surface-raised` | card 的 root 部件 background-color 覆盖槽。 |
| `--xh-card-body-font-size` | `root` | `font-size` | `default` | `--xh-text-body-size` | card 的 root 部件 font-size 覆盖槽。 |
| `--xh-card-body-line-height` | `root` | `line-height` | `default` | `--xh-text-body-leading` | card 的 root 部件 line-height 覆盖槽。 |
| `--xh-card-body-pb` | `body` | `padding-block-end` | `not(:last-child)` | `--xh-space-0` | card 的 body 部件 padding-block-end 覆盖槽。 |
| `--xh-card-body-pt` | `body`<br>`header` | `padding-block-start` | `default` | `--xh-_card-section-gap` | card 的 body、header 部件 padding-block-start 覆盖槽。 |
| `--xh-card-border` | `root` | `border`<br>`border-color` | `default`<br>`variant=elevated`<br>`variant=ghost`<br>`variant=outline`<br>`variant=subtle` | `--xh-border-default`<br>`transparent` | card 的 root 部件 border、border-color 覆盖槽。 |
| `--xh-card-border-hover` | `root` | `border-color` | `@media (hover: hover)`<br>`hover`<br>`hoverable`<br>`variant=ghost`<br>`variant=outline`<br>`variant=subtle` | `--xh-border-default`<br>`--xh-border-strong`<br>`transparent` | card 的 root 部件 border-color 覆盖槽。 |
| `--xh-card-description-fg` | `description` | `color` | `default` | `--xh-material-soft-fg-muted` | card 的 description 部件 color 覆盖槽。 |
| `--xh-card-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | card 的 description 部件 font-size 覆盖槽。 |
| `--xh-card-divider` | `body`<br>`footer`<br>`root` | `border-block-start` | `split` | `--xh-border-subtle` | card 的 body、footer、root 部件 border-block-start 覆盖槽。 |
| `--xh-card-fg` | `root` | `color` | `default` | `--xh-fg-default` | card 的 root 部件 color 覆盖槽。 |
| `--xh-card-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | card 的 footer 部件 gap 覆盖槽。 |
| `--xh-card-footer-pt` | `body`<br>`footer`<br>`header` | `padding-block-start` | `default` | `--xh-_card-section-gap` | card 的 body、footer、header 部件 padding-block-start 覆盖槽。 |
| `--xh-card-header-gap` | `header` | `gap` | `default` | `--xh-space-1` | card 的 header 部件 gap 覆盖槽。 |
| `--xh-card-header-pb` | `header` | `padding-block-end` | `not(:last-child)` | `--xh-space-0` | card 的 header 部件 padding-block-end 覆盖槽。 |
| `--xh-card-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | card 的 root 部件 border-radius 覆盖槽。 |
| `--xh-card-shadow` | `root` | `box-shadow` | `default`<br>`variant=elevated`<br>`variant=ghost`<br>`variant=outline`<br>`variant=subtle` | `--xh-elevation-lifted`<br>`--xh-elevation-raised`<br>`none` | card 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-card-shadow-hover` | `root` | `box-shadow` | `@media (hover: hover)`<br>`hover`<br>`hoverable`<br>`variant=elevated`<br>`variant=ghost`<br>`variant=subtle` | `--xh-elevation-lifted`<br>`none` | card 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-card-title-font-size` | `root`<br>`title` | `font-size` | `default`<br>`size=lg` | `--xh-control-font-lg`<br>`--xh-text-label-size` | card 的 root、title 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `border-color` · `box-shadow` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。
