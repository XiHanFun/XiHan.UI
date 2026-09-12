# EmptyState <Badge type="info" text="空状态" />

没有数据时那一块：说清楚为什么空，以及可以做什么。

空态与结果页共用一副骨架：图标、标题、说明、操作四段与整页结果完全一致，所以 404、403、500
这类结果页也用本组件铺。`status` 只落成 root 的 `data-status`，皮肤据它给图标区上语气色，
不改任何语义、不带插画资产。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/empty-state" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/empty-state.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/empty-state" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/empty-state" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/empty-state.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

图标、标题、说明、操作四个槽都可选，只有 root 是必须的

<XhDemo src="empty-state/01-basic" />

## 示例

### 尺寸

size 只换留白与字号，语义一点不动；不传即 md

<XhDemo src="empty-state/02-size" />

### 播报方式

缺省 polite 让 root 成为活区，筛完就地播报；off 让它只是个普通容器

<XhDemo src="empty-state/03-live" />

### 用作结果页

同一套部件也承载 404、403 这类结果：status 给图标区上语气色，操作槽里放回退出口

<XhDemo src="empty-state/04-result" />

### 图标自带语气

图标槽里放一枚带 tone 的图标，着色落在图标自己身上，不经过 status

<XhDemo src="empty-state/05-tone-icon" />

### 结果类型

status 只落成 data-status，皮肤据它给图标区上语气色；画什么图标仍由作者塞

<XhDemo src="empty-state/06-status" />

## 设计指引

### 何时使用

- 列表、表格、搜索结果为空。
- 首次使用、还没有任何数据。

### 何时不用

- 数据在加载中：用[骨架屏](./skeleton)或[加载指示器](./spinner)。
- 只是一次轻量操作的反馈：用[轻提示](./toast)。

### 特性

- 图标、标题、描述、操作四段都可选。
- `live` 决定这块内容出现时读屏怎么播报——搜索结果变空时这一条很重要。
- `status` 决定图标区并进哪一族语气色：三个状态码各并进最接近的一族，另有成功、警示、出错、提示四档。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-empty-state>` |
| Vue 组件 | `XhEmptyStateAction` `XhEmptyStateDescription` `XhEmptyStateIndicator` `XhEmptyStateMedia` `XhEmptyStateRoot` `XhEmptyStateTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/empty-state.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="empty-state"`：**`root`** · `media` · `indicator` · `title` · `description` · `action`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `live` | `EmptyStateLive` |  | 缺省 polite。 |
| `size` | `Size` |  | 尺寸档位，只改留白与字号，不改语义。 |
| `status` | `EmptyStateStatus` |  | 结果类型，只落成 root 的 data-status；图标画什么由作者塞进图标槽。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。不给即维持中性。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `live` | `EmptyStateLive` | 生效的播报方式，缺省补齐后的值。 |
| `getRootProps` | `() => T['element']` |  |
| `getMediaProps` | `() => T['element']` | 插画槽：按自己的尺寸档量，与字形槽二选一。 |
| `getIndicatorProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getActionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `role` | undefined \| 'status' |
| `media` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/empty-state.css` 按部件选择：`[data-scope="empty-state"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-status` | props.status |
| `root` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-empty-state-action-gap` | `action` | `gap` | `default` | `--xh-space-2` | empty-state 的 action 部件 gap 覆盖槽。 |
| `--xh-empty-state-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | empty-state 的 description 部件 color 覆盖槽。 |
| `--xh-empty-state-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` | empty-state 的 description 部件 font-size 覆盖槽。 |
| `--xh-empty-state-description-leading` | `description` | `line-height` | `default` | `--xh-text-body-leading` | empty-state 的 description 部件 line-height 覆盖槽。 |
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

## 动效

关键帧 `xh-rise-in` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 图标用[图标块](./icon-wrapper)；操作用[按钮](./button)。

## 最佳实践

- 区分三种空：从来没有、筛选之后没有、搜索没结果。三者该说的话完全不同。
- 给一条出路：新建、清除筛选、换个关键词。
- 用作结果页时每一页都给回退出口：回首页、重试、联系支持。403 与 500 尤其需要。
- 失败页给可追溯的标识（请求号、时间），用户报障时用得上。

## 反模式

- 只画一个空盒子加"暂无数据"：用户不知道下一步做什么。
- 首次使用时的空状态跟筛选无结果长得一样。
- 只写"出错了"却不说是什么错，也不给下一步。
