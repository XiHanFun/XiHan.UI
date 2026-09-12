# Tooltip 文字提示

悬停或聚焦时出现的一句纯文字说明。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tooltip" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tooltip.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tooltip" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tooltip" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tooltip.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

悬停或聚焦触发器即出；指针停在提示上也不收起

<XhDemo src="tooltip/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="tooltip"`：**`trigger`** · `positioner` · **`content`** · `arrow`

## 示例

### 朝向

placement 是请求值，空间不够时由定位引擎避让；箭头跟着最终落定的那一面走

<XhDemo src="tooltip/02-placement" />

### 延时

openDelay 默认 700ms 用来防误触，closeDelay 默认 300ms 留出指针走位的余地；聚焦不走这两段等待

<XhDemo src="tooltip/03-delay" />

### 禁用

disabled 只关掉提示本身，被包裹的触发器照样可点、可聚焦

<XhDemo src="tooltip/04-disabled" />

### 语气

六种语气换的是浮层实心底与其上的文字色，箭头一并跟着走；把指针停在触发器上（或用 Tab 聚焦）看差别

<XhDemo src="tooltip/05-tone" />

### 尺寸

三档换的是浮层的内边距与字号，不写 size 即缺省档；把指针停在触发器上（或用 Tab 聚焦）看差别

<XhDemo src="tooltip/06-size" />

### 受控

传了 open 就由宿主说了算；悬停、聚焦、Escape 都只发意图，最终写不写由外面这份状态决定

<XhDemo src="tooltip/07-controlled" />

### 长文案

提示到了宽度上限就换行，不会拉成一条横线；上限是 content 上的 --xh-tooltip-max-w 槽位

<XhDemo src="tooltip/08-long-text" />

## 设计指引

### 何时使用

- 补充说明一个图标按钮是什么、一个截断的文字全文是什么。
- 内容是纯文字，且没有任何可交互元素。

### 何时不用

- 内容里有按钮或链接：用[气泡卡片](./popover)——提示是够不着的。
- 信息重要到不能错过：写在界面上，别藏进悬停。
- 触摸设备是主要场景：那里没有悬停。

### 特性

- `openDelay` / `closeDelay` 防止指针路过时一路闪。
- 聚焦也能触发，键盘用户拿得到。
- 语气与尺寸两轴。
- 默认保持反白的小型 M2 表面，与承载操作的 Popover 分开；六种语气都使用高遮蔽 tint 与不透明文字，箭头和气泡同色同边。
- 进退场只做侧向短移与透明度，120ms 内完成，不缩放文字和箭头。

### 组合

- 挂在[图标](./icon)按钮、[切换按钮](./toggle)、[文本截断](./truncate)上。

### 最佳实践

- 一句话讲完，超过一行就该换别的形式。
- 必须显示较长的单句时让它在最大宽度内换行；连续长词也会断行，不会把浮层撑出窄屏。
- 图标按钮的可及名字要写在按钮上（`aria-label`），提示只是视觉补充。

### 当前边界

- 当前尚无 TooltipProvider，多个目标间的统一 delay、skip-delay、同组互斥与触发器滚动关闭仍是后续独立行为功能；本次不以样式模拟这些时序。
- 共享浮层位移原语当前最小档是 4px；Tooltip 先与 Menu 使用同一 `xh-overlay-slide-in/out` 定义。规格中的 2px 需要新增公共 motion distance 档后统一接入，不能局部改写现有语义令牌。

### 反模式

- 把唯一的操作说明放进提示：触摸用户永远看不到。
- 提示里放链接。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tooltip>` |
| Vue 组件 | `XhTooltipArrow` `XhTooltipContent` `XhTooltipPositioner` `XhTooltipRoot` `XhTooltipTrigger` |
| 组合式函数 | `useTooltip` |
| 状态机 | `tooltipMachine` |
| 皮肤 | `@xihan-ui/styles/tooltip.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  | 浮层与锚点的间距（px）。 |
| `openDelay` | `number` |  | 悬停进入到展开的等待毫秒，默认 700。 |
| `closeDelay` | `number` |  | 悬停移出到收起的等待毫秒，默认 300。 |
| `disabled` | `boolean` |  | 只关闭提示本身，不影响被包裹控件的可用性。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定提示的底色与其上的文字色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定内边距与字号档位。 |
| `onOpenChange` | `(details: TooltipOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TooltipOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTooltipRoot` | `default` | `TooltipRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**事件**：`POINTER.ENTER` · `POINTER.LEAVE` · `POINTER.DOWN` · `FOCUS` · `BLUR` · `ESCAPE` · `OPEN` · `CLOSE` · `after.openDelay` · `after.closeDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isDisabled` · `isFocusOpened`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | not disabled | 焦点进入 trigger 立即展开、离开立即收起，都不走延时 |
| `Escape` | 展开中且本层在层栈栈顶，或 focus in trigger 且等待展开中 | 立即收起，不等 closeDelay；下层浮层不受这一次按键影响 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-describedby` | `content` 部件的 id \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `role` | 'tooltip' |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/tooltip.css` 使用 `[data-scope="tooltip"][data-part="trigger"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-tone` | props.tone |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tooltip-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | tooltip 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-tooltip-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-compact-backdrop` | tooltip 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-tooltip-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-_tooltip-solid` | tooltip 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-tooltip-border` | `arrow`<br>`content` | `border` | `default` | `--xh-_tooltip-border` | tooltip 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-tooltip-fg` | `content` | `color` | `default` | `--xh-_tooltip-on` | tooltip 的 content 部件 color 覆盖槽。 |
| `--xh-tooltip-font-size` | `content` | `font-size` | `default` | `--xh-_tooltip-font-size` | tooltip 的 content 部件 font-size 覆盖槽。 |
| `--xh-tooltip-highlight` | `content` | `box-shadow` | `default` | `--xh-_tooltip-highlight` | tooltip 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-tooltip-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | tooltip 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-tooltip-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | tooltip 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-tooltip-px` | `content` | `padding-inline` | `default` | `--xh-_tooltip-px` | tooltip 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-tooltip-py` | `content` | `padding-block` | `default` | `--xh-_tooltip-py` | tooltip 的 content 部件 padding-block 覆盖槽。 |
| `--xh-tooltip-radius` | `content` | `border-radius` | `default` | `--xh-shape-control` | tooltip 的 content 部件 border-radius 覆盖槽。 |
| `--xh-tooltip-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-compact-shadow` | tooltip 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-tooltip-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-sm` | tooltip 的 trigger 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
