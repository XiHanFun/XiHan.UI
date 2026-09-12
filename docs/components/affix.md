# Affix 固钉

滚过判定线就把内容钉在滚动容器可视区的边上；占位盒留在原位，页面不跳。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/affix" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/affix.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/affix" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/affix" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/affix.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

滚过判定线就把内容钉在滚动容器可视区的上边；占位盒留在原位，页面不跳

<XhDemo src="affix/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="affix"`：**`root`** · **`content`**

## 示例

### 让出吸顶栏

offset-top 把判定线往下挪，钉住后也在同一位置留出这段高度

<XhDemo src="affix/02-offset-top" />

### 贴下边

给了 offset-bottom 就改贴可视区的下边，判定线也换到下边

<XhDemo src="affix/03-offset-bottom" />

### 监听吸附状态

affix-change 报吸住与松开；默认插槽也把 affixed 透出来

<XhDemo src="affix/04-affix-change" />

## 设计指引

### 何时使用

- 表格的操作栏、表单的提交条、文章的目录，需要滚动时一直可达。

### 何时不用

- 元素从一开始就该钉住：直接写 `position: sticky`，不需要判定线。
- 要钉的是整块页面骨架（头、侧栏）：用[布局](./layout)的吸顶开关。
- 需要滚到顶部的按钮：那是[回到顶部](./back-top)。

### 特性

- 占位盒留在原位：吸住的那一刻页面不会突然少一段高度。
- `offsetTop` 把判定线往下挪，钉住后也在同一位置留出这段高度；给了 `offsetBottom` 就改贴下边。
- 吸附状态会回调，默认插槽也把它透出来。

### 组合

- 与[锚点](./anchor)配合做吸顶目录；与[工具栏](./toolbar)配合做吸顶操作条。

### 最佳实践

- 页面已有吸顶栏时把栏高填进 `offsetTop`，否则会两层叠在一起。
- 钉住后给一点视觉变化（阴影或描边），让用户知道它已经脱离了原位。

### 反模式

- 一屏里钉住多个条：可视高度被吃光，正文只剩一条缝。
- 在移动端钉住高条：小屏上这块面积很贵。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-affix>` |
| Vue 组件 | `XhAffixContent` `XhAffixRoot` |
| 组合式函数 | `useAffix` |
| 状态机 | `affixMachine` |
| 皮肤 | `@xihan-ui/styles/affix.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `offsetTop` | `number` |  | 吸住后距滚动容器可视区上边的距离（px）。 |
| `offsetBottom` | `number` |  | 吸住后距滚动容器可视区下边的距离（px）；给了它就改贴下边。 |
| `onAffixChange` | `(details: AffixChangeDetails) => void` |  | 吸附状态变化回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `affix-change` | `AffixChangeDetails` | 吸附状态变化；detail 为 `{ affixed: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhAffixRoot` | `default` | `AffixRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`released` · `affixed`

**事件**：`SCROLL.RESOLVE`

**判据**：`shouldAffix` · `shouldRelease`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `affixed` | `boolean` | 此刻是不是吸住了。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/affix.css` 使用 `[data-scope="affix"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `content` | `data-fixed` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-affix-layer` | `content` | `z-index` | `fixed` | `--xh-layer-sticky` | affix 的 content 部件 z-index 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
