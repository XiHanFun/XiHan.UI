# Affix 固钉 <Badge type="info" text="alpha" />

在滚动超过指定位置后固定内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/affix" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/affix.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/affix" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/affix" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/affix.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

滚动后固定工具栏

<XhDemo src="affix/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="affix"`：**`root`** · **`content`**

## 示例

### 顶部偏移

避让固定页头

<XhDemo src="affix/02-offset-top" />

### 底部固定

将操作栏固定在底部

<XhDemo src="affix/03-offset-bottom" />

### 吸附状态

根据当前状态更新内容

<XhDemo src="affix/04-affix-change" />

## 设计指引

### 何时使用

- 固定表格操作栏、表单提交栏或文章目录。

### 何时不用

- 始终固定的元素直接使用 `position: sticky`。
- 页面骨架使用[布局](./layout)的固定能力。
- 返回顶部操作使用[回到顶部](./back-top)。

### 特性

- 固定时保留原始占位，避免页面跳动。
- 支持顶部、底部和偏移位置。
- 提供吸附状态和变化事件。

### 组合

- 可与[锚点](./anchor)或[工具栏](./toolbar)组合使用。

### 最佳实践

- 页面已有固定页头时设置对应的顶部偏移。
- 固定后使用轻微阴影或背景变化提示状态。

### 反模式

- 不要在同一视口固定过多内容。
- 移动端避免固定过高的区域。

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
| `offsetTop` | `number` |  | 吸附后距滚动容器可视区上边的距离（px）。 |
| `offsetBottom` | `number` |  | 吸附后距滚动容器可视区下边的距离（px）；提供后改为贴靠下边。 |
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
| `affixed` | `boolean` | 当前是否处于吸附状态。 |
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

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-affix-layer` | `content` | `z-index` | `fixed` | `--xh-layer-sticky` | affix 的 content 部件 z-index 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
