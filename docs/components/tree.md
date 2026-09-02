# 树 <Badge type="info" text="tree" />

层级数据的展开与选择：分支可展开，节点可选。

## 何时使用

- 文件目录、组织架构、权限节点这类任意深度的层级数据。
- 需要在树上多选并处理父子级联。

## 何时不用

- 树只是为了选一个值：用[树选择](./tree-select)，它把树收进浮层。
- 层级规整、层数固定且只为选值：用[级联选择](./cascader)。
- 数据是平的：用[列表](./list)或[表格](./table)。

## 特性

- 展开集合与选中集合两套值各自可受控。
- `cascade` 与 `checkedStrategy` 决定勾父带不带子、以及回显给哪一层。
- 支持只让叶子进选中集合、关键词过滤、子节点异步加载、拖放换父。
- `expandOnClick` 决定点整行是否展开。
- `leafOrientation` 按结构判据横排：子节点全是叶子的那层跟着它走，其余恒竖排。
- 节点上标 `childrenOrientation: 'horizontal' | 'vertical'` 指定「我这一层子节点怎么排」，
  比 `leafOrientation` 优先；标 `vertical` 能把树级的 `horizontal` 按回竖排。根层不受影响，恒竖排。

## 示例

### 基础用法

collection 是层级元信息的唯一事实源，标记只管长相；缩进由子层容器自己顶着

<XhDemo src="tree/01-basic" />

### 多选

selectionMode 默认 single，改成 multiple 后点击与确认键都变成切换，选中集合形状不变仍是数组

<XhDemo src="tree/02-multiple" />

### 受控

传了 expandedValue / selection 就由宿主说了算，组件只发事件不落内部值，宿主写回它才动

<XhDemo src="tree/03-controlled" />

### 点行不展开与禁用节点

expandOnClick 关掉后只有箭头与左右方向键能改展开态；禁用节点仍可聚焦，只是确认键不认它

<XhDemo src="tree/04-expand-on-click" />

### 关键词过滤

collection 换一份树就换一棵：标记跟着数据重铺，过滤剩下的分支顺手全展开

<XhDemo src="tree/05-filter" />

### 异步加载子节点

展开那一刻才去要数据：先摆一行禁用的占位，取回来就地换掉，收起再展开不重复请求

<XhDemo src="tree/06-async" />

### 前缀与行尾

行里放什么由标记说了算：文字前塞图标、文字后塞操作，方向指示也可以挪到行尾去

<XhDemo src="tree/07-prefix-suffix" />

### 只让叶子进选中集合

选中受控就由宿主定夺：分支的值直接不写回，点目录只剩展开收起这一个效果

<XhDemo src="tree/08-leaf-only" />

### 级联勾选

selection-mode="multiple" 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；勾选框是行里的一段标记，勾选态与半选态都由组件报出

<XhDemo src="tree/09-checkable" />

### 拖拽搬家

整个节点都是拖动源：按住拖到别处松手，也可以 Tab 进树里用 Alt + 上下键在同层挪、Alt + 左右键改层级。三档落点（插在前 / 插在后 / 放进目录里）连同指示线、自我后代守卫与读屏播报都归库；树仍不拥有数据，宿主只管按库报的 value、parent、index 把数组搬一下，外加一条 allowDrop 说这次许不许

<XhDemo src="tree/10-drag-move" />

### 末端横排

leaf-orientation 按结构判据横排「子节点全是叶子」的那层；要指定哪一层横排就在节点上标 childrenOrientation，它比树级值优先，标 vertical 也压得住

<XhDemo src="tree/11-orientation" />

### 范围选

按住 Shift 点某一项，选中锚点到它那一段；按可见序取，折叠起来的子节点选不进去

<XhDemo src="tree/12-range-selection" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tree>` |
| Vue 组件 | `XhTreeBranch` `XhTreeBranchCheckbox` `XhTreeBranchContent` `XhTreeBranchControl` `XhTreeBranchIndicator` `XhTreeBranchText` `XhTreeBranchTrigger` `XhTreeItem` `XhTreeItemCheckbox` `XhTreeItemIndicator` `XhTreeItemText` `XhTreeLabel` `XhTreeLiveRegion` `XhTreeNodeDragTrigger` `XhTreeRoot` `XhTreeTree` |
| 组合式函数 | `useTree` |
| 状态机 | `treeMachine` |
| 皮肤 | `@xihan-ui/styles/tree.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tree"`：`root` · `label` · **`tree`** · **`item`** · `item-checkbox` · `item-indicator` · `item-text` · `branch` · `branch-checkbox` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `node-drag-trigger` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TreeNode[]` |  | 树数据，层级元信息的唯一事实源。缺省为空树。 |
| `leafOrientation` | `Orientation` |  | 末端那一层怎么排，默认 vertical（每行一个）。horizontal 让它们并排铺开。 只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层： 一个菜单下十几个按钮，横排一行铺完，省掉纵向翻找。中间层与整棵树恒是竖排， 它们承载的是层级本身，横过来层级就读没了。 这是结构判据，逐层自动认。要精确指定哪一层横排，在节点上标 `childrenOrientation`，它比本项优先。 只管排布，不动键盘：方向键在树上是层级操作（左右收展、上下走可见行）， 这是 treeview 的规范语义，不随排布方向改写。 |
| `expandedValue` | `string[]` |  | 展开集合。给定即受控：cell 直读 prop，写只发 onExpandedChange 不落内部值。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `selection` | `string[]` |  | 选中集合。给定即受控，语义同上。 |
| `defaultSelection` | `string[]` |  |  |
| `multiple` | `boolean` |  | 复选：点击与确认键都是「切换」，tree 带 aria-multiselectable=true。默认 false（单选）。 |
| `selectionMode` | `TreeSelectionMode` |  | 选择模式的旧写法，默认 single。 @deprecated 用 `multiple`。两者同时给时以 selectionMode 为准（与 listbox 同一条规矩）， 旧代码的行为因此一点不变。 |
| `cascade` | `boolean` |  | multiple 下父子级联勾选：点分支整枝传导、子全勾父勾、部分勾中半选， 禁用子树整棵冻结。默认 false（朴素切换）；single 下无效。 |
| `checkedStrategy` | `CascadeStrategy` |  | 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾中节点。 |
| `expandOnClick` | `boolean` |  | 点分支行是否顺带展开/收起，默认 true。关掉后只有 branch-trigger 与左右方向键能改展开态。 |
| `disabled` | `boolean` |  | 整棵树禁用：所有节点转 aria-disabled，键盘与点击都不再改展开/选中。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `typeahead` | `boolean` |  | 连打检索，默认开。关掉后可打印字符一律放行给页面。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `translations` | `Partial<TreeTranslations>` |  |  |
| `nodeDraggable` | `boolean` |  | 节点可以拖着搬家。整个节点都是拖动源，不另出把手。 |
| `allowDrop` | `(move: TreeMove) => boolean` |  | 这一次搬家许不许。收到的是折算好的落点（搬到哪个父下面的第几位）。 不给即都许——「落进自己的后代」与「落在禁用节点上」两条库自己会拦。 |
| `onNodeMove` | `(move: TreeMove) => void` |  |  |
| `onExpandedChange` | `(details: TreeExpandedChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TreeSelectionChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `expanded-change` | `TreeExpandedChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |
| `selection-change` | `TreeSelectionChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `node-move` | `TreeNodeMoveDetails` | 节点搬了家；detail 为 `{ value, parent, index }`，parent 为 null 即根层，index 是在那一层的落位（已算过先摘后插） |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTreeRoot` | `default` | `TreeRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `SELECTION.SET` · `NODE.SELECT` · `NODE.FOCUS` · `TREE.BLUR` · `NODE_DRAG.START` · `NODE_DRAG.MOVE` · `NODE_DRAG.END` · `NODE_DRAG.CANCEL` · `NODE.MOVE_BY`

## connect API

`useTree` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly TreeNode[]` | 作者给的原始树数据。 |
| `visibleNodes` | `readonly TreeVisibleNode[]` | 当前可见行序列（收起分支的子树不在其中）。 方向键、Home/End 与连打检索都在它上面走，不是在原始树上走。 |
| `dropTarget` | `DropTarget \| null` | 此刻的落点；松手就落在这儿。不合法或没落在任何节点上时是 null。 |
| `announcement` | `string` | 读屏播报文本。渲进 live-region，不进视觉版面。 |
| `expandedValue` | `string[]` |  |
| `selection` | `string[]` |  |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在树内、或它已被收起而不可见时为 null。 |
| `multiple` | `boolean` | 生效的是不是复选。 |
| `selectionMode` | `TreeSelectionMode` | @deprecated 读 `multiple`。 |
| `disabled` | `boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `isIndeterminate` | `(value: string) => boolean` | 级联模式下该分支是否半选（有效叶后代有勾有不勾）；非级联恒 false。 |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `setSelection` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `select` | `(value: string, options?: { extend?: boolean }) => void` | 选中某个节点。extend 为真时选中锚点到这一节点那一段（仅复选、且非级联）。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getTreeProps` | `() => T['element']` |  |
| `getNodeDragTriggerProps` | `(props: TreeNodeProps) => T['element']` | 节点拖动把手。触屏那一路唯一的入口，不占 Tab 位。 常挂即可：nodeDraggable 关着或这个节点禁用时它自报 data-disabled、也不再让出滚动， 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。 |
| `getLiveRegionProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getItemTextProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getItemCheckboxProps` | `(props: TreeNodeProps) => T['element']` | 勾选把手：把「勾这一项」与「点这一行」分成两个可点区域，不给它就没有独立把手。 |
| `getItemIndicatorProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchCheckboxProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchControlProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchIndicatorProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchTextProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchContentProps` | `(props: TreeNodeProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the tree | 整棵树只占一个 Tab 位：焦点进入锚点节点，无锚点时先落容器再由它转投 |
| `ArrowDown` | focus in tree | 焦点移到下一个可见行（禁用行跳过；loop 默认关，末行不回绕） |
| `ArrowUp` | focus in tree | 焦点移到上一个可见行（禁用行跳过；loop 默认关，首行不回绕） |
| `Home` | focus in tree | 焦点移到首个可见行 |
| `End` | focus in tree | 焦点移到末个可见行（展开着的子树也算行） |
| `ArrowRight` | focus on branch（dir=rtl 时改由 ArrowLeft 承担） | 收起的分支就地展开；已展开则把焦点移到首个子节点；叶子上什么都不做且不吞键 |
| `ArrowLeft` | focus in tree（dir=rtl 时改由 ArrowRight 承担） | 展开的分支就地收起；收起的分支与叶子则把焦点移到父节点；根层的行什么都不做 |
| `Enter` / `Space` | focus on node, 节点未禁用 | 选中焦点节点（单选替换、复选切换）；焦点在分支上且 expandOnClick 未关时顺带切换展开态 |
| `*` | focus in tree | 展开与焦点行同一父级的全部分支（已展开与禁用的不动）；同级没有可展开的分支时不吞这个键 |
| `单个可打印字符` | focus in tree, typeahead 未关 | 连打检索在可见行上按 label 首字母搬焦点，不改选中值，也不展开任何分支 |
| `Alt+ArrowUp` / `Alt+ArrowDown` | focus in tree, draggable 开着 | 把焦点节点在同一层的兄弟里往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；纵轴与文字方向无关，rtl 下两键不对调；已是同层首位 / 末位就不动，也不回绕；落点节点禁用或 allowDrop 不许就不搬。裸方向键仍是走可见行、确认键仍是选中 |
| `Alt+ArrowLeft` / `Alt+ArrowRight` | focus in tree, draggable 开着 | 改焦点节点的缩进层级：往里去是认上一个兄弟当父、落进它子层末位，往外去是变成父节点的下一个兄弟；rtl 下两键对调，「往里去」的那个方向恒是缩进。没有上一个兄弟就缩不进去，已在根层就退不出去，两种情形都不动；落点节点禁用或 allowDrop 不许就不搬 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `tree` | `aria-disabled` | 'true' \| 'false' |
| `tree` | `aria-labelledby` | `label` 部件的 id |
| `tree` | `aria-multiselectable` | 'true' \| 'false' |
| `tree` | `aria-orientation` | 'vertical' |
| `tree` | `role` | 'tree' |
| `item-checkbox` | `aria-hidden` | 'true' |
| `item-indicator` | `aria-hidden` | 'true' |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-label` | metaOf(node.value)?.label |
| `branch-checkbox` | `aria-hidden` | 'true' |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |
| `node-drag-trigger` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/tree.css` 按部件选择：`[data-scope="tree"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | 'vertical' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `tree` | `data-disabled` | ''（条件成立时才出现） |
| `tree` | `data-orientation` | 'vertical' |
| `item` | `data-draggable` | ''（条件成立时才出现） |
| `item` | `data-dragging` | ''（条件成立时才出现） |
| `item` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `branch-control` | `data-draggable` | ''（条件成立时才出现） |
| `branch-control` | `data-dragging` | ''（条件成立时才出现） |
| `branch-control` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `branch-content` | `data-orientation` | 'horizontal' \| 'vertical' |
| `node-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `node-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-tree-bg` · `--xh-tree-border` · `--xh-tree-branch-content-gap` · `--xh-tree-branch-gap` · `--xh-tree-branch-indicator-fg` · `--xh-tree-checkbox-bg` · `--xh-tree-checkbox-bg-checked` · `--xh-tree-checkbox-border` · `--xh-tree-checkbox-border-checked` · `--xh-tree-checkbox-border-disabled` · `--xh-tree-checkbox-fg` · `--xh-tree-checkbox-radius` · `--xh-tree-checkbox-size` · `--xh-tree-drag-fg` · `--xh-tree-drag-fg-active` · `--xh-tree-drag-fg-disabled` · `--xh-tree-drag-grip-long` · `--xh-tree-drag-grip-short` · `--xh-tree-drag-radius` · `--xh-tree-drag-size` · `--xh-tree-dragging-opacity` · `--xh-tree-drop-fg` · `--xh-tree-drop-inside-bg` · `--xh-tree-drop-line` · `--xh-tree-fg` · `--xh-tree-gap` · `--xh-tree-icon-size` · `--xh-tree-indent` · `--xh-tree-indicator-fg` · `--xh-tree-indicator-size` · `--xh-tree-item-indicator-fg` · `--xh-tree-label-fg` · `--xh-tree-label-font-size` · `--xh-tree-label-font-weight` · `--xh-tree-leaf-row-gap` · `--xh-tree-max-h` · `--xh-tree-px` · `--xh-tree-py` · `--xh-tree-radius` · `--xh-tree-row-bg-hover` · `--xh-tree-row-fg` · `--xh-tree-row-fg-selected` · `--xh-tree-row-font-size` · `--xh-tree-row-gap` · `--xh-tree-row-leading` · `--xh-tree-row-px` · `--xh-tree-row-py` · `--xh-tree-row-radius` · `--xh-tree-row-selected-font-weight` · `--xh-tree-tree-gap`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 前缀放[图标](./icon)，行尾放[菜单](./menu)；放进[分栏](./splitter)的一侧。

## 最佳实践

- 大树一定要虚拟化或按需加载，一次展开全部会卡住。
- 级联勾选的策略要与后端约定一致。
- 只想让某一层横排就标 `childrenOrientation`，别开树级 `leafOrientation`：
  后者认结构，别处凑巧「子节点全是叶子」的层也会跟着横过来，还会随数据增减变来变去。

## 反模式

- 展开状态不持久：用户每次进来都要重新展开一路。
- 拖放换父没有落点提示。
