# SideNav <Badge type="info" text="侧栏导航" />

后台侧边那棵导航树：分支可展开，选中落在叶子上并一路点亮祖先枝。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/side-nav" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/side-nav.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/side-nav" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/side-nav" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/side-nav.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

管理后台侧栏：分支内嵌展开（可多开）、选中落在叶子上并一路点亮祖先枝，方向键上下走行、左右管层级

<XhDemo src="side-nav/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="side-nav"`：**`root`** · **`list`** · **`item`** · `group` · `group-label` · `branch` · `branch-trigger` · `branch-text` · `branch-indicator` · `positioner` · `branch-content` · **`link`** · `link-text`

## 示例

### 手风琴与折叠

accordion 让同层只开一枝；collapsed 折叠成图标栏（内嵌展开整体收起，文字部件整个隐藏只剩图标），折叠态下悬停/点按/右方向键在旁侧弹出子级面板，面板内选中即落值收起；collapsedPopout 设为 false 可关掉弹出

<XhDemo src="side-nav/02-accordion-collapsed" />

### 语气与尺寸

tone 换选中行与展开枝用哪族颜色，size 换行高与缩进档；两轴都打在 root 上，逐层继承

<XhDemo src="side-nav/03-tone-size" />

### 受控展开与禁用

展开集合交给宿主：一次全展开或全收起，也能按当前路由把该开的那一枝开上；collection 里标了 disabled 的入口方向键跳过，点它也不落值

<XhDemo src="side-nav/04-controlled-expand" />

## 设计指引

### 何时使用

- 管理后台、控制台的主导航，层级两到三层。
- 侧栏需要折叠成图标栏，且折叠后仍要能进到子级。

### 何时不用

- 导航只有一层：用一列链接就够。
- 是内容树而不是导航树（文件、组织架构）：用[树](./tree)。
- 顶部横向导航：用[导航菜单](./navigation-menu)。

### 特性

- `collection` 是层级与文本的唯一事实源。
- `accordion` 让同层只开一枝；不开即可多开。
- 折叠成图标栏时内嵌展开整体收起、文字由皮肤藏掉；顶层分支换装浮层弹出，悬停 / 点按 / 右方向键在旁侧弹出子级面板，面板内选中即落值收起。
- 方向键上下走行、左右管层级。

### 组合

- 放进[布局](./layout)的 `sider`，折叠开关接布局的折叠态。

### 最佳实践

- 层级压到两级，第三级开始用户就记不住路径了。
- 折叠态一定要留 `collapsedPopout`，否则图标栏进不去子级。

### 反模式

- 把每个叶子都做成分支（点开只有一项）。
- 折叠时把整棵树卸载：展开状态与滚动位置全丢。

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
| `collection` | `SideNavNode[]` |  | 入口树，层级与文本的唯一事实源。缺省为空。 |
| `value` | `string \| null` |  | 选中的叶子（单选）。给定即受控：cell 直读 prop，写只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `expandedValue` | `string[]` |  | 展开集合。给定即受控，语义同上。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `accordion` | `boolean` |  | 同层手风琴：展开一枝时收起同层其余分支，默认 false（可多开）。 |
| `collapsed` | `boolean` |  | 折叠成图标栏：内嵌展开整体收起、文字由皮肤藏掉，只剩图标一列。 顶层分支换装浮层弹出：悬停/点按/右方向键在旁侧弹出子级面板。 |
| `collapsedPopout` | `boolean` |  | 折叠态下顶层分支是否弹出子级面板，默认 true；关掉即回到纯图标栏。 |
| `disabled` | `boolean` |  | 整个侧栏禁用。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<SideNavTranslations>` |  |  |
| `onValueChange` | `(details: SideNavValueChangeDetails) => void` |  | 选中意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
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

**事件**：`VALUE.SET` · `LINK.SELECT` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `FOCUS.CLEAR` · `POPOUT.OPEN` · `POPOUT.CLOSE` · `PRESENCE.SET`

**判据**：`canChange` · `canPopout`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 选中的叶子；尚未选中为 null。 |
| `expandedValue` | `string[]` |  |
| `collapsed` | `boolean` | 折叠成图标栏；顶层分支改为浮层弹出子级面板。 |
| `popoutValue` | `string \| null` | 折叠态下正弹出子级面板的顶层分支；没弹出为 null。 |
| `openPopout` | `(value: string) => void` | 弹出某顶层分支的子级面板（仅折叠态有效）。 |
| `closePopout` | `() => void` |  |
| `focusedValue` | `string \| null` | roving tabindex 的锚点；无可见锚点为 null。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `isActiveBranch` | `(value: string) => boolean` | 选中项的祖先分支：展开高亮「当前所在的那一枝」。 |
| `select` | `(value: string) => void` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` | 叶子行的列表项容器：链接与分支一样是列表的一条，作者把 link 裹在它里面。 |
| `getGroupProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: SideNavNodeProps) => T['button']` |  |
| `getBranchTextProps` | `() => T['element']` | 行文字的载体：折叠成图标栏时由皮肤整个藏掉，不会裁出半个字。 |
| `getBranchIndicatorProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `isPopoutPanel` | `(value: string) => boolean` | 该分支在折叠态下是否以浮层面板出现；决定作者要不要渲染定位层。 |
| `getPopoutPositionerProps` | `(props: SideNavNodeProps) => T['element']` | 弹出面板的定位层。吃引擎坐标、承载层号，作者须把它搬到浮层落点， 免得祖先的层叠上下文把面板困住。非弹出分支不渲染这一层。 |
| `getBranchContentProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getLinkProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getLinkTextProps` | `() => T['element']` | 链接文字的载体：折叠时由皮肤整个藏掉。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
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
| `branch-trigger` | `aria-expanded` | 'true' \| 'false' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `aria-hidden` | !open \|\| undefined |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| undefined |
| `popout-positioner` | `aria-hidden` | !open \|\| undefined |

- `list` 与 `branch-content` 是列表容器（`ul`），直接子节点只能是列表项：分支写 `branch`（`li`），叶子写 `item`（`li`）裹住 `link`（`a`）。链接直接挂在列表下会让列表语义作废。
- 行文字必须写进 `branch-text` / `link-text`。折叠成图标栏时这段文字被裁到看不见但仍参与播报，它就是按钮与链接在图标栏里唯一的可及名；行里只放图标不写文字，折叠后读屏报不出这一项是什么。
- 行里的图标是装饰，写 `aria-hidden="true"`，别让它挤进可及名。

## 样式参考

### 皮肤

`@xihan-ui/styles/side-nav.css` 使用 `[data-scope="side-nav"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

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
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-value` | itemValue(el) |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-content` | `data-popout` | '' |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-disabled` | ''（条件成立时才出现） |
| `link` | `data-highlighted` | ''（条件成立时才出现） |
| `link` | `data-value` | itemValue(el) |
| `popout-positioner` | `data-hidden` | ''（条件成立时才出现） |
| `popout-positioner` | `data-placement` | placed?.placement |
| `popout-positioner` | `data-positioned` | ''（条件成立时才出现） |
| `popout-positioner` | `data-size` | props.size |
| `popout-positioner` | `data-state` | 'open' \| 'closed' |
| `popout-positioner` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-side-nav-collapsed-w` | `root` | `inline-size` | `collapsed` | `56px` | side-nav 的 root 部件 inline-size 覆盖槽。 |
| `--xh-side-nav-fg` | `root` | `color` | `default` | `--xh-fg-default` | side-nav 的 root 部件 color 覆盖槽。 |
| `--xh-side-nav-gap` | `branch`<br>`branch-content`<br>`group`<br>`list`<br>`root` | `gap` | `default` | `--xh-space-1` | side-nav 的 branch、branch-content、group、list、root 部件 gap 覆盖槽。 |
| `--xh-side-nav-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-control-px-md` | side-nav 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-side-nav-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | side-nav 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-side-nav-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])` | `--xh-glyph-size-text` | side-nav 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-side-nav-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-space-4` | side-nav 的 branch-content 部件 padding-inline-start 覆盖槽。 |
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
| `--xh-side-nav-popout-radius` | `branch-content` | `border-radius` | `popout` | `--xh-shape-surface` | side-nav 的 branch-content 部件 border-radius 覆盖槽。 |
| `--xh-side-nav-popout-shadow` | `branch-content` | `box-shadow` | `popout` | `--xh-elevation-floating` | side-nav 的 branch-content 部件 box-shadow 覆盖槽。 |
| `--xh-side-nav-row-bg-active` | `link` | `background` | `current`<br>`disabled`<br>`not([data-disabled])` | `--xh-_side-nav-accent-bg` | side-nav 的 link 部件 background 覆盖槽。 |
| `--xh-side-nav-row-bg-hover` | `branch-trigger`<br>`link` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])` | `--xh-bg-subtle` | side-nav 的 branch-trigger、link 部件 background 覆盖槽。 |
| `--xh-side-nav-row-fg-active` | `link` | `color` | `current`<br>`disabled`<br>`not([data-disabled])` | `--xh-_side-nav-accent-fg` | side-nav 的 link 部件 color 覆盖槽。 |
| `--xh-side-nav-row-fg-in-path` | `branch-trigger` | `color` | `in-path` | `--xh-_side-nav-in-path-fg` | side-nav 的 branch-trigger 部件 color 覆盖槽。 |
| `--xh-side-nav-row-font-weight-active` | `link` | `font-weight` | `current`<br>`disabled`<br>`not([data-disabled])` | `--xh-font-weight-medium` | side-nav 的 link 部件 font-weight 覆盖槽。 |
| `--xh-side-nav-w` | `root` | `inline-size` | `default` | `240px` | side-nav 的 root 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
