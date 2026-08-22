# 浮动面板 <Badge type="info" text="floating-panel" />

一块浮在页面上、能搬走、能改大小、能收拢与铺满的非模态面板。页面照常可读可点，面板停在用户放它的地方。

## 何时使用

- 长时间挂着的辅助界面：调试面板、图层属性、正在进行的通话、播放器。
- 用户需要一边看页面一边改东西，弹窗那种"必须先处理完"的语气不合适。
- 位置和大小要由用户自己定，并且值得记下来（`onPositionChange` / `onSizeChange` / `onStageChange` 就是为此留的）。

## 何时不用

- 必须先处理完才能继续：用[对话框](./dialog)，它会陷住焦点、锁住背景。
- 从边上滑出的一整块面板：用[抽屉](./drawer)。
- 挂在某个元素旁边、点别处就收：用[气泡卡片](./popover)。
- 只是把一块区域分成可拖的几片：用[分栏](./splitter)。

## 特性

- 三种形态：常规、收拢（只留标题栏）、铺满（占满视口），由 `stage` 一个值表达，可受控。
- 位置与尺寸各自成对（`position` / `defaultPosition`、`size` / `defaultSize`），两态齐全。
- 八个改尺把手在节点上自报守的是哪条边，西边与北边的把手会同时改位置。
- 键盘全程可达：拖拽把手上方向键平移、Shift 快移、Enter / Space 送回初始落点；改尺把手上方向键推边；Esc 关闭。
- `minSize` / `maxSize` 在每一处入口都生效——拖、推、`setSize` 走的是同一个夹取函数。

## 示例

### 基础用法

点触发器打开面板：标题栏那条把手可以拖，右下角可以改大小，Esc 关闭

<XhDemo src="floating-panel/01-basic" />

### 三种形态

收拢只留标题栏、铺满占满视口；按着的那个钮再按一次回到常规

<XhDemo src="floating-panel/02-stage" />

### 八个改尺把手

四条边加四个角；min-size 与 max-size 在拖、推、setSize 三处同时生效

<XhDemo src="floating-panel/03-resize" />

### 受控

open 与 position 都交给外面握着：面板只报意图，值写回来才动

<XhDemo src="floating-panel/04-controlled" />

### 禁用

搬不动、改不了尺寸、切不了形态；关闭与开合照常，面板不会被锁死在屏幕上

<XhDemo src="floating-panel/05-disabled" />

### 文案本地化

把手与几个按钮只有图标，可及名一律走 translations

<XhDemo src="floating-panel/06-translations" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-floating-panel>` |
| Vue 组件 | `XhFloatingPanelBody` `XhFloatingPanelCloseTrigger` `XhFloatingPanelContent` `XhFloatingPanelDragTrigger` `XhFloatingPanelHeader` `XhFloatingPanelPositioner` `XhFloatingPanelResizeTrigger` `XhFloatingPanelRoot` `XhFloatingPanelStageTrigger` `XhFloatingPanelTitle` `XhFloatingPanelTrigger` |
| 组合式函数 | `useFloatingPanel` |
| 状态机 | `floatingPanelMachine` |
| 皮肤 | `@xihan-ui/styles/floating-panel.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="floating-panel"`：`root` · `trigger` · **`positioner`** · **`content`** · `header` · `title` · `drag-trigger` · `resize-trigger` · `stage-trigger` · `close-trigger` · `body`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `position` | `FloatingPanelPosition` |  | 面板左上角坐标（px，相对视口）。给定即受控。 |
| `defaultPosition` | `FloatingPanelPosition` |  |  |
| `size` | `FloatingPanelSize` |  | 面板尺寸（px）。给定即受控。 |
| `defaultSize` | `FloatingPanelSize` |  |  |
| `minSize` | `FloatingPanelSize` |  | 尺寸下限，默认 160×120。 |
| `maxSize` | `FloatingPanelSize` |  | 尺寸上限，不给即不封顶。与 minSize 冲突时以 minSize 为准。 |
| `stage` | `FloatingPanelStage` |  | 形态。给定即受控。 |
| `defaultStage` | `FloatingPanelStage` |  |  |
| `draggable` | `boolean` |  | 允不允许搬动面板，默认 true；铺满形态下恒不可搬。 |
| `resizable` | `boolean` |  | 允不允许改尺寸，默认 true；只有常规形态下才改得动。 |
| `disabled` | `boolean` |  | 禁用：搬不动、改不了尺寸、切不了形态；开合与关闭不受影响。 |
| `translations` | `Partial<FloatingPanelTranslations>` |  |  |
| `onOpenChange` | `(details: FloatingPanelOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `onPositionChange` | `(details: FloatingPanelPositionChangeDetails) => void` |  | 位置变化意图回调；拖动过程中会连续发很多次。 |
| `onSizeChange` | `(details: FloatingPanelSizeChangeDetails) => void` |  | 尺寸变化意图回调；改尺过程中会连续发很多次。 |
| `onStageChange` | `(details: FloatingPanelStageChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `FloatingPanelOpenChangeDetails` | 展开态变化；detail 为 `{ open: boolean }` |
| `position-change` | `FloatingPanelPositionChangeDetails` | 落点变化（拖动途中会连发）；detail 为 `{ position: { x, y } }` |
| `size-change` | `FloatingPanelSizeChangeDetails` | 尺寸变化（改尺途中会连发）；detail 为 `{ size: { width, height } }` |
| `stage-change` | `FloatingPanelStageChangeDetails` | 形态变化；detail 为 `{ stage: 'default' \| 'minimized' \| 'maximized' }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFloatingPanelRoot` | `default` | `FloatingPanelRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `stage-trigger` | 'on' \| 'off' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `open` · `open.dragging` · `open.idle` · `open.resizing`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `POSITION.SET` · `POSITION.NUDGE` · `SIZE.SET` · `SIZE.NUDGE` · `STAGE.SET` · `DRAG.START` · `RESIZE.START` · `DRAG.MOVE` · `DRAG.END`

**判据**：`canDrag` · `canInteract` · `canResize` · `isOpenControlled`

## connect API

`useFloatingPanel` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `stage` | `FloatingPanelStage` |  |
| `position` | `FloatingPanelPosition` |  |
| `size` | `FloatingPanelSize` |  |
| `dragging` | `boolean` | 正在被指针搬动。 |
| `resizing` | `boolean` | 正在被指针改尺。 |
| `disabled` | `boolean` |  |
| `canDrag` | `boolean` | 眼下搬不搬得动：作者允许、未禁用、且不是铺满形态。 |
| `canResize` | `boolean` | 眼下改不改得了尺寸：作者允许、未禁用、且是常规形态。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setPosition` | `(next: FloatingPanelPosition) => void` |  |
| `setSize` | `(next: FloatingPanelSize) => void` | 尺寸会被夹进 minSize / maxSize 之后才落地。 |
| `setStage` | `(next: FloatingPanelStage) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDragTriggerProps` | `() => T['button']` |  |
| `getResizeTriggerProps` | `(props: FloatingPanelResizeTriggerProps) => T['element']` | 把手是 role=separator 的元素而不是按钮：方向键推边，激活键在这里没有语义。 |
| `getStageTriggerProps` | `(props: FloatingPanelStageTriggerProps) => T['button']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getBodyProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Escape` | focus in content, 面板展开 | 关闭面板；面板不是模态的，焦点在页面别处时这一键不归它管 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 把整块面板往该方向平移 10px |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 同上，一下走 50px |
| `Enter` / `Space` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 把面板送回初始落点（defaultPosition，没给就是 24,24）；面板被拖出视口后靠这一键收回来 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus on resize-trigger, 未禁用、resizable 开启且是常规形态 | 把这个把手守的那条边往该方向推 10px；推不动的那根轴上不拦键（上下把手放行左右键） |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | focus on resize-trigger, 未禁用、resizable 开启且是常规形态 | 同上，一下推 50px |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `drag-trigger` | `aria-disabled` | 'false' \| 'true' |
| `drag-trigger` | `aria-label` | label.dragTrigger |
| `resize-trigger` | `aria-controls` | `content` 部件的 id |
| `resize-trigger` | `aria-disabled` | 'false' \| 'true' |
| `resize-trigger` | `aria-label` | label.resizeTrigger(item.edge) |
| `resize-trigger` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `resize-trigger` | `aria-valuemax` | String(Math.round(valueMax)) \| undefined |
| `resize-trigger` | `aria-valuemin` | String(Math.round(horizontal ? minSize.width : minSiz… |
| `resize-trigger` | `aria-valuenow` | String(Math.round(horizontal ? size.width : size.heig… |
| `resize-trigger` | `aria-valuetext` | label.resizeValueText(size) |
| `resize-trigger` | `role` | 'separator' |
| `stage-trigger` | `aria-disabled` | 'true' \| 'false' |
| `stage-trigger` | `aria-label` | label.stageTrigger(item.stage) |
| `stage-trigger` | `aria-pressed` | 'true' \| 'false' |
| `close-trigger` | `aria-label` | label.close |

- 面板是 `role="dialog"` 且 `aria-modal="false"`：它不夺走焦点，页面其余部分照常可达。
- 标题部件的 id 恒被 `aria-labelledby` 指向，因此**面板一定要写标题**，否则读屏只能念出"对话框"。
- 拖拽把手、八个改尺把手、三个形态按钮、关闭按钮都只有图标，可及名一律走 `translations`。
- 八个改尺把手是 `role="separator"`：`aria-valuenow` 报它推的那根轴的像素值（左右两侧与四角报宽度、上下两条报高度），`aria-valuetext` 把宽高一并念出来。不给 `maxSize` 时 `aria-valuemax` 缺席，播报以 `aria-valuetext` 为准。
- 拖拽把手是原生按钮，它的激活键（Enter / Space）有实义：把面板送回初始落点。按钮不响应自己的激活键是反模式。
- 把手在推不动时用 `aria-disabled` 而不是原生 `disabled`：后者会把它逐出 Tab 序列，键盘用户连"这里能搬"都读不到。改尺把手同理恒带 `tabindex="0"`。
- 收拢时正文带上 `hidden`，其中的可聚焦元素一并退出 Tab 序列——只压高度的话读屏与 Tab 照样进得去。

## 样式

默认皮肤 `@xihan-ui/styles/floating-panel.css` 按部件选择：`[data-scope="floating-panel"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-stage` | context.get('stage') |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `header` | `data-dragging` | ''（条件成立时才出现） |
| `header` | `data-stage` | context.get('stage') |
| `drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `resize-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `resize-trigger` | `data-edge` | item.edge |
| `resize-trigger` | `data-resizing` | ''（条件成立时才出现） |
| `stage-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `stage-trigger` | `data-state` | 'on' \| 'off' |
| `stage-trigger` | `data-target-stage` | item.stage |
| `body` | `data-stage` | context.get('stage') |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-floating-panel-action-bg-active` · `--xh-floating-panel-action-bg-hover` · `--xh-floating-panel-action-fg` · `--xh-floating-panel-action-fg-active` · `--xh-floating-panel-action-fg-hover` · `--xh-floating-panel-action-radius` · `--xh-floating-panel-action-size` · `--xh-floating-panel-bg` · `--xh-floating-panel-body-px` · `--xh-floating-panel-body-py` · `--xh-floating-panel-border` · `--xh-floating-panel-close-radius` · `--xh-floating-panel-close-size` · `--xh-floating-panel-corner-size` · `--xh-floating-panel-fg` · `--xh-floating-panel-handle-size` · `--xh-floating-panel-header-bg` · `--xh-floating-panel-header-border` · `--xh-floating-panel-header-gap` · `--xh-floating-panel-header-px` · `--xh-floating-panel-header-py` · `--xh-floating-panel-icon-size` · `--xh-floating-panel-layer` · `--xh-floating-panel-radius` · `--xh-floating-panel-shadow` · `--xh-floating-panel-title-fg` · `--xh-floating-panel-title-font-size` · `--xh-floating-panel-title-font-weight` · `--xh-floating-panel-trigger-bg` · `--xh-floating-panel-trigger-border` · `--xh-floating-panel-trigger-fg` · `--xh-floating-panel-trigger-h` · `--xh-floating-panel-trigger-px` · `--xh-floating-panel-trigger-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 面板的坐标、八个把手的方位、方向键推动的方向**都是屏幕方位，不随 `dir` 翻转**。`w` 把手在 RTL 下仍长在物理左侧，按右方向键面板仍往屏幕右边走——指针位移本来就是屏幕坐标，跟着 `dir` 翻会让手上的方向与面板的动向对不上。
- 因此皮肤里改尺把手那一段刻意写物理的 `inset` / `width` / `height`，连接层写的也是 `left` / `top`。**不要**把它们改成 `inset-inline-*`：把手会跑到对面，手往右拖却从左边收。
- 面板内的正文照常跟随文档方向：标题栏的排布、正文的书写方向都由外面的 `dir` 决定，本组件一个字都不管。

## 组合

- 标题栏里放[按钮组](./button-group)承载三个形态按钮与关闭按钮。
- 正文放[滚动区域](./scroll-area)：面板被改小后正文自己滚，而不是把面板撑破。

## 最佳实践

- 位置与尺寸值得存下来：拖动途中回调每帧都发，落存储前先节流。
- 面板被搬到视口外之后，**再点触发按钮不会把它挪回来**——重新展开只是在同一个坐标上再展开一次。真正能收回来的只有两条：焦点落在拖拽把手上按 Enter / Space（送回初始落点），或者受控接管 `position`、在打开时写回一个视口内的坐标。产品线要"永远拖不出屏幕"就得走后一条。
- 面板关闭或被搬走后，焦点会掉回 `<body>`：本组件不接管焦点归还，作者应在关闭后把焦点送回触发按钮。
- 同屏挂多块面板时给它们不同的初始落点，否则会叠成一摞、只有最上面那块点得到。
- 位置不做视口夹取：组件一次也不量视口，`onPositionChange` 里发出来的坐标就是指针算出来的原值。
- 面板的落位是视口坐标（`position: fixed` + `left` / `top`）。Vue 侧定位层会被搬到统一的浮层落点，祖先怎么写都不影响；**Web Components 侧搬不动**（角色节点作者写在哪就在哪），把 `<xh-floating-panel>` 放进带 `transform` / `filter` / `backdrop-filter` / `contain: paint` 的容器里，那个祖先会抢走包含块，面板会落到错误的位置——展开时元素会投一条 `overlay.stacking-trap` 诊断。
- Web Components 侧"能不能搬"这个开关的属性名是 `panel-draggable` 而不是 `draggable`：`draggable` 是 HTML 全局属性，占用它会把宿主元素变成原生拖放源，`dragstart` 一起浏览器就派 `pointercancel`，指针拖动当场中止。property 名同样是 `panelDraggable`；Vue 侧不受影响，仍是 `draggable`。

## 反模式

- 拿它当对话框用来确认删除：非模态面板允许用户绕开，重要的确认必须挡住去路。
- 一屏挂五六块浮动面板：它们互相遮挡，用户先要整理桌面才能干活。
- 把面板做成不可关闭也不可收拢：浮层挡住的正是用户要看的内容。
