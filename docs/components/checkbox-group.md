# 复选框组 <Badge type="info" text="checkbox-group" />

一组多选项共一个值数组，附带全选与半选。

## 何时使用

- 从若干项里选任意多项，且要随表单提交。

## 何时不用

- 选项很多、需要搜索：用[选择器](./select)的多选或[穿梭框](./transfer)。
- 选项互斥：用[单选组](./radio-group)。

## 特性

- `collection` 是文本与禁用的事实源；也可以逐项自己写。
- 全选触发器自动算半选态。
- `orientation` 换排布；也可以直接把条目放进[栅格](./grid)。
- 值可以是数字主键，不必强转字符串。

## 示例

### 基础用法

值是字符串数组，各选各的，再点一次即取消；组内有几项就有几个 Tab 停靠点

<XhDemo src="checkbox-group/01-basic" />

### 全选与半选

trigger 是第三态复选框，只有把全部条目的值交给 itemValues 才分得清 checked 与 indeterminate

<XhDemo src="checkbox-group/02-select-all" />

### 横向排布

orientation 只出 data-orientation 交给皮肤排版，role=group 不接受 aria-orientation

<XhDemo src="checkbox-group/03-horizontal" />

### 禁用与只读

整组禁用连隐藏输入一起退出提交，只读则仍能聚焦与朗读、只是改不动

<XhDemo src="checkbox-group/04-disabled" />

### 栅格排布

组容器的行列只是缺省排布，行内把 display 改成 grid 就能摆成多列

<XhDemo src="checkbox-group/05-grid" />

### 受控与拦截

传了 value 就由宿主说了算，value-change 只报意图；这里最多留两项

<XhDemo src="checkbox-group/06-event" />

### 整组换档

方框边长、字号、间距与选中色都是组件令牌，写在组容器上整组一起生效

<XhDemo src="checkbox-group/07-scale" />

### 数字主键

条目身份存在 DOM 属性上，值一律是字符串；数字主键在进出两侧各转一次

<XhDemo src="checkbox-group/08-numeric-value" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox-group>` |
| Vue 组件 | `XhCheckboxGroupIndicator` `XhCheckboxGroupItem` `XhCheckboxGroupItemText` `XhCheckboxGroupLabel` `XhCheckboxGroupRoot` `XhCheckboxGroupTrigger` |
| 组合式函数 | `useCheckboxGroup` |
| 状态机 | `checkboxGroupMachine` |
| 皮肤 | `@xihan-ui/styles/checkbox-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="checkbox-group"`：**`root`** · `label` · **`item`** · `indicator` · `item-text` · `hidden-input` · `trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `CheckboxGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string[]` |  | 选中值集合。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `itemValues` | `string[]` |  | 组内全部条目的值，按书写顺序声明；不给时 checkedState 退化成 unchecked / indeterminate 两态。 |
| `disabled` | `boolean` |  | 整组禁用：每一项都跟着禁用，且隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦与朗读，但用户改不动。 |
| `invalid` | `boolean` |  | 校验失败标注，落到每个条目的 aria-invalid 上。 |
| `name` | `string` |  | 表单字段名；给定后每个条目的隐藏输入才带 name，同名多值一并提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 vertical。只出 data-orientation，不出 aria-orientation。 |
| `onValueChange` | `(details: CheckboxGroupValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CheckboxGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCheckboxGroupRoot` | `default` | `CheckboxGroupRootSlotProps` |  |
| `XhCheckboxGroupRoot` | `label` | — |  |
| `XhCheckboxGroupRoot` | `item` | `CheckboxGroupNodeMeta` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | resolveCheckedState(value, prop('itemValues') ?? []) |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.TOGGLE` · `ALL.TOGGLE` · `FORM.RESET`

**判据**：`editable`

## connect API

`useCheckboxGroup` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` |  |
| `collection` | `readonly CheckboxGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `checkedState` | `CheckboxGroupCheckedState` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `isChecked` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` | 整体替换选中集合。程序化入口，不受 readOnly 拦截。 |
| `toggleValue` | `(value: string) => void` | 翻转某个值；整组禁用或只读时无效。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getHiddenInputProps` | `(props: CheckboxGroupItemProps) => T['input']` | 条目的表单影子：一份视觉隐藏的原生 checkbox，由条目内部渲染。 |
| `getTriggerProps` | `() => T['element']` | 全选/半选的父复选框。必须写在 root 之内，它靠祖先链找到本组。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus enters or leaves the group | 组内有几个条目就有几个 Tab 停靠点（禁用条目也留一个），容器自己不占位；单选组的"整组一个停靠点"在这里不成立 |
| `Space` | focus on item, group editable and item not disabled | 翻转该条目的选中态；改不动时放行按键给页面滚动 |
| `Space` | focus on trigger, group editable | 可用条目未全选则一并勾上，已全选则一并取消；禁用条目不受影响 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-invalid` | 'true' \| 'false' |
| `item` | `aria-readonly` | 'true' \| 'false' |
| `item` | `role` | 'checkbox' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |
| `trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `trigger` | `aria-disabled` | 'false' \| 'true' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `trigger` 部件的 id |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `role` | 'checkbox' |

## 样式

默认皮肤 `@xihan-ui/styles/checkbox-group.css` 按部件选择：`[data-scope="checkbox-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-readonly` | ''（条件成立时才出现） |
| `trigger` | `data-state` | resolveCheckedState(value, prop('itemValues') ?? []) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-checkbox-group-gap` · `--xh-checkbox-group-icon-size` · `--xh-checkbox-group-indicator-bg` · `--xh-checkbox-group-indicator-bg-checked` · `--xh-checkbox-group-indicator-border` · `--xh-checkbox-group-indicator-border-checked` · `--xh-checkbox-group-indicator-border-hover` · `--xh-checkbox-group-indicator-border-invalid` · `--xh-checkbox-group-indicator-fg` · `--xh-checkbox-group-indicator-font-size` · `--xh-checkbox-group-indicator-radius` · `--xh-checkbox-group-indicator-size` · `--xh-checkbox-group-item-fg` · `--xh-checkbox-group-item-fg-disabled` · `--xh-checkbox-group-item-font-size` · `--xh-checkbox-group-item-gap` · `--xh-checkbox-group-item-radius` · `--xh-checkbox-group-label-fg` · `--xh-checkbox-group-label-fg-disabled` · `--xh-checkbox-group-label-font-size` · `--xh-checkbox-group-label-font-weight` · `--xh-checkbox-group-trigger-fg` · `--xh-checkbox-group-trigger-fg-disabled` · `--xh-checkbox-group-trigger-font-size` · `--xh-checkbox-group-trigger-font-weight` · `--xh-checkbox-group-trigger-gap` · `--xh-checkbox-group-trigger-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 外面套[表单字段](./field)。

## 最佳实践

- 超过约十项就换成带搜索的控件。
- 选项顺序稳定，别按选中状态重排——用户会跟丢。

## 反模式

- 用它表达一组互斥的筛选条件。
- 全选框放在列表最下面。
