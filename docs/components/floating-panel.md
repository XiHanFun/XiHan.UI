# FloatingPanel 浮动面板 <Badge type="info" text="alpha" />

浮在页面上、可移动、可调整大小、可收拢与铺满的非模态面板。页面照常可读可点，面板停留在用户放置的位置。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/floating-panel" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/floating-panel.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/floating-panel" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/floating-panel" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/floating-panel.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点击触发器打开面板：标题栏的把手可以拖动，右下角可以改变大小，Esc 关闭

<XhDemo src="floating-panel/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="floating-panel"`：`root` · `trigger` · **`positioner`** · **`content`** · `header` · `title` · `drag-trigger` · `resize-trigger` · `window-state-trigger` · `close-trigger` · `body`

## 示例

### 三种形态

收拢只保留标题栏、铺满占满视口；已按下的按钮再按一次回到常规

<XhDemo src="floating-panel/02-window-state" />

### 八个尺寸把手

四条边加四个角；min-size 与 max-size 在拖动、推动、setDimensions 三处同时生效

<XhDemo src="floating-panel/03-resize" />

### 受控

open 与 position 都由外部持有：面板只报告意图，值写回后才变化

<XhDemo src="floating-panel/04-controlled" />

### 禁用

不可移动、不可改变尺寸、不可切换形态；关闭与开合照常，面板不会被锁定在屏幕上

<XhDemo src="floating-panel/05-disabled" />

### 文案本地化

把手与几个按钮只有图标，可及名一律经 translations

<XhDemo src="floating-panel/06-translations" />

## 设计指引

### 何时使用

- 长时间存在的辅助界面：调试面板、图层属性、进行中的通话、播放器。
- 用户需要一边查看页面一边修改内容，弹窗“必须先处理”的语气不合适。
- 位置和大小由用户决定并值得保存（`onPositionChange` / `onDimensionsChange` / `onWindowStateChange` 为此提供）。

### 何时不用

- 必须先处理完才能继续时，使用[对话框](./dialog)，它会捕获焦点、锁定背景。
- 从边缘滑出的整块面板使用[抽屉](./drawer)。
- 挂在某个元素旁、点击他处即收起时，使用[气泡卡片](./popover)。
- 只是把一块区域分成可拖动的几片时，使用[分栏](./splitter)。

### 特性

- 三种形态：常规、收拢（只留标题栏）、铺满（占满视口），由 `windowState` 一个值表达，可受控。
- 位置与尺寸各自成对（`position` / `defaultPosition`、`dimensions` / `defaultDimensions`），受控与非受控齐全。
- 八个调整尺寸的把手在节点上声明各自守护的边，西边与北边的把手会同时改变位置。
- 默认皮肤使用 M2 磨砂面：描边、顶边高光、投影与光学采样同出一份配方；高对比、减少透明、强制色与打印时原位收敛为实体面，标题栏按钮键盘聚焦时先铺实体隔离底。
- 键盘全程可达：拖拽把手上方向键平移、Shift 快速移动、Enter / Space 送回初始位置；调整把手上方向键推动边缘；Esc 关闭。
- `minSize` / `maxSize` 在每一处入口都生效：拖动、键盘推动、`setDimensions` 使用同一个夹取函数。
- 内建默认矩形在挂载时按视口夹取一次：先收尺寸再调位置，窄屏上面板与右侧的调整把手不会落在屏幕外。提供 `defaultPosition` / `defaultDimensions` 时按提供的值。

### 组合

- 标题栏放[按钮组](./button-group)承载三个形态按钮与关闭按钮。
- 正文放[滚动区域](./scroll-area)：面板缩小后正文自行滚动，不撑破面板。

### 最佳实践

- 位置与尺寸值得保存：拖动途中每帧都发回调，写入存储前先节流。
- 面板被移到视口外后，再点触发按钮不会把它移回：重新展开只是在同一坐标上再次展开。能收回的只有两条路径：焦点落在拖拽把手上按 Enter / Space（送回初始位置），或受控接管 `position` 并在打开时写回视口内的坐标。要求“永远拖不出屏幕”时使用后者。
- 面板关闭或被移走后，焦点会回到 `<body>`：本组件不接管焦点归还，作者应在关闭后把焦点送回触发按钮。
- 同屏多块面板时给它们不同的初始位置，否则会叠在一起，只有最上面一块可以点击。
- 位置不做视口夹取：组件不测量视口，`onPositionChange` 发出的坐标就是指针计算的原值。
- 面板的位置是视口坐标（`position: fixed` + `left` / `top`）。Vue 侧定位层会被移到统一的浮层落点，祖先的写法不影响；Web Components 侧不移动（角色节点写在哪就在哪），把 `<xh-floating-panel>` 放进带 `transform` / `filter` / `backdrop-filter` / `contain: paint` 的容器时，该祖先会成为包含块，面板会落到错误的位置；展开时元素会发出 `overlay.stacking-trap` 诊断。
- Web Components 侧“是否可移动”的属性名是 `panel-draggable` 而不是 `draggable`：`draggable` 是 HTML 全局属性，占用它会把宿主元素变成原生拖放源，`dragstart` 触发后浏览器派发 `pointercancel`，指针拖动立即中止。property 名同样是 `panelDraggable`；Vue 侧不受影响，仍是 `draggable`。

### 反模式

- 用它确认删除：非模态面板允许用户绕开，重要的确认必须阻断。
- 一屏挂五六块浮动面板：互相遮挡，用户需要先整理才能工作。
- 面板既不可关闭也不可收拢：浮层遮住的正是用户要看的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-floating-panel>` |
| Vue 组件 | `XhFloatingPanelBody` `XhFloatingPanelCloseTrigger` `XhFloatingPanelContent` `XhFloatingPanelDragTrigger` `XhFloatingPanelHeader` `XhFloatingPanelPositioner` `XhFloatingPanelResizeTrigger` `XhFloatingPanelRoot` `XhFloatingPanelTitle` `XhFloatingPanelTrigger` `XhFloatingPanelWindowStateTrigger` |
| 组合式函数 | `useFloatingPanel` |
| 状态机 | `floatingPanelMachine` |
| 皮肤 | `@xihan-ui/styles/floating-panel.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `position` | `FloatingPanelPosition` |  | 面板左上角坐标（px，相对视口）。提供即受控。 |
| `defaultPosition` | `FloatingPanelPosition` |  |  |
| `dimensions` | `FloatingPanelSize` |  | 面板尺寸（px）。提供即受控。 |
| `defaultDimensions` | `FloatingPanelSize` |  |  |
| `minSize` | `FloatingPanelSize` |  | 尺寸下限，默认 160×120。 |
| `maxSize` | `FloatingPanelSize` |  | 尺寸上限，未提供时不封顶。与 minSize 冲突时以 minSize 为准。 |
| `windowState` | `FloatingPanelWindowState` |  | 形态。提供即受控。 |
| `defaultWindowState` | `FloatingPanelWindowState` |  |  |
| `draggable` | `boolean` |  | 是否允许移动面板，默认 true；铺满形态下恒不可移动。 |
| `resizable` | `boolean` |  | 是否允许改尺寸，默认 true；只有常规形态下可以改尺寸。 |
| `disabled` | `boolean` |  | 禁用：不可移动、不可改尺寸、不可切换形态；开合与关闭不受影响。 |
| `translations` | `Partial<FloatingPanelTranslations>` |  |  |
| `onOpenChange` | `(details: FloatingPanelOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onPositionChange` | `(details: FloatingPanelPositionChangeDetails) => void` |  | 位置变化意图回调；拖动过程中连续发出。 |
| `onDimensionsChange` | `(details: FloatingPanelDimensionsChangeDetails) => void` |  | 尺寸变化意图回调；改尺过程中连续发出。 |
| `onWindowStateChange` | `(details: FloatingPanelWindowStateChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `FloatingPanelOpenChangeDetails` | 展开态变化；detail 为 `{ open: boolean }` |
| `position-change` | `FloatingPanelPositionChangeDetails` | 落点变化（拖动途中连续发出）；detail 为 `{ position: { x, y } }` |
| `dimensions-change` | `FloatingPanelDimensionsChangeDetails` | 尺寸变化（改尺途中连续发出）；detail 为 `{ dimensions: { width, height } }` |
| `window-state-change` | `FloatingPanelWindowStateChangeDetails` | 形态变化；detail 为 `{ windowState: 'default' \| 'minimized' \| 'maximized' }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFloatingPanelRoot` | `default` | `FloatingPanelRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `window-state-trigger` | 'on' \| 'off' |

以下名称仅用于内部状态机。

**状态**：`closed` · `open` · `open.dragging` · `open.idle` · `open.resizing`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `POSITION.SET` · `POSITION.NUDGE` · `DIMENSIONS.SET` · `DIMENSIONS.NUDGE` · `WINDOW_STATE.SET` · `DRAG.START` · `RESIZE.START` · `DRAG.MOVE` · `DRAG.END`

**判据**：`canDrag` · `canInteract` · `canResize` · `isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `windowState` | `FloatingPanelWindowState` |  |
| `position` | `FloatingPanelPosition` |  |
| `dimensions` | `FloatingPanelSize` |  |
| `dragging` | `boolean` | 正在被指针移动。 |
| `resizing` | `boolean` | 正在被指针改尺。 |
| `disabled` | `boolean` |  |
| `canDrag` | `boolean` | 当前是否可移动：作者允许、未禁用、且不是铺满形态。 |
| `canResize` | `boolean` | 当前是否可改尺寸：作者允许、未禁用、且是常规形态。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setPosition` | `(next: FloatingPanelPosition) => void` |  |
| `setDimensions` | `(next: FloatingPanelSize) => void` | 尺寸会被夹进 minSize / maxSize 之后才落定。 |
| `setWindowState` | `(next: FloatingPanelWindowState) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDragTriggerProps` | `() => T['button']` |  |
| `getResizeTriggerProps` | `(props: FloatingPanelResizeTriggerProps) => T['element']` | 把手是 role=separator 的元素而不是按钮：方向键推动边，激活键在这里没有语义。 |
| `getWindowStateTriggerProps` | `(props: FloatingPanelWindowStateTriggerProps) => T['button']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getBodyProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Escape` | focus in content, 面板展开 | 关闭面板；面板不是模态的，焦点在页面别处时这一键不归它管 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 把整块面板往该方向平移 10px |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 同上，一下走 50px |
| `Enter` / `Space` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 把面板送回初始落点（defaultPosition，未提供时是按视口夹取后的 24,24）；面板被拖出视口后依靠该键收回 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus on resize-trigger, 未禁用、resizable 开启且是常规形态 | 把这个把手守的那条边往该方向推 10px；推不动的那根轴上不拦键（上下把手放行左右键） |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | focus on resize-trigger, 未禁用、resizable 开启且是常规形态 | 同上，一下推 50px |

### ARIA

以下属性由 `connect` 生成。

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
| `resize-trigger` | `aria-valuenow` | String(Math.round(horizontal ? dimensions.width : dim… |
| `resize-trigger` | `aria-valuetext` | label.resizeValueText(dimensions) |
| `resize-trigger` | `role` | 'separator' |
| `window-state-trigger` | `aria-disabled` | 'true' \| 'false' |
| `window-state-trigger` | `aria-label` | label.windowStateTrigger(item.windowState) |
| `window-state-trigger` | `aria-pressed` | 'true' \| 'false' |
| `close-trigger` | `aria-label` | label.close |

- 面板是 `role="dialog"` 且 `aria-modal="false"`：它不夺取焦点，页面其余部分照常可达。
- 标题部件的 id 始终被 `aria-labelledby` 指向，因此面板必须写标题，否则读屏只能读出“对话框”。
- 拖拽把手、八个调整把手、三个形态按钮、关闭按钮都只有图标，可访问名称一律来自 `translations`。
- 八个调整把手是 `role="separator"`：`aria-valuenow` 报告它推动的轴的像素值（左右两侧与四角报宽度、上下两条报高度），`aria-valuetext` 把宽高一并读出。未提供 `maxSize` 时 `aria-valuemax` 缺席，播报以 `aria-valuetext` 为准。
- 拖拽把手是原生按钮，激活键（Enter / Space）有实际含义：把面板送回初始位置。
- 把手不可推动时使用 `aria-disabled` 而不是原生 `disabled`：后者会把它移出 Tab 序列，键盘用户无法得知此处可移动。调整把手同理始终带 `tabindex="0"`。
- 收拢时正文带 `hidden`，其中的可聚焦元素一并退出 Tab 序列；只压缩高度时读屏与 Tab 仍可进入。

## 样式参考

### 皮肤

`@xihan-ui/styles/floating-panel.css` 使用 `[data-scope="floating-panel"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-window-state` | context.get('windowState') |
| `header` | `data-dragging` | ''（条件成立时才出现） |
| `header` | `data-window-state` | context.get('windowState') |
| `drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `resize-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `resize-trigger` | `data-edge` | item.edge |
| `resize-trigger` | `data-resizing` | ''（条件成立时才出现） |
| `window-state-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `window-state-trigger` | `data-state` | 'on' \| 'off' |
| `window-state-trigger` | `data-target-window-state` | item.windowState |
| `body` | `data-window-state` | context.get('windowState') |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-floating-panel-action-bg-active` | `close-trigger`<br>`window-state-trigger` | `background` | `active`<br>`state=on` | `--xh-bg-subtle-active` | floating-panel 的 close-trigger、window-state-trigger 部件 background 覆盖槽。 |
| `--xh-floating-panel-action-bg-hover` | `close-trigger`<br>`window-state-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | floating-panel 的 close-trigger、window-state-trigger 部件 background 覆盖槽。 |
| `--xh-floating-panel-action-fg` | `close-trigger`<br>`window-state-trigger` | `color` | `default` | `--xh-material-frosted-fg-muted` | floating-panel 的 close-trigger、window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-fg-active` | `window-state-trigger` | `color` | `state=on` | `--xh-fg-default` | floating-panel 的 window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-fg-hover` | `close-trigger`<br>`window-state-trigger` | `color` | `hover` | `--xh-fg-default` | floating-panel 的 close-trigger、window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-radius` | `window-state-trigger` | `border-radius` | `default` | `--xh-shape-control` | floating-panel 的 window-state-trigger 部件 border-radius 覆盖槽。 |
| `--xh-floating-panel-action-size` | `window-state-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-sm` | floating-panel 的 window-state-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-floating-panel-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | floating-panel 的 content 部件 background 覆盖槽。 |
| `--xh-floating-panel-body-px` | `body` | `padding-inline` | `default` | `--xh-surface-px-sm` | floating-panel 的 body 部件 padding-inline 覆盖槽。 |
| `--xh-floating-panel-body-py` | `body` | `padding-block` | `default` | `--xh-surface-py-sm` | floating-panel 的 body 部件 padding-block 覆盖槽。 |
| `--xh-floating-panel-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | floating-panel 的 content 部件 border 覆盖槽。 |
| `--xh-floating-panel-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | floating-panel 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-floating-panel-close-size` | `close-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-sm` | floating-panel 的 close-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-floating-panel-corner-size` | `positioner`<br>`resize-trigger` | `height`<br>`width` | `edge=ne`<br>`edge=nw`<br>`edge=se`<br>`edge=sw` | `--xh-space-4` | floating-panel 的 positioner、resize-trigger 部件 height、width 覆盖槽。 |
| `--xh-floating-panel-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | floating-panel 的 content 部件 color 覆盖槽。 |
| `--xh-floating-panel-handle-size` | `positioner`<br>`resize-trigger` | `height`<br>`width` | `edge=e`<br>`edge=n`<br>`edge=s`<br>`edge=w` | `--xh-space-2` | floating-panel 的 positioner、resize-trigger 部件 height、width 覆盖槽。 |
| `--xh-floating-panel-header-bg` | `header` | `background` | `default` | `--xh-material-frosted-bg` | floating-panel 的 header 部件 background 覆盖槽。 |
| `--xh-floating-panel-header-border` | `header` | `border-block-end` | `default` | `--xh-material-frosted-separator` | floating-panel 的 header 部件 border-block-end 覆盖槽。 |
| `--xh-floating-panel-header-gap` | `header` | `gap` | `default` | `--xh-control-gap-sm` | floating-panel 的 header 部件 gap 覆盖槽。 |
| `--xh-floating-panel-header-px` | `header` | `padding-inline` | `default` | `--xh-space-3` | floating-panel 的 header 部件 padding-inline 覆盖槽。 |
| `--xh-floating-panel-header-py` | `header` | `padding-block` | `default` | `--xh-space-2` | floating-panel 的 header 部件 padding-block 覆盖槽。 |
| `--xh-floating-panel-icon-size` | `content`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | floating-panel 的 content、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-floating-panel-layer` | `positioner` | `z-index` | `default` | `--xh-layer-drawer` | floating-panel 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-floating-panel-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | floating-panel 的 content 部件 border-radius 覆盖槽。 |
| `--xh-floating-panel-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | floating-panel 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-floating-panel-title-fg` | `title` | `color` | `default` | `--xh-material-frosted-fg` | floating-panel 的 title 部件 color 覆盖槽。 |
| `--xh-floating-panel-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | floating-panel 的 title 部件 font-size 覆盖槽。 |
| `--xh-floating-panel-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` | floating-panel 的 title 部件 font-weight 覆盖槽。 |
| `--xh-floating-panel-trigger-bg` | `trigger` | `background` | `default` | `--xh-bg-surface` | floating-panel 的 trigger 部件 background 覆盖槽。 |
| `--xh-floating-panel-trigger-border` | `trigger` | `border` | `default` | `--xh-border-control` | floating-panel 的 trigger 部件 border 覆盖槽。 |
| `--xh-floating-panel-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | floating-panel 的 trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-trigger-h` | `trigger` | `block-size` | `default` | `--xh-control-h-md` | floating-panel 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-floating-panel-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-control-px-md` | floating-panel 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-floating-panel-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | floating-panel 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 面板的坐标、八个把手的方位、方向键推动的方向都是屏幕方位，不随 `dir` 翻转。`w` 把手在 RTL 下仍位于物理左侧，按右方向键面板仍向屏幕右侧移动；指针位移本身就是屏幕坐标，跟随 `dir` 翻转会让手的方向与面板的动向不一致。
- 因此皮肤中调整把手的规则刻意使用物理的 `inset` / `width` / `height`，连接层写的也是 `left` / `top`。不要改成 `inset-inline-*`：把手会跑到对侧，向右拖动却从左侧收缩。
- 面板内的正文照常跟随文档方向：标题栏的排布、正文的书写方向都由外部的 `dir` 决定，本组件不干预。
