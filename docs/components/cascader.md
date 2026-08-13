# 级联选择 <Badge type="info" text="cascader" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

collection 是层级、显示文本与禁用的唯一事实源；levels 按深度摊开，每层一个 column

<XhDemo src="cascader/01-basic" />

### 中间层可选

change-on-select 让分支自己也能落值；选中分支后浮层不收起，还能接着往下挑

<XhDemo src="cascader/02-change-on-select" />

### 悬停展开

expand-trigger 改成 hover 后，指针划过分支即开子列，只挪展开路径不抢焦点；键盘仍走右方向键

<XhDemo src="cascader/03-hover-expand" />

### 多选

选中的是一组路径，落值后浮层不收起、焦点留在列里接着挑；再点一次即取消

<XhDemo src="cascader/04-multiple" />

### 形态

variant 只改触发框的底色与描边用法，浮层与列不跟着变

<XhDemo src="cascader/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴

<XhDemo src="cascader/06-tone" />

### 尺寸

不传 size 即默认档；触发框与列里的条目一起换档

<XhDemo src="cascader/07-size" />

### 校验状态

invalid 让 trigger 报 aria-invalid、描边换成错误色；浮层照常展开，判定归宿主，这里是没选就报错

<XhDemo src="cascader/08-invalid" />

### 后端字段映射

collection 只认 value / label / disabled / children 这几个名字，后端字段不一致就在进组件前转一道

<XhDemo src="cascader/09-custom-field" />

### 条目自定义内容

条目里放什么由作者定：文本两侧各加一段，是不是分支直接读 item 的 branch

<XhDemo src="cascader/10-rich-item" />

### 子节点按需加载

先给分支塞一个禁用的占位子节点让子列开得出来，展开到它时才去取真数据换掉占位

<XhDemo src="cascader/11-lazy-load" />

### 长列表只渲可视区

列自己就是滚动容器：按滚动位置切一段挂出来，其余交给撑高块，焦点那一条无论在不在窗口里都挂着

<XhDemo src="cascader/12-long-column" />

### 级联勾选与回显策略

multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；对外值按 checked-strategy 收敛（默认只收叶），半选标记从插槽作用域的 isIndeterminate 取

<XhDemo src="cascader/13-cascade-check" />

### 浮层底栏

content 的子节点全由作者写：列装进一层横排容器，底栏与它并列，就横跨了全部列

<XhDemo src="cascader/14-content-footer" />

### 命令式聚焦与展开

trigger 部件渲染的就是原生按钮，模板 ref 拿到它即可 focus / blur；开合走根插槽的 setOpen

<XhDemo src="cascader/15-imperative-focus" />

### 搜索

searchable 让 XhCascaderInput 可用：输入后整条路径连缀过滤，XhCascaderSearchList 的候选替换列视图；上下键走候选、Enter 选中、Escape 先清词再收浮层

<XhDemo src="cascader/16-search" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-cascader>` |
| Vue 组件 | `XhCascaderClearTrigger` `XhCascaderColumn` `XhCascaderContent` `XhCascaderIndicator` `XhCascaderInput` `XhCascaderItem` `XhCascaderItemIndicator` `XhCascaderItemText` `XhCascaderLabel` `XhCascaderPositioner` `XhCascaderRoot` `XhCascaderSearchList` `XhCascaderTrigger` `XhCascaderValueText` |
| 组合式函数 | `useCascader` |
| 状态机 | `cascaderMachine` |
| 皮肤 | `@xihan-ui/styles/cascader.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="cascader"`：`root` · `label` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `positioner` · **`content`** · `input` · `search-list` · `search-item` · **`column`** · **`item`** · `item-text` · `item-indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `CascaderNode[]` |  | 树数据，层级元信息与显示文本的唯一事实源。缺省为空树。 |
| `value` | `CascaderValue` |  | 选中路径。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单条路径是简写，内部一律归一成路径集合。 |
| `defaultValue` | `CascaderValue` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `expandTrigger` | `CascaderExpandTrigger` |  | 子列由什么展开，默认 click。 |
| `changeOnSelect` | `boolean` |  | 中间层（分支）也能落值。关掉时点分支只展开子列，不改选中值。 |
| `multiple` | `boolean` |  | 多选：选中是路径集合，选中后浮层不收起、焦点留在列里以便接着挑。 |
| `searchable` | `boolean` |  | 开启搜索：input 部件可用，输入后整条路径连缀过滤、候选替换列视图。 |
| `cascade` | `boolean` |  | 多选下父子级联勾选：点分支整枝传导、子全勾父勾、部分勾中半选， 禁用子树整棵冻结。默认 false（按路径原样翻转）；单选下无效。 |
| `checkedStrategy` | `CascadeStrategy` |  | 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾中节点。 |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 用原生 disabled，浮层展不开。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开与浏览，但选中值改不动、也清不掉。 |
| `invalid` | `boolean` |  | 校验失败：trigger 报 aria-invalid，各角色节点带 data-invalid。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定触发框的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发框与条目的几何档位。 |
| `placeholder` | `string` |  | 无选中时 value-text 显示的占位文字。 |
| `separator` | `string` |  | 路径回显的连接符，默认 ' / '。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 列内上下键走到首尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「进子列/回上一列」语义。 |
| `onValueChange` | `(details: CascaderValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: CascaderOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `ITEM.EXPAND` · `ITEM.LOST` · `ITEM.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `PATH.SET` · `INPUT.CHANGE` · `SEARCH.HIGHLIGHT`

**判据**：`isOpenControlled` · `isMultiple` · `staysOpenOnSelect`

## connect API

`useCascader` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly CascaderNode[]` | 作者给的原始树数据。 |
| `columns` | `readonly CascaderColumn[]` | 当下并排开着的列（含每列的条目）：列数 = 展开路径走得通的段数 + 1。 |
| `levels` | `readonly CascaderLevel[]` | 按深度摊开的静态列，与展开路径无关；不该露面的条目由连接层加 hidden 收起。 |
| `value` | `string[][]` | 选中路径集合；单选下长度 ≤ 1，形状不随模式变。 |
| `valuePath` | `string[] \| null` | 单选便利读法：选中的那一条路径，无选中时为 null。 |
| `valueText` | `string \| null` | 选中路径的显示文字（整条路径用分隔符连起来；多选各条之间用逗号）；无选中时为 null。 |
| `displayText` | `string` | value-text 实际显示的文字：有选中取路径文本，否则取 placeholder。 |
| `activePath` | `string[]` | 展开路径：并排开着哪几列由它决定。 |
| `focusedPath` | `string[] \| null` | 焦点锚点；收起、或它已不在任何可见列里时为 null。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `isSelected` | `(value: string) => boolean` | 该条目是否是某条选中路径的末项。 |
| `isIndeterminate` | `(value: string) => boolean` | 级联模式下该分支是否半选（有效叶后代有勾有不勾）；非级联恒 false。 |
| `isActive` | `(value: string) => boolean` | 该条目是否落在展开路径上（它的子列开着，或它自己就是最后一站）。 |
| `isVisible` | `(value: string) => boolean` | 该条目此刻是否落在某个可见列里。 |
| `searching` | `boolean` | 正处在搜索视图（开了 searchable 且输入非空）：列视图让位给候选列表。 |
| `inputValue` | `string` | 搜索框里的原始串。 |
| `searchResults` | `readonly CascaderSearchResult[]` | 过滤后的候选：整条路径连缀匹配，带 pathKey 与禁用标记。 |
| `searchHighlightIndex` | `number` | 候选里的虚拟高亮下标（已夹进候选长度）；没有候选为 -1。 |
| `setInputValue` | `(next: string) => void` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[][]) => void` |  |
| `setActivePath` | `(next: string[]) => void` |  |
| `select` | `(path: string[]) => void` | 选中一条路径，与点条目同一语义（分支是否落值仍看 changeOnSelect）。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` | 搜索框：放在 content 顶部；输入即过滤，上下键走候选、Enter 选中、Escape 先清词。 |
| `getSearchListProps` | `() => T['element']` | 候选列表容器；不在搜索视图时带 hidden。 |
| `getSearchItemProps` | `(props: CascaderSearchItemProps) => T['element']` | 一条候选：身份是整条路径；点按选中（与点列内条目同一语义）。 |
| `getColumnProps` | `(props: CascaderColumnProps) => T['element']` |  |
| `getItemProps` | `(props: CascaderItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: CascaderItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: CascaderItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | closed, focus in trigger | 展开浮层并把焦点落到选中路径的末项（无选中或它已禁用则落该列首个可用条目） |
| `ArrowDown` | closed, focus in trigger | 展开浮层并把焦点落到选中条目在它那一列里的下一个可用条目 |
| `ArrowUp` | closed, focus in trigger | 展开浮层并把焦点落到选中条目在它那一列里的上一个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到当前列的下一个条目（禁用条目跳过；loop 默认开，末项回绕到首项）；别的列不动 |
| `ArrowUp` | open, focus in content | 焦点移到当前列的上一个条目（禁用条目跳过；loop 默认开，首项回绕到末项） |
| `Home` | open, focus in content | 焦点移到当前列的首个可用条目 |
| `End` | open, focus in content | 焦点移到当前列的末个可用条目 |
| `ArrowRight` | open, 焦点条目有子节点（dir=rtl 时改由 ArrowLeft 承担） | 焦点移进右边那一列的首个可用条目；叶子上什么都不做且不吞键 |
| `ArrowLeft` | open, 焦点不在根列（dir=rtl 时改由 ArrowRight 承担） | 焦点退回上一列的父条目，当前这一列随之收起；根列上什么都不做且不吞键 |
| `Enter` / `Space` | open, 焦点条目未禁用 | 叶子：落值并收起浮层、焦点归还 trigger。分支：展开它的子列且浮层不收起，changeOnSelect 打开时同时落值 |
| `Escape` | open | 收起浮层并把焦点归还 trigger，选中值不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层，焦点不归还 trigger，按 Tab 序列自然离开 |
