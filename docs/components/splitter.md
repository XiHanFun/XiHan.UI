# 分栏 <Badge type="info" text="splitter" />

把一块区域拆成几片可拖动的面板，边界由用户自己分配。

## 何时使用

- 代码编辑器、文件管理器、带预览的编辑界面这类"两边都重要、比例因人而异"的布局。
- 用户调好的比例需要记下来：`onSizesChangeEnd` 就是为此留的。

## 何时不用

- 比例是固定的：用[栅格](./grid)或[弹性布局](./flex)。
- 侧栏只有展开与折叠两态：用[布局](./layout)的折叠侧栏。

## 特性

- `panels` 数组的长度决定面板块数，每条分隔条调的是它前面那一块。
- 两个回调分工明确：`onSizesChange` 拖动途中连着发，`onSizesChangeEnd` 松手才发一次，存布局用后者。
- 方向键按 `step` 推、Shift 加方向键按 `largeStep` 推；`collapsible` 的面板在分隔条上按 Enter 折叠。
- 面板里再放一套分栏即可拆出第二根轴，里外两层各管各的尺寸。

## 示例

### 基础用法

panels 数组的长度决定面板块数，每条分隔条调的是它前面那一块

<XhDemo src="splitter/01-basic" />

### 受控

传了 sizes 就由宿主说了算；sizes-change 拖动途中连着发，sizes-change-end 松手才发一次

<XhDemo src="splitter/02-controlled" />

### 竖排与折叠

orientation 换轴后方向键跟着换，collapsible 的面板在它的分隔条上按 Enter 折叠

<XhDemo src="splitter/03-vertical-collapsible" />

### 禁用

disabled 后拖不动也推不动，分隔条整个退出 Tab 序列，方向键放行给页面

<XhDemo src="splitter/04-disabled" />

### 嵌套

面板里再放一套分栏即可拆出第二根轴，里外两层各管各的尺寸，互不干涉

<XhDemo src="splitter/05-nested" />

### 分隔条里放内容

分隔条内可以再摆一个把手，粗细由 --xh-splitter-trigger-thickness 让出位置

<XhDemo src="splitter/06-trigger-content" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-splitter>` |
| Vue 组件 | `XhSplitterPanel` `XhSplitterResizeTrigger` `XhSplitterRoot` |
| 组合式函数 | `useSplitter` |
| 状态机 | `splitterMachine` |
| 皮肤 | `@xihan-ui/styles/splitter.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="splitter"`：**`root`** · **`panel`** · **`resize-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sizes` | `number[]` |  | 每块面板的百分比。给定即受控：内部不再自改，只发 onSizesChange。 |
| `defaultSizes` | `number[]` |  | 非受控初值；不给就按面板数等分。 |
| `panels` | `SplitterPanelProps[]` |  | 逐块的约束；数组长度同时决定面板块数。 |
| `orientation` | `Orientation` |  | 面板的排布轴，默认 horizontal（并排，拖左右）；vertical 是上下堆叠，拖上下。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调水平排布下的左右两键与指针位移的正负。 |
| `disabled` | `boolean` |  | 禁用：分隔条退出 Tab 序列、拖不动也推不动。 |
| `step` | `number` |  | 方向键的步长（百分比），默认 1。 |
| `largeStep` | `number` |  | Shift + 方向键的步长（百分比），默认 10。 |
| `onSizesChange` | `(details: SplitterSizesChangeDetails) => void` |  | 每次尺寸变化都发；拖动过程中会连续发很多次。 |
| `onSizesChangeEnd` | `(details: SplitterSizesChangeEndDetails) => void` |  | 只在一次操作结束时发一次，适合拿来存布局。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sizes-change` | `SplitterSizesChangeDetails` | 布局变化（拖动途中会连发）；detail 为 `{ sizes: number[] }` |
| `sizes-change-end` | `SplitterSizesChangeEndDetails` | 一次拖拽收尾发一次；detail 为 `{ sizes: number[], index: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSplitterRoot` | `default` | `SplitterRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `dragging`

**事件**：`SIZES.SET` · `BOUNDARY.STEP` · `BOUNDARY.TO_MIN` · `BOUNDARY.TO_MAX` · `BOUNDARY.SET` · `BOUNDARY.FOCUS` · `PANEL.COLLAPSE` · `PANEL.EXPAND` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END`

**判据**：`canResize`

## connect API

`useSplitter` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `sizes` | `number[]` |  |
| `panels` | `SplitterPanelState[]` |  |
| `dragging` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setSizes` | `(next: number[]) => void` | 整份赋值：逐块夹进约束、总和归位到 100 之后才落地。 |
| `setPanelSize` | `(index: number, next: number) => void` | 把第 index 块调到 next，缺的那部分从它后面的面板里取。 最后一块没有属于自己的分隔条，它的尺寸是其余面板的余数，调不动。 |
| `collapsePanel` | `(index: number) => void` |  |
| `expandPanel` | `(index: number) => void` |  |
| `togglePanel` | `(index: number) => void` | 折叠着就展开、展开着就折叠；不可折叠的面板上是空操作。 |
| `getRootProps` | `() => T['element']` |  |
| `getPanelProps` | `(index: number) => T['element']` |  |
| `getResizeTriggerProps` | `(index: number) => T['element']` | 第 index 条分隔条坐在第 index 与第 index+1 块面板之间，调整的是前一块。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in resize-trigger, not disabled | 把这条分隔条前面那块面板按 step（默认 1%）撑大；水平排布认左右键、竖直排布认上下键，另一条轴上的方向键原样放行 |
| `ArrowLeft` / `ArrowUp` | focus in resize-trigger, not disabled | 按 step 压小，同上的轴向规则；rtl 下左右两键对调，语义恒是"撑大 / 压小前一块" |
| `Shift+ArrowRight` / `Shift+ArrowDown` | focus in resize-trigger, not disabled | 按 largeStep（默认 10%）撑大 |
| `Shift+ArrowLeft` / `Shift+ArrowUp` | focus in resize-trigger, not disabled | 按 largeStep 压小 |
| `Home` | focus in resize-trigger, not disabled | 把前一块面板收到它眼下能到的最小尺寸 |
| `End` | focus in resize-trigger, not disabled | 把前一块面板撑到它眼下能到的最大尺寸 |
| `Enter` | focus in resize-trigger 且它调整的面板 collapsible，not disabled | 折叠 / 展开该面板；展开回到折叠前的尺寸。面板不可折叠时不接这个键 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `role` | 'group' |
| `resize-trigger` | `aria-controls` | `panel` 部件的 id |
| `resize-trigger` | `aria-disabled` | 'true' \| 'false' |
| `resize-trigger` | `aria-orientation` | 'horizontal' \| 'vertical' |
| `resize-trigger` | `aria-valuemax` | String(panel.max) |
| `resize-trigger` | `aria-valuemin` | String(panel.min) |
| `resize-trigger` | `aria-valuenow` | String(panel.size) |
| `resize-trigger` | `role` | 'separator' |

## 样式

默认皮肤 `@xihan-ui/styles/splitter.css` 按部件选择：`[data-scope="splitter"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `panel` | `data-collapsed` | ''（条件成立时才出现） |
| `panel` | `data-index` | String(panel.index) |
| `resize-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `resize-trigger` | `data-index` | String(boundary) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-splitter-radius` · `--xh-splitter-trigger-bg` · `--xh-splitter-trigger-bg-disabled` · `--xh-splitter-trigger-bg-dragging` · `--xh-splitter-trigger-bg-hover` · `--xh-splitter-trigger-thickness`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 面板里放[滚动区域](./scroll-area)，让每一片各自滚动。

## 最佳实践

- 给每块面板设最小尺寸，否则能被拖到完全看不见、也拖不回来。
- 存布局用 `onSizesChangeEnd`：拖动途中的每一帧都写存储会把主线程拖垮。

## 反模式

- 拿它做固定比例的两栏布局：多出来的拖动能力只会让用户误操作。
- 分隔条做得只有一两个像素宽：指针命中率极低。
