# Truncate 文本截断

用于在有限空间内省略过长文本。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/truncate" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/truncate.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/truncate" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/truncate" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/truncate.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

单行文本溢出时显示省略号

<XhDemo src="truncate/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="truncate"`：**`root`**

## 示例

### 多行截断

限制文本显示两行

<XhDemo src="truncate/02-lines" />

### 展开全文

点击文本展开或收起

<XhDemo src="truncate/03-expandable" />

### 原生提示

仅在内容溢出时显示完整文本

<XhDemo src="truncate/04-tooltip" />

## 设计指引

### 何时使用

- 表格单元格、列表项或面包屑中的长文本。
- 需要按一行或多行限制内容高度。

### 何时不用

- 价格、编号与错误原因等必须完整显示的内容。
- 长篇正文；使用[排印](./typography)组织阅读层级。

### 特性

- `lines` 控制单行或多行截断。
- 容器、内容与字体变化后自动重新测量。
- `expandable` 支持点击或键盘展开全文。
- `tooltip` 仅在内容溢出时提供原生提示。

### 组合

- 使用 `onOverflowChange` 连接自定义[文字提示](./tooltip)。

### 最佳实践

- 仅在内容溢出时显示完整文本提示。
- 可展开内容必须允许再次收起。

### 反模式

- 不要按固定字符数截断文本。
- 不要省略用户完成任务所需的关键信息。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-truncate>` |
| Vue 组件 | `XhTruncate` |
| 组合式函数 | `useTruncate` |
| 状态机 | `truncateMachine` |
| 皮肤 | `@xihan-ui/styles/truncate.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `lines` | `number` |  | 截断行数，1 为单行，默认 1。 |
| `expandable` | `boolean` |  | 点击展开全文。 |
| `open` | `boolean` |  | 受控展开；未提供时非受控。 |
| `defaultOpen` | `boolean` |  | 非受控时的初始展开态。 |
| `tooltip` | `boolean` |  | 实际裁掉内容时才把整段文字交给平台的原生提示。 |
| `onOpenChange` | `(details: TruncateOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onOverflowChange` | `(details: TruncateOverflowChangeDetails) => void` |  | 测得的溢出结论翻转时回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TruncateOpenChangeDetails` | 展开状态变化；detail 为 `{ open: boolean }` |
| `overflow-change` | `TruncateOverflowChangeDetails` | 溢出结论翻转；detail 为 `{ overflowing: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTruncate` | `default` | `TruncateSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhTruncate` | `children` | `SlotChildren<TruncateSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`closed` · `open`

**事件**：`MEASURE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 当前是否已展开全文。 |
| `overflowing` | `boolean` | 截断版本是否裁掉了内容。作者据此决定是否附加提示。 |
| `setOpen` | `(next: boolean) => void` | 程序化展开 / 收起，与点击走同一路径。 |
| `measure` | `() => void` | 手动测量一次，用于观察器无法感知的布局变化。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | expandable，焦点在 root 上 | 铺开全文 / 收回夹住的那一版；Space 拦掉翻页的默认动作 |
| `Tab` / `Shift+Tab` | expandable | 停到这块文字上；不可展开时它不带 tabindex，不在 Tab 序列里 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-expanded` | 'true' \| 'false' |
| `root` | `role` | 'button' |

## 样式参考

### 皮肤

`@xihan-ui/styles/truncate.css` 使用 `[data-scope="truncate"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-expandable` | ''（条件成立时才出现） |
| `root` | `data-lines` | String(lines) |
| `root` | `data-multiline` | ''（条件成立时才出现） |
| `root` | `data-overflowing` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-truncate-lines` | `root` | `-webkit-line-clamp` | `multiline` | `--xh-_truncate-lines` | truncate 的 root 部件 -webkit-line-clamp 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态（见[动效规范](../design/motion#角色)）。

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
