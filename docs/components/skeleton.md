# 骨架屏 <Badge type="info" text="skeleton" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

容器竖着码放骨架条，形状缺省是一行文字

<XhDemo src="skeleton/01-basic" />

### 形状

容器的 variant 是这一组的默认形状，单根骨架条自带 variant 就按自己的来

<XhDemo src="skeleton/02-variant" />

### 加载结束

loading 期间容器报 aria-busy，翻成 false 后整块收起，位置让给真内容

<XhDemo src="skeleton/03-loading" />

### 按版面占位

骨架条的宽高由内联样式与组件令牌定，占位形状贴着真内容将来的样子

<XhDemo src="skeleton/04-layout" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-skeleton>` |
| Vue 组件 | `XhSkeletonBone` `XhSkeletonRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/skeleton.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="skeleton"`：**`root`** · **`bone`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `loading` | `boolean` |  | 是否还在加载，默认 true。 |
| `variant` | `SkeletonVariant` |  | 容器内骨架条的默认形状，默认 'text'。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `loading` | `boolean` | 当前是否处于加载态。 |
| `getRootProps` | `() => T['element']` |  |
| `getBoneProps` | `(bone?: SkeletonBoneProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-skeleton-bg` · `--xh-skeleton-circle-radius` · `--xh-skeleton-circle-size` · `--xh-skeleton-duration` · `--xh-skeleton-gap` · `--xh-skeleton-radius` · `--xh-skeleton-rect-block-size` · `--xh-skeleton-rect-radius` · `--xh-skeleton-sheen` · `--xh-skeleton-text-block-size` · `--xh-skeleton-text-radius`
