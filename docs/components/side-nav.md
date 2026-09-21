# SideNav 侧栏导航 <Badge type="info" text="alpha" />

用于组织应用的主要导航入口。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/side-nav" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/side-nav.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/side-nav" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/side-nav" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/side-nav.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

组织应用的主要导航入口

<XhDemo src="side-nav/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="side-nav"`：**`root`** · **`list`** · **`item`** · `group` · `group-label` · `branch` · `branch-trigger` · `branch-text` · `branch-indicator` · `positioner` · `branch-content` · **`link`** · `link-text`

## 示例

### 折叠模式

以图标保留入口，子级在浮层中展开

<XhDemo src="side-nav/02-accordion-collapsed" />

### 尺寸

适配不同密度的应用侧栏

<XhDemo src="side-nav/03-tone-size" />

### 禁用项

保留不可用入口的位置与说明

<XhDemo src="side-nav/04-controlled-expand" />

## 设计指引

### 何时使用

- 管理后台或控制台的主导航。
- 导航包含分组或可展开的子级。

### 何时不用

- 顶部横向导航，使用[导航菜单](./navigation-menu)。
- 文件或组织结构，使用[树](./tree)。

### 特性

- 支持分组、嵌套分支与当前项高亮：当前项铺品牌淡底行面、字取淡底前景，不另画指示条；通往当前项的展开分支只落与悬停同档的中性面。
- `accordion` 限制同一层级只展开一个分支。
- 折叠后保留图标入口，子级在浮层中展示。
- 方向键上下移动，左右键展开或收起分支。

### 组合

- 放入[布局](./layout)的侧栏区域。

### 最佳实践

- 导航层级保持在两到三级。
- 折叠模式下为每个入口保留清晰图标。

### 反模式

- 不要为单个入口创建分支。
- 不要在折叠时卸载导航树。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-side-nav>` |
| Vue 组件 | `XhSideNavBranch` `XhSideNavBranchContent` `XhSideNavBranchIndicator` `XhSideNavBranchText` `XhSideNavBranchTrigger` `XhSideNavGroup` `XhSideNavGroupLabel` `XhSideNavItem` `XhSideNavLink` `XhSideNavLinkText` `XhSideNavList` `XhSideNavRoot` |
| 组合式函数 | `useSideNav` |
| 状态机 | `sideNavMachine` |
| 皮肤 | `@xihan-ui/styles/side-nav.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `SideNavNode[]` |  | 入口树，层级与文本的唯一事实源。默认为空。 |
| `value` | `string \| null` |  | 选中的叶子（单选）。提供即受控：cell 直读 prop，写入只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `expandedValue` | `string[]` |  | 展开集合。提供即受控，语义同上。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `accordion` | `boolean` |  | 同层手风琴：展开一枝时收起同层其余分支，默认 false（可多开）。 |
| `collapsed` | `boolean` |  | 折叠为图标栏：内嵌展开整体收起、文字由皮肤隐藏，只剩图标一列。 顶层分支改为浮层弹出：悬停 / 点击 / 右方向键在旁侧弹出子级面板。 |
| `collapsedPopout` | `boolean` |  | 折叠态下顶层分支是否弹出子级面板，默认 true；关闭即回到纯图标栏。 |
| `disabled` | `boolean` |  | 整个侧栏禁用。 |
| `loop` | `boolean` |  | 上下键到达首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的展开 / 收起语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<SideNavTranslations>` |  |  |
| `onValueChange` | `(details: SideNavValueChangeDetails) => void` |  | 选中意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onExpandedValueChange` | `(details: SideNavExpandedValueChangeDetails) => void` |  | 展开集合变化意图回调；语义同上。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SideNavValueChangeDetails` | 选中变化；detail 为 `{ value: string \| null }` |
| `expanded-value-change` | `SideNavExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSideNavRoot` | `default` | `SideNavRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `branch` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `popout-positioner` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle` · `popout`

**事件**：`VALUE.SET` · `LINK.SELECT` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `FOCUS.CLEAR` · `POPOUT.OPEN` · `POPOUT.CLOSE` · `PRESENCE.SET` · `PRESS.START` · `PRESS.END`

**判据**：`canChange` · `canPopout` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 选中的叶子；尚未选中时为 null。 |
| `expandedValue` | `string[]` |  |
| `collapsed` | `boolean` | 折叠为图标栏；顶层分支改为浮层弹出子级面板。 |
| `popoutValue` | `string \| null` | 折叠态下正在弹出子级面板的顶层分支；未弹出时为 null。 |
| `openPopout` | `(value: string) => void` | 弹出某顶层分支的子级面板（仅折叠态有效）。 |
| `closePopout` | `() => void` |  |
| `focusedValue` | `string \| null` | roving tabindex 的锚点；无可见锚点时为 null。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `isActiveBranch` | `(value: string) => boolean` | 选中项的祖先分支：展开高亮当前所在的分支。 |
| `select` | `(value: string) => void` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` | 叶子行的列表项容器：链接与分支一样是列表的一条，作者把 link 包在其中。 |
| `getGroupProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: SideNavNodeProps) => T['button']` |  |
| `getBranchTextProps` | `() => T['element']` | 行文字的载体：折叠为图标栏时由皮肤整体隐藏，不会裁出半个字。 |
| `getBranchIndicatorProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `isPopoutPanel` | `(value: string) => boolean` | 该分支在折叠态下是否以浮层面板出现；决定作者是否需要渲染定位层。 |
| `getPopoutPositionerProps` | `(props: SideNavNodeProps) => T['element']` | 弹出面板的定位层。使用引擎坐标、承载层号，作者须把它移到浮层落点， 避免祖先的层叠上下文困住面板。非弹出分支不渲染这一层。 |
| `getBranchContentProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getLinkProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getLinkTextProps` | `() => T['element']` | 链接文字的载体：折叠时由皮肤整体隐藏。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | held on link / branch-trigger, 侧栏未禁用且入口未禁用 | 按住期间链接行或分支行投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，弹出面板随选中收起时一并撤下。导航当前（aria-current）与按压互相独立，激活与展开语义照旧由这一次按键承担 |
| `Enter` / `Space` | focus in branch-trigger | 展开/收起该枝（原生按钮激活） |
| `Enter` | focus in link | 激活链接（原生行为）并落选中 |
| `ArrowDown` | focus in 行 | 下一可见行（roving tabindex） |
| `ArrowUp` | focus in 行 | 上一可见行 |
| `ArrowRight` | focus in 收起的分支行 | 展开该枝；已展开时进第一个子行（RTL 与 ArrowLeft 对调） |
| `ArrowLeft` | focus in 展开的分支行 | 收起该枝；叶子或已收起时回父分支（RTL 与 ArrowRight 对调） |
| `Home` | focus in 行 | 第一可见行 |
| `End` | focus in 行 | 最后一可见行 |
| `ArrowRight` / `Enter` / `Space` | focus in 折叠态顶层分支行 | 弹出子级面板并落焦第一行（RTL 与 ArrowLeft 对调） |
| `ArrowLeft` / `Escape` | focus in 弹出面板 | 收回面板，焦点还给触发按钮（RTL 与 ArrowRight 对调；Escape 归消解层） |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | translations?.root |
| `root` | `role` | 'navigation' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `branch-trigger` | `aria-controls` | `content` 部件的 id |
| `branch-trigger` | `aria-disabled` | 'true' \| 'false' |
| `branch-trigger` | `aria-expanded` | 'true' \| 'false' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `aria-hidden` | !open \|\| undefined |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| undefined |
| `popout-positioner` | `aria-hidden` | !open \|\| undefined |

- `list` 与 `branch-content` 使用列表语义。
- 将文字放入 `branch-text` 或 `link-text`，确保折叠后仍有可访问名称。
- 装饰图标使用 `aria-hidden="true"`。

## 样式参考

### 皮肤

`@xihan-ui/styles/side-nav.css` 使用 `[data-scope="side-nav"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-collapsed` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `list` | `data-collapsed` | ''（条件成立时才出现） |
| `group-label` | `data-collapsed` | ''（条件成立时才出现） |
| `branch` | `data-disabled` | ''（条件成立时才出现） |
| `branch` | `data-in-path` | ''（条件成立时才出现） |
| `branch` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `branch-trigger` | `data-highlighted` | ''（条件成立时才出现） |
| `branch-trigger` | `data-in-path` | ''（条件成立时才出现） |
| `branch-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-value` | itemValue(el) |
| `branch-trigger` | `data-xh-collection-context` | 'page' |
| `branch-trigger` | `data-xh-collection-item` | '' |
| `branch-trigger` | `data-xh-collection-size` | props.size |
| `branch-text` | `data-xh-collection-slot` | 'text' |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-indicator` | `data-xh-collection-slot` | 'suffix' |
| `branch-content` | `data-popout` | '' |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-disabled` | ''（条件成立时才出现） |
| `link` | `data-highlighted` | ''（条件成立时才出现） |
| `link` | `data-pressed` | ''（条件成立时才出现） |
| `link` | `data-value` | itemValue(el) |
| `link` | `data-xh-collection-context` | 'page' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `link-text` | `data-xh-collection-slot` | 'text' |
| `popout-positioner` | `data-hidden` | ''（条件成立时才出现） |
| `popout-positioner` | `data-placement` | placed?.placement |
| `popout-positioner` | `data-positioned` | ''（条件成立时才出现） |
| `popout-positioner` | `data-size` | props.size |
| `popout-positioner` | `data-state` | 'open' \| 'closed' |
| `popout-positioner` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-side-nav-branch-indicator-size` | `branch-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | side-nav 的 branch-indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-side-nav-collapsed-w` | `root` | `inline-size` | `collapsed` | `56px` | side-nav 的 root 部件 inline-size 覆盖槽。 |
| `--xh-side-nav-fg` | `root` | `color` | `default` | `--xh-fg-default` | side-nav 的 root 部件 color 覆盖槽。 |
| `--xh-side-nav-gap` | `branch`<br>`branch-content`<br>`group`<br>`list`<br>`root` | `gap` | `default` | `--xh-space-1` | side-nav 的 branch、branch-content、group、list、root 部件 gap 覆盖槽。 |
| `--xh-side-nav-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_side-nav-row-px` | side-nav 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-side-nav-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | side-nav 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-side-nav-icon-size` | `branch-trigger`<br>`link`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | side-nav 的 branch-trigger、link、positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-side-nav-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-space-4` | side-nav 的 branch-content 部件 padding-inline-start 覆盖槽。 |
| `--xh-side-nav-indicator-color` | `branch-trigger`<br>`link` | `color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=page`<br>`xh-collection-slot=indicator` | `--xh-fg-brand` | side-nav 的 branch-trigger、link 部件 color 覆盖槽。 |
| `--xh-side-nav-link-font-size` | `branch-trigger`<br>`link` | `font-size` | `default` | `--xh-_side-nav-row-font-size` | side-nav 的 branch-trigger、link 部件 font-size 覆盖槽。 |
| `--xh-side-nav-link-gap` | `branch-trigger`<br>`link` | `gap` | `default` | `--xh-_side-nav-row-gap` | side-nav 的 branch-trigger、link 部件 gap 覆盖槽。 |
| `--xh-side-nav-link-h` | `branch-trigger`<br>`link` | `min-block-size` | `default` | `--xh-_side-nav-row-h` | side-nav 的 branch-trigger、link 部件 min-block-size 覆盖槽。 |
| `--xh-side-nav-link-px` | `branch-trigger`<br>`link` | `padding-inline` | `default` | `--xh-_side-nav-row-px` | side-nav 的 branch-trigger、link 部件 padding-inline 覆盖槽。 |
| `--xh-side-nav-link-radius` | `branch-trigger`<br>`link` | `border-radius` | `default` | `--xh-shape-control` | side-nav 的 branch-trigger、link 部件 border-radius 覆盖槽。 |
| `--xh-side-nav-p` | `root` | `padding` | `default` | `--xh-space-2` | side-nav 的 root 部件 padding 覆盖槽。 |
| `--xh-side-nav-popout-bg` | `branch-content` | `background` | `popout` | `--xh-bg-surface` | side-nav 的 branch-content 部件 background 覆盖槽。 |
| `--xh-side-nav-popout-border` | `branch-content` | `border` | `popout` | `--xh-border-default` | side-nav 的 branch-content 部件 border 覆盖槽。 |
| `--xh-side-nav-popout-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | side-nav 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-side-nav-popout-max-h` | `branch-content` | `max-block-size` | `popout` | `--xh-overlay-menu-max-h` | side-nav 的 branch-content 部件 max-block-size 覆盖槽。 |
| `--xh-side-nav-popout-max-w` | `branch-content` | `max-inline-size` | `popout` | `--xh-overlay-max-w` | side-nav 的 branch-content 部件 max-inline-size 覆盖槽。 |
| `--xh-side-nav-popout-min-w` | `branch-content` | `min-inline-size` | `popout` | `--xh-overlay-menu-min-w` | side-nav 的 branch-content 部件 min-inline-size 覆盖槽。 |
| `--xh-side-nav-popout-p` | `branch-content` | `padding` | `popout` | `--xh-space-1` | side-nav 的 branch-content 部件 padding 覆盖槽。 |
| `--xh-side-nav-popout-radius` | `branch-content` | `border-radius` | `popout` | `--xh-shape-overlay` | side-nav 的 branch-content 部件 border-radius 覆盖槽。 |
| `--xh-side-nav-popout-shadow` | `branch-content` | `box-shadow` | `popout` | `--xh-elevation-floating` | side-nav 的 branch-content 部件 box-shadow 覆盖槽。 |
| `--xh-side-nav-row-bg-active` | `branch-trigger`<br>`link` | `background-color` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` | side-nav 的 branch-trigger、link 部件 background-color 覆盖槽。 |
| `--xh-side-nav-row-bg-hover` | `branch-trigger`<br>`link` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | side-nav 的 branch-trigger、link 部件 background-color 覆盖槽。 |
| `--xh-side-nav-row-bg-in-path` | `branch-trigger`<br>`link` | `background-color` | `in-path` | `--xh-bg-subtle` | side-nav 的 branch-trigger、link 部件 background-color 覆盖槽。 |
| `--xh-side-nav-row-bg-pressed` | `branch-trigger`<br>`link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | side-nav 的 branch-trigger、link 部件 background-color 覆盖槽。 |
| `--xh-side-nav-row-fg` | `branch-trigger`<br>`link` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `currentColor` | side-nav 的 branch-trigger、link 部件 color 覆盖槽。 |
| `--xh-side-nav-row-fg-active` | `branch-trigger`<br>`link` | `color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` | side-nav 的 branch-trigger、link 部件 color 覆盖槽。 |
| `--xh-side-nav-row-fg-in-path` | `branch-trigger`<br>`link` | `color` | `in-path` | `--xh-side-nav-row-fg` | side-nav 的 branch-trigger、link 部件 color 覆盖槽。 |
| `--xh-side-nav-row-font-weight-active` | `branch-trigger`<br>`link` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=page` | `--xh-font-weight-medium` | side-nav 的 branch-trigger、link 部件 font-weight 覆盖槽。 |
| `--xh-side-nav-w` | `root` | `inline-size` | `default` | `240px` | side-nav 的 root 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
