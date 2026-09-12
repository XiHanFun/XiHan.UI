# Steps 步骤条

把一件事拆成有先后的几步，并标出走到哪一步了。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/steps" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/steps.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/steps" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/steps" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/steps.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 value 即为非受控；方向键只搬焦点，按 Enter 或空格才切步，进退方法由 root 的插槽交出来

<XhDemo src="steps/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="steps"`：**`root`** · **`list`** · **`item`** · **`trigger`** · `indicator` · `title` · `description` · `separator` · `content`

## 示例

### 受控

传了 value 就由宿主说了算，组件自己不再改步序；切步意图从 value-change 出来，写回才真的切

<XhDemo src="steps/02-controlled" />

### 线性模式

linear 下还没走到的步一律禁用，只能回头看走过的；它只拦界面上的乱跳，逐步前进照常

<XhDemo src="steps/03-linear" />

### 竖排

orientation="vertical" 把步骤列与面板并排摆，方向键随之改收上下键

<XhDemo src="steps/04-vertical" />

### 语气

tone 决定已完成与当前这两步的标记、连接线用哪族颜色；示例预置到第 2 步，第 1 步已走完

<XhDemo src="steps/05-tone" />

### 尺寸

size 换序号圆点的直径与标题、说明的字号，不传 size 即默认档

<XhDemo src="steps/06-size" />

### 点击切步与禁用某步

点标签直接切到那一步；单步标了 disabled 就点不动，方向键也跳过它

<XhDemo src="steps/07-click" />

### 出错的那一步

步序只认下标，「这一步出错了」是宿主自己的数据：在那一步的 item 上换掉标记与颜色令牌

<XhDemo src="steps/08-error-step" />

## 设计指引

### 何时使用

- 多步表单、开通流程、安装向导，步数固定且顺序明确。
- 需要让用户看见"还剩几步"。

### 何时不用

- 各段之间没有先后、可以随便切：那是[标签页](./tabs)。
- 展示已经发生的事件序列：用[时间线](./timeline)。

### 特性

- `count` 是步序的上界，也是读屏"第 k 步，共 n 步"的分母。
- `linear` 只拦界面上的乱跳（未解锁的入口一律禁用），逐步前进的方法照常可用。
- 方向键只搬焦点，按 Enter 或空格才切步。
- "这一步出错了"是宿主自己的数据：在那一步上换掉标记与颜色令牌即可。

### 组合

- 与[表单](./form)配合做分步表单；每步的内容放进 `content` 部件。

### 最佳实践

- 步数控制在三到五步，多了就把相邻两步合并。
- 每步的标题写用户要做的事，不写"第一步"。

### 反模式

- 步数会变：用户刚看到"共 3 步"，走到一半变成 5 步。
- 用它表达进度百分比：那是[进度条](./progress)。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-steps>` |
| Vue 组件 | `XhStepsContent` `XhStepsDescription` `XhStepsIndicator` `XhStepsItem` `XhStepsList` `XhStepsRoot` `XhStepsSeparator` `XhStepsTitle` `XhStepsTrigger` |
| 组合式函数 | `useSteps` |
| 状态机 | `stepsMachine` |
| 皮肤 | `@xihan-ui/styles/steps.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 当前步序（0 起）。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0。 |
| `collection` | `StepNode[]` |  | 步骤数据，标题、说明、状态与禁用的事实源。给了它，count 缺省即取它的长度。 缺省即回到「文本与状态都写在部件上」的老路。 |
| `statuses` | `Record<number, StepStatus>` |  | 按下标覆盖单步状态，优先于 collection 与步序算出来的那档。 error / warning 两档只能从这里或 collection 来。 |
| `count` | `number` |  | 总步数，是步序的上界与读屏"第 k 步，共 n 步"的分母。 缺省按 0 处理：此时 root 带 data-empty，步序被夹死在 0。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `linear` | `boolean` |  | 线性模式：只能回头看走过的步。未解锁（index &gt; step）的 trigger 一律禁用。 只拦跳转，goToNextStep 逐步前进照常可用。 |
| `disabled` | `boolean` |  | 整组不可交互：trigger 全部退出 Tab 序列，指针与键盘都不认。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 |
| `translations` | `Partial<StepsTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: StepsValueChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `StepsValueChangeDetails` | 步序变化；detail 为 `{ value: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhStepsRoot` | `default` | `StepsRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | s.status |
| `trigger` | s.status |
| `indicator` | getItemState(item).status |
| `title` | getItemState(item).status |
| `description` | getItemState(item).status |
| `separator` | getItemState(item).status |
| `content` | getItemState(item).status |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `STEP.PREV` · `STEP.NEXT` · `TRIGGER.FOCUS` · `LIST.BLUR`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number` | 当前步序，恒在 [0, count] 内：count 变小后停在越界步也读得到一个可用的值。 |
| `count` | `number` |  |
| `collection` | `readonly StepNodeMeta[]` | collection 推出的步骤元信息，按数据顺序排列；没给 collection 即空数组。 |
| `complete` | `boolean` | 全部走完（value 走到 count）。此时没有任何一步是 current，作者据此渲染完成页。 |
| `focusedStep` | `number \| null` | 焦点在组外时为 null。 |
| `getItemState` | `(props: StepsItemProps) => StepsItemState` |  |
| `setValue` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count]。 不认 linear：linear 只拦界面上的乱跳，不拦作者的命令式调用。 |
| `goToNextStep` | `() => void` |  |
| `goToPrevStep` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: StepsItemProps) => T['element']` |  |
| `getTriggerProps` | `(props: StepsItemProps) => T['button']` |  |
| `getIndicatorProps` | `(props: StepsItemProps) => T['element']` |  |
| `getTitleProps` | `(props: StepsItemProps) => T['element']` |  |
| `getDescriptionProps` | `(props: StepsItemProps) => T['element']` |  |
| `getSeparatorProps` | `(props: StepsItemProps) => T['element']` |  |
| `getContentProps` | `(props: StepsItemProps) => T['element']` | 面板按 index 与当前步配对；未命中的常挂并带 hidden。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个可停留 trigger（禁用与 linear 未解锁的跳过，尽头不回绕）；步序不变 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个可停留 trigger；步序不变 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, 未禁用且已解锁 | 把当前步切到焦点所在的那一步 |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-label` | props.translations.list |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'tablist' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-current` | 'step' \| undefined |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-posinset` | item.index + 1 \| undefined |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `aria-setsize` | normalizeStepCount(prop('count') ?? (collection.lengt… \| undefined |
| `trigger` | `role` | 'tab' |
| `indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'tabpanel' |

## 样式参考

### 皮肤

`@xihan-ui/styles/steps.css` 使用 `[data-scope="steps"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-orientation` | props.orientation |
| `item` | `data-state` | s.status |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | s.status |
| `indicator` | `data-state` | getItemState(item).status |
| `title` | `data-state` | getItemState(item).status |
| `description` | `data-state` | getItemState(item).status |
| `separator` | `data-orientation` | props.orientation |
| `separator` | `data-state` | getItemState(item).status |
| `content` | `data-state` | getItemState(item).status |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-steps-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | steps 的 content 部件 color 覆盖槽。 |
| `--xh-steps-content-min-inline-size` | `content`<br>`root` | `flex` | `orientation=vertical` | `--xh-measure-prose` | steps 的 content、root 部件 flex 覆盖槽。 |
| `--xh-steps-content-py` | `content` | `padding-block` | `default` | `--xh-stack-gap-md` | steps 的 content 部件 padding-block 覆盖槽。 |
| `--xh-steps-description-fg` | `description` | `color` | `default` | `--xh-fg-subtle` | steps 的 description 部件 color 覆盖槽。 |
| `--xh-steps-description-font-size` | `description` | `font-size` | `default` | `--xh-_steps-caption-font-size` | steps 的 description 部件 font-size 覆盖槽。 |
| `--xh-steps-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | steps 的 root 部件 gap 覆盖槽。 |
| `--xh-steps-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | steps 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-steps-indicator-bg` | `indicator` | `background` | `default` | `transparent` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-completed` | `indicator` | `background` | `state=completed` | `--xh-_steps-accent` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-border` | `indicator` | `border` | `default` | `--xh-border-control` | steps 的 indicator 部件 border 覆盖槽。 |
| `--xh-steps-indicator-border-completed` | `indicator` | `border-color` | `state=completed` | `--xh-_steps-accent` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-current` | `indicator` | `border-color` | `state=current` | `--xh-_steps-accent` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-disabled` | `indicator`<br>`item` | `border-color` | `disabled` | `--xh-border-subtle` | steps 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-error` | `indicator` | `border-color` | `state=error` | `--xh-fg-danger` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-warning` | `indicator` | `border-color` | `state=warning` | `--xh-fg-warning` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-completed` | `indicator` | `color` | `state=completed` | `--xh-_steps-on-accent` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-current` | `indicator` | `color` | `state=current` | `--xh-_steps-accent-text` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-disabled` | `indicator`<br>`item` | `color` | `disabled` | `--xh-fg-disabled` | steps 的 indicator、item 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-error` | `indicator` | `color` | `state=error` | `--xh-fg-danger` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-warning` | `indicator` | `color` | `state=warning` | `--xh-fg-warning` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-font-size` | `indicator` | `font-size` | `default` | `--xh-_steps-caption-font-size` | steps 的 indicator 部件 font-size 覆盖槽。 |
| `--xh-steps-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | steps 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-steps-indicator-shadow` | `indicator` | `box-shadow` | `state=completed` | `--xh-_steps-highlight` | steps 的 indicator 部件 box-shadow 覆盖槽。 |
| `--xh-steps-indicator-size` | `indicator`<br>`separator` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-_steps-indicator-size` | steps 的 indicator、separator 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-steps-item-gap` | `item` | `gap` | `default` | `--xh-space-2` | steps 的 item 部件 gap 覆盖槽。 |
| `--xh-steps-item-min-inline-size` | `item` | `min-inline-size` | `not(:last-child)`<br>`orientation=horizontal` | `--xh-layout-col-min-xs` | steps 的 item 部件 min-inline-size 覆盖槽。 |
| `--xh-steps-list-gap` | `list` | `gap` | `default` | `--xh-space-2` | steps 的 list 部件 gap 覆盖槽。 |
| `--xh-steps-separator-bg` | `separator` | `background` | `default` | `--xh-border-default` | steps 的 separator 部件 background 覆盖槽。 |
| `--xh-steps-separator-bg-completed` | `separator` | `background` | `state=completed` | `--xh-_steps-accent` | steps 的 separator 部件 background 覆盖槽。 |
| `--xh-steps-separator-min-length` | `separator` | `block-size`<br>`min-inline-size` | `default`<br>`orientation=vertical` | `--xh-space-4` | steps 的 separator 部件 block-size、min-inline-size 覆盖槽。 |
| `--xh-steps-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | steps 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-steps-separator-thickness` | `separator` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-stroke-thick` | steps 的 separator 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-steps-title-fg` | `title` | `color` | `default` | `--xh-fg-muted` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-active` | `title` | `color` | `is([data-state='current'], [data-state='completed'])`<br>`state=completed`<br>`state=current` | `--xh-fg-default` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-error` | `title` | `color` | `state=error` | `--xh-fg-danger` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-warning` | `title` | `color` | `state=warning` | `--xh-fg-warning` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-font-size` | `title` | `font-size` | `default` | `--xh-_steps-title-font-size` | steps 的 title 部件 font-size 覆盖槽。 |
| `--xh-steps-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` | steps 的 title 部件 font-weight 覆盖槽。 |
| `--xh-steps-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle-hover` | steps 的 trigger 部件 background 覆盖槽。 |
| `--xh-steps-trigger-gap` | `trigger` | `column-gap` | `default` | `--xh-control-gap-md` | steps 的 trigger 部件 column-gap 覆盖槽。 |
| `--xh-steps-trigger-p` | `separator`<br>`trigger` | `margin-inline-start`<br>`padding-block`<br>`padding-inline` | `default`<br>`orientation=vertical` | `--xh-control-px-sm`<br>`--xh-space-1` | steps 的 separator、trigger 部件 margin-inline-start、padding-block、padding-inline 覆盖槽。 |
| `--xh-steps-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | steps 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `box-shadow` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
