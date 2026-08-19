# 分隔线 <Badge type="info" text="separator" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 方向

竖向分隔线需要父容器有确定高度

<XhDemo src="separator/01-basic" />

### 纯装饰

decorative 开启后读屏跳过它；只是排版用的横线应该这么写

<XhDemo src="separator/02-decorative" />

### 分节标题

分隔线自己不排版：一行里放两条、中间留出标题，两侧各自撑开；语义由标题文字给，线只是装饰

<XhDemo src="separator/03-section-title" />

### 线型、粗细与颜色

线是拿背景画出来的：颜色槽位收的是背景值，填一段重复渐变就是虚线；粗细是另一个槽位

<XhDemo src="separator/04-line-style" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-separator>` |
| Vue 组件 | `XhSeparator` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/separator.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="separator"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `decorative` | `boolean` |  | 装饰性分隔：仅视觉分组，不进无障碍树（role=none，无 aria-orientation）。 |
| `orientation` | `'horizontal' \| 'vertical'` |  |  |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/separator/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-separator-color` · `--xh-separator-thickness`
