# 动态录入 <Badge type="info" text="dynamic-input" />

一组行数可变的录入行：可以加一行、删一行、换顺序。

## 何时使用

- 联系方式、规格参数、收件人这类"数量由用户决定"的重复字段。

## 何时不用

- 行数固定：直接写几行。
- 每一行是一个短词：用[标签输入](./tags-input)。

## 特性

- `min` / `max` 约束行数，到下限时删除按钮不可用。
- `movable` 给出上移下移。
- `createItem` 决定新增一行时的初值。
- 一行里可以放多个字段。

## 示例

### 基础用法

加一行、删一行归组件管；行里放什么控件归作者，写在 item-content 里

<XhDemo src="dynamic-input/01-basic" />

### 行数上下限

到 min 删除把手按不动、到 max 新增把手按不动；两者都转 aria-disabled，焦点留得住

<XhDemo src="dynamic-input/02-min-max" />

### 换序

movable 开了才出上下把手；挪完焦点跟着这一行走，键盘可以连按一路挪到底

<XhDemo src="dynamic-input/03-movable" />

### 一行多个字段

行数据是对象，createItem 造一个空项；改字段时整份重建数组，行号不跟着变

<XhDemo src="dynamic-input/04-object-rows" />

### 禁用与程序化操作

禁用时三类把手全按不动；从外面加一条走同一条闸门，整份替换值则不受闸门约束

<XhDemo src="dynamic-input/05-disabled-and-api" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-dynamic-input>` |
| Vue 组件 | `XhDynamicInputAddTrigger` `XhDynamicInputItem` `XhDynamicInputItemAction` `XhDynamicInputItemContent` `XhDynamicInputItemDeleteTrigger` `XhDynamicInputMoveDownTrigger` `XhDynamicInputMoveUpTrigger` `XhDynamicInputRoot` |
| 组合式函数 | `useDynamicInput` |
| 状态机 | `dynamicInputMachine` |
| 皮肤 | `@xihan-ui/styles/dynamic-input.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="dynamic-input"`：**`root`** · `item` · `item-content` · `item-action` · `add-trigger` · `item-delete-trigger` · `move-up-trigger` · `move-down-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `unknown[]` |  | 受控数据数组；给了就由宿主说了算，机器不自改，只发 onValueChange。 |
| `defaultValue` | `unknown[]` |  | 非受控初始数据数组。 |
| `min` | `number` |  | 最少几行。到了这个数，删除把手就按不动了。缺省 0。 |
| `max` | `number` |  | 最多几行。到了这个数，新增把手就按不动了。缺省不限。 |
| `createItem` | `() => unknown` |  | 新增一行时造一个空项。不给就插一个 null。 |
| `movable` | `boolean` |  | 出不出换序把手。关（默认）时两个换序把手一律收起。 |
| `disabled` | `boolean` |  | 禁用：新增、删除、换序三路都按不动。 |
| `translations` | `Partial<DynamicInputTranslations>` |  |  |
| `onValueChange` | `(details: DynamicInputValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `DynamicInputValueChangeDetails` | 数据数组变化；detail 为 `{ value: unknown[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDynamicInputRoot` | `default` | `DynamicInputRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.ADD` · `ITEM.REMOVE` · `ITEM.MOVE`

**判据**：`canAdd` · `canRemove` · `canMove`

## connect API

`useDynamicInput` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `unknown[]` |  |
| `items` | `DynamicInputItem[]` | 逐行的读侧投影，含渲染用的 key。 |
| `count` | `number` |  |
| `empty` | `boolean` |  |
| `disabled` | `boolean` |  |
| `movable` | `boolean` |  |
| `atMin` | `boolean` | 已到下限：再删就少于 min 了。 |
| `atMax` | `boolean` | 已到上限：再加就多于 max 了。 |
| `canAdd` | `boolean` |  |
| `setValue` | `(next: unknown[]) => void` | 整份替换，不受 min / max 约束。 |
| `add` | `() => void` |  |
| `remove` | `(index: number) => void` |  |
| `move` | `(from: number, to: number) => void` |  |
| `moveUp` | `(index: number) => void` |  |
| `moveDown` | `(index: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(item: DynamicInputItemProps) => T['element']` |  |
| `getItemContentProps` | `(item: DynamicInputItemProps) => T['element']` |  |
| `getItemActionProps` | `(item: DynamicInputItemProps) => T['element']` |  |
| `getAddTriggerProps` | `() => T['button']` |  |
| `getItemDeleteTriggerProps` | `(item: DynamicInputItemProps) => T['button']` |  |
| `getMoveUpTriggerProps` | `(item: DynamicInputItemProps) => T['button']` |  |
| `getMoveDownTriggerProps` | `(item: DynamicInputItemProps) => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `add-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(item.index + 1, count) |

## 样式

默认皮肤 `@xihan-ui/styles/dynamic-input.css` 按部件选择：`[data-scope="dynamic-input"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-max` | ''（条件成立时才出现） |
| `root` | `data-at-min` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-movable` | ''（条件成立时才出现） |
| `item` | `data-first` | ''（条件成立时才出现） |
| `item` | `data-last` | ''（条件成立时才出现） |
| `add-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-dynamic-input-action-gap` · `--xh-dynamic-input-add-bg` · `--xh-dynamic-input-add-bg-active` · `--xh-dynamic-input-add-bg-hover` · `--xh-dynamic-input-add-border` · `--xh-dynamic-input-add-border-disabled` · `--xh-dynamic-input-add-border-hover` · `--xh-dynamic-input-add-fg` · `--xh-dynamic-input-add-font-size` · `--xh-dynamic-input-add-height` · `--xh-dynamic-input-add-px` · `--xh-dynamic-input-add-radius` · `--xh-dynamic-input-content-gap` · `--xh-dynamic-input-gap` · `--xh-dynamic-input-icon-size` · `--xh-dynamic-input-item-delete-fg-hover` · `--xh-dynamic-input-item-gap` · `--xh-dynamic-input-item-padding` · `--xh-dynamic-input-item-radius` · `--xh-dynamic-input-trigger-bg` · `--xh-dynamic-input-trigger-bg-active` · `--xh-dynamic-input-trigger-bg-hover` · `--xh-dynamic-input-trigger-fg` · `--xh-dynamic-input-trigger-fg-hover` · `--xh-dynamic-input-trigger-font-size` · `--xh-dynamic-input-trigger-radius` · `--xh-dynamic-input-trigger-size`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 每行里放[表单字段](./field)与各类录入组件；整体放进[表单](./form)。

## 最佳实践

- 新增一行后把焦点移到这一行的第一个输入框。
- 删除按钮要说明删的是哪一行（`aria-label` 带上行号或内容）。

## 反模式

- 删除不给撤销，误删只能重填。
- 行数上限只在提交时才提示。
