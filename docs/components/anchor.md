# Anchor 锚点

根据滚动位置高亮当前章节的目录。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/anchor" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/anchor.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/anchor" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/anchor" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/anchor.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

跟随滚动高亮当前章节

<XhDemo src="anchor/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="anchor"`：**`root`** · **`list`** · **`item`** · **`link`** · `link-text` · `indicator`

## 示例

### 判定线偏移

为吸顶内容预留空间

<XhDemo src="anchor/02-offset" />

### 横向排列

在内容上方显示章节导航

<XhDemo src="anchor/03-horizontal" />

### 嵌套目录

展示父级与子级章节

<XhDemo src="anchor/04-nested" />

## 设计指引

### 何时使用

- 为长文档、设置页或详情页提供章节导航。

### 何时不用

- 切换独立内容使用[标签页](./tabs)。
- 不需要当前位置反馈时使用普通链接。

### 特性

- 支持页面或指定容器滚动。
- 支持滚动偏移、平滑滚动和当前项指示线：不放 `indicator` 部件时当前链接自带一条静态线（竖排贴起始缘、横排贴底边），放了部件则由部件滑动。
- 支持水平、垂直和嵌套目录。

### 组合

- 可与[固钉](./affix)和[排印](./typography)组合使用。

### 最佳实践

- 有固定页头时设置对应的滚动偏移。
- 目录项文字应与正文标题一致。

### 反模式

- 目录层级不宜超过两级。
- 不要用锚点切换独立视图。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-anchor>` |
| Vue 组件 | `XhAnchorIndicator` `XhAnchorItem` `XhAnchorLink` `XhAnchorLinkText` `XhAnchorList` `XhAnchorRoot` |
| 组合式函数 | `useAnchor` |
| 状态机 | `anchorMachine` |
| 皮肤 | `@xihan-ui/styles/anchor.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| null` |  | 当前激活的锚点 id，给定即受控。 |
| `defaultValue` | `string \| null` |  |  |
| `collection` | `readonly string[]` |  | 目标区块的 id 清单，按文档序提供；未提供时按渲染出的 link 查询。 |
| `offset` | `number` |  | 判定线距滚动容器视口顶边的距离（px），默认 0。 |
| `bounds` | `number` |  | 压线判定的容差（px），默认 1；区块顶边落在判定线下方该距离内仍视为越过。 |
| `smooth` | `boolean` |  | 点击链接时平滑滚动到目标，默认 false。 |
| `dir` | `Direction` |  | 文字方向，作用于排版与指示条的起始缘。 |
| `orientation` | `Orientation` |  | 列表轴向，默认 vertical，只影响样式。 |
| `translations` | `Partial<AnchorTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: AnchorValueChangeDetails) => void` |  | value 变化意图回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `AnchorValueChangeDetails` | 激活项变化；detail 为 `{ value: string \| null }` |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhAnchorLink` | `value` | `string` | 是 |  |
| `XhAnchorRoot` | `scrollElement` | `() => HTMLElement \| null` |  | 判定线所依附的滚动容器取值器，默认挂在窗口上；挂载效应执行时求值。 |
| `XhAnchorRoot` | `children` | `ReactNode` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `scrolling`

**事件**：`SPY.RESOLVE` · `LINK.CLICK` · `VALUE.SET` · `SCROLL.SETTLE` · `PRESS.START` · `PRESS.END`

**判据**：`isSmooth` · `isTargetReached` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前激活的锚点 id；没有区块越过判定线时为 null。 |
| `isActive` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: AnchorLinkProps) => T['element']` |  |
| `getLinkTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link | 跳到目标区块：smooth 关时由原生 &lt;a href="#id"&gt; 跳转，开时组件拦下并平滑滚动（两种情况都当场把激活项切过去，不等观察器） |
| `Enter` / `Space` | held in link | 按住期间该链接投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下。跳到目标区块照旧由这一次按键承担，激活项与按压互相独立 |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过目录里的链接；锚点导航不做 roving tabindex，每一条都是独立的 Tab 停靠点 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `link` | `aria-current` | 'location' \| undefined |
| `indicator` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/anchor.css` 使用 `[data-scope="anchor"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-pressed` | ''（条件成立时才出现） |
| `link` | `data-xh-collection-context` | 'nav' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `link-text` | `data-xh-collection-slot` | 'text' |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | context.get('value') |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-anchor-fg` | `link`<br>`root` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` | anchor 的 link、root 部件 color 覆盖槽。 |
| `--xh-anchor-font-size` | `link`<br>`root` | `font-size` | `default` | `--xh-_anchor-font-size` | anchor 的 link、root 部件 font-size 覆盖槽。 |
| `--xh-anchor-gap` | `list` | `gap` | `default` | `--xh-space-1` | anchor 的 list 部件 gap 覆盖槽。 |
| `--xh-anchor-gap-horizontal` | `list` | `gap` | `orientation=horizontal` | `--xh-space-2` | anchor 的 list 部件 gap 覆盖槽。 |
| `--xh-anchor-indicator-color` | `indicator`<br>`link` | `background` | `current`<br>`default` | `--xh-_anchor-accent` | anchor 的 indicator、link 部件 background 覆盖槽。 |
| `--xh-anchor-indicator-radius` | `indicator`<br>`link` | `border-radius` | `current`<br>`default` | `--xh-shape-pill` | anchor 的 indicator、link 部件 border-radius 覆盖槽。 |
| `--xh-anchor-indicator-thickness` | `indicator`<br>`link`<br>`list` | `block-size`<br>`inline-size`<br>`inset-block-end`<br>`inset-inline-start` | `current`<br>`default`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` | anchor 的 indicator、link、list 部件 block-size、inline-size、inset-block-end、inset-inline-start 覆盖槽。 |
| `--xh-anchor-leading` | `link`<br>`root` | `line-height` | `default` | `--xh-leading-normal` | anchor 的 link、root 部件 line-height 覆盖槽。 |
| `--xh-anchor-link-bg-hover` | `link` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` | anchor 的 link 部件 background-color 覆盖槽。 |
| `--xh-anchor-link-bg-pressed` | `link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` | anchor 的 link 部件 background-color 覆盖槽。 |
| `--xh-anchor-link-fg-current` | `link` | `color` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_anchor-accent-text` | anchor 的 link 部件 color 覆盖槽。 |
| `--xh-anchor-link-fg-hover` | `link` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-fg-default` | anchor 的 link 部件 color 覆盖槽。 |
| `--xh-anchor-link-font-weight-current` | `link` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-font-weight-medium` | anchor 的 link 部件 font-weight 覆盖槽。 |
| `--xh-anchor-link-max-w` | `link` | `max-inline-size` | `default` | `--xh-nav-link-max-w` | anchor 的 link 部件 max-inline-size 覆盖槽。 |
| `--xh-anchor-link-px` | `link` | `padding-inline` | `default` | `--xh-_anchor-link-px` | anchor 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-anchor-link-py` | `link` | `padding-block` | `default` | `--xh-space-1` | anchor 的 link 部件 padding-block 覆盖槽。 |
| `--xh-anchor-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | anchor 的 link 部件 border-radius 覆盖槽。 |
| `--xh-anchor-track` | `list` | `border-block-end`<br>`border-inline-start` | `default`<br>`orientation=horizontal` | `--xh-border-default` | anchor 的 list 部件 border-block-end、border-inline-start 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`block-size` · `inline-size` · `transform` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：值由内核逐帧算出（`frameLoop`），皮肤里看不到这段。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
