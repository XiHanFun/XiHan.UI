# 骨架屏 <Badge type="info" text="skeleton" />

内容还没到时，先按最终版面占位。

## 何时使用

- 首屏或整块区域的加载，且版面结构可预测。
- 加载时间通常在几百毫秒到几秒之间。

## 何时不用

- 加载极快：骨架闪一下比直接出现更烦人。
- 版面完全不可预测：用[加载指示器](./spinner)。
- 是一次动作的等待（提交中）：用按钮的载入态。

## 特性

- `loading` 翻假即换成真内容。
- `variant` 决定骨块的形状（文本行、圆形、矩形）。

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

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'loading' \| 'loaded' |

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `bone` | `aria-hidden` | 'true' \| undefined |

## 样式

默认皮肤 `@xihan-ui/styles/skeleton.css` 按部件选择：`[data-scope="skeleton"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | 'loading' \| 'loaded' |
| `bone` | `data-variant` | bone.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-skeleton-bg` · `--xh-skeleton-circle-radius` · `--xh-skeleton-circle-size` · `--xh-skeleton-duration` · `--xh-skeleton-gap` · `--xh-skeleton-radius` · `--xh-skeleton-rect-block-size` · `--xh-skeleton-rect-radius` · `--xh-skeleton-sheen` · `--xh-skeleton-text-block-size` · `--xh-skeleton-text-radius`

## 动效

关键帧 `xh-skeleton-shimmer` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤内置条件规则：`forced-colors: active`。

## 组合

- 按最终版面用[栅格](./grid)或[弹性布局](./flex)摆骨块。

## 最佳实践

- 骨架的形状与真内容对上：行数、宽度、圆角都要接近，否则内容一到就整块跳。
- 别做得比真内容还花哨。

## 反模式

- 一块巨大的灰色矩形代替所有内容。
- 加载失败后骨架一直闪着。
