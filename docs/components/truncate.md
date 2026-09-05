# 文本截断 <Badge type="info" text="truncate" />

放不下的文本收成省略号，并把"到底有没有被裁掉"如实报出来。

## 何时使用

- 表格单元格、列表项、面包屑末段这类宽度不由内容决定的位置。
- 需要在真被裁掉时才给出完整文本的提示。

## 何时不用

- 文本必须完整可读（价格、编号、错误原因）：换布局，别裁。
- 要裁的是一整块正文并需要"展开全文"的阅读体验：可以用本组件的 `expandable`，但更长的正文交给[排印](./typography)加自己的折叠。

## 特性

- `lines` 为 1 走单行省略，大于 1 按行数裁、末行收省略号。
- 溢出结论会实测并在翻面时回调，不靠猜。
- `expandable` 让整块文字变成一颗按钮，Enter / Space 也按得动。
- `tooltip` 在真被裁掉时把整段文字交给平台的原生提示。

## 示例

### 基础用法

一行放不下就收成省略号；有没有被裁如实报出来

<XhDemo src="truncate/01-basic" />

### 行数

lines 为 1 走单行省略，大于 1 按行数裁，末行收省略号

<XhDemo src="truncate/02-lines" />

### 点击展开

expandable 让整块文字变成一颗按钮，Enter / Space 也按得动

<XhDemo src="truncate/03-expandable" />

### 溢出才提示

上面套 Tooltip 按 overflow-change 开关，下面用 tooltip 交给平台的原生提示

<XhDemo src="truncate/04-overflow-tooltip" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-truncate>` |
| Vue 组件 | `XhTruncate` |
| 组合式函数 | `useTruncate` |
| 状态机 | `truncateMachine` |
| 皮肤 | `@xihan-ui/styles/truncate.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="truncate"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `lines` | `number` |  | 夹几行，1 为单行，默认 1。 |
| `expandable` | `boolean` |  | 点一下铺开全文。 |
| `open` | `boolean` |  | 受控展开；缺省即非受控。 |
| `defaultOpen` | `boolean` |  | 非受控时的初始展开态。 |
| `tooltip` | `boolean` |  | 真被裁掉了才把整段文字交给平台的原生提示。 |
| `onOpenChange` | `(details: TruncateOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `onOverflowChange` | `(details: TruncateOverflowChangeDetails) => void` |  | 量出来的溢出结论翻面时回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TruncateOpenChangeDetails` | 展开状态变化；detail 为 `{ open: boolean }` |
| `overflow-change` | `TruncateOverflowChangeDetails` | 溢出结论翻面；detail 为 `{ overflowing: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTruncate` | `default` | `TruncateSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `open`

**事件**：`MEASURE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useTruncate` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 此刻是不是铺开了全文。 |
| `overflowing` | `boolean` | 夹住的那一版有没有被裁掉内容。作者据此决定要不要套一层提示。 |
| `setOpen` | `(next: boolean) => void` | 程序化展开 / 收回，与点一下走同一条路。 |
| `measure` | `() => void` | 手动重量一次：字体到位、外层换了布局这类观察器看不见的变化，由作者补一枪。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | expandable，焦点在 root 上 | 铺开全文 / 收回夹住的那一版；Space 拦掉翻页的默认动作 |
| `Tab` / `Shift+Tab` | expandable | 停到这块文字上；不可展开时它不带 tabindex，不在 Tab 序列里 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-expanded` | 'true' \| 'false' |
| `root` | `role` | 'button' |

## 样式

默认皮肤 `@xihan-ui/styles/truncate.css` 按部件选择：`[data-scope="truncate"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-expandable` | ''（条件成立时才出现） |
| `root` | `data-lines` | String(lines) |
| `root` | `data-multiline` | ''（条件成立时才出现） |
| `root` | `data-overflowing` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |

## 组合

- 外面套[文字提示](./tooltip)，按溢出回调开关，可以拿到与站点一致的提示样式。

## 最佳实践

- 只在裁掉时才给提示：没裁还弹提示是纯噪音。
- 展开态要能收回去，否则布局在一次点击后再也回不来。

## 反模式

- 用固定字符数截断字符串代替本组件：等宽假设在中英混排与不同字体下都不成立。
- 裁掉之后不提供任何看到全文的途径。
