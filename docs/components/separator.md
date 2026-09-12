# Separator <Badge type="info" text="分隔线" />

在两组内容之间画一条线，并说清楚这条线是语义分隔还是纯装饰。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/separator" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/separator.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/separator" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/separator" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/separator.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

竖向分隔线需要父容器有确定高度

<XhDemo src="separator/01-basic" />

## 示例

### 纯装饰

decorative 开启后读屏跳过它；只是排版用的横线应该这么写

<XhDemo src="separator/02-decorative" />

### 分节标题

分隔线自己排成「线 · 文字 · 线」三段；align 把文字挪到一侧，那一侧的线收成一小截

<XhDemo src="separator/03-section-title" />

### 线型、粗细与颜色

variant 三档换深浅，dashed 画虚线（横竖各自成立），粗细与颜色仍是两个槽位

<XhDemo src="separator/04-line-style" />

## 设计指引

### 何时使用

- 菜单、列表、工具栏里切开两组不同性质的条目。
- 一行里放两条线、中间留出分节标题。

### 何时不用

- 只是想拉开距离：用间距，别用线。线是"这两边不是一回事"的声明。
- 每一项之间都要线：那通常说明列表本身该换成分组结构。

### 特性

- `decorative` 开启后用 `role="none"` + `aria-hidden="true"` 把整段（包括可见分节文字）退出无障碍树，
  同时不出 `aria-orientation`；只是排版用的线应该这么写。带业务含义的分节文字不要开 decorative。
- 给了 `content` 就自动排成「线 · 文字 · 线」三段：间距、字号与线长都走令牌，不必在外层手搓。
- `align` 把分节文字挪到靠左或靠右，那一侧的线收成一小截。
- `variant` 三档只换线的深浅：默认线使用会随浅深色、对比度与透明度策略变化的材质分隔色，
  subtle 使用实体低对比线，strong 使用高对比边界。
- `dashed` 画虚线，横竖两个朝向各自成立；段长走 `--xh-separator-dash-length` / `-dash-gap`。
- 线是拿背景画出来的：颜色槽位收的是背景值，粗细是另一个槽位；圆润端点避免细线在玻璃表面显得生硬。
- 竖向分隔线需要父容器有确定高度。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-separator>` |
| Vue 组件 | `XhSeparator` `XhSeparatorContent` `XhSeparatorLine` `XhSeparatorRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/separator.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="separator"`：**`root`** · `line` · `content`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `SeparatorAlign` |  | 分节文字落在哪一侧，缺省居中；缺省档不输出 data-align。 |
| `dashed` | `boolean` |  | 画成虚线；实线段与空白段的长度走 --xh-separator-dash-length / -dash-gap 两个槽。 |
| `decorative` | `boolean` |  | 装饰性分隔：仅视觉分组，root 通过 role=none + aria-hidden 完整退出无障碍树。 |
| `orientation` | `'horizontal' \| 'vertical'` |  |  |
| `variant` | `SeparatorVariant` |  | 线怎么画，缺省 default；缺省档不输出 data-variant。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getLineProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/separator/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-orientation` | 'vertical' \| undefined |
| `root` | `role` | 'none' \| 'separator' |
| `line` | `role` | 'none' |

## 样式

默认皮肤 `@xihan-ui/styles/separator.css` 按部件选择：`[data-scope="separator"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-dashed` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-variant` | props.variant |
| `line` | `data-orientation` | props.orientation |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-separator-align-length` | `line`<br>`root` | `flex` | `align=end`<br>`align=start`<br>`first-child`<br>`last-child` | `--xh-space-6` | separator 的 line、root 部件 flex 覆盖槽。 |
| `--xh-separator-color` | `line`<br>`root` | `background` | `dashed`<br>`default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=strong`<br>`variant=subtle` | `--xh-border-strong`<br>`--xh-material-frosted-separator`<br>`--xh-material-soft-separator` | separator 的 line、root 部件 background 覆盖槽。 |
| `--xh-separator-content-fg` | `content` | `color` | `default` | `--xh-fg-muted` | separator 的 content 部件 color 覆盖槽。 |
| `--xh-separator-content-font-size` | `content` | `font-size` | `default` | `--xh-text-secondary-size` | separator 的 content 部件 font-size 覆盖槽。 |
| `--xh-separator-dash-gap` | `line`<br>`root` | `background` | `dashed`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1_5` | separator 的 line、root 部件 background 覆盖槽。 |
| `--xh-separator-dash-length` | `line`<br>`root` | `background` | `dashed`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1_5` | separator 的 line、root 部件 background 覆盖槽。 |
| `--xh-separator-gap` | `content`<br>`root` | `gap` | `has([data-part='content'])` | `--xh-space-3` | separator 的 content、root 部件 gap 覆盖槽。 |
| `--xh-separator-radius` | `line`<br>`root` | `border-radius` | `default` | `--xh-shape-pill` | separator 的 line、root 部件 border-radius 覆盖槽。 |
| `--xh-separator-thickness` | `line`<br>`root` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thin` | separator 的 line、root 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 组合

- 放进[菜单](./menu)、[工具栏](./toolbar)、[面包屑](./breadcrumb)的条目之间。

## 最佳实践

- 排版用的线一律开 `decorative`：读屏用户不需要听见一条视觉分隔。
- 竖线记得给父容器高度，否则它量不出来、什么都不画。

## 反模式

- 拿分隔线代替标题做分组：分组的语义要由标题给，线只是视觉。
- 一个界面里线太多，每一条都失去分量。
