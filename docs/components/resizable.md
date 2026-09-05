# 可调容器 <Badge type="info" text="resizable" />

一块能拖着改尺寸的区域，八条边都能推，键盘也能推。

## 何时使用

- 尺寸该由用户自己定：可调侧栏、可调卡片、编辑器里的预览区。
- 尺寸要记下来：`onDimensionsChangeEnd` 就是为此留的，一次调整只发一次。

## 何时不用

- 两块区域按比例分配、一块变大另一块必须变小：那是[分栏](./splitter)，它是守恒的。
- 只是表格的列宽：[表格](./table)自己就有改宽把手。
- 浮在页面上、可拖可调的窗口：用[浮动面板](./floating-panel)。

## 特性

- 八条边各一个把手，`edges` 可以只开放其中几条；没开放的边不显示把手。
- `minWidth` / `maxWidth` / `minHeight` / `maxHeight` 夹住范围，`aspectRatio` 锁宽高比，`step` 吸附到整数倍。
- 键盘按**屏幕方向**推：推东边时右键变宽、推西边时右键变窄，与拖动完全同义。Home / End 直接推到两端。
- 两个回调分工明确：`onDimensionsChange` 拖动途中连着发，`onDimensionsChangeEnd` 收尾才发一次，存尺寸用后者。
- **推西边与北边时容器的起点会动**，那段位移写成 root 的 `left` / `top`。皮肤已给
  `position: relative`，开箱即对——`relative` 的 `left` / `top` 是视觉位移、元素仍占原位，
  因此对边钉得住。把 root 改成 `static` 会让这两个方向只变尺寸不移位，看起来像是「拖左边、
  右边在长」；只用东 / 南 / 东南三向时没有这个前提。

## 示例

### 基础用法

八条边各一个把手；拖动改尺寸，Tab 到把手用方向键也能推

<XhDemo src="resizable/01-basic" />

### 只开放部分边

edges 决定哪几条边可调；没开放的边不显示把手

<XhDemo src="resizable/02-edges" />

### 约束

上下限夹住范围，aspectRatio 锁宽高比，step 吸附到整数倍

<XhDemo src="resizable/03-constraints" />

### 禁用

把手全部退出 Tab 序列，按下也不进调整

<XhDemo src="resizable/04-disabled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-resizable>` |
| Vue 组件 | `XhResizableHandle` `XhResizableRoot` |
| 组合式函数 | `useResizable` |
| 状态机 | `resizableMachine` |
| 皮肤 | `@xihan-ui/styles/resizable.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="resizable"`：**`root`** · `handle`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `dimensions` | `ResizableDimensions` |  | 受控尺寸。给了就由外面说了算，内部只发意图。 |
| `defaultDimensions` | `ResizableDimensions` |  |  |
| `minWidth` | `number` |  |  |
| `minHeight` | `number` |  |  |
| `maxWidth` | `number` |  |  |
| `maxHeight` | `number` |  |  |
| `aspectRatio` | `number` |  | 宽高比（宽 ÷ 高）。给了就锁死；四条边各按自己那一轴算另一轴，四个角以宽为准。 |
| `step` | `number` |  | 吸附步进：宽高各自落到最近的整数倍。 |
| `keyboardStep` | `number` |  | 方向键一次推多远（px），默认 8。 |
| `keyboardLargeStep` | `number` |  | 按住 Shift 时的步长（px），默认 40。 |
| `edges` | `ResizeEdge[]` |  | 允许哪几条边可调，默认八向全开。 只给东南两向就是「只能往右下角撑大」，那是文档流里最常见的形态。 |
| `disabled` | `boolean` |  |  |
| `dir` | `Direction` |  |  |
| `translations` | `Partial<ResizableTranslations>` |  |  |
| `onDimensionsChange` | `(details: ResizableDimensionsChangeDetails) => void` |  | 尺寸变化意图。拖动途中连着发。 |
| `onDimensionsChangeEnd` | `(details: ResizableDimensionsChangeEndDetails) => void` |  | 一次调整收尾发一次。存尺寸用它，别用 onDimensionsChange。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `dimensions-change` | `ResizableDimensionsChangeDetails` | 尺寸变化（拖动途中会连发）；detail 为 `{ dimensions }` |
| `dimensions-change-end` | `ResizableDimensionsChangeEndDetails` | 一次调整收尾发一次；detail 为 `{ dimensions, edge }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhResizableHandle` | `default` | — |  |
| `XhResizableRoot` | `default` | `ResizableRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `resizing`

**事件**：`RESIZE.START` · `RESIZE.MOVE` · `RESIZE.END` · `RESIZE.CANCEL` · `RESIZE.NUDGE` · `RESIZE.TO_BOUND` · `DIMENSIONS.SET`

**判据**：`canResize`

## connect API

`useResizable` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `dimensions` | `ResizableDimensions` |  |
| `offset` | `ResizableOffset` |  |
| `resizing` | `boolean` | 正在调整（拖动中）。键盘推一步不算。 |
| `activeEdge` | `ResizeEdge \| null` |  |
| `disabled` | `boolean` |  |
| `edgeEnabled` | `(edge: ResizeEdge) => boolean` | 这条边是否开放。 |
| `setDimensions` | `(dimensions: ResizableDimensions) => void` | 整份赋值：先过约束再落地。 |
| `getRootProps` | `() => T['element']` |  |
| `getHandleProps` | `(props: { edge: ResizeEdge }) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in handle, not disabled | 按屏幕方向推这条边一步（默认 8px）——推东边是变宽、推西边是变窄，与拖动同义。按的是屏幕方向，rtl 下两键不对调——那时改由「行尾侧」这条边落在屏幕左边来体现 |
| `ArrowLeft` / `ArrowUp` | focus in handle, not disabled | 往反方向推一步，规则同上 |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in handle, not disabled | 按大步长推（默认 40px） |
| `Home` | focus in handle, not disabled | 把这条边推到它眼下能到的最小尺寸 |
| `End` | focus in handle, not disabled | 推到最大尺寸；没给上限时不动 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | translations?.root |
| `root` | `role` | 'group' |
| `handle` | `aria-disabled` | 'false' \| 'true' |
| `handle` | `aria-label` | translations?.handle?.(edge) |
| `handle` | `aria-orientation` | 'horizontal' \| 'vertical' |
| `handle` | `aria-valuenow` | Math.round(edge === 'n' \|\| edge === 's' ? dimensions.… |
| `handle` | `role` | 'separator' |

## 样式

默认皮肤 `@xihan-ui/styles/resizable.css` 按部件选择：`[data-scope="resizable"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-edge` | context.get('activeEdge') |
| `root` | `data-resizing` | ''（条件成立时才出现） |
| `handle` | `data-disabled` | ''（条件成立时才出现） |
| `handle` | `data-edge` | edge |
| `handle` | `data-resizing` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-resizable-corner` · `--xh-resizable-grip`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

`edge` 说的是**逻辑方向**：`e` 是行尾侧，从右往左排版时它落在屏幕左边。机器把逻辑边翻成
物理边再算几何——翻的是边不是位移的正负，只翻位移会算对宽度却动错那一头。键盘那侧因此
不看文字方向：方向键按的恒是屏幕方向，与拖动完全同义。

## 组合

- 里面放[滚动区域](./scroll-area)，内容超出时自己滚。
