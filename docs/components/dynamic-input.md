# 动态录入 <Badge type="info" text="dynamic-input" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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

禁用时三类把手全按不动；插槽里还给出 add / remove / setValue，可以从外面驱动

<XhDemo src="dynamic-input/05-disabled-and-api" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-dynamic-input>` |
| Vue 组件 | `XhDynamicInputAddTrigger` `XhDynamicInputItem` `XhDynamicInputItemAction` `XhDynamicInputItemContent` `XhDynamicInputMoveDownTrigger` `XhDynamicInputMoveUpTrigger` `XhDynamicInputRemoveTrigger` `XhDynamicInputRoot` |
| 组合式函数 | `useDynamicInput` |
| 状态机 | `dynamicInputMachine` |
| 皮肤 | `@xihan-ui/styled/dynamic-input.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="dynamic-input"`：**`root`** · `item` · `item-content` · `item-action` · `add-trigger` · `remove-trigger` · `move-up-trigger` · `move-down-trigger`

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

## 状态机

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
| `getRemoveTriggerProps` | `(item: DynamicInputItemProps) => T['button']` |  |
| `getMoveUpTriggerProps` | `(item: DynamicInputItemProps) => T['button']` |  |
| `getMoveDownTriggerProps` | `(item: DynamicInputItemProps) => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
