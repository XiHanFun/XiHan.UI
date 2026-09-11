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
- 定高滚动与三种非条目相位都有对应部件：空（`empty`）、在途（`loading`）、还有更多（`load-more-trigger`）。
- `loading` 为真时列表报 `aria-busy`，在途占位顶上来、空态占位让位；给了 `collection` 时两者的收放归连接层。
- `load-more-trigger` 是取下一页的入口：还有没有下一页、点了做什么都归作者，连接层只保证在途与整列禁用两档点不动。

## 示例

### 基础用法

方向键只搬焦点，Enter 或空格才落值；整组只占一个 Tab 位

<XhDemo src="listbox/01-basic" />

### 多选

selection-mode="multiple" 下空格改成切换该条，Shift + 方向键顺手扩选，Ctrl / Cmd + A 全选或全不选

<XhDemo src="listbox/02-multiple" />

### 分组

group 把条目分段，group-label 是这一段的可及名字，不参与选中也不接方向键

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

### 三种相位

空、在途、还有更多各有部件：给了 collection 时前两者的收放归组件，取下一页那颗钮点了做什么归你

<XhDemo src="listbox/08-phases" />

### 语气

tone 决定选中条目的勾选标记用哪族颜色，未选中的条目不受影响

<XhDemo src="listbox/09-tone" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-listbox>` |
| Vue 组件 | `XhListboxContent` `XhListboxEmpty` `XhListboxGroup` `XhListboxGroupLabel` `XhListboxItem` `XhListboxItemIndicator` `XhListboxItemText` `XhListboxLabel` `XhListboxLoadMoreTrigger` `XhListboxLoading` `XhListboxRoot` |
| 组合式函数 | `useListbox` |
| 状态机 | `listboxMachine` |
| 皮肤 | `@xihan-ui/styles/listbox.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="listbox"`：`root` · `label` · **`content`** · **`item`** · `item-text` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `load-more-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ListboxNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| string[]` |  | 选中值，给定即受控；单选可写成裸串，内部归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `ListboxSelectionMode` |  | 选择模式，默认 single。 |
| `disabled` | `boolean` |  | 整个列表禁用，键盘与点击都不再改选中值。 |
| `readOnly` | `boolean` |  | 只读：条目照常浏览与聚焦，但选中值改不动。禁用则连焦点带都退出。 |
| `loading` | `boolean` |  | 条目还在取：列表报 aria-busy，在途占位顶上来，空态占位让位。 |
| `invalid` | `boolean` |  | 校验失败：列表报 aria-invalid，各角色节点带 data-invalid。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选标记用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目的几何档位。 |
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
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `loading` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 只留这一个；加选用 toggle。 |
| `toggle` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 root 里、content 的兄弟。 给了 collection 时由连接层按条数收放；条目手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 给了 collection 时由连接层按条数收放；条目手写时只按 loading 收放。 |
| `getLoadMoreTriggerProps` | `() => T['element']` | 取下一页的入口：库不知道还有没有下一页，露不露面与点了做什么都归作者， 连接层只保证取数在途与整列禁用两档点不动。 |
| `getGroupProps` | `(props: ListboxGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ListboxGroupProps) => T['element']` |  |
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
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-disabled` | 'true' \| 'false' |
| `content` | `aria-invalid` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `aria-orientation` | props.orientation |
| `content` | `aria-readonly` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |

## 样式

默认皮肤 `@xihan-ui/styles/listbox.css` 按部件选择：`[data-scope="listbox"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-invalid` | ''（条件成立时才出现） |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-readonly` | ''（条件成立时才出现） |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group-label` | `data-disabled` | ''（条件成立时才出现） |
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-listbox-content-bg` · `--xh-listbox-content-border` · `--xh-listbox-content-border-invalid` · `--xh-listbox-content-fg` · `--xh-listbox-content-gap` · `--xh-listbox-content-max-h` · `--xh-listbox-content-px` · `--xh-listbox-content-py` · `--xh-listbox-content-radius` · `--xh-listbox-empty-fg` · `--xh-listbox-empty-font-size` · `--xh-listbox-empty-px` · `--xh-listbox-empty-py` · `--xh-listbox-gap` · `--xh-listbox-group-gap` · `--xh-listbox-group-label-fg` · `--xh-listbox-group-label-font-size` · `--xh-listbox-group-label-font-weight` · `--xh-listbox-group-label-px` · `--xh-listbox-group-label-py` · `--xh-listbox-group-spacing` · `--xh-listbox-icon-size` · `--xh-listbox-item-bg-hover` · `--xh-listbox-item-fg` · `--xh-listbox-item-fg-selected` · `--xh-listbox-item-font-size` · `--xh-listbox-item-font-weight-selected` · `--xh-listbox-item-gap` · `--xh-listbox-item-indicator-fg` · `--xh-listbox-item-indicator-size` · `--xh-listbox-item-leading` · `--xh-listbox-item-px` · `--xh-listbox-item-py` · `--xh-listbox-item-radius` · `--xh-listbox-label-fg` · `--xh-listbox-label-font-size` · `--xh-listbox-label-font-weight` · `--xh-listbox-load-more-trigger-bg-hover` · `--xh-listbox-load-more-trigger-fg` · `--xh-listbox-load-more-trigger-font-size` · `--xh-listbox-load-more-trigger-gap` · `--xh-listbox-load-more-trigger-px` · `--xh-listbox-load-more-trigger-py` · `--xh-listbox-load-more-trigger-radius` · `--xh-listbox-loading-fg` · `--xh-listbox-loading-font-size` · `--xh-listbox-loading-px` · `--xh-listbox-loading-py`

## 动效

`background` · `background-color` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 作为[穿梭框](./transfer)的内层；长列表配[虚拟滚动](./virtualizer)。
- **弹出式选择**：把本组件装进[浮层](./popover)——触发器显示当前选中项，落值时自己收起浮层，浮层底部还能放操作按钮。不参与表单、也不带输入框的那种就地切换（排序方式、显示密度）走这一种写法，不必另找组件；要随表单提交才用[选择器](./select)。这是本库「浮层壳 + 条目层」的官方组合写法：浮层只管开合与定位，条目、键盘导航、连打检索与选中语义全在本组件里，换一个浮层壳（[菜单](./menu)、[气泡卡片](./popover)）写法不变。示例见本页「弹出式选择」与[选择器](./select)页的同一例。

## 最佳实践

- 单选、多选与 Select 使用同一视觉规则：对号表示选中，中性底表示悬停或键盘高亮，正文不变色、不加粗。
- 自定义条目应显式组合 `item-indicator`；该部件固定在逻辑末端，未选中时保留空间，避免选择时文字移动。

- 多选时给出"已选 N 项"的回显，否则滚动后用户不知道选了多少。
- 定高，别让列表把页面撑到需要整页滚动。

## 反模式

- 用它承载命令：列表框的条目是选项不是动作。
- 选项超过几百条却不虚拟化。
