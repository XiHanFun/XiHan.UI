# 列表框 <Badge type="info" text="listbox" />

一份直接铺在页面上的可选列表，不带浮层。

## 何时使用

- 选项需要常驻可见（穿梭框的两侧、设置面板的左栏）。
- 需要多选、范围选（Shift）与全选（Cmd + A）。

## 何时不用

- 选项要收起来：用[选择器](./select)。
- 列表只是展示、不可选：用[列表](./list)。

## 特性

- 三种选择模式：单选、多选、以及带 Shift 范围扩展的模式。
- `typeahead` 连打检索。
- 定高滚动与空态都有对应部件。

## 示例

### 基础用法

方向键只搬焦点，Enter 或空格才落值；整组只占一个 Tab 位

<XhDemo src="listbox/01-basic" />

### 多选

selection-mode="multiple" 下空格改成切换该条，Shift + 方向键顺手扩选，Ctrl / Cmd + A 全选或全不选

<XhDemo src="listbox/02-multiple" />

### 分组

item-group 把条目分段，group-label 是这一段的可及名字，不参与选中也不接方向键

<XhDemo src="listbox/03-group" />

### 选择模式

selection-mode="extended" 是「裸点换一条、Ctrl 与 Shift 才扩选」，与 multiple 档的区别就在裸点

<XhDemo src="listbox/04-selection-mode" />

### 弹出式选择

把列表装进浮层：触发器显示当前选中项，落值即收起，浮层底部还能放操作按钮

<XhDemo src="listbox/05-popover" />

### 定高滚动

用 --xh-listbox-content-max-h 压住列表高度，条目多了就在容器里滚；方向键走到哪条，视图跟到哪条

<XhDemo src="listbox/06-scroll" />

### 空态

条目筛空时收起列表、亮出空态节点：它挂在 content 之外，方向键、连打检索与全选都看不见它

<XhDemo src="listbox/07-empty" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-listbox>` |
| Vue 组件 | `XhListboxContent` `XhListboxItem` `XhListboxItemGroup` `XhListboxItemGroupLabel` `XhListboxItemIndicator` `XhListboxItemText` `XhListboxLabel` `XhListboxRoot` |
| 组合式函数 | `useListbox` |
| 状态机 | `listboxMachine` |
| 皮肤 | `@xihan-ui/styles/listbox.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="listbox"`：`root` · `label` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-group` · `item-group-label`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ListboxNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| string[]` |  | 选中值，给定即受控；单选可写成裸串，内部归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `ListboxSelectionMode` |  | 选择模式，默认 single。 |
| `disabled` | `boolean` |  | 整个列表禁用，键盘与点击都不再改选中值。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `typeahead` | `boolean` |  | 连打检索，默认开。 |
| `onValueChange` | `(details: ListboxValueChangeDetails) => void` |  | value 变化意图回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ListboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhListboxRoot` | `default` | `ListboxRootSlotProps` |  |
| `XhListboxRoot` | `label` | — |  |
| `XhListboxRoot` | `item` | `ListboxNodeMeta` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `LIST.BLUR`

## connect API

`useListbox` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1。 |
| `collection` | `readonly ListboxNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `selectionMode` | `ListboxSelectionMode` | 生效的选择模式。 |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在列表内时为 null。 |
| `disabled` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 只留这一个；加选用 toggle。 |
| `toggle` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemGroupProps` | `(props: ListboxItemGroupProps) => T['element']` |  |
| `getItemGroupLabelProps` | `(props: ListboxItemGroupProps) => T['element']` |  |
| `getItemProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ListboxItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the listbox | 整个列表只占一个 Tab 位：焦点进入锚点条目，无锚点时先落容器再由它转投 |
| `ArrowDown` | focus in listbox, orientation=vertical | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowRight 承担，dir=rtl 再对调左右 |
| `ArrowUp` | focus in listbox, orientation=vertical | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowLeft 承担，dir=rtl 再对调左右 |
| `Home` | focus in listbox | 焦点移到首个可停留条目 |
| `End` | focus in listbox | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, selectionMode 为 single 或 extended | 只选中焦点条目，替换原有选中；条目自报禁用则不认 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 可多选（multiple；extended 下须按住 Ctrl/Cmd） | 切换焦点条目的选中态，其余选中不动 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in listbox, 可多选 | 焦点移到相邻条目并切换它的选中态；往回走即把刚扩进来的那个摘掉 |
| `Ctrl+A` / `Cmd+A` | focus in listbox, 可多选 | 选中全部可选条目；已经全选则把它们一并取消（禁用但已选中的不动） |
| `单个可打印字符` | focus in listbox, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不改选中值 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `content` | `aria-disabled` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `aria-orientation` | props.orientation |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item-group` | `aria-labelledby` | `group-label` 部件的 id |
| `item-group` | `role` | 'group' |

## 样式

默认皮肤 `@xihan-ui/styles/listbox.css` 按部件选择：`[data-scope="listbox"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-orientation` | props.orientation |
| `item-group` | `data-disabled` | ''（条件成立时才出现） |
| `item-group-label` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-listbox-content-bg` · `--xh-listbox-content-border` · `--xh-listbox-content-fg` · `--xh-listbox-content-gap` · `--xh-listbox-content-max-h` · `--xh-listbox-content-px` · `--xh-listbox-content-py` · `--xh-listbox-content-radius` · `--xh-listbox-gap` · `--xh-listbox-group-gap` · `--xh-listbox-group-label-fg` · `--xh-listbox-group-label-font-size` · `--xh-listbox-group-label-font-weight` · `--xh-listbox-group-label-px` · `--xh-listbox-group-label-py` · `--xh-listbox-icon-size` · `--xh-listbox-item-bg-hover` · `--xh-listbox-item-fg` · `--xh-listbox-item-fg-selected` · `--xh-listbox-item-font-size` · `--xh-listbox-item-font-weight-selected` · `--xh-listbox-item-gap` · `--xh-listbox-item-group-gap` · `--xh-listbox-item-indicator-fg` · `--xh-listbox-item-indicator-size` · `--xh-listbox-item-leading` · `--xh-listbox-item-px` · `--xh-listbox-item-py` · `--xh-listbox-item-radius` · `--xh-listbox-label-fg` · `--xh-listbox-label-font-size` · `--xh-listbox-label-font-weight`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 作为[穿梭框](./transfer)、[弹出选择](./popselect)的内层；长列表配[虚拟滚动](./virtualizer)。

## 最佳实践

- 多选时给出"已选 N 项"的回显，否则滚动后用户不知道选了多少。
- 定高，别让列表把页面撑到需要整页滚动。

## 反模式

- 用它承载命令：列表框的条目是选项不是动作。
- 选项超过几百条却不虚拟化。
