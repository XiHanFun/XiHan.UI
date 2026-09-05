# 标签组 <Badge type="info" text="tag-group" />

一排标签当作一件东西来操作：方向键在标签之间走，整组只占一个 Tab 停靠点，
标签可以选中、也可以被摘掉，摘完焦点有去处。

单枚[标签](./tag)不接收焦点，它的关闭钮是页面上一个独立的 Tab 停靠点——十枚标签就是
十个停靠点，键盘用户得按十下才能走过去。标签组把这十个收成一个。

## 何时使用

- 一排可摘的标签：已生效的筛选条件、一条记录挂着的若干分类。
- 一排可选的标记：点一枚就筛一次，或者按住多选。
- 键盘与读屏用户要能逐枚走过去、逐枚摘掉。

## 何时不用

- 只有一枚标签，且不接交互：直接用[标签](./tag)。
- 用户要自己输入并累积多个值：用[标签输入](./tags-input)，它自带输入框与增删逻辑。
- 选项很多、需要搜索：用[选择器](./select)的多选或[穿梭框](./transfer)。
- 一组互斥选项要用户挑一个：用[单选组](./radio-group)或[分段控件](./segmented)。
- 只是把一排标签摆开、不接键盘：用[弹性布局](./flex) 包一层就够了。

## 特性

- roving tabindex：整组一个 Tab 停靠点，组内走方向键；`Home` / `End` 到端点。
- `selectionMode` 三档：`none` 只是标记、`single` 单选、`multiple` 可多选（`Ctrl`/`Cmd` + `A` 全选）。
- `deletable` 给出摘除钮，键盘那一路走 `Delete` / `Backspace`。
- 摘掉一枚之后焦点交给前一枚；前面没有就交给后一枚，一枚不剩就交给列表容器。
- `collection` 是文本、禁用与可摘的事实源；也可以逐枚自己写。
- 连打检索按首字母跳，只搬焦点、不改选中值。

## 示例

### 基础用法

一排可摘标签：整组只占一个 Tab 位，方向键走标签，Delete 或 Backspace 摘掉

<XhDemo src="tag-group/01-basic" />

### 可选中

selectionMode 决定点一枚是替换还是加选；Ctrl/Cmd + A 全选

<XhDemo src="tag-group/02-selection" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tag-group>` |
| Vue 组件 | `XhTagGroupCell` `XhTagGroupItem` `XhTagGroupItemDeleteTrigger` `XhTagGroupItemText` `XhTagGroupLabel` `XhTagGroupList` `XhTagGroupRoot` |
| 组合式函数 | `useTagGroup` |
| 状态机 | `tagGroupMachine` |
| 皮肤 | `@xihan-ui/styles/tag-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tag-group"`：`root` · `label` · **`list`** · **`item`** · **`cell`** · `item-text` · `item-delete-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TagGroupNode[]` |  | 条目数据，显示文本、禁用与可摘的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| string[]` |  | 选中值，给定即受控；单选可写成裸串，内部归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `TagGroupSelectionMode` |  | 选择模式，默认 none。 |
| `deletable` | `boolean` |  | 是否给出摘除钮，默认 false。false 时该钮同时被禁用与收起。 |
| `disabled` | `boolean` |  | 整组禁用：键盘与点击都不再改选中值，也摘不掉任何一枚。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、可导航与朗读，但选中值改不动、标签也摘不掉。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal——标签是成排出现的。 |
| `typeahead` | `boolean` |  | 连打检索，默认开。 |
| `variant` | `TagVariant` |  | 形态：solid / subtle / outline，沿继承流下发给每一枚标签。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: TagGroupValueChangeDetails) => void` |  | value 变化意图回调。 |
| `onItemDelete` | `(details: TagGroupItemDeleteDetails) => void` |  | 摘除意图回调。条目由宿主的数据决定去留，组件只报「用户要摘这一枚」， 顺手把它从选中集合里去掉，并把焦点交给相邻的一枚。 |
| `translations` | `Partial<TagGroupTranslations>` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TagGroupValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `item-delete` | `TagGroupItemDeleteDetails` | 用户要摘掉某一枚；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTagGroupRoot` | `default` | `TagGroupRootSlotProps` |  |
| `XhTagGroupRoot` | `label` | — |  |
| `XhTagGroupRoot` | `item` | `TagGroupNodeMeta` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item-delete-trigger` | 'checked' \| 'unchecked' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `ITEM.DELETE` · `LIST.BLUR`

## connect API

`useTagGroup` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1。 |
| `collection` | `readonly TagGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `selectionMode` | `TagGroupSelectionMode` | 生效的选择模式。 |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在组内时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `deletable` | `boolean` | 整组是否给出摘除钮。 |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 只留这一个；加选用 toggle。 |
| `toggle` | `(value: string) => void` |  |
| `deleteItem` | `(value: string) => void` | 摘掉一枚。程序化入口，不搬焦点。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TagGroupItemProps) => T['element']` |  |
| `getCellProps` | `(props: TagGroupItemProps) => T['element']` | 标签里那一格；摘除钮必须落在它之内。 |
| `getItemTextProps` | `(props: TagGroupItemProps) => T['element']` |  |
| `getItemDeleteTriggerProps` | `(props: TagGroupItemProps) => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点标签，无锚点时先落列表容器再由它转投；每枚标签的摘除钮一律不占停靠点 |
| `ArrowRight` | focus in group, orientation=horizontal | 焦点移到下一枚可停留标签（禁用项跳过、尽头按 loop 回绕）；orientation=vertical 时改由 ArrowDown 承担，dir=rtl 再对调左右 |
| `ArrowLeft` | focus in group, orientation=horizontal | 焦点移到上一枚可停留标签（禁用项跳过、尽头按 loop 回绕）；orientation=vertical 时改由 ArrowUp 承担，dir=rtl 再对调左右 |
| `Home` | focus in group | 焦点移到首枚可停留标签 |
| `End` | focus in group | 焦点移到末枚可停留标签 |
| `Enter` / `Space` | focus on item, selectionMode=single 且可改 | 只选中焦点标签，替换原有选中；标签禁用或整组只读则不认 |
| `Enter` / `Space` | focus on item, selectionMode=multiple 且可改 | 切换焦点标签的选中态，其余选中不动 |
| `Ctrl+A` / `Cmd+A` | focus in group, selectionMode=multiple 且可改 | 选中全部可选标签；已经全选则把它们一并取消（禁用但已选中的不动） |
| `Delete` / `Backspace` | focus on item, 该标签可摘且可改 | 摘掉焦点标签，并把焦点交给前一枚；前面没有就交给后一枚，一枚不剩就交给列表容器 |
| `单个可打印字符` | focus in group, typeahead 未关 | 连打检索把焦点移到首字母匹配的标签，不改选中值 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-label` | label.list |
| `list` | `aria-labelledby` | `label` 部件的 id |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `aria-readonly` | 'true' \| 'false' |
| `list` | `role` | 'grid' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' \| undefined |
| `item` | `role` | 'row' |
| `cell` | `role` | 'gridcell' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(metaOf.get(item.value)?.label ?? ite… |

一排可摘标签是「集合 + 每条自带动作」，这在 ARIA 里只有表格语义放得下：可聚焦的摘除钮
不许待在 `option` 这类控件角色里，`gridcell` 允许。所以 `list` 是 `grid`、每枚标签是 `row`、
标签里那一格是 `gridcell`——手写部件时 `cell` 这一层不能省，用 `collection` 则由组件自己铺开。

## 样式

默认皮肤 `@xihan-ui/styles/tag-group.css` 按部件选择：`[data-scope="tag-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-orientation` | props.orientation |
| `item` | `data-deletable` | ''（条件成立时才出现） |
| `item` | `data-selectable` | ''（条件成立时才出现） |
| `item` | `data-size` | props.size |
| `item` | `data-tone` | props.tone |
| `item` | `data-variant` | props.variant |
| `item-delete-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-state` | 'checked' \| 'unchecked' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-tag-group-cell-gap` · `--xh-tag-group-gap` · `--xh-tag-group-item-bg` · `--xh-tag-group-item-bg-disabled` · `--xh-tag-group-item-bg-hover` · `--xh-tag-group-item-border` · `--xh-tag-group-item-border-disabled` · `--xh-tag-group-item-border-selected` · `--xh-tag-group-item-delete-bg-active` · `--xh-tag-group-item-delete-bg-hover` · `--xh-tag-group-item-delete-fg` · `--xh-tag-group-item-delete-radius` · `--xh-tag-group-item-delete-size` · `--xh-tag-group-item-fg` · `--xh-tag-group-item-fg-selected` · `--xh-tag-group-item-font-size` · `--xh-tag-group-item-font-weight` · `--xh-tag-group-item-icon-size` · `--xh-tag-group-item-px` · `--xh-tag-group-item-px-deletable` · `--xh-tag-group-item-py` · `--xh-tag-group-item-radius` · `--xh-tag-group-item-shadow` · `--xh-tag-group-label-fg` · `--xh-tag-group-label-font-size` · `--xh-tag-group-label-font-weight` · `--xh-tag-group-list-gap`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 每一枚标签的观感与[标签](./tag)同源：形态 · 语气 · 尺寸三轴写在组上，沿继承流下发。
- 标签里的图元用[图标](./icon)。
- 外面套[表单字段](./field)，标题就有了去处。

## 最佳实践

- 条目的去留是宿主的事：`item-delete` 只报「用户要摘这一枚」，宿主从自己的数据里删掉它。
  组件不替宿主决定，因为撤销、二次确认、服务端失败回滚都只有宿主知道。
- 摘掉一枚之后要有回退路径，否则用户误点就再也加不回来。
- 标签文字尽量短，且首字母有区分度——连打检索按首字母跳。
- 不接选中就把 `selectionMode` 留在 `none`：一排纯标记标签报「未选中」是句假话。

## 反模式

- 把整排标签铺成十个 Tab 停靠点：那正是这个组件要解决的问题，别再逐枚写[标签](./tag)。
- 摘完不管焦点：被摘的那一枚带着焦点一起消失，焦点会掉回页面开头。
- 用颜色单独表达含义：色觉障碍的用户分不出来，文字本身要说清楚。
