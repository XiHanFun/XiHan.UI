# 分栏 <Badge type="info" text="splitter" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-splitter>` |
| Vue 组件 | `XhSplitterPanel` `XhSplitterResizeTrigger` `XhSplitterRoot` |
| 组合式函数 | `useSplitter` |
| 状态机 | `splitterMachine` |
| 皮肤 | `@xihan-ui/styled/splitter.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="splitter"`：**`root`** · **`panel`** · **`resize-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `number[]` |  | 每块面板的百分比。给定即受控：内部不再自改，只发 onSizeChange。 |
| `defaultSize` | `number[]` |  | 非受控初值；不给就按面板数等分。 |
| `panels` | `SplitterPanelProps[]` |  | 逐块的约束；数组长度同时决定面板块数。 |
| `orientation` | `Orientation` |  | 面板的排布轴，默认 horizontal（并排，拖左右）；vertical 是上下堆叠，拖上下。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调水平排布下的左右两键与指针位移的正负。 |
| `disabled` | `boolean` |  | 禁用：分隔条退出 Tab 序列、拖不动也推不动。 |
| `step` | `number` |  | 方向键的步长（百分比），默认 1。 |
| `largeStep` | `number` |  | Shift + 方向键的步长（百分比），默认 10。 |
| `onSizeChange` | `(details: SplitterSizeChangeDetails) => void` |  | 每次尺寸变化都发；拖动过程中会连续发很多次。 |
| `onSizeChangeEnd` | `(details: SplitterSizeChangeEndDetails) => void` |  | 只在一次操作结束时发一次，适合拿来存布局。 |

## 状态机

**状态**：`idle` · `dragging`

**事件**：`SIZE.SET` · `BOUNDARY.STEP` · `BOUNDARY.TO_MIN` · `BOUNDARY.TO_MAX` · `BOUNDARY.SET` · `BOUNDARY.FOCUS` · `PANEL.COLLAPSE` · `PANEL.EXPAND` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END`

**判据**：`canResize`

## connect API

`useSplitter` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `size` | `number[]` |  |
| `panels` | `SplitterPanelState[]` |  |
| `dragging` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setSize` | `(next: number[]) => void` | 整份赋值：逐块夹进约束、总和归位到 100 之后才落地。 |
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
