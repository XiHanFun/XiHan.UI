# 分隔线 <Badge type="info" text="separator" />

在两组内容之间画一条线，并说清楚这条线是语义分隔还是纯装饰。

## 何时使用

- 菜单、列表、工具栏里切开两组不同性质的条目。
- 一行里放两条线、中间留出分节标题。

## 何时不用

- 只是想拉开距离：用间距，别用线。线是"这两边不是一回事"的声明。
- 每一项之间都要线：那通常说明列表本身该换成分组结构。

## 特性

- `decorative` 开启后读屏跳过它（`role="none"`，不出 `aria-orientation`）；只是排版用的横线应该这么写。
- 线是拿背景画出来的：颜色槽位收的是背景值，填一段重复渐变就是虚线；粗细是另一个槽位。
- 竖向分隔线需要父容器有确定高度。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-orientation` | 'vertical' \| undefined |
| `root` | `role` | 'none' \| 'separator' |

## 样式

默认皮肤 `@xihan-ui/styles/separator.css` 按部件选择：`[data-scope="separator"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-separator-color` · `--xh-separator-thickness`

## 组合

- 放进[菜单](./menu)、[工具栏](./toolbar)、[面包屑](./breadcrumb)的条目之间。

## 最佳实践

- 排版用的线一律开 `decorative`：读屏用户不需要听见一条视觉分隔。
- 竖线记得给父容器高度，否则它量不出来、什么都不画。

## 反模式

- 拿分隔线代替标题做分组：分组的语义要由标题给，线只是视觉。
- 一个界面里线太多，每一条都失去分量。
