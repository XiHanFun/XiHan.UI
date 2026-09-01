# 步骤条 <Badge type="info" text="steps" />

把一件事拆成有先后的几步，并标出走到哪一步了。

## 何时使用

- 多步表单、开通流程、安装向导，步数固定且顺序明确。
- 需要让用户看见"还剩几步"。

## 何时不用

- 各段之间没有先后、可以随便切：那是[标签页](./tabs)。
- 展示已经发生的事件序列：用[时间线](./timeline)。

## 特性

- `count` 是步序的上界，也是读屏"第 k 步，共 n 步"的分母。
- `linear` 只拦界面上的乱跳（未解锁的入口一律禁用），逐步前进的方法照常可用。
- 方向键只搬焦点，按 Enter 或空格才切步。
- "这一步出错了"是宿主自己的数据：在那一步上换掉标记与颜色令牌即可。

## 示例

### 基础用法

不传 step 即为非受控；方向键只搬焦点，按 Enter 或空格才切步，进退方法由 root 的插槽交出来

<XhDemo src="steps/01-basic" />

### 受控

传了 step 就由宿主说了算，组件自己不再改步序；切步意图从 step-change 出来，写回才真的切

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-steps>` |
| Vue 组件 | `XhStepsContent` `XhStepsDescription` `XhStepsIndicator` `XhStepsItem` `XhStepsList` `XhStepsRoot` `XhStepsSeparator` `XhStepsTitle` `XhStepsTrigger` |
| 组合式函数 | `useSteps` |
| 状态机 | `stepsMachine` |
| 皮肤 | `@xihan-ui/styles/steps.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="steps"`：**`root`** · **`list`** · **`item`** · **`trigger`** · `indicator` · `title` · `description` · `separator` · `content`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `step` | `number` |  | 当前步序（0 起）。给定即受控：内部不再自改，只发 onStepChange。 |
| `defaultStep` | `number` |  | 非受控初值，默认 0。 |
| `count` | `number` |  | 总步数，是步序的上界与读屏"第 k 步，共 n 步"的分母。 缺省按 0 处理：此时 root 带 data-empty，步序被夹死在 0。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `linear` | `boolean` |  | 线性模式：只能回头看走过的步。未解锁（index &gt; step）的 trigger 一律禁用。 只拦跳转，goToNextStep 逐步前进照常可用。 |
| `disabled` | `boolean` |  | 整组不可交互：trigger 全部退出 Tab 序列，指针与键盘都不认。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onStepChange` | `(details: StepsStepChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `step-change` | `StepsStepChangeDetails` | 步序变化；detail 为 `{ step: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhStepsRoot` | `default` | `StepsRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item` | s.status |
| `trigger` | s.status |
| `indicator` | getItemState(item).status |
| `title` | getItemState(item).status |
| `description` | getItemState(item).status |
| `separator` | getItemState(item).status |
| `content` | getItemState(item).status |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`STEP.SET` · `STEP.PREV` · `STEP.NEXT` · `TRIGGER.FOCUS` · `LIST.BLUR`

## connect API

`useSteps` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `step` | `number` | 当前步序，恒在 [0, count] 内：count 变小后停在越界步也读得到一个可用的值。 |
| `count` | `number` |  |
| `complete` | `boolean` | 全部走完（step 走到 count）。此时没有任何一步是 current，作者据此渲染完成页。 |
| `focusedStep` | `number \| null` | 焦点在组外时为 null。 |
| `getItemState` | `(props: StepsItemProps) => StepsItemState` |  |
| `setStep` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count]。 不认 linear：linear 只拦界面上的乱跳，不拦作者的命令式调用。 |
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

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个可停留 trigger（禁用与 linear 未解锁的跳过，尽头不回绕）；步序不变 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个可停留 trigger；步序不变 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, 未禁用且已解锁 | 把当前步切到焦点所在的那一步 |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'tablist' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-current` | 'step' \| undefined |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-posinset` | item.index + 1 \| undefined |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `aria-setsize` | normalizeStepCount(prop('count')) \| undefined |
| `trigger` | `role` | 'tab' |
| `indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'tabpanel' |

## 样式

默认皮肤 `@xihan-ui/styles/steps.css` 按部件选择：`[data-scope="steps"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-steps-content-fg` · `--xh-steps-content-py` · `--xh-steps-description-fg` · `--xh-steps-description-font-size` · `--xh-steps-gap` · `--xh-steps-icon-size` · `--xh-steps-indicator-bg` · `--xh-steps-indicator-bg-completed` · `--xh-steps-indicator-border` · `--xh-steps-indicator-border-completed` · `--xh-steps-indicator-border-current` · `--xh-steps-indicator-border-disabled` · `--xh-steps-indicator-fg` · `--xh-steps-indicator-fg-completed` · `--xh-steps-indicator-fg-current` · `--xh-steps-indicator-fg-disabled` · `--xh-steps-indicator-font-size` · `--xh-steps-indicator-radius` · `--xh-steps-indicator-shadow` · `--xh-steps-indicator-size` · `--xh-steps-item-gap` · `--xh-steps-list-gap` · `--xh-steps-separator-bg` · `--xh-steps-separator-bg-completed` · `--xh-steps-separator-min-length` · `--xh-steps-separator-radius` · `--xh-steps-separator-thickness` · `--xh-steps-title-fg` · `--xh-steps-title-fg-active` · `--xh-steps-title-font-size` · `--xh-steps-title-font-weight` · `--xh-steps-trigger-bg-hover` · `--xh-steps-trigger-gap` · `--xh-steps-trigger-p` · `--xh-steps-trigger-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[表单](./form)配合做分步表单；每步的内容放进 `content` 部件。

## 最佳实践

- 步数控制在三到五步，多了就把相邻两步合并。
- 每步的标题写用户要做的事，不写"第一步"。

## 反模式

- 步数会变：用户刚看到"共 3 步"，走到一半变成 5 步。
- 用它表达进度百分比：那是[进度条](./progress)。
