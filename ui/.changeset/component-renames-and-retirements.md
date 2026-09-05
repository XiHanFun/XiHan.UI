---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**三个组件改名、四个组件退役。** 不留别名、不留 `var(新名, 旧名)` 双写、不留转发文件：下面列出的名字在无头层、两个适配器与皮肤里都不再存在，写下它们会得到「组件不存在」而不是降级渲染。

## 一、改名三条

### `ellipsis` → `truncate`

`ellipsis` 同时是 breadcrumb 与 pagination 的部件名，一个字面量指两个东西；而 `ellipsis` 命名的是「三个点」这个字形，组件做的是「截断 + 展开」。行为、部件与入口一个都没改，只是换了名字。

| 已删 | 换成 |
| --- | --- |
| Vue `<XhEllipsis>` | `<XhTruncate>` |
| 自定义元素 `<xh-ellipsis>` | `<xh-truncate>` |
| `useEllipsis` / 类型 `EllipsisContext` / `EllipsisSlotProps` | `useTruncate` / `TruncateContext` / `TruncateSlotProps` |
| `connectEllipsis` / `ellipsisAnatomy` / `ellipsisKeyboard` / `ellipsisMachine` / `ellipsisMeta` | 同名的 `truncate*` / `connectTruncate` |
| `ELLIPSIS_DEFAULT_LINES` / `isEllipsisOverflowing` / `resolveEllipsisLines` | `TRUNCATE_DEFAULT_LINES` / `isTruncateOverflowing` / `resolveTruncateLines` |
| 类型 `EllipsisApi` / `EllipsisSchema` / `EllipsisRefs` / `EllipsisMetrics` / `EllipsisTranslations` / `EllipsisExpandedChangeDetails` / `EllipsisOverflowChangeDetails` | 同名的 `Truncate*` |
| 类型 `XhEllipsisElement` | `XhTruncateElement` |
| `[data-scope='ellipsis']` | `[data-scope='truncate']` |
| 覆盖槽 `--xh-ellipsis-*`、内联私有槽 `--xh-_ellipsis-lines` | `--xh-truncate-*`、`--xh-_truncate-lines` |
| 子入口 `@xihan-ui/styles/ellipsis.css` | `@xihan-ui/styles/truncate.css` |
| 文案覆盖表的 `'ellipsis'` 键 | `'truncate'` |

breadcrumb 的 `data-part="ellipsis"` **不受影响**，它仍叫这个名字；pagination 那个另见部件改名一批（改为 `ellipsis-trigger`）。

### `dynamic-input` → `field-array`

解剖八个部件（`root` / `item` / `item-content` / `item-action` / `add-trigger` / `item-delete-trigger` / `move-up-trigger` / `move-down-trigger`）里没有 `input`——名字在说一件它不做的事。它做的是「可增删的一组字段行」。

| 已删 | 换成 |
| --- | --- |
| Vue `<XhDynamicInputRoot>` / `<XhDynamicInputItem>` / `<XhDynamicInputItemContent>` / `<XhDynamicInputItemAction>` / `<XhDynamicInputAddTrigger>` / `<XhDynamicInputItemDeleteTrigger>` / `<XhDynamicInputMoveUpTrigger>` / `<XhDynamicInputMoveDownTrigger>` | 同名的 `XhFieldArray*` |
| 自定义元素 `<xh-dynamic-input>` | `<xh-field-array>` |
| `useDynamicInput` / `useDynamicInputContext` / `useDynamicInputItemContext` / `provideDynamicInput` / `provideDynamicInputItem` | 同名的 `*FieldArray*` |
| `connectDynamicInput` / `dynamicInputAnatomy` / `dynamicInputKeyboard` / `dynamicInputMachine` / `dynamicInputMeta` / `dynamicInputTriggerId` | 同名的 `fieldArray*` / `connectFieldArray` |
| 类型 `DynamicInputApi` / `DynamicInputSchema` / `DynamicInputItem` / `DynamicInputItemProps` / `DynamicInputTranslations` / `DynamicInputValueChangeDetails` / `DynamicInputContext` / `DynamicInputItemContext` / `DynamicInputRootSlotProps` | 同名的 `FieldArray*` |
| 类型 `XhDynamicInputElement` | `XhFieldArrayElement` |
| `[data-scope='dynamic-input']` | `[data-scope='field-array']` |
| 覆盖槽 `--xh-dynamic-input-*`（24 个） | `--xh-field-array-*` |
| 子入口 `@xihan-ui/styles/dynamic-input.css` | `@xihan-ui/styles/field-array.css` |
| 文案覆盖表的 `'dynamic-input'` 键 | `'field-array'` |

部件名、`data-*` 属性与入口语义一个字没动。

### `time` → `timestamp`

库内 `time` 前缀已经有四件（`time` / `time-field` / `time-picker` / `timeline`，`timer` 亦近似），光看 `time` 判不出它渲染的是一个时间戳。

| 已删 | 换成 |
| --- | --- |
| Vue `<XhTime>` | `<XhTimestamp>` |
| 自定义元素 `<xh-time>` | `<xh-timestamp>` |
| `connectTime` / `timeAnatomy` / `timeKeyboard` / `timeMeta` / `timeMachineStamp` | `connectTimestamp` / `timestampAnatomy` / `timestampKeyboard` / `timestampMeta` / `timestampMachineStamp` |
| `TIME_RELATIVE_LIMIT` | `TIMESTAMP_RELATIVE_LIMIT` |
| 类型 `TimeApi` / `TimeProps` / `TimeState` / `TimeType` / `TimeValue` / `TimeTranslations` | 同名的 `Timestamp*` |
| 类型 `XhTimeElement` | `XhTimestampElement` |
| `[data-scope='time']` | `[data-scope='timestamp']` |
| 覆盖槽 `--xh-time-fg` / `--xh-time-placeholder-fg` | `--xh-timestamp-fg` / `--xh-timestamp-placeholder-fg` |
| 子入口 `@xihan-ui/styles/time.css` | `@xihan-ui/styles/timestamp.css` |
| 文案覆盖表的 `'time'` 键 | `'timestamp'` |

三个纯函数 `formatRelativeTime` / `formatTimePattern` / `toTimeDate` **名字不动**：它们说的是「时间」这件事，不是组件的名字。渲染出来的仍然是 `<time datetime>`，标签名没变。

## 二、退役四件

### `result` → 并入 `empty-state`

两份解剖逐字相同（`root` / `icon` / `title` / `description` / `action`），而组件名 `result` 又与 approval / question-flow 的 `result` 部件撞名。`empty-state` 吸收 `status`，一次纯加法，`live` 原样保留——两者正交，谁都不丢。

| 已删 | 换成 |
| --- | --- |
| Vue `<XhResultRoot>` / `<XhResultIcon>` / `<XhResultTitle>` / `<XhResultDescription>` / `<XhResultAction>` | 同名的 `XhEmptyState*` |
| 自定义元素 `<xh-result>` | `<xh-empty-state>` |
| `provideResult` / `useResultContext` / 类型 `ResultContext` | `provideEmptyState` / `useEmptyStateContext` / `EmptyStateContext` |
| `connectResult` / `resultAnatomy` / `resultKeyboard` / `resultMeta` | `connectEmptyState` / `emptyStateAnatomy` / `emptyStateKeyboard` / `emptyStateMeta` |
| 类型 `ResultApi` / `ResultProps` / `ResultTranslations` | `EmptyStateApi` / `EmptyStateProps` / `EmptyStateTranslations` |
| 类型 `ResultStatus`（七值 `404` / `403` / `500` / `success` / `warning` / `error` / `info`） | **`EmptyStateStatus`**，取值一字未变 |
| prop `status` | 同名同值，仍只落成 root 的 `data-status` |
| `[data-scope='result']` | `[data-scope='empty-state']` |
| 覆盖槽 `--xh-result-*`（16 个） | `--xh-empty-state-*` |
| 子入口 `@xihan-ui/styles/result.css` | `@xihan-ui/styles/empty-state.css` |
| 文案覆盖表的 `'result'` 键 | `'empty-state'` |

**两处静默的视觉变化，迁过来要自己看一眼**：

- **`live` 缺省是 `polite`**，root 因此带上 `role="status"`。整页结果是随页面首屏一起出现的静态内容，没有「更新」可播报，请显式写 `live="off"`。
- **尺寸档比 `result` 小一号**：`empty-state` 的 md 档图标框是 `--xh-glyph-size-2xl`、标题是 `--xh-control-font-lg`，`result` 原来是 `3xl` 与 `--xh-text-heading-3-size`。要原来的分量写 `size="lg"`，或者给 `--xh-empty-state-icon-size` / `--xh-empty-state-title-font-size` 写值。

approval 与 question-flow 的 `data-part="result"` **不受影响**。

### `space` → 并入 `flex`

`flex.types.ts` 与 `space.types.ts` 六个 prop 同名同型（`orientation` / `align` / `justify` / `gap` / `wrap` / `inline`），使用者没有任何依据选其一。`space` 独有的 `split` 部件与两处缺省差全部并进 `flex`。

| 已删 | 换成 |
| --- | --- |
| Vue `<XhSpace>` / `<XhSpaceSplit>` | `<XhFlex>` / `<XhFlexSplit>`（`split` 具名插槽写法一模一样） |
| 自定义元素 `<xh-space>` | `<xh-flex>` |
| `useSpaceContext` / 类型 `SpaceContext` | `useFlexContext` / `FlexContext`（另新增 `provideFlex`） |
| `connectSpace` / `spaceAnatomy` / `spaceKeyboard` / `spaceMeta` | `connectFlex` / `flexAnatomy` / `flexKeyboard` / `flexMeta` |
| 类型 `SpaceApi` / `SpaceProps` / `SpaceAlign` / `SpaceJustify` / `SpaceGap` / `SpaceTranslations` | 同名的 `Flex*` |
| 类型 `XhSpaceElement` | `XhFlexElement` |
| 部件 `data-part="split"` | 同名，现在挂在 `[data-scope='flex']` 下 |
| 覆盖槽 `--xh-space-root-gap` | `--xh-flex-gap` |
| 子入口 `@xihan-ui/styles/space.css` | `@xihan-ui/styles/flex.css` |
| 文案覆盖表的 `'space'` 键 | `'flex'` |

**一处静默的视觉变化，迁过来必须自己补**：`XhSpace` 不写 `gap` 时有 md 间距，`XhFlex` 不写 `gap` 就是 0。**`<XhSpace>` → `<XhFlex gap="md">`**，漏了这一条一整排会挤成一团，且不报任何错。

反过来，`space` 的「缺省交叉轴对齐随方向走」并进了 `flex`：**横排按中线对齐、竖排拉伸占满**，写了 `align` 仍以它为准。原来靠 `flex` 的浏览器缺省（`stretch`）排横排的地方观感会变，写 `align="stretch"` 即回到原样。

副作用：`--xh-space-*` 前缀底下从此只有全局间距原语，与组件槽的撞名彻底解除。

### `popselect` → 退役，无 1:1 替代件

它的九个部件全部是 `select` 十七个部件的子集，无一独有；且它没有自己的机器（跑的是 popover + listbox 两台）。名字是别家方言，使用者判不出与 `select` 的差别。

**两条替代路，按「值随不随表单提交」选**：

- **随表单提交** → 用 `select`：它有 `hidden-select` 承担表单参与、有标签关联，`popselect` 两样都没有。
- **不随表单提交、只是就地切一个视图参数**（排序方式、显示密度）→ **把 `listbox` 装进 `popover`**：触发器显示当前选中项，`value-change` 里落值即收起浮层，浮层底部还能放操作按钮。这套组合是官方写法，`listbox` 与 `select` 两页文档都写明了分界，示例见 `listbox` 页的「弹出式选择」。

```vue
<XhPopoverRoot v-model:open="open" placement="bottom-start">
  <XhPopoverTrigger>{{ label }}</XhPopoverTrigger>
  <XhPopoverPositioner>
    <XhPopoverContent>
      <XhListboxRoot v-model:value="value" :collection="options" @value-change="close" />
    </XhPopoverContent>
  </XhPopoverPositioner>
</XhPopoverRoot>
```

删掉的名字：Vue 的 `XhPopselectRoot` / `Control` / `Trigger` / `ClearTrigger` / `Positioner` / `Content` / `Item` / `ItemText` / `ItemIndicator` 与 `usePopselect` / `usePopselectContext` / `usePopselectItemContext` / `providePopselect` / `providePopselectItem`；自定义元素 `<xh-popselect>`；无头层的 `connectPopselect` / `popselectAnatomy` / `popselectKeyboard` / `popselectMeta` / `popselectItemQuery` / `popselectItemText` / `popselectInitialFocus` / `POPSELECT_DEFAULT_PLACEMENT` 与全部 `Popselect*` 类型；`[data-scope='popselect']` 与 `--xh-popselect-*`（44 个）；子入口 `@xihan-ui/styles/popselect.css`；文案覆盖表的 `'popselect'` 键。

### `countdown` → 并入 `timer`

`timer` 在 prop 面上完全覆盖 `countdown`，两件之间再无差别可写进选型表。「走完了」原来在库内有两个名字（`countdown` 的 `data-finished` 与 `timer` 的 `data-state='completed'`），现在只剩后一个。

| 已删 | 换成 |
| --- | --- |
| Vue `<XhCountdown>` / 类型 `CountdownSlotProps` | `<XhTimerRoot>` + `<XhTimerDisplay>`（默认插槽给出 `text`） |
| 自定义元素 `<xh-countdown>` | `<xh-timer>` |
| `connectCountdown` / `countdownAnatomy` / `countdownKeyboard` / `countdownMachine` / `countdownMeta` | 同名的 `timer*` / `connectTimer` |
| `COUNTDOWN_FORMAT` / `COUNTDOWN_PRECISION` / `COUNTDOWN_PRECISION_MAX` | `TIMER_FORMAT` / 无（缺省改了，见下）/ `TIMER_PRECISION_MAX` |
| `formatCountdown` / `quantizeCountdown` / `resolveCountdownPrecision` / `resolveCountdownValue` / `splitCountdown` | `formatTimerText` / `quantizeTimer` / `resolveTimerPrecision` / 无 / `splitTimer`（多一段 `days`） |
| 类型 `CountdownApi` / `CountdownSchema` / `CountdownParts` / `CountdownPhase` / `CountdownLive` / `CountdownTranslations` / `CountdownFinishDetails` | `TimerApi` / `TimerSchema` / `TimerSegments` / `TimerPhase`（四相位）/ **`TimerLive`** / `TimerTranslations` / `TimerCompleteDetails` |
| 类型 `XhCountdownElement` | `XhTimerElement` |
| prop `value` / `active` / `format` / `precision` / `live` | **五个都在 `timer` 上了**，语义一字未变 |
| `api.text` / `api.parts` | `api.text` / `api.segments`（`segmentText(unit)` 取单段） |
| 事件 `onFinish` | `onComplete`（Vue 侧 `@finish` → `@complete`） |
| root 上的 `data-finished` | `data-state="completed"` |
| root 上的 `data-state="idle" \| "running"` | 同名，另有 `paused` / `completed` 两档 |
| `[data-scope='countdown']` | `[data-scope='timer']` |
| 覆盖槽 `--xh-countdown-fg` / `--xh-countdown-finished-fg` | `--xh-timer-area-fg` / `--xh-timer-completed-fg` |
| 子入口 `@xihan-ui/styles/countdown.css` | `@xihan-ui/styles/timer.css` |
| 文案覆盖表的 `'countdown'` 键 | `'timer'` |

`timer` 这一批新增的入口（迁过来的人直接用得上）：

- **受控通道**：给了 `value`（剩余毫秒）或 `active` 即进受控分支——`value` 就是起点、方向锁成倒着走、终点锁成 0，改写它即从新值重新计时；`active` 翻假停在当前值、翻真接着走；缺省即开跑（与 `countdown` 一致，不必写 `autoStart`）。受控时起停按钮不再改状态，root 上落 `data-controlled`。
- **`format` / `precision`**：`api.text` 按模板铺字；模板多认一个 `D`（天），没写 `D` 时 `H` 收下全部小时数，与 `countdown` 的 `HH` 语义一致。
- **`live`**：时间区的读屏播报档位，落成 `aria-live`，缺省仍是 `off`。

**两处缺省不一样，迁过来要自己补**：

- **`precision` 缺省是 3（毫秒，不量化）**，`countdown` 原来是 0（整秒）。要原来的行为写 `precision="0"`。
- **数字自带展示档字号**（`timer` 是一台摆在页面上的计时器），`countdown` 原来不自带字号、跟着上下文走。嵌在一句话里或摆进别人的数值槽时把 `--xh-timer-digit-font-size` 写成 `inherit` 即回到原样。

## 皮肤选择器要自己搜一遍

`[data-scope='ellipsis']`、`[data-scope='dynamic-input']`、`[data-scope='time']`、`[data-scope='result']`、`[data-scope='space']`、`[data-scope='popselect']`、`[data-scope='countdown']` 七个作用域不再有任何节点带上。选择器失配既不报错也不降级，请在自己的代码库里全文搜索这七个串，连同上面各表里的 `--xh-` 覆盖槽名一起换掉。

## 文档站的示例去了哪

改名三件的示例目录跟着改名，内容一字未动。退役四件里：

| 已删的示例 | 去向 |
| --- | --- |
| `result/01-basic` / `04-size` / `05-icon` | `empty-state/01-basic` / `02-size` 已覆盖 |
| `result/02-status` | 迁成 `empty-state/06-status`，四档通用结果各摆一台 |
| `result/03-http` | `empty-state/04-result` 已覆盖，那台现在带上了 `status` |
| `space/01-basic` / `02-direction` / `04-gap` / `05-align-wrap` | `flex/01-basic` / `02-direction` / `04-gap` / `03-align-justify` / `05-wrap-inline` 已覆盖 |
| `space/03-split` | 迁成 `flex/06-split` |
| `popselect/01-basic` … `06-clear` | 不迁：`select` 那一族与 `listbox/05-popover` 两处已覆盖全部场景，替代写法见上面那段组合示例 |
| `countdown/01-basic` / `02-format` / `03-slot` | `timer/02-countdown` / `04-days` 与 `format` / `precision` 两个新入口已覆盖 |
| `countdown/04-control` | 迁成 `timer/07-controlled`，受控通道两版都在 |
