# Cascader <Badge type="info" text="级联选择" />

按层逐列展开的选择器：一列选完展开下一列，值是一条路径。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/cascader" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/cascader.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/cascader" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/cascader" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/cascader.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

collection 是层级、显示文本与禁用的唯一事实源；levels 按深度摊开，每层一个 column

<XhDemo src="cascader/01-basic" />

## 示例

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

条目里放什么由作者定：文本后面加一段附加信息，分支箭头由皮肤自动画

<XhDemo src="cascader/10-rich-item" />

### 子节点按需加载

先给分支塞一个禁用的占位子节点让子列开得出来，展开到它时才去取真数据换掉占位

<XhDemo src="cascader/11-lazy-load" />

### 长列表只渲可视区

列自己就是滚动容器：按滚动位置切一段挂出来，其余交给撑高块，焦点那一条无论在不在窗口里都挂着

<XhDemo src="cascader/12-long-column" />

### 级联勾选与回显策略

multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；对外值按 checked-strategy 收敛（默认只收叶），半选标记由条目自报的半选态出面

<XhDemo src="cascader/13-cascade-check" />

### 浮层底栏

footer 写在 content 里、与列并列，横跨全部列；它不进任何一列的拥有关系，方向键也走不到

<XhDemo src="cascader/14-content-footer" />

### 命令式聚焦与展开

trigger 部件就是原生按钮，拿到它即可 focus / blur；开合交给宿主写 open

<XhDemo src="cascader/15-imperative-focus" />

### 搜索

searchable 让搜索框可用：输入后整条路径连缀过滤，候选列表替换列视图；上下键走候选、Enter 选中、Escape 先清词再收浮层。无匹配（试试输入「苏州」）时空态占位露面，文案经 translations 覆盖

<XhDemo src="cascader/16-search" />

## 设计指引

### 何时使用

- 选项是规整的多层分类且层数固定（省市区、商品类目）。
- 用户按层缩小范围比一次性搜索更自然。

### 何时不用

- 层级不规整、深浅不一：用[树选择](./tree-select)。
- 只有一层：用[选择器](./select)。
- 用户更习惯直接搜：给它开 `searchable`，或换[组合框](./combobox)。

### 特性

- `changeOnSelect` 决定中间层能不能直接作为结果。
- `expandTrigger` 可改成悬停展开。
- `name` 开启原生表单提交；每条已选路径生成一个同名隐藏字段，单选和多选均按 JSON 字符串数组编码，例如 `["华东","a,b"]`。通过 `FormData.getAll(name)` 取得各路径 JSON，再逐项解析；`separator` 只影响显示文字。
- `value` / `defaultValue` 保留单路径字符串数组简写与路径集合两种正式写法；`setValue` 接收路径集合。路径必须非空且每段都是字符串，非法结构直接报错；零选中用 `[]`，不使用 `[[]]`，不猜测逗号字符串或隐式转换数字。
- 异步候选尚未加载时仍保留已知选值，结构校验不以当前 `collection` 是否包含该路径为条件。
- 三端根组件自动装配原生字段，零路径没有字段。`form` 指定同一文档或影子树内的表单 ID；无效 ID 不回退祖先。整体 `disabled` 不提交，只读已选值仍提交。
- `form.reset()` 还原 `defaultValue`，保留当前浏览列、搜索和实际焦点，不主动关闭面板。受控值未声明默认值时保持业务数据；声明默认值时只通知重置意图，由业务回写。
- 多选时 `cascade` 与 `checkedStrategy` 一对：前者决定勾父带不带子，后者决定回显给出哪一层。
- 单选、多选、列项和搜索结果统一用末端对号表示选中；级联半选保留横线。选中正文不换色、不加粗，
  悬停、键盘高亮、焦点与展开路径只使用中性底，不叠加品牌选中面。
- 搜索结果与列项从同一份级联聚合读取 `checked` / `indeterminate`，所以 `all` / `parent` / `child`
  只改变提交值的收敛形式，不会让同一节点在两种视图中显示成不同状态。半选候选同步输出
  `aria-checked="mixed"`；整控件禁用时，候选不再保留虚假高亮。
- 子节点可按需加载；长列表只渲可视区。
- 后端字段名不一致时在进组件前转一道，组件只认 `label` / `value` / `children`。
- 空（`empty`）与在途（`loading`）两个相位都由 `content` 自动装配；首次取数且当前视图没有候选时显示
  `translations.loading`，作者显式写 `loading` 部件即可替换默认内容且不会重复。已有候选或祖先列时仍保留
  可操作内容，只在浮层上报 `aria-busy`；加载不会把可用列清空。
- 输入框保持实体；浮层使用 M2 磨砂材质与内侧顶光，列间和搜索框分隔线使用同一材质语义。
  浮层按实际落位方向短距离进出，列项只淡入；减弱动效时取消位移，增强对比度时改为实体表面。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-cascader>` |
| Vue 组件 | `XhCascaderClearTrigger` `XhCascaderColumn` `XhCascaderContent` `XhCascaderControl` `XhCascaderFooter` `XhCascaderGroup` `XhCascaderGroupLabel` `XhCascaderIndicator` `XhCascaderInput` `XhCascaderItem` `XhCascaderItemIndicator` `XhCascaderItemText` `XhCascaderLabel` `XhCascaderLoading` `XhCascaderPositioner` `XhCascaderRoot` `XhCascaderSearchList` `XhCascaderTrigger` `XhCascaderValueText` |
| 组合式函数 | `useCascader` |
| 状态机 | `cascaderMachine` |
| 皮肤 | `@xihan-ui/styles/cascader.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="cascader"`：`root` · `hidden-input` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `positioner` · **`content`** · `input` · `search-list` · `search-item` · `column` · `group` · `group-label` · `item` · `item-text` · `item-indicator` · `empty` · `loading` · `footer`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `CascaderNode[]` |  | 树数据，层级元信息与显示文本的唯一事实源。缺省为空树。 |
| `value` | `CascaderValue` |  | 选中路径。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单条路径是简写，内部一律归一成路径集合。 |
| `defaultValue` | `CascaderValue` |  |  |
| `name` | `string` |  | 原生字段名，每条选中路径提交一项 JSON 字符串数组。 |
| `form` | `string` |  | 关联的原生表单 ID；指定后覆盖祖先表单归属。 |
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
| `loading` | `boolean` |  | 候选还在取：浮层报 aria-busy；当前视图无候选时在途占位顶上来。 |
| `translations` | `Partial<CascaderTranslations>` |  | 空态占位的文案覆盖，默认英文。 |
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

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CascaderValueChangeDetails` | 选中路径集合变化；detail 为 `{ value: string[][] }` |
| `open-change` | `CascaderOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCascaderRoot` | `default` | `CascaderRootSlotProps` |  |
| `XhCascaderSearchList` | `item` | `CascaderSearchListItemSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `search-item` | 'checked' \| 'indeterminate' \| 'unchecked' |
| `column` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`FORM.RESET` · `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `ITEM.EXPAND` · `ITEM.LOST` · `ITEM.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `PATH.SET` · `INPUT.CHANGE` · `SEARCH.HIGHLIGHT`

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
| `searchHighlightIndex` | `number` | 候选里的虚拟高亮下标，恒落在一条可选候选上；没有候选或整批禁用为 -1。 |
| `translations` | `CascaderTranslations` | 空态占位的文案：实例覆盖并入默认后的完整一份。 |
| `setInputValue` | `(next: string) => void` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[][]) => void` |  |
| `setActivePath` | `(next: string[]) => void` |  |
| `select` | `(path: string[]) => void` | 选中一条路径，与点条目同一语义（分支是否落值仍看 changeOnSelect）。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `(props: { path: readonly string[] }) => T['input']` | 每条路径独立编码，适配器按 value 渲染重复同名字段。 |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` | 搜索框：放在 content 顶部；输入即过滤，上下键走候选、Enter 选中、Escape 先清词。 |
| `getSearchListProps` | `() => T['element']` | 候选列表容器；不在搜索视图时带 hidden。 |
| `getSearchItemProps` | `(props: CascaderSearchItemProps) => T['element']` | 一条候选：身份是整条路径；点按选中（与点列内条目同一语义）。 |
| `getEmptyProps` | `() => T['element']` | 空态占位：当前视图没有条目（搜索无候选，或根列没有条目）时露面，其余时候带 hidden。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：当前视图无候选且正在取数时顶上来；已有候选或祖先列时只保留 aria-busy。 适配器自动提供缺省部件，作者显式写部件即可替换它。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区：放在 content 里、与列并列，不入任何一列的拥有关系，方向键也走不到。 |
| `getGroupProps` | `(props: CascaderGroupProps) => T['element']` | 分组容器：role=group，条目挂在它里面；分组标题经 aria-labelledby 关联。 |
| `getGroupLabelProps` | `(props: CascaderGroupProps) => T['element']` | 分组标题：不是条目、不进导航，只作为本组的可及名字。 |
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
| `Delete` | focus in trigger, 有值且未禁用、未只读 | 清空全部选中值，浮层不展开、焦点留在 trigger |
| `Backspace` | focus in trigger, 有值且未禁用、未只读 | 单选清空；多选去掉最后一个选中路径 |
| `ArrowDown` | open, focus in content | 焦点移到当前列的下一个条目（禁用条目跳过；loop 默认开，末项回绕到首项）；别的列不动 |
| `ArrowUp` | open, focus in content | 焦点移到当前列的上一个条目（禁用条目跳过；loop 默认开，首项回绕到末项） |
| `Home` | open, focus in content | 焦点移到当前列的首个可用条目 |
| `End` | open, focus in content | 焦点移到当前列的末个可用条目 |
| `ArrowRight` | open, 焦点条目有子节点（dir=rtl 时改由 ArrowLeft 承担） | 子列没开时先把它铺出来（焦点不动），已开时焦点移进它的首个可用条目；叶子上什么都不做且不吞键 |
| `ArrowLeft` | open, 焦点不在根列（dir=rtl 时改由 ArrowRight 承担） | 焦点退回上一列的父条目，当前这一列随之收起；根列上什么都不做且不吞键 |
| `Enter` / `Space` | open, 焦点条目未禁用 | 叶子：落值并收起浮层、焦点归还 trigger。分支：展开它的子列且浮层不收起，changeOnSelect 打开时同时落值 |
| `Escape` | open | 收起浮层并把焦点归还 trigger，选中值不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层，焦点不归还 trigger，按 Tab 序列自然离开 |
| `可打印字符` | open, focus in input, searchable | 改写检索词；trim 后非空即把列视图整个换成候选列表（整条路径连缀匹配），高亮落到首个可选候选 |
| `ArrowDown` | open, focus in input, 检索词非空 | 高亮移到下一个候选（禁用整条的候选跳过；loop 默认开，末条回绕到首条），焦点留在检索框 |
| `ArrowUp` | open, focus in input, 检索词非空 | 高亮移到上一个候选（禁用整条的候选跳过；loop 默认开，首条回绕到末条），焦点留在检索框 |
| `Home` | open, focus in input, 检索词非空 | 高亮移到首个可选候选；检索词为空时不接管，光标照常跳到行首 |
| `End` | open, focus in input, 检索词非空 | 高亮移到末个可选候选；检索词为空时不接管，光标照常跳到行尾 |
| `Enter` | open, focus in input, 有高亮候选 | 把整条候选路径落成选中值：单选收起浮层、焦点归还 trigger，多选并入集合且浮层不收起；两种都清掉检索词回列视图。无可选候选时不吞这个键 |
| `Escape` | open, focus in input, 检索词非空 | 清掉检索词回到列视图，浮层不收起、焦点留在检索框；检索词已空才轮到收浮层那一档 |
| `ArrowDown` / `ArrowUp` | open, focus in input, 检索词为空 | 把焦点交给列视图：有锚点条目就落回它，没有则 ArrowDown 进当前列首个可用条目、ArrowUp 进末个 |
| `ArrowLeft` / `ArrowRight` | open, focus in input | 不接管，留给检索框自己移光标；进子列 / 回上一列那一套只在焦点落在条目上时发生 |
| `Tab` / `Shift+Tab` | open, focus in input | 收起浮层，焦点不归还 trigger，按 Tab 序列自然离开 |
| `输入法组合期间的任意键` | open, focus in input, isComposing | 一律不接管：组合期的 Enter 与上下键属于输入法候选框，既不选中候选也不移高亮 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'listbox' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `role` | 'combobox' |
| `indicator` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | translations.clearTrigger |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `input` | `aria-activedescendant` | `search-item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | `search-list` 部件的 id |
| `input` | `aria-label` | translations.searchInput |
| `search-list` | `aria-label` | translations.searchList |
| `search-list` | `aria-multiselectable` | 'true' \| 'false' |
| `search-list` | `role` | 'listbox' |
| `search-item` | `aria-checked` | 'true' \| 'mixed' \| 'false' \| undefined |
| `search-item` | `aria-disabled` | 'true' \| 'false' |
| `search-item` | `aria-selected` | 'true' \| 'false' |
| `search-item` | `role` | 'option' |
| `column` | `aria-disabled` | 'true' \| 'false' |
| `column` | `aria-label` | translations.column \| undefined |
| `column` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id \| `item` 部件的 id |
| `column` | `aria-multiselectable` | 'true' \| 'false' |
| `column` | `aria-orientation` | 'vertical' |
| `column` | `role` | 'listbox' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'mixed' \| 'false' \| undefined |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-haspopup` | 'listbox' \| undefined |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/cascader.css` 按部件选择：`[data-scope="cascader"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-invalid` | ''（条件成立时才出现） |
| `trigger` | `data-placeholder` | ''（条件成立时才出现） |
| `trigger` | `data-readonly` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-placeholder` | ''（条件成立时才出现） |
| `indicator` | `data-clearable` | ''（条件成立时才出现） |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-empty` | ''（条件成立时才出现） |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-searching` | ''（条件成立时才出现） |
| `content` | `data-state` | 'open' \| 'closed' |
| `search-list` | `data-empty` | ''（条件成立时才出现） |
| `search-item` | `data-disabled` | ''（条件成立时才出现） |
| `search-item` | `data-highlighted` | ''（条件成立时才出现） |
| `search-item` | `data-state` | 'checked' \| 'indeterminate' \| 'unchecked' |
| `column` | `data-level` | String(column.level) |
| `column` | `data-state` | 'open' \| 'closed' |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group-label` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-branch` | ''（条件成立时才出现） |
| `item` | `data-level` | String(meta.level) \| undefined |
| `footer` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-cascader-action-bg` | `clear-trigger` | `background` | `default` | `transparent` | cascader 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-cascader-action-bg-active` | `clear-trigger` | `background` | `active` | `--xh-bg-subtle-active` | cascader 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-cascader-action-bg-hover` | `clear-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | cascader 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-cascader-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | cascader 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-cascader-action-fg-hover` | `clear-trigger` | `color` | `hover` | `--xh-fg-default` | cascader 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-cascader-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | cascader 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-cascader-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | cascader 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-cascader-action-size` | `clear-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | cascader 的 clear-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-cascader-branch-arrow-fg` | `item` | `background-color` | `branch` | `--xh-fg-subtle` | cascader 的 item 部件 background-color 覆盖槽。 |
| `--xh-cascader-branch-arrow-size` | `item` | `block-size`<br>`inline-size` | `branch` | `--xh-icon-size` | cascader 的 item 部件 block-size、inline-size 覆盖槽。 |
| `--xh-cascader-column-divider` | `column` | `border-inline-start` | `default` | `--xh-material-frosted-separator` | cascader 的 column 部件 border-inline-start 覆盖槽。 |
| `--xh-cascader-column-gap` | `column` | `gap` | `default` | `--xh-list-option-gap` | cascader 的 column 部件 gap 覆盖槽。 |
| `--xh-cascader-column-h` | `column`<br>`search-list` | `block-size` | `default` | `--xh-viewport-h-sm` | cascader 的 column、search-list 部件 block-size 覆盖槽。 |
| `--xh-cascader-column-min-w` | `column`<br>`empty`<br>`loading` | `min-inline-size` | `default` | `7rem` | cascader 的 column、empty、loading 部件 min-inline-size 覆盖槽。 |
| `--xh-cascader-column-px` | `column` | `padding-inline` | `default` | `--xh-space-1` | cascader 的 column 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-column-py` | `column` | `padding-block` | `default` | `--xh-space-1` | cascader 的 column 部件 padding-block 覆盖槽。 |
| `--xh-cascader-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | cascader 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-cascader-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | cascader 的 content 部件 background 覆盖槽。 |
| `--xh-cascader-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | cascader 的 content 部件 border 覆盖槽。 |
| `--xh-cascader-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | cascader 的 content 部件 color 覆盖槽。 |
| `--xh-cascader-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | cascader 的 content 部件 background 覆盖槽。 |
| `--xh-cascader-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w-xl` | cascader 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-cascader-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | cascader 的 content 部件 border-radius 覆盖槽。 |
| `--xh-cascader-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | cascader 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-cascader-control-bg` | `control` | `background` | `default` | `--xh-_cascader-bg` | cascader 的 control 部件 background 覆盖槽。 |
| `--xh-cascader-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | cascader 的 control 部件 background 覆盖槽。 |
| `--xh-cascader-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_cascader-bg-hover` | cascader 的 control 部件 background 覆盖槽。 |
| `--xh-cascader-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | cascader 的 control 部件 background 覆盖槽。 |
| `--xh-cascader-control-border` | `control` | `border` | `default` | `--xh-_cascader-border` | cascader 的 control 部件 border 覆盖槽。 |
| `--xh-cascader-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | cascader 的 control 部件 border-color 覆盖槽。 |
| `--xh-cascader-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_cascader-border-hover` | cascader 的 control 部件 border-color 覆盖槽。 |
| `--xh-cascader-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | cascader 的 control 部件 border-color 覆盖槽。 |
| `--xh-cascader-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | cascader 的 control 部件 color 覆盖槽。 |
| `--xh-cascader-control-gap` | `control` | `gap` | `default` | `--xh-_cascader-gap` | cascader 的 control 部件 gap 覆盖槽。 |
| `--xh-cascader-control-h` | `control` | `block-size` | `default` | `--xh-_cascader-h` | cascader 的 control 部件 block-size 覆盖槽。 |
| `--xh-cascader-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | cascader 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-cascader-control-px` | `control` | `padding-inline` | `default` | `--xh-_cascader-px` | cascader 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | cascader 的 control 部件 border-radius 覆盖槽。 |
| `--xh-cascader-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_cascader-shadow` | cascader 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-cascader-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | cascader 的 empty 部件 color 覆盖槽。 |
| `--xh-cascader-empty-min-h` | `empty` | `min-block-size` | `default` | `5rem` | cascader 的 empty 部件 min-block-size 覆盖槽。 |
| `--xh-cascader-empty-p` | `empty` | `padding` | `default` | `--xh-space-3` | cascader 的 empty 部件 padding 覆盖槽。 |
| `--xh-cascader-footer-border` | `footer` | `border-block-start` | `default` | `--xh-border-subtle` | cascader 的 footer 部件 border-block-start 覆盖槽。 |
| `--xh-cascader-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` | cascader 的 footer 部件 color 覆盖槽。 |
| `--xh-cascader-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` | cascader 的 footer 部件 font-size 覆盖槽。 |
| `--xh-cascader-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | cascader 的 footer 部件 gap 覆盖槽。 |
| `--xh-cascader-footer-px` | `footer` | `padding-inline` | `default` | `--xh-space-2` | cascader 的 footer 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` | cascader 的 footer 部件 padding-block 覆盖槽。 |
| `--xh-cascader-gap` | `root` | `gap` | `default` | `--xh-space-1` | cascader 的 root 部件 gap 覆盖槽。 |
| `--xh-cascader-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | cascader 的 group 部件 gap 覆盖槽。 |
| `--xh-cascader-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | cascader 的 group-label 部件 color 覆盖槽。 |
| `--xh-cascader-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | cascader 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-cascader-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | cascader 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-cascader-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_cascader-row-px` | cascader 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | cascader 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-cascader-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` | cascader 的 group 部件 margin-block-start 覆盖槽。 |
| `--xh-cascader-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | cascader 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-cascader-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | cascader 的 indicator 部件 color 覆盖槽。 |
| `--xh-cascader-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-surface` | cascader 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-cascader-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | cascader 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-cascader-input-font-size` | `input` | `font-size` | `default` | `--xh-_cascader-font-size` | cascader 的 input 部件 font-size 覆盖槽。 |
| `--xh-cascader-input-px` | `input` | `padding-inline` | `default` | `--xh-control-px-md` | cascader 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-input-py` | `input` | `padding-block` | `default` | `--xh-space-2` | cascader 的 input 部件 padding-block 覆盖槽。 |
| `--xh-cascader-item-active-font-weight` | `item` | `font-weight` | `disabled`<br>`in-path`<br>`not([data-disabled])` | `--xh-font-weight-regular` | cascader 的 item 部件 font-weight 覆盖槽。 |
| `--xh-cascader-item-bg-active` | `item` | `background` | `disabled`<br>`in-path`<br>`not([data-disabled])` | `--xh-bg-subtle` | cascader 的 item 部件 background 覆盖槽。 |
| `--xh-cascader-item-bg-hover` | `item`<br>`search-item` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted], :focus-visible)`<br>`not([data-disabled])` | `--xh-bg-subtle` | cascader 的 item、search-item 部件 background 覆盖槽。 |
| `--xh-cascader-item-fg` | `item`<br>`search-item` | `color` | `default`<br>`state=checked` | `--xh-material-frosted-fg` | cascader 的 item、search-item 部件 color 覆盖槽。 |
| `--xh-cascader-item-fg-selected` | `item`<br>`search-item` | `color` | `state=checked` | `--xh-cascader-item-fg` | cascader 的 item、search-item 部件 color 覆盖槽。 |
| `--xh-cascader-item-font-size` | `empty`<br>`item`<br>`search-item` | `font-size` | `default` | `--xh-_cascader-font-size` | cascader 的 empty、item、search-item 部件 font-size 覆盖槽。 |
| `--xh-cascader-item-gap` | `item`<br>`search-item` | `gap`<br>`padding-inline-end` | `default` | `--xh-_cascader-gap` | cascader 的 item、search-item 部件 gap、padding-inline-end 覆盖槽。 |
| `--xh-cascader-item-indicator-fg` | `item-indicator`<br>`search-item` | `background-color`<br>`color` | `default` | `--xh-_cascader-accent` | cascader 的 item-indicator、search-item 部件 background-color、color 覆盖槽。 |
| `--xh-cascader-item-indicator-size` | `item-indicator`<br>`search-item` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-control-indicator-size` | cascader 的 item-indicator、search-item 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-cascader-item-leading` | `item`<br>`search-item` | `line-height` | `default` | `--xh-leading-normal` | cascader 的 item、search-item 部件 line-height 覆盖槽。 |
| `--xh-cascader-item-max-w` | `item` | `max-inline-size` | `default` | `--xh-overlay-max-w` | cascader 的 item 部件 max-inline-size 覆盖槽。 |
| `--xh-cascader-item-px` | `item`<br>`search-item` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-_cascader-row-px` | cascader 的 item、search-item 部件 inset-inline-end、padding-inline、padding-inline-end 覆盖槽。 |
| `--xh-cascader-item-py` | `item`<br>`search-item` | `padding-block` | `default` | `--xh-_cascader-row-py` | cascader 的 item、search-item 部件 padding-block 覆盖槽。 |
| `--xh-cascader-item-radius` | `item`<br>`search-item` | `border-radius` | `default` | `--xh-shape-control` | cascader 的 item、search-item 部件 border-radius 覆盖槽。 |
| `--xh-cascader-item-selected-font-weight` | `item`<br>`search-item` | `font-weight` | `state=checked` | `--xh-font-weight-regular` | cascader 的 item、search-item 部件 font-weight 覆盖槽。 |
| `--xh-cascader-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | cascader 的 label 部件 color 覆盖槽。 |
| `--xh-cascader-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | cascader 的 label 部件 color 覆盖槽。 |
| `--xh-cascader-label-font-size` | `label` | `font-size` | `default` | `--xh-_cascader-label-font-size` | cascader 的 label 部件 font-size 覆盖槽。 |
| `--xh-cascader-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | cascader 的 label 部件 font-weight 覆盖槽。 |
| `--xh-cascader-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | cascader 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-cascader-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | cascader 的 loading 部件 color 覆盖槽。 |
| `--xh-cascader-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_cascader-font-size` | cascader 的 loading 部件 font-size 覆盖槽。 |
| `--xh-cascader-loading-min-h` | `loading` | `min-block-size` | `default` | `5rem` | cascader 的 loading 部件 min-block-size 覆盖槽。 |
| `--xh-cascader-loading-min-w` | `loading` | `min-inline-size` | `default` | `--xh-cascader-column-min-w` | cascader 的 loading 部件 min-inline-size 覆盖槽。 |
| `--xh-cascader-loading-p` | `loading` | `padding` | `default` | `--xh-space-3` | cascader 的 loading 部件 padding 覆盖槽。 |
| `--xh-cascader-placeholder-fg` | `value-text` | `color` | `placeholder` | `--xh-fg-subtle` | cascader 的 value-text 部件 color 覆盖槽。 |
| `--xh-cascader-search-divider` | `input` | `border-block-end` | `default` | `--xh-material-frosted-separator` | cascader 的 input 部件 border-block-end 覆盖槽。 |
| `--xh-cascader-search-list-gap` | `search-list` | `gap` | `default` | `--xh-list-option-gap` | cascader 的 search-list 部件 gap 覆盖槽。 |
| `--xh-cascader-search-p` | `search-list` | `padding` | `default` | `--xh-space-1` | cascader 的 search-list 部件 padding 覆盖槽。 |
| `--xh-cascader-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | cascader 的 trigger 部件 color 覆盖槽。 |
| `--xh-cascader-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_cascader-font-size` | cascader 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-cascader-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_cascader-gap` | cascader 的 trigger 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-fade-in` · `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 外面套[表单字段](./field)；浮层底部可以加操作栏。

## 最佳实践

- 层数控制在三层，第四层开始用户就迷路了。
- 回显要给完整路径，不只给末级名字——"朝阳区"在好几个省都有。
- 自定义列项应同时组合 `item-text` 与 `item-indicator`；标记部件留空即可由皮肤按选中或半选状态画
  对号或横线。自动生成的搜索结果会复用同一组标记尺寸和颜色槽。
- 定制 `--xh-cascader-item-fg-selected`、`--xh-cascader-item-selected-font-weight`、
  `--xh-cascader-item-bg-active` 时要同时核对列视图与搜索视图；默认值刻意保持正文和路径中性。

## 反模式

- 每层都要一次网络往返却不给加载反馈。
- 多选时不说明 `checkedStrategy`：后端收到的是父节点还是所有叶子，两边理解不一致就会出事。
