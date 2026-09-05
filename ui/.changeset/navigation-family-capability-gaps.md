---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**导航与展开族补一批能力，全部是加法：不渲染新部件、不写新 prop 的既有用法逐值不变。**

**`menu` 补 `item-text` / `item-indicator` / `item-description` 三个部件，与 `menubar` / `context-menu` 那两家同形。** 连打检索从此优先取 `item-text`，条目里塞的图标与副文本不再算进检索串（没写这个部件时仍退回条目自身文本）。三个部件共用条目那一份 `data-disabled` / `data-highlighted`，样式层各处状态一致。Vue 侧新增 `XhMenuItemText` / `XhMenuItemIndicator` / `XhMenuItemDescription` 与条目上下文 `provideMenuItem` / `useMenuItemContext`，Web Components 侧新增三个 `csspart`。新增导出 `menuItemText`、类型 `MenuItemContext`。

**`menu` 补 `typeahead` / `disabled` / `translations` 三条 prop。** 首字符连打默认开（APG 的 menu button 模式把它列为必需），收起时缓冲区清空；`disabled` 一票封住触发器与全部条目；`translations.content` 给菜单容器一个名字，不给时仍由触发器经 `aria-labelledby` 代为命名。

**`menubar` 补 `arrow` / `item-description` 两个部件，`MenubarNode` 补 `group` / `groupLabel` / `separatorBefore` / `description` 四个字段。** 箭头指向它那张菜单自己的锚点（坐标取本菜单名下那份，换菜单时收起中的那张不会跳到新位置），定位引擎因此开始产出箭头落点。相邻同 `group` 的条目并成一段铺进 `group` 部件，段标题取组内首个给出 `groupLabel` 的条目，段首的分隔线落在分组外面——与 `context-menu` 的数据形状逐条对齐。Vue 侧新增 `XhMenubarArrow` / `XhMenubarItemDescription`。

**`context-menu` 补 `item-description` 部件**，`ContextMenuNode` 随之补 `description`；没给这一项的条目不铺那个部件，行高与此前逐值相同。Vue 侧新增 `XhContextMenuItemDescription`。

**`navigation-menu` 补 `trigger-indicator` 部件与 `disabled` prop。** 方向标记排在入口文字之后、展开时转 180°，没写内容时由皮肤画兜底字形；`disabled` 一票封住全部入口与面板展开。Vue 侧新增 `XhNavigationMenuTriggerIndicator`。

**`accordion` 补 `item-separator` 部件与 `variant` / `loop` / `disabled` 三条 prop。** 显式渲染分隔线时原来那条「相邻条目画边」的规则自然不再命中，两条线不会同时出现；`variant` 三档 `plain`（缺省，即现状）/ `surface` / `bordered` 决定条目怎么与页面分开；`loop` 让方向键在首尾之间回绕（缺省仍不回绕）；`disabled` 一票封住整组。新增类型 `AccordionVariant`，Vue 侧新增 `XhAccordionItemSeparator`。

**`collapsible` 补 `header` 部件与 `tone` / `dir` 两条 prop。** `header` 是触发器与其同排内容住的那一行，只写触发器时可以不渲染它；展开态的字色单开 `--xh-collapsible-trigger-fg-open` 一个槽接语气，不与常态共用一个。Vue 侧新增 `XhCollapsibleHeader`。

**`pagination` 补 `summary` / `jumper` 两个部件。** 信息区的文本由新的只读字段 `api.summaryText` 给出（文案走 `translations.summary`，默认 `1-10 of 42` 这一形），跳页框敲页码按回车即跳、越界值由 `setPage` 夹回合法区间。两者都与页码格子同一族盒型，并排在一行上平齐。Vue 侧新增 `XhPaginationSummary` / `XhPaginationJumper`，`PaginationTranslations` 新增 `summary` 与 `jumper` 两句。

**`anchor` 补 `link-text` 部件与 `bounds` prop。** 链接里另塞图标时，省略号只裁 `link-text` 这一段文字；`bounds` 是压线判定的容差（缺省 1px，与此前写死的那一档同值），长目录里靠它调「滚到哪儿才算进入下一节」。Vue 侧新增 `XhAnchorLinkText`，新增导出 `ANCHOR_DEFAULT_BOUNDS`，`resolveActiveAnchor` 多收一个可选参数。

**`breadcrumb` 补 `link-icon` 部件与 `collection` / `maxItems` 两条 prop。** 折叠算法进 headless（`buildBreadcrumbItems`，纯函数）：层数超过 `maxItems` 才折，折的是中间那一段，首层与末层恒在序列里，展开的层数恒等于 `maxItems`。`api.items` 给出折叠后的序列，省略位自带被折掉的那几层；只交 `collection` 时 Vue 侧按它铺开整套结构。新增类型 `BreadcrumbNode` / `BreadcrumbNodeMeta` / `BreadcrumbItem`，新增导出 `normalizeBreadcrumbNodes`，Vue 侧新增 `XhBreadcrumbLinkIcon`。

**`side-nav` 补 `tone` / `size` 两条轴。** 尺寸只换根与定位层上那三个私有槽（行高、行内边距、行内间距），中档逐值等于此前写死的那一份；语气把选中行的淡底与强调字、在途枝的字色接到语气层派生好的档上，不写 `data-tone` 时退回品牌色。折叠态的弹出面板被搬去落点、继承不到根上的槽，两条轴因此在 `positioner` 上再输出一次。

**`toolbar` 补 `variant` 轴**：缺省 `surface` 就是此前那条描边加底色的控件带，新增的 `plain` 档把整块面撤掉、只留排布——嵌在卡片或另一条工具栏里时不会叠成双框。新增类型 `ToolbarVariant`。

**`steps` 补 `collection` / `statuses` / `loop` / `translations` 四条 prop，`StepStatus` 扩到五档。** `error` 与 `warning` 两档不由步序算出，只能由 `statuses`（按下标覆盖）或 `collection` 显式指定，皮肤给出对应的描边与字色，出错那一步不必再由每个项目各写一套覆盖槽。`count` 缺省取 `collection` 的长度；`loop` 让方向键在首尾之间回绕（缺省仍不回绕）；`translations.list` 给 `role=tablist` 的容器一个名字。新增类型 `StepNode` / `StepNodeMeta`。

**`tabs` 补 `indicator` / `separator` 两个部件与 `closable` prop。** 指示条照 `anchor` / `navigation-menu` 那一套写：主轴的位置与长度由机器量好写成内联样式、交叉轴的贴边与粗细归皮肤，选中值一变与窗口尺寸一变各重量一次，横竖两排各走一根轴。它是可选部件——不渲染它时选中态仍由标签自己的底色与字色表达，三档形态的画法一条都没动。`closable` 打开后，焦点落在标签上按 Delete / Backspace 即发 `tab-close`（携带关掉这一条之后余下的标签序），库不持有标签序、只发意图。新增类型 `TabsIndicatorRect` / `TabsCloseDetails`，新增导出 `tabsTriggerQuery`，Vue 侧新增 `XhTabsIndicator` / `XhTabsSeparator`。
