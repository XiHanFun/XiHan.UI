# 侧栏导航 <Badge type="info" text="side-nav" />

后台侧边那棵导航树：分支可展开，选中落在叶子上并一路点亮祖先枝。

## 何时使用

- 管理后台、控制台的主导航，层级两到三层。
- 侧栏需要折叠成图标栏，且折叠后仍要能进到子级。

## 何时不用

- 导航只有一层：用一列链接就够。
- 是内容树而不是导航树（文件、组织架构）：用[树](./tree)。
- 顶部横向导航：用[导航菜单](./navigation-menu)。

## 特性

- `collection` 是层级与文本的唯一事实源。
- `accordion` 让同层只开一枝；不开即可多开。
- 折叠成图标栏时内嵌展开整体收起、文字由皮肤藏掉；顶层分支换装浮层弹出，悬停 / 点按 / 右方向键在旁侧弹出子级面板，面板内选中即落值收起。
- 方向键上下走行、左右管层级。

## 示例

### 基础用法

管理后台侧栏：分支内嵌展开（可多开）、选中落在叶子上并一路点亮祖先枝，方向键上下走行、左右管层级

<XhDemo src="side-nav/01-basic" />

### 手风琴与折叠

accordion 让同层只开一枝；collapsed 折叠成图标栏（内嵌展开整体收起，文字部件整个隐藏只剩图标），折叠态下悬停/点按/右方向键在旁侧弹出子级面板，面板内选中即落值收起；collapsedPopout 设为 false 可关掉弹出

<XhDemo src="side-nav/02-accordion-collapsed" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-side-nav>` |
| Vue 组件 | `XhSideNavBranch` `XhSideNavBranchContent` `XhSideNavBranchIndicator` `XhSideNavBranchText` `XhSideNavBranchTrigger` `XhSideNavGroup` `XhSideNavGroupLabel` `XhSideNavLink` `XhSideNavLinkText` `XhSideNavList` `XhSideNavRoot` |
| 组合式函数 | `useSideNav` |
| 状态机 | `sideNavMachine` |
| 皮肤 | `@xihan-ui/styles/side-nav.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="side-nav"`：**`root`** · **`list`** · `group` · `group-label` · `branch` · `branch-trigger` · `branch-text` · `branch-indicator` · `positioner` · `branch-content` · **`link`** · `link-text`

## Props

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
| `translations` | `Partial<SideNavTranslations>` |  |  |
| `onValueChange` | `(details: SideNavValueChangeDetails) => void` |  | 选中意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onExpandedChange` | `(details: SideNavExpandedChangeDetails) => void` |  | 展开集合变化意图回调；语义同上。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SideNavValueChangeDetails` | 选中变化；detail 为 `{ value: string \| null }` |
| `expanded-change` | `SideNavExpandedChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSideNavRoot` | `default` | `SideNavRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `branch` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `popout-positioner` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `popout`

**事件**：`VALUE.SET` · `LINK.SELECT` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `FOCUS.CLEAR` · `POPOUT.OPEN` · `POPOUT.CLOSE`

**判据**：`canChange` · `canPopout`

## connect API

`useSideNav` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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

## 键盘

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | translations?.root |
| `root` | `role` | 'navigation' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `branch-trigger` | `aria-controls` | `content` 部件的 id |
| `branch-trigger` | `aria-expanded` | 'true' \| 'false' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| undefined |

## 样式

默认皮肤 `@xihan-ui/styles/side-nav.css` 按部件选择：`[data-scope="side-nav"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-collapsed` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-collapsed` | ''（条件成立时才出现） |
| `group-label` | `data-collapsed` | ''（条件成立时才出现） |
| `branch` | `data-disabled` | ''（条件成立时才出现） |
| `branch` | `data-in-path` | ''（条件成立时才出现） |
| `branch` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `branch-trigger` | `data-in-path` | ''（条件成立时才出现） |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-value` | itemValue(el) |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-content` | `data-popout` | '' |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-disabled` | ''（条件成立时才出现） |
| `link` | `data-value` | itemValue(el) |
| `popout-positioner` | `data-placement` | placed?.placement |
| `popout-positioner` | `data-positioned` | ''（条件成立时才出现） |
| `popout-positioner` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-side-nav-collapsed-w` · `--xh-side-nav-fg` · `--xh-side-nav-gap` · `--xh-side-nav-icon-size` · `--xh-side-nav-indent` · `--xh-side-nav-p` · `--xh-side-nav-popout-bg` · `--xh-side-nav-popout-border` · `--xh-side-nav-popout-layer` · `--xh-side-nav-popout-max-h` · `--xh-side-nav-popout-max-w` · `--xh-side-nav-popout-min-w` · `--xh-side-nav-popout-p` · `--xh-side-nav-popout-radius` · `--xh-side-nav-popout-shadow` · `--xh-side-nav-w`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[布局](./layout)的 `sider`，折叠开关接布局的折叠态。

## 最佳实践

- 层级压到两级，第三级开始用户就记不住路径了。
- 折叠态一定要留 `collapsedPopout`，否则图标栏进不去子级。

## 反模式

- 把每个叶子都做成分支（点开只有一项）。
- 折叠时把整棵树卸载：展开状态与滚动位置全丢。
