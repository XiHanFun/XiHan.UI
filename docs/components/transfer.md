# 穿梭框 <Badge type="info" text="transfer" />

左右两栏，把条目从一边搬到另一边。

## 何时使用

- 从一份候选里挑出一个子集，且用户需要同时看见"没选的"和"已选的"。
- 已选项的顺序或数量需要一目了然（分配权限、选人）。

## 何时不用

- 候选很少：用[复选框组](./checkbox-group)。
- 只需要选中不需要对照：用[选择器](./select)的多选。

## 特性

- 两栏都可搜索，`filter` 可自定义匹配规则。
- `oneWay` 单向搬运：只能往目标搬，搬完不再退回。
- 一万条时只渲可视区。

## 示例

### 基础用法

collection 是条目全集的唯一事实源，value 只装落在右侧的那批

<XhDemo src="transfer/01-basic" />

### 搜索过滤

searchable 给每侧配一个搜索框，筛剩下的才参与方向键、全选与搬运

<XhDemo src="transfer/02-searchable" />

### 条目禁用

禁用写在 items 上：勾不动也搬不动，但仍可聚焦、仍是方向键的起点

<XhDemo src="transfer/03-disabled-item" />

### 单向搬运

oneWay 把往回搬那条路整个封死，右侧不再接受勾选，往回的按钮也就不必写

<XhDemo src="transfer/04-one-way" />

### 条目自定义内容

条目里长什么样归作者：勾选格与文本各就各位，前后再各加一段自己的标记

<XhDemo src="transfer/05-rich-item" />

### 列表分组

面板插槽给出本侧此刻看得见的条目，据此分组渲染；小标题是普通节点，不入方向键也不入搬运

<XhDemo src="transfer/06-grouped-list" />

### 一万条只渲可视区

面板插槽给的是本侧此刻看得见的全集，作者按滚动位置切一段挂出来，上下各留一个撑高块；全选、计数与搬运不读 DOM，照样管到窗口外

<XhDemo src="transfer/07-long-list" />

### 整块换档

面板高度、表头、条目行、勾选格与搬运按钮各是一个令牌，写在根上整块一起换档

<XhDemo src="transfer/08-scale" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-transfer>` |
| Vue 组件 | `XhTransferItem` `XhTransferItemCheckbox` `XhTransferItemText` `XhTransferList` `XhTransferPanelCount` `XhTransferPanelHeader` `XhTransferPanelTitle` `XhTransferRoot` `XhTransferSearch` `XhTransferSelectAllTrigger` `XhTransferSourcePanel` `XhTransferTargetPanel` `XhTransferToSourceTrigger` `XhTransferToTargetTrigger` |
| 组合式函数 | `useTransfer` |
| 状态机 | `transferMachine` |
| 皮肤 | `@xihan-ui/styles/transfer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="transfer"`：`root` · **`source-panel`** · **`target-panel`** · `panel-header` · `panel-title` · `panel-count` · `search` · **`list`** · `item` · `item-text` · `item-checkbox` · **`to-target-trigger`** · `to-source-trigger` · `select-all-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TransferItem[]` |  | 条目全集，元信息的唯一事实源。缺省为空。 |
| `value` | `string[]` |  | 落在 target 侧的值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `selection` | `string[]` |  | 两侧合起来被勾中的值（用于搬运）。给定即受控，语义同上。 |
| `defaultSelection` | `string[]` |  |  |
| `searchable` | `boolean` |  | 每侧带一个搜索框；关掉时搜索框仍在 DOM 里但带 hidden，且搜索串一律按空处理。 |
| `filter` | `TransferFilter` |  | 自定义匹配规则；缺省是标签大小写不敏感包含。 |
| `disabled` | `boolean` |  | 整个控件禁用：条目转 aria-disabled，三个按钮与搜索框用原生 disabled。 |
| `oneWay` | `boolean` |  | 只能往右不能往回：往回搬那条路整个封死，target 侧也不再接受勾选。 |
| `loop` | `boolean` |  | 列表内方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；决定列表内哪个横向方向键是"搬向对面"。 |
| `onValueChange` | `(details: TransferValueChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TransferSelectionChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TransferValueChangeDetails` | 落在右侧的值变化；detail 为 `{ value: string[] }` |
| `selection-change` | `TransferSelectionChangeDetails` | 勾选集合变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTransferRoot` | `default` | `TransferRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `select-all-trigger` | checkStates[panel.side] |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `SELECTION.SET` · `ITEM.TOGGLE` · `SIDE.TOGGLE_ALL` · `ITEMS.MOVE` · `SEARCH.SET` · `ITEM.FOCUS` · `LIST.BLUR`

## connect API

`useTransfer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly TransferItem[]` | 条目全集（作者给的那份，原样透出）。 |
| `value` | `string[]` | 落在 target 侧的值。 |
| `selection` | `string[]` | 两侧合起来被勾中的值。 |
| `disabled` | `boolean` |  |
| `oneWay` | `boolean` |  |
| `searchable` | `boolean` |  |
| `visibleItems` | `(side: TransferSide) => readonly TransferItem[]` | 某一侧当下看得见的条目（分侧 + 搜索之后），顺序恒为 collection 原序。 |
| `checkedValues` | `(side: TransferSide) => string[]` | 某一侧此刻真正勾中的值（只算可见且未禁用的那些，与三态、搬运同一口径）。 |
| `checkState` | `(side: TransferSide) => TransferCheckState` |  |
| `query` | `(side: TransferSide) => string` |  |
| `canMove` | `(to: TransferSide) => boolean` | 往 to 侧搬此刻可不可行：对面有勾中的可操作条目，且这条路没被 oneWay 封死。 |
| `isChecked` | `(value: string) => boolean` |  |
| `sideOf` | `(value: string) => TransferSide` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setSelection` | `(next: string[]) => void` |  |
| `setQuery` | `(side: TransferSide, query: string) => void` |  |
| `toggle` | `(value: string) => void` |  |
| `toggleAll` | `(side: TransferSide) => void` |  |
| `move` | `(to: TransferSide) => void` | 程序化搬运；焦点安排不在这里做，那要知道是哪个节点触发的。 |
| `getRootProps` | `() => T['element']` |  |
| `getPanelProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelHeaderProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelTitleProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelCountProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getSearchProps` | `(props: TransferPanelProps) => T['input']` |  |
| `getListProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getSelectAllTriggerProps` | `(props: TransferPanelProps) => T['button']` |  |
| `getItemProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemCheckboxProps` | `(props: TransferItemProps) => T['element']` |  |
| `getToTargetTriggerProps` | `() => T['button']` |  |
| `getToSourceTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside a list | 每一侧列表只占一个 Tab 位：焦点进入该侧锚点条目，无锚点时先落列表容器再由它转投；两个搬运按钮与两个全选格各自另占一位，禁用时自动退出 Tab 序列 |
| `ArrowDown` | focus in a list | 焦点移到本侧下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；不会走到对面那一侧去 |
| `ArrowUp` | focus in a list | 焦点移到本侧上一个可停留条目 |
| `Home` | focus in a list | 焦点移到本侧首个可停留条目 |
| `End` | focus in a list | 焦点移到本侧末个可停留条目 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 本侧可勾选 | 切换焦点条目的勾选态，其余勾选不动；条目禁用、或已被搜索藏起来则不认 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in a list, 本侧可勾选 | 焦点移到相邻条目并切换它的勾选态；往回走即把刚扩进来的那个摘掉 |
| `Ctrl+A` / `Cmd+A` | focus in a list, 本侧可勾选 | 勾中本侧全部可操作条目（可见且未禁用）；已经全勾则一并取消 |
| `ArrowRight` / `ArrowLeft` | focus in a list, 该方向指向对面且对面搬得动 | 把本侧勾中的条目搬到对面（dir=rtl 时左右语义对调）；搬完焦点落到目的地那一侧的列表上。方向指向本侧、或此刻搬不动时这个键放行给页面 |
| `Enter` / `Space` | focus on to-target-trigger / to-source-trigger | 把对面勾中的条目搬过来（原生按钮的激活行为）；搬完按钮多半随即变禁用，焦点改落到目的地那一侧的列表上 |
| `Enter` / `Space` | focus on select-all-trigger | 全选/取消全选该侧可操作条目（原生按钮的激活行为）；三态经 aria-checked 上报，半选时是 mixed |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `search` | `aria-controls` | listId[panel.side] |
| `search` | `aria-labelledby` | titleId[panel.side] |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-labelledby` | titleId[panel.side] |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-checkbox` | `aria-hidden` | 'true' |
| `to-target-trigger` | `aria-controls` | listId.target |
| `to-source-trigger` | `aria-controls` | listId.source |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-controls` | listId[panel.side] |
| `select-all-trigger` | `role` | 'checkbox' |

## 样式

默认皮肤 `@xihan-ui/styles/transfer.css` 按部件选择：`[data-scope="transfer"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-one-way` | ''（条件成立时才出现） |
| `panel-header` | `data-disabled` | ''（条件成立时才出现） |
| `panel-header` | `data-side` | panel.side |
| `panel-title` | `data-side` | panel.side |
| `panel-count` | `data-checked-count` | String(checked[panel.side].length) |
| `panel-count` | `data-count` | String(visible[panel.side].length) |
| `panel-count` | `data-side` | panel.side |
| `search` | `data-side` | panel.side |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-side` | panel.side |
| `to-target-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `to-source-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-side` | panel.side |
| `select-all-trigger` | `data-state` | checkStates[panel.side] |
| `panel` | `data-disabled` | ''（条件成立时才出现） |
| `panel` | `data-side` | panel.side |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-transfer-checkbox-bg` · `--xh-transfer-checkbox-bg-checked` · `--xh-transfer-checkbox-bg-disabled` · `--xh-transfer-checkbox-border` · `--xh-transfer-checkbox-border-checked` · `--xh-transfer-checkbox-border-disabled` · `--xh-transfer-checkbox-fg` · `--xh-transfer-checkbox-font-size` · `--xh-transfer-checkbox-radius` · `--xh-transfer-checkbox-size` · `--xh-transfer-count-fg` · `--xh-transfer-count-font-size` · `--xh-transfer-fg` · `--xh-transfer-gap` · `--xh-transfer-header-gap` · `--xh-transfer-header-px` · `--xh-transfer-header-py` · `--xh-transfer-icon-size` · `--xh-transfer-item-bg-hover` · `--xh-transfer-item-fg` · `--xh-transfer-item-font-size` · `--xh-transfer-item-gap` · `--xh-transfer-item-leading` · `--xh-transfer-item-px` · `--xh-transfer-item-py` · `--xh-transfer-item-radius` · `--xh-transfer-list-gap` · `--xh-transfer-list-h` · `--xh-transfer-list-px` · `--xh-transfer-list-py` · `--xh-transfer-panel-bg` · `--xh-transfer-panel-bg-disabled` · `--xh-transfer-panel-border` · `--xh-transfer-panel-radius` · `--xh-transfer-search-bg` · `--xh-transfer-search-border` · `--xh-transfer-search-fg` · `--xh-transfer-search-font-size` · `--xh-transfer-search-h` · `--xh-transfer-search-px` · `--xh-transfer-select-all-fg` · `--xh-transfer-select-all-font-size` · `--xh-transfer-select-all-gap` · `--xh-transfer-select-all-radius` · `--xh-transfer-title-fg` · `--xh-transfer-title-font-size` · `--xh-transfer-title-font-weight` · `--xh-transfer-trigger-bg` · `--xh-transfer-trigger-bg-active` · `--xh-transfer-trigger-bg-hover` · `--xh-transfer-trigger-border` · `--xh-transfer-trigger-fg` · `--xh-transfer-trigger-font-size` · `--xh-transfer-trigger-px` · `--xh-transfer-trigger-radius` · `--xh-transfer-trigger-size`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 内层是[列表框](./listbox)；长列表配[虚拟滚动](./virtualizer)。

## 最佳实践

- 两栏都显示计数，用户才知道还剩多少没挑。
- 候选很大时把搜索做成远端过滤，别把全量灌进前端。

## 反模式

- 在窄屏上用它：两栏加中间的按钮列放不下。
- 搬运后不保留滚动位置，用户每搬一条都要重新找位置。
