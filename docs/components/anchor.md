# Anchor <Badge type="info" text="锚点" />

一份跟着滚动位置自己换高亮的目录。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/anchor" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/anchor.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/anchor" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/anchor" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/anchor.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

目录跟着滚动位置自己换高亮；scroll-element 把判定线挂到指定滚动容器上，不给就挂在窗口上

<XhDemo src="anchor/01-basic" />

## 示例

### 受控

传了 value 就由宿主说了算；一节都没越过判定线时它是 null，此时谁都不亮、指示条整条收起

<XhDemo src="anchor/02-controlled" />

### 判定线偏移

offset 是判定线距容器视口顶边的距离，有吸顶栏就把栏高填进去，越过它的最后一节才算当前节

<XhDemo src="anchor/03-offset" />

### 横排目录

orientation="horizontal" 只改样式：条目排成一行，轨道与指示条从起始缘挪到底边

<XhDemo src="anchor/04-horizontal" />

### 语气

tone 换的是选中那一节的指示条与文字颜色，这里用 default-value 预置「用法」为选中项

<XhDemo src="anchor/05-tone" />

### 尺寸

size 换条目的字号与左右内边距，不传 size 即默认档

<XhDemo src="anchor/06-size" />

### 吸顶目录

目录用 sticky 钉在滚动容器顶边，滚动时留在原处；判定线仍由 offset 定

<XhDemo src="anchor/07-affix" />

### 二级目录

子链接嵌在父项里的原生列表中，按文档序照常参与结算；父级要不要跟着亮由宿主自己算

<XhDemo src="anchor/08-nested" />

### 从外部跳到某一节

组件只在点链接时滚动；程序化跳转由宿主自己滚，滚完观察器会把高亮结算过来

<XhDemo src="anchor/09-scroll-to" />

## 设计指引

### 何时使用

- 长文档、设置页、详情页需要一份能跳转也能反映当前位置的目录。

### 何时不用

- 内容分段但互不相邻、需要切换而不是滚动：用[标签页](./tabs)。
- 只是一组跳转链接、不需要反映当前位置：写普通链接就好。

### 特性

- `offset` 是判定线距容器视口顶边的距离，有吸顶栏就把栏高填进去。
- 一节都没越过判定线时当前值是 `null`，此时谁都不亮、指示条整条收起——不硬点亮第一项。
- `scrollElement` 把判定线挂到指定滚动容器上，不给就挂在窗口上。
- 组件只在点链接时滚动；程序化跳转由宿主自己滚，滚完观察器会把高亮结算过来。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-anchor>` |
| Vue 组件 | `XhAnchorIndicator` `XhAnchorItem` `XhAnchorLink` `XhAnchorLinkText` `XhAnchorList` `XhAnchorRoot` |
| 组合式函数 | `useAnchor` |
| 状态机 | `anchorMachine` |
| 皮肤 | `@xihan-ui/styles/anchor.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="anchor"`：**`root`** · **`list`** · **`item`** · **`link`** · `link-text` · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| null` |  | 当前激活的锚点 id，给定即受控。 |
| `defaultValue` | `string \| null` |  |  |
| `collection` | `readonly string[]` |  | 目标区块的 id 清单，按文档序给；不给则按渲染出来的 link 现查。 |
| `offset` | `number` |  | 判定线距滚动容器视口顶边的距离（px），默认 0。 |
| `bounds` | `number` |  | 压线判定的容差（px），默认 1；区块顶边落在判定线下方这个距离内仍算越过。 |
| `smooth` | `boolean` |  | 点链接时平滑滚动到目标，默认 false。 |
| `dir` | `Direction` |  | 文字方向，作用于排版与指示条的起始缘。 |
| `orientation` | `Orientation` |  | 列表轴向，默认 vertical，只影响样式。 |
| `translations` | `Partial<AnchorTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: AnchorValueChangeDetails) => void` |  | value 变化意图回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `AnchorValueChangeDetails` | 激活项变化；detail 为 `{ value: string \| null }` |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `scrolling`

**事件**：`SPY.RESOLVE` · `LINK.CLICK` · `VALUE.SET` · `after.scrollLock`

**判据**：`isSmooth` · `isTargetReached`

## connect API

`useAnchor` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前激活的锚点 id；一个都没越过判定线时为 null。 |
| `isActive` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: AnchorLinkProps) => T['element']` |  |
| `getLinkTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link | 跳到目标区块：smooth 关时由原生 &lt;a href="#id"&gt; 跳转，开时组件拦下并平滑滚动（两种情况都当场把激活项切过去，不等观察器） |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过目录里的链接；锚点导航不做 roving tabindex，每一条都是独立的 Tab 停靠点 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `link` | `aria-current` | 'location' \| undefined |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/anchor.css` 按部件选择：`[data-scope="anchor"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `link` | `data-current` | ''（条件成立时才出现） |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | context.get('value') |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-anchor-fg` | `root` | `color` | `default` | `--xh-fg-muted` | anchor 的 root 部件 color 覆盖槽。 |
| `--xh-anchor-font-size` | `root` | `font-size` | `default` | `--xh-_anchor-font-size` | anchor 的 root 部件 font-size 覆盖槽。 |
| `--xh-anchor-gap` | `list` | `gap` | `default` | `--xh-space-1` | anchor 的 list 部件 gap 覆盖槽。 |
| `--xh-anchor-gap-horizontal` | `list` | `gap` | `orientation=horizontal` | `--xh-space-2` | anchor 的 list 部件 gap 覆盖槽。 |
| `--xh-anchor-indicator-color` | `indicator` | `background` | `default` | `--xh-_anchor-accent` | anchor 的 indicator 部件 background 覆盖槽。 |
| `--xh-anchor-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | anchor 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-anchor-indicator-thickness` | `indicator` | `block-size`<br>`inline-size`<br>`inset-block-end`<br>`inset-inline-start` | `default`<br>`orientation=horizontal` | `--xh-stroke-thick` | anchor 的 indicator 部件 block-size、inline-size、inset-block-end、inset-inline-start 覆盖槽。 |
| `--xh-anchor-leading` | `root` | `line-height` | `default` | `--xh-leading-normal` | anchor 的 root 部件 line-height 覆盖槽。 |
| `--xh-anchor-link-bg-hover` | `link` | `background` | `hover` | `--xh-bg-subtle-hover` | anchor 的 link 部件 background 覆盖槽。 |
| `--xh-anchor-link-fg-current` | `link` | `color` | `current` | `--xh-_anchor-accent-text` | anchor 的 link 部件 color 覆盖槽。 |
| `--xh-anchor-link-fg-hover` | `link` | `color` | `hover` | `--xh-fg-default` | anchor 的 link 部件 color 覆盖槽。 |
| `--xh-anchor-link-font-weight-current` | `link` | `font-weight` | `current` | `--xh-font-weight-medium` | anchor 的 link 部件 font-weight 覆盖槽。 |
| `--xh-anchor-link-max-w` | `link` | `max-inline-size` | `default` | `--xh-nav-link-max-w` | anchor 的 link 部件 max-inline-size 覆盖槽。 |
| `--xh-anchor-link-px` | `link` | `padding-inline` | `default` | `--xh-_anchor-link-px` | anchor 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-anchor-link-py` | `link` | `padding-block` | `default` | `--xh-space-1` | anchor 的 link 部件 padding-block 覆盖槽。 |
| `--xh-anchor-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | anchor 的 link 部件 border-radius 覆盖槽。 |
| `--xh-anchor-track` | `list` | `border-block-end`<br>`border-inline-start` | `default`<br>`orientation=horizontal` | `--xh-border-default` | anchor 的 list 部件 border-block-end、border-inline-start 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `block-size` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[固钉](./affix)做吸顶目录；与[排印](./typography)的长正文配合。

## 最佳实践

- 有吸顶栏一定要设 `offset`，否则当前节总比看到的早一节。
- 目录项文字与正文标题一字不差，用户才对得上。

## 反模式

- 目录层级超过两级：读起来比正文还费劲。
- 用它同时承担"跳转"和"切换视图"两件事。
