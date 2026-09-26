# EmptyState 空状态

没有数据时的占位区域：说明为什么为空，以及可以做什么。

空状态与结果页共用同一套结构：图标、标题、说明、操作四段与整页结果完全一致，404、403、500 等结果页也使用本组件。`status` 只接受这三个状态码，只落为 root 的 `data-status`，皮肤据此把图标区并入最接近的一族语气色，不改变语义、不带插画资源；成功、警示、出错、提示等通用结果使用全库统一的 `tone` 轴。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/empty-state" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/empty-state.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/empty-state" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/empty-state" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/empty-state.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

图标、标题、说明、操作四个槽都可选，只有 root 是必需的

<XhDemo src="empty-state/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="empty-state"`：**`root`** · `media` · `indicator` · `title` · `description` · `action`

## 示例

### 尺寸

size 只改变留白与字号，语义不变；不传即 md

<XhDemo src="empty-state/02-size" />

### 播报方式

默认 polite 使 root 成为活区，筛选完成后就地播报；off 使它只是一个普通容器

<XhDemo src="empty-state/03-live" />

### 用作结果页

同一套部件也承载 404、403 等结果：status 为图标区上语气色，操作槽中放置回退出口

<XhDemo src="empty-state/04-result" />

### 图标自带语气

图标槽中放置一个带 tone 的图标，着色落在图标自身上，不经过根上的 tone

<XhDemo src="empty-state/05-tone-icon" />

### 颜色

tone 为图标区上语气色，与全库同一根轴；绘制什么图标仍由作者放置

<XhDemo src="empty-state/06-tone" />

## 设计指引

### 何时使用

- 列表、表格、搜索结果为空。
- 首次使用、还没有任何数据。

### 何时不用

- 数据加载中时，使用[骨架屏](./skeleton)或[加载指示器](./spinner)。
- 一次轻量操作的反馈使用[轻提示](./toast)。

### 特性

- 图标、标题、描述、操作四段都可选。
- `live` 决定内容出现时读屏如何播报，搜索结果变空时尤其重要。
- `status` 只接受 404 / 403 / 500 三个状态码，各并入最接近的一族语气色；`tone` 直接指定语气，两者都写时以 `tone` 为准。
- 开幕只在出现时播放：页面加载完成之前挂上或服务端渲染后水合的空状态直接呈现；筛选、删除或新数据带来的出现，以及 root 从 `hidden` 恢复显示，图标、标题、说明、操作依次开幕。

### 组合

- 图标使用[图标块](./icon-wrapper)；操作使用[按钮](./button)。

### 最佳实践

- 区分三种空：从未有数据、筛选后为空、搜索无结果，三者的文案完全不同。
- 提供一条出路：新建、清除筛选、更换关键词。
- 用作结果页时每一页都提供回退出口：回首页、重试、联系支持，403 与 500 尤其需要。
- 失败页提供可追溯的标识（请求号、时间），便于用户报障。

### 反模式

- 只显示一个空盒子加“暂无数据”，用户不知道下一步做什么。
- 首次使用的空状态与筛选无结果的外观相同。
- 只写“出错了”，不说明错误内容，也不提供下一步。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-empty-state>` |
| Vue 组件 | `XhEmptyStateAction` `XhEmptyStateDescription` `XhEmptyStateIndicator` `XhEmptyStateMedia` `XhEmptyStateRoot` `XhEmptyStateTitle` |
| 状态机 | `emptyStateMachine` |
| 皮肤 | `@xihan-ui/styles/empty-state.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `live` | `EmptyStateLive` |  | 默认 polite。 |
| `size` | `Size` |  | 尺寸档位，只影响留白与字号，不改变语义。 |
| `status` | `EmptyStateStatus` |  | 结果页的状态码，只写为 root 的 data-status；皮肤据此把图标区并入最接近的一族语气色，图标内容由作者放入图标槽。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定图标区使用哪族颜色；与 status 都提供时以它为准。未提供时保持中性。 |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`APPEARANCE.RELEASE`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `live` | `EmptyStateLive` | 生效的播报方式，默认值补齐后的结果。 |
| `getRootProps` | `() => T['element']` |  |
| `getMediaProps` | `() => T['element']` | 插画槽：按自身的尺寸档测量，与字形槽二选一。 |
| `getIndicatorProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getActionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `role` | undefined \| 'status' |
| `media` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/empty-state.css` 使用 `[data-scope="empty-state"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-status` | props.status |
| `root` | `data-tone` | props.tone |
| `media` | `data-instant` | ''（条件成立时才出现） |
| `indicator` | `data-instant` | ''（条件成立时才出现） |
| `title` | `data-instant` | ''（条件成立时才出现） |
| `description` | `data-instant` | ''（条件成立时才出现） |
| `action` | `data-instant` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-empty-state-action-gap` | `action` | `gap` | `default` | `--xh-space-2` | empty-state 的 action 部件 gap 覆盖槽。 |
| `--xh-empty-state-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | empty-state 的 description 部件 color 覆盖槽。 |
| `--xh-empty-state-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | empty-state 的 description 部件 font-size 覆盖槽。 |
| `--xh-empty-state-description-leading` | `description` | `line-height` | `default` | `--xh-leading-normal` | empty-state 的 description 部件 line-height 覆盖槽。 |
| `--xh-empty-state-description-max-w` | `description` | `max-inline-size` | `default` | `--xh-measure-prose` | empty-state 的 description 部件 max-inline-size 覆盖槽。 |
| `--xh-empty-state-fg` | `root` | `color` | `default` | `--xh-fg-default` | empty-state 的 root 部件 color 覆盖槽。 |
| `--xh-empty-state-gap` | `root` | `gap` | `default` | `--xh-_empty-state-gap` | empty-state 的 root 部件 gap 覆盖槽。 |
| `--xh-empty-state-icon-size` | `indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-_empty-state-icon-size` | empty-state 的 indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-empty-state-indicator-fg` | `indicator` | `color` | `default` | `--xh-_empty-state-accent` | empty-state 的 indicator 部件 color 覆盖槽。 |
| `--xh-empty-state-indicator-font-size` | `indicator` | `font-size` | `default` | `--xh-_empty-state-icon-size` | empty-state 的 indicator 部件 font-size 覆盖槽。 |
| `--xh-empty-state-media-fg` | `media` | `color` | `default` | `--xh-_empty-state-accent` | empty-state 的 media 部件 color 覆盖槽。 |
| `--xh-empty-state-media-size` | `media` | `block-size` | `default` | `--xh-_empty-state-icon-size` | empty-state 的 media 部件 block-size 覆盖槽。 |
| `--xh-empty-state-px` | `root` | `padding-inline` | `default` | `--xh-space-6` | empty-state 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-empty-state-py` | `root` | `padding-block` | `default` | `--xh-_empty-state-py` | empty-state 的 root 部件 padding-block 覆盖槽。 |
| `--xh-empty-state-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | empty-state 的 title 部件 color 覆盖槽。 |
| `--xh-empty-state-title-font-size` | `title` | `font-size` | `default` | `--xh-_empty-state-title-size` | empty-state 的 title 部件 font-size 覆盖槽。 |
| `--xh-empty-state-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | empty-state 的 title 部件 font-weight 覆盖槽。 |
| `--xh-empty-state-title-leading` | `title` | `line-height` | `default` | `--xh-leading-tight` | empty-state 的 title 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-rise-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
