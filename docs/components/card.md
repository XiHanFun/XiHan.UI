# 卡片 <Badge type="info" text="card" />

一块有边界的内容容器：封面、标题、正文与页脚各占一段。

## 何时使用

- 把一组相关信息收成一个可以整体感知的单元。
- 内容块之间需要视觉边界。

## 何时不用

- 页面上每一块都套卡片：边界失效，只剩噪音。
- 只是要一条分隔：用[分隔线](./separator)。

## 特性

- 七个部件全部可选，只写用得上的那几段。
- `segmented` 在各段之间画线，`hoverable` 给出悬停反馈。

## 示例

### 基础用法

除了 root，封面、头、身、脚都可选；只写用得上的那几段

<XhDemo src="card/01-basic" />

### 形态

variant 只改描边、底色与投影怎么用，各段的排版三档一致

<XhDemo src="card/02-variant" />

### 尺寸

size 换的是各段的内边距与标题字号，不写 size 即默认档

<XhDemo src="card/03-size" />

### 分段与悬停

segmented 在段与段之间画一条分隔线；hoverable 只在能用指针的设备上抬起

<XhDemo src="card/04-segmented" />

### 带封面

封面顶到根的边上、不吃内边距，圆角由根统一裁

<XhDemo src="card/05-cover" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-card>` |
| Vue 组件 | `XhCardBody` `XhCardCover` `XhCardDescription` `XhCardFooter` `XhCardHeader` `XhCardRoot` `XhCardTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/card.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="card"`：**`root`** · `cover` · `header` · `title` · `description` · `body` · `footer`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `hoverable` | `boolean` |  | 指针悬停时抬起：只落 data-hoverable，抬多少由皮肤定。 |
| `segmented` | `boolean` |  | 分段：在头、身、脚之间画分隔线。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定各段的内边距与标题字号。 |
| `variant` | `CardVariant` |  | 形态：outline / subtle / elevated / ghost，决定描边、底色与投影怎么用。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getCoverProps` | `() => T['element']` |  |
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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-card-bg` · `--xh-card-border` · `--xh-card-fg` · `--xh-card-radius` · `--xh-card-shadow` · `--xh-card-title-font-size`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤内置条件规则：`hover: hover`。

## 组合

- 里面放[描述列表](./descriptions)、[表格](./table)、[统计数值](./statistic)；页脚放[按钮组](./button-group)。

## 最佳实践

- 整卡可点时要有明显的悬停与聚焦反馈，并让整卡进 Tab 序列。
- 卡片内的留白统一，别让每张卡的内边距不一样。

## 反模式

- 卡片套卡片：两层边界互相削弱。
- 整卡可点的同时卡内还有别的按钮：点哪里会发生什么不可预期。
