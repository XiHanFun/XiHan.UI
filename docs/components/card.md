# Card 卡片

用于组织相关内容与操作的中性表面。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/card" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/card.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/card" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/card" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/card.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

Header 放标题与说明，Content 放主体

<XhDemo src="card/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="card"`：**`root`** · `header` · `title` · `description` · `content` · `footer`

## 示例

### 变体

outline 为默认卡面，subtle 淡底嵌入，ghost 用于嵌套

<XhDemo src="card/02-variant" />

### 横向布局

Card 只提供内容面，方向和媒体尺寸由使用场景决定

<XhDemo src="card/03-horizontal" />

### 带媒体

图片或自绘媒体作为普通子节点放入，由内容自己决定比例与圆角

<XhDemo src="card/04-cover" />

## 设计指引

### 何时使用

- 把一组相关信息收成一个可以整体感知的单元。
- 内容块之间需要视觉边界。

### 何时不用

- 页面上每一块都使用卡片会使边界失效。
- 只需要一条分隔时，使用[分隔线](./separator)。

### 特性

- root 必需；header、title、description、content、footer 按内容组合。
- `outline` 是默认卡面，`subtle` 用淡底嵌在别的面里，`ghost` 用于嵌套内容不再画面。
- 根统一提供 16px 内边距、12px 段间距和 surface 圆角；横向布局与媒体比例由使用场景决定。

### 组合

- 图片等媒体直接作为普通子节点放入；内容区可放[描述列表](./descriptions)、[表格](./table)或[统计数值](./statistic)。

### 最佳实践

- 整卡可点时提供明显的悬停与聚焦反馈，并让整卡进入 Tab 序列。
- 同组卡片保持相同宽度和内容节奏。

### 反模式

- 卡片嵌套卡片，两层边界互相削弱。
- 整卡可点的同时卡内还有其他按钮，点击结果不可预期。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-card>` |
| Vue 组件 | `XhCardContent` `XhCardDescription` `XhCardFooter` `XhCardHeader` `XhCardRoot` `XhCardTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/card.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `variant` | `ControlVariant` |  | 形态：outline 为带影的抬起面，subtle 为淡底，ghost 无底无影。默认 outline。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
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

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-card-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | card 的 root 部件 background 覆盖槽。 |
| `--xh-card-border` | `root` | `border` | `default` | `--xh-border-default` | card 的 root 部件 border 覆盖槽。 |
| `--xh-card-content-gap` | `content` | `gap` | `default` | `--xh-space-1` | card 的 content 部件 gap 覆盖槽。 |
| `--xh-card-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | card 的 description 部件 color 覆盖槽。 |
| `--xh-card-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | card 的 description 部件 font-size 覆盖槽。 |
| `--xh-card-description-leading` | `description` | `line-height` | `default` | `--xh-leading-normal` | card 的 description 部件 line-height 覆盖槽。 |
| `--xh-card-fg` | `root` | `color` | `default` | `--xh-fg-default` | card 的 root 部件 color 覆盖槽。 |
| `--xh-card-font-size` | `root` | `font-size` | `default` | `--xh-text-label-size` | card 的 root 部件 font-size 覆盖槽。 |
| `--xh-card-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | card 的 footer 部件 gap 覆盖槽。 |
| `--xh-card-gap` | `root` | `gap` | `default` | `--xh-space-3` | card 的 root 部件 gap 覆盖槽。 |
| `--xh-card-leading` | `root` | `line-height` | `default` | `--xh-text-body-leading` | card 的 root 部件 line-height 覆盖槽。 |
| `--xh-card-p` | `root` | `padding` | `default` | `--xh-surface-pad-lg` | card 的 root 部件 padding 覆盖槽。 |
| `--xh-card-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | card 的 root 部件 border-radius 覆盖槽。 |
| `--xh-card-shadow` | `root` | `box-shadow` | `default`<br>`variant=ghost`<br>`variant=subtle` | `--xh-elevation-raised`<br>`none` | card 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-card-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | card 的 title 部件 color 覆盖槽。 |
| `--xh-card-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | card 的 title 部件 font-size 覆盖槽。 |
| `--xh-card-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | card 的 title 部件 font-weight 覆盖槽。 |
| `--xh-card-title-leading` | `title` | `line-height` | `default` | `--xh-leading-relaxed` | card 的 title 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
