# 穿梭框 <Badge type="info" text="transfer" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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
| `selected` | `string[]` |  | 两侧合起来被勾中的值（用于搬运）。给定即受控，语义同上。 |
| `defaultSelected` | `string[]` |  |  |
| `searchable` | `boolean` |  | 每侧带一个搜索框；关掉时搜索框仍在 DOM 里但带 hidden，且搜索串一律按空处理。 |
| `filter` | `TransferFilter` |  | 自定义匹配规则；缺省是标签大小写不敏感包含。 |
| `disabled` | `boolean` |  | 整个控件禁用：条目转 aria-disabled，三个按钮与搜索框用原生 disabled。 |
| `oneWay` | `boolean` |  | 只能往右不能往回：往回搬那条路整个封死，target 侧也不再接受勾选。 |
| `loop` | `boolean` |  | 列表内方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；决定列表内哪个横向方向键是"搬向对面"。 |
| `onValueChange` | `(details: TransferValueChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TransferSelectionChangeDetails) => void` |  |  |

## 状态机

**状态**：`idle`

**事件**：`VALUE.SET` · `SELECTED.SET` · `ITEM.TOGGLE` · `SIDE.TOGGLE_ALL` · `ITEMS.MOVE` · `SEARCH.SET` · `ITEM.FOCUS` · `LIST.BLUR`

## connect API

`useTransfer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly TransferItem[]` | 条目全集（作者给的那份，原样透出）。 |
| `value` | `string[]` | 落在 target 侧的值。 |
| `selected` | `string[]` | 两侧合起来被勾中的值。 |
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
| `setSelected` | `(next: string[]) => void` |  |
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
