# AvatarGroup <Badge type="info" text="头像组" />

把若干头像叠成一排，超出上限的收成一个计数。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/avatar-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/avatar-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/avatar-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/avatar-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/avatar-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一排叠放的头像：后一枚压在前一枚上，被压住的边由一圈底色分开

<XhDemo src="avatar-group/01-basic" />

## 示例

### 上限与溢出计数

摆到上限为止，其余收成一枚「+N」；裁到几枚、N 写多少由作者定，组件只给这一枚身份与位置

<XhDemo src="avatar-group/02-overflow" />

### 尺寸

直径、字号与叠放量在组上写一次，沿自定义属性流给组内每一枚，「+N」跟着一起换

<XhDemo src="avatar-group/03-size" />

### 使用者令牌

直径、叠放量、分隔那圈底色都留了槽位，写在组上就整组换掉

<XhDemo src="avatar-group/04-custom" />

## 设计指引

### 何时使用

- 表示"这几个人参与了这件事"，且个体身份不需要逐一确认。

### 何时不用

- 需要逐个识别或操作：排成[列表](./list)。
- 只有一个人。

### 特性

- `max` 决定显示几个，其余落进 `overflow-item` 计数。
- 尺寸写在组上，组内头像一并跟着换。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-avatar-group>` |
| Vue 组件 | `XhAvatarGroupOverflowItem` `XhAvatarGroupRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/avatar-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="avatar-group"`：**`root`** · `overflow-item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `max` | `number` |  | 展示上限：这一组打算摆出几枚，其余收进 overflow-item 那一枚。 头像由作者渲染，所以裁到几枚、「+N」里的 N 写多少都在作者手里； 组件把这个上限如实落成根上的 data-max。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，落到根上沿继承流下发给组内每一枚。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getOverflowItemProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/avatar-group.css` 按部件选择：`[data-scope="avatar-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-avatar-group-font-size` | `overflow-item`<br>`root` | `--xh-avatar-font-size`<br>`font-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-caption-lg`<br>`--xh-control-caption-md`<br>`--xh-control-caption-sm` | avatar-group 的 overflow-item、root 部件 --xh-avatar-font-size、font-size 覆盖槽。 |
| `--xh-avatar-group-font-weight` | `overflow-item` | `font-weight` | `default` | `--xh-font-weight-medium` | avatar-group 的 overflow-item 部件 font-weight 覆盖槽。 |
| `--xh-avatar-group-overflow-item-bg` | `overflow-item` | `background` | `default` | `--xh-bg-muted` | avatar-group 的 overflow-item 部件 background 覆盖槽。 |
| `--xh-avatar-group-overflow-item-fg` | `overflow-item` | `color` | `default` | `--xh-fg-muted` | avatar-group 的 overflow-item 部件 color 覆盖槽。 |
| `--xh-avatar-group-overlap` | `root` | `margin-inline-start` | `default`<br>`size=lg`<br>`size=sm` | `--xh-space-2`<br>`--xh-space-2_5`<br>`--xh-space-3` | avatar-group 的 root 部件 margin-inline-start 覆盖槽。 |
| `--xh-avatar-group-radius` | `overflow-item` | `border-radius` | `default` | `--xh-shape-pill` | avatar-group 的 overflow-item 部件 border-radius 覆盖槽。 |
| `--xh-avatar-group-ring` | `root` | `box-shadow` | `default` | `--xh-bg-surface` | avatar-group 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-avatar-group-size` | `overflow-item`<br>`root` | `--xh-avatar-size`<br>`block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-h-lg`<br>`--xh-control-h-md`<br>`--xh-control-h-sm` | avatar-group 的 overflow-item、root 部件 --xh-avatar-size、block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 里面放[头像](./avatar)；溢出计数点开可以是一张[气泡卡片](./popover)里的完整名单。

## 最佳实践

- 溢出计数要能点开看到完整名单。
- 每个头像都配[文字提示](./tooltip)给出姓名。

## 反模式

- 叠得太密以致看不出有几个人。
- 上限设得太大，一排头像占满整行。
