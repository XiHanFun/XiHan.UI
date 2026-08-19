# 图标块 <Badge type="info" text="icon-wrapper" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

定直径的圆底座，图元在正中；底座换档时里面的图元跟着一起换

<XhDemo src="icon-wrapper/01-basic" />

### 形态

四种形态只决定底色、描边与前景怎么用，直径与形状一个字不动

<XhDemo src="icon-wrapper/02-variant" />

### 语气

换一族颜色只改 tone，形态那一轴一个字不动

<XhDemo src="icon-wrapper/03-tone" />

### 尺寸

三档同时换底座直径与图元直径；改形状、改直径都留了槽位

<XhDemo src="icon-wrapper/04-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-icon-wrapper>` |
| Vue 组件 | `XhIconWrapper` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/icon-wrapper.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="icon-wrapper"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定底座直径与里面图元的直径。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定底色、描边与前景怎么用。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-icon-wrapper-bg` · `--xh-icon-wrapper-fg` · `--xh-icon-wrapper-glyph-size` · `--xh-icon-wrapper-radius` · `--xh-icon-wrapper-size`
