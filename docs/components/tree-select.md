# 树选择 <Badge type="info" text="tree-select" />

浮层里放一棵树的选择器：层级不规整、深浅不一时用它。

## 何时使用

- 选项是任意形状的树（组织架构、目录、权限节点）。
- 需要在浮层里展开、勾选，并把选中项回显在触发器上。

## 何时不用

- 层级规整、层数固定：[级联选择](./cascader)的分列展开更快。
- 树本身就是页面主体：用[树](./tree)。

## 特性

- 选中与展开两套值各自可受控。
- 原生表单按每个选中值生成一个同名隐藏字段；`['a,b', 'c']` 用 `FormData.getAll(name)` 读取为两个原值，不使用逗号拼接。零选中没有提交项，禁用不提交，只读仍提交。
- 声明 `HiddenInput` 部件才参与原生表单。`form` 可指定外部表单 ID，提交与重置使用同一所有者；显式 ID 不存在时不回退祖先表单。非受控 reset 恢复 `defaultValue`，受控值由业务响应重置请求。
- 单选、多选、分支与叶子统一用末端对号表示选中，级联半选使用横线；正文保持正常颜色和字重，
  中性底只用于悬停和键盘高亮。展开箭头位于行首，与选择标记分开。
- `cascade` 与 `checkedStrategy` 决定勾选是否带子级、回显给哪一层。
- 支持只挑叶子不挑分支、浮层内关键词过滤、子节点异步加载：节点用 `hasChildren: true` 声明懒分支，首次展开由 `loadChildren({ node, signal })` 取直接子项；失败保留 cause，`api.retryBranch(value)` 才会重试。重试、节点移除和卸载都会作废旧请求，旧回调不能覆盖有效树。
- 空（`empty`）与在途（`loading`）两个相位各有部件；`loading` 为真时树报 `aria-busy`，空态让位。
- 输入框保持实体；浮层使用 M2 磨砂材质、内侧顶光和四向短位移，不缩放树中文字。
  树、空态与加载态共用一个外壳，底部操作使用同材质分隔线；增强对比度时材质自动实体化。
  面板宽度受定位后的可用空间约束，即使触发器更宽也不会强行撑大面板。
- 仅 `{ hasChildren: true, children: undefined }` 触发 `loadChildren({ node, signal })`；`children: []` 是已知为空目录，永不请求。成功子项、可见行、键盘导航与级联选择由 headless 的同一有效树计算，三端不各自缓存结果。
- 失败态不会降级为空态：`api.branchLoadState(value)` 公开 `idle` / `loading` / `error` 与原始 cause，`api.retryBranch(value)` 才开启新一轮。重试、从 collection 移除该节点、或组件卸载都会中止并作废旧请求；即使旧 Promise 随后兑现或拒绝，也不能覆盖当前结果。加载中的 `branch` 带 `aria-busy="true"` 和 `data-loading`，失败带 `data-error`，自定义结构可据此放置提示与重试控件。

## 示例

### 基础用法

收起时整个控件只占触发器一个 Tab 位，展开那一刻焦点真的进树、落在已选中的那行上

<XhDemo src="tree-select/01-basic" />

### 选中与展开双受控

两份集合都由宿主持有：组件只发事件，宿主写回它才动，回显的就是写回的那两份

<XhDemo src="tree-select/02-controlled" />

### 多选与表单

multiple 下确认键是切换、浮层不收起；写了 hidden-input 才随表单提交，多个值按逗号拼成一串

<XhDemo src="tree-select/03-multiple" />

### 形态

variant 只换触发框的描边与底色，浮层与树的长相不跟着变

<XhDemo src="tree-select/04-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交，这里统一用 subtle 形态

<XhDemo src="tree-select/05-tone" />

### 尺寸

size 换掉行高、内边距与字号，不写就是缺省档

<XhDemo src="tree-select/06-size" />

### 禁用、只读与校验失败

disabled 连键盘入口都没有；readOnly 照常展开浏览但值改不动也清不掉；invalid 只报校验态，交互一切照旧

<XhDemo src="tree-select/07-state" />

### 首次全量加载与空集合

第一次展开才取整棵树；正式 Loading/Empty 与候选树互斥，状态文字不进入选值或键盘导航，底部按钮可重放有数据与零集合响应

<XhDemo src="tree-select/08-async" />

### 浮层里的操作区

footer 写在 content 里、tree 的兄弟：它不进 role=tree 的拥有关系，方向键也走不到；在浮层内点按钮不算点在外面，浮层不会因此收起

<XhDemo src="tree-select/09-action" />

### 级联勾选与回显策略

multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；对外值按 checked-strategy 收敛，parent 档整组选满只报组名

<XhDemo src="tree-select/10-checkable" />

### 浮层内关键词过滤

输入框是树的兄弟节点，树的键盘处理器挂在 tree 上，打字不会被连打检索收走；换掉 collection 可见行与方向键顺序跟着重算

<XhDemo src="tree-select/11-filter" />

### 只挑文件不挑目录

选中值与展开态双受控：目录的值不写回，紧跟着那一次收起意图也一并吞掉，点目录就只剩展开收起

<XhDemo src="tree-select/12-file-picker" />

### 只交数据自动渲染

Vue 不写默认插槽时按 collection 铺开整套部件：带 children 的节点落成 branch、其余落成 item，文本与禁用都查数据；label 给标题，clearable 带上清空钮（手写部件不看它），产出的 DOM 与手写全套部件完全一致；Web Components 没有自动铺树，节点部件照常手写、只报 value

<XhDemo src="tree-select/13-collection" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tree-select>` |
| Vue 组件 | `XhTreeSelectBranch` `XhTreeSelectBranchContent` `XhTreeSelectBranchControl` `XhTreeSelectBranchIndicator` `XhTreeSelectBranchText` `XhTreeSelectBranchTrigger` `XhTreeSelectClearTrigger` `XhTreeSelectContent` `XhTreeSelectControl` `XhTreeSelectEmpty` `XhTreeSelectFooter` `XhTreeSelectHiddenInput` `XhTreeSelectIndicator` `XhTreeSelectItem` `XhTreeSelectItemIndicator` `XhTreeSelectItemText` `XhTreeSelectLabel` `XhTreeSelectLoading` `XhTreeSelectPositioner` `XhTreeSelectRoot` `XhTreeSelectTree` `XhTreeSelectTrigger` `XhTreeSelectValueText` |
| 组合式函数 | `useTreeSelect` |
| 状态机 | `treeSelectMachine` |
| 皮肤 | `@xihan-ui/styles/tree-select.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tree-select"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `positioner` · **`content`** · **`tree`** · `item` · `item-text` · `item-indicator` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `empty` · `loading` · `footer` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TreeSelectNode[]` |  | 树数据，层级元信息与显示文本的唯一事实源。`hasChildren` 且未给 children 是懒分支；已给 children 时它优先。缺省为空树。 |
| `loadChildren` | `(request: TreeSelectLoadChildrenRequest) => Promise<TreeSelectNode[] \| undefined \| void> \| TreeSelectNode[] \| undefined \| void` |  | 取回 `hasChildren: true` 分支的直接子项。首次展开自动调用，失败后用 api.retryBranch 显式重试。旧请求的兑现或拒绝不会覆盖更新的一轮，也不会写回已移除的分支。 |
| `value` | `string \| string[]` |  | 选中值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单选写成裸串是简写，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `expandedValue` | `string[]` |  | 展开集合。给定即受控，语义同上。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `multiple` | `boolean` |  | 多选：选中是集合，选中后浮层不收起、焦点留在树里以便接着挑。 |
| `cascade` | `boolean` |  | 多选下父子级联勾选：点分支整枝传导、子全勾父勾、部分勾中半选， 禁用子树整棵冻结。默认 false（朴素切换）；单选下无效。 |
| `checkedStrategy` | `CascadeStrategy` |  | 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾中节点。 |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 用原生 disabled，表单出口不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、树照常浏览与展开收起，但选中值改不动、也清不掉。 disabled 则连键盘入口都没有。 |
| `invalid` | `boolean` |  | 校验失败：trigger 报 aria-invalid，各角色节点带 data-invalid。 |
| `loading` | `boolean` |  | 节点还在取：树报 aria-busy，在途占位顶上来、空态占位让位。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定触发框的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发框与树节点行的几何档位。 |
| `placeholder` | `string` |  | 无选中时 value-text 显示的占位文字。 |
| `translations` | `Partial<TreeSelectTranslations>` |  | 读屏用的文案，默认英文。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `name` | `string` |  | 表单字段名。给定后表单出口才带 name，选中值随表单一并提交。 |
| `form` | `string` |  | 原生表单 ID；显式关联外部表单，提交与 reset 使用同一所有者。 |
| `onValueChange` | `(details: TreeSelectValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onExpandedValueChange` | `(details: TreeSelectExpandedValueChangeDetails) => void` |  | 展开集合变化意图回调；语义同上。 |
| `onOpenChange` | `(details: TreeSelectOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TreeSelectValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `expanded-value-change` | `TreeSelectExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |
| `open-change` | `TreeSelectOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTreeSelectRoot` | `default` | `TreeSelectRootSlotProps` |  |
| `XhTreeSelectRoot` | `label` | — |  |

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
| `tree` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `NODE.FOCUS` · `NODE.LOST` · `NODE.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `BRANCH.RETRY` · `FORM.RESET`

**判据**：`isOpenControlled` · `isMultiple`

## connect API

`useTreeSelect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly TreeSelectNode[]` | 当前有效树：含 headless 已成功取回的懒分支子项。 |
| `visibleNodes` | `readonly TreeVisibleNode[]` | 当前可见行序列（收起分支的子树不在其中）。 方向键、Home/End 与连打检索都在它上面走，不是在原始树上走。 |
| `value` | `string[]` | 选中集合；单选下长度 ≤ 1，形状不随模式变。 |
| `expandedValue` | `string[]` |  |
| `valueText` | `string \| null` | 选中项的显示文本（多选用逗号加空格连接）；无选中时为 null。取自 collection 的 label。 |
| `displayText` | `string` | value-text 实际显示的文字：有选中取其文本，否则取 placeholder。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起、或它已被收起而不可见时为 null。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isIndeterminate` | `(value: string) => boolean` | 级联模式下该分支是否半选（有效叶后代有勾有不勾）；非级联恒 false。 |
| `isExpanded` | `(value: string) => boolean` |  |
| `branchLoadState` | `(value: string) => TreeSelectBranchLoadSnapshot \| null` | 非懒分支返回 null；懒分支即使尚未请求也返回 idle。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `retryBranch` | `(value: string) => void` | 失败后重新取该分支；非懒分支与未知 value 不产生副作用。 |
| `select` | `(value: string) => void` | 单选替换、多选切换，与点节点同一语义。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTreeProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getItemTextProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchControlProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchIndicatorProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchTextProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchContentProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 里、tree 的兄弟。 给了 collection 时由连接层按条数收放；节点手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 给了 collection 时由连接层按条数收放；节点手写时只按 loading 收放。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区：放在 content 里、tree 的兄弟，不入树的拥有关系，方向键也走不到。 |
| `getHiddenInputProps` | `(props: { value: string }) => T['input']` | 单值表单出口；按 api.value 逐个调用并生成同名 input，零选中不生成提交项。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | closed, focus in trigger | 展开浮层并把焦点落到选中节点（无选中或它藏在收起的分支里则落首个可用行） |
| `ArrowDown` | closed, focus in trigger | 展开浮层并把焦点落到选中节点的下一个可用行 |
| `ArrowUp` | closed, focus in trigger | 展开浮层并把焦点落到选中节点的上一个可用行 |
| `Delete` | focus in trigger, 有值且未禁用/只读 | 清空全部选中值，焦点留在 trigger |
| `Backspace` | focus in trigger, 有值且未禁用/只读 | 单选清空；多选去掉最后一个选中值 |
| `ArrowDown` | open, focus in content | 焦点移到下一个可见行（禁用行跳过；loop 默认关，末行不回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个可见行（禁用行跳过；loop 默认关，首行不回绕） |
| `Home` | open, focus in content | 焦点移到首个可见行 |
| `End` | open, focus in content | 焦点移到末个可见行（展开着的子树也算行） |
| `ArrowRight` | open, focus on branch（dir=rtl 时改由 ArrowLeft 承担） | 收起的分支就地展开；已展开则把焦点移到首个子节点；叶子上什么都不做且不吞键 |
| `ArrowLeft` | open, focus in content（dir=rtl 时改由 ArrowRight 承担） | 展开的分支就地收起；收起的分支与叶子则把焦点移到父节点；根层的行什么都不做 |
| `Enter` / `Space` | open, 焦点节点未禁用 | 选中焦点节点：单选替换并收起浮层、焦点归还 trigger；多选切换且浮层不收起 |
| `*` | open, focus in content | 展开与焦点行同一父级的全部分支（已展开与禁用的不动）；同级没有可展开的分支时不吞这个键 |
| `单个可打印字符` | open, focus in content | 连打检索在可见行上按 label 首字母搬焦点，不改选中值，也不展开任何分支 |
| `Escape` | open | 收起浮层并把焦点归还 trigger，选中值与展开集合都不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层，焦点不归还 trigger，按 Tab 序列自然离开 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `tree` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'tree' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `role` | 'combobox' |
| `indicator` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `tree` | `aria-busy` | 'true' \| undefined |
| `tree` | `aria-disabled` | 'true' \| 'false' |
| `tree` | `aria-label` | props.translations.tree |
| `tree` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `tree` | `aria-multiselectable` | 'true' \| 'false' |
| `tree` | `role` | 'tree' |
| `item-indicator` | `aria-hidden` | 'true' |
| `branch` | `aria-busy` | 'true' \| undefined |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-label` | metaOf(node.value)?.label |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |

## 样式

默认皮肤 `@xihan-ui/styles/tree-select.css` 按部件选择：`[data-scope="tree-select"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

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
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `tree` | `data-disabled` | ''（条件成立时才出现） |
| `tree` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tree-select-action-bg` | `clear-trigger` | `background` | `default` | `transparent` | tree-select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-tree-select-action-bg-active` | `clear-trigger` | `background` | `active` | `--xh-bg-subtle-active` | tree-select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-tree-select-action-bg-hover` | `clear-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | tree-select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-tree-select-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | tree-select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-tree-select-action-fg-hover` | `clear-trigger` | `color` | `hover` | `--xh-fg-default` | tree-select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-tree-select-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | tree-select 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-tree-select-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | tree-select 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tree-select-action-size` | `clear-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | tree-select 的 clear-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tree-select-branch-content-gap` | `branch-content` | `gap` | `default` | `--xh-list-option-gap` | tree-select 的 branch-content 部件 gap 覆盖槽。 |
| `--xh-tree-select-branch-gap` | `branch` | `gap` | `default` | `--xh-list-option-gap` | tree-select 的 branch 部件 gap 覆盖槽。 |
| `--xh-tree-select-branch-indicator-fg` | `branch-indicator`<br>`branch-trigger` | `color` | `default` | `--xh-fg-subtle` | tree-select 的 branch-indicator、branch-trigger 部件 color 覆盖槽。 |
| `--xh-tree-select-branch-indicator-size` | `branch-indicator`<br>`branch-trigger`<br>`item` | `inline-size`<br>`padding-inline-start` | `default` | `--xh-control-indicator-size` | tree-select 的 branch-indicator、branch-trigger、item 部件 inline-size、padding-inline-start 覆盖槽。 |
| `--xh-tree-select-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | tree-select 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-tree-select-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | tree-select 的 content 部件 background 覆盖槽。 |
| `--xh-tree-select-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | tree-select 的 content 部件 border 覆盖槽。 |
| `--xh-tree-select-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | tree-select 的 content 部件 color 覆盖槽。 |
| `--xh-tree-select-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | tree-select 的 content 部件 background 覆盖槽。 |
| `--xh-tree-select-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | tree-select 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-tree-select-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | tree-select 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-tree-select-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-min-w` | tree-select 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-tree-select-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | tree-select 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | tree-select 的 content 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | tree-select 的 content 部件 border-radius 覆盖槽。 |
| `--xh-tree-select-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | tree-select 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-tree-select-control-bg` | `control` | `background` | `default` | `--xh-_tree-select-bg` | tree-select 的 control 部件 background 覆盖槽。 |
| `--xh-tree-select-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | tree-select 的 control 部件 background 覆盖槽。 |
| `--xh-tree-select-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_tree-select-bg-hover` | tree-select 的 control 部件 background 覆盖槽。 |
| `--xh-tree-select-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | tree-select 的 control 部件 background 覆盖槽。 |
| `--xh-tree-select-control-border` | `control` | `border` | `default` | `--xh-_tree-select-border` | tree-select 的 control 部件 border 覆盖槽。 |
| `--xh-tree-select-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | tree-select 的 control 部件 border-color 覆盖槽。 |
| `--xh-tree-select-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_tree-select-border-hover` | tree-select 的 control 部件 border-color 覆盖槽。 |
| `--xh-tree-select-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | tree-select 的 control 部件 border-color 覆盖槽。 |
| `--xh-tree-select-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | tree-select 的 control 部件 color 覆盖槽。 |
| `--xh-tree-select-control-gap` | `control` | `gap` | `default` | `--xh-_tree-select-gap` | tree-select 的 control 部件 gap 覆盖槽。 |
| `--xh-tree-select-control-h` | `control` | `block-size` | `default` | `--xh-_tree-select-h` | tree-select 的 control 部件 block-size 覆盖槽。 |
| `--xh-tree-select-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | tree-select 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-tree-select-control-px` | `control` | `padding-inline` | `default` | `--xh-_tree-select-px` | tree-select 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | tree-select 的 control 部件 border-radius 覆盖槽。 |
| `--xh-tree-select-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_tree-select-shadow` | tree-select 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-tree-select-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | tree-select 的 empty 部件 color 覆盖槽。 |
| `--xh-tree-select-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_tree-select-font-size` | tree-select 的 empty 部件 font-size 覆盖槽。 |
| `--xh-tree-select-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_tree-select-row-px` | tree-select 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | tree-select 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-frosted-separator` | tree-select 的 footer 部件 border-block-start 覆盖槽。 |
| `--xh-tree-select-footer-fg` | `footer` | `color` | `default` | `--xh-material-frosted-fg-muted` | tree-select 的 footer 部件 color 覆盖槽。 |
| `--xh-tree-select-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` | tree-select 的 footer 部件 font-size 覆盖槽。 |
| `--xh-tree-select-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | tree-select 的 footer 部件 gap 覆盖槽。 |
| `--xh-tree-select-footer-px` | `footer` | `padding-inline` | `default` | `--xh-space-2` | tree-select 的 footer 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` | tree-select 的 footer 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-gap` | `root` | `gap` | `default` | `--xh-space-1` | tree-select 的 root 部件 gap 覆盖槽。 |
| `--xh-tree-select-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | tree-select 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tree-select-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-space-4` | tree-select 的 branch-content 部件 padding-inline-start 覆盖槽。 |
| `--xh-tree-select-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | tree-select 的 indicator 部件 color 覆盖槽。 |
| `--xh-tree-select-item-bg-hover` | `branch`<br>`branch-control`<br>`item` | `background` | `disabled`<br>`focus-visible`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`is(:hover, [data-highlighted], :focus-visible)`<br>`not([data-disabled])` | `--xh-bg-subtle` | tree-select 的 branch、branch-control、item 部件 background 覆盖槽。 |
| `--xh-tree-select-item-fg` | `branch-control`<br>`item` | `color` | `default`<br>`selected` | `--xh-material-frosted-fg` | tree-select 的 branch-control、item 部件 color 覆盖槽。 |
| `--xh-tree-select-item-fg-selected` | `branch-control`<br>`item` | `color` | `selected` | `--xh-tree-select-item-fg` | tree-select 的 branch-control、item 部件 color 覆盖槽。 |
| `--xh-tree-select-item-font-size` | `branch-control`<br>`item` | `font-size` | `default` | `--xh-_tree-select-font-size` | tree-select 的 branch-control、item 部件 font-size 覆盖槽。 |
| `--xh-tree-select-item-gap` | `branch-control`<br>`item` | `gap`<br>`padding-inline-start` | `default` | `--xh-_tree-select-gap` | tree-select 的 branch-control、item 部件 gap、padding-inline-start 覆盖槽。 |
| `--xh-tree-select-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tree-select-accent` | tree-select 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-tree-select-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | tree-select 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tree-select-item-leading` | `branch-control`<br>`item` | `line-height` | `default` | `--xh-leading-normal` | tree-select 的 branch-control、item 部件 line-height 覆盖槽。 |
| `--xh-tree-select-item-px` | `branch-control`<br>`item` | `padding-inline`<br>`padding-inline-start` | `default` | `--xh-_tree-select-row-px` | tree-select 的 branch-control、item 部件 padding-inline、padding-inline-start 覆盖槽。 |
| `--xh-tree-select-item-py` | `branch-control`<br>`item` | `padding-block` | `default` | `--xh-_tree-select-row-py` | tree-select 的 branch-control、item 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-item-radius` | `branch-control`<br>`item` | `border-radius` | `default` | `--xh-shape-control` | tree-select 的 branch-control、item 部件 border-radius 覆盖槽。 |
| `--xh-tree-select-item-selected-font-weight` | `branch-control`<br>`item` | `font-weight` | `selected` | `--xh-font-weight-regular` | tree-select 的 branch-control、item 部件 font-weight 覆盖槽。 |
| `--xh-tree-select-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | tree-select 的 label 部件 color 覆盖槽。 |
| `--xh-tree-select-label-font-size` | `label` | `font-size` | `default` | `--xh-_tree-select-label-font-size` | tree-select 的 label 部件 font-size 覆盖槽。 |
| `--xh-tree-select-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | tree-select 的 label 部件 font-weight 覆盖槽。 |
| `--xh-tree-select-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | tree-select 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-tree-select-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | tree-select 的 loading 部件 color 覆盖槽。 |
| `--xh-tree-select-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_tree-select-font-size` | tree-select 的 loading 部件 font-size 覆盖槽。 |
| `--xh-tree-select-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_tree-select-row-px` | tree-select 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | tree-select 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-placeholder-fg` | `value-text` | `color` | `placeholder` | `--xh-fg-subtle` | tree-select 的 value-text 部件 color 覆盖槽。 |
| `--xh-tree-select-tree-gap` | `tree` | `gap` | `default` | `--xh-list-option-gap` | tree-select 的 tree 部件 gap 覆盖槽。 |
| `--xh-tree-select-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | tree-select 的 trigger 部件 color 覆盖槽。 |
| `--xh-tree-select-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_tree-select-font-size` | tree-select 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-tree-select-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_tree-select-gap` | tree-select 的 trigger 部件 gap 覆盖槽。 |
| `--xh-tree-select-value-leading` | `value-text` | `line-height` | `default` | `--xh-leading-normal` | tree-select 的 value-text 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 外面套[表单字段](./field)。

## 最佳实践

- 大树一定要开浮层内过滤，逐级展开找一个节点非常慢。
- 无头用法需要按 `api.value` 遍历，为每个值调用 `api.getHiddenInputProps({ value })` 并渲染原生 input；旧的无参调用与 CSV 提交合同已删除。Vue/React 的 `HiddenInput` 部件自动铺开，Web Components 仍只需声明一个原生 `input[data-xh-part="hidden-input"]`，额外字段由宿主管理。
- 明确"只能选叶子"还是"分支也能选"，并在界面上让分支看起来点得动或点不动。
- 自定义 `branch-control` 与 `item` 均应包含 `item-indicator`，分支标记直接读取所属分支的选择与半选状态，
  不另写一套状态判定或自绘复选框。Vue / React 自动结构已提供此部件。

## 反模式

- 一次把整棵大树塞进浮层：首屏就卡住。
- 勾选策略与后端理解不一致。
