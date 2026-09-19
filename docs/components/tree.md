# Tree 树 <Badge type="info" text="alpha" />

层级数据的展开与选择：分支可展开，节点可选。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tree" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tree.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tree" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tree" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tree.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

collection 是层级元信息的唯一事实源，标记只负责外观；缩进由子层容器自行撑开

<XhDemo src="tree/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="tree"`：`root` · `label` · **`tree`** · **`item`** · `item-checkbox` · `item-indicator` · `item-text` · `branch` · `branch-checkbox` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `node-drag-trigger` · `empty` · `loading` · `live-region`

## 示例

### 多选

multiple 关闭时是单选，开启后点击与确认键都变为切换，选中集合形状不变仍是数组

<XhDemo src="tree/02-multiple" />

### 受控

传入 expandedValue / selection 后由宿主决定，组件只发事件不落内部值，宿主写回后才变化

<XhDemo src="tree/03-controlled" />

### 点击行不展开与禁用节点

expandOnClick 关闭后只有箭头与左右方向键能改变展开态；禁用节点仍可聚焦，只是确认键不响应它

<XhDemo src="tree/04-expand-on-click" />

### 关键词过滤

collection 换一份树即换一棵：标记跟随数据重新铺设，过滤后剩余的分支一并全部展开

<XhDemo src="tree/05-filter" />

### 异步加载子节点

展开时才请求数据：先放置一行禁用的占位，取回后就地替换，收起再展开不重复请求

<XhDemo src="tree/06-async" />

### 前缀与行尾

行中放置什么由标记决定：文字前放图标、文字后放操作，方向指示也可以移到行尾

<XhDemo src="tree/07-prefix-suffix" />

### 只让叶子进入选中集合

选中受控后由宿主决定：分支的值直接不写回，点击目录只剩展开收起这一个效果

<XhDemo src="tree/08-leaf-only" />

### 级联勾选

multiple 加 cascade 内建父子传导：点击分支整枝勾选、子全勾则父勾、部分勾选为半选；勾选框是行中的一段标记，勾选态与半选态都由组件报告

<XhDemo src="tree/09-checkable" />

### 拖拽移动

整个节点都是拖动源：按住拖到目标位置松手，也可以 Tab 进树后用 Alt + 上下键在同层移动、Alt + 左右键改变层级。三档落点（插在前 / 插在后 / 放进目录）连同指示线、自我后代守卫与读屏播报都归库；树仍不拥有数据，宿主只需按库报告的 value、parent、index 调整数组，外加一条 allowDrop 决定本次是否允许

<XhDemo src="tree/10-drag-move" />

### 末端横排

leaf-orientation 按结构判据横排子节点全为叶子的层；要指定哪一层横排就在节点上标注 childrenOrientation，它比树级值优先，标注 vertical 也可覆盖

<XhDemo src="tree/11-orientation" />

### 范围选择

按住 Shift 点击某一项，选中锚点到它的一段；按可见序取值，折叠的子节点不会被选入

<XhDemo src="tree/12-range-selection" />

### 变体

variant="ghost" 去掉外框与底色，树直接落在页面上；默认 outline 保持带框的外观

<XhDemo src="tree/13-variant" />

## 设计指引

### 何时使用

- 文件目录、组织架构、权限节点等任意深度的层级数据。
- 需要在树上多选并处理父子级联。

### 何时不用

- 树只用于选一个值时，使用[树选择](./tree-select)，它把树收进浮层。
- 层级规整、层数固定且只为选值时，使用[级联选择](./cascader)。
- 数据是扁平的时，使用[列表](./list)或[表格](./table)。

### 特性

- 展开集合与选中集合两套值各自可受控。
- `variant` 决定外框形态，默认 `outline`；`subtle` 换成淡底无描边，`ghost` 让树直接落在页面上。
- 页内树的选中行铺品牌淡底行面并带前导标记（勾选档是前导方框，其余档是前导对号）；下拉中的树（[树形选择器](./tree-select)）只在行尾画对号，两者刻意不同。
- `cascade` 与 `checkedStrategy` 决定勾选父节点是否带子节点，以及回显给哪一层。
- 支持只让叶子进选中集合、关键词过滤、子节点异步加载、拖放换父。
- `expandOnClick` 决定点整行是否展开。
- 空（`empty`）与在途（`loading`）两个相位各有部件，都放在 `root` 内作为 `tree` 的兄弟；`loading` 为真时树报告 `aria-busy`，空态让位。
- `leafOrientation` 按结构判据横排：子节点全是叶子的层跟随它，其余始终竖排。
- 节点上标 `childrenOrientation: 'horizontal' | 'vertical'` 指定该层子节点的排列方向，优先于 `leafOrientation`；标 `vertical` 可以把树级的 `horizontal` 改回竖排。根层不受影响，始终竖排。

### 组合

- 前缀放[图标](./icon)，行尾放[菜单](./menu)；放入[分栏](./splitter)的一侧。

### 最佳实践

- 大树必须虚拟化或按需加载，一次展开全部会卡顿。
- 级联勾选的策略与后端约定一致。
- 只需要某一层横排时标 `childrenOrientation`，不开启树级 `leafOrientation`：后者按结构判断，其他恰好“子节点全是叶子”的层也会横排，并随数据增减变化。

### 反模式

- 展开状态不持久，用户每次进入都要重新展开。
- 拖放换父没有落点提示。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tree>` |
| Vue 组件 | `XhTreeBranch` `XhTreeBranchCheckbox` `XhTreeBranchContent` `XhTreeBranchControl` `XhTreeBranchIndicator` `XhTreeBranchText` `XhTreeBranchTrigger` `XhTreeEmpty` `XhTreeItem` `XhTreeItemCheckbox` `XhTreeItemIndicator` `XhTreeItemText` `XhTreeLabel` `XhTreeLiveRegion` `XhTreeLoading` `XhTreeNodeDragTrigger` `XhTreeRoot` `XhTreeTree` |
| 组合式函数 | `useTree` |
| 状态机 | `treeMachine` |
| 皮肤 | `@xihan-ui/styles/tree.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TreeNode[]` |  | 树数据，层级元信息的唯一事实源。默认为空树。 |
| `variant` | `ControlVariant` |  | 外框形态：outline 带描边与底色（默认），subtle 淡底无描边，ghost 去掉描边与底色只保留行。 |
| `leafOrientation` | `Orientation` |  | 末端层的排布方式，默认 vertical（每行一个）。horizontal 使它们并排铺开。 只作用于子节点全是叶子的层：菜单授权中即按钮层： 一个菜单下十几个按钮，横向排成一行，省去纵向翻找。中间层与整棵树恒为纵向， 它们承载的是层级本身，横向排布会失去层级信息。 这是结构判据，逐层自动识别。需要精确指定哪一层横向排布时，在节点上标注 `childrenOrientation`，它优先于本项。 只影响排布，不改变键盘：方向键在树上是层级操作（左右收展、上下移动可见行）， 这是 treeview 的规范语义，不随排布方向改写。 |
| `expandedValue` | `string[]` |  | 展开集合。提供即受控：cell 直读 prop，写入只发 onExpandedValueChange 不落内部值。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `selection` | `string[]` |  | 选中集合。提供即受控，语义同上。 |
| `defaultSelection` | `string[]` |  |  |
| `multiple` | `boolean` |  | 复选：点击与确认键都是切换，tree 带 aria-multiselectable=true。默认 false（单选）。 |
| `cascade` | `boolean` |  | multiple 下父子级联勾选：点击分支整枝传导、子全勾父勾、部分勾选半选， 禁用子树整棵冻结。默认 false（朴素切换）；single 下无效。 |
| `checkedStrategy` | `CascadeStrategy` |  | 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾选节点。 |
| `expandOnClick` | `boolean` |  | 点击分支行是否同时展开 / 收起，默认 true。关闭后只有 branch-trigger 与左右方向键能改变展开态。 |
| `disabled` | `boolean` |  | 整棵树禁用：所有节点为 aria-disabled，键盘与点击都不再改变展开 / 选中。 |
| `loading` | `boolean` |  | 节点加载中：树报告 aria-busy，显示在途占位、隐藏空态占位。 |
| `loop` | `boolean` |  | 上下键到达首尾是否回绕，默认 false。 |
| `typeahead` | `boolean` |  | 连打检索，默认开启。关闭后可打印字符一律放行给页面。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的展开 / 收起语义。 |
| `translations` | `Partial<TreeTranslations>` |  |  |
| `nodeDraggable` | `boolean` |  | 节点可以拖动移动。整个节点都是拖动源，不另设把手。 |
| `allowDrop` | `(move: TreeMove) => boolean` |  | 本次移动是否允许。收到的是折算后的落点（移到哪个父节点下的第几位）。 未提供时全部允许：落进自身后代与落在禁用节点上两条由库自行拦截。 |
| `onNodeMove` | `(move: TreeMove) => void` |  |  |
| `onExpandedValueChange` | `(details: TreeExpandedValueChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TreeSelectionChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `expanded-value-change` | `TreeExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |
| `selection-change` | `TreeSelectionChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `node-move` | `TreeNodeMoveDetails` | 节点已移动；detail 为 `{ value, parent, index }`，parent 为 null 即根层，index 是在该层的落位（已经过先移除后插入的修正） |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTreeRoot` | `default` | `TreeRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `SELECTION.SET` · `NODE.SELECT` · `NODE.FOCUS` · `TREE.BLUR` · `NODE_DRAG.START` · `NODE_DRAG.MOVE` · `NODE_DRAG.END` · `NODE_DRAG.CANCEL` · `NODE.MOVE_BY` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly TreeNode[]` | 作者提供的原始树数据。 |
| `visibleNodes` | `readonly TreeVisibleNode[]` | 当前可见行序列（收起分支的子树不在其中）。 方向键、Home/End 与连打检索都在它上面移动，不在原始树上移动。 |
| `dropTarget` | `DropTarget \| null` | 当前的落点；松手即落在此处。不合法或未落在任何节点上时为 null。 |
| `announcement` | `string` | 读屏播报文本。渲染进 live-region，不进入视觉版面。 |
| `expandedValue` | `string[]` |  |
| `selection` | `string[]` |  |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在树内、或它已被收起而不可见时为 null。 |
| `multiple` | `boolean` | 生效的是否为复选。 |
| `disabled` | `boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `isIndeterminate` | `(value: string) => boolean` | 级联模式下该分支是否半选（有效叶后代部分勾选）；非级联恒为 false。 |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `setSelection` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `select` | `(value: string, options?: { extend?: boolean }) => void` | 选中某个节点。extend 为真时选中锚点到该节点的范围（仅复选、且非级联）。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getTreeProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 root 中、tree 的兄弟（role=tree 只允许拥有 treeitem 与 group）。 提供 collection 时由连接层按条数收放；节点手写时不写 hidden，是否显示由作者决定。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 提供 collection 时由连接层按条数收放；节点手写时只按 loading 收放。 |
| `getNodeDragTriggerProps` | `(props: TreeNodeProps) => T['element']` | 节点拖动把手。触屏路径唯一的入口，不占 Tab 位。 常驻即可：nodeDraggable 关闭或该节点禁用时它声明 data-disabled、也不再让出滚动， 渲染不会出错。按是否可拖动决定是否渲染，会使 DOM 结构随状态变化。 |
| `getLiveRegionProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getItemTextProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getItemCheckboxProps` | `(props: TreeNodeProps) => T['element']` | 勾选把手：把勾选该项与点击该行分为两个可点击区域，未提供时没有独立把手。 |
| `getItemIndicatorProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchCheckboxProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchControlProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchIndicatorProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchTextProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchContentProps` | `(props: TreeNodeProps) => T['element']` |  |

## 无障碍

### 键盘

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
| `Enter` / `Space` | held on node, 树未禁用、未加载且节点未禁用 | 按住期间叶子行或分支行（branch-control）投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下。选中与展开语义照旧由这一次按键承担 |
| `*` | focus in tree | 展开与焦点行同一父级的全部分支（已展开与禁用的不动）；同级没有可展开的分支时不吞这个键 |
| `单个可打印字符` | focus in tree, typeahead 未关 | 连打检索在可见行上按 label 首字母搬焦点，不改选中值，也不展开任何分支 |
| `Alt+ArrowUp` / `Alt+ArrowDown` | focus in tree, draggable 开启 | 把焦点节点在同一层的兄弟里往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；纵轴与文字方向无关，rtl 下两键不对调；已是同层首位 / 末位就不动，也不回绕；落点节点禁用或 allowDrop 不许就不搬。裸方向键仍是走可见行、确认键仍是选中 |
| `Alt+ArrowLeft` / `Alt+ArrowRight` | focus in tree, draggable 开启 | 改焦点节点的缩进层级：往里去是认上一个兄弟当父、落进它子层末位，往外去是变成父节点的下一个兄弟；rtl 下两键对调，「往里去」的那个方向恒是缩进。没有上一个兄弟就缩不进去，已在根层就退不出去，两种情形都不动；落点节点禁用或 allowDrop 不许就不搬 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `tree` | `aria-busy` | 'true' \| undefined |
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

## 样式参考

### 皮肤

`@xihan-ui/styles/tree.css` 使用 `[data-scope="tree"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-orientation` | 'vertical' |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `tree` | `data-disabled` | ''（条件成立时才出现） |
| `tree` | `data-orientation` | 'vertical' |
| `item` | `data-draggable` | ''（条件成立时才出现） |
| `item` | `data-dragging` | ''（条件成立时才出现） |
| `item` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-xh-collection-context` | 'page' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | 'md' |
| `item-checkbox` | `data-xh-collection-slot` | 'prefix' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `branch-checkbox` | `data-xh-collection-slot` | 'prefix' |
| `branch-control` | `data-draggable` | ''（条件成立时才出现） |
| `branch-control` | `data-dragging` | ''（条件成立时才出现） |
| `branch-control` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `branch-control` | `data-pressed` | ''（条件成立时才出现） |
| `branch-control` | `data-xh-collection-context` | 'page' |
| `branch-control` | `data-xh-collection-item` | '' |
| `branch-control` | `data-xh-collection-size` | 'md' |
| `branch-trigger` | `data-xh-collection-slot` | 'prefix' |
| `branch-indicator` | `data-xh-collection-slot` | 'prefix' |
| `branch-text` | `data-xh-collection-slot` | 'text' |
| `branch-content` | `data-orientation` | 'horizontal' \| 'vertical' |
| `node-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `node-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `node-drag-trigger` | `data-xh-collection-slot` | 'prefix' |
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tree-bg` | `root`<br>`tree` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | tree 的 root、tree 部件 background 覆盖槽。 |
| `--xh-tree-border` | `tree` | `border` | `default` | `--xh-border-default` | tree 的 tree 部件 border 覆盖槽。 |
| `--xh-tree-branch-content-gap` | `branch-content` | `gap`<br>`row-gap` | `default`<br>`orientation=horizontal` | `--xh-list-option-gap` | tree 的 branch-content 部件 gap、row-gap 覆盖槽。 |
| `--xh-tree-branch-gap` | `branch` | `gap` | `default` | `--xh-list-option-gap` | tree 的 branch 部件 gap 覆盖槽。 |
| `--xh-tree-branch-indicator-fg` | `branch-indicator`<br>`branch-trigger` | `color` | `default` | `--xh-fg-subtle` | tree 的 branch-indicator、branch-trigger 部件 color 覆盖槽。 |
| `--xh-tree-checkbox-bg` | `branch-checkbox`<br>`item-checkbox` | `background` | `default` | `--xh-bg-canvas` | tree 的 branch-checkbox、item-checkbox 部件 background 覆盖槽。 |
| `--xh-tree-checkbox-bg-checked` | `branch-checkbox`<br>`item-checkbox` | `background` | `indeterminate`<br>`not([data-selected])`<br>`selected` | `--xh-bg-brand` | tree 的 branch-checkbox、item-checkbox 部件 background 覆盖槽。 |
| `--xh-tree-checkbox-border` | `branch-checkbox`<br>`item-checkbox` | `border` | `default` | `--xh-border-control` | tree 的 branch-checkbox、item-checkbox 部件 border 覆盖槽。 |
| `--xh-tree-checkbox-border-checked` | `branch-checkbox`<br>`item-checkbox` | `border-color` | `indeterminate`<br>`not([data-selected])`<br>`selected` | `--xh-bg-brand` | tree 的 branch-checkbox、item-checkbox 部件 border-color 覆盖槽。 |
| `--xh-tree-checkbox-border-disabled` | `branch-checkbox`<br>`item-checkbox` | `border-color` | `disabled` | `--xh-border-default` | tree 的 branch-checkbox、item-checkbox 部件 border-color 覆盖槽。 |
| `--xh-tree-checkbox-fg` | `branch-checkbox`<br>`item-checkbox` | `color` | `default` | `--xh-fg-on-brand` | tree 的 branch-checkbox、item-checkbox 部件 color 覆盖槽。 |
| `--xh-tree-checkbox-radius` | `branch-checkbox`<br>`item-checkbox` | `border-radius` | `default` | `--xh-shape-inset` | tree 的 branch-checkbox、item-checkbox 部件 border-radius 覆盖槽。 |
| `--xh-tree-checkbox-size` | `branch-checkbox`<br>`item-checkbox` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | tree 的 branch-checkbox、item-checkbox 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-tree-drag-fg` | `node-drag-trigger` | `color` | `default` | `--xh-fg-subtle` | tree 的 node-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tree-drag-fg-active` | `node-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` | tree 的 node-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tree-drag-fg-disabled` | `node-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | tree 的 node-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tree-drag-grip-long` | `node-drag-trigger` | `inline-size` | `empty` | `--xh-space-2` | tree 的 node-drag-trigger 部件 inline-size 覆盖槽。 |
| `--xh-tree-drag-grip-short` | `node-drag-trigger` | `block-size` | `empty` | `--xh-space-1` | tree 的 node-drag-trigger 部件 block-size 覆盖槽。 |
| `--xh-tree-drag-radius` | `node-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` | tree 的 node-drag-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tree-drag-size` | `node-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | tree 的 node-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tree-dragging-opacity` | `branch-control`<br>`item` | `opacity` | `dragging` | `--xh-state-dragging-opacity` | tree 的 branch-control、item 部件 opacity 覆盖槽。 |
| `--xh-tree-drop-fg` | `branch-control`<br>`item` | `background`<br>`box-shadow` | `disabled`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-disabled])` | `--xh-border-control-focus` | tree 的 branch-control、item 部件 background、box-shadow 覆盖槽。 |
| `--xh-tree-drop-inside-bg` | `branch-control`<br>`item` | `background` | `disabled`<br>`drop=inside`<br>`not([data-disabled])` | `--xh-bg-subtle-hover` | tree 的 branch-control、item 部件 background 覆盖槽。 |
| `--xh-tree-drop-line` | `branch-control`<br>`item` | `block-size`<br>`box-shadow` | `disabled`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-disabled])` | `--xh-stroke-thick` | tree 的 branch-control、item 部件 block-size、box-shadow 覆盖槽。 |
| `--xh-tree-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` | tree 的 empty 部件 color 覆盖槽。 |
| `--xh-tree-empty-font-size` | `empty` | `font-size` | `default` | `--xh-text-body-size` | tree 的 empty 部件 font-size 覆盖槽。 |
| `--xh-tree-empty-px` | `empty` | `padding-inline` | `default` | `--xh-space-3` | tree 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-tree-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | tree 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-tree-fg` | `tree` | `color` | `default` | `--xh-fg-default` | tree 的 tree 部件 color 覆盖槽。 |
| `--xh-tree-gap` | `root` | `gap` | `default` | `--xh-space-2` | tree 的 root 部件 gap 覆盖槽。 |
| `--xh-tree-icon-size` | `branch-control`<br>`item`<br>`root` | `--xh-icon-size` | `default` | `--xh-_collection-glyph-size`<br>`--xh-glyph-size-md` | tree 的 branch-control、item、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tree-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-space-4` | tree 的 branch-content 部件 padding-inline-start 覆盖槽。 |
| `--xh-tree-indicator-size` | `branch-control`<br>`branch-indicator`<br>`branch-trigger`<br>`item`<br>`item-indicator` | `inline-size`<br>`padding-inline-start` | `default`<br>`not(:has(> [data-scope='tree'][data-part='item-indicator'])`<br>`orientation=vertical` | `--xh-icon-size` | tree 的 branch-control、branch-indicator、branch-trigger、item、item-indicator 部件 inline-size、padding-inline-start 覆盖槽。 |
| `--xh-tree-item-check-fg` | `branch-control`<br>`item` | `background-color`<br>`color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=page`<br>`xh-collection-slot=indicator` | `--xh-tree-item-indicator-fg` | tree 的 branch-control、item 部件 background-color、color 覆盖槽。 |
| `--xh-tree-item-indicator-fg` | `branch-control`<br>`item` | `background-color`<br>`color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=page`<br>`xh-collection-slot=indicator` | `--xh-fg-brand` | tree 的 branch-control、item 部件 background-color、color 覆盖槽。 |
| `--xh-tree-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | tree 的 label 部件 color 覆盖槽。 |
| `--xh-tree-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | tree 的 label 部件 font-size 覆盖槽。 |
| `--xh-tree-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | tree 的 label 部件 font-weight 覆盖槽。 |
| `--xh-tree-leaf-row-gap` | `branch-content` | `column-gap` | `orientation=horizontal` | `--xh-space-3` | tree 的 branch-content 部件 column-gap 覆盖槽。 |
| `--xh-tree-loading-fg` | `loading` | `color` | `default` | `--xh-fg-subtle` | tree 的 loading 部件 color 覆盖槽。 |
| `--xh-tree-loading-font-size` | `loading` | `font-size` | `default` | `--xh-text-body-size` | tree 的 loading 部件 font-size 覆盖槽。 |
| `--xh-tree-loading-px` | `loading` | `padding-inline` | `default` | `--xh-space-3` | tree 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-tree-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | tree 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-tree-max-h` | `tree` | `max-block-size` | `default` | `--xh-viewport-h-lg` | tree 的 tree 部件 max-block-size 覆盖槽。 |
| `--xh-tree-px` | `tree` | `padding-inline` | `default` | `--xh-space-1` | tree 的 tree 部件 padding-inline 覆盖槽。 |
| `--xh-tree-py` | `tree` | `padding-block` | `default` | `--xh-space-1` | tree 的 tree 部件 padding-block 覆盖槽。 |
| `--xh-tree-radius` | `tree` | `border-radius` | `default` | `--xh-shape-surface` | tree 的 tree 部件 border-radius 覆盖槽。 |
| `--xh-tree-row-bg-hover` | `branch-control`<br>`item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | tree 的 branch-control、item 部件 background-color 覆盖槽。 |
| `--xh-tree-row-bg-pressed` | `branch-control`<br>`item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | tree 的 branch-control、item 部件 background-color 覆盖槽。 |
| `--xh-tree-row-bg-selected` | `branch-control`<br>`item` | `background-color` | `disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` | tree 的 branch-control、item 部件 background-color 覆盖槽。 |
| `--xh-tree-row-fg` | `branch-control`<br>`item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-fg-default` | tree 的 branch-control、item 部件 color 覆盖槽。 |
| `--xh-tree-row-fg-selected` | `branch-control`<br>`item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` | tree 的 branch-control、item 部件 color 覆盖槽。 |
| `--xh-tree-row-font-size` | `branch-control`<br>`item` | `font-size` | `default` | `--xh-text-body-size` | tree 的 branch-control、item 部件 font-size 覆盖槽。 |
| `--xh-tree-row-gap` | `branch-control`<br>`item`<br>`item-indicator` | `gap`<br>`padding-inline-start` | `default`<br>`not(:has(> [data-scope='tree'][data-part='item-indicator'])`<br>`orientation=vertical` | `--xh-control-gap-md` | tree 的 branch-control、item、item-indicator 部件 gap、padding-inline-start 覆盖槽。 |
| `--xh-tree-row-leading` | `branch-control`<br>`item` | `line-height` | `default` | `--xh-leading-normal` | tree 的 branch-control、item 部件 line-height 覆盖槽。 |
| `--xh-tree-row-px` | `branch-control`<br>`item`<br>`item-indicator` | `padding-inline`<br>`padding-inline-start` | `default`<br>`not(:has(> [data-scope='tree'][data-part='item-indicator'])`<br>`orientation=vertical` | `--xh-control-px-md` | tree 的 branch-control、item、item-indicator 部件 padding-inline、padding-inline-start 覆盖槽。 |
| `--xh-tree-row-py` | `branch-control`<br>`item` | `padding-block` | `default` | `--xh-list-option-py-md` | tree 的 branch-control、item 部件 padding-block 覆盖槽。 |
| `--xh-tree-row-radius` | `branch-control`<br>`item` | `border-radius` | `default` | `--xh-shape-control` | tree 的 branch-control、item 部件 border-radius 覆盖槽。 |
| `--xh-tree-row-selected-font-weight` | `branch-control`<br>`item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-font-weight-regular` | tree 的 branch-control、item 部件 font-weight 覆盖槽。 |
| `--xh-tree-tree-gap` | `tree` | `gap` | `default` | `--xh-list-option-gap` | tree 的 tree 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `box-shadow` · `color` · `outline-color` · `rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
