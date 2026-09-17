# NavigationMenu 导航菜单 <Badge type="info" text="alpha" />

用于站点顶部的多级导航菜单。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/navigation-menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/navigation-menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/navigation-menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/navigation-menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/navigation-menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

从顶部入口展开站点导航

<XhDemo src="navigation-menu/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="navigation-menu"`：**`root`** · **`list`** · **`item`** · `trigger` · `trigger-indicator` · `content` · **`link`** · `indicator` · `viewport`

## 示例

### 竖向排列

在侧栏旁展开子级导航

<XhDemo src="navigation-menu/02-vertical" />

### 直达链接

混合下拉入口与普通链接

<XhDemo src="navigation-menu/03-link-item" />

### 共享面板

在固定位置切换不同导航内容

<XhDemo src="navigation-menu/04-viewport" />

## 设计指引

### 何时使用

- 门户、营销站或文档站具有多组导航链接。

### 何时不用

- 操作命令使用[菜单](./menu)。
- 后台层级导航使用[侧栏导航](./side-nav)。

### 特性

- 支持横向和竖向排列、延迟展开与键盘导航。
- 没有子级的入口可直接渲染为链接。
- `viewport` 可让所有面板在同一位置切换。
- 当前链接使用 `aria-current="page"`。

### 组合

- 窄屏时切换为抽屉或侧栏导航，不压缩顶部入口。

### 最佳实践

- 使用短标题和简洁说明组织链接。
- 保留默认展开延时，避免指针经过时连续闪动。

### 反模式

- 不要在导航面板中放置表单或一次性命令。
- 不要在窄屏中强行保留完整横向导航。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-navigation-menu>` |
| Vue 组件 | `XhNavigationMenuContent` `XhNavigationMenuIndicator` `XhNavigationMenuItem` `XhNavigationMenuLink` `XhNavigationMenuList` `XhNavigationMenuRoot` `XhNavigationMenuTrigger` `XhNavigationMenuTriggerIndicator` `XhNavigationMenuViewport` |
| 组合式函数 | `useNavigationMenu` |
| 状态机 | `navigationMenuMachine` |
| 皮肤 | `@xihan-ui/styles/navigation-menu.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `NavigationMenuNode[]` |  | 入口数据，入口文本与禁用的事实源。提供后 trigger 部件只需声明 value。 未提供时回到文本与禁用都写在部件上的方式。 |
| `value` | `string \| null` |  | 当前展开项，提供即受控；null 表示全部收起。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal。 |
| `delayDuration` | `number` |  | 悬停 / 聚焦到 trigger 后等待多久才展开，默认 200ms。 |
| `skipDelayDuration` | `number` |  | 收起之后的静默窗口，默认 300ms；窗口内再次触及任意 trigger 直接展开。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `disabled` | `boolean` |  | 整套导航禁用：所有入口都为 aria-disabled，面板不再展开。 |
| `translations` | `Partial<NavigationMenuTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: NavigationMenuValueChangeDetails) => void` |  | value 变化回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `NavigationMenuValueChangeDetails` | 展开项变化；detail 为 `{ value: string \| null }` |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `trigger-indicator` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `viewport` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle` · `opening` · `skipping`

**事件**：`TRIGGER.POINTER` · `TRIGGER.FOCUS` · `TRIGGER.TOGGLE` · `DISMISS` · `VALUE.SET` · `PRESENCE.SET` · `after.delayDuration` · `after.skipDelayDuration`

**判据**：`hasValue` · `isCurrent` · `shouldKeepOpen`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前展开的项；全部收起时为 null。 |
| `collection` | `readonly NavigationMenuNodeMeta[]` | 由 collection 推导的入口元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `open` | `boolean` | 是否有面板展开。 |
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

## 无障碍

### 键盘

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

### ARIA

以下属性由 `connect` 生成。

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

## 样式参考

### 皮肤

`@xihan-ui/styles/navigation-menu.css` 使用 `[data-scope="navigation-menu"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
| `link` | `data-xh-collection-context` | 'overlay' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-value` | context.get('value') |
| `viewport` | `data-orientation` | props.orientation |
| `viewport` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-navigation-menu-content-bg` | `content`<br>`viewport` | `background` | `default` | `--xh-bg-surface` | navigation-menu 的 content、viewport 部件 background 覆盖槽。 |
| `--xh-navigation-menu-content-border` | `content`<br>`viewport` | `border` | `default` | `--xh-border-default` | navigation-menu 的 content、viewport 部件 border 覆盖槽。 |
| `--xh-navigation-menu-content-gap` | `content` | `gap` | `default` | `--xh-space-1` | navigation-menu 的 content 部件 gap 覆盖槽。 |
| `--xh-navigation-menu-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | navigation-menu 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-navigation-menu-content-offset` | `content`<br>`viewport` | `inset-block-start`<br>`inset-inline-start` | `default`<br>`orientation=vertical` | `--xh-space-1` | navigation-menu 的 content、viewport 部件 inset-block-start、inset-inline-start 覆盖槽。 |
| `--xh-navigation-menu-content-p` | `content` | `padding` | `default` | `--xh-surface-pad-xs` | navigation-menu 的 content 部件 padding 覆盖槽。 |
| `--xh-navigation-menu-content-radius` | `content`<br>`viewport` | `border-radius` | `default` | `--xh-shape-overlay` | navigation-menu 的 content、viewport 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-content-shadow` | `content`<br>`viewport` | `box-shadow` | `default` | `--xh-elevation-floating` | navigation-menu 的 content、viewport 部件 box-shadow 覆盖槽。 |
| `--xh-navigation-menu-fg` | `root` | `color` | `default` | `--xh-fg-default` | navigation-menu 的 root 部件 color 覆盖槽。 |
| `--xh-navigation-menu-font-size` | `root` | `font-size` | `default` | `--xh-_navigation-menu-font-size` | navigation-menu 的 root 部件 font-size 覆盖槽。 |
| `--xh-navigation-menu-gap` | `list` | `gap` | `default` | `--xh-space-1` | navigation-menu 的 list 部件 gap 覆盖槽。 |
| `--xh-navigation-menu-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | navigation-menu 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-navigation-menu-indicator-color` | `indicator` | `background` | `default` | `--xh-_navigation-menu-accent` | navigation-menu 的 indicator 部件 background 覆盖槽。 |
| `--xh-navigation-menu-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | navigation-menu 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-indicator-thickness` | `indicator` | `block-size`<br>`inline-size`<br>`inset-block-end` | `default`<br>`orientation=vertical` | `--xh-stroke-thick` | navigation-menu 的 indicator 部件 block-size、inline-size、inset-block-end 覆盖槽。 |
| `--xh-navigation-menu-layer` | `content`<br>`viewport` | `z-index` | `default` | `--xh-_layer` | navigation-menu 的 content、viewport 部件 z-index 覆盖槽。 |
| `--xh-navigation-menu-link-bg-hover` | `link` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-_navigation-menu-highlight-bg` | navigation-menu 的 link 部件 background-color 覆盖槽。 |
| `--xh-navigation-menu-link-bg-pressed` | `link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | navigation-menu 的 link 部件 background-color 覆盖槽。 |
| `--xh-navigation-menu-link-fg` | `link` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-fg-default` | navigation-menu 的 link 部件 color 覆盖槽。 |
| `--xh-navigation-menu-link-fg-current` | `link` | `color` | `current` | `--xh-fg-brand-strong` | navigation-menu 的 link 部件 color 覆盖槽。 |
| `--xh-navigation-menu-link-font-size` | `link` | `font-size` | `default` | `--xh-_navigation-menu-link-font-size` | navigation-menu 的 link 部件 font-size 覆盖槽。 |
| `--xh-navigation-menu-link-font-weight-current` | `link` | `font-weight` | `current` | `--xh-font-weight-medium` | navigation-menu 的 link 部件 font-weight 覆盖槽。 |
| `--xh-navigation-menu-link-px` | `link` | `padding-inline` | `default` | `--xh-_navigation-menu-link-px` | navigation-menu 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-navigation-menu-link-py` | `link` | `padding-block` | `default` | `--xh-_navigation-menu-link-py` | navigation-menu 的 link 部件 padding-block 覆盖槽。 |
| `--xh-navigation-menu-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | navigation-menu 的 link 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-trigger-bg-active` | `trigger` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-_navigation-menu-highlight-bg` | navigation-menu 的 trigger 部件 background 覆盖槽。 |
| `--xh-navigation-menu-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-_navigation-menu-highlight-bg` | navigation-menu 的 trigger 部件 background 覆盖槽。 |
| `--xh-navigation-menu-trigger-bg-pressed` | `trigger` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`pressed` | `--xh-bg-subtle-hover` | navigation-menu 的 trigger 部件 background 覆盖槽。 |
| `--xh-navigation-menu-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-muted` | navigation-menu 的 trigger 部件 color 覆盖槽。 |
| `--xh-navigation-menu-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | navigation-menu 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-navigation-menu-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_navigation-menu-trigger-gap` | navigation-menu 的 trigger 部件 gap 覆盖槽。 |
| `--xh-navigation-menu-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_navigation-menu-trigger-h` | navigation-menu 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-navigation-menu-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_navigation-menu-trigger-px` | navigation-menu 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-navigation-menu-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | navigation-menu 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-viewport-p` | `viewport` | `padding` | `default` | `--xh-space-2` | navigation-menu 的 viewport 部件 padding 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background` · `block-size` · `inline-size` · `inset-block-start` · `inset-inline-start` · `rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
