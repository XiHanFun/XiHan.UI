# Sortable 排序

通过拖拽或键盘重新排列内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/sortable" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/sortable.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/sortable" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/sortable" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/sortable.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

拖动任务调整顺序

<XhDemo src="sortable/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="sortable"`：**`root`** · **`item`** · `item-drag-trigger` · `drop-indicator` · `live-region`

## 示例

### 水平排序

调整标签顺序

<XhDemo src="sortable/02-horizontal" />

### 网格排序

在换行布局中排序

<XhDemo src="sortable/03-grid" />

### 禁用项目

固定单个项目的位置

<XhDemo src="sortable/04-disabled" />

## 设计指引

### 何时使用

- 调整任务、标签页、收藏项或表格列的顺序。
- 需要保存用户定义的排列顺序。

### 何时不用

- 数据规则决定顺序时使用普通排序。
- 跨容器拖拽需要使用更完整的拖放方案。

### 特性

- 支持垂直、水平和换行网格排序。
- 拖动时实时显示让位和落点；放下后项目从松手处带着松手速度落进新位置。
- 支持边缘自动滚动。
- `sort` 事件返回重排后的 `ids`。

### 组合

- 可在项目中放置独立拖拽手柄。
- 可与[表格](./table)组合为列排序面板。

### 最佳实践

- 拖拽手柄放在项目的固定位置，与项目内的其他控件分开。
- 拖放结束后立刻持久化 `ids`，失败时回滚并提示。
- 项目高度保持一致，让位动画才能表达落点。

### 反模式

- 用整个项目作为手柄，项目内的按钮与链接将无法点击。
- 拖动中改变列表长度或过滤条件。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-sortable>` |
| Vue 组件 | `XhSortableDropIndicator` `XhSortableItem` `XhSortableItemDragTrigger` `XhSortableLiveRegion` `XhSortableRoot` |
| 组合式函数 | `useSortable` |
| 状态机 | `sortableMachine` |
| 皮肤 | `@xihan-ui/styles/sortable.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ids` | `string[]` | 是 | 项的稳定标识，数组顺序即当前顺序。这是顺序的唯一真源。 DOM 中项的先后必须与它一致：几何按 DOM 测量，回调按它计算。 |
| `orientation` | `SortableAxis` |  | 排序沿哪根轴进行。换行网格使用 `both`。 |
| `disabled` | `boolean` |  |  |
| `activationDistance` | `number` |  | 按下之后移动多远才视为开始拖动，默认 5px。提供 0 表示按下即拖动。 |
| `autoScroll` | `boolean` |  | 拖到容器边缘时自动滚动，默认开启。 |
| `dir` | `Direction` |  |  |
| `translations` | `Partial<SortableTranslations>` |  |  |
| `onSort` | `(details: SortableSortDetails) => void` |  | 顺序变化意图。取消的一次不发出。 |
| `onDragStart` | `(details: SortableDragStartDetails) => void` |  |  |
| `onDragEnd` | `(details: SortableDragEndDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sort` | `SortableSortDetails` | 顺序变化；detail 为 `{ from, to, id, ids }`，其中 ids 已重排 |
| `drag-start` | `SortableDragStartDetails` | 拾起；detail 为 `{ id, from, mode }` |
| `drag-end` | `SortableDragEndDetails` | 收尾（含取消）；detail 为 `{ id, from, to, mode, canceled }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSortableItem` | `default` | `SortableItemSlotProps` |  |
| `XhSortableItemDragTrigger` | `default` | — |  |
| `XhSortableRoot` | `default` | `SortableRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhSortableItem` | `itemId` | `string` | 是 | 项标识，与 ids 中的值一一对应。 |
| `XhSortableItem` | `disabled` | `boolean` |  | 单独禁用该项。整份 disabled 在 Root 上，该项是项级的。 |
| `XhSortableItem` | `children` | `SlotChildren<SortableItemSlotProps>` |  |  |
| `XhSortableItemDragTrigger` | `itemId` | `string` | 是 | 项标识，与 ids 中的值一一对应。 |
| `XhSortableItemDragTrigger` | `disabled` | `boolean` |  | 单独禁用该项。整份 disabled 在 Root 上，该项是项级的。 |
| `XhSortableRoot` | `children` | `SlotChildren<SortableRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `pending` · `dragging`

**事件**：`ITEM.POINTER_DOWN` · `POINTER.MOVE` · `POINTER.END` · `POINTER.CANCEL` · `ITEM.PICKUP` · `KEY.MOVE` · `KEY.DROP` · `KEY.CANCEL` · `PRESS.START` · `PRESS.END`

**判据**：`canSort` · `passedActivation` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `dragging` | `boolean` | 正在拖（含键盘拖动）。 |
| `activeId` | `string \| null` |  |
| `from` | `number` |  |
| `to` | `number` |  |
| `mode` | `SortableMode \| null` |  |
| `items` | `SortableItemState[]` | 逐项的呈现状态，顺序与 `ids` 一致。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: SortableItemProps) => T['element']` |  |
| `getItemDragTriggerProps` | `(props: SortableItemProps) => T['element']` |  |
| `getDropIndicatorProps` | `() => T['element']` | 落点线：拖动中且落点与起点不同位时才存在，位置由内联样式给出。 |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in item-drag-trigger，未在拖动，not disabled | 拾起这一项，进入键盘拖动；播报它现在第几位、共几项、以及接下来能按什么 |
| `ArrowDown` / `ArrowRight` | 键盘拖动中 | 往后挪一位并播报新位置；已在末位时不动，也不回绕。竖直排布认上下键、水平排布认左右键，另一条轴上的方向键原样放行 |
| `ArrowUp` / `ArrowLeft` | 键盘拖动中 | 往前挪一位，规则同上；rtl 下左右两键对调，语义恒是「往前 / 往后」 |
| `Space` / `Enter` | 键盘拖动中 | 放下，按当前位置提交顺序并播报落点 |
| `Escape` | 键盘拖动中 | 取消，顺序回到拾起前，播报已取消与原位置 |
| `Enter` / `Space` | held on item-drag-trigger, not disabled | 按住期间把手投影 data-pressed，与指针 :active 同一副按压面；拾起转拖动那一下即撤下（拖动中的回执是 data-dragging），抬起或失焦撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | translations?.root |
| `root` | `role` | 'group' |
| `item-drag-trigger` | `aria-disabled` | 'true' \| 'false' |
| `item-drag-trigger` | `aria-label` | translations?.itemDragTrigger?.(name) |
| `item-drag-trigger` | `aria-pressed` | 'true' \| 'false' |
| `item-drag-trigger` | `aria-roledescription` | 'sortable' |
| `item-drag-trigger` | `role` | 'button' |
| `drop-indicator` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

- 空格拾取或放下，方向键移动，Escape 取消。
- `live-region` 会播报当前拖动位置。
- 拖动期间焦点保留在当前手柄。

## 样式参考

### 皮肤

`@xihan-ui/styles/sortable.css` 使用 `[data-scope="sortable"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `item` | `data-animating` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-dragging` | ''（条件成立时才出现） |
| `item` | `data-index` | String(item?.index ?? -1) |
| `item-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-xh-action-control` | '' |
| `item-drag-trigger` | `data-xh-action-display` | 'always' |
| `item-drag-trigger` | `data-xh-action-profile` | 'icon' |
| `item-drag-trigger` | `data-xh-action-size` | 'xs' |
| `item-drag-trigger` | `data-xh-action-variant` | 'ghost' |
| `drop-indicator` | `data-orientation` | props.orientation |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-sortable-drag-bg-active` | `item-drag-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | sortable 的 item-drag-trigger 部件 background-color 覆盖槽。 |
| `--xh-sortable-drag-bg-hover` | `item-drag-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | sortable 的 item-drag-trigger 部件 background-color 覆盖槽。 |
| `--xh-sortable-drag-fg` | `item-drag-trigger` | `color` | `default` | `--xh-fg-muted` | sortable 的 item-drag-trigger 部件 color 覆盖槽。 |
| `--xh-sortable-drag-fg-disabled` | `item-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | sortable 的 item-drag-trigger 部件 color 覆盖槽。 |
| `--xh-sortable-drag-fg-hover` | `item-drag-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | sortable 的 item-drag-trigger 部件 color 覆盖槽。 |
| `--xh-sortable-drag-grip-h` | `item-drag-trigger` | `block-size` | `empty` | `--xh-space-3` | sortable 的 item-drag-trigger 部件 block-size 覆盖槽。 |
| `--xh-sortable-drag-grip-w` | `item-drag-trigger` | `inline-size` | `empty` | `--xh-space-1` | sortable 的 item-drag-trigger 部件 inline-size 覆盖槽。 |
| `--xh-sortable-drag-icon-size` | `item-drag-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | sortable 的 item-drag-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-sortable-drag-radius` | `item-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` | sortable 的 item-drag-trigger 部件 border-radius 覆盖槽。 |
| `--xh-sortable-drag-size` | `item-drag-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | sortable 的 item-drag-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-sortable-drop-indicator-bg` | `drop-indicator` | `background` | `default` | `--xh-bg-brand` | sortable 的 drop-indicator 部件 background 覆盖槽。 |
| `--xh-sortable-drop-indicator-radius` | `drop-indicator` | `border-radius` | `default` | `--xh-shape-pill` | sortable 的 drop-indicator 部件 border-radius 覆盖槽。 |
| `--xh-sortable-drop-indicator-size` | `drop-indicator` | `block-size`<br>`inline-size` | `orientation=both`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` | sortable 的 drop-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-sortable-gap` | `root` | `gap` | `default` | `--xh-space-2` | sortable 的 root 部件 gap 覆盖槽。 |
| `--xh-sortable-item-opacity-dragging` | `item` | `opacity` | `dragging` | `0.9` | sortable 的 item 部件 opacity 覆盖槽。 |
| `--xh-sortable-item-shadow-dragging` | `item` | `box-shadow` | `dragging` | `--xh-elevation-lifted` | sortable 的 item 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换（见[动效规范](../design/motion#角色)）。

`box-shadow` · `opacity` · `transform` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：值由内核逐帧算出（`frameLoop`），皮肤里看不到这段。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
