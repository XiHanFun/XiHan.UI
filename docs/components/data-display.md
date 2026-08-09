# 数据展示

把已有数据摆出来的组件，以及它们的容器与占位形态。

本页 10 个组件：表格（`table`）、树（`tree`）、虚拟滚动（`virtualizer`）、滚动区域（`scroll-area`）、手风琴（`accordion`）、折叠区域（`collapsible`）、走马灯（`carousel`）、分栏（`splitter`）、骨架屏（`skeleton`）、空状态（`empty-state`）。

每个组件三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。部件（part）名即 `data-part` 属性值，也是皮肤的选择器；加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

---

## 表格 <Badge type="info" text="table" /> {#table}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-table>` |
| Vue 组件 | `XhTableBody` `XhTableCaption` `XhTableCell` `XhTableColumnHeader` `XhTableEmptyState` `XhTableExpandTrigger` `XhTableExpandedRow` `XhTableFooter` `XhTableHeader` `XhTableLoadingState` `XhTableRoot` `XhTableRow` `XhTableRowSelectTrigger` `XhTableSelectAllTrigger` `XhTableSortTrigger` |
| 组合式函数 | `useTable` |
| 状态机 | `tableMachine` |
| 皮肤 | `@xihan-ui/styled/table.css` |

**解剖**（`data-scope="table"`，加粗为必备部件）

**`root`** · `header` · **`body`** · `footer` · `row` · `column-header` · `cell` · `caption` · `select-all-trigger` · `row-select-trigger` · `sort-trigger` · `expand-trigger` · `expanded-row` · `empty-state` · `loading-state`

**键盘**（规格出处：[W3C APG · grid 模式](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the table body | 表体只占一个 Tab 位：焦点进入锚点行，无锚点时先落 body 再由它转投；再按一次 Tab 整体离开表体 |
| `ArrowDown` | focus in table body | 焦点移到下一个可见数据行（禁用行跳过；详情行不是落点；loop 默认关，末行不回绕） |
| `ArrowUp` | focus in table body | 焦点移到上一个可见数据行（禁用行跳过；loop 默认关，首行不回绕） |
| `Home` | focus in table body | 焦点移到首个可见数据行 |
| `End` | focus in table body | 焦点移到末个可见数据行 |
| `Space` | focus on row, selectionMode 非 none 且该行未禁用 | 切换焦点行的选中（单选替换、复选增删）；选不动时不吞这个键，页面照常滚动 |
| `ArrowRight` | focus on 可展开且收起的行（dir=rtl 时改由 ArrowLeft 承担） | 就地展开当前行，焦点不动；不可展开、已展开或禁用的行上什么都不做且不吞键 |
| `ArrowLeft` | focus on 可展开且已展开的行（dir=rtl 时改由 ArrowRight 承担） | 就地收起当前行，焦点不动；其余情形什么都不做且不吞键 |
| `Enter` / `Space` | focus on sort-trigger, 该列 sortable | 排序方向按 升序 → 降序 → 不排序 循环；按住 Shift 是追加到排序链而不是替换整条链 |
| `Enter` / `Space` | focus on select-all-trigger, selectionMode=multiple | 当前可选行全选中就整段清空，否则整段选上；三态由 aria-checked 报出（半选为 mixed） |

---

## 树 <Badge type="info" text="tree" /> {#tree}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tree>` |
| Vue 组件 | `XhTreeBranch` `XhTreeBranchContent` `XhTreeBranchControl` `XhTreeBranchIndicator` `XhTreeBranchText` `XhTreeBranchTrigger` `XhTreeItem` `XhTreeItemIndicator` `XhTreeItemText` `XhTreeLabel` `XhTreeRoot` `XhTreeTree` |
| 组合式函数 | `useTree` |
| 状态机 | `treeMachine` |
| 皮肤 | `@xihan-ui/styled/tree.css` |

**解剖**（`data-scope="tree"`，加粗为必备部件）

`root` · `label` · **`tree`** · **`item`** · `item-indicator` · `item-text` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content`

**键盘**（规格出处：[W3C APG · treeview 模式](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction)）

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

---

## 虚拟滚动 <Badge type="info" text="virtualizer" /> {#virtualizer}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-virtualizer>` |
| Vue 组件 | `XhVirtualizerContent` `XhVirtualizerItem` `XhVirtualizerRoot` `XhVirtualizerViewport` |
| 组合式函数 | `useVirtualizer` |
| 状态机 | `virtualizerMachine` |
| 皮肤 | `@xihan-ui/styled/virtualizer.css` |

**解剖**（`data-scope="virtualizer"`，加粗为必备部件）

**`root`** · **`viewport`** · **`content`** · `item`

**键盘**（规格出处：[WCAG 2.1 技术 G202](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 滚动区域 <Badge type="info" text="scroll-area" /> {#scroll-area}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-scroll-area>` |
| Vue 组件 | `XhScrollAreaContent` `XhScrollAreaCorner` `XhScrollAreaRoot` `XhScrollAreaScrollbar` `XhScrollAreaThumb` `XhScrollAreaViewport` |
| 组合式函数 | `useScrollArea` |
| 状态机 | `scrollAreaMachine` |
| 皮肤 | `@xihan-ui/styled/scroll-area.css` |

**解剖**（`data-scope="scroll-area"`，加粗为必备部件）

**`root`** · **`viewport`** · **`content`** · `scrollbar` · `thumb` · `corner`

**键盘**（规格出处：[WCAG 2.1 技术 G202](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 焦点走到滚动区 | 视口带 tabindex=0，键盘用户能停在滚动区上；组件只在这一处动过 Tab 序列 |
| `PageUp` / `PageDown` | focus in viewport | 按视口高度翻页滚动；组件不监听、不拦截 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus in viewport | 逐行/逐列滚动；组件不监听、不拦截 |
| `Home` / `End` | focus in viewport | 滚到内容两端；组件不监听、不拦截 |
| `Space` / `Shift+Space` | focus in viewport | 整屏翻页；组件不监听、不拦截 |

---

## 手风琴 <Badge type="info" text="accordion" /> {#accordion}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-accordion>` |
| Vue 组件 | `XhAccordionContent` `XhAccordionHeader` `XhAccordionIndicator` `XhAccordionItem` `XhAccordionRoot` `XhAccordionTrigger` |
| 组合式函数 | `useAccordion` |
| 状态机 | `accordionMachine` |
| 皮肤 | `@xihan-ui/styled/accordion.css` |

**解剖**（`data-scope="accordion"`，加粗为必备部件）

`root` · `item` · `header` · **`trigger`** · **`content`** · `indicator`

**键盘**（规格出处：[W3C APG · accordion 模式](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起该条目的 content |
| `ArrowDown` / `ArrowRight` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到下一个 trigger，末条不回绕 |
| `ArrowUp` / `ArrowLeft` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到上一个 trigger，首条不回绕 |
| `Home` | focus in trigger | 焦点移到首个 trigger |
| `End` | focus in trigger | 焦点移到末个 trigger |
| `Tab` / `Shift+Tab` | focus in trigger | 按文档序进出：每个 trigger 都是独立 Tab 停靠点，无 roving tabindex |

---

## 折叠区域 <Badge type="info" text="collapsible" /> {#collapsible}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-collapsible>` |
| Vue 组件 | `XhCollapsibleContent` `XhCollapsibleRoot` `XhCollapsibleTrigger` |
| 组合式函数 | `useCollapsible` |
| 状态机 | `collapsibleMachine` |
| 皮肤 | `@xihan-ui/styled/collapsible.css` |

**解剖**（`data-scope="collapsible"`，加粗为必备部件）

`root` · `trigger` · **`content`**

**键盘**（规格出处：[W3C APG · disclosure 模式](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起 content |

---

## 走马灯 <Badge type="info" text="carousel" /> {#carousel}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-carousel>` |
| Vue 组件 | `XhCarouselIndicator` `XhCarouselIndicatorGroup` `XhCarouselItem` `XhCarouselItemGroup` `XhCarouselNextTrigger` `XhCarouselPrevTrigger` `XhCarouselRoot` `XhCarouselViewport` |
| 组合式函数 | `useCarousel` |
| 状态机 | `carouselMachine` |
| 皮肤 | `@xihan-ui/styled/carousel.css` |

**解剖**（`data-scope="carousel"`，加粗为必备部件）

**`root`** · **`viewport`** · **`item-group`** · `item` · `prev-trigger` · `next-trigger` · `indicator-group` · `indicator`

**键盘**（规格出处：[W3C APG · carousel 模式](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | orientation=horizontal，焦点在轮播内 | 翻到下一页；rtl 下反向（走上一页） |
| `ArrowLeft` | orientation=horizontal，焦点在轮播内 | 翻到上一页；rtl 下反向（走下一页） |
| `ArrowDown` | orientation=vertical，焦点在轮播内 | 翻到下一页；横轨下不接管，放行给页面滚动 |
| `ArrowUp` | orientation=vertical，焦点在轮播内 | 翻到上一页；横轨下不接管，放行给页面滚动 |
| `Home` | 焦点在轮播内 | 跳到第一页 |
| `End` | 焦点在轮播内 | 跳到最后一页 |
| `Enter` / `Space` | 焦点在上一张 / 下一张按钮上 | 翻一页；由原生按钮的激活行为负责 |
| `Enter` / `Space` | 焦点在指示点上 | 跳到该指示点对应的页；由原生按钮的激活行为负责 |
| `Tab` / `Shift+Tab` | 任意时刻 | 在两端按钮与各指示点之间逐个停靠；到端点后禁用的按钮自动脱序 |
| `方向键` | 焦点在幻灯片内的输入控件上 | 不接管：交还给控件自己做光标移动 |

---

## 分栏 <Badge type="info" text="splitter" /> {#splitter}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-splitter>` |
| Vue 组件 | `XhSplitterPanel` `XhSplitterResizeTrigger` `XhSplitterRoot` |
| 组合式函数 | `useSplitter` |
| 状态机 | `splitterMachine` |
| 皮肤 | `@xihan-ui/styled/splitter.css` |

**解剖**（`data-scope="splitter"`，加粗为必备部件）

**`root`** · **`panel`** · **`resize-trigger`**

**键盘**（规格出处：[W3C APG · windowsplitter 模式](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in resize-trigger, not disabled | 把这条分隔条前面那块面板按 step（默认 1%）撑大；水平排布认左右键、竖直排布认上下键，另一条轴上的方向键原样放行 |
| `ArrowLeft` / `ArrowUp` | focus in resize-trigger, not disabled | 按 step 压小，同上的轴向规则；rtl 下左右两键对调，语义恒是"撑大 / 压小前一块" |
| `Shift+ArrowRight` / `Shift+ArrowDown` | focus in resize-trigger, not disabled | 按 largeStep（默认 10%）撑大 |
| `Shift+ArrowLeft` / `Shift+ArrowUp` | focus in resize-trigger, not disabled | 按 largeStep 压小 |
| `Home` | focus in resize-trigger, not disabled | 把前一块面板收到它眼下能到的最小尺寸 |
| `End` | focus in resize-trigger, not disabled | 把前一块面板撑到它眼下能到的最大尺寸 |
| `Enter` | focus in resize-trigger 且它调整的面板 collapsible，not disabled | 折叠 / 展开该面板；展开回到折叠前的尺寸。面板不可折叠时不接这个键 |

---

## 骨架屏 <Badge type="info" text="skeleton" /> {#skeleton}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-skeleton>` |
| Vue 组件 | `XhSkeletonBone` `XhSkeletonRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/skeleton.css` |

**解剖**（`data-scope="skeleton"`，加粗为必备部件）

**`root`** · **`bone`**

**键盘**（规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 空状态 <Badge type="info" text="empty-state" /> {#empty-state}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-empty-state>` |
| Vue 组件 | `XhEmptyStateAction` `XhEmptyStateDescription` `XhEmptyStateIcon` `XhEmptyStateRoot` `XhEmptyStateTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/empty-state.css` |

**解剖**（`data-scope="empty-state"`，加粗为必备部件）

**`root`** · `icon` · `title` · `description` · `action`

**键盘**（规格出处：[W3C APG · live-regions 实践](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
