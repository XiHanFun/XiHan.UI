# 单选组 <Badge type="info" text="radio-group" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

组内只有一个 Tab 停靠点，进组后四个方向键都能切换，隐藏输入与选中圆点由条目自行装配

<XhDemo src="radio-group/01-basic" />

### 受控

传了 value 就由宿主说了算；值可以是 null，表示一项都没选中

<XhDemo src="radio-group/02-controlled" />

### 横向排布

orientation 只影响排版与 aria-orientation，方向键四个方向照样都能切换

<XhDemo src="radio-group/03-horizontal" />

### 禁用

单项禁用后点不动，方向键也跳过它；整组禁用则每一项都跟着禁用

<XhDemo src="radio-group/04-disabled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-radio-group>` |
| Vue 组件 | `XhRadioGroupItem` `XhRadioGroupItemText` `XhRadioGroupLabel` `XhRadioGroupRoot` |
| 组合式函数 | `useRadioGroup` |
| 状态机 | `radioGroupMachine` |
| 皮肤 | `@xihan-ui/styled/radio-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="radio-group"`：`root` · `label` · **`item`** · `item-text` · `indicator` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string | null` |  |  |
| `defaultValue` | `string | null` |  |  |
| `disabled` | `boolean` |  |  |
| `orientation` | `Orientation` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 'ltr'。 |
| `name` | `string` |  | 表单字段名。 |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: RadioGroupValueChangeDetails) => void` |  | value 变化回调。 |

## 状态机

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR`

## connect API

`useRadioGroup` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string | null` |  |
| `focusedValue` | `string | null` | 焦点在组外时为 null。 |
| `setValue` | `(next: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getHiddenInputProps` | `(props: RadioGroupItemProps) => T['input']` | 条目对应的隐藏原生 radio 输入，用于表单提交。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点条目，无锚点时进入容器 |
| `ArrowDown` / `ArrowRight` | focus in group, group not disabled | 焦点移到下一个可停留条目并选中，末项回绕到首项；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowUp` / `ArrowLeft` | focus in group, group not disabled | 焦点移到上一个可停留条目并选中，首项回绕到末项；dir=rtl 时改由 ArrowRight 承担 |
| `Space` | focus on item, item not disabled | 选中当前条目 |
