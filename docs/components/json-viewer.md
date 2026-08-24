# JSON 视图 <Badge type="info" text="json-viewer" />

把一份 JSON 摊成可展开的树：键名、值与值类型各自成一块，对象与数组可以逐层收起。

## 何时使用

- 调试面板、接口返回体、配置文件的只读呈现。
- 日志详情里那一大坨结构化字段，直接铺开会淹掉正文。

## 何时不用

- 数据是可编辑的：本组件只读，改值要自己接[表单](./form)与[输入框](./text-field)。
- 数据只是一段带语法高亮的源码：用[代码块](./code-block)。
- 层级数据不是 JSON，键名与类型没有语义：用[树](./tree)——它认的是通用层级数据与选中，本组件认的是 JSON 的类型语义（键名、值形态、逐类型着色、循环引用）。
- 只有几个字段要平铺展示：用[描述列表](./descriptions)。

## 特性

- 行结构由 `value` 摊出来，作者不写任何行标记：Vue 与自定义元素两侧铺出同一棵 DOM，根容器里原有的内容由组件接管。
- 不给 `value` 就是空视图，一行也不摊；对象内部真有一个值为 `undefined` 的成员时，那一行照常摊出来。
- 展开集合可受控（`expandedValue` / `defaultExpandedValue`），不受控时按 `defaultExpandedDepth` 现算：数据晚于组件挂载才到（自定义元素常是先升级、再由脚本写 `.value`）也照样算得上，第一次展开或收起之后就固定下来，不再跟着数据走。
- `maxStringLength` 截长字符串，`maxItems` 折超长数组，`sortKeys` 让对象键按字典序排。
- 循环引用摊到就停，标成 `[Circular]`，不会无限递归。
- 每一行带 `data-type`，六种值形态各自上色。
- 尺寸一轴与其余组件同源。
- **只认 JSON 能表达的形状**，喂进活对象时呈现是有损的：`Date` / `Map` / `Set` 一律按自有可枚举键摊，因此显示成 `{}`；`undefined` 归 `null` 一档、显示成 `undefined`；`bigint` 归 `number`；函数与 symbol 归 `string`，按各自的字符串形式呈现。要如实展示这些值，先自己转成 JSON 能表达的形状。
- 自定义元素侧：`value` 属性收的是一段 JSON 文本（解析不了就当一个字符串值展示），对象与数组直接赋 property（`el.value = { … }`）；`expandedValue` / `defaultExpandedValue` / `translations` **没有对应属性，只能走 property**，写成 `expanded-value='["$"]'` 不会生效。

## 示例

### 基础用法

一份 JSON 摊成可展开的树：键名与值各自成块，六种类型各自上色，默认只展开根行

<XhDemo src="json-viewer/01-basic" />

### 默认展开层数

defaultExpandedDepth 决定初次摊到第几层：1 只展开根行，3 连孙层一起铺开

<XhDemo src="json-viewer/02-depth" />

### 受控展开

传了 expandedValue 就由宿主说了算，组件只发 expanded-change 不落内部值，写回它才动

<XhDemo src="json-viewer/03-controlled" />

### 大数据

maxItems 把超长数组折成一行占位，maxStringLength 截掉过长的字符串，一份大 JSON 不会把页面压住

<XhDemo src="json-viewer/04-large" />

### 键排序

sortKeys 让对象键按字典序排，数组顺序不动；接口返回的字段顺序不稳定时用它

<XhDemo src="json-viewer/05-sort-keys" />

### 循环引用

值出现在自己的祖先链上就停下并标成 [Circular]，不会无限递归；共享引用不算环，照样摊开

<XhDemo src="json-viewer/06-circular" />

### 尺寸

size 三档只换字号与层级缩进，行的结构与配色都不变

<XhDemo src="json-viewer/07-size" />

### 原文视图

view="text" 直接出缩进过的 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减

<XhDemo src="json-viewer/08-text" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-json-viewer>` |
| Vue 组件 | `XhJsonViewerRoot` |
| 组合式函数 | `useJsonViewer` |
| 状态机 | `jsonViewerMachine` |
| 皮肤 | `@xihan-ui/styles/json-viewer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="json-viewer"`：**`root`** · `tree` · `item` · `item-key` · `item-value` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `preview` · `text`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `unknown` |  | 要展示的值，任意形状。缺省即空视图（一行也不摊）。 |
| `view` | `JsonViewerView` |  | 展示形态，默认 tree。 text 档直接出 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减—— 要的就是与后端下发的那份一字不差。展开集合与键盘导航在这一档上不起作用。 |
| `expandedValue` | `string[]` |  | 展开集合（元素是行路径）。给定即受控：cell 直读 prop，写只发 onExpandedChange 不落内部值。 |
| `defaultExpandedValue` | `string[]` |  | 非受控初值；不给就按 defaultExpandedDepth 现算。 |
| `defaultExpandedDepth` | `number` |  | 初始展开到第几层（层级号不超过它的分支全部展开），默认 1，即只展开根行。 |
| `maxStringLength` | `number` |  | 字符串值超过这么多字符就截断并补省略号；不给即不截断。 |
| `maxItems` | `number` |  | 同一层最多摊出这么多成员，其余收成一行占位；不给即全摊。 |
| `sortKeys` | `boolean` |  | 对象键按字典序排列；数组顺序不受影响。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，只对调左右方向键的展开/收起语义；不给即从 DOM 现读。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<JsonViewerTranslations>` |  |  |
| `onExpandedChange` | `(details: JsonViewerExpandedChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `expanded-change` | `JsonViewerExpandedChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `VIEWER.BLUR`

## connect API

`useJsonViewer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visibleNodes` | `readonly JsonViewerNode[]` | 当前可见行序列（收起分支的子行不在其中）。 方向键、Home/End 都在它上面走，适配器也按它铺 DOM。 |
| `expandedValue` | `string[]` |  |
| `focusedValue` | `string \| null` | roving tabindex 的锚点行：焦点在树内时就是当前行，焦点离开后仍留着（Tab 回来落回它）； 它已随分支收起而不再可见时为 null。 |
| `isFocusWithin` | `boolean` | 焦点此刻在不在树内。行的高亮标记跟它走，锚点不跟。 |
| `isExpanded` | `(value: string) => boolean` |  |
| `previewText` | `(node: JsonViewerNode) => string` | 分支收起摘要的显示文字（如 `{…} 3`），只给眼睛看；叶子行返回空串。 |
| `valueText` | `(node: JsonViewerNode) => string` | 值的显示文字；截断占位行返回「其余 N 项」那句话。 |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `toggle` | `(value: string) => void` |  |
| `view` | `JsonViewerView` | 当前生效的展示形态。 |
| `text` | `string` | 缩进过的 JSON 原文；键序与环路记号与树档一致。text 档之外也取得到，方便作者做「复制原文」。 |
| `getRootProps` | `() => T['element']` |  |
| `getTreeProps` | `() => T['element']` |  |
| `getTextProps` | `() => T['element']` |  |
| `getItemProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getItemKeyProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getItemValueProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchControlProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchIndicatorProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchTextProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchContentProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getPreviewProps` | `(props: JsonViewerNodeProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the tree | 整棵树只占一个 Tab 位：第一次进来落首行，之后回到上次停留的那一行 |
| `ArrowDown` | focus in tree | 焦点移到下一个可见行（loop 默认关，末行不回绕） |
| `ArrowUp` | focus in tree | 焦点移到上一个可见行（loop 默认关，首行不回绕） |
| `Home` | focus in tree | 焦点移到首个可见行 |
| `End` | focus in tree | 焦点移到末个可见行（展开着的子层也算行） |
| `ArrowRight` | focus on branch（dir=rtl 时改由 ArrowLeft 承担） | 收起的对象/数组就地展开；已展开则把焦点移到首个子行；标量行什么都不做且不吞键 |
| `ArrowLeft` | focus in tree（dir=rtl 时改由 ArrowRight 承担） | 展开的对象/数组就地收起；收起的分支与标量行则把焦点移到父行；根行什么都不做 |
| `Enter` / `Space` | focus on branch | 切换该分支的展开态；焦点在标量行上时不吞这两个键 |
| `*` | focus in tree | 展开与焦点行同一父级的全部分支（已展开的不动）；同级没有可展开的分支时不吞这个键 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `tree` | `aria-label` | label.tree |
| `tree` | `role` | 'tree' |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-label` | branchLabel(node) \| undefined |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |
| `preview` | `aria-hidden` | 'true' |
| `text` | `aria-label` | label.text |
| `text` | `role` | 'region' |

- 树是 `role=tree`，每一行是 `role=treeitem`，层级三件套（`aria-level` / `aria-posinset` / `aria-setsize`）取自摊平结果。
- 整棵树只占一个 Tab 位：第一次进来落在首行，之后 Tab 出去再回来落回上次停留的那一行；组内靠上下键走。
- 展开箭头对读屏隐藏——它重复的是分支自己已经报出的 `aria-expanded` 与左右方向键。
- 分支的名字显式给（`aria-label`）：它裹着整棵子层，从内容算名字会把所有子孙的文字一并念出来。
- 收起摘要（`{…} 3`）是排版记号，对读屏隐藏；里面那个成员数折进了分支的可及名字（默认念成 `tags, 3 items`，整句可用 `translations.collapsedBranchLabel` 换）。

## 样式

默认皮肤 `@xihan-ui/styles/json-viewer.css` 按部件选择：`[data-scope="json-viewer"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-view` | props.view |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-json-viewer-bg` · `--xh-json-viewer-boolean-fg` · `--xh-json-viewer-border` · `--xh-json-viewer-fg` · `--xh-json-viewer-font` · `--xh-json-viewer-font-size` · `--xh-json-viewer-icon-size` · `--xh-json-viewer-indent` · `--xh-json-viewer-indicator-fg` · `--xh-json-viewer-indicator-size` · `--xh-json-viewer-key-fg` · `--xh-json-viewer-key-font-weight` · `--xh-json-viewer-max-h` · `--xh-json-viewer-null-fg` · `--xh-json-viewer-number-fg` · `--xh-json-viewer-preview-fg` · `--xh-json-viewer-preview-font-size` · `--xh-json-viewer-punctuation-fg` · `--xh-json-viewer-px` · `--xh-json-viewer-py` · `--xh-json-viewer-radius` · `--xh-json-viewer-row-bg-hover` · `--xh-json-viewer-row-gap` · `--xh-json-viewer-row-px` · `--xh-json-viewer-row-py` · `--xh-json-viewer-row-radius` · `--xh-json-viewer-string-fg` · `--xh-json-viewer-text-fg`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

- 左右方向键的展开/收起语义跟着书写方向走：没传 `dir` 时从 DOM 现读，整页 `dir="rtl"` 也认得出来。

## 组合

- 放进[标签页](./tabs)或[抽屉](./drawer)里当调试面板；行数多时套一层[滚动区域](./scroll-area)。
- 配[复制到剪贴板](./clipboard)让人把原始 JSON 拿走。

## 最佳实践

- 大数据一定要给 `maxItems` 与 `maxStringLength`：一次摊开几万行会让页面停住。
- 默认展开层数别给大：`defaultExpandedDepth` 超过 2 就等于把整份数据铺满屏。
- 值里的类型只靠颜色区分是不够的，字符串的引号、`null` 的字面量都要留着。
- 一行被收起时，它内部那个持有焦点的行会随之离开 DOM，焦点掉回 `<body>`。要在收起前把焦点交回分支行本身，键盘用户才不会每收一层就丢一次位置。

## 反模式

- 拿它当日志流：日志是时间序的一串条目，用[日志](./log)。
- 把一份几 MB 的响应体原样丢进去，再让用户自己找。
