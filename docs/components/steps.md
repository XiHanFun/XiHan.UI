# Steps 步骤条

用于展示多步骤流程的进度。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/steps" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/steps.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/steps" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/steps" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/steps.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

展示流程进度与当前步骤内容

<XhDemo src="steps/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="steps"`：**`root`** · **`list`** · **`item`** · **`trigger`** · `indicator` · `title` · `description` · `separator` · `content`

## 示例

### 线性模式

只能返回已完成的步骤

<XhDemo src="steps/02-linear" />

### 垂直布局

展示纵向流程与步骤内容

<XhDemo src="steps/03-vertical" />

### 出错的步骤

用 tones 为被驳回的步骤标注 danger 语气，状态照常按步序计算

<XhDemo src="steps/04-error-step" />

## 设计指引

### 何时使用

- 多步表单、开通流程或安装向导。
- 流程步骤固定且顺序明确。

### 何时不用

- 可自由切换的并列内容，使用[标签页](./tabs)。
- 已发生的事件记录，使用[时间线](./timeline)。

### 特性

- 支持水平与垂直布局。
- 已完成、当前、未完成三种状态清晰区分；被退回或需要留意的步骤用 `tones`（或 collection 的 `tone`）标记语气，与状态互不相关。
- 当前步骤使用实心强调标记，已完成步骤使用中性面加品牌对号。
- `linear` 限制用户跳到尚未完成的步骤。
- 方向键移动焦点，Enter 或空格切换步骤。

### 组合

- 与[表单](./form)组合实现分步填写。
- 使用 `content` 展示当前步骤内容。

### 最佳实践

- 步数建议控制在三到五步。
- 标题描述任务，不使用“第一步”之类的编号文本。

### 反模式

- 不要在流程进行中改变步骤总数。
- 不要用步骤条表示连续百分比进度。

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
| `value` | `number` |  | 当前步序（0 起）。提供即受控：内部不再自行修改，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0。 |
| `collection` | `StepNode[]` |  | 步骤数据，标题、说明、状态与禁用的事实源。提供后 count 未提供时取它的长度。 未提供时回到文本与状态都写在部件上的方式。 |
| `statuses` | `Record<number, StepStatus>` |  | 按下标覆盖单步状态，优先于 collection 与步序计算出的档位。 |
| `tones` | `Record<number, Tone>` |  | 按下标给单步标记语气，优先于 collection；被驳回的步写 danger、需要留意的步写 warning。 写为 item 的 data-tone，该步的标记、标题与连接线都改用这族颜色。 |
| `count` | `number` |  | 总步数，是步序的上界与读屏「第 k 步，共 n 步」的分母。 未提供时按 0 处理：此时 root 带 data-empty，步序被固定在 0。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `linear` | `boolean` |  | 线性模式：只能回到已走过的步。未解锁（index &gt; step）的 trigger 一律禁用。 只拦截跳转，goToNextStep 逐步前进照常可用。 |
| `disabled` | `boolean` |  | 整组不可交互：trigger 全部退出 Tab 序列，指针与键盘都不响应。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft / ArrowRight 的前后语义。 |
| `translations` | `Partial<StepsTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: StepsValueChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |

### StepNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` |  | 标题文本。 |
| `description` | `string` |  | 说明文本。 |
| `status` | `StepStatus` |  | 覆盖该步的状态；未提供时由步序计算。 |
| `tone` | `Tone` |  | 该步的语气：被驳回的写 danger、需要留意的写 warning；未提供时跟随整组的 tone。 |
| `disabled` | `boolean` |  | 该步不可点击。 |

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

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhStepsContent` | `value` | `number \| string` | 是 |  |
| `XhStepsItem` | `value` | `number \| string` | 是 | 步骤下标，兼收字符串以支持模板属性字面量。 |
| `XhStepsItem` | `disabled` | `boolean` |  |  |
| `XhStepsRoot` | `children` | `SlotChildren<StepsRootSlotProps>` |  |  |

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

**事件**：`VALUE.SET` · `STEP.PREV` · `STEP.NEXT` · `TRIGGER.FOCUS` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number` | 当前步序，恒在 [0, count] 内：count 减小后停在越界步也能读到可用的值。 |
| `count` | `number` |  |
| `collection` | `readonly StepNodeMeta[]` | 由 collection 推导的步骤元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `complete` | `boolean` | 全部完成（value 到达 count）。此时没有任何一步是 current，作者据此渲染完成页。 |
| `focusedStep` | `number \| null` | 焦点在组外时为 null。 |
| `getItemState` | `(props: StepsItemProps) => StepsItemState` |  |
| `setValue` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count]。 不检查 linear：linear 只拦截界面上的跳转，不拦截作者的命令式调用。 |
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
| `getContentProps` | `(props: StepsItemProps) => T['element']` | 面板按 index 与当前步配对；未命中的常驻并带 hidden。 |

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
| `Enter` / `Space` | held in trigger, 未禁用且已解锁、组未禁用 | 按住期间该 trigger 投影 data-pressed，与指针 :active 同一副按压面（行与圆点一起换面）；抬起或失焦撤下，按住途中整组转入禁用也撤下。切步与按压互相独立 |
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
| `item` | `data-tone` | s.tone |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | s.status |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'row' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `indicator` | `data-state` | getItemState(item).status |
| `title` | `data-state` | getItemState(item).status |
| `description` | `data-state` | getItemState(item).status |
| `separator` | `data-orientation` | props.orientation |
| `separator` | `data-state` | getItemState(item).status |
| `content` | `data-state` | getItemState(item).status |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-steps-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | steps 的 content 部件 color 覆盖槽。 |
| `--xh-steps-content-min-inline-size` | `content`<br>`root` | `flex` | `orientation=vertical` | `--xh-measure-prose` | steps 的 content、root 部件 flex 覆盖槽。 |
| `--xh-steps-content-py` | `content` | `padding-block` | `default` | `--xh-stack-gap-md` | steps 的 content 部件 padding-block 覆盖槽。 |
| `--xh-steps-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | steps 的 description 部件 color 覆盖槽。 |
| `--xh-steps-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | steps 的 description 部件 font-size 覆盖槽。 |
| `--xh-steps-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | steps 的 root 部件 gap 覆盖槽。 |
| `--xh-steps-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-sm` | steps 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-steps-indicator-bg` | `indicator` | `background` | `default` | `--xh-bg-subtle` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-completed` | `indicator` | `background` | `state=completed` | `--xh-bg-subtle` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-completed-hover` | `indicator`<br>`trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`state=completed` | `--xh-_steps-host-bg-hover` | steps 的 indicator、trigger 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-current` | `indicator` | `background` | `state=current` | `--xh-_steps-accent` | steps 的 indicator 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-current-pressed` | `indicator`<br>`trigger` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`pressed`<br>`state=current` | `--xh-_tone-active` | steps 的 indicator、trigger 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-disabled` | `indicator`<br>`item` | `background` | `disabled` | `--xh-bg-muted` | steps 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-hover` | `indicator`<br>`trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`state=incomplete` | `--xh-_steps-host-bg-hover` | steps 的 indicator、trigger 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-pressed` | `indicator`<br>`trigger` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`is([data-state='incomplete'], [data-state='completed'])`<br>`not([data-disabled])`<br>`pressed`<br>`state=completed`<br>`state=incomplete` | `--xh-_steps-host-bg-pressed` | steps 的 indicator、trigger 部件 background 覆盖槽。 |
| `--xh-steps-indicator-bg-toned` | `indicator`<br>`item` | `background` | `state=incomplete`<br>`tone` | `--xh-_tone-subtle` | steps 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-steps-indicator-border` | `indicator` | `border` | `default` | `transparent` | steps 的 indicator 部件 border 覆盖槽。 |
| `--xh-steps-indicator-border-completed` | `indicator` | `border-color` | `state=completed` | `transparent` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-current` | `indicator` | `border-color` | `state=current` | `--xh-_steps-accent` | steps 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-disabled` | `indicator`<br>`item` | `border-color` | `disabled` | `--xh-border-default` | steps 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-border-toned` | `indicator`<br>`item` | `border-color` | `state=incomplete`<br>`tone` | `--xh-_steps-accent` | steps 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-steps-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-completed` | `indicator` | `color` | `state=completed` | `--xh-_steps-accent-mark` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-current` | `indicator` | `color` | `state=current` | `--xh-_steps-on-accent` | steps 的 indicator 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-disabled` | `indicator`<br>`item` | `color` | `disabled` | `--xh-fg-disabled` | steps 的 indicator、item 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-hover` | `indicator`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`state=incomplete` | `--xh-fg-default` | steps 的 indicator、trigger 部件 color 覆盖槽。 |
| `--xh-steps-indicator-fg-toned` | `indicator`<br>`item` | `color` | `state=incomplete`<br>`tone` | `--xh-_steps-accent-text` | steps 的 indicator、item 部件 color 覆盖槽。 |
| `--xh-steps-indicator-font-size` | `indicator` | `font-size` | `default` | `--xh-_steps-caption-font-size` | steps 的 indicator 部件 font-size 覆盖槽。 |
| `--xh-steps-indicator-mark-size` | `indicator` | `--xh-icon-size` | `default` | `--xh-control-indicator-size` | steps 的 indicator 部件 --xh-icon-size 覆盖槽。 |
| `--xh-steps-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-circle` | steps 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-steps-indicator-shadow` | `indicator` | `box-shadow` | `state=current` | `--xh-_steps-highlight` | steps 的 indicator 部件 box-shadow 覆盖槽。 |
| `--xh-steps-indicator-size` | `indicator`<br>`separator` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-_steps-indicator-size` | steps 的 indicator、separator 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-steps-item-gap` | `item` | `gap` | `default` | `--xh-space-2` | steps 的 item 部件 gap 覆盖槽。 |
| `--xh-steps-item-min-inline-size` | `item` | `min-inline-size` | `not(:last-child)`<br>`orientation=horizontal` | `--xh-space-0` | steps 的 item 部件 min-inline-size 覆盖槽。 |
| `--xh-steps-list-gap` | `list` | `gap` | `default` | `--xh-space-0` | steps 的 list 部件 gap 覆盖槽。 |
| `--xh-steps-separator-bg` | `separator` | `background` | `default` | `--xh-border-default` | steps 的 separator 部件 background 覆盖槽。 |
| `--xh-steps-separator-bg-completed` | `separator` | `background` | `state=completed` | `--xh-_steps-accent` | steps 的 separator 部件 background 覆盖槽。 |
| `--xh-steps-separator-min-length` | `separator` | `block-size`<br>`min-inline-size` | `default`<br>`orientation=vertical` | `--xh-space-4`<br>`--xh-space-7` | steps 的 separator 部件 block-size、min-inline-size 覆盖槽。 |
| `--xh-steps-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | steps 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-steps-separator-thickness` | `separator` | `block-size`<br>`inline-size`<br>`margin-inline-start`<br>`min-inline-size` | `default`<br>`orientation=vertical` | `--xh-stroke-thick` | steps 的 separator 部件 block-size、inline-size、margin-inline-start、min-inline-size 覆盖槽。 |
| `--xh-steps-title-fg` | `title` | `color` | `default` | `--xh-fg-muted` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-active` | `title` | `color` | `is([data-state='current'], [data-state='completed'])`<br>`state=completed`<br>`state=current` | `--xh-_steps-accent-text` | steps 的 title 部件 color 覆盖槽。 |
| `--xh-steps-title-fg-toned` | `item`<br>`title` | `color` | `tone` | `--xh-_steps-accent-text` | steps 的 item、title 部件 color 覆盖槽。 |
| `--xh-steps-title-font-size` | `title` | `font-size` | `default` | `--xh-_steps-title-font-size` | steps 的 title 部件 font-size 覆盖槽。 |
| `--xh-steps-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` | steps 的 title 部件 font-weight 覆盖槽。 |
| `--xh-steps-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | steps 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-steps-trigger-bg-pressed` | `trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | steps 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-steps-trigger-gap` | `trigger` | `column-gap` | `default` | `--xh-control-gap-md` | steps 的 trigger 部件 column-gap 覆盖槽。 |
| `--xh-steps-trigger-p` | `separator`<br>`trigger` | `margin-inline-start`<br>`padding-block`<br>`padding-inline` | `default`<br>`orientation=vertical`<br>`xh-action-profile=row` | `--xh-control-px-sm`<br>`--xh-space-1` | steps 的 separator、trigger 部件 margin-inline-start、padding-block、padding-inline 覆盖槽。 |
| `--xh-steps-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | steps 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

`background-color` · `border-color` · `box-shadow` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
