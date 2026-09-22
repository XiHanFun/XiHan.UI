# AvatarGroup 头像组

将若干头像叠成一排，超出上限的部分收为一个计数。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/avatar-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/avatar-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/avatar-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/avatar-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/avatar-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一排叠放的头像：后一个压在前一个上，被压住的边由一圈底色分开

<XhDemo src="avatar-group/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="avatar-group"`：**`root`** · `overflow-item`

## 示例

### 上限与溢出计数

放置到上限为止，其余收为一个「+N」；截到几个、N 写多少由作者决定，组件只提供该项的身份与位置

<XhDemo src="avatar-group/02-overflow" />

### 尺寸

直径、字号与叠放量在组上写一次，沿自定义属性下发给组内每个头像，「+N」随之更换

<XhDemo src="avatar-group/03-size" />

### 使用者令牌

直径、叠放量、分隔用的底色都保留了槽位，写在组上即整组更换

<XhDemo src="avatar-group/04-custom" />

## 设计指引

### 何时使用

- 表示一组参与者，且不需要逐一确认个体身份。

### 何时不用

- 需要逐个识别或操作时，排成[列表](./list)。
- 只有一个人时，直接使用头像。

### 特性

- `max` 决定显示数量，其余进入 `overflow-item` 计数。
- 尺寸写在组上，组内头像一并跟随。

### 组合

- 组内放置[头像](./avatar)；溢出计数可以打开一张[气泡卡片](./popover)显示完整名单。

### 最佳实践

- 溢出计数应能打开查看完整名单。
- 每个头像配[文字提示](./tooltip)给出姓名。

### 反模式

- 叠放过密，无法分辨人数。
- 上限过大，一排头像占满整行。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-avatar-group>` |
| Vue 组件 | `XhAvatarGroupOverflowItem` `XhAvatarGroupRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/avatar-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `max` | `number` |  | 展示上限：本组展示的头像数量，其余收进 overflow-item。 头像由作者渲染，因此裁切数量与 +N 中的 N 都由作者决定； 组件把这个上限如实写入根上的 data-max。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，写入根上并沿继承流下发给组内每一个头像。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getOverflowItemProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/avatar-group.css` 使用 `[data-scope="avatar-group"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-avatar-group-font-size` | `overflow-item`<br>`root` | `--xh-avatar-font-size`<br>`font-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-caption-lg`<br>`--xh-control-caption-md`<br>`--xh-control-caption-sm` | avatar-group 的 overflow-item、root 部件 --xh-avatar-font-size、font-size 覆盖槽。 |
| `--xh-avatar-group-font-weight` | `overflow-item` | `font-weight` | `default` | `--xh-font-weight-medium` | avatar-group 的 overflow-item 部件 font-weight 覆盖槽。 |
| `--xh-avatar-group-overflow-item-bg` | `overflow-item` | `background` | `default` | `--xh-bg-muted` | avatar-group 的 overflow-item 部件 background 覆盖槽。 |
| `--xh-avatar-group-overflow-item-fg` | `overflow-item` | `color` | `default` | `--xh-fg-muted` | avatar-group 的 overflow-item 部件 color 覆盖槽。 |
| `--xh-avatar-group-overlap` | `root` | `margin-inline-start` | `default`<br>`size=lg`<br>`size=sm` | `--xh-space-2`<br>`--xh-space-2_5`<br>`--xh-space-3` | avatar-group 的 root 部件 margin-inline-start 覆盖槽。 |
| `--xh-avatar-group-radius` | `overflow-item` | `border-radius` | `default` | `--xh-shape-circle` | avatar-group 的 overflow-item 部件 border-radius 覆盖槽。 |
| `--xh-avatar-group-ring` | `root` | `box-shadow` | `default` | `--xh-bg-surface` | avatar-group 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-avatar-group-size` | `overflow-item`<br>`root` | `--xh-avatar-size`<br>`block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-h-lg`<br>`--xh-control-h-md`<br>`--xh-control-h-sm` | avatar-group 的 overflow-item、root 部件 --xh-avatar-size、block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
