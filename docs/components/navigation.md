# 导航

在页面之间、或页面内部移动位置的组件。菜单族（`menu` / `menubar` / `context-menu` / `navigation-menu`）共用同一套条目导航与 typeahead 原语，区别只在触发方式与层级结构。

本页 11 个组件：菜单（`menu`）、菜单栏（`menubar`）、右键菜单（`context-menu`）、导航菜单（`navigation-menu`）、标签页（`tabs`）、步骤条（`steps`）、分页（`pagination`）、面包屑（`breadcrumb`）、锚点（`anchor`）、工具栏（`toolbar`）、引导（`tour`）。

每个组件三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。部件（part）名即 `data-part` 属性值，也是皮肤的选择器；加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

---

## 菜单 <Badge type="info" text="menu" /> {#menu}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menu>` |
| Vue 组件 | `XhMenuArrow` `XhMenuContent` `XhMenuItem` `XhMenuPositioner` `XhMenuRoot` `XhMenuSeparator` `XhMenuTrigger` |
| 组合式函数 | `useMenu` |
| 状态机 | `menuMachine` |
| 皮肤 | `@xihan-ui/styled/menu.css` |

**解剖**（`data-scope="menu"`，加粗为必备部件）

**`trigger`** · `positioner` · **`content`** · **`item`** · `separator` · `arrow`

**键盘**（规格出处：[W3C APG · menu-button 模式](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` / `ArrowDown` | focus in trigger | 展开菜单并把焦点落到首个可用条目 |
| `ArrowUp` | focus in trigger | 展开菜单并把焦点落到末个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到首个可用条目 |
| `End` | open, focus in content | 焦点移到末个可用条目 |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并关闭菜单，焦点归还 trigger |
| `Escape` | open | 关闭菜单并把焦点归还 trigger |
| `Tab` / `Shift+Tab` | open | 关闭菜单，焦点不归还 trigger，按 Tab 序列自然离开 |

---

## 菜单栏 <Badge type="info" text="menubar" /> {#menubar}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menubar>` |
| Vue 组件 | `XhMenubarContent` `XhMenubarGroup` `XhMenubarGroupLabel` `XhMenubarItem` `XhMenubarItemIndicator` `XhMenubarItemText` `XhMenubarPositioner` `XhMenubarRoot` `XhMenubarSeparator` `XhMenubarTrigger` |
| 组合式函数 | `useMenubar` |
| 状态机 | `menubarMachine` |
| 皮肤 | `@xihan-ui/styled/menubar.css` |

**解剖**（`data-scope="menubar"`，加粗为必备部件）

**`root`** · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `separator` · `group` · `group-label`

**键盘**（规格出处：[W3C APG · menubar 模式](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | focus in trigger, horizontal | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去 |
| `ArrowLeft` | focus in trigger, horizontal | 焦点移到上一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去 |
| `Home` | focus in trigger | 焦点移到首个可用 trigger |
| `End` | focus in trigger | 焦点移到末个可用 trigger |
| `ArrowDown` / `Enter` / `Space` | focus in trigger, horizontal | 展开本项的菜单；方向键入口把焦点落到首个可用条目，Enter/Space 让焦点留在 trigger 上 |
| `ArrowUp` | focus in trigger, horizontal | 展开本项的菜单并把焦点落到末个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到本张菜单的首个可用条目 |
| `End` | open, focus in content | 焦点移到本张菜单的末个可用条目 |
| `ArrowRight` / `ArrowLeft` | open, focus in content | 切到相邻菜单并保持展开，焦点落到那一项的 trigger 上 |
| `a-z` / `0-9` | open, focus in content | 连打检索：焦点跳到首字母匹配的条目（同字符连打则在候选间轮换） |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并收起菜单，焦点归还 trigger |
| `Escape` | open | 收起菜单并把焦点留在 trigger 上 |
| `Tab` / `Shift+Tab` | open | 收起菜单，焦点不被抢回 trigger，按 Tab 序列自然离开 |

---

## 右键菜单 <Badge type="info" text="context-menu" /> {#context-menu}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-context-menu>` |
| Vue 组件 | `XhContextMenuArrow` `XhContextMenuContent` `XhContextMenuGroup` `XhContextMenuGroupLabel` `XhContextMenuItem` `XhContextMenuItemIndicator` `XhContextMenuItemText` `XhContextMenuPositioner` `XhContextMenuRoot` `XhContextMenuSeparator` `XhContextMenuTrigger` |
| 组合式函数 | `useContextMenu` |
| 状态机 | `contextMenuMachine` |
| 皮肤 | `@xihan-ui/styled/context-menu.css` |

**解剖**（`data-scope="context-menu"`，加粗为必备部件）

`root` · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `separator` · `group` · `group-label` · `arrow`

**键盘**（规格出处：[W3C APG · menu 模式](https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ContextMenu` / `Shift+F10` | focus in trigger | 在触发区起始角展开菜单并把焦点落到首个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到首个可用条目 |
| `End` | open, focus in content | 焦点移到末个可用条目 |
| `单个可打印字符` | open, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不选中它 |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并关闭菜单，焦点归还触发区 |
| `Escape` | open | 关闭菜单并把焦点归还触发区 |
| `Tab` / `Shift+Tab` | open | 关闭菜单，焦点不归还触发区，按 Tab 序列自然离开 |

---

## 导航菜单 <Badge type="info" text="navigation-menu" /> {#navigation-menu}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-navigation-menu>` |
| Vue 组件 | `XhNavigationMenuContent` `XhNavigationMenuIndicator` `XhNavigationMenuItem` `XhNavigationMenuLink` `XhNavigationMenuList` `XhNavigationMenuRoot` `XhNavigationMenuTrigger` `XhNavigationMenuViewport` |
| 组合式函数 | `useNavigationMenu` |
| 状态机 | `navigationMenuMachine` |
| 皮肤 | `@xihan-ui/styled/navigation-menu.css` |

**解剖**（`data-scope="navigation-menu"`，加粗为必备部件）

**`root`** · **`list`** · **`item`** · `trigger` · `content` · **`link`** · `indicator` · `viewport`

**键盘**（规格出处：[W3C APG · disclosure 模式](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in trigger, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；随后的自动展开走 delayDuration |
| `ArrowLeft` / `ArrowUp` | focus in trigger, 按键与 orientation 同轴 | 焦点移到上一个 trigger |
| `Home` | focus in trigger | 焦点移到首个可停留 trigger |
| `End` | focus in trigger | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 立即展开对应面板（不走 delayDuration）；面板是自动弹出来的那一次不收起，再按一次才收起 |
| `Escape` | open | 收起面板并把焦点归还对应 trigger；静默窗口内这一次归还不会把面板重新弹出来 |
| `Tab` / `Shift+Tab` | open, focus in trigger | 走进展开的面板：面板就在 trigger 之后，收起的面板带 hidden 因而被整个跳过 |

---

## 标签页 <Badge type="info" text="tabs" /> {#tabs}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tabs>` |
| Vue 组件 | `XhTabsContent` `XhTabsList` `XhTabsRoot` `XhTabsTrigger` |
| 组合式函数 | `useTabs` |
| 状态机 | `tabsMachine` |
| 皮肤 | `@xihan-ui/styled/tabs.css` |

**解剖**（`data-scope="tabs"`，加粗为必备部件）

`root` · **`list`** · **`trigger`** · **`content`**

**键盘**（规格出处：[W3C APG · tabs 模式](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；automatic 模式顺带切换选中 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个 trigger；automatic 模式顺带切换选中 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 把选中切到焦点所在 trigger（manual 模式的确认键） |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底 |

---

## 步骤条 <Badge type="info" text="steps" /> {#steps}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-steps>` |
| Vue 组件 | `XhStepsContent` `XhStepsDescription` `XhStepsIndicator` `XhStepsItem` `XhStepsList` `XhStepsRoot` `XhStepsSeparator` `XhStepsTitle` `XhStepsTrigger` |
| 组合式函数 | `useSteps` |
| 状态机 | `stepsMachine` |
| 皮肤 | `@xihan-ui/styled/steps.css` |

**解剖**（`data-scope="steps"`，加粗为必备部件）

**`root`** · **`list`** · **`item`** · **`trigger`** · `indicator` · `title` · `description` · `separator` · `content`

**键盘**（规格出处：[W3C APG · tabs 模式](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个可停留 trigger（禁用与 linear 未解锁的跳过，尽头不回绕）；步序不变 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个可停留 trigger；步序不变 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, 未禁用且已解锁 | 把当前步切到焦点所在的那一步 |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底 |

---

## 分页 <Badge type="info" text="pagination" /> {#pagination}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pagination>` |
| Vue 组件 | `XhPaginationEllipsis` `XhPaginationItem` `XhPaginationNextTrigger` `XhPaginationPrevTrigger` `XhPaginationRoot` |
| 组合式函数 | `usePagination` |
| 状态机 | `paginationMachine` |
| 皮肤 | `@xihan-ui/styled/pagination.css` |

**解剖**（`data-scope="pagination"`，加粗为必备部件）

**`root`** · `prev-trigger` · `next-trigger` · **`item`** · `ellipsis`

**键盘**（规格出处：[W3C APG · button 模式](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in item | 跳到该页码（原生按钮激活，平台把按键翻成 click） |
| `Enter` / `Space` | focus in prev-trigger, 非首页 | 回上一页；首页时按钮是原生 disabled，焦点根本落不上去 |
| `Enter` / `Space` | focus in next-trigger, 非末页 | 进下一页；末页时按钮是原生 disabled |
| `Tab` / `Shift+Tab` | focus in root | 逐个走过每个可用按钮——分页不做 roving tabindex，用户要能 Tab 到某一页再确认；禁用的首尾按钮自动脱序 |

---

## 面包屑 <Badge type="info" text="breadcrumb" /> {#breadcrumb}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-breadcrumb>` |
| Vue 组件 | `XhBreadcrumbEllipsis` `XhBreadcrumbItem` `XhBreadcrumbLink` `XhBreadcrumbList` `XhBreadcrumbRoot` `XhBreadcrumbSeparator` |
| 组合式函数 | `useBreadcrumb` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/breadcrumb.css` |

**解剖**（`data-scope="breadcrumb"`，加粗为必备部件）

**`root`** · **`list`** · **`item`** · **`link`** · `separator` · `ellipsis`

**键盘**（规格出处：[W3C APG · breadcrumb 模式](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link, 非当前页 | 跟随链接（原生 &lt;a href&gt; 的激活行为，面包屑自己不监听按键） |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过可点的链接；面包屑不做 roving tabindex，当前页那条带 tabindex=-1 自动脱序 |

---

## 锚点 <Badge type="info" text="anchor" /> {#anchor}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-anchor>` |
| Vue 组件 | `XhAnchorIndicator` `XhAnchorItem` `XhAnchorLink` `XhAnchorList` `XhAnchorRoot` |
| 组合式函数 | `useAnchor` |
| 状态机 | `anchorMachine` |
| 皮肤 | `@xihan-ui/styled/anchor.css` |

**解剖**（`data-scope="anchor"`，加粗为必备部件）

**`root`** · **`list`** · **`item`** · **`link`** · `indicator`

**键盘**（规格出处：[W3C APG · landmarks 模式](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link | 跳到目标区块：smooth 关时由原生 &lt;a href="#id"&gt; 跳转，开时组件拦下并平滑滚动（两种情况都当场把激活项切过去，不等观察器） |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过目录里的链接；锚点导航不做 roving tabindex，每一条都是独立的 Tab 停靠点 |

---

## 工具栏 <Badge type="info" text="toolbar" /> {#toolbar}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toolbar>` |
| Vue 组件 | `XhToolbarGroup` `XhToolbarItem` `XhToolbarRoot` `XhToolbarSeparator` |
| 组合式函数 | `useToolbar` |
| 状态机 | `toolbarMachine` |
| 皮肤 | `@xihan-ui/styled/toolbar.css` |

**解剖**（`data-scope="toolbar"`，加粗为必备部件）

**`root`** · `group` · **`item`** · `separator`

**键盘**（规格出处：[W3C APG · toolbar 模式](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | roving tabindex（恒开） | 整条只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投给第一个可停留条目 |
| `ArrowRight` / `ArrowDown` | 焦点在条内且未整条禁用；横排收 ArrowRight、竖排收 ArrowDown | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | 焦点在条内且未整条禁用；横排收 ArrowLeft、竖排收 ArrowUp | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowRight 承担 |
| `Home` | 焦点在条内且未整条禁用 | 焦点移到首个可停留条目 |
| `End` | 焦点在条内且未整条禁用 | 焦点移到末个可停留条目 |
| `交叉轴的两个方向键` | 焦点在条内（横排按上下、竖排按左右） | 不归工具条管：原样放行给页面滚动与读屏，绝不 preventDefault |

---

## 引导 <Badge type="info" text="tour" /> {#tour}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tour>` |
| Vue 组件 | `XhTourArrow` `XhTourBackdrop` `XhTourCloseTrigger` `XhTourContent` `XhTourDescription` `XhTourNextTrigger` `XhTourPositioner` `XhTourPrevTrigger` `XhTourProgressText` `XhTourRoot` `XhTourSkipTrigger` `XhTourSpotlight` `XhTourTitle` |
| 组合式函数 | `useTour` |
| 状态机 | `tourMachine` |
| 皮肤 | `@xihan-ui/styled/tour.css` |

**解剖**（`data-scope="tour"`，加粗为必备部件）

**`root`** · `backdrop` · `spotlight` · `positioner` · **`content`** · `title` · `description` · `progress-text` · `prev-trigger` · `next-trigger` · `skip-trigger` · `close-trigger` · `arrow`

**键盘**（规格出处：[W3C APG · dialog-modal 模式](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | open 且焦点在 content 上（不在按钮等控件上） | 走到下一步；停在末步时完成引导并关闭 |
| `Escape` | open 且 closeOnEscape | 放弃引导（发 onSkip）并关闭 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | open | 一概不接管：既不换步也不阻止默认行为，留给页面滚动与读屏浏览 |
| `Tab` / `Shift+Tab` | open | 焦点陷在 content 内循环，跑出去会被拉回来 |
