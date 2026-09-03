# 澄清问卷 <Badge type="info" text="question-flow" />

动手之前先问几句：一次一题，人逐题作答，答完一起提交。

## 何时使用

- 需求还差几处没说清，把含糊的地方拆成几道选择题问回去。
- 一次要问的不止一件事，而每件都只要一两秒就能答完。

## 何时不用

- 只问一件事：那是一个[单选组](./radio-group)或[复选框组](./checkbox-group)，不必套一层问卷。
- 要人批准一次危险动作：那是闸门，用[审批](./approval)——它的出口只有批准与拒绝两条，
  没有「跳过」，也没有「答完再说」。
- 要收一份长表单：字段之间有校验与联动，用[表单](./form)。

## 特性

- **一次只暴露一题**：非当前题对读屏 `aria-hidden`、对键盘 `inert`，里面的可聚焦物另发 `tabindex="-1"`。
  它们仍留在轨道上，只是走不到——这样卡片高度才有得可量，来回翻页也不必重建 DOM。
- **高度与位移是量出来的，不是猜的**：机器在活 DOM 上量当前题的盒，把结果写进 context，
  连接层只把它格式化成两个私有槽（视口高度与轨道位移）。连接层是渲染期纯函数，
  不查 DOM、不起定时器、不读时钟。
- **单选自动前进，多选等人点继续**：选中一项后隔一小段自动翻到下一题；连着改主意时，
  每改一次都从整段延时重新计。**自动前进只走下一题**——末题上它停住，不替人按发送。
- **一颗按钮两个身份**：不是末题时是「继续」，末题时是「发送」。它原位换 `data-mode` 与可访问名，
  正在按它的人不会按空。
- **自由文本与选项同等算数**：写了一句「都不是，我想要……」就算答过了这一题，继续键随之亮起。
- 进度只播报一次：`counter` 那格 `aria-hidden`，逐题跳动的数字不进活区；
  换题与交卷由 `announcement` 念一句。
- 跳过是明路：`allowSkip` 关掉时整颗跳过键收起，而不是留一颗按不动的按钮。
  末题上跳过即交卷——否则最后一题没有出口，人会被困在那里。

## 示例

### 基础用法

一次一题：单选选中后自动翻到下一题，多选等人点继续，末题上那颗按钮变成发送

<XhDemo src="question-flow/01-basic" />

### 自由文本与跳过

选项之外还能自己写一句，写了就算答过；关掉自动前进，每题都等人点继续

<XhDemo src="question-flow/02-note" />

### 受控当前题

进度归宿主管：外面的按钮直接跳题，答案也一并受控，组件只发意图

<XhDemo src="question-flow/03-controlled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-question-flow>` |
| Vue 组件 | `XhQuestionFlowCounter` `XhQuestionFlowFooter` `XhQuestionFlowLiveRegion` `XhQuestionFlowNextTrigger` `XhQuestionFlowNote` `XhQuestionFlowOption` `XhQuestionFlowOptionGroup` `XhQuestionFlowOptionIndicator` `XhQuestionFlowOptionLabel` `XhQuestionFlowPrevTrigger` `XhQuestionFlowPrompt` `XhQuestionFlowQuestion` `XhQuestionFlowResult` `XhQuestionFlowRoot` `XhQuestionFlowSkipTrigger` `XhQuestionFlowSubmitTrigger` `XhQuestionFlowTrack` `XhQuestionFlowViewport` |
| 组合式函数 | `useQuestionFlow` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/question-flow.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="question-flow"`：**`root`** · `viewport` · **`track`** · **`question`** · `prompt` · `option-group` · `option` · `option-indicator` · `option-label` · `note` · `footer` · `prev-trigger` · `counter` · `next-trigger` · `skip-trigger` · **`submit-trigger`** · `result` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `questions` | `readonly QuestionFlowQuestion[]` |  |  |
| `index` | `number` |  | 当前题下标。给定即受控：内部不再自改，只发 onIndexChange。 |
| `defaultIndex` | `number` |  |  |
| `answers` | `QuestionFlowAnswers` |  | 答案表。给定即受控。 |
| `defaultAnswers` | `QuestionFlowAnswers` |  |  |
| `notes` | `QuestionFlowNotes` |  | 自由文本表。给定即受控。 |
| `defaultNotes` | `QuestionFlowNotes` |  |  |
| `status` | `QuestionFlowStatus` |  | 答题状态。给定即受控。 |
| `defaultStatus` | `QuestionFlowStatus` |  |  |
| `autoAdvance` | `boolean` |  | 单选选中后自动走下一题，默认开。 **它只走下一题，末题上不会替人按发送。** |
| `autoAdvanceDelay` | `number` |  | 自动前进前等多久（毫秒），默认 480。非有限值或负数不起计时器。 |
| `allowSkip` | `boolean` |  | 允许跳过，默认开。关掉后跳过按钮收起，SKIP 事件也不再生效。 |
| `loop` | `boolean` |  | 选项组内漫游走到尽头是否回绕，默认 true。 |
| `variant` | `ControlVariant` |  |  |
| `tone` | `Tone` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<QuestionFlowTranslations>` |  |  |
| `onIndexChange` | `(details: QuestionFlowIndexChangeDetails) => void` |  |  |
| `onAnswersChange` | `(details: QuestionFlowAnswersChangeDetails) => void` |  |  |
| `onNotesChange` | `(details: QuestionFlowNotesChangeDetails) => void` |  |  |
| `onSkip` | `(details: QuestionFlowSkipDetails) => void` |  |  |
| `onSubmit` | `(details: QuestionFlowSubmitDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `index-change` | `QuestionFlowIndexChangeDetails` | 当前题变化；detail 为 `{ index }` |
| `answers-change` | `QuestionFlowAnswersChangeDetails` | 答案变化；detail 为 `{ answers }` |
| `notes-change` | `QuestionFlowNotesChangeDetails` | 自由文本变化；detail 为 `{ notes }` |
| `skip` | `QuestionFlowSkipDetails` | 跳过一题；detail 为 `{ index, questionId }` |
| `submit` | `QuestionFlowSubmitDetails` | 交卷；detail 为 `{ answers, notes }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhQuestionFlowOption` | `default` | `QuestionFlowOptionSlotProps` |  |
| `XhQuestionFlowRoot` | `default` | `QuestionFlowRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `option` | 'checked' \| 'unchecked' |
| `option-indicator` | 'checked' \| 'unchecked' |
| `option-label` | 'checked' \| 'unchecked' |
| `result` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`OPTION.TOGGLE` · `NOTE.SET` · `GOTO` · `NEXT` · `PREV` · `SKIP` · `SUBMIT` · `VIEWPORT.MEASURE` · `after.autoAdvance` · `CONTROLLED.ANSWERING` · `CONTROLLED.SUBMITTED`

**判据**：`isStatusControlled` · `canToggle` · `canSkip` · `isFirstQuestion` · `isLastQuestion`

## connect API

`useQuestionFlow` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `QuestionFlowStatus` |  |
| `submitted` | `boolean` | 已经交卷了。 |
| `index` | `number` | 夹到题数范围内的当前题下标。 |
| `count` | `number` | 题数。 |
| `current` | `QuestionFlowQuestion \| undefined` | 当前题；一道题都没有时为 undefined。 |
| `isFirst` | `boolean` |  |
| `isLast` | `boolean` |  |
| `canAdvance` | `boolean` | 当前题答得能往下走了吗：选了选项、写了自由文本，或这题本就可跳过。 |
| `allowSkip` | `boolean` |  |
| `counter` | `string` | 给眼睛看的 N / M。它对读屏隐藏，进度由播报区念。 |
| `announcement` | `string` | 念给读屏的那一句：答题中念进度，交卷后念结果。 |
| `answers` | `QuestionFlowAnswers` |  |
| `notes` | `QuestionFlowNotes` |  |
| `answersOf` | `(questionId: string) => readonly string[]` |  |
| `noteOf` | `(questionId: string) => string` |  |
| `isOptionSelected` | `(questionId: string, value: string) => boolean` |  |
| `isCurrent` | `(questionId: string) => boolean` |  |
| `goTo` | `(index: number) => void` |  |
| `next` | `() => void` |  |
| `prev` | `() => void` |  |
| `skip` | `() => void` |  |
| `submit` | `() => void` |  |
| `toggleOption` | `(questionId: string, value: string) => void` |  |
| `setNote` | `(questionId: string, value: string) => void` |  |
| `measure` | `() => void` | 重量一遍当前题的几何。换题与题目增删都会自动重量，容器尺寸变化由尺寸观察器接住。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getQuestionProps` | `(props: QuestionFlowQuestionProps) => T['element']` |  |
| `getPromptProps` | `(props: QuestionFlowQuestionProps) => T['element']` |  |
| `getOptionGroupProps` | `(props: QuestionFlowQuestionProps) => T['element']` |  |
| `getOptionProps` | `(props: QuestionFlowOptionProps) => T['button']` |  |
| `getOptionIndicatorProps` | `(props: QuestionFlowOptionProps) => T['element']` |  |
| `getOptionLabelProps` | `(props: QuestionFlowOptionProps) => T['element']` |  |
| `getNoteProps` | `(props: QuestionFlowQuestionProps) => T['input']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getCounterProps` | `() => T['element']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getSkipTriggerProps` | `() => T['button']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |
| `getResultProps` | `() => T['element']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowDown` / `ArrowRight` | 焦点在当前题的选项上 | 焦点移到下一个可停留选项（禁用项跳过、尽头按 loop 回绕）；单选时同时选中它 |
| `ArrowUp` / `ArrowLeft` | 焦点在当前题的选项上 | 焦点移到上一个可停留选项；单选时同时选中它 |
| `Home` | 焦点在当前题的选项上 | 焦点移到首个可停留选项；单选时同时选中它 |
| `End` | 焦点在当前题的选项上 | 焦点移到末个可停留选项；单选时同时选中它 |
| `Space` | 焦点在当前题的选项上 | 切换该项。单选点已选中的那一项不取消 |
| `Enter` | 焦点在当前题的选项或自由文本上，且这一题答得能往下走 | 前进一题；已经在末题就交卷 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `question` | `aria-hidden` | undefined \| 'true' |
| `question` | `aria-label` | undefined \| translations?.prompt |
| `question` | `aria-labelledby` | `prompt` 部件的 id \| undefined |
| `question` | `role` | 'group' |
| `option-group` | `aria-label` | undefined \| translations?.options |
| `option-group` | `aria-labelledby` | `prompt` 部件的 id \| undefined |
| `option-group` | `role` | 'radiogroup' \| 'group' |
| `option` | `aria-checked` | 'true' \| 'false' |
| `option` | `aria-disabled` | 'true' \| 'false' |
| `option` | `role` | 'radio' \| 'checkbox' |
| `option-indicator` | `aria-hidden` | 'true' |
| `note` | `aria-label` | translations?.note |
| `prev-trigger` | `aria-label` | translations?.prev |
| `counter` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-label` | translations?.next |
| `skip-trigger` | `aria-label` | translations?.skip |
| `submit-trigger` | `aria-label` | translations?.send \| translations?.continue |
| `result` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |

- 每题是 `role=group`，题干是它的可访问名；题干缺席时退到 `translations.prompt`。
- 选项组按题型取 `role=radiogroup`（单选）或 `role=group`（多选），同样由题干命名；
  选项各自是 `role=radio` 或 `role=checkbox` 并显式报 `aria-checked`。
- 选项组内是漫游焦点：整组只占一个 Tab 位，落在选中项上，一个都没选时落首个可停留项。
- 上一题 / 下一题只给按钮入口，不吃全局按键——那会和选项漫游抢同一批方向键。
  这两颗通常只画一枚箭头，所以它们的可访问名**总会发出去**（`translations.prev` / `translations.next`，
  缺省 `Previous question` / `Next question`）；跳过键一般带可见文字，`translations.skip` 不给就不产出 `aria-label`。
- 自由文本那一格取 `translations.note` 作可及名（缺省 `Other answer`），
  占位文字另走 `translations.notePlaceholder`。
- 备注框与选项组都挡输入法组合态：组合期间的 Enter 是在确认候选词，不前进。

## 样式

默认皮肤 `@xihan-ui/styles/question-flow.css` 按部件选择：`[data-scope="question-flow"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | state.get() |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `question` | `data-current` | ''（条件成立时才出现） |
| `option-group` | `data-select-mode` | 'single' \| 'multiple' |
| `option` | `data-disabled` | ''（条件成立时才出现） |
| `option` | `data-select-mode` | 'single' \| 'multiple' |
| `option` | `data-state` | 'checked' \| 'unchecked' |
| `option-indicator` | `data-select-mode` | 'single' \| 'multiple' |
| `option-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `option-label` | `data-state` | 'checked' \| 'unchecked' |
| `option-label` | `data-value` | item.value |
| `submit-trigger` | `data-mode` | 'send' \| 'continue' |
| `result` | `data-state` | state.get() |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-question-flow-action-font-size` · `--xh-question-flow-action-font-weight` · `--xh-question-flow-action-gap` · `--xh-question-flow-action-h` · `--xh-question-flow-action-px` · `--xh-question-flow-action-radius` · `--xh-question-flow-bg` · `--xh-question-flow-border` · `--xh-question-flow-counter-fg` · `--xh-question-flow-counter-font-size` · `--xh-question-flow-dot-radius` · `--xh-question-flow-dot-size` · `--xh-question-flow-footer-gap` · `--xh-question-flow-gap` · `--xh-question-flow-icon-size` · `--xh-question-flow-indicator-bg` · `--xh-question-flow-indicator-bg-checked` · `--xh-question-flow-indicator-border` · `--xh-question-flow-indicator-border-checked` · `--xh-question-flow-indicator-fg` · `--xh-question-flow-indicator-radius` · `--xh-question-flow-indicator-radius-single` · `--xh-question-flow-indicator-size` · `--xh-question-flow-note-bg` · `--xh-question-flow-note-border` · `--xh-question-flow-note-fg` · `--xh-question-flow-note-font-size` · `--xh-question-flow-note-px` · `--xh-question-flow-note-py` · `--xh-question-flow-note-radius` · `--xh-question-flow-option-bg` · `--xh-question-flow-option-bg-hover` · `--xh-question-flow-option-fg` · `--xh-question-flow-option-fg-checked` · `--xh-question-flow-option-font-size` · `--xh-question-flow-option-gap` · `--xh-question-flow-option-group-gap` · `--xh-question-flow-option-px` · `--xh-question-flow-option-py` · `--xh-question-flow-option-radius` · `--xh-question-flow-padding` · `--xh-question-flow-placeholder-fg` · `--xh-question-flow-prompt-fg` · `--xh-question-flow-prompt-font-size` · `--xh-question-flow-prompt-font-weight` · `--xh-question-flow-question-gap` · `--xh-question-flow-radius` · `--xh-question-flow-result-bg` · `--xh-question-flow-result-fg` · `--xh-question-flow-result-font-size` · `--xh-question-flow-result-font-weight` · `--xh-question-flow-result-gap` · `--xh-question-flow-result-px` · `--xh-question-flow-result-py` · `--xh-question-flow-result-radius` · `--xh-question-flow-shadow` · `--xh-question-flow-skip-bg` · `--xh-question-flow-skip-bg-hover` · `--xh-question-flow-skip-fg` · `--xh-question-flow-skip-fg-hover` · `--xh-question-flow-step-bg` · `--xh-question-flow-step-bg-hover` · `--xh-question-flow-step-fg` · `--xh-question-flow-step-fg-hover` · `--xh-question-flow-step-padding` · `--xh-question-flow-step-radius` · `--xh-question-flow-step-size` · `--xh-question-flow-submit-bg` · `--xh-question-flow-submit-bg-active` · `--xh-question-flow-submit-bg-hover` · `--xh-question-flow-submit-bg-off` · `--xh-question-flow-submit-fg` · `--xh-question-flow-submit-shadow` · `--xh-question-flow-track-gap` · `--xh-question-flow-track-y` · `--xh-question-flow-viewport-h`

## 动效

关键帧 `xh-question-flow-in` · `xh-question-flow-result-in` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 步进计数器想做成里程表那样逐位滚动：把 `counter` 当容器，
  数字交给[数值动画](./number-animation)，判定权仍在本组件手里。
- 问卷收上来之后要接着执行危险动作：把[审批](./approval)排在它后面，两件事分开——
  问卷收的是「怎么做」，闸门收的是「做不做」。
- 装进[对话框](./dialog)时把 `initialFocus` 指到当前题的第一个选项上，
  打开即可直接用方向键作答。

## 最佳实践

- 题目控制在三到五道：这是「动手前问一句」，不是问卷调查。
- 单选题的选项写成互斥的完整答案，别让人靠自由文本补充关键信息。
- 提交之后卡片不会自己消失：**宿主要在 `onSubmit` 里决定接下来做什么**，
  想让它留在原地就渲 `result` 那一格。

## 反模式

- 用它承载不可逆的动作确认：问卷没有「拒绝」这条路，跳过与不答都会让流程继续往下走。
- 把 `counter` 的文字当播报：那一格对读屏隐藏，改它不会让任何人听见。
- 关掉自动前进的同时把继续键也藏了：那样单选题就再没有出口。
