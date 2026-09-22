# Transfer 穿梭框

左右两栏，把条目从一侧移到另一侧。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/transfer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/transfer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/transfer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/transfer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/transfer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

collection 是条目全集的唯一事实源，value 只承载落在右侧的一批

<XhDemo src="transfer/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="transfer"`：`root` · `hidden-input` · **`source-panel`** · **`target-panel`** · `panel-header` · `panel-title` · `panel-count` · `search` · **`list`** · `group` · `group-label` · `item` · `item-text` · `item-description` · `item-checkbox` · `empty` · `loading` · **`to-target-trigger`** · `to-source-trigger` · `select-all-trigger`

## 示例

### 搜索过滤

searchable 为每侧配一个搜索框，筛选后剩余的才参与方向键、全选与移动

<XhDemo src="transfer/02-searchable" />

### 条目禁用

禁用写在 items 上：不可勾选也不可移动，但仍可聚焦、仍是方向键的起点

<XhDemo src="transfer/03-disabled-item" />

### 单向移动

oneWay 把向回移动的路径整个封闭，右侧不再接受勾选，向回的按钮也不必编写

<XhDemo src="transfer/04-one-way" />

### 条目自定义内容

条目的外观归作者：勾选格与文本各就各位，前后再各加一段自己的标记

<XhDemo src="transfer/05-rich-item" />

### 列表分组

本侧当前可见的条目由组件给出，据此分组渲染；group 是 role=group 的段落壳，段标题不进入方向键也不参与移动

<XhDemo src="transfer/06-grouped-list" />

### 范围选择

按住 Shift 点击某一项，选中锚点到它的一段；锚点跨到另一侧时退化为普通勾选

<XhDemo src="transfer/07-range-selection" />

### 一万条只渲染可视区

面板插槽给出的是本侧当前可见的全集，作者按滚动位置切一段挂载，上下各留一个撑高块；全选、计数与移动不读 DOM，照常管理到窗口外

<XhDemo src="transfer/08-long-list" />

### 整块换档

面板高度、表头、条目行、勾选格与移动按钮各是一个令牌，写在根上整块一起换档

<XhDemo src="transfer/09-scale" />

### 语气与尺寸

tone 更换勾选标记的色族，size 更换条目行与勾选格的几何档；两轴写在根上，两侧面板一起变化

<XhDemo src="transfer/10-tone-size" />

## 设计指引

### 何时使用

- 从一份候选中选出一个子集，且用户需要同时看到未选与已选。
- 已选项的顺序或数量需要一目了然（分配权限、选人）。

### 何时不用

- 候选很少时，使用[复选框组](./checkbox-group)。
- 只需要选中不需要对照时，使用[选择器](./select)的多选。

### 特性

- 两栏都可搜索，`filter` 可自定义匹配规则。
- 勾中的条目铺品牌淡底行面并由行首的方框标记，与表格选中行同一副外观；两侧定高列表挂自绘滚动条。
- `oneWay` 单向移动：只能移向目标，不可退回。
- 条目可逐条声明语气，搬到另一侧仍带着自己的那一份。
- 条目可写副文本，第 2 行放一句解释，搬到另一侧一并带着。
- 万级条目时只渲染可视区。
- 每一侧的空（`empty`）与在途（`loading`）各有部件；`loading` 为真时两侧列表报 `aria-busy`，空态让位。
- 设置 `name` 后，目标侧每个值以一个同名原生字段提交；源侧勾选 `selection` 不参与提交。三端自动装配隐藏出口，无需手写节点。
- 值内逗号保留原样，使用 `new FormData(form).getAll(name)` 读取数组；目标为空时没有该字段，显式选中的空字符串则是一个有效字段值。
- `form` 可指定同一文档或影子树内的原生表单 ID；指定无效 ID 时不关联其他表单。整体 `disabled` 不提交，只读和禁用条目已经存在的目标值仍提交。
- 原生 `form.reset()` 恢复 `defaultValue` 与 `defaultSelection`，清理搜索与导航状态。受控值没有声明默认值时保持业务数据；声明默认值时只通知重置意图，由业务回写受控值。

### 组合

- 内层是[列表框](./listbox)；长列表配[虚拟滚动](./virtualizer)。

### 最佳实践

- 两栏都显示计数，用户才知道剩余数量。
- 候选很大时把搜索做成远端过滤，不把全量数据载入前端。

### 反模式

- 在窄屏上使用：两栏加中间的按钮列放不下。
- 移动后不保留滚动位置，用户每移动一条都要重新定位。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-transfer>` |
| Vue 组件 | `XhTransferEmpty` `XhTransferGroup` `XhTransferGroupLabel` `XhTransferItem` `XhTransferItemCheckbox` `XhTransferItemDescription` `XhTransferItemText` `XhTransferList` `XhTransferLoading` `XhTransferPanelCount` `XhTransferPanelHeader` `XhTransferPanelTitle` `XhTransferRoot` `XhTransferSearch` `XhTransferSelectAllTrigger` `XhTransferSourcePanel` `XhTransferTargetPanel` `XhTransferToSourceTrigger` `XhTransferToTargetTrigger` |
| 组合式函数 | `useTransfer` |
| 状态机 | `transferMachine` |
| 皮肤 | `@xihan-ui/styles/transfer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TransferItem[]` |  | 条目全集，元信息的唯一事实源。默认为空。 |
| `value` | `string[]` |  | 落在 target 侧的值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `name` | `string` |  | 原生表单字段名；目标侧每个值提交一个同名字段。 |
| `form` | `string` |  | 原生表单 ID；显式指定时覆盖祖先表单归属。 |
| `selection` | `string[]` |  | 两侧合计被勾选的值（用于移动）。提供即受控，语义同上。 |
| `defaultSelection` | `string[]` |  |  |
| `searchable` | `boolean` |  | 每侧带一个搜索框；关闭时搜索框仍在 DOM 中但带 hidden，且搜索串一律按空处理。 |
| `filter` | `TransferFilter` |  | 自定义匹配规则；默认为标签大小写不敏感包含。 |
| `disabled` | `boolean` |  | 整个控件禁用：条目为 aria-disabled，三个按钮与搜索框使用原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：两侧照常浏览与搜索，但勾选不可修改、也不可移动。禁用还额外移除键盘入口。 |
| `invalid` | `boolean` |  | 校验失败：两侧列表报告 aria-invalid，各角色节点带 data-invalid。 |
| `loading` | `boolean` |  | 条目加载中：两侧列表报告 aria-busy，显示在途占位、隐藏空态占位。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选标记使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目与勾选格的几何档位。 |
| `oneWay` | `boolean` |  | 只能向右不能向回：向回移动的路径整体关闭，target 侧也不再接受勾选。 |
| `loop` | `boolean` |  | 列表内方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；决定列表内哪个横向方向键是移向对面。 |
| `translations` | `Partial<TransferTranslations>` |  |  |
| `onValueChange` | `(details: TransferValueChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TransferSelectionChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TransferValueChangeDetails` | 落在右侧的值变化；detail 为 `{ value: string[] }` |
| `selection-change` | `TransferSelectionChangeDetails` | 勾选集合变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTransferRoot` | `default` | `TransferRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `item-checkbox` | 'checked' \| 'unchecked' |
| `select-all-trigger` | checkStates[panel.side] |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`FORM.RESET` · `VALUE.SET` · `SELECTION.SET` · `ITEM.TOGGLE` · `SIDE.TOGGLE_ALL` · `ITEMS.MOVE` · `SEARCH.SET` · `ITEM.FOCUS` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly TransferItem[]` | 条目全集（作者提供的数据，原样透出）。 |
| `value` | `string[]` | 落在 target 侧的值。 |
| `selection` | `string[]` | 两侧合计被勾选的值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `oneWay` | `boolean` |  |
| `searchable` | `boolean` |  |
| `visibleItems` | `(side: TransferSide) => readonly TransferItem[]` | 某一侧当前可见的条目（分侧 + 搜索之后），顺序恒为 collection 原序。 |
| `checkedValues` | `(side: TransferSide) => string[]` | 某一侧当前实际勾选的值（只计可见且未禁用的条目，与三态、移动同一口径）。 |
| `checkState` | `(side: TransferSide) => TransferCheckState` |  |
| `query` | `(side: TransferSide) => string` |  |
| `canMove` | `(to: TransferSide) => boolean` | 向 to 侧移动当前是否可行：对面有勾选的可操作条目，且该路径未被 oneWay 关闭。 |
| `isChecked` | `(value: string) => boolean` |  |
| `sideOf` | `(value: string) => TransferSide` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setSelection` | `(next: string[]) => void` |  |
| `setQuery` | `(side: TransferSide, query: string) => void` |  |
| `toggle` | `(value: string, options?: { extend?: boolean }) => void` | 切换某一项的勾选。extend 为真时选中锚点到该项的范围（同侧才成立）。 |
| `toggleAll` | `(side: TransferSide) => void` |  |
| `move` | `(to: TransferSide) => void` | 程序化移动；焦点安排不在这里处理，那需要知道触发的节点。 |
| `getRootProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `(props: { value: string }) => T['input']` | 单个目标值的原生出口；适配器按 value 数组逐项渲染，空集合不提交字段。 |
| `getPanelProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelHeaderProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelTitleProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelCountProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getSearchProps` | `(props: TransferPanelProps) => T['input']` |  |
| `getListProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getSelectAllTriggerProps` | `(props: TransferPanelProps) => T['button']` |  |
| `getEmptyProps` | `(props: TransferPanelProps) => T['element']` | 空态占位：放在面板中、list 的兄弟；本侧没有任何可见条目时显示，其余时候带 hidden。 |
| `getLoadingProps` | `(props: TransferPanelProps) => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 |
| `getGroupProps` | `(props: TransferGroupProps) => T['element']` | 分组容器：role=group，条目挂在其中；分组标题经 aria-labelledby 关联。 |
| `getGroupLabelProps` | `(props: TransferGroupProps) => T['element']` | 分组标题：不是选项、不进入导航，只作为本组的可及名。 |
| `getItemProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemCheckboxProps` | `(props: TransferItemProps) => T['element']` |  |
| `getToTargetTriggerProps` | `() => T['button']` |  |
| `getToSourceTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | held on 条目 / 全选格 / 搬运按钮, 未禁用、未只读、未加载且部件自身可用 | 按住期间条目、全选格或搬运按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，搬完后按钮失去可搬的条目时由机器撤下。勾选与搬运语义照旧由这一次按键承担 |
| `Tab` / `Shift+Tab` | focus outside a list | 每一侧列表只占一个 Tab 位：焦点进入该侧锚点条目，无锚点时先落列表容器再由它转投；两个搬运按钮与两个全选格各自另占一位，禁用时自动退出 Tab 序列 |
| `ArrowDown` | focus in a list | 焦点移到本侧下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；不会走到对面那一侧去 |
| `ArrowUp` | focus in a list | 焦点移到本侧上一个可停留条目 |
| `Home` | focus in a list | 焦点移到本侧首个可停留条目 |
| `End` | focus in a list | 焦点移到本侧末个可停留条目 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 本侧可勾选 | 切换焦点条目的勾选态，其余勾选不动；条目禁用、或已被搜索藏起来则不认 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in a list, 本侧可勾选 | 焦点移到相邻条目并切换它的勾选态；反向移动即取消刚扩展进来的条目 |
| `Ctrl+A` / `Cmd+A` | focus in a list, 本侧可勾选 | 勾中本侧全部可操作条目（可见且未禁用）；已经全勾则一并取消 |
| `ArrowRight` / `ArrowLeft` | focus in a list, 该方向指向对面且可以移动 | 把本侧勾选的条目移动到对面（dir=rtl 时左右语义对调）；移动完成后焦点落到目标侧的列表上。方向指向本侧、或当前无法移动时该键放行给页面 |
| `Enter` / `Space` | focus on to-target-trigger / to-source-trigger | 把对面勾中的条目搬过来（原生按钮的激活行为）；搬完按钮多半随即变禁用，焦点改落到目的地那一侧的列表上 |
| `Enter` / `Space` | focus on select-all-trigger | 全选/取消全选该侧可操作条目（原生按钮的激活行为）；三态经 aria-checked 上报，半选时是 mixed |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `search` | `aria-controls` | listId[panel.side] |
| `search` | `aria-labelledby` | titleId[panel.side] |
| `list` | `aria-busy` | 'true' \| undefined |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-invalid` | 'true' \| 'false' |
| `list` | `aria-labelledby` | titleId[panel.side] |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `aria-readonly` | 'true' \| 'false' |
| `list` | `role` | 'listbox' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-checkbox` | `aria-hidden` | 'true' |
| `to-target-trigger` | `aria-controls` | listId.target |
| `to-target-trigger` | `aria-label` | label.toTarget |
| `to-source-trigger` | `aria-controls` | listId.source |
| `to-source-trigger` | `aria-label` | label.toSource |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-controls` | listId[panel.side] |
| `select-all-trigger` | `role` | 'checkbox' |

## 样式参考

### 皮肤

`@xihan-ui/styles/transfer.css` 使用 `[data-scope="transfer"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-one-way` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `panel-header` | `data-disabled` | ''（条件成立时才出现） |
| `panel-header` | `data-side` | panel.side |
| `panel-title` | `data-side` | panel.side |
| `panel-count` | `data-checked-count` | String(checked[panel.side].length) |
| `panel-count` | `data-count` | String(visible[panel.side].length) |
| `panel-count` | `data-side` | panel.side |
| `search` | `data-side` | panel.side |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-invalid` | ''（条件成立时才出现） |
| `list` | `data-readonly` | ''（条件成立时才出现） |
| `list` | `data-side` | panel.side |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-side` | group.side |
| `group-label` | `data-disabled` | ''（条件成立时才出现） |
| `group-label` | `data-side` | group.side |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-side` | item.side |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-tone` | index.get(v)?.tone |
| `item` | `data-xh-collection-context` | 'page' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-highlighted` | ''（条件成立时才出现） |
| `item-text` | `data-side` | item.side |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | ''（条件成立时才出现） |
| `item-description` | `data-highlighted` | ''（条件成立时才出现） |
| `item-description` | `data-side` | item.side |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-checkbox` | `data-disabled` | ''（条件成立时才出现） |
| `item-checkbox` | `data-highlighted` | ''（条件成立时才出现） |
| `item-checkbox` | `data-side` | item.side |
| `item-checkbox` | `data-state` | 'checked' \| 'unchecked' |
| `item-checkbox` | `data-xh-collection-slot` | 'prefix' |
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `empty` | `data-side` | panel.side |
| `loading` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-side` | panel.side |
| `to-target-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `to-target-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `to-target-trigger` | `data-xh-action-control` | '' |
| `to-target-trigger` | `data-xh-action-display` | 'always' |
| `to-target-trigger` | `data-xh-action-profile` | 'icon' |
| `to-target-trigger` | `data-xh-action-size` | 'sm' |
| `to-target-trigger` | `data-xh-action-variant` | 'outline' |
| `to-source-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `to-source-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `to-source-trigger` | `data-xh-action-control` | '' |
| `to-source-trigger` | `data-xh-action-display` | 'always' |
| `to-source-trigger` | `data-xh-action-profile` | 'icon' |
| `to-source-trigger` | `data-xh-action-size` | 'sm' |
| `to-source-trigger` | `data-xh-action-variant` | 'outline' |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-side` | panel.side |
| `select-all-trigger` | `data-state` | checkStates[panel.side] |
| `select-all-trigger` | `data-xh-action-control` | '' |
| `select-all-trigger` | `data-xh-action-display` | 'always' |
| `select-all-trigger` | `data-xh-action-profile` | 'text' |
| `select-all-trigger` | `data-xh-action-size` | 'xs' |
| `select-all-trigger` | `data-xh-action-variant` | 'ghost' |
| `panel` | `data-disabled` | ''（条件成立时才出现） |
| `panel` | `data-side` | panel.side |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-transfer-checkbox-bg` | `item-checkbox`<br>`select-all-trigger` | `background` | `default` | `transparent` | transfer 的 item-checkbox、select-all-trigger 部件 background 覆盖槽。 |
| `--xh-transfer-checkbox-bg-checked` | `item-checkbox`<br>`select-all-trigger` | `background` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-accent` | transfer 的 item-checkbox、select-all-trigger 部件 background 覆盖槽。 |
| `--xh-transfer-checkbox-bg-disabled` | `item-checkbox` | `background` | `disabled` | `--xh-bg-muted` | transfer 的 item-checkbox 部件 background 覆盖槽。 |
| `--xh-transfer-checkbox-border` | `item-checkbox`<br>`select-all-trigger` | `border` | `default` | `--xh-border-control` | transfer 的 item-checkbox、select-all-trigger 部件 border 覆盖槽。 |
| `--xh-transfer-checkbox-border-checked` | `item-checkbox`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-accent` | transfer 的 item-checkbox、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-transfer-checkbox-border-disabled` | `item-checkbox` | `border-color` | `disabled` | `--xh-border-default` | transfer 的 item-checkbox 部件 border-color 覆盖槽。 |
| `--xh-transfer-checkbox-fg` | `item-checkbox`<br>`select-all-trigger` | `background-color`<br>`color` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-on-accent` | transfer 的 item-checkbox、select-all-trigger 部件 background-color、color 覆盖槽。 |
| `--xh-transfer-checkbox-font-size` | `item-checkbox`<br>`select-all-trigger` | `font-size` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-box` | transfer 的 item-checkbox、select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-transfer-checkbox-radius` | `item-checkbox`<br>`select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | transfer 的 item-checkbox、select-all-trigger 部件 border-radius 覆盖槽。 |
| `--xh-transfer-checkbox-size` | `item-checkbox`<br>`select-all-trigger` | `--xh-icon-size`<br>`block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-box` | transfer 的 item-checkbox、select-all-trigger 部件 --xh-icon-size、block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-transfer-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` | transfer 的 empty 部件 color 覆盖槽。 |
| `--xh-transfer-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_transfer-font-size` | transfer 的 empty 部件 font-size 覆盖槽。 |
| `--xh-transfer-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | transfer 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-transfer-fg` | `root` | `color` | `default` | `--xh-fg-default` | transfer 的 root 部件 color 覆盖槽。 |
| `--xh-transfer-gap` | `root` | `gap` | `default` | `--xh-space-3` | transfer 的 root 部件 gap 覆盖槽。 |
| `--xh-transfer-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | transfer 的 group 部件 gap 覆盖槽。 |
| `--xh-transfer-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-subtle` | transfer 的 group-label 部件 color 覆盖槽。 |
| `--xh-transfer-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | transfer 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-transfer-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | transfer 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-transfer-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | transfer 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-transfer-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` | transfer 的 group 部件 margin-block-start 覆盖槽。 |
| `--xh-transfer-icon-size` | `item`<br>`root`<br>`to-source-trigger`<br>`to-target-trigger` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-_action-profile-glyph-size`<br>`--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | transfer 的 item、root、to-source-trigger、to-target-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-transfer-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | transfer 的 item 部件 background-color 覆盖槽。 |
| `--xh-transfer-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | transfer 的 item 部件 background-color 覆盖槽。 |
| `--xh-transfer-item-bg-selected` | `item` | `background-color` | `disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` | transfer 的 item 部件 background-color 覆盖槽。 |
| `--xh-transfer-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-fg-default` | transfer 的 item 部件 color 覆盖槽。 |
| `--xh-transfer-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` | transfer 的 item 部件 color 覆盖槽。 |
| `--xh-transfer-item-font-size` | `item` | `font-size` | `default` | `--xh-_transfer-font-size` | transfer 的 item 部件 font-size 覆盖槽。 |
| `--xh-transfer-item-gap` | `item` | `gap` | `default` | `--xh-_transfer-gap` | transfer 的 item 部件 gap 覆盖槽。 |
| `--xh-transfer-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | transfer 的 item 部件 line-height 覆盖槽。 |
| `--xh-transfer-item-px` | `item` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-item-py` | `item` | `padding-block` | `default` | `--xh-_transfer-item-py` | transfer 的 item 部件 padding-block 覆盖槽。 |
| `--xh-transfer-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | transfer 的 item 部件 border-radius 覆盖槽。 |
| `--xh-transfer-list-gap` | `list` | `gap` | `default` | `--xh-list-option-gap` | transfer 的 list 部件 gap 覆盖槽。 |
| `--xh-transfer-list-h` | `list` | `block-size` | `default` | `--xh-viewport-h-md` | transfer 的 list 部件 block-size 覆盖槽。 |
| `--xh-transfer-list-px` | `list` | `padding-inline` | `default` | `--xh-space-1` | transfer 的 list 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-list-py` | `list` | `padding-block` | `default` | `--xh-space-1` | transfer 的 list 部件 padding-block 覆盖槽。 |
| `--xh-transfer-loading-fg` | `loading` | `color` | `default` | `--xh-fg-subtle` | transfer 的 loading 部件 color 覆盖槽。 |
| `--xh-transfer-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_transfer-font-size` | transfer 的 loading 部件 font-size 覆盖槽。 |
| `--xh-transfer-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | transfer 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-transfer-panel-bg` | `source-panel`<br>`target-panel` | `background` | `default` | `--xh-bg-surface` | transfer 的 source-panel、target-panel 部件 background 覆盖槽。 |
| `--xh-transfer-panel-bg-disabled` | `source-panel`<br>`target-panel` | `background` | `disabled` | `--xh-bg-muted` | transfer 的 source-panel、target-panel 部件 background 覆盖槽。 |
| `--xh-transfer-panel-border` | `panel-header`<br>`source-panel`<br>`target-panel` | `border`<br>`border-block-end` | `default` | `--xh-border-default` | transfer 的 panel-header、source-panel、target-panel 部件 border、border-block-end 覆盖槽。 |
| `--xh-transfer-panel-border-invalid` | `root`<br>`source-panel`<br>`target-panel` | `border-color` | `invalid`<br>`is([data-scope='transfer'][data-part='source-panel'], [data-scope='transfer'][data-part='target-panel'])` | `--xh-border-invalid` | transfer 的 root、source-panel、target-panel 部件 border-color 覆盖槽。 |
| `--xh-transfer-panel-count-fg` | `panel-count` | `color` | `default` | `--xh-fg-subtle` | transfer 的 panel-count 部件 color 覆盖槽。 |
| `--xh-transfer-panel-count-font-size` | `panel-count` | `font-size` | `default` | `--xh-text-caption-size` | transfer 的 panel-count 部件 font-size 覆盖槽。 |
| `--xh-transfer-panel-header-gap` | `panel-header` | `gap` | `default` | `--xh-_transfer-gap` | transfer 的 panel-header 部件 gap 覆盖槽。 |
| `--xh-transfer-panel-header-px` | `panel-header` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 panel-header 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-panel-header-py` | `panel-header` | `padding-block` | `default` | `--xh-space-2` | transfer 的 panel-header 部件 padding-block 覆盖槽。 |
| `--xh-transfer-panel-radius` | `source-panel`<br>`target-panel` | `border-radius` | `default` | `--xh-shape-surface` | transfer 的 source-panel、target-panel 部件 border-radius 覆盖槽。 |
| `--xh-transfer-panel-title-fg` | `panel-title` | `color` | `default` | `--xh-fg-default` | transfer 的 panel-title 部件 color 覆盖槽。 |
| `--xh-transfer-panel-title-font-size` | `panel-title` | `font-size` | `default` | `--xh-text-label-size` | transfer 的 panel-title 部件 font-size 覆盖槽。 |
| `--xh-transfer-panel-title-font-weight` | `panel-title` | `font-weight` | `default` | `--xh-font-weight-semibold` | transfer 的 panel-title 部件 font-weight 覆盖槽。 |
| `--xh-transfer-search-bg` | `search` | `background` | `default` | `transparent` | transfer 的 search 部件 background 覆盖槽。 |
| `--xh-transfer-search-border` | `search` | `border-block-end` | `default` | `--xh-border-control` | transfer 的 search 部件 border-block-end 覆盖槽。 |
| `--xh-transfer-search-fg` | `search` | `color` | `default` | `--xh-fg-default` | transfer 的 search 部件 color 覆盖槽。 |
| `--xh-transfer-search-font-size` | `search` | `font-size` | `default` | `--xh-_transfer-font-size` | transfer 的 search 部件 font-size 覆盖槽。 |
| `--xh-transfer-search-h` | `search` | `block-size` | `default` | `--xh-control-h-sm` | transfer 的 search 部件 block-size 覆盖槽。 |
| `--xh-transfer-search-px` | `search` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 search 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-select-all-bg-hover` | `select-all-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | transfer 的 select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-transfer-select-all-bg-pressed` | `select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | transfer 的 select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-transfer-select-all-fg` | `select-all-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-muted` | transfer 的 select-all-trigger 部件 color 覆盖槽。 |
| `--xh-transfer-select-all-font-size` | `select-all-trigger` | `font-size` | `default` | `--xh-text-caption-size` | transfer 的 select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-transfer-select-all-gap` | `select-all-trigger` | `gap` | `default` | `--xh-control-gap-sm` | transfer 的 select-all-trigger 部件 gap 覆盖槽。 |
| `--xh-transfer-select-all-radius` | `select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | transfer 的 select-all-trigger 部件 border-radius 覆盖槽。 |
| `--xh-transfer-trigger-bg` | `to-source-trigger`<br>`to-target-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | transfer 的 to-source-trigger、to-target-trigger 部件 background-color 覆盖槽。 |
| `--xh-transfer-trigger-bg-active` | `to-source-trigger`<br>`to-target-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | transfer 的 to-source-trigger、to-target-trigger 部件 background-color 覆盖槽。 |
| `--xh-transfer-trigger-bg-hover` | `to-source-trigger`<br>`to-target-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | transfer 的 to-source-trigger、to-target-trigger 部件 background-color 覆盖槽。 |
| `--xh-transfer-trigger-border` | `to-source-trigger`<br>`to-target-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-_action-variant-border-rest` | transfer 的 to-source-trigger、to-target-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-transfer-trigger-fg` | `to-source-trigger`<br>`to-target-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | transfer 的 to-source-trigger、to-target-trigger 部件 color 覆盖槽。 |
| `--xh-transfer-trigger-font-size` | `to-source-trigger`<br>`to-target-trigger` | `font-size` | `default` | `--xh-text-label-size` | transfer 的 to-source-trigger、to-target-trigger 部件 font-size 覆盖槽。 |
| `--xh-transfer-trigger-px` | `to-source-trigger`<br>`to-target-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | transfer 的 to-source-trigger、to-target-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-trigger-radius` | `to-source-trigger`<br>`to-target-trigger` | `border-radius` | `default` | `--xh-shape-control` | transfer 的 to-source-trigger、to-target-trigger 部件 border-radius 覆盖槽。 |
| `--xh-transfer-trigger-shadow-active` | `to-source-trigger`<br>`to-target-trigger` | `box-shadow` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` | transfer 的 to-source-trigger、to-target-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-transfer-trigger-shadow-hover` | `to-source-trigger`<br>`to-target-trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` | transfer 的 to-source-trigger、to-target-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-transfer-trigger-size` | `to-source-trigger`<br>`to-target-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | transfer 的 to-source-trigger、to-target-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤按视口分档：`min-width: 640px`。

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
