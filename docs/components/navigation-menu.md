# NavigationMenu <Badge type="info" text="导航菜单" />

站点的主导航：一排入口，展开后是一整块去处面板，面板里是链接不是命令。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/navigation-menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/navigation-menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/navigation-menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/navigation-menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/navigation-menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

面板落在同一个 li 里、紧跟 trigger 之后，展开时按 Tab 就走得进去，里面的条目是链接不是命令，点了就跳走

<XhDemo src="navigation-menu/01-basic" />

## 示例

### 受控

传了 value 就由宿主说了算，null 表示都收起

<XhDemo src="navigation-menu/02-controlled" />

### 展开延时

delay-duration 是悬停多久才展开，防的是指针横穿导航时一路闪出面板；skip-delay-duration 是收起后的静默窗口，窗口内再碰任意入口直接展开

<XhDemo src="navigation-menu/03-delay" />

### 竖排

orientation="vertical" 把入口排成一列、面板改从侧边长出来，方向键随之改收上下键

<XhDemo src="navigation-menu/04-vertical" />

### 语气

tone 换的是入口的高亮底与指示条、当前链接的文字色，静止态一样：悬停到入口上、或用方向键把焦点移过去才显现

<XhDemo src="navigation-menu/05-tone" />

### 尺寸

size 一档换掉入口的高度、内边距与字号，写在 root 上、面板里的链接一并跟着变

<XhDemo src="navigation-menu/06-size" />

### 直达入口

没有下级的去处不必套面板：那一项直接铺成一条 link，它不进方向键那一组（那一组只认 trigger），按 Tab 一样到得了

<XhDemo src="navigation-menu/07-link-item" />

### 共享面板外壳

面板整批塞进 viewport 后落位归外壳管：几个入口的面板落在同一处，宽窄不同也不再各贴各的入口

<XhDemo src="navigation-menu/08-viewport" />

### 默认展开项

defaultValue 只定首帧展开哪一项，之后照常由交互接管；指针移开、Escape 或点回入口都收得起来

<XhDemo src="navigation-menu/09-default-open" />

### 收窄成一列图标

竖排时面板本就从入口侧边长出来；收窄只是把文字从入口里撤掉、把它挪进面板，指针停上去才露出来

<XhDemo src="navigation-menu/10-collapsed" />

## 设计指引

### 何时使用

- 门户、营销站、文档站的顶部导航，每个板块下还有若干去处。

### 何时不用

- 条目是命令（执行一次动作）：用[菜单](./menu)。
- 后台的层级导航：用[侧栏导航](./side-nav)。

### 特性

- 面板落在同一个 `li` 里、紧跟入口之后，展开时按 Tab 就走得进去。
- `delayDuration` 防的是指针横穿导航时一路闪出面板；`skipDelayDuration` 是收起后的静默窗口，窗口内再碰任意入口直接展开。
- 没有下级的去处不必套面板：那一项直接铺成一条 `link`，它不进方向键那一组，按 Tab 一样到得了。
- 面板整批塞进 `viewport` 后落位归外壳管：几个入口的面板落在同一处，宽窄不同也不再各贴各的入口。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-navigation-menu>` |
| Vue 组件 | `XhNavigationMenuContent` `XhNavigationMenuIndicator` `XhNavigationMenuItem` `XhNavigationMenuLink` `XhNavigationMenuList` `XhNavigationMenuRoot` `XhNavigationMenuTrigger` `XhNavigationMenuTriggerIndicator` `XhNavigationMenuViewport` |
| 组合式函数 | `useNavigationMenu` |
| 状态机 | `navigationMenuMachine` |
| 皮肤 | `@xihan-ui/styles/navigation-menu.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="navigation-menu"`：**`root`** · **`list`** · **`item`** · `trigger` · `trigger-indicator` · `content` · **`link`** · `indicator` · `viewport`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `NavigationMenuNode[]` |  | 入口数据，入口文本与禁用的事实源。给了它，trigger 部件只需报 value。 缺省即回到「文本与禁用都写在部件上」的老路。 |
| `value` | `string \| null` |  | 当前展开项，给定即受控；null 表示都收起。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal。 |
| `delayDuration` | `number` |  | 悬停/聚焦到 trigger 后等多久才展开，默认 200ms。 |
| `skipDelayDuration` | `number` |  | 收起之后的静默窗口，默认 300ms；窗口内再碰任意 trigger 直接展开。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `disabled` | `boolean` |  | 整套导航禁用：所有入口都转 aria-disabled，面板不再展开。 |
| `translations` | `Partial<NavigationMenuTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: NavigationMenuValueChangeDetails) => void` |  | value 变化回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `NavigationMenuValueChangeDetails` | 展开项变化；detail 为 `{ value: string \| null }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `trigger-indicator` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `viewport` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `opening` · `skipping`

**事件**：`TRIGGER.POINTER` · `TRIGGER.FOCUS` · `TRIGGER.TOGGLE` · `DISMISS` · `VALUE.SET` · `PRESENCE.SET` · `after.delayDuration` · `after.skipDelayDuration`

**判据**：`hasValue` · `isCurrent` · `shouldKeepOpen`

## connect API

`useNavigationMenu` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前展开的那一项；都收起时为 null。 |
| `collection` | `readonly NavigationMenuNodeMeta[]` | collection 推出的入口元信息，按数据顺序排列；没给 collection 即空数组。 |
| `open` | `boolean` | 有没有面板展开着。 |
| `isOpen` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: NavigationMenuTriggerProps) => T['button']` |  |
| `getTriggerIndicatorProps` | `(props: NavigationMenuTriggerProps) => T['element']` |  |
| `getContentProps` | `(props: NavigationMenuContentProps) => T['element']` |  |
| `getLinkProps` | `(props: NavigationMenuLinkProps) => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in trigger, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；随后的自动展开走 delayDuration |
| `ArrowLeft` / `ArrowUp` | focus in trigger, 按键与 orientation 同轴 | 焦点移到上一个 trigger |
| `Home` | focus in trigger | 焦点移到首个可停留 trigger |
| `End` | focus in trigger | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 立即展开对应面板（不走 delayDuration）；面板是自动弹出来的那一次不收起，再按一次才收起 |
| `Escape` | open | 收起面板并把焦点归还对应 trigger；静默窗口内这一次归还不会把面板重新弹出来 |
| `Tab` / `Shift+Tab` | open, focus in trigger | 走进展开的面板：面板就在 trigger 之后，收起的面板带 hidden 因而被整个跳过 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger-indicator` | `aria-hidden` | 'true' |
| `content` | `aria-hidden` | !isOpen \|\| undefined |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'group' |
| `link` | `aria-current` | 'page' \| undefined |
| `indicator` | `aria-hidden` | 'true' |
| `viewport` | `aria-hidden` | !open \|\| undefined |

## 样式

默认皮肤 `@xihan-ui/styles/navigation-menu.css` 按部件选择：`[data-scope="navigation-menu"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-orientation` | props.orientation |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `trigger-indicator` | `data-orientation` | props.orientation |
| `trigger-indicator` | `data-state` | 'open' \| 'closed' |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | ''（条件成立时才出现） |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-value` | context.get('value') |
| `viewport` | `data-orientation` | props.orientation |
| `viewport` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-navigation-menu-content-bg` | `content`<br>`viewport` | `background` | `default` | `--xh-bg-surface` | navigation-menu 的 content、viewport 部件 background 覆盖槽。 |
| `--xh-navigation-menu-content-border` | `content`<br>`viewport` | `border` | `default` | `--xh-border-default` | navigation-menu 的 content、viewport 部件 border 覆盖槽。 |
| `--xh-navigation-menu-content-gap` | `content` | `gap` | `default` | `--xh-space-1` | navigation-menu 的 content 部件 gap 覆盖槽。 |
| `--xh-navigation-menu-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | navigation-menu 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-navigation-menu-content-offset` | `content`<br>`viewport` | `inset-block-start`<br>`inset-inline-start` | `default`<br>`orientation=vertical` | `--xh-space-1` | navigation-menu 的 content、viewport 部件 inset-block-start、inset-inline-start 覆盖槽。 |
| `--xh-navigation-menu-content-p` | `content` | `padding` | `default` | `--xh-surface-pad-xs` | navigation-menu 的 content 部件 padding 覆盖槽。 |
| `--xh-navigation-menu-content-radius` | `content`<br>`viewport` | `border-radius` | `default` | `--xh-shape-surface` | navigation-menu 的 content、viewport 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-content-shadow` | `content`<br>`viewport` | `box-shadow` | `default` | `--xh-elevation-floating` | navigation-menu 的 content、viewport 部件 box-shadow 覆盖槽。 |
| `--xh-navigation-menu-fg` | `root` | `color` | `default` | `--xh-fg-default` | navigation-menu 的 root 部件 color 覆盖槽。 |
| `--xh-navigation-menu-font-size` | `root` | `font-size` | `default` | `--xh-_navigation-menu-font-size` | navigation-menu 的 root 部件 font-size 覆盖槽。 |
| `--xh-navigation-menu-gap` | `list` | `gap` | `default` | `--xh-space-1` | navigation-menu 的 list 部件 gap 覆盖槽。 |
| `--xh-navigation-menu-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | navigation-menu 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-navigation-menu-indicator-color` | `indicator` | `background` | `default` | `--xh-_navigation-menu-accent` | navigation-menu 的 indicator 部件 background 覆盖槽。 |
| `--xh-navigation-menu-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | navigation-menu 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-indicator-thickness` | `indicator` | `block-size`<br>`inline-size`<br>`inset-block-end` | `default`<br>`orientation=vertical` | `--xh-stroke-thick` | navigation-menu 的 indicator 部件 block-size、inline-size、inset-block-end 覆盖槽。 |
| `--xh-navigation-menu-layer` | `content`<br>`viewport` | `z-index` | `default` | `--xh-_layer` | navigation-menu 的 content、viewport 部件 z-index 覆盖槽。 |
| `--xh-navigation-menu-link-bg-hover` | `link` | `background` | `hover` | `--xh-_navigation-menu-highlight-bg` | navigation-menu 的 link 部件 background 覆盖槽。 |
| `--xh-navigation-menu-link-fg` | `link` | `color` | `default` | `--xh-fg-default` | navigation-menu 的 link 部件 color 覆盖槽。 |
| `--xh-navigation-menu-link-fg-current` | `link` | `color` | `current` | `--xh-_navigation-menu-current-fg` | navigation-menu 的 link 部件 color 覆盖槽。 |
| `--xh-navigation-menu-link-font-size` | `link` | `font-size` | `default` | `--xh-_navigation-menu-link-font-size` | navigation-menu 的 link 部件 font-size 覆盖槽。 |
| `--xh-navigation-menu-link-font-weight-current` | `link` | `font-weight` | `current` | `--xh-font-weight-medium` | navigation-menu 的 link 部件 font-weight 覆盖槽。 |
| `--xh-navigation-menu-link-px` | `link` | `padding-inline` | `default` | `--xh-_navigation-menu-link-px` | navigation-menu 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-navigation-menu-link-py` | `link` | `padding-block` | `default` | `--xh-_navigation-menu-link-py` | navigation-menu 的 link 部件 padding-block 覆盖槽。 |
| `--xh-navigation-menu-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | navigation-menu 的 link 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-trigger-bg-active` | `trigger` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-_navigation-menu-active-bg` | navigation-menu 的 trigger 部件 background 覆盖槽。 |
| `--xh-navigation-menu-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-_navigation-menu-highlight-bg` | navigation-menu 的 trigger 部件 background 覆盖槽。 |
| `--xh-navigation-menu-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-muted` | navigation-menu 的 trigger 部件 color 覆盖槽。 |
| `--xh-navigation-menu-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | navigation-menu 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-navigation-menu-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_navigation-menu-trigger-gap` | navigation-menu 的 trigger 部件 gap 覆盖槽。 |
| `--xh-navigation-menu-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_navigation-menu-trigger-h` | navigation-menu 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-navigation-menu-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_navigation-menu-trigger-px` | navigation-menu 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-navigation-menu-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | navigation-menu 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-viewport-p` | `viewport` | `padding` | `default` | `--xh-space-2` | navigation-menu 的 viewport 部件 padding 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `block-size` · `inline-size` · `inset-block-start` · `inset-inline-start` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[布局](./layout)的头部配合；窄屏时整体换成[抽屉](./drawer)里的[侧栏导航](./side-nav)。

## 最佳实践

- 面板里的链接分组并加组标题，一整块无结构的链接墙没人看得下去。
- 延时保留默认值：调到 0 会让导航在指针路过时不停闪。

## 反模式

- 面板里混进需要提交的表单或命令按钮。
- 悬停即刻展开且没有静默窗口：指针横穿时面板一路弹出。
