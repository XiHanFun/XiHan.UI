# @xihan-ui/vue

## 2.0.0

### Major Changes

- 8f810d8: Alert 将 `content` 收为必需文本列，标题与说明必须放在其中；图标、操作和关闭入口仍按需渲染。

  默认外观改为中性抬升表面，语气只强调标题与图标，说明保持次级前景；操作与关闭入口统一排在尾端。

- 08850a2: **按钮与悬浮按钮撤掉 `shape`：圆角是形态身份的一部分，不再另开一根轴。**

  `button` 的 `shape`（rounded / pill / square）与 `float-button` 的 `shape`（circle / square）都是在 variant · tone · size 三轴之外另开的一根视觉轴，与「形状身份不随主题、密度改变」的约定相悖，也让同一枚按钮在页面里出现三种圆角。现在按钮与开关、按钮组同为胶囊，悬浮按钮的触发器与展开的每一条动作固定圆形；确实要换档的在任意子树上重声明 `--xh-button-radius` / `--xh-float-button-radius`。三端同步：Vue / React 的 `shape` prop、自定义元素的 `shape` attribute、`data-shape` 状态属性、`ButtonShape` / `FloatButtonShape` / `FLOAT_BUTTON_DEFAULT_SHAPE` 导出一并撤掉；悬浮按钮的「外形」示例移除。

- 1fb94ea: 日历拆成两个组件：`calendar` 改名为 `calendar-picker`（日历选择器，单选 / 多选），区间选择拆到新组件 `calendar-range-picker`（日历范围选择器）。

  - **破坏**：`calendar` 不再存在。单选与多选改用 `calendar-picker`：Headless 的 `calendarMachine` / `connectCalendar` / `calendarAnatomy` / `calendarKeyboard` / `calendarMeta` 改名为 `calendarPickerMachine` / `connectCalendarPicker` / `calendarPickerAnatomy` / `calendarPickerKeyboard` / `calendarPickerMeta`，类型 `CalendarSchema` / `CalendarApi` / `CalendarTranslations` / `CalendarSelectionMode` / `CalendarValueChangeDetails` / `CalendarRefs` 改名为 `CalendarPicker*`；Vue 与 React 的 `XhCalendar*` 改名为 `XhCalendarPicker*`，`useCalendar` 改名为 `useCalendarPicker`；自定义元素 `<xh-calendar>` 改名为 `<xh-calendar-picker>`；皮肤 `calendar.css` 改名为 `calendar-picker.css`，覆盖槽前缀 `--xh-calendar-*` 改为 `--xh-calendar-picker-*`；`data-scope="calendar"` 改为 `data-scope="calendar-picker"`。文案表的键 `calendar` 改为 `calendar-picker`。
  - **破坏**：`calendar-picker` 的 `selectionMode` 只剩 `'single' | 'multiple'`；`isDateUnavailable` 只收一个参数；删除 `allowsNonContiguousRanges`、`rangeAnchor`、`setRangeAnchor`、`data-in-range` / `data-range-start` / `data-range-end` / `data-range-preview` / `data-dragging` 与键盘表里的 `cancel-range` / `commit-range` 两行。
  - **新增** `calendar-range-picker`：值恒为区间两端（升序、长度 2），承接原来 `selectionMode="range"` 的全部行为——先落起点再落终点、按住拖选、拖动已选区间的一端、`Escape` 撤起点、`Tab` 收口、`allowsNonContiguousRanges`、`isDateUnavailable(value, anchor)`、`invalid` 自判、`rangeAnchor` / `dragging` / `setRangeAnchor`。三端部件名与日历选择器逐一相同（`XhCalendarRangePicker*`、`<xh-calendar-range-picker>`），皮肤 `calendar-range-picker.css`，覆盖槽 `--xh-calendar-range-picker-*`。
  - 网格纯数学（`buildMonthGrid` / `calendarPeriodOf` / `calendarPeriodValue` / `parseCalendarDate` 等）与 `CalendarGranularity` / `CalendarView` / `CalendarPeriod` / `CalendarPanel` / `CalendarCellProps` 等领域类型保持原名，两个日历共用；新增 `visibleCountOf` 与 `CalendarPart` 公开导出。
  - **破坏**：`date-picker` 只剩单选与多选，内嵌 `calendar-picker`：删除 `selectionMode="range"`、`endName`、`allowsNonContiguousRanges`、`fieldEnd`、`range-separator` 部件、`getRangeSeparatorProps`、`getSegmentGroupProps({ index })` 的 `index`、`DatePickerSegmentGroupProps`、`datePickerFieldEndProps`、`datePickerFieldAt`、`resolveDatePickerFieldIndex`、`DatePickerFieldIndex`、`datePickerPresetRange` / `datePickerPresetMonth` / `datePickerPresetYear`；`DATE_PICKER_RANGE_SEPARATOR` 改名为 `DATE_PICKER_PRESET_SEPARATOR`；Vue / React 删除 `XhDatePickerRangeSeparator`，`XhDatePickerSegmentGroup` / `XhDatePickerHiddenInput` 不再收 `index`；自定义元素删除 `end-name` 属性、`fieldEndSegments` 只读属性；`DatePickerTranslations` 删除 `startDate` / `endDate`；`isDateUnavailable` 只收一个参数。区间日期由随后的 `date-range-picker` 承接。
  - 文档：两个日历在组件总览里归入「数据录入」，各有独立预览；示例拆成 `calendar-picker`（基础、多选、不可选的日子、格子里放内容）与 `calendar-range-picker`（基础、并排两个月、不可用的日子、按周挑）。

- edaa3dc: Card 收敛为 `default`、`secondary`、`tertiary`、`transparent` 四种语义表面，并将结构统一为 `root / header / title / description / content / footer`。

  移除 `size`、`hoverable`、`split` 属性以及 `media`、`body` 部件；媒体改为普通子节点，卡片统一使用 16px 内边距、12px 段间距与高层圆角。

- 10c198a: 级联选择增加 name/form 原生表单出口，三端自动将每条选中路径编码为独立同名 JSON 字符串数组字段，支持禁用排除与原生重置。

  破坏性变更：value/defaultValue、setValue 和 select 统一拒绝非数组、混合类型、空路径或非字符串段，不再隐式展开字符串或容忍非法路径；保留正式单路径数组简写，零选中使用 []，不使用 [[]]。路径无需预先存在于异步 collection 中。

- dc64383: **三处收起态从 `hidden` 属性改到 `data-state`。** `hidden` 是瞬时的：属性一加，节点当帧消失，中间没有可播放的时间段。这三处都是能展能收的内容，改成状态属性之后收起态才有一个可被过渡与动画读到的档位。

  | 组件      | 部件             | 从前                                          | 现在                                 |
  | --------- | ---------------- | --------------------------------------------- | ------------------------------------ |
  | `table`   | `expanded-row`   | `hidden`（`data-state` 同时也在发，两位重复） | 只发 `data-state="open" \| "closed"` |
  | `tree`    | `branch-content` | `hidden`（`data-state` 同时也在发，两位重复） | 只发 `data-state="open" \| "closed"` |
  | `heatmap` | `tooltip`        | `hidden`                                      | `data-state="visible" \| "hidden"`   |

  前两处取开合族、末一处取派生显隐族，取值都在既有的状态词汇表里，没有新造。

  **破坏性：这三个部件上不再出现 `hidden` 属性。** 选它的规则（`[data-part='expanded-row'][hidden]` 一类）与断言它的用例（`el.hasAttribute('hidden')`）都会静默失配——前两处换成 `[data-state='closed']`，热力图的详情条换成 `[data-state='hidden']`。作者自己写在这些节点上的 `hidden` 仍然有效：皮肤那条收起规则两位一起收。

  **收起靠的是皮肤那一条规则，不再有 UA 兜底。** `hidden` 属性由浏览器自带 `display: none`，`data-state` 没有；这三个部件的收起态现在只由 `@xihan-ui/styles` 里的规则画出来。不接皮肤、只用无头层自绘的使用者，须自己写这一条。

  **量测口径跟着改。** 表格的行拖拽与树的节点拖拽在量可见行时要跳过收起的那一枝，判据从「祖先带 `hidden`」改成「祖先是收起态的 `expanded-row` / `branch-content`」，作者自己加的 `hidden` 照旧跳过。

- 6c20a6d: **取色器改为组合颜色家族的新组件：色相与透明度两条滑块是内嵌的 `color-slider`，预设色板是内嵌的 `color-swatch-picker`，触发钮里的色块走 Swatch 色块面家族。**

  此前取色器自己手写了两条通道滑杆（`channel-slider` / `channel-slider-track` / `channel-slider-thumb`）与一组色板按钮（`swatch-group` / `swatch-item`），键盘、拖动、渐变、读屏文案各是一份；家族里有了同样的独立组件之后，这些就是重复建设。现在取色器只留三个挂载点，里面跑的是那三件组件自己的机器与连接层，DOM 带各自的 `data-scope`，皮肤也各归各。

  破坏面逐条：

  - **五个部件撤掉，三个挂载点接上。** `channel-slider` / `channel-slider-track` / `channel-slider-thumb` / `swatch-group` / `swatch-item` 不再存在；新增 `hue-slider` / `alpha-slider` / `swatch-picker`，它们同时充当内嵌组件的根节点（内嵌组件自己的 `root` 部件不出现），挂载点之下写的是 `color-slider` 的 `control` / `track` / `thumb` / `label` / `value-text` / `hidden-input` 与 `color-swatch-picker` 的 `item` / `swatch` / `indicator` / `hidden-input`。Vue 的 `XhColorPickerChannelSlider*` / `XhColorPickerSwatchGroup` / `XhColorPickerSwatchItem` 换成 `XhColorPickerHueSlider` / `XhColorPickerAlphaSlider` / `XhColorPickerSwatchPicker`（不写子节点即自动铺开；要自己排就往里放 `XhColorSlider*` / `XhColorSwatchPickerItem`），React 同名；自定义元素照挂载点名写 `data-xh-part`。
  - **`ColorPickerServices` 变形。** `hueSlider` / `alphaSlider` 从一台 `slider` 服务换成 `ColorSliderServices`（`{ root, slider }`），新增 `swatchPicker`；props 由 `colorPickerHueSliderProps` / `colorPickerAlphaSliderProps` / `colorPickerSwatchPickerProps(rootService)` 现算，`colorPickerChannelSliderProps` 撤掉。
  - **API 与事件收窄。** `api.channelState` / `isSwatchSelected` / `getChannelSlider*Props` / `getSwatchGroupProps` / `getSwatchItemProps` 撤掉，换成 `api.hueSlider` / `alphaSlider` / `swatchPicker`（各是内嵌组件的完整 api）与 `getHueSliderProps` / `getAlphaSliderProps` / `getSwatchPickerProps`；机器事件 `CHANNEL.SET` / `CHANNEL.STEP` / `CHANNEL.TO_EDGE` 换成滑块送回的 `HSVA.SET`；键盘表撤掉四行 `color-picker.kbd.channel-*`（归 `color-slider` 那张表）。
  - **色板从一排按钮变成单选组。** 挂载点是 `role="radiogroup"`，每格 `role="radio"` 且 `aria-checked`（此前是 `aria-pressed` 的按钮）；整组只占一个 Tab 位，方向键在格子间走并选中，禁用用 `aria-disabled` 表达；当前颜色的那一格按颜色比选中。
  - **皮肤槽位变化。** `--xh-color-picker-thumb-size` 只剩取色面那一颗拇指用；`--xh-color-picker-track-thickness` / `--xh-color-picker-track-radius` / `--xh-color-picker-checker` / `--xh-color-picker-swatch-item-size` / `--xh-color-picker-swatch-ring` / `--xh-color-picker-swatch-border-hover` 撤掉，两条滑块与色板各读自己那份皮的槽（`--xh-color-slider-*` / `--xh-color-swatch-picker-*`）；挂载点同时充当内嵌根节点，根上那几把尺由取色器自己的槽给：两条滑块是 `--xh-color-picker-slider-thumb-size` / `--xh-color-picker-slider-track-thickness` / `--xh-color-picker-hue-slider-gap` / `--xh-color-picker-alpha-slider-gap`，色板是 `--xh-color-picker-swatch-cell` / `--xh-color-picker-swatch-gap` / `--xh-color-picker-swatch-picker-gap` / `--xh-color-picker-swatch-icon-size`（浮层里的色板缺省用小号格）。触发钮里的色块改由 Swatch 家族画：半透明色铺在棋盘格上，`--xh-color-picker-swatch-size` 缺省跟着色块面的尺寸档走。

  顺带补上的：`color-slider` 新增受控 `hsva` prop（几条并排的滑块共用同一份工作色，推色相时灰度处的色相与透明度都不丢），`onValueChange` / `onValueChangeEnd` 的载荷带上 `hsva`；串没变但工作色变了（灰度处推色相）也会通知一次。

- b908e0e: 建立 ColorPicker 显式错误合同：非法或越界文本不再静默复原、裁切，格式、输入、颜色解析与屏幕取色异常分别保留状态并发出 `color-error`，同时隔离旧输入与迟到取色结果。
- bdbf03c: **三个组件改名、四个组件退役。** 不留别名、不留 `var(新名, 旧名)` 双写、不留转发文件：下面列出的名字在无头层、两个适配器与皮肤里都不再存在，写下它们会得到「组件不存在」而不是降级渲染。

  ## 一、改名三条

  ### `ellipsis` → `truncate`

  `ellipsis` 同时是 breadcrumb 与 pagination 的部件名，一个字面量指两个东西；而 `ellipsis` 命名的是「三个点」这个字形，组件做的是「截断 + 展开」。行为、部件与入口一个都没改，只是换了名字。

  | 已删                                                                                                                                                                    | 换成                                                                        |
  | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
  | Vue `<XhEllipsis>`                                                                                                                                                      | `<XhTruncate>`                                                              |
  | 自定义元素 `<xh-ellipsis>`                                                                                                                                              | `<xh-truncate>`                                                             |
  | `useEllipsis` / 类型 `EllipsisContext` / `EllipsisSlotProps`                                                                                                            | `useTruncate` / `TruncateContext` / `TruncateSlotProps`                     |
  | `connectEllipsis` / `ellipsisAnatomy` / `ellipsisKeyboard` / `ellipsisMachine` / `ellipsisMeta`                                                                         | 同名的 `truncate*` / `connectTruncate`                                      |
  | `ELLIPSIS_DEFAULT_LINES` / `isEllipsisOverflowing` / `resolveEllipsisLines`                                                                                             | `TRUNCATE_DEFAULT_LINES` / `isTruncateOverflowing` / `resolveTruncateLines` |
  | 类型 `EllipsisApi` / `EllipsisSchema` / `EllipsisRefs` / `EllipsisMetrics` / `EllipsisTranslations` / `EllipsisExpandedChangeDetails` / `EllipsisOverflowChangeDetails` | 同名的 `Truncate*`                                                          |
  | 类型 `XhEllipsisElement`                                                                                                                                                | `XhTruncateElement`                                                         |
  | `[data-scope='ellipsis']`                                                                                                                                               | `[data-scope='truncate']`                                                   |
  | 覆盖槽 `--xh-ellipsis-*`、内联私有槽 `--xh-_ellipsis-lines`                                                                                                             | `--xh-truncate-*`、`--xh-_truncate-lines`                                   |
  | 子入口 `@xihan-ui/styles/ellipsis.css`                                                                                                                                  | `@xihan-ui/styles/truncate.css`                                             |
  | 文案覆盖表的 `'ellipsis'` 键                                                                                                                                            | `'truncate'`                                                                |

  breadcrumb 的 `data-part="ellipsis"` **不受影响**，它仍叫这个名字；pagination 那个另见部件改名一批（改为 `ellipsis-trigger`）。

  ### `dynamic-input` → `field-array`

  解剖八个部件（`root` / `item` / `item-content` / `item-action` / `add-trigger` / `item-delete-trigger` / `move-up-trigger` / `move-down-trigger`）里没有 `input`——名字在说一件它不做的事。它做的是「可增删的一组字段行」。

  | 已删                                                                                                                                                                                                                                                          | 换成                                       |
  | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
  | Vue `<XhDynamicInputRoot>` / `<XhDynamicInputItem>` / `<XhDynamicInputItemContent>` / `<XhDynamicInputItemAction>` / `<XhDynamicInputAddTrigger>` / `<XhDynamicInputItemDeleteTrigger>` / `<XhDynamicInputMoveUpTrigger>` / `<XhDynamicInputMoveDownTrigger>` | 同名的 `XhFieldArray*`                     |
  | 自定义元素 `<xh-dynamic-input>`                                                                                                                                                                                                                               | `<xh-field-array>`                         |
  | `useDynamicInput` / `useDynamicInputContext` / `useDynamicInputItemContext` / `provideDynamicInput` / `provideDynamicInputItem`                                                                                                                               | 同名的 `*FieldArray*`                      |
  | `connectDynamicInput` / `dynamicInputAnatomy` / `dynamicInputKeyboard` / `dynamicInputMachine` / `dynamicInputMeta` / `dynamicInputTriggerId`                                                                                                                 | 同名的 `fieldArray*` / `connectFieldArray` |
  | 类型 `DynamicInputApi` / `DynamicInputSchema` / `DynamicInputItem` / `DynamicInputItemProps` / `DynamicInputTranslations` / `DynamicInputValueChangeDetails` / `DynamicInputContext` / `DynamicInputItemContext` / `DynamicInputRootSlotProps`                | 同名的 `FieldArray*`                       |
  | 类型 `XhDynamicInputElement`                                                                                                                                                                                                                                  | `XhFieldArrayElement`                      |
  | `[data-scope='dynamic-input']`                                                                                                                                                                                                                                | `[data-scope='field-array']`               |
  | 覆盖槽 `--xh-dynamic-input-*`（24 个）                                                                                                                                                                                                                        | `--xh-field-array-*`                       |
  | 子入口 `@xihan-ui/styles/dynamic-input.css`                                                                                                                                                                                                                   | `@xihan-ui/styles/field-array.css`         |
  | 文案覆盖表的 `'dynamic-input'` 键                                                                                                                                                                                                                             | `'field-array'`                            |

  部件名、`data-*` 属性与入口语义一个字没动。

  ### `time` → `timestamp`

  库内 `time` 前缀已经有四件（`time` / `time-field` / `time-picker` / `timeline`，`timer` 亦近似），光看 `time` 判不出它渲染的是一个时间戳。

  | 已删                                                                                       | 换成                                                                                                      |
  | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
  | Vue `<XhTime>`                                                                             | `<XhTimestamp>`                                                                                           |
  | 自定义元素 `<xh-time>`                                                                     | `<xh-timestamp>`                                                                                          |
  | `connectTime` / `timeAnatomy` / `timeKeyboard` / `timeMeta` / `timeMachineStamp`           | `connectTimestamp` / `timestampAnatomy` / `timestampKeyboard` / `timestampMeta` / `timestampMachineStamp` |
  | `TIME_RELATIVE_LIMIT`                                                                      | `TIMESTAMP_RELATIVE_LIMIT`                                                                                |
  | 类型 `TimeApi` / `TimeProps` / `TimeState` / `TimeType` / `TimeValue` / `TimeTranslations` | 同名的 `Timestamp*`                                                                                       |
  | 类型 `XhTimeElement`                                                                       | `XhTimestampElement`                                                                                      |
  | `[data-scope='time']`                                                                      | `[data-scope='timestamp']`                                                                                |
  | 覆盖槽 `--xh-time-fg` / `--xh-time-placeholder-fg`                                         | `--xh-timestamp-fg` / `--xh-timestamp-placeholder-fg`                                                     |
  | 子入口 `@xihan-ui/styles/time.css`                                                         | `@xihan-ui/styles/timestamp.css`                                                                          |
  | 文案覆盖表的 `'time'` 键                                                                   | `'timestamp'`                                                                                             |

  三个纯函数 `formatRelativeTime` / `formatTimePattern` / `toTimeDate` **名字不动**：它们说的是「时间」这件事，不是组件的名字。渲染出来的仍然是 `<time datetime>`，标签名没变。

  ## 二、退役四件

  ### `result` → 并入 `empty-state`

  两份解剖逐字相同（`root` / `icon` / `title` / `description` / `action`），而组件名 `result` 又与 approval / question-flow 的 `result` 部件撞名。`empty-state` 吸收 `status`，一次纯加法，`live` 原样保留——两者正交，谁都不丢。

  | 已删                                                                                                       | 换成                                                                                |
  | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
  | Vue `<XhResultRoot>` / `<XhResultIcon>` / `<XhResultTitle>` / `<XhResultDescription>` / `<XhResultAction>` | 同名的 `XhEmptyState*`                                                              |
  | 自定义元素 `<xh-result>`                                                                                   | `<xh-empty-state>`                                                                  |
  | `provideResult` / `useResultContext` / 类型 `ResultContext`                                                | `provideEmptyState` / `useEmptyStateContext` / `EmptyStateContext`                  |
  | `connectResult` / `resultAnatomy` / `resultKeyboard` / `resultMeta`                                        | `connectEmptyState` / `emptyStateAnatomy` / `emptyStateKeyboard` / `emptyStateMeta` |
  | 类型 `ResultApi` / `ResultProps` / `ResultTranslations`                                                    | `EmptyStateApi` / `EmptyStateProps` / `EmptyStateTranslations`                      |
  | 类型 `ResultStatus`（七值 `404` / `403` / `500` / `success` / `warning` / `error` / `info`）               | **`EmptyStateStatus`**，取值一字未变                                                |
  | prop `status`                                                                                              | 同名同值，仍只落成 root 的 `data-status`                                            |
  | `[data-scope='result']`                                                                                    | `[data-scope='empty-state']`                                                        |
  | 覆盖槽 `--xh-result-*`（16 个）                                                                            | `--xh-empty-state-*`                                                                |
  | 子入口 `@xihan-ui/styles/result.css`                                                                       | `@xihan-ui/styles/empty-state.css`                                                  |
  | 文案覆盖表的 `'result'` 键                                                                                 | `'empty-state'`                                                                     |

  **两处静默的视觉变化，迁过来要自己看一眼**：

  - **`live` 缺省是 `polite`**，root 因此带上 `role="status"`。整页结果是随页面首屏一起出现的静态内容，没有「更新」可播报，请显式写 `live="off"`。
  - **尺寸档比 `result` 小一号**：`empty-state` 的 md 档图标框是 `--xh-glyph-size-2xl`、标题是 `--xh-control-font-lg`，`result` 原来是 `3xl` 与 `--xh-text-heading-3-size`。要原来的分量写 `size="lg"`，或者给 `--xh-empty-state-icon-size` / `--xh-empty-state-title-font-size` 写值。

  approval 与 question-flow 的 `data-part="result"` **不受影响**。

  ### `space` → 并入 `flex`

  `flex.types.ts` 与 `space.types.ts` 六个 prop 同名同型（`orientation` / `align` / `justify` / `gap` / `wrap` / `inline`），使用者没有任何依据选其一。`space` 独有的 `split` 部件与两处缺省差全部并进 `flex`。

  | 已删                                                                                              | 换成                                                         |
  | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
  | Vue `<XhSpace>` / `<XhSpaceSplit>`                                                                | `<XhFlex>` / `<XhFlexSplit>`（`split` 具名插槽写法一模一样） |
  | 自定义元素 `<xh-space>`                                                                           | `<xh-flex>`                                                  |
  | `useSpaceContext` / 类型 `SpaceContext`                                                           | `useFlexContext` / `FlexContext`（另新增 `provideFlex`）     |
  | `connectSpace` / `spaceAnatomy` / `spaceKeyboard` / `spaceMeta`                                   | `connectFlex` / `flexAnatomy` / `flexKeyboard` / `flexMeta`  |
  | 类型 `SpaceApi` / `SpaceProps` / `SpaceAlign` / `SpaceJustify` / `SpaceGap` / `SpaceTranslations` | 同名的 `Flex*`                                               |
  | 类型 `XhSpaceElement`                                                                             | `XhFlexElement`                                              |
  | 部件 `data-part="split"`                                                                          | 同名，现在挂在 `[data-scope='flex']` 下                      |
  | 覆盖槽 `--xh-space-root-gap`                                                                      | `--xh-flex-gap`                                              |
  | 子入口 `@xihan-ui/styles/space.css`                                                               | `@xihan-ui/styles/flex.css`                                  |
  | 文案覆盖表的 `'space'` 键                                                                         | `'flex'`                                                     |

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

  | 已删                                                                                                                                                 | 换成                                                                                                                                  |
  | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
  | Vue `<XhCountdown>` / 类型 `CountdownSlotProps`                                                                                                      | `<XhTimerRoot>` + `<XhTimerDisplay>`（默认插槽给出 `text`）                                                                           |
  | 自定义元素 `<xh-countdown>`                                                                                                                          | `<xh-timer>`                                                                                                                          |
  | `connectCountdown` / `countdownAnatomy` / `countdownKeyboard` / `countdownMachine` / `countdownMeta`                                                 | 同名的 `timer*` / `connectTimer`                                                                                                      |
  | `COUNTDOWN_FORMAT` / `COUNTDOWN_PRECISION` / `COUNTDOWN_PRECISION_MAX`                                                                               | `TIMER_FORMAT` / 无（缺省改了，见下）/ `TIMER_PRECISION_MAX`                                                                          |
  | `formatCountdown` / `quantizeCountdown` / `resolveCountdownPrecision` / `resolveCountdownValue` / `splitCountdown`                                   | `formatTimerText` / `quantizeTimer` / `resolveTimerPrecision` / 无 / `splitTimer`（多一段 `days`）                                    |
  | 类型 `CountdownApi` / `CountdownSchema` / `CountdownParts` / `CountdownPhase` / `CountdownLive` / `CountdownTranslations` / `CountdownFinishDetails` | `TimerApi` / `TimerSchema` / `TimerSegments` / `TimerPhase`（四相位）/ **`TimerLive`** / `TimerTranslations` / `TimerCompleteDetails` |
  | 类型 `XhCountdownElement`                                                                                                                            | `XhTimerElement`                                                                                                                      |
  | prop `value` / `active` / `format` / `precision` / `live`                                                                                            | **五个都在 `timer` 上了**，语义一字未变                                                                                               |
  | `api.text` / `api.parts`                                                                                                                             | `api.text` / `api.segments`（`segmentText(unit)` 取单段）                                                                             |
  | 事件 `onFinish`                                                                                                                                      | `onComplete`（Vue 侧 `@finish` → `@complete`）                                                                                        |
  | root 上的 `data-finished`                                                                                                                            | `data-state="completed"`                                                                                                              |
  | root 上的 `data-state="idle" \| "running"`                                                                                                           | 同名，另有 `paused` / `completed` 两档                                                                                                |
  | `[data-scope='countdown']`                                                                                                                           | `[data-scope='timer']`                                                                                                                |
  | 覆盖槽 `--xh-countdown-fg` / `--xh-countdown-finished-fg`                                                                                            | `--xh-timer-area-fg` / `--xh-timer-completed-fg`                                                                                      |
  | 子入口 `@xihan-ui/styles/countdown.css`                                                                                                              | `@xihan-ui/styles/timer.css`                                                                                                          |
  | 文案覆盖表的 `'countdown'` 键                                                                                                                        | `'timer'`                                                                                                                             |

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

  | 已删的示例                                                     | 去向                                                                                        |
  | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
  | `result/01-basic` / `04-size` / `05-icon`                      | `empty-state/01-basic` / `02-size` 已覆盖                                                   |
  | `result/02-status`                                             | 迁成 `empty-state/06-status`，四档通用结果各摆一台                                          |
  | `result/03-http`                                               | `empty-state/04-result` 已覆盖，那台现在带上了 `status`                                     |
  | `space/01-basic` / `02-direction` / `04-gap` / `05-align-wrap` | `flex/01-basic` / `02-direction` / `04-gap` / `03-align-justify` / `05-wrap-inline` 已覆盖  |
  | `space/03-split`                                               | 迁成 `flex/06-split`                                                                        |
  | `popselect/01-basic` … `06-clear`                              | 不迁：`select` 那一族与 `listbox/05-popover` 两处已覆盖全部场景，替代写法见上面那段组合示例 |
  | `countdown/01-basic` / `02-format` / `03-slot`                 | `timer/02-countdown` / `04-days` 与 `format` / `precision` 两个新入口已覆盖                 |
  | `countdown/04-control`                                         | 迁成 `timer/07-controlled`，受控通道两版都在                                                |

- 3db8c7d: 命令式对话框服务用独立 actionError 与 onActionError({ cause }) 暴露同步/异步动作异常，提供可本地化的 actionErrorText 实时提示；false 只表示业务阻止关闭。重试、取消、卸载和请求切换隔离过期动作与通知。

  宿主初始化/挂载或正文渲染失败现明确 reject 原始原因，不再仅记录日志、解析成 false 或留下悬空 Promise；通知处理器失败拒绝所属请求。调用方必须处理服务 Promise 拒绝，并提供当前文档中已连接的 target。固定退场窗口将在独立任务中移除。

- f0a2e34: **清掉库里剩下的过渡期安排。** 库里不留兼容、不留兜底：同一件事不再发两份属性，同一个 prop 不再收新旧两种写法。下面两组名字已删除，设它们不再有任何效果。

  ## 一、六个组件不再发 `data-status`

  `data-status` 曾同时承载两件事——`result` 的「结果种类」（`404` / `success` / …）与另外六个组件的生命周期「相位」（`loading` / `streaming` / …）。相位这一轴归 `data-state`，`data-status` 只表达结果种类。现在这六处只发 `data-state`。

  **破坏性：下列节点上不再有 `data-status`，选它的 CSS 一条也不会再命中。** 这一介质没有 IDE 提示，选择器失配既不报错也不降级——请在自己的代码库里全文搜索 `data-status`，凡是选中下表组件的，把属性名换成 `data-state`，取值一字不用改。

  | 组件           | 不再发 `data-status` 的部件   | 换成         | 取值                                          |
  | -------------- | ----------------------------- | ------------ | --------------------------------------------- |
  | `avatar`       | `root` / `image` / `fallback` | `data-state` | `loading` / `loaded` / `error`                |
  | `image`        | `root` / `image` / `fallback` | `data-state` | `loading` / `loaded` / `error`                |
  | `thread`       | `root` / `viewport`           | `data-state` | `idle` / `submitted` / `streaming` / `error`  |
  | `composer`     | `root`                        | `data-state` | `ready` / `submitted` / `streaming` / `error` |
  | `file-upload`  | `item`                        | `data-state` | `uploading` / `done` / `error`                |
  | `message-feed` | `root`                        | `data-state` | `idle` / `submitted` / `streaming` / `error`  |

  前五家的那些部件上，`data-state` 此前就在发同一个值，换个属性名即可；`message-feed` 的 `root` 是唯一一处此前只有 `data-status`、现在改发 `data-state` 的。

  `result` 的 `root` 仍发 `data-status`，没有变化。至此 `[data-status='error']` 只会命中「一整页 500 报错」这一种语义，不会再顺带命中「加载失败的头像」或「一条流到一半出错的消息」。

  ## 二、`tree` 的 `selectionMode` 已删，改用 `multiple`

  树的选择模式此前有新旧两个入口：`multiple?: boolean`（同族的 `tree-select` 与另外六家都用它）与只有两个取值、与布尔等价的 `selectionMode?: 'single' | 'multiple'`。旧入口整条删除，两者同时给时以旧名为准的那条规矩也随之作废。

  **破坏性：下列名字已删。**

  | 已删                                                | 换成                                    |
  | --------------------------------------------------- | --------------------------------------- |
  | `@xihan-ui/headless` 导出的类型 `TreeSelectionMode` | 无——模式是布尔，写 `multiple?: boolean` |
  | `@xihan-ui/headless` 导出的函数 `treeSelectionMode` | 无——直接读 `multiple`                   |
  | Vue `<XhTreeRoot selection-mode="multiple">`        | `<XhTreeRoot multiple>`                 |
  | 自定义元素 `<xh-tree selection-mode="multiple">`    | `<xh-tree multiple>`                    |
  | `useTree()` / `TreeApi` 上的 `selectionMode` getter | `multiple`（布尔）                      |

  `selectionMode` 在 `calendar`、`date-picker`、`listbox`、`table` 上是各自真实的多取值枚举，不在此列，一个字没动。

  ## 三、版本政策不再承诺废弃期

  原先写着「标记废弃后至少保留到下一个 major、且不少于两个 minor，取更长者」，并给新增必备部件留了「一个 major 周期内只报 `warn`」的缓冲档。两条都已撤销：本库不设废弃期、不留别名、不挂 `@deprecated` 让旧名多活一版；移除动作直接落在 major，逐条写进更新日志——那是唯一的迁移材料。新增必备部件从落地那一刻起就按 `error` 报（校验器本来就一直是 `error`，此前那条缓冲档只写在文档里、代码从没实现过）。

  这两种介质都没有 IDE 提示，改错了不会报错，所以上面两张表把旧名与替换写法逐条列全，可以直接照着在自己的代码库里全文搜索。

  ## 默认渲染逐像素未变

  自带皮肤里没有一条规则选中那五个组件的 `data-status`（只有 `result.css` 选 `data-status`），`tree` 的选择模式换入口也不改任何一条选择器。八件像素基线（button / text-field / select / menu / popover / dialog / drawer / toast）无差异。

- 8e35021: **空状态的 `status` 只收 `'404' | '403' | '500'` 三个状态码；成功 / 警示 / 出错 / 提示改走 `tone`。**

  `status` 原来把结果页的状态码与通用结果的语气混在一根轴上：`'error'` 与 `tone="danger"` 说的是同一件事、写法却有两套，也与全库的语气轴对不上。现在 `status` 只表达结果页的状态码，皮肤仍把它们并进最接近的一族语气色；`'success' | 'warning' | 'error' | 'info'` 四档撤掉，改写 `tone="success" | "warning" | "danger" | "info"`，两者都写时以 `tone` 为准。三端同步：`EmptyStateStatus` 收窄，自定义元素的 `status` attribute 取值同步；皮肤撤掉四条按通用结果换色的规则；「结果类型」示例改成语气示例。

- 504d7e1: FieldControl 默认组合模式统一使用严格宿主检查：Fragment 内的唯一控件正常接线，零/多个节点及非空文本混排明确失败。需要作者自行绑定多个节点时必须显式设置 asChild=false，不再将无效结构默认为手工接线。
- 2e9ee9d: Form/Field 的四条状态轴现在会真正进入 TextField 控件机器，而不只停在包装节点的 data/ARIA 属性。

  `disabled`、`readOnly`、`required`、`invalid` 的统一优先级为「实例 > 最近 Field > Form > false」：
  控件未声明时从 FormFieldGroup 继承，Field 包装时继续把结果下传到实际可聚焦的 input。显式
  `false` 是正式的实例覆盖，不再会因为外层 Form 为 disabled 或有规则/错误而被重写。

  Web Components 的 `<xh-field>` 同步支持 `read-only`，并将 Form/Field 状态交给嵌套的
  `<xh-text-field>` 机器；直接放进 `<xh-form>` 字段组的 `<xh-text-field>` 也使用同一优先级。
  此前依赖「Form disabled 仍能编辑内置 TextField」或「显式 false 被外层状态强制改写」的写法需要调整。

- c60f032: Form 字段身份统一为 `FormPath`。`XhFormFieldGroup` 与 `XhFormErrorSummaryItem`
  的 `value` 改为必填 `name`；字符串始终是单个字段（`user.email` 不再被解释为
  层级），嵌套字段必须显式传数组路径。

  Headless 新增 `formPathKey`、`formPathDisplay`、`getFormPathValue`、
  `setFormPathValue` 与 `createFormPathRecord`。数组路径的 values、rules、errors、
  校验任务、DOM id、摘要和落焦均走同一条路径身份，绝不依赖数组隐式转成逗号字符串。
  Web Components 的字符串字段写 `name`；数组路径必须写严格 JSON `data-path`，
  运行期改写会自动重新接线。FieldArray 现在会在 Form 内自动接入路径真源；新增、删除、换序会同时迁移其子字段的 values、rules、errors、进行中的 validation 与已验证错误标记，行字段名改为显式数组 FormPath，绝不拼接或解析字符串下标。

- 19570ad: **grid 的列数、跨列与错列有了执行得动的取值范围。** 三个 prop 此前是裸 `number`：`:cols="16"` 编译通过、DOM 上写着 `data-cols="16"`、屏幕上是一列——没有类型错、没有告警、也没有门禁；文档里的「1 至 12」只是一句描述，没有任何执行点。

  现在两头都收紧，与同形态的 `descriptions.columns` 一致：

  - **类型收成字面量联合。** 新增导出 `GridColumnCount`（`1 | 2 | … | 12`，`cols` 与 `span` 用它，断点对象的每一档也是它）与 `GridColumnOffset`（`1 | 2 | … | 11`，`offset` 用它）。
  - **连接层归一。** 范围外的值——0、负数、小数、超过上限——一律按没写算：`cols` 落回一列、`span` 占一列、`offset` 不错列。DOM 上因此只出得来皮肤有规则接的取值：`data-cols` 恒在 1 至 12 之间，`data-span` 与 `data-offset` 要么落在范围内、要么不出现。

  范围与「越界怎么办」都写进了组件文档，不再是口头约定。

  **破坏性：TypeScript 那一路，`cols` / `span` / `offset` 上原来编译得过的任意数字现在报错。** 改法是把值收进范围，或按业务先夹一次再传。HTML 属性与纯 JS 那一路（`cols="16"`、JS 里 `el.cols = 16`）不报错——元素的 `cols` property 在 TypeScript 下同样收了范围，那一路照报——但行为从「落一个没人接的值」变成「按一列排」——写了越界值的地方屏幕上看不出差别，DOM 上的 `data-cols` 会从 `16` 变成 `1`，取它的选择器要跟着改。

  ## 默认渲染逐像素未变

  范围内的取值一个字没动；范围外的取值此前就没有任何一条皮肤规则接得住。

- ab984e8: ToggleGroup 默认外观改为浅色胶囊分段控件，选中项使用品牌淡底；`solid` 继续提供强品牌选中态。组内按压不再缩放，分隔线改为覆盖接缝的半高细线。

  ButtonGroup 与 ToggleGroup 的 `outline` 改由组根绘制一条连续外框，子项不再各自绘制贯穿全高的边框；组内仍使用半高分隔线。

  移除 `--xh-toggle-group-separator-inset` 与 `--xh-toggle-group-separator-gap`，新增 separator size、opacity 与 disabled opacity 覆盖槽。

  ButtonGroup 与 ToggleGroup 默认自动生成相邻项分隔线，并新增 `separators` 属性控制显示。移除 `XhButtonGroupSeparator`、`XhToggleGroupSeparator` 及对应 Headless separator 部件与 connect API；分隔线改为适配器内部结构，不再要求作者手工维护。

  Button、ButtonGroup、Toggle 与 ToggleGroup 皮肤增加浅色/深色交互状态、连续外框和自动分隔线规则；同步更新 CSS 体积基线。

  视觉环境控制器迁入 Core，适配器不再硬依赖 Tokens；`@xihan-ui/tokens/runtime` 保持原导出入口。

- 5f18462: KbdGroup 改为多枚键名共享同一枚 24px 键帽表面，并新增 `default` 与 `light` 两种外观。

  移除分隔符部件与可见加号，同时删除 `size`、`pressed`、`disabled` 属性；整组可访问名称继续保留完整的组合键读法。

- 78ccfcb: 将快捷键展示与行为直接拆成唯一职责边界，不保留旧展示分支。

  新增无状态 `Kbd` / `KbdGroup` family：Vue 与 React 分别公开 `XhKbd`、`XhKbdGroup`，
  Web Components 新增 `<xh-kbd>`、`<xh-kbd-group>`。单枚键帽使用原生 `<kbd>`；组合由
  Headless 统一完成平台格式化、连接符、修饰键身份与整组可读名称，视觉键帽和连接符从无障碍树隐藏，
  整组只朗读一次。`value` / `keys` 必填，空声明和空读屏翻译直接报错。

  `Hotkeys`、`XhHotkeys`、`<xh-hotkeys>` 与 `useHotkeys` 现在只负责注册和匹配，不再生成 DOM。
  删除 `HotkeysApi.segments`、`separator`、`segmentOf`、三个视觉 getter、`HotkeysKeyProps`、
  `HotkeysTranslations` 以及 Hotkeys 的 `size` / `translations` props。`keys` 改为必填；空组合或
  包含多枚主键的组合直接报错。删除 `target='parent'`，局部范围改为返回真实 EventTarget 的显式 resolver；
  SSR 不读取 ambient document，卸载仍精确解绑监听。

  删除 `@xihan-ui/styles/hotkeys.css` 与全部 `--xh-hotkeys-*` 槽，新增 `kbd.css` / `kbd-group.css`。
  键帽使用 20 / 24 / 28px 三档中性实体面、等宽字与内嵌底缘压感；只有显式 `pressed`
  事实或真实可交互 owner 的 `:active` 才轻压。禁用、compact、RTL、forced-colors 与 200% 缩放
  均由新 family 独立承担。

  Command、Menu、ContextMenu 与快捷键文档示例已迁移为显式组合 Hotkeys + KbdGroup，
  没有 `XhHotkeys` 视觉别名或双轨兼容层。

- 66d7ad5: Kbd 收敛为固定 24px 的纯展示键帽，新增 `default` 与 `light` 两种外观。

  移除 `size`、`pressed`、`disabled` 属性以及按钮式压感、单独禁用状态和密度分支；组合与禁用语义继续由 KbdGroup 负责。

- 16f8296: **Kbd 统一为“键盘按键”。** 单键和组合键改用同一个 `keys` 数组输入；默认只展示，显式开启 `register` 后才安装快捷键监听，并继续支持 `target`、`enabled`、`preventDefault` 与 `hot-key`。

  移除重叠的 Hotkeys、KbdGroup、`useHotkeys`、`<xh-hotkeys>`、`<xh-kbd-group>` 和 `kbd-group.css`。对应展示与监听能力均并入 Kbd，不提供旧名称兼容层。

  组合键在同一表面内以 4px 间隙分隔，新增逐键部件、注册状态与禁用色，使 `kbd.css` 的压缩体积由 1185 字节增至 1654 字节；退役的 `kbd-group.css` 同步从体积基线移除。

- 19570ad: **listbox 的选择模式收成一个入口：`selectionMode`。** 此前它同时收 `multiple?: boolean` 与 `selectionMode?: 'single' | 'multiple' | 'extended'`，还写死了「两者同时给时以 `selectionMode` 为准」的仲裁规矩，并为此导出了一个只做仲裁的函数。同一件事不留两个入口，`multiple` 整条删除。

  留下的是 `selectionMode`：它表达得了 `multiple` 的全部含义，反过来 `multiple` 表达不了 `extended`（裸点替换、Ctrl/Cmd 切换单个、Shift 连选区间）。

  **破坏性：下列名字已删。**

  | 已删                                                   | 换成                                          |
  | ------------------------------------------------------ | --------------------------------------------- |
  | Vue `<XhListboxRoot multiple>`                         | `<XhListboxRoot selection-mode="multiple">`   |
  | 自定义元素 `<xh-listbox multiple>`                     | `<xh-listbox selection-mode="multiple">`      |
  | `XhListboxElement` 上的 `multiple` property            | `selectionMode` property                      |
  | `ListboxSchema['props']` 的 `multiple`                 | `selectionMode: 'multiple'`                   |
  | `@xihan-ui/headless` 导出的函数 `listboxSelectionMode` | 无——直接读 `selectionMode`，缺省是 `'single'` |

  特性名没有 IDE 提示，写错既不报错也不降级：请在自己的代码库里全文搜索 `multiple`，凡是落在 listbox 上的都换成 `selection-mode="multiple"`。

  **方向与 `tree` 那次相反，别照着推断。** `tree` 留的是 `multiple`、删的是 `selectionMode`（它只有两个取值，与布尔等价）。listbox 有三个取值，布尔装不下，因此留的是枚举。同族另外七家（accordion / cascader / combobox / select / toggle-group / tree / tree-select）仍是 `multiple`，一个字没动。

  **popselect 的 `multiple` 没有变。** 它内部跑的是 listbox 机器，现改为按自己的 `multiple` 翻成 `selectionMode`；它自身只有两种模式，对外仍写 `multiple`。

  ## 默认渲染逐像素未变

  选择模式不进任何一条选择器，皮肤一条规则都不读它。

- 0edf9bd: **加载条撤掉 `color` prop：进度段的颜色只走语气 `tone` 或皮肤槽 `--xh-loading-bar-range`。**

  `color` 是一个绕过令牌系统的内联颜色出口：给了之后暗色主题、增强对比与高对比模式都管不到它，与库里「不写颜色散值」的约定相悖，也与 `tone` 两头表达同一件事。现在进度段的内联样式只剩宽度那条轴；要换颜色，六种语气不够就在任意子树上重声明 `--xh-loading-bar-range`。三端同步：Vue / React 的 `color` prop、自定义元素的 `color` attribute、三个加载条服务的 `color` 选项一并撤掉。

- cd74476: **新增** `log` 的 `scroll-button` 与 `live-region` 两个部件：内置的「回到底部」和一块视觉隐藏的播报区，两个适配器同时可用。

  `log` 此前只有 `root` / `viewport` / `content` / `line` 四层：粘底状态透出来了，但离底之后没有归位的入口——每个用它的人都得自己画一颗按钮、自己判断什么时候露出来；而它整块内容会不会被读屏念、什么时候念，作者一点都插不上手。补上这两个部件之后，「任意内容的粘底滚动 + 视口自己是 Tab 停靠点 + 内置回到底部 + 播报区」这一组能力在 `log` 上齐了。

  - `scroll-button`：只按「在不在底」判定露面，不看粘附意图；收起走 `hidden` 不卸载节点，冒出来时带一段淡入缩放。留空则由皮肤画一枚向下的字形，往按钮里塞节点即换成自己的图形。可访问名走 `translations.scrollToBottom`。
  - `live-region`：`role=status` + `aria-live=polite` + `aria-atomic`，宿主往里写整句要念的话。

  **行为变更**：视口现在显式发 `aria-live="off"`。`role=log` 隐含 polite 活区，一行来一句地念会把连成串的输出变成读屏里的噪声；播报改由 `live-region` 承担，宿主决定念哪一句、什么时候念。要保留播报的，渲上 `live-region` 部件并在一段输出收尾时写进整句结论；把每一行原样写进去等于把逐行播报又打开一遍。

  `rows` / `loading` / `threshold` / `onStickChange`、四个原有部件的属性形状，以及 `atBottom` / `sticking` 的语义都不动。

- db52f9b: **`matrix-code` 新增 `data-matrix` 码制与 `gs1` 模式；根上的 `data-modules` 与 api 的 `count` 改为列、行两个数。**

  `format="data-matrix"` 画 Data Matrix ECC 200（ISO/IEC 16022，含 2024 版并入的矩形扩展 DMRE 共 48 档尺寸）：编码器自写，ASCII 模式（数字两两压缩、Latin-1 以外的字符按 UTF-8 并声明 ECI 26），多块交错的 52×52 以上与 144×144 的 8+2 分块都按规范处理；`rectangular` 从矩形尺寸里挑，窄条标签放得下。Data Matrix 没有码眼，只铺模块那一条 `<path>`，L 形定位图形随 `moduleShape` 一起换——点刻打标出来的 Data Matrix 就是一排点。缺省静区按码制的规范值（qr 4、data-matrix 1）。里德-所罗门抽成共享的 `createReedSolomon(primitive, firstRoot)`，QR 与 Data Matrix 各自建域。

  `gs1` 三端同名（自定义元素 attribute `gs1`）：QR 在字节模式段前放 FNC1 首位指示符、Data Matrix 最前面放 FNC1 码字，即 GS1 QR / GS1 DataMatrix；变长 AI 之间用内容里的 GS（U+001D）分隔。`qrEncode` 与 `qrCapacityBytes` 各多一个可选参数。

  破坏性：一张码不再恒是正方形，`MatrixCodeApi.count` 拆成 `columns` 与 `rows`，根上的 `data-modules` 改为 `data-columns` 与 `data-rows`；`pixelSize` 现在是宽度，高按含静区的模块比例算出（正方形码不变）。`data-level` 与 `data-version` 只在 qr 下写。对当前码制没有意义的选项（`level` / `eyeShape` / `logo` 给了 data-matrix、`rectangular` 给了 qr）往诊断通道报一条新的 `matrix-code.option-ignored` 警告，按没给处理，码照画。

- 0daae33: **`mention` 的输入框从可变多行改成单行输入框，与其它输入控件一致。**

  原先 `getInputProps` 走 `normalize.textarea`，三家适配器各自渲一个 `<textarea>`，皮肤给它 `min-block-size` 与 `resize: vertical`——框高按行数撑、还能拖着往下拉。现在它是一个 `<input type="text">`：框高定在控件档（`--xh-mention-input-h` 回退 `--xh-control-h-*`），纵向内距归零，与 `text-field` 的单行档并排时等高。

  破坏面逐条：

  - **渲出来的元素换了。** Vue 的 `XhMentionInput`、React 的 `XhMentionInput` 都渲 `<input>`；Web Components 侧作者自己摆的那个 `input` 角色节点必须从 `<textarea>` 改成 `<input>`。按 `HTMLTextAreaElement` 取件、或用 `rows` / `resize` 之类只有多行才有的属性去接的代码要改。
  - **`as` 入口整个撤掉。** `getInputProps` 不再收参数；`MentionInputHost` 与 `MentionInputProps` 两个类型不再导出；Vue 与 React 的 `XhMentionInput` 不再有 `as` prop；`MentionInputEl` 从 `HTMLTextAreaElement | HTMLInputElement` 收窄成 `HTMLInputElement`。
  - **无障碍属性从「多行那一档」翻到「单行那一档」。** 之前多行宿主上 `role` / `aria-expanded` / `type` 三条一并缺席（`textarea` 的允许角色只有 textbox，而 `aria-expanded` 不在 textbox 的支持属性里）；现在恒发 `role="combobox"`、`type="text"` 与 `aria-expanded="true" | "false"`。断言过这三条为空的用例要改。
  - **回车那一行的说法变了。** 有高亮可提交时照旧吞掉按键；一条候选都提交不了时仍然不吞——只是单行输入框里这一发不再是换行，而是留给表单做隐式提交。键盘表里 `mention.kbd.newline` 随之更名为 `mention.kbd.enter-pass`。
  - **使用者覆盖槽 `--xh-mention-input-py` 撤销**（连同它背后的私有槽 `--xh-_mention-py`）。这两个槽只喂输入框那条 `padding-block`，纵向内距归零之后没有使用者，改它已经不起作用。框高仍走 `--xh-mention-input-h`，尺寸档照旧由 `data-size` 换。

  **需要在多行正文里 @ 人的，本库现在没有替代品。** `prompt-input` 是 AI 场景的提示输入框，形态、键位与提交语义都不是一回事，不能当多行提及用；`text-field` 的多行档没有提及能力。这条能力就是被去掉了，不是搬去了别处。

  浮层落位不受影响：定位引擎的锚点一直是输入框本身（`refs.getInputEl`），从来不按插入符算——换掉宿主标签之后，候选面板照旧贴着整个框的下缘、左缘与框对齐。输入法组合期的行为也没动：组合中的按键一律不接，那一发归输入法候选框。

- f12bee3: 将 Menu、ContextMenu 与 Menubar 的多级子菜单所有权下沉到 headless：直属子节点登记、
  递归 Portal 悬停区域、叶到根关闭顺序与唯一根选择通知现在由 `createMenuTreeNode` 统一维护，
  三端适配器只连接宿主上下文、DOM getter、Portal 和生命周期。

  React 与 Vue 删除仅供旧适配器内部收链使用、但曾被误导出的 `MenuChain`、
  `ContextMenuChain`、`MenubarChain` 及对应 Provider / provide / use API。组合部件无需作者接入这些接口。

- c8790c8: **`@xihan-ui/kernel`、`@xihan-ui/machine`、`@xihan-ui/behavior` 三个包合并成 `@xihan-ui/core`。三个旧包名不再发布，也没有转发包。**

  三者原本是一条严格的链（`machine` 依赖 `kernel`，`behavior` 依赖 `kernel` 与 `motion`），从不单独安装：装了任意一个适配器就三个一起来。分成三个包对使用者没有取舍空间，只多出两份包名、两份版本号与两份 README。合并之后公开包从 18 个减到 16 个。

  **导出的名字一个都没有变。** 原先从三个包里导出的东西现在全部从 `@xihan-ui/core` 的主入口导出，签名与行为不变。两处例外：

  - `Dict` 本来就是结构原语那一段的类型，状态机那一段只是转手再导出一遍，现在只剩一处定义。
  - 锁步版本不一致那条诊断（`core.version-mismatch`）的 `detail` 字段由 `kernelVersion` 改名为 `coreVersion`，播报文案里的包名同步改口。读这条诊断做分流的要跟着改字段名。

  ## 包名怎么改

  | 从前                 | 现在             |
  | -------------------- | ---------------- |
  | `@xihan-ui/kernel`   | `@xihan-ui/core` |
  | `@xihan-ui/machine`  | `@xihan-ui/core` |
  | `@xihan-ui/behavior` | `@xihan-ui/core` |

  同一个文件里如果原来从两个或三个旧包各引一行，合并之后是同一个模块说明符，按自己的 lint 规则并成一行即可。

  ## 子路径怎么改

  子入口一条不少，名字原样平移：

  | 从前                          | 现在                        |
  | ----------------------------- | --------------------------- |
  | `@xihan-ui/kernel/metadata`   | `@xihan-ui/core/metadata`   |
  | `@xihan-ui/kernel/skin-check` | `@xihan-ui/core/skin-check` |
  | `@xihan-ui/kernel/vite`       | `@xihan-ui/core/vite`       |
  | `@xihan-ui/machine/vanilla`   | `@xihan-ui/core/vanilla`    |
  | `@xihan-ui/behavior/presence` | `@xihan-ui/core/presence`   |

  ## 依赖怎么改

  `package.json` 里把三个旧包名删掉，换成一条 `@xihan-ui/core`。装适配器的使用者不用动：`@xihan-ui/vue` 与 `@xihan-ui/web-components` 已经改成依赖 `@xihan-ui/core`，升级适配器就一并带过来。

- 14b9dcd: 组合框与树选择删除逗号拼接表单协议，每个选中值生成一个同名原生隐藏字段；零选中不提交空字符串，含逗号的值保持原样。读取多值请使用 FormData.getAll(name)。

  无头 getHiddenInputProps 现要求显式传入 { value }，调用方按 api.value 逐个生成 input，不保留旧无参调用。Vue/React HiddenInput 自动铺开；Web Components 保留一个作者声明节点并管理额外字段。两组件根新增 form 属性，显式关联表单的提交与 reset 使用同一所有者。

- e3abd75: **通知队列的 `max` 缺省从不限改成 5，与轻提示服务同一个数。**

  此前 `notification` 不给 `max` 就没有上限：连发多少条，队列里就留多少条、DOM 里就挂多少张卡片。那一摞是一整面固定定位的 flex 列，既不滚动也不折叠，第六张往后直接堆出视口，看不见也关不掉，只能等它们自己到点走。轻提示服务那边一直是「不写 `max` 缺省留 5 条」，同一台队列机器两个出口两种口径。

  现在缺省上限住在 headless 机器里，新增导出常量 `NOTIFICATION_MAX = 5`，`visibleNotifications()` 与 `ITEMS.CREATE` 在 `max` 为 `undefined` 时都取它。三条路一并跟着变：声明式的 `XhNotificationRoot` / `<xh-notification>`、三个适配器的 `createNotificationService()`，谁不写 `max` 谁就是每个位置留 5 条。挤条规则不变：先挤低优先级、同级里挤最旧的，非受控队列被挤掉的那条直接从队列删掉、不排队等位；受控队列只是不显示窗口外的，宿主那份 `items` 原样。

  **破坏面**：依赖「不写 `max` 就全部显示」的调用方，第六条起会被挤掉。要回到不限，显式写 `max: Infinity`（HTML 属性写 `max="Infinity"`）。`max <= 0` 与 `NaN` 仍按不限处理，这一段没动。

  `createToastService()` 的入参、行为与 DOM 全部照旧——它本来就显式传 5；三个适配器的轻提示服务现在改读 `NOTIFICATION_MAX`，同一个数只写在机器一处。

- db84441: 数字字段统一使用 `control` 作为必需的唯一输入壳，不再支持输入与加减按钮脱离 `control` 的三件并排结构。迁移时将 `input` 与可选的两颗动作按钮放进 `control`。

  随旧结构删除的输入框盒与独立动作样式槽不再生效：`--xh-number-field-input-bg*`、`--xh-number-field-input-border*`、`--xh-number-field-input-h`、`--xh-number-field-input-radius`、`--xh-number-field-input-shadow`、`--xh-number-field-trigger-bg*`、`--xh-number-field-trigger-border*` 与 `--xh-number-field-trigger-radius`。

  `subtle` 变体改用无投影的扁平填充面；加减动作与输入之间的分割线缩短为半高并垂直居中。

- 4c287eb: **一名多义收口：`data-type` 拆成五个名字，`data-phase` 并进 `data-state`。** 一个属性名只答一个问题。`data-type` 此前同时答五个：这个值是什么形态、这条消息有多严重、这道题单选还是多选、滚动条什么时候露面、时间按什么格式渲染——使用者看见 `[data-type]` 猜不出选中的是什么，写 `[data-type='error']` 也说不清命中的是哪一类组件。`data-phase` 是同一件事的反面：相位在词汇表里早就属于 `data-state` 的 `phase` 族，`tool-call` 另开了第二个名字，于是想给「出错的那一档」写一条统一规则的人必须写两条。两处都按同一条规矩改完：**不留别名、不留过渡期。**

  **破坏性：下表左列的属性名在 DOM 上不再出现，选它的规则一条也不会再命中。** 这一介质没有 IDE 提示，改名之后选择器只会静默失配，不报错也不降级——请在自己的代码库里全文搜索左列，逐条换成右列。

  | 删掉的名字   | 改成               | 组件 / 部件                                                                                           | 取值                                                                                              |
  | ------------ | ------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
  | `data-type`  | `data-value-type`  | `json-viewer` 的 `item` / `item-value` / `branch`                                                     | `array` / `boolean` / `null` / `number` / `object` / `string`                                     |
  | `data-type`  | `data-severity`    | `toast` 的 `root`，`notification` 的 `item`                                                           | `info` / `success` / `warning` / `error` / `loading`                                              |
  | `data-type`  | `data-select-mode` | `question-flow` 的 `option-group` / `option` / `option-indicator`                                     | `single` / `multiple`                                                                             |
  | `data-type`  | `data-reveal-mode` | `scroll-area` 的 `root` / `scrollbar`，`scrollbar` 的 `root`                                          | `auto` / `always` / `scroll` / `hover` / `scroll-hover`                                           |
  | `data-type`  | `data-format`      | `time` 的 `root`                                                                                      | `date` / `datetime` / `relative`                                                                  |
  | `data-phase` | `data-state`       | `tool-call` 的 `name` / `summary` / `status` / `duration` / `approval` / `input` / `output` / `error` | `input-streaming` / `input-available` / `awaiting-approval` / `output-available` / `output-error` |

  各组件的 `type` / `phase` prop 一个都没动，默认渲染逐像素不变。

  **`tool-call` 的 `root` 与 `trigger` 不再报阶段。** 阶段与开合是两条正交的轴，一个属性只装得下一条：这两个部件的 `data-state` 是开合（`open` / `closed`，与其余折叠件一致），阶段落在上表那八个部件上。自带皮肤里「出错换描边色」那条改成从后代读阶段（`[data-part='root']:has([data-scope='tool-call'][data-state='output-error'])`），八个部件渲出任何一个都命中。要按阶段给整张卡片写规则的，照这个写法接。

  **五个新取值进了 `data-state` 的 `phase` 族**（`input-streaming` / `input-available` / `awaiting-approval` / `output-available` / `output-error`），族内互斥的规矩照旧；`phase` 族的其余 25 个取值不变。

  **门禁补了「一名多义」的另一半。** 原先只认得出「同一个名字既当布尔又当枚举」，认不出「两个组件都当枚举、取值域却完全不相干」——`data-type` 正是后者，一路攒到六种含义都没有一条判据会响。判据 ⑨ 两头收取值域（连接层的字面量 + 皮肤选择器选中的值），发现互不相交的一对就要求在 `state-vocabulary.json` 的 `enum` 段写明这个名字问的是什么；一句话说不清的即须拆名。形态、摆位这类「同一个问题、各家自己的取值」的名字逐条登记在案，登记了却不再互不相交的算名单过期，同样判红。`retired` 段补进 `data-open` / `data-phase` / `data-type` 三条，发了或选了都判红。

- c8790c8: **`@xihan-ui/code-highlight` 从适配器的硬依赖改成可选 peer，包也从 `engine` 组挪到 `features` 组。包名没变。**

  它只服务代码视图一个组件，装了适配器的人有九成用不上它。改成可选 peer 之后，要不要为着色付出这份体积由使用者定，不再由库替他决定。包所在的组跟着这条判据走：`engine` 是「使用者做不了取舍的」，`features` 是「你不点头它就不来」。

  ## 使用者要做什么

  **要着色**——单独装上它，其余不用动，代码视图照旧自动着色，`highlighter` prop 一个字都不用写：

  ```bash
  pnpm add @xihan-ui/code-highlight
  ```

  **不要着色**——什么都不用做。代码视图渲纯文本：行号、折叠、换行、高亮行照旧，只是不上色。**没装它不是错误**，控制台不会报错，也不会抛异常。

  **接的是别的着色器**（Shiki 之类）——什么都不用做，本来走的就是 `highlighter` prop。

  直接 `import { createHighlighter } from '@xihan-ui/code-highlight'` 的代码不受影响，导出的名字一个都没有变。

  ## 顺带

  适配器对它的引用改成了动态引入：可选 peer 却在主入口静态 import，等于把「可选」写成谎话——使用者不装它，模块解析就地报错。现在它是在组件首次用到时才去取，取不到就保持不着色。因此**着色比首帧晚一拍到达**：先渲纯文本，实现落位后重渲一次并上色。

- 6b4c5d0: **分页的每页条数控制器换成库里的下拉，省略位补上字形。**

  **`pagination` 的 `page-size-select` 此前是一个抹掉了系统外观的原生 `<select>`**，与库里其它下拉两个长相：文档站上它顶着系统的下拉箭头、展开出来的是操作系统那份列表，旁边的 `select` / `combobox` / `cascader` 却都是自己的浮层。现在它就是 `select`：分页内嵌一台 select 机器（档位与当前档受控于分页机，换档经回调送回来），`page-size-select` 降为挂载点，里头的角色节点带的是 `data-scope="select"`，吃 select 那份皮肤，浮层、键盘、连打检索与三视觉轴一并跟着它走。

  - 档位仍来自 `pageSizeOptions`，每一档的文字改由 `translations.pageSizeOption` 给（此前这条文案在库里声明着却没人用，档位文字只能靠作者自己渲染 `<option>`）。
  - 控件的可及名仍是 `translations.pageSizeSelect`：下拉自己把名字指向「标签 + 当前值」两个节点，而分页行里不摆可见标签，只剩当前值那一段会被念成控件名，所以 `trigger` 与 `list` 两处的名字链在这里换成直给的 `aria-label`。
  - 清空（下拉在收起态收的 Delete / Backspace）不改档位：分页没有「不分页」这一档，落空即不发事件。

  **破坏性变更：**

  - `connectPagination(service, normalize)` 改收两台机器：`connectPagination({ root, pageSizeSelect }, normalize)`。新增导出 `paginationPageSizeSelectProps`（喂给内嵌下拉的那份 props）、`paginationLabels`、`pageSizeOptionsOf` 与类型 `PaginationServices`。
  - `api.getPageSizeSelectProps()` 从 `T['select']` 变成 `T['element']`，只剩挂载点该有的那几个属性；控件本体走新增的 `api.pageSizeSelect`（整份 `SelectApi`）。
  - Vue 的 `XhPaginationPageSizeSelect` 与 React 的同名组件不再收渲染 `<option>` 的插槽（React 侧的 `PaginationPageSizeSelectSlotProps` 一并去掉），它们自己铺完下拉的角色节点；React 侧新增 `container` prop，与 `XhPaginationPositioner` 同义。
  - Web Components 侧作者写的 `<select data-xh-part="page-size-select">` 改成一个空 `<div data-xh-part="page-size-select">`，里头那套角色节点由元素自己建（与自绘滚动条同一条路，自建节点不打 `data-xh-part`）。
  - 皮肤里 `--xh-pagination-page-size-bg` / `-bg-hover` / `-border` / `-border-hover` 四个覆盖槽随原生下拉一并去掉，改用 select 自己那批槽。

  **省略位不写内容时此前是一格空白**：库里没有省略号字形令牌，`ellipsis-trigger` 空着就只剩一个看不出能点的空位。新增 `--xh-glyph-mark-ellipsis`，皮肤按兜底字形那套 `:empty::before` 的 mask 块画三点；作者往部件里塞了自己的图形或文字照旧让位。

- bdbf03c: **32 个部件改名，1 个部件并进另一个。** 不留别名、不留 `var(新名, 旧名)` 双写：下面列出的名字在解剖、连接层、两个适配器与皮肤里都不再存在。写旧名的节点拿不到任何属性，写旧槽名的覆盖不再生效。

  改名分三类：一个字面量在库内指着不同的东西（一名多义）、同一件事全库两个名字（同义两名）、以及重造了一整套集合词汇。

  ## 一、一名多义

  | 组件                          | 旧部件                            | 新部件                               |
  | ----------------------------- | --------------------------------- | ------------------------------------ |
  | `slider`                      | `marks` / `mark` / `mark-label`   | `tick-group` / `tick` / `tick-label` |
  | `date-picker` · `time-picker` | `presets`                         | `preset-group`                       |
  | `signature-pad`               | `segment`                         | `path`                               |
  | `diff-view`                   | `segment` · `stat`                | `inline-change` · `summary`          |
  | `color-picker`                | `area`                            | `saturation-area`                    |
  | `editable`                    | `area`                            | **并进 `control`**                   |
  | `timer`                       | `area`                            | `display`                            |
  | `combobox` · `listbox`        | `item-group` / `item-group-label` | `group` / `group-label`              |
  | `carousel` · `file-upload`    | `item-group`                      | `list`                               |
  | `pagination`                  | `ellipsis`                        | `ellipsis-trigger`                   |

  `editable` 的 `area` 与 `control` 本是两个只作排版落点的盒，职责重叠：预览区与输入框在一个盒里、三颗按钮在另一个盒里。两者并成一个 `control`，DOM 少一层——`preview` / `input` 与三颗按钮现在是它的直接子节点。`XhEditableArea` 与 `getAreaProps` 一并删除。

  ## 二、同义两名

  | 组件                    | 旧部件           | 新部件                  |
  | ----------------------- | ---------------- | ----------------------- |
  | `time-picker`           | `input`          | `segment`               |
  | `page-header`           | `subtitle`       | `description`           |
  | `heatmap`               | `week-day-label` | `week-day`              |
  | `card`                  | `cover`          | `media`                 |
  | `log` · `message-feed`  | `scroll-button`  | `scroll-to-end-trigger` |
  | `clipboard`             | `trigger`        | `copy-trigger`          |
  | `prompt-input`          | `input-row`      | `control`               |
  | `skeleton`              | `bone`           | `item`                  |
  | `avatar-group`          | `overflow`       | `overflow-item`         |
  | `alert` · `empty-state` | `icon`           | `indicator`             |

  ## 三、重造的集合词汇并回共享词汇

  | 组件            | 旧部件                                                           | 新部件                                            |
  | --------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
  | `question-flow` | `option-group` / `option` / `option-indicator` / `option-label`  | `group` / `item` / `item-indicator` / `item-text` |
  | `approval`      | `scope-group` / `scope-item` / `scope-indicator` / `scope-label` | `group` / `item` / `item-indicator` / `item-text` |

  `approval` 的授权项与 `question-flow` 的选项本来就是同一种「方框加文字的一行」，现在两家用同一套名字，皮肤那一层的行盒规则也就对得上了。`approval` 的授权项同批补上按下缩放，与 `question-flow` 的选项一致。

  ## 连带改动

  **连接层的取属性函数**按部件名派生，逐条跟着改：`getMarksProps` / `getMarkProps` / `getMarkLabelProps` → `getTickGroupProps` / `getTickProps` / `getTickLabelProps`，`getPresetsProps` → `getPresetGroupProps`，`getSegmentProps`（signature-pad）→ `getPathProps`，`getStatProps` → `getSummaryProps`，`getSegmentProps`（diff-view）→ `getInlineChangeProps`，`getAreaProps` → `getSaturationAreaProps`（color-picker）/ `getDisplayProps`（timer），`getItemGroupProps` / `getItemGroupLabelProps` → `getGroupProps` / `getGroupLabelProps`（combobox / listbox）与 `getListProps`（carousel / file-upload），`getEllipsisProps` → `getEllipsisTriggerProps`，`getInputProps`（time-picker）→ `getSegmentProps`，`getSubtitleProps` → `getDescriptionProps`，`getWeekDayLabelProps` → `getWeekDayProps`，`getCoverProps` → `getMediaProps`，`getScrollButtonProps` → `getScrollToEndTriggerProps`，`getTriggerProps`（clipboard）→ `getCopyTriggerProps`，`getInputRowProps` → `getControlProps`，`getBoneProps` → `getItemProps`，`getOverflowProps` → `getOverflowItemProps`，`getIconProps`（alert / empty-state）→ `getIndicatorProps`，`getOption*Props` / `getScope*Props` → `getGroupProps` / `getItemProps` / `getItemIndicatorProps` / `getItemTextProps`。

  **读口**：`showScrollButton` → `showScrollToEndTrigger`（log / message-feed）。

  **类型与集合查询**：`SliderMarkProps` → `SliderTickProps`、`SliderMarksMarkSlotProps` → `SliderTickGroupTickSlotProps`、`TimePickerInputProps` → `TimePickerSegmentProps`、`timePickerInputQuery` → `timePickerSegmentQuery`、`DiffViewSegmentProps` → `DiffViewInlineChangeProps`、`ComboboxItemGroupProps` / `ListboxItemGroupProps` → `ComboboxGroupProps` / `ListboxGroupProps`、`PaginationEllipsisProps` → `PaginationEllipsisTriggerProps`、`HeatmapWeekDayLabelProps` → `HeatmapWeekDayProps`、`SkeletonBoneProps` → `SkeletonItemProps`、`QuestionFlowOptionProps` → `QuestionFlowItemProps`、`questionFlowOptionQuery` → `questionFlowItemQuery`。

  **Vue 部件组件**逐个跟着部件名走：`XhSliderMarks` → `XhSliderTickGroup`、`XhDatePickerPresets` / `XhTimePickerPresets` → `Xh*PresetGroup`、`XhTimePickerInput` → `XhTimePickerSegment`、`XhSignaturePadSegment` → `XhSignaturePadPath`、`XhDiffViewStat` → `XhDiffViewSummary`、`XhColorPickerArea` → `XhColorPickerSaturationArea`、`XhTimerArea` → `XhTimerDisplay`、`XhComboboxItemGroup(Label)` / `XhListboxItemGroup(Label)` → `Xh*Group(Label)`、`XhCarouselItemGroup` / `XhFileUploadItemGroup` → `Xh*List`、`XhPaginationEllipsis` → `XhPaginationEllipsisTrigger`、`XhPageHeaderSubtitle` → `XhPageHeaderDescription`、`XhHeatmapWeekDayLabel` → `XhHeatmapWeekDay`、`XhCardCover` → `XhCardMedia`、`XhLogScrollButton` / `XhMessageFeedScrollButton` → `Xh*ScrollToEndTrigger`、`XhClipboardTrigger` → `XhClipboardCopyTrigger`、`XhPromptInputInputRow` → `XhPromptInputControl`、`XhSkeletonBone` → `XhSkeletonItem`、`XhAvatarGroupOverflow` → `XhAvatarGroupOverflowItem`、`XhAlertIcon` / `XhEmptyStateIcon` → `Xh*Indicator`、`XhQuestionFlowOption*` / `XhApprovalScope*` → `Xh*Group` / `Xh*Item` / `Xh*ItemIndicator` / `Xh*ItemText`。`XhSliderTickGroup` 的插槽 `mark` 改名 `tick`，载荷字段同名。

  **自定义元素的 `::part`** 与角色节点的 `data-xh-part` 取值同步改名。

  **覆盖槽**跟着部件段走：`--xh-slider-mark*-*` → `--xh-slider-tick*-*`、`--xh-date-picker-presets-*` / `--xh-time-picker-presets-*` → `-preset-group-*`、`--xh-diff-view-segment-*` → `-inline-change-*`、`--xh-color-picker-area-*` → `-saturation-area-*`、`--xh-editable-area-min-{h,w}` → `--xh-editable-control-min-{h,w}`、`--xh-timer-area-fg` → `--xh-timer-display-fg`、`--xh-combobox-item-group-gap` / `--xh-listbox-item-group-gap` → `--xh-*-group-gap`、`--xh-pagination-ellipsis-fg` → `--xh-pagination-ellipsis-trigger-fg`、`--xh-page-header-subtitle-*` → `-description-*`、`--xh-card-cover-*` → `-media-*`、`--xh-log-scroll-button-*` → `--xh-log-scroll-to-end-trigger-*`、`--xh-message-feed-button-*` → `--xh-message-feed-scroll-to-end-trigger-*`、`--xh-clipboard-trigger-*` → `-copy-trigger-*`、`--xh-skeleton-bone-*` → `-item-*`、`--xh-avatar-group-overflow-*` → `-overflow-item-*`、`--xh-alert-icon-{box,fg}` / `--xh-empty-state-icon-{fg,font-size}` → `-indicator-*`、`--xh-question-flow-option*-*` → `--xh-question-flow-{group,item,item-indicator,item-text}-*`、`--xh-approval-scope*-*` → `--xh-approval-{group,item,item-text}-*`。

  `--xh-<组件>-icon-size` 是全库通用的图标尺度槽、不是部件槽，`alert` 与 `empty-state` 的这一支**不改名**。

  **`--xh-combobox-group-gap` / `--xh-listbox-group-gap` 换了含义**：它们现在管一组内部条目之间的间距（与 `--xh-menu-group-gap` 同义），原先管的「相邻两组之间留白」移到新槽 `--xh-combobox-group-spacing` / `--xh-listbox-group-spacing`。两处都设过值的，两个名字都要改一遍。

- 19570ad: **同一类角色在不同组件里取了对立的部件名，十处逐处定一个赢家。** 部件名是对外契约：它同时是 `data-part` 的取值、CSS 选择器的落点、Vue 部件组件的名字与自定义元素的 `csspart`。名字不统一，读者每换一个组件就得重学一遍，写共用样式时也没法一条选择器覆盖同一类角色。

  七处按「多数家的名字」定案改名，三处判定为不同的东西、把区别写进解剖注释。

  ## 一、改名（破坏性）

  | 组件                         | 已删的部件名    | 换成                 | 为什么是它赢                                                                                                                                                                         |
  | ---------------------------- | --------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `approval` / `question-flow` | `announcement`  | `live-region`        | 另外七家（log / markdown-stream / message-feed / sortable / table / tabs / tree）都叫 `live-region`；`announcement` 在这七家里指的是「念的那句文本」（`api.announcement`），一名两义 |
  | `approval`                   | `actions`       | `footer`             | 六家（card / layout / page-header / question-flow / select / table）都叫 `footer`；approval 的这一位与 question-flow 的 `footer` 连注释都一样：「只排布按钮，不承载语义」            |
  | `checkbox-group`             | `trigger`       | `select-all-trigger` | table 的同物就叫 `select-all-trigger`；库里另外 30 家的 `trigger` 一律指「开合这个组件的那一位」，全选不是开合                                                                       |
  | `fieldset`                   | `helper-text`   | `description`        | 十三家都叫 `description`，兄弟件 `field` 也是；`helper-text` 全库仅此一处                                                                                                            |
  | `sortable`                   | `item-handle`   | `item-drag-trigger`  | 另三处都叫「拖谁 + `-drag-trigger`」（tabs 的 `tab-drag-trigger`、table 的 `column-drag-trigger` 与 `row-drag-trigger`）                                                             |
  | `table`                      | `loading-state` | `loading`            | 与同一位置的占位部件 `empty` 成对；`empty` 有四家在用（cascader / combobox / diff-view / table），`loading-state` 全库仅此一处                                                       |
  | `tool-call`                  | `name`          | `label`              | 三十四家都叫 `label`，同一台折叠机器的兄弟件 `reasoning` 也是；`name` 全库仅此一处                                                                                                   |

  跟着改名一起变的名字：

  | 已删                                                        | 换成                                                                               |
  | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
  | Vue `XhApprovalActions`                                     | `XhApprovalFooter`                                                                 |
  | Vue `XhApprovalAnnouncement`                                | `XhApprovalLiveRegion`                                                             |
  | Vue `XhQuestionFlowAnnouncement`                            | `XhQuestionFlowLiveRegion`                                                         |
  | Vue `XhCheckboxGroupTrigger`                                | `XhCheckboxGroupSelectAllTrigger`                                                  |
  | Vue `XhFieldsetHelperText`                                  | `XhFieldsetDescription`                                                            |
  | Vue `XhSortableItemHandle`                                  | `XhSortableItemDragTrigger`                                                        |
  | Vue `XhTableLoadingState`                                   | `XhTableLoading`                                                                   |
  | Vue `XhToolCallName`                                        | `XhToolCallLabel`                                                                  |
  | `ApprovalApi.getActionsProps`                               | `getFooterProps`                                                                   |
  | `ApprovalApi` / `QuestionFlowApi` 的 `getAnnouncementProps` | `getLiveRegionProps`                                                               |
  | `CheckboxGroupApi.getTriggerProps`                          | `getSelectAllTriggerProps`                                                         |
  | `FieldsetApi.getHelperTextProps`                            | `getDescriptionProps`                                                              |
  | `SortableApi.getItemHandleProps`                            | `getItemDragTriggerProps`                                                          |
  | `TableApi.getLoadingStateProps`                             | `getLoadingProps`                                                                  |
  | `ToolCallApi.getNameProps`                                  | `getLabelProps`                                                                    |
  | `SortableTranslations` 的 `itemHandle`                      | `itemDragTrigger`                                                                  |
  | 组件覆盖槽 `--xh-sortable-handle-bg-hover`                  | `--xh-sortable-drag-bg-hover`（这一段与 tabs、table 的 `--xh-<组件>-drag-*` 同名） |
  | 组件覆盖槽 `--xh-sortable-handle-fg`                        | `--xh-sortable-drag-fg`                                                            |
  | 组件覆盖槽 `--xh-sortable-handle-fg-disabled`               | `--xh-sortable-drag-fg-disabled`                                                   |
  | 组件覆盖槽 `--xh-sortable-handle-fg-hover`                  | `--xh-sortable-drag-fg-hover`                                                      |
  | 组件覆盖槽 `--xh-sortable-handle-radius`                    | `--xh-sortable-drag-radius`                                                        |
  | 组件覆盖槽 `--xh-sortable-handle-size`                      | `--xh-sortable-drag-size`                                                          |
  | 组件覆盖槽 `--xh-sortable-handle-grip-w`                    | `--xh-sortable-drag-grip-w`                                                        |
  | 组件覆盖槽 `--xh-sortable-handle-grip-h`                    | `--xh-sortable-drag-grip-h`                                                        |
  | 组件覆盖槽 `--xh-tool-call-name-font`                       | `--xh-tool-call-label-font`                                                        |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-fg`                 | `--xh-checkbox-group-select-all-trigger-fg`                                        |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-fg-disabled`        | `--xh-checkbox-group-select-all-trigger-fg-disabled`                               |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-font-size`          | `--xh-checkbox-group-select-all-trigger-font-size`                                 |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-font-weight`        | `--xh-checkbox-group-select-all-trigger-font-weight`                               |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-gap`                | `--xh-checkbox-group-select-all-trigger-gap`                                       |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-radius`             | `--xh-checkbox-group-select-all-trigger-radius`                                    |
  | 组件覆盖槽 `--xh-approval-actions-gap`                      | `--xh-approval-footer-gap`                                                         |

  `data-part`、`csspart` 与覆盖槽都没有 IDE 提示，改错了不会报错：请在自己的代码库里全文搜索上表左列的每一个名字。

  `api.announcement`（那句播报文本）没有变，`popselect` / `select` 等的 `footer` 没有变，`field` 的 `description` 与 `error-text` 没有变。

  ## 二、判定为不同的东西（无改动，区别写进解剖注释）

  - **`code-view` 的 `line` 与 `diff-view` 的 `row`。** 带 `role="row"` 与 `aria-rowindex`、住在 `role="table"` 里的那一类叫 `row`（diff-view / table / heatmap）；不带任何表格语义的纯文本行叫 `line`（code-view / log）。判据是 ARIA 结构，不是外观。
  - **`select` 的 `tag` 与 `tag` 组件。** scope 名（`data-scope`）标识的是组件，部件名（`data-part`）标识的是组件里的位置，两把尺子不交叉；`select` 的 `tag` 是它自己画的已选值小片，不是 `tag` 组件的落点。
  - **`approval` 的 `scope-group` / `scope-item` / `scope-indicator` / `scope-label`。** 这里的 scope 指授权范围，与标识组件身份的 `data-scope` 不是一回事；它取的是组件自己的领域词（props 就叫 `scopes` / `grantedScopes`），改名会把入参与部件的同名对应关系拆散。

  ## 默认渲染逐像素未变

  改名逐处同改了皮肤选择器与生成的样式表，没有一条规则的命中面发生变化；三处「判定为不同」的地方一个字符都没动。

- 5bd9ec2: **密码框的明暗态改名：`visible` / `defaultVisible` / `onVisibilityChange` → `revealed` / `defaultRevealed` / `onRevealedChange`。**

  `visible` 在库里是浮层与派生显隐那一轴的词（toast、滚动条、回到顶部），密码框这一位说的却是「明文有没有揭开」——不是开合、也不是显隐，与它们混用会让作者把它当成浮层的 open 去接。现在按这一位真正的含义取名：headless 的 props / context / api（`api.revealed` / `setRevealed` / `toggleRevealed`）与机器事件（`REVEALED.SET` / `REVEALED.TOGGLE`）、Vue 的 `v-model:revealed` 与 `@revealed-change`、React 的 `revealed` / `onRevealedChange`、自定义元素的 `revealed` / `default-revealed` attribute 与 `revealed-change` 事件；载荷类型 `PasswordInputRevealedChangeDetails { revealed }`。部件名 `visibility-trigger`、文案 `visibilityTriggerShow` / `visibilityTriggerHide` 与触发钮上的 `data-state="visible|hidden"`（词表里的派生显隐）不变。

- 680e9a2: 重构 Calendar 与 DatePicker 的周期选择契约。

  - `view` 更名为 `granularity`，支持 `day / week / month / quarter / year`。
  - 删除 `weekSelection`；周成为一级粒度，可独立搭配 single、multiple 或 range。
  - 日期格与粗粒度格统一为 `CalendarPeriod`，包含 `key / start / end / label / outside`。
  - `CalendarDay.value` 改为 `start`，`inMonth` 改为 `outside`；面板与根插槽新增统一的 `periods`。
  - 新增 `calendarPeriodValue`，把单选或区间锚点转换成 `{ granularity, start, end, keys }`。
  - 切换粒度会清空旧选择；切换选择模式会按新模式收口现值。
  - 周面板改为一列一个整周周期格；区间选择仍默认单栏，多面板只由 `visibleCount` 显式开启。
  - 周字段与周面板统一使用 ISO 周历，固定周一到周日，不再随 `locale` 改变周边界。
  - `showTime` 明确只在 `granularity=day + selectionMode=single` 下生效。

  迁移：把 `view="day" + weekSelection` 改为 `granularity="week"`；其他 `view` 用法直接改名为 `granularity`。渲染日期矩阵时使用 `day.start` 作为格子值，以 `day.outside` 判断相邻月份。

- b81590f: **分格输入改成按顺序录入：焦点落在第一个空格上。** 从前每一格都是随手可点、随手可聚焦的原生输入框，前两格还空着也能一头扎到第三格上打字，打完得到一串中间带洞的值；机器那边只把「作者点了第几格」原样记进 `focusedIndex`，没有任何「该落在哪一格」的裁定。现在作者点/聚焦第 i 格时，若存在 j < i 且第 j 格为空，焦点落到第 j 格——一次性验证码这类控件的通行做法。

  **裁定在机器里，连接层只负责搬。** 新增两个纯函数：`firstEmptyPinIndex(value)` 报第一个空格（填满得 -1），`pinFocusTarget(value, index)` 给出该落焦的那一格——还有空格时取 `min(index, 第一个空格)`，填满后原样返回，下标一并夹回格子范围。`INPUT.FOCUS` 记的从此是裁定后的落点。这个函数是幂等的（结果再裁一次仍是它自己），所以连接层照着搬一次就停，不会两格之间来回弹；用例里数过焦点事件的发数，一共两发。

  **还轮不到的格子退出 Tab 序列。** 只把焦点拨回来是不够的：那些格子若仍留在 Tab 序列里，Tab 一停上去就被拨回第一个空格，键盘与读屏用户按多少下都走不出这一组——反向验证里把这条摘掉，Tab 当场卡在 `input[0]` 上出不去。所以第一个空格之后的格子发 `tabindex="-1"`。可落焦的那一段（首格到第一个空格）与填满之后的每一格都不带 `tabindex`，原生 Tab 序列照旧。

  **四条边界的裁决：**

  - **粘贴整串仍从落点那一格起铺开**，这条没变，变的只是落点本身越不过第一个空格。真实交互下作者根本站不到「前面还空着」的格子上，所以从落点铺开与按顺序录入不冲突；铺完之后焦点同样按裁定走，铺出空洞时回到那个洞上。
  - **退格与删除**照旧：`Backspace` 清本格、焦点不动，本格为空则退回上一格并清掉它；`Delete` 清本格、焦点不动。被清空的那一格随即成为第一个空格，焦点就停在它上面——不抢焦点，也不会把用户推到别处。
  - **方向键仍能在已填区间里左右移动**，「改上一格」这条路没堵：左键照走，右键与 `End` 越不过第一个空格。填满之后左右键与 `Home` / `End` 恢复整段自由。
  - **全部填满之后点任意一格就落在那一格**，改哪一位都行；此时没有空格，裁定不介入。

  **`readOnly` 与 `disabled` 不设这道限。** 那两档值本来就改不动，把焦点往回拽只会挡住读与复制，所以点哪一格就落哪一格，`tabindex` 也一律不摘。

  **破坏性变更，会失配的地方：**

  - 断言「点第 i 格焦点就在第 i 格」的用例，值没填满时一律改判。库内三条既有判据按此更新：`data-focus` 那条改用填满的值起手，「一次塞进多个字符」与「粘贴从当前格起铺」两条先把前面的格子填上——它们原本的起手式（前面空着却站在后面）在新规矩下走不到。
  - 方向键判据：没填值的一组里，`ArrowRight` 与 `End` 不再走得到末格。共用套件里那两条改成从填满的值起手，另立一条专管「越不过第一个空格」。
  - 依赖「每一格都是 Tab 停靠点」的脚本会少走几站。
  - `End` 的语义从「移到末格」改成「移到最后一格可落焦的格子」，键盘表照此重写。

  `PinInputApi` 没有增删条目，`focusedIndex` 的含义从「焦点在哪一格」变成「焦点该落在哪一格」（值仍是同一个数，只是它现在经过裁定）。

- b991bb5: **Portal 按实例桥接逻辑来源的局部视觉环境，局部主题不再在搬到共享落点后丢失。**

  Core 新增 `createPortalVisualBridge`、`PortalVisualBridge` 与 `PortalVisualBridgeOptions`。桥只复制仓库当前真实存在的六个 DOM 环境轴：`data-theme`、`data-brand`、`data-density`、`data-contrast`、`data-motion` 与 `dir`。每一轴独立读取来源 composed 祖先链中最近的显式声明；来源未声明时，实例壳不写该属性，继续继承业务显式 portalContainer 的环境。

  桥不会复制计算后的 CSS 自定义属性，也不会凭规格文字虚构 `data-transparency`。当前 transparency 只有系统媒体查询，没有 DOM 控制轴；`shape` 是组件自身形态轴，不属于主题环境。后续只有在 VisualEnvironmentController 真正建立对应 DOM 合同时才会扩充名单。

  Vue 与 React 的每个 Portal 增加独占的 `display: contents` 壳；共享 `xh-portal-root` 不写任何主题属性，因此同页多个局部 dark/light、compact/comfortable 或 contrast 档不会互相覆盖。祖先属性改值、删除、来源换父、ShadowRoot 与 slot 重新分配均会异步同步；观察器取自来源 Document 的 Window，跨 Document 来源与壳直接失败。

  已有触发器或控件 ref 的锚定浮层直接以该节点作为 source，不生成来源 marker，避免改变 ButtonGroup 的 `:first-child` / `:last-child`、`root > *` 与 Toolbar 的直接子项。没有现成来源节点的模态/浮动组合使用无布局的 `template[data-xh-portal-source]`。React 的 `XhPortalProps` 新增可选 `source`；Vue 的桥组件保持内部实现，不新增公开组件家族。Web Components 声明式浮层仍在 Light DOM 原位，继续通过真实祖先链自然继承，不为了这一缺陷引入节点搬运。

  **破坏面：** Vue 与 React 的 portalContainer 直接子节点现在是 `div[data-xh-portal-shell]`，实际浮层位于壳内；React SSR 的原位输出也带 source/shell。按 `#xh-portal-root > [data-scope]` 或假定浮层部件直接父节点就是业务容器的样式和测试，应改为通过公开部件属性匹配后代；`data-xh-portal-shell` 仍是库内部标记。壳不产生布局盒，不改变定位包含块与层叠上下文。

- dc64383: **14 组 prop 改名、2 组事件改名。** 不留别名、不留旧名并存：下面左列的名字在无头层与两个适配器里都不再存在，写下它们等于没写。

  ## 一、几何值不再占用三轴的 `size`

  `size` 在三轴里是 `'sm' | 'md' | 'lg'`，`resizable` 与 `floating-panel` 的却是一对像素数——同一个名字两个类型域，写 `size="md"` 得到的是静默的错。两家一并改名 `dimensions`。

  | 组件             | 已删                                                        | 换成                                                                                |
  | ---------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
  | `resizable`      | `size` / `defaultSize` / `onSizeChange` / `onSizeChangeEnd` | `dimensions` / `defaultDimensions` / `onDimensionsChange` / `onDimensionsChangeEnd` |
  | `floating-panel` | `size` / `defaultSize` / `onSizeChange`                     | `dimensions` / `defaultDimensions` / `onDimensionsChange`                           |

  连带：载荷字段 `{ size }` → `{ dimensions }`；机器事件 `SIZE.SET` → `DIMENSIONS.SET`（floating-panel 另有 `SIZE.NUDGE` → `DIMENSIONS.NUDGE`）；api 的 `size` → `dimensions`、`setSize` → `setDimensions`；Vue 的 `v-model:size` → `v-model:dimensions`、事件 `size-change` → `dimensions-change`、`size-change-end` → `dimensions-change-end`；WC 属性 `size` → `dimensions`、`default-size` → `default-dimensions`。

  删掉的导出，逐个换名：

  | 已删                             | 换成                                                                         |
  | -------------------------------- | ---------------------------------------------------------------------------- |
  | `ResizableSize`                  | `ResizableDimensions`                                                        |
  | `ResizableSizeChangeDetails`     | `ResizableDimensionsChangeDetails`                                           |
  | `ResizableSizeChangeEndDetails`  | `ResizableDimensionsChangeEndDetails`                                        |
  | `FloatingPanelSizeChangeDetails` | `FloatingPanelDimensionsChangeDetails`                                       |
  | `RESIZABLE_DEFAULT_SIZE`         | `RESIZABLE_DEFAULT_DIMENSIONS`（值不变，仍是 `{ width: 240, height: 160 }`） |

  标量的不动：`floating-panel` 的 `minSize` / `maxSize` 与类型 `FloatingPanelSize` 保持原样。

  ## 二、`floating-panel` 的形态轴不再叫 `stage`

  `stage` 在库内另有「阶段」义（`data-state` 的 phase 族）。

  | 已删                                                                                             | 换成                                                                                                          |
  | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
  | prop `stage` / `defaultStage` / `onStageChange`                                                  | `windowState` / `defaultWindowState` / `onWindowStateChange`                                                  |
  | 类型 `FloatingPanelStage` / `FloatingPanelStageChangeDetails` / `FloatingPanelStageTriggerProps` | `FloatingPanelWindowState` / `FloatingPanelWindowStateChangeDetails` / `FloatingPanelWindowStateTriggerProps` |
  | 部件 `stage-trigger`                                                                             | `window-state-trigger`                                                                                        |
  | `data-stage` / `data-target-stage`                                                               | `data-window-state` / `data-target-window-state`                                                              |
  | Vue `<XhFloatingPanelStageTrigger>`                                                              | `<XhFloatingPanelWindowStateTrigger>`                                                                         |
  | WC 属性 `stage` / `default-stage`，形态钮上的 `stage="…"`                                        | `window-state` / `default-window-state`，钮上写 `window-state="…"`                                            |
  | 事件 `stage-change`（Vue emit 与 WC CustomEvent 同名）                                           | `window-state-change`                                                                                         |
  | api `stage` / `setStage` / `getStageTriggerProps`                                                | `windowState` / `setWindowState` / `getWindowStateTriggerProps`                                               |

  ## 三、当前步序并进 `value` 家族

  `step` 一名三义：增量（number-field / slider / time-picker）、键盘步进（已叫 `keyboardStep`）、当前步序。第三义并进受控三件套。

  | 组件             | 已删                                    | 换成                                       |
  | ---------------- | --------------------------------------- | ------------------------------------------ |
  | `steps` / `tour` | `step` / `defaultStep` / `onStepChange` | `value` / `defaultValue` / `onValueChange` |

  连带：载荷字段 `{ step }` → `{ value }`；事件 `step-change` → `value-change`；`v-model:step` → `v-model:value`；WC 属性 `step` → `value`、`default-step` → `default-value`；api `step` → `value`、`setStep` → `setValue`；类型 `StepsStepChangeDetails` / `TourStepChangeDetails` → `StepsValueChangeDetails` / `TourValueChangeDetails`。

  `data-step`、`goToNextStep` / `goToPrevStep`、`TourCompleteDetails.step` / `TourSkipDetails.step` 不动——它们说的是「第几步」，不是那个受控值。

  ## 四、展开态收成两种形态

  集合型的展开一律 `expandedValue` 三件套，布尔型的展开一律 `open` 三件套。

  | 组件                                                                        | 已删                                                | 换成                                                  |
  | --------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
  | `diff-view` / `table`                                                       | `expanded` / `defaultExpanded`                      | `expandedValue` / `defaultExpandedValue`              |
  | `json-viewer`                                                               | `flattenJson` 选项 `expanded`                       | `expandedValue`                                       |
  | `diff-view` / `json-viewer` / `side-nav` / `table` / `tree` / `tree-select` | `onExpandedChange`、事件 `expanded-change`          | `onExpandedValueChange`、事件 `expanded-value-change` |
  | `truncate`                                                                  | `expanded` / `defaultExpanded` / `onExpandedChange` | `open` / `defaultOpen` / `onOpenChange`               |

  `truncate` 的 connect 本来发的就是 `aria-expanded` 加 `data-state='open' | 'closed'`，与 `collapsible` 逐字同构，prop 名却与状态编码分叉。连带：事件 `expanded-change` → `open-change`；`v-model:expanded` → `v-model:open`；WC 属性 `expanded` → `open`、`default-expanded` → `default-open`；api `expanded` / `setExpanded` → `open` / `setOpen`；机器状态 `collapsed` / `expanded` → `closed` / `open`；类型 `TruncateExpandedChangeDetails` → `TruncateOpenChangeDetails`。

  `diff-view` 的载荷字段 `{ expanded }` 改成与另外五家一致的 `{ value }`；`diff-view` 的 api `expanded` / `setExpanded` 改成 `expandedValue` / `setExpandedValue`。六个载荷类型一并改名：

  | 已删                              | 换成                                   |
  | --------------------------------- | -------------------------------------- |
  | `DiffViewExpandedChangeDetails`   | `DiffViewExpandedValueChangeDetails`   |
  | `JsonViewerExpandedChangeDetails` | `JsonViewerExpandedValueChangeDetails` |
  | `SideNavExpandedChangeDetails`    | `SideNavExpandedValueChangeDetails`    |
  | `TableExpandedChangeDetails`      | `TableExpandedValueChangeDetails`      |
  | `TreeExpandedChangeDetails`       | `TreeExpandedValueChangeDetails`       |
  | `TreeSelectExpandedChangeDetails` | `TreeSelectExpandedValueChangeDetails` |

  ## 五、只读数据源一律 `collection`

  | 组件           | 已删      | 换成         |
  | -------------- | --------- | ------------ |
  | `image-viewer` | `items`   | `collection` |
  | `anchor`       | `targets` | `collection` |

  ## 六、其余五条

  | 组件                        | 已删                                                            | 换成                                                     | 为什么                                                                                                                      |
  | --------------------------- | --------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
  | `approval` / `prompt-input` | `busy`                                                          | `loading`                                                | 同一件事全库两个名字，`loading` 是多数派，且它配的就是 `data-loading` 与 `aria-busy`                                        |
  | `skeleton`                  | `variant`（`text` / `circle` / `rect`）、类型 `SkeletonVariant` | `shape`、`SkeletonShape`                                 | 三个取值是形状不是形态，与三轴的 `variant` 撞名。骨架条自报形状的属性也从 `variant` 改成 `shape`                            |
  | `grid`                      | `justify`、`data-justify`、类型 `GridJustify`                   | `justifyItems`、`data-justify-items`、`GridJustifyItems` | `grid` 落的是 `justify-items`、`flex` 落的是 `justify-content`，同名不同 CSS 属性。`align` 两边落的都是 `align-items`，不动 |
  | `card`                      | `segmented`                                                     | `split`                                                  | 与 `segmented` 组件撞名；它自己发的状态属性早就叫 `data-split`                                                              |
  | `mention`                   | prop `prefix`、WC 属性 `prefix`                                 | `triggerPrefix`、`trigger-prefix`                        | 与 `prefix` 部件撞名。WC 的 JS 字段本来就叫 `triggerPrefix`，这次属性名跟上                                                 |

  ## 七、两组事件名归一

  | 已删                                 | 换成                                       | 在哪                                                                                       |
  | ------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
  | `onVisibleChange` / `visible-change` | `onVisibilityChange` / `visibility-change` | `back-top`；类型 `BackTopVisibleChangeDetails` → `BackTopVisibilityChangeDetails`          |
  | `onFinish` / `finish`                | `onComplete` / `complete`                  | `number-animation`；类型 `NumberAnimationFinishDetails` → `NumberAnimationCompleteDetails` |

  `onValueChangeEnd`（连续拖动结束）、`onValueComplete`（各段填满）、`onValueCommit`（就地编辑提交）三者答的是三个不同的问题，保持三名分立，已写进规范的事件名词汇表。

- 80e6fdf: **`qr-code` 改名 `matrix-code`，新增 `format` 选码制：二维码不再只有 QR 一种身份。**

  QR Code 之外还有 Data Matrix、PDF417、Aztec 这些同样常用的二维码制，它们与 QR 共用一张码面、一套命名、一块 logo 位与同一份皮肤，只是编码器不同。把组件名钉在 `qr-code` 上就没有地方放它们，于是整个公开面改名：Headless 的 `connectQrCode` / `qrCodeAnatomy` / `qrCodeKeyboard` / `qrCodeMeta` 与 `QrCode*` 类型改为 `connectMatrixCode` / `matrixCodeAnatomy` / `matrixCodeKeyboard` / `matrixCodeMeta` 与 `MatrixCode*`（`QrModuleShape` / `QrEyeShape` 改为 `MatrixCodeModuleShape` / `MatrixCodeEyeShape`）；Vue 与 React 的 `XhQrCode` / `XhQrCodeLogo` 改为 `XhMatrixCode` / `XhMatrixCodeLogo`，上下文与 provide / use 同步；自定义元素 `<xh-qr-code>` 改为 `<xh-matrix-code>`；皮肤子路径 `qr-code.css` 改为 `matrix-code.css`，覆盖槽 `--xh-qr-code-*` 改为 `--xh-matrix-code-*`；`data-scope` 改为 `matrix-code`；诊断码 `qr-code.logo-damage` 改为 `matrix-code.logo-damage`（`DIAGNOSTIC_CODES.qrCodeLogoDamage` → `matrixCodeLogoDamage`）。QR 编码器本身的导出（`qrEncode` / `qrCapacityBytes` / `qrAlignmentPositions` / `QR_MAX_VERSION` / `QrLevel` / `QrMatrix`）不改名，它们描述的就是 QR。

  新增 `format` prop（三端同名，自定义元素 attribute `format`），缺省 `qr`，根上落 `data-format`。给了不认识的值不静默退回 QR：一个模块都不铺，根落到 `error` 态并在 `error` 里说明只认哪些码制——按错码制画出来的码扫得出内容但对不上，作者却看不出哪里错了。当前只有 `qr` 一种取值，其余码制随后各自补上。

- 9c43f67: 重构 Calendar 与 DatePicker 的区间选择模型：起点只记在组件里，两端都落定才写值。

  - **破坏**：区间模式下点第一下不再把 `[起点]` 写进 `value`，`onValueChange` 只在两端齐全时通知（长度恒为 2）；`Escape` 撤掉起点后原来的区间原样还在。原来靠长度为 1 的中间态渲染「起点 → 待定」的用法，改读 `api.rangeAnchor`。
  - 区间支持按住拖选：按下即落起点、拖到另一格松开即收尾；按住已选区间的一端拖动可直接改写那一端，原地松开则从那一端重新开始；触屏按住片刻才开始拖，轻点仍是普通点选。指针在日历（日期选择器则是浮层与输入行）之外松开时，区间就地收在起点到最后悬停的那一格；`Tab` 离开网格同样收口。
  - 确认键落起点后焦点自动前进一格（挑不了就退一格），方向键走到哪儿预览就铺到哪儿。
  - 新增 `allowsNonContiguousRanges`：默认关，落了起点之后可挑范围被夹在两侧最近的不可用日之间；开着时允许跨过，只是那些日子不铺轨道。`isDateUnavailable` 多了第二个参数——当前起点，可据此限制区间长度。
  - 新增 `invalid`（Calendar）：根带 `data-invalid`，已选区间里的格子报 `aria-invalid`；已选区间某一端越界或不可用时也会自己判。DatePicker 的 `invalid` 现在还会在区间终点早于起点时自己置真，`api.invalid` 与根节点同一口径。
  - 区间里两端之间的每一格都报 `aria-selected="true"` 并带 `data-selected`；新增 `CalendarTranslations`（挑区间的两句提示、区间两端的名字、今天），DatePicker 的 `translations` 原样转交。
  - 皮肤：挑到一半的预览与已落定的区间同一副长相（去掉更淡的预览轨道与淡面端点）；实心面按下再压深一档；轨道在行首行尾的圆角与控件同档；日期格一律中等字重；命中区铺满整格；拖动中网格保持手型。区间输入行里起点那组只占自己的宽度，分隔符紧跟在起点后面。

  覆盖槽变动：新增 `--xh-calendar-cell-bg-selected-active`、`--xh-calendar-cell-font-weight`、`--xh-date-picker-range-separator-mx`；删除 `--xh-calendar-range-preview-bg`、`--xh-calendar-range-preview-cap-bg`、`--xh-calendar-range-preview-cap-fg`。

- cd74476: **`thread`、`composer`、`code-block` 三个组件已整体删除。** 不留别名、不留转发、不留提示：下面列出的名字在无头层、两个适配器与皮肤里都不再存在，写下它们会得到「组件不存在」而不是降级渲染。三者各有覆盖它的后继，逐个说清怎么换。

  ## 一、`code-block` → `code-view`

  能力上是严格超集：`code` / `lang` / `complete` / `highlighter` / `highlightWhileStreaming` / `wrap` 六个入口的语义一字未变，`root` / `pre` / `code` / `lang-label` / `token` 五个部件仍在，另外多出行号、指定行高亮、超长折叠与文件名。

  **结构上不是改名。** `code-block` 在 Vue 侧是一个包办到底的 `<XhCodeBlock>`，`code-view` 是拆开的部件族，最小写法要三个：

  ```vue
  <XhCodeViewRoot :code="src" lang="ts" complete>
  <XhCodeViewPre>
    <XhCodeViewCode />
  </XhCodeViewPre>;
  </XhCodeViewRoot>
  ```

  | 已删                                                                            | 换成                                                                                                                                                                          |
  | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Vue `<XhCodeBlock>`                                                             | `<XhCodeViewRoot>` + `<XhCodeViewPre>` + `<XhCodeViewCode>`（文件名与语言标注另有 `<XhCodeViewHeader>` / `<XhCodeViewFilename>` / `<XhCodeViewLangLabel>`）                   |
  | 自定义元素 `<xh-code-block>`                                                    | `<xh-code-view>`                                                                                                                                                              |
  | `connectCodeBlock` / `codeBlockAnatomy` / `codeBlockKeyboard` / `codeBlockMeta` | `connectCodeView` / `codeViewAnatomy` / `codeViewKeyboard` / `codeViewMeta`                                                                                                   |
  | 类型 `CodeBlockApi` / `CodeBlockProps` / `CodeBlockTranslations`                | `CodeViewApi` / `CodeViewProps` / `CodeViewTranslations`                                                                                                                      |
  | `CODE_BLOCK_FALLBACK_LANG`                                                      | `CODE_VIEW_FALLBACK_LANG`                                                                                                                                                     |
  | `countCodeLines`                                                                | `countCodeViewLines`                                                                                                                                                          |
  | 类型 `XhCodeBlockElement`                                                       | `XhCodeViewElement`                                                                                                                                                           |
  | 部件 `data-part="root"` / `"lang-label"` / `"pre"` / `"code"` / `"token"`       | 五个都在，名字不变                                                                                                                                                            |
  | 记号在 DOM 里的位置：`data-part="token"` 直接挂在 `data-part="code"` 下         | 中间多了两层——`code` 下是逐行的 `data-part="line"`，行里是 `data-part="line-content"`，记号挂在它下面。写死层级的后代选择器（`[data-part='code'] > [data-part='token']`）要改 |
  | root 上的 `data-lang` / `data-complete` / `data-wrap`、token 上的 `data-kind`   | 同名同值                                                                                                                                                                      |
  | 子入口 `@xihan-ui/styles/code-block.css`                                        | `@xihan-ui/styles/code-view.css`                                                                                                                                              |
  | 覆盖槽 `--xh-code-block-*`（10 个）                                             | 同名的 `--xh-code-view-*`                                                                                                                                                     |
  | 文案覆盖表的 `'code-block'` 键                                                  | `'code-view'`                                                                                                                                                                 |

  ## 二、`composer` → `prompt-input`

  部件同构（`root` / `input` / `submit-trigger`），`prompt-input` 另有可选的 `input-row` 与形态、语气、尺寸三轴。两处入口语义要改写：

  **运行态从两档字符串变成一个布尔。** `composer` 收 `runStatus: 'ready' | 'streaming'`，`prompt-input` 收 `loading: boolean`：`'streaming'` 对应 `loading` 为真，`'ready'` 对应不写 `loading`。组件真正需要的只有这个二值判断——按钮换不换成停止身份、提交路径挡不挡。类型 `ComposerRunStatus` 没有后继。

  连带一处选择器要改：`composer` 把运行态铺成 root 上的 `data-state`（取值就是 `ready` / `streaming`），`prompt-input` 的 root 上**没有 `data-state`**，生成中改由布尔属性 `data-loading` 表达。`[data-scope='composer'][data-part='root'][data-state='streaming']` 换成 `[data-scope='prompt-input'][data-part='root'][data-loading]`。输入框那一层的 `data-state`（`empty` / `editing` / `disabled`）两边同名同值，不动。

  **回车从布尔变成按键档。** `submitOnEnter` 只能表达「回车提交还是换行」，`submitKey` 表达「哪一组按键才算提交」，本次给它补上 `'none'` 一档后两者可以精确对应。

  | 已删                                                                                                                                      | 换成                                                                                                                  |
  | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
  | Vue `<XhComposerRoot>` / `<XhComposerInput>` / `<XhComposerSubmitTrigger>`                                                                | `<XhPromptInputRoot>` / `<XhPromptInputInput>` / `<XhPromptInputSubmitTrigger>`                                       |
  | 自定义元素 `<xh-composer>`                                                                                                                | `<xh-prompt-input>`                                                                                                   |
  | `useComposer()`                                                                                                                           | `usePromptInput()` / `usePromptInputContext()`                                                                        |
  | `connectComposer` / `composerAnatomy` / `composerKeyboard` / `composerMachine` / `composerMeta`                                           | `connectPromptInput` / `promptInputAnatomy` / `promptInputKeyboard` / `promptInputMachine` / `promptInputMeta`        |
  | 类型 `ComposerApi` / `ComposerSchema` / `ComposerState` / `ComposerTranslations` / `ComposerSubmitDetails` / `ComposerValueChangeDetails` | 同名的 `PromptInput*`                                                                                                 |
  | 类型 `ComposerContext` / `ComposerCallbacks` / `ComposerRootSlotProps` / `XhComposerElement`                                              | `PromptInputContext` / `PromptInputCallbacks` / `PromptInputRootSlotProps` / `XhPromptInputElement`                   |
  | 类型 `ComposerRunStatus`                                                                                                                  | 无——改用布尔 `loading`                                                                                                |
  | prop `runStatus="streaming"`                                                                                                              | `loading`（真）                                                                                                       |
  | prop `runStatus="ready"`                                                                                                                  | 不写 `loading`（假）                                                                                                  |
  | prop `submitOnEnter`（默认真）                                                                                                            | `submitKey="enter"`（默认，不写即是）                                                                                 |
  | prop `:submit-on-enter="false"`                                                                                                           | `submitKey="none"`                                                                                                    |
  | 部件 `data-part="root"` / `"input"` / `"submit-trigger"`                                                                                  | 同名，另有可选的 `data-part="input-row"`                                                                              |
  | root 上的 `data-state="ready"` / `"streaming"`                                                                                            | root 上的 `data-loading`（布尔属性，只在生成中出现）                                                                  |
  | input 上的 `data-state`、submit-trigger 上的 `data-mode="send"` / `"stop"`、root 上的 `data-disabled`                                     | 同名同值                                                                                                              |
  | `translations.input`（必填）                                                                                                              | 同名但可选；**不给就整条 `aria-label` 不输出**，免得盖掉作者的 `<label for>`                                          |
  | 子入口 `@xihan-ui/styles/composer.css`                                                                                                    | `@xihan-ui/styles/prompt-input.css`                                                                                   |
  | 覆盖槽 `--xh-composer-*`（27 个）                                                                                                         | `--xh-prompt-input-*`；发送与停止两态的 `--xh-composer-send-*` / `--xh-composer-stop-*` 改由提交钮的 `data-mode` 分档 |
  | 文案覆盖表的 `'composer'` 键                                                                                                              | `'prompt-input'`                                                                                                      |

  `prompt-input` 另有 `composer` 没有的入口：`allowEmptySubmit`（有附件时允许空值提交）、`clearOnSubmit`（提交后清不清空）与 `variant` / `tone` / `size` 三轴，都是新增，不影响照上表改完的代码。

  ## 三、`thread` → `message-feed` 或 `log`

  `thread` 一件同时管两种场景，后继按场景分成两件：**结构化会话**用 `message-feed`（条目集合语义、条目键盘遍历、统一播报区），**任意内容粘底**用 `log`。`log` 本次补上了 `scroll-button` 与 `live-region`，两条路都不缺件。

  粘底那套入口（`threshold` / `onStickChange` / `translations`）两边同名同义。`thread` 的 `status`（`idle` / `submitted` / `streaming` / `error`）只有 `message-feed` 有；`log` 那侧对应的是布尔 `loading`。

  | 已删                                                                                                                                                            | 换成（结构化会话）                                                                                                                                                                                           | 换成（任意内容粘底）                                                                                                             |
  | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
  | Vue `<XhThreadRoot>` / `<XhThreadViewport>` / `<XhThreadContent>` / `<XhThreadScrollButton>` / `<XhThreadLiveRegion>`                                           | `<XhMessageFeedRoot>` / `<XhMessageFeedViewport>` / `<XhMessageFeedList>` / `<XhMessageFeedScrollToEndTrigger>` / `<XhMessageFeedLiveRegion>`（条目另有 `<XhMessageFeedItem>` / `<XhMessageFeedItemLabel>`） | `<XhLogRoot>` / `<XhLogViewport>` / `<XhLogContent>` / `<XhLogScrollToEndTrigger>` / `<XhLogLiveRegion>`（行另有 `<XhLogLine>`） |
  | 自定义元素 `<xh-thread>`                                                                                                                                        | `<xh-message-feed>`                                                                                                                                                                                          | `<xh-log>`                                                                                                                       |
  | `useThread()` / `useThreadContext()` / `provideThread()`                                                                                                        | `useMessageFeed()` / `useMessageFeedContext()` / `provideMessageFeed()`                                                                                                                                      | `useLog()` / `useLogContext()`                                                                                                   |
  | `connectThread` / `threadAnatomy` / `threadKeyboard` / `threadMachine` / `threadMeta`                                                                           | 同名的 `messageFeed*`                                                                                                                                                                                        | 同名的 `log*`                                                                                                                    |
  | 类型 `ThreadApi` / `ThreadSchema` / `ThreadRefs` / `ThreadStatus` / `ThreadStickChangeDetails` / `ThreadTranslations` / `ThreadContext` / `ThreadRootSlotProps` | 同名的 `MessageFeed*`                                                                                                                                                                                        | `LogApi` / `LogSchema` / `LogTranslations` / `LogContext` / `LogRootSlotProps`                                                   |
  | 类型 `XhThreadElement`                                                                                                                                          | `XhMessageFeedElement`                                                                                                                                                                                       | 无导出的元素类，标签 `<xh-log>` 照常注册                                                                                         |
  | prop `status`                                                                                                                                                   | `status`（同名同值）                                                                                                                                                                                         | `loading`（布尔）                                                                                                                |
  | 部件 `data-part="content"`                                                                                                                                      | `data-part="list"`，且条目必须是它的**直接子节点**（`data-part="item"`，带 `item-id` / `item-index` / 可选 `item-role`）                                                                                     | `data-part="content"`（同名），行是 `data-part="line"`                                                                           |
  | 部件 `data-part="root"` / `"viewport"` / `"scroll-button"` / `"live-region"`                                                                                    | 同名                                                                                                                                                                                                         | 同名                                                                                                                             |
  | viewport 上的 `role="log"` + `tabindex="0"` + `aria-live="off"` + `data-state`                                                                                  | 都不在 viewport 上了：Tab 停靠位与键盘宿主挪到 root，集合语义改由 list 上的 `role="feed"` 承担，viewport 只剩几何                                                                                            | 仍在 viewport 上（`role="log"`、`tabindex="0"`、`aria-live="off"`），但 viewport 上没有 `data-state`                             |
  | root 上的 `data-state="<status>"`                                                                                                                               | 同名同值                                                                                                                                                                                                     | 没有；改看 root 上的 `data-loading` / `data-at-bottom` / `data-sticking`                                                         |
  | scroll-button 上的 `data-state="visible"` / `"hidden"`                                                                                                          | 同名同值                                                                                                                                                                                                     | 同名同值                                                                                                                         |
  | 子入口 `@xihan-ui/styles/thread.css`                                                                                                                            | `@xihan-ui/styles/message-feed.css`                                                                                                                                                                          | `@xihan-ui/styles/log.css`                                                                                                       |
  | 覆盖槽 `--xh-thread-*`（16 个）                                                                                                                                 | `--xh-message-feed-*`                                                                                                                                                                                        | `--xh-log-*`                                                                                                                     |
  | 文案覆盖表的 `'thread'` 键                                                                                                                                      | `'message-feed'`                                                                                                                                                                                             | `'log'`                                                                                                                          |

  `@xihan-ui/chat-stream` 的 `createThreadStore` / `ThreadStore` / `ThreadStatus` / `ThreadSnapshot` / `ThreadStoreOptions` 是那个包自己的数据仓，与本组件同名但无关，一个字没动。

  ## CSS 选择器要自己搜一遍

  `[data-scope='thread']`、`[data-scope='composer']`、`[data-scope='code-block']` 三个作用域不再有任何节点带上。选择器失配既不报错也不降级，请在自己的代码库里全文搜索这三个串，连同上面三张表里的 `--xh-` 覆盖槽名一起换掉。

  ## 文档站的示例去了哪

  三个组件的示例目录整个删掉。迁过去的那些改成了后继组件的写法，Vue 与自定义元素两版都在；没迁的逐条写明理由。

  | 已删的示例                                 | 去向                                                                                                                                                                                                                                                                                                                                                                                   |
  | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `thread/01-basic`                          | `message-feed/01-basic` 已覆盖三层骨架                                                                                                                                                                                                                                                                                                                                                 |
  | `thread/02-stick`                          | `message-feed/02-sticky` 已覆盖粘底与回到底部                                                                                                                                                                                                                                                                                                                                          |
  | `thread/03-status`                         | 迁成 `message-feed/04-status`                                                                                                                                                                                                                                                                                                                                                          |
  | `thread/04-load-more`                      | 迁成 `message-feed/05-load-more`                                                                                                                                                                                                                                                                                                                                                       |
  | `thread/05-scroll-control`                 | `log/03-follow` 已覆盖「不用内置那颗按钮，自己拿 `atBottom` 与 `scrollToBottom` 画一条回到最新」                                                                                                                                                                                                                                                                                       |
  | `thread/06-chat`                           | `prompt-input/02-chat` 已覆盖消息流配输入框的整页                                                                                                                                                                                                                                                                                                                                      |
  | `thread/07-load-earlier`                   | 迁成 `message-feed/06-load-earlier`                                                                                                                                                                                                                                                                                                                                                    |
  | `thread/08-scroll-to`                      | 迁成 `message-feed/07-scroll-to`。跳转不再靠自己算 `offsetTop`：`scrollToItem(id)` 与 `focusItem(id)` 收的就是写在条目上的那个 `item-id`。自定义元素那侧只暴露 `scrollToBottom()`，别的位置仍按 `item-id` 取节点自己滚                                                                                                                                                                 |
  | `composer/01-basic`                        | `prompt-input/01-basic`                                                                                                                                                                                                                                                                                                                                                                |
  | `composer/02-streaming`                    | `prompt-input/02-chat` 与 `prompt-input/03-layout` 已覆盖 `loading` 与原位停止                                                                                                                                                                                                                                                                                                         |
  | `composer/03-enter`                        | 迁成 `prompt-input/04-submit-key`，三档按键各摆一台                                                                                                                                                                                                                                                                                                                                    |
  | `composer/04-disabled`                     | 迁成 `prompt-input/05-disabled`，另加 `allowEmptySubmit` 一档                                                                                                                                                                                                                                                                                                                          |
  | `composer/05-clear` 与 `composer/06-count` | 并成 `prompt-input/06-extras`：附加按钮、`setValue` 清空、`maxlength` 与字数在同一台上                                                                                                                                                                                                                                                                                                 |
  | `composer/07-autosize`                     | 迁成 `prompt-input/07-autosize`                                                                                                                                                                                                                                                                                                                                                        |
  | `composer/08-filter`                       | 不另开一份：改写值走的是同一条路（root 插槽的 `setValue`），`prompt-input/06-extras` 里就是这么写的                                                                                                                                                                                                                                                                                    |
  | `composer/09-focus`                        | 迁成 `prompt-input/08-focus`                                                                                                                                                                                                                                                                                                                                                           |
  | `composer/10-status`                       | 迁成 `prompt-input/09-invalid`，覆盖的变量由 `--xh-composer-border` 换成 `--xh-prompt-input-border`                                                                                                                                                                                                                                                                                    |
  | `code-block/01-basic`                      | `code-view/01-basic`                                                                                                                                                                                                                                                                                                                                                                   |
  | `code-block/02-streaming`                  | 「未闭合默认不着色」那半边由 `code-view/04-streaming` 覆盖；`highlightWhileStreaming` 那半边迁成 `code-view/07-streaming-highlight`                                                                                                                                                                                                                                                    |
  | `code-block/03-highlighter`                | 迁成 `code-view/06-highlighter`                                                                                                                                                                                                                                                                                                                                                        |
  | `code-block/04-line-numbers`               | 不迁：那份示例是在 `code-block` 旁边手搭一栏行号，再用 `--xh-code-block-line-height` / `--xh-code-block-p` / `--xh-code-block-label-py` / `--xh-code-block-label-font-size` 把两栏对齐。`code-view` 自带 `lineNumbers`（配 `startLine`、`highlightLines`），行号由皮肤用 `attr()` 画，复制代码不会带上它，读屏也不念——见 `code-view/02-line-numbers`。那四个用于对齐的槽随皮肤一起没了 |

  指向这三件的文档链接同步改了：AI 对话内核那页的组件清单换成消息流 / 日志 / 提示输入框 / 代码视图四件，流式 Markdown 与代码着色两页指向代码视图，首页的组件清单同改。`message-feed` 与 `log` 互相点明了分界：分得出「第几条、谁说的」用前者，一整段往下追加用后者。

- 3ef5a6e: **`select` 标签里的删除钮退役成 `tag` 的 `close-trigger`：`item-delete-trigger` 不再是本组件的部件，渲出来的节点是 `tag` 的关闭钮（`data-scope="tag" data-part="close-trigger"`），样子归 `tag.css`。**

  上一笔把 `select` 的标签与 `+N` 套成了 `tag` 的 `root`，删除钮却还是 `select` 自己画的一颗——`tag` 本来就有关闭钮，第二份就是另起一套。现在：

  - **连接层**：触发器外的每一枚标签在 `connectSelect` 里各是一份 `connectStaticTag`（受控 `open: true`、`closable: true`、`disabled` 与 `readOnly` 随控件、`translations.close` 取 `translations.deleteItem(标签文字)`；形态由 `tag` 导出的 `tagVariantForControl` 按控件的面派）。删除钮就是这份实例的 `getCloseTriggerProps()`：按它时 `tag` 只发 `onOpenChange({ open: false })`，`select` 在那里送 `VALUE.SET` 把这个值摘掉。`api.getTagProps({ value })` 与 `api.getItemDeleteTriggerProps({ value })` 共用同一份实例，`root` 的产出不看 `closable`，触发器里的标签照旧不渲钮。
  - **禁用 / 只读矩阵由 `tag` 给**：禁用时钮留在原地、原生 `disabled` 并带 `data-disabled`，标签本体置灰；只读时钮同样留位、原生 `disabled`，标签本身不置灰——与 `tag-group` / `tags-input` 里的标签同一条规矩。
  - **可及名**：仍走 `select` 的 `translations.deleteItem`（缺省 `Delete <标签文字>`），只是现在经 `tag` 的 `translations.close` 落到那颗钮上。
  - **三家适配器**：Vue / React 的 `XhSelectItemDeleteTrigger` 名字与用法不变，渲出来的 `<button>` 换成 `tag` 的 `close-trigger`；Web Components 侧作者写法不变（`data-xh-part="item-delete-trigger"`，仍放在 `data-xh-part="tag"` 里），这个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
  - **皮肤**：`select.css` 里 `item-delete-trigger` 的全部规则（尺寸、圆角、悬停、按压、聚焦环、禁用色、兜底字形）整段删掉；那颗钮吃 `tag.css` 的 `close-trigger` 规则——命中区 `--xh-tag-close-size`（缺省不分档的 `--xh-control-indicator-size`）、圆角 `--xh-tag-close-radius`（缺省 `--xh-shape-inset`）、悬停与按压底色从当前前景色兑、`solid` 标签里环取 `currentColor`。

  **破坏面：**

  - `select` 的解剖少一个部件（21 → 20）：`item-delete-trigger` 删除。按 `[data-scope='select'][data-part='item-delete-trigger']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='close-trigger']`（要限定在 `select` 里就前缀 `[data-scope='select'][data-part='root']`）。
  - `select.css` 的六个覆盖槽随之删除：`--xh-select-item-delete-size` / `-radius` / `-fg` / `-fg-hover` / `-bg-hover` / `-bg-active`，改用 `tag` 的 `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`。
  - 禁用时那颗钮从「只标 `data-disabled`、仍可聚焦」变成原生 `disabled`（不可聚焦、不占 Tab 位），与 `tag` 的关闭钮同一条规矩；只读时那颗钮从「可按但不动值」变成原生 `disabled`。
  - 悬停 / 按压底色从 `--xh-bg-subtle-hover` / `-active` 换成由当前前景色兑出的 `color-mix`，与 `tag` 的关闭钮同一副长相；缺省字色从 `--xh-fg-subtle` 换成标签自己的文字色（`currentColor`）。
  - 聚焦环不再由 `select.css` 画，走 `focus.css` 的通用环加 `tag.css` 的 `solid` 上下文规则。

- e3abd75: **`select` 多选标签行封顶：不给 `maxTagCount` 时最多摆 3 枚，其余合成一枚 `+N`；标签行成为部件，`+N` 是一枚 `tag`，三家适配器都渲出来。**

  从前 `maxTagCount` 缺省是「全摆」：选中几项，`api.tags` 就给几枚，`overflowCount` 恒 0；`+N` 没有部件，作者自己拿一个 span 画。触发器是一行控件（盒高钉在 `--xh-control-h-*`，这一点没变），标签排不下就往盒外冲——实测 320px 栏里选 10 项，最后一枚标签的右缘越过盒的右缘 195px，选 30 项越过 1315px，展开箭头一并被推出盒外；600px 栏里选 30 项也越过 1035px。

  现在：

  - **`maxTagCount` 缺省 3**，导出常量 `SELECT_DEFAULT_MAX_TAG_COUNT`。选中 4 项起 `api.tags` 只给前 3 枚，其余进 `overflowCount`。要回到从前的「全摆」，显式传 `maxTagCount: Infinity`。
  - **新增部件 `tag-list`**（`api.getTagListProps()`）：触发器里收着可见标签与 `+N` 的那一行。无选中时带 `hidden`。
  - **`+N` 那一枚**（`api.getOverflowTagProps()`）：折起的标签合成的一枚 `tag`（`data-scope="tag"`，带 `data-count`）；没有折起的标签时是 `tag` 的收起态（`data-state="closed"` + `hidden`），不留空位。文字由 `api.overflowText` 给，走新增的 `translations.overflowTag(count)`，默认 `+N`。与触发器里的标签一样套的是 `tag` 组件，见同批「选择器的标签套 `tag`」那份变更集。
  - **三家适配器**：Vue 新增 `XhSelectTagList` / `XhSelectOverflowTag`，React 同名两件；`+N` 那一枚不写内容即显示 `overflowText`。Web Components 侧作者写 `<span data-xh-part="tag-list">` 与 `<span data-xh-part="overflow-tag">`（后者由元素接成 `tag` 的 root），`+N` 由元素填字（留空归元素、写了内容归作者，与 `value-text` 同一条规矩）。根插槽 / 函数式 children 的载荷多一项 `overflowText`。
  - **皮肤**：`tag-list` 是触发器里可压缩、裁溢出的一行（`flex: 0 1 auto; min-inline-size: 0; overflow: hidden`），行里的标签装不下时各自缩短带省略号，`+N` 不缩；标签与 `+N` 的样子归 `tag.css`，按 `[data-scope="tag"][data-part="root"][data-count]` 覆盖 `--xh-tag-bg` / `--xh-tag-fg` 即可把 `+N` 与选中值区分；新增覆盖槽 `--xh-select-tag-list-gap`。标签行露面时 `value-text` 让位（`display: none`），无选中时反过来——两者同时写在触发器里即可，不必再按 `tags.length` 二选一；`value-text` 留在 DOM 里，触发器的可及名仍从它取到完整的选中项文本。

  同一组量测改后：320px 栏里选 10 项、30 项，标签行、每枚标签与 `+N` 的右缘都不越过盒的右缘，展开箭头留在盒里；192px 的最小盒里三枚长标签都带省略号，`+N` 完整可见；盒高在 0 / 3 / 10 / 30 枚下都是一行控件高。

  **破坏面：**

  - 缺省下选中超过 3 项的多选，`api.tags` 少了、`overflowCount` 不再恒 0。断言过「全摆」的用例要改，或显式传 `maxTagCount: Infinity`。
  - `SelectTranslations` 多一个必填键 `overflowTag`；自己整份实现该接口的要补上。
  - `SelectApi` 多 `overflowText` / `getTagListProps` / `getOverflowTagProps` 三个成员；自己按 `SelectApi` 造对象的要补上。
  - 解剖多一个部件：`tag-list`（`+N` 与标签是 `tag` 的 root，不算 select 的部件）。按部件数断言过的用例要改。
  - 皮肤新增了 `trigger:has(tag-list:not([hidden])) value-text { display: none }` 这条让位规则：从前把标签直接摆在触发器里、又同时渲着 `value-text` 的写法不受影响（没有 `tag-list` 就不让位）；换成 `tag-list` 之后 `value-text` 会在有选中时收起。

- 1f6da9d: **`select` 触发器里的标签与 `+N` 改成套库里的 `tag`：每一枚都是 `tag` 的 `root`（`data-scope="tag"`），样子归 `tag.css`，`select.css` 不再自己画标签。**

  此前 `select` 的多选标签与 `+N` 那一枚是本组件自己的两个部件（`tag` / `overflow-tag`），`select.css` 另画了一副药丸：三档都是 18px 高、12px 字、不随 `size` 变，与库里 `tag` 组件（sm 22 / md 26 / lg 30，字 12 / 13 / 14）是两套长相；`+N` 还另配了一副压一档的配色。现在：

  - **连接层套 `tag` 的连接层**：`connectSelect` 调 `connectStaticTag`（不建机器的那条路）产出标签的 props——触发器里的标签与 `+N` 没有任何能改状态的事件，显隐由 `select` 的选中值决定，一枚一台机器纯属开销。`tone` / `size` 与 `disabled` 从 `select` 传下去，`closable` 恒为假（触发器是按钮，按钮不能套按钮）。标签的 `variant` 不照抄控件的，按控件的面派且恒有值：`outline` / `ghost` 与缺省（控件缺省即 `outline`）的面是画布色或透明，标签摆 `subtle`；`subtle` 控件的面本身就是淡底，标签摆 `outline` 才看得出是一枚标签。形态恒有值，`tone` 才有落点——`tag.css` 的语气规则都挂在形态之下，只给 `tone` 不给 `variant` 的 `select` 标签照样着色，且不写 `variant` 与写 `outline` 的标签一样。
  - **DOM 契约**：`api.getTagProps({ value })` 与 `api.getOverflowTagProps()` 产出的是 `tag` 的 `root`（`data-scope="tag" data-part="root"`），前者另带 `data-value`，后者另带 `data-count`；没有折起的标签时 `+N` 是 `tag` 的收起态（`data-state="closed"` + `hidden`）。新增 `api.getTagLabelProps()`：标签文字所在的块（`tag` 的 `label`），截断落在这一层，标签与 `+N` 共用。
  - **三家适配器**：Vue / React 的 `XhSelectTag` / `XhSelectOverflowTag` 名字不变，渲出来的节点换成 `tag` 的 `root`；插槽 / children 只有文字时替它包一层新增的 `XhSelectTagLabel`（与 `XhTagRoot` 同一条规矩），作者自己写了节点就原样放行。Web Components 侧作者写法不变（`data-xh-part="tag"` / `"overflow-tag"`），两个角色节点接的是 `tag` 的 `root`，元素替只有文字的节点包一层 `label`，`+N` 的文字填进那层 `label`；这两个作者名以 `delegates` 登记为归 `tag` 的 scope 管，不再进 `select` 的解剖。
  - **皮肤**：`select.css` 里画标签与 `+N` 的规则整段删掉，只留标签行（`tag-list`）与行里子项怎么排：行里的 `tag` 允许缩短（`flex: 0 1 auto; min-inline-size: 0`），`+N`（带 `data-count`）不缩。`tag.css` 的覆盖槽（`--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-radius` 等）写在 `select` 外层即生效。
  - **档位**：标签跟着控件的 `size` 走同一档——sm 控件 28（内 26）里的标签 22、md 32（内 30）里 26、lg 40（内 38）里 30，三档都在盒的内侧，盒高不变。

  **破坏面：**

  - `select` 的解剖少两个部件（23 → 21）：`tag`、`overflow-tag` 删除。按部件数或 `[data-scope='select'][data-part='tag']` / `[data-part='overflow-tag']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='root']`（`+N` 加 `[data-count]`）。
  - `select.css` 的十一个覆盖槽随之删除：`--xh-select-tag-bg` / `-fg` / `-font-size` / `-gap` / `-px` / `-radius` 与 `--xh-select-overflow-tag-bg` / `-fg` / `-font-size` / `-px` / `-radius`，改用 `tag` 自己那批槽；`--xh-select-tag-list-gap` 留着（它是标签行自己的间隙）。
  - `+N` 那一枚不再另配压一档的配色，与标签同一副长相；要区分它就按 `[data-scope='tag'][data-part='root'][data-count]` 覆盖 `--xh-tag-bg` / `--xh-tag-fg`。
  - 标签的形态按控件的面派：`subtle` 控件里的标签从淡底变成描边（此前与盒同一块淡底、只剩文字）；写了 `tone` 的 `select` 其标签现在跟着着色。
  - `SelectApi` 多 `getTagLabelProps` 一个成员；自己按 `SelectApi` 造对象的要补上。Vue / React 各多一个 `XhSelectTagLabel`。
  - Web Components 侧 `tag` / `overflow-tag` 节点里只有文字时，元素会把文字挪进一层新建的 `<span data-scope="tag" data-part="label">`；按 `textContent` 读仍是原文，按 `firstChild` 读到的是那层 label。
  - 标签的高度与字号随本次一并变大（三档 18 → 22 / 26 / 30，字 12 → 12 / 13 / 14），圆角从药丸（`--xh-shape-pill`）改为 `tag` 的 `--xh-shape-control`。

- dc64383: **浮层面板的三段分区补齐，文本输入的两套控件盒收成一套。** 不留别名、不留 `var(新名, 旧名)` 双写：下面标为已删的槽名在皮肤里不再存在，设它没有任何效果。

  ## 一、`dialog` / `drawer` 补三段：`header` / `body` / `footer`

  `floating-panel` 早有 `header` 与 `body`，`dialog` 与 `drawer` 一个都没有——面板里做不出「头尾定在原处、正文自己滚」，官方示例只好在 `content` 里手写一个内联的滚动盒。三家现在是同一套角色划分：

  | 部件     | 角色   | 排布契约                                                                                            |
  | -------- | ------ | --------------------------------------------------------------------------------------------------- |
  | `header` | 面板头 | `flex: none`，不参与压缩；`dialog` / `drawer` 里纵向堆叠标题与说明，`floating-panel` 里是横排标题栏 |
  | `body`   | 正文   | `flex: 1 1 auto` + `min-block-size: 0` + `overflow: auto`，面板里唯一会滚的一段                     |
  | `footer` | 面板尾 | `flex: none`，动作按钮排一行靠尾                                                                    |

  `dialog` 与 `drawer` 各新增：

  - 无头层 `getHeaderProps` / `getBodyProps` / `getFooterProps`；
  - Vue `<XhDialogHeader>` / `<XhDialogBody>` / `<XhDialogFooter>`、`<XhDrawerHeader>` / `<XhDrawerBody>` / `<XhDrawerFooter>`；
  - 自定义元素的 `header` / `body` / `footer` 三个角色节点（`data-xh-part`），已接进 `@csspart`；
  - 覆盖槽 `--xh-{dialog,drawer}-header-gap` / `-header-pb` / `-footer-gap` / `-footer-pt`。

  面板的内衬与安全区让位仍由 `content` 一层给出，三段只接手段与段之间那道缝：内衬换成三段各留一份，安全区与局部容器两档就要在三处各算一遍。

  写了 `body` 的那一档，`dialog` 的 `content` 同时封顶（`max-block-size: 100%`）并收起自身溢出——不封顶正文永远没有可滚的余量，滚动条出不来。不写 `body` 的写法与从前逐值相同。

  **新增，不是改名**：既有的 `content` + `title` + `description` 写法一个字不用改。

  ## 二、`text-field` 只剩一个控件盒（BREAKING）

  `text-field.css` 此前有两套完整的盒规则：一套画在 `control` 上，一套画在 `input` 上，两组公开槽并存且互不感知——同一个组件里长了两个盒，同族其余控件的盒都只有一个。现在 `control` 是唯一的视觉盒：描边、圆角、底色、落影与聚焦环全画在它身上，`input` 退成框里的一段透明分段。

  **`input` 必须写在 `control` 里面**，否则输入框没有任何框的观感（不再有「不写 control 就由 input 自己画盒」这一档）。

  已删的覆盖槽（14 支），换成 `control` 上的同名槽：

  | 已删                                   | 换成                                     |
  | -------------------------------------- | ---------------------------------------- |
  | `--xh-text-field-input-h`              | `--xh-text-field-control-h`              |
  | `--xh-text-field-input-min-w`          | `--xh-text-field-control-min-w`          |
  | `--xh-text-field-input-px`             | `--xh-text-field-control-px`             |
  | `--xh-text-field-input-radius`         | `--xh-text-field-control-radius`         |
  | `--xh-text-field-input-bg`             | `--xh-text-field-control-bg`             |
  | `--xh-text-field-input-bg-hover`       | `--xh-text-field-control-bg-hover`       |
  | `--xh-text-field-input-bg-readonly`    | `--xh-text-field-control-bg-readonly`    |
  | `--xh-text-field-input-bg-disabled`    | `--xh-text-field-control-bg-disabled`    |
  | `--xh-text-field-input-border`         | `--xh-text-field-control-border`         |
  | `--xh-text-field-input-border-hover`   | `--xh-text-field-control-border-hover`   |
  | `--xh-text-field-input-border-focus`   | `--xh-text-field-control-border-focus`   |
  | `--xh-text-field-input-border-at-max`  | `--xh-text-field-control-border-at-max`  |
  | `--xh-text-field-input-border-invalid` | `--xh-text-field-control-border-invalid` |
  | `--xh-text-field-input-shadow`         | `--xh-text-field-control-shadow`         |

  仍留在 `input` 上的是文字与自动填充那几支：`--xh-text-field-input-fg` / `-font-size` / `-autofill-bg` / `-autofill-fg`，以及多行宿主的 `--xh-text-field-textarea-py`。

  多行宿主（`as="textarea"`）在框里：`control` 的定高换成由行数撑起（`block-size: auto` + `min-block-size` 走控件行高），纵向内衬仍由 `input` 自己留。

  文档站 18 份示例（`text-field` 16 份、`listbox` 与 `pagination` 各 1 份）已改成把 `input` 写进 `control`；`text-field/11-affix` 的前后缀不再靠绝对定位压在输入框上，改为与输入框同在框里排成一行。

  ## 三、`select` / `listbox` 两页登记官方组合写法

  `popselect` 退役后，「浮层壳 + 条目层」的替代写法成为两页文档里的官方组合示例：浮层只管开合与定位，条目、键盘导航、连打检索与选中语义全在 `listbox` 里。`select` 页新增示例「官方组合：浮层 + 列表框」，`listbox` 页的「弹出式选择」是同一例。

- f0a2e34: **同义重名收口：13 个 `data-*` 属性名删除，每组只留一个。** 同一件事在不同组件里取了两三个名字，使用者那条 `[data-xxx]` 规则就只能命中其中一部分——想给「拖动中」写一条统一的光标规则，写 `[data-dragging]` 会漏掉图片查看器，写 `[data-panning]` 又只剩它一个。现在每组定一个赢家，输的那个名字从连接层、皮肤、适配器、用例与文档里整个删除，**不留别名、不留过渡期**。

  **破坏性：下表左列的属性名在 DOM 上不再出现，选它的规则一条也不会再命中。** 这一介质没有 IDE 提示，改名之后选择器只会静默失配，不报错也不降级——请在自己的代码库里全文搜索左列这 13 个名字，逐条换成右列。

  | 删掉的名字             | 改成                                  | 组件 / 部件                                                                         |
  | ---------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
  | `data-affixed`         | `data-fixed`                          | `affix` 的 `content`                                                                |
  | `data-at-limit`        | `data-at-max`                         | `text-field` 的 `root` / `control` / `input`                                        |
  | `data-autosize`        | `data-auto-resize`                    | `text-field` 的 `input`                                                             |
  | `data-borderless`      | `data-bordered`（**取值反转**，见下） | `table` 的 `root`                                                                   |
  | `data-busy`            | `data-loading`                        | `approval` 的 `root` / `approve-trigger` / `deny-trigger`，`prompt-input` 的 `root` |
  | `data-overflow`        | `data-overflowing`                    | `tags-input` 的 `root` / `control`                                                  |
  | `data-panning`         | `data-dragging`                       | `image-viewer` 的 `viewport` / `image`                                              |
  | `data-row-draggable`   | `data-draggable`                      | `table` 的 `row`                                                                    |
  | `data-ruled`           | `data-split`                          | `table` 的 `root`                                                                   |
  | `data-running`         | `data-loading`                        | `tool-call` 的 `root` / `duration`                                                  |
  | `data-segmented`       | `data-split`                          | `card` 的 `root`                                                                    |
  | `data-sider-collapsed` | `data-collapsed`                      | `layout` 的 `root`                                                                  |
  | `data-sticky`          | `data-fixed`                          | `table` 的 `root` / `header`                                                        |

  **`table` 的外框这一位换成了正面事实，规则要跟着反过来写。** 从前是 `data-borderless` ——「不画外框」时才出现；现在是 `data-bordered` ——「画外框」时出现，缺省就在，写了 `borderless` 才缺席。原先 `[data-scope='table'][data-part='root']:not([data-borderless])` 的写法改成 `[data-scope='table'][data-part='root'][data-bordered]`，原先 `[data-borderless]` 的写法改成 `:not([data-bordered])`。改的只是这一位报的方向，`borderless` 这个 prop 与默认渲染都没有变。

  **`data-fixed` 从此统管「这块钉住不随滚动走」。** `layout` 的页头与侧栏、`table` 的吸顶表头、`affix` 越过判定线之后的内容，说的是同一件事，从前叫三个名字。`layout` 的根节点仍旧发 `data-header-fixed` 与 `data-sider-fixed` ——同一个元素上并存着两段各自的开关，不带部件名就分不开，它们是 `data-fixed` 带部件名的转述，不是另一个名字。`log` 的 `data-sticking` 不在这一组：那一位说的是滚动跟随底部，不是钉住。

  **`data-loading` 从此统管「异步在途」。** `approval` / `prompt-input` 的「等外部结果落定」与 `tool-call` 的「这次调用还在执行」，与 `button` / `table` 那一批的加载中是同一件事，词汇表里 `aria-busy` 早就配对到 `data-loading`。

  **`data-at-max` 统管「已经到上限」，`data-overflowing` 统管「越过了容纳上限」。** 前者与既有的 `data-at-min` 成对；后者的两处含义各自照旧——`ellipsis` 是文本超出容器正在被省略，`tags-input` 是标签数越过 `max`（刚好装满仍是 `data-at-max`）。

  **`data-split` 统管「在相邻块之间画分隔线」**：`list` 的条目之间、`card` 的段之间、`table` 的列之间。`segmented` 这个名字与同名组件 `segmented` 撞脸，`ruled` 只在表格排版里说得通，两者都让位。

  **两个覆盖槽随属性一起改名**，也请一并搜索替换：

  | 删掉的槽名                                | 改成                                    |
  | ----------------------------------------- | --------------------------------------- |
  | `--xh-text-field-control-border-at-limit` | `--xh-text-field-control-border-at-max` |
  | `--xh-text-field-input-border-at-limit`   | `--xh-text-field-input-border-at-max`   |

  全局语义令牌 `--xh-border-at-limit` 不在这次范围里，名字不变；`tags-input` 一直就是这么接的（组件槽叫 `-at-max`，兜底取 `--xh-border-at-limit`），`text-field` 这一改是与它对齐。本条不动各组件的 prop 名（`borderless` / `ruled` / `stickyHeader` / `autoSize` / `allowOverflow`），默认渲染逐像素不变。`card` 的 `segmented` 另由 prop 改名那一条改成 `split`，与它自己发的 `data-split` 对齐。

- f7495fd: **步骤条的 `StepStatus` 收成 `'completed' | 'current' | 'incomplete'`；出错 / 警示改为逐步语气 `tones`。**

  `'error'` 与 `'warning'` 原来混在状态里：一步被打回时它仍然是「当前那一步」或「走过的那一步」，状态位却被语气占掉，皮肤只好另写两套颜色。现在状态只说步序，语气另走全库同一根轴：根上的 `tone` 给整组配色，新增 `tones?: Record<number, Tone>`（以及 collection 单步的 `tone`）给某一步单独标语气，落成 `item` 的 `data-tone`，那一步的标记、标题与连接线在这一级重新从语气层取色，还没走到的那一步也以空心描边加同色数字被看见。三端同步：Vue / React 新增 `tones` prop，自定义元素新增 `tones` property；皮肤撤掉 `data-state='error' | 'warning'` 的规则与对应的 `--xh-steps-*-error / -warning` 槽，改为 `--xh-steps-indicator-*-toned` 与 `--xh-steps-title-fg-toned`；「错误状态」示例改用 `tones`。

- 9c4a5db: CORE-15：组合宿主不合法时明确抛错；asChild 的零个或多个可挂载子节点不再报警后生成默认按钮。请提供唯一实际宿主，或在需要默认元素时移除 asChild。

  元素旁并列的非空文本和数字同样明确拒绝，仅忽略空白、注释和条件占位，不再静默丢弃可见内容。React 按正式 peer 版本 19 从 props.ref 合并引用，删除 element.ref 废弃访问。

  作者写在部件或 asChild 子节点上的事件处理器调用 preventDefault 后，不再执行部件内部动作。普通回调、通用 props 合并和 ref 生命周期保留原语义。

- 3ef5a6e: **`tag-group` 的条目套成 `tag`：一枚标签就是 `tag` 的 `root`，文字是 `tag` 的 `label`，摘除钮是 `tag` 的 `close-trigger`；`item` / `item-text` / `item-delete-trigger` 不再是本组件的部件，`tag-group.css` 不再自己画标签。**

  此前 `tag-group` 自己画了一整套标签（三档尺寸、三种形态、语气、置灰、截断、摘除钮、兜底字形），与 `tag.css` 是第二份拷贝。现在：

  - **连接层**：每一枚标签在 `connectTagGroup` 里各是一份 `connectStaticTag`（受控 `open: true`、三轴与 `readOnly` 从整组传下去、`disabled` 与 `closable` 逐枚定、`translations.close` 取 `translations.deleteItem(标签文字)`）。`api.getItemProps()` 是这份实例的 `root` 叠上集合里的那几件事——`role="row"`、`data-value`、roving `tabindex`、`aria-selected` / `aria-disabled`、`data-selectable` / `data-deletable` / `data-highlighted` / `data-selected`、点选与聚焦处理器；`api.getItemTextProps()` 是它的 `label`；`api.getItemDeleteTriggerProps()` 是它的 `close-trigger` 再叠 `tabindex="-1"` 与「主键按下不夺焦」。按叉时 `tag` 只发 `onOpenChange({ open: false })`，`tag-group` 在那里把焦点交给相邻的一枚再送 `ITEM.DELETE`，与键盘 `Delete` / `Backspace` 走同一条路。
  - **选中改成布尔 `data-selected`**（词汇表里 `row` + `aria-selected` 配的就是它），`data-state` 只剩 `tag` 的 `open` 族（宿主根上恒为 `open`）；`cell` 同步带 `data-selected` / `data-highlighted` / `data-disabled`。
  - **禁用 / 只读矩阵由 `tag` 给**：整组或这一枚禁用时标签置灰、钮留位并原生 `disabled`；整组只读时钮留位、原生 `disabled`，标签本身不置灰；没开放摘除时钮连位置一起收起。
  - **三家适配器**：Vue / React 的 `XhTagGroupItem` / `XhTagGroupItemText` / `XhTagGroupItemDeleteTrigger` 名字与用法不变，渲出来的节点换成 `tag` 的 `root` / `label` / `close-trigger`；Web Components 侧作者写法不变（`data-xh-part="item" / "item-text" / "item-delete-trigger"`），这三个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
  - **皮肤**：`tag-group.css` 里画标签的全部规则整段删掉（尺寸三档、形态、语气、置灰、截断、打印、摘除钮、兜底字形、聚焦环的 `solid` 上下文），只留集合层的事——`root` / `label` / `list` 怎么排、`cell` 那一格、以及叠在 `tag` 根上的可点（`cursor` 与按压回执）、锚点与悬停的中性灰轻档（实心档不进）、选中的描边与字色（实心档改用面配对的前景色描边，字不换）、只读的光标。聚焦环全归 `focus.css` 的通用环加 `tag.css` 的 `solid` 上下文规则，`tag-group.css` 不再另写。标签的样子归 `tag.css`，`--xh-tag-*` 覆盖槽在组里照样生效。
  - **新导出 `tagGroupItems(list)`**：按文档序取列表里担 `row` 角色的 `tag` 根（作者塞进格子里的独立标签没有这个角色，不算条目；嵌套的标签组互不吞并），代替原来的 `tagGroupItemQuery`。

  **破坏面：**

  - `tag-group` 的解剖少三个部件（7 → 4）：`item` / `item-text` / `item-delete-trigger` 删除。按 `[data-scope='tag-group'][data-part='item']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag-group'][data-part='list'] > [data-scope='tag'][data-part='root']`；`item-text` 改成 `[data-scope='tag'][data-part='label']`，`item-delete-trigger` 改成 `[data-scope='tag'][data-part='close-trigger']`。
  - 选中态从 `data-state="checked" | "unchecked"` 改成布尔 `data-selected`：按 `[data-state='checked']` 写过的样式与断言要改成 `[data-selected]`。
  - `@xihan-ui/headless` 不再导出 `tagGroupItemQuery`（`core` 的 `queryItems` 按容器 scope 过滤，对上不了 `tag` 的 scope），改用 `tagGroupItems(list)`。
  - `tag-group.css` 的这些覆盖槽随之删除：`--xh-tag-group-item-icon-size` / `-px` / `-py` / `-px-deletable` / `-radius` / `-bg` / `-fg` / `-font-size` / `-font-weight` / `-border` / `-shadow` / `-border-disabled` / `-bg-disabled`、`--xh-tag-group-cell-gap`、`--xh-tag-group-item-delete-size` / `-radius` / `-fg` / `-bg-hover` / `-bg-active`；改用 `tag` 的 `--xh-tag-icon-size` / `--xh-tag-gap` / `--xh-tag-px` / `--xh-tag-py` / `--xh-tag-radius` / `--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-font-size` / `--xh-tag-font-weight` / `--xh-tag-border` / `--xh-tag-shadow` / `--xh-tag-border-disabled` / `--xh-tag-bg-disabled` / `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`。留下的只有集合层的三个：`--xh-tag-group-item-bg-hover` / `--xh-tag-group-item-border-selected` / `--xh-tag-group-item-fg-selected`。`cell` 那一格的间距照抄所在标签的那一档（`gap: inherit`），改 `--xh-tag-gap` 即可。
  - 标签的尺寸走 `tag` 的三档：md 从 12px 字号、2px 竖向内衬变成 `tag` 的 13px 字号、4px 竖向内衬与不低于指示符的行框（同档标签有没有关闭钮一样高）；sm / lg 同理。
  - 悬停与键盘锚点的中性灰轻档现在也落到写了语气的淡底标签上（此前被形态规则的源序盖住而不生效）；实心标签不论有无语气都不进轻档，面不换（此前没写语气的实心标签会换成灰底、字仍是实心底上的浅字，1.26:1）。
  - 选中的实心标签字不换（仍是 `tag.css` 给的面配对前景色，作者的 `--xh-tag-fg` 照旧生效），描边取字色（`currentColor`）在实心底上描出一圈（此前没写语气的那一档把字换成 `--xh-fg-brand-strong` 压在品牌底上读不出来，写了语气的那一档被形态规则盖住、选中看不出来）。`--xh-tag-group-item-border-selected` 在实心档上照样先于字色生效，`--xh-tag-group-item-fg-selected` 只落到非实心档。
  - 摘除钮的样子不变（此前已与 `tag` 的关闭钮同一副长相），只是覆盖槽换成 `--xh-tag-close-*`；标签与摘除钮的聚焦环改走 `focus.css` 的通用环加 `tag.css` 的 `solid` 上下文规则，`tag-group.css` 不再画环。
  - `tag.css` 的实心档环规则（标签根与关闭钮的 `--xh-_ring-color: currentColor`）排掉置灰档：组里置灰的标签仍是 roving 锚点、落得上焦点，它的字已换成置灰色，环退回默认那一支（此前由 `tag-group.css` 自己的规则排掉，现在归 `tag.css`）。

- 3ef5a6e: **`tags-input` 的标签预览退役成 `tag`：`item-preview` / `item-text` / `item-delete-trigger` 不再是本组件的部件，渲出来的是 `tag` 的 `root` / `label` / `close-trigger`（`data-scope="tag"`），样子归 `tag.css`。**

  标签输入里每一枚标签此前是本组件自己画的一颗胶囊（底色、圆角、字号、删除钮、悬停与按压都另写一套）——`tag` 本来就是这枚胶囊，第二份就是另起一套。现在：

  - **连接层**：每一枚标签在 `connectTagsInput` 里各是一份 `connectStaticTag`（`variant` 按控件的面派：`subtle` 控件里是描边标签，其余含缺省是淡底标签；`tone` / `size` / `disabled` / `readOnly` 随控件；`closable: true`；`translations.close` 取 `translations.deleteItem(标签值)`）。预览就是这份实例的 `getRootProps()`，`open` 只看这一枚是不是正被就地编辑：编辑时 `tag` 按 `open=false` 给 `hidden` 与 `data-state="closed"`，与 `item-input` 的 `hidden` 互斥。文字是 `getLabelProps()`，删除钮是 `getCloseTriggerProps()` 再合上 `tabindex="-1"` 与「按下不夺焦」——按它时 `tag` 只发 `onOpenChange({ open: false })`，`tags-input` 在那里送 `TAG.DELETE` 并把焦点交回输入框（仅当焦点当下正落在这一枚里）。
  - **状态标记留在 `item` 上**：`data-value` / `data-highlighted` / `data-editing` / `data-disabled` / `data-readonly` 仍打在本组件的 `item` 包裹层上，`tag` 的 `root` 只带 `tag` 自己的属性（三轴、`data-state`、`data-disabled`、`hidden`）。光标走到标签上的反白由 `[data-scope='tags-input'][data-part='item'][data-highlighted] > [data-scope='tag'][data-part='root']` 这条跨 scope 规则画在 `tag` 的 `root` 上，覆盖槽仍是 `--xh-tags-input-item-bg-highlight` / `-fg-highlight`。
  - **禁用 / 只读矩阵由 `tag` 给**：禁用时钮留在原地、原生 `disabled` 并带 `data-disabled`，整枚标签置灰；只读时钮同样留位、原生 `disabled`，标签本身不置灰。
  - **可及名**：仍走 `translations.deleteItem`（缺省 `Delete <标签值>`），经 `tag` 的 `translations.close` 落到那颗钮上。
  - **三家适配器**：Vue / React 的 `XhTagsInputItemPreview` / `XhTagsInputItemText` / `XhTagsInputItemDeleteTrigger` 名字与用法不变，渲出来的节点换成 `tag` 的三个部件；Web Components 侧作者写法不变（`data-xh-part="item-preview"` / `"item-text"` / `"item-delete-trigger"`），三个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
  - **皮肤**：`tags-input.css` 里画胶囊的规则整段删掉（`item` 的底色 / 圆角 / 字号 / 反白 / 置灰 / 编辑态透底，`item-preview` 的内衬，`item-text` 的截断，`item-delete-trigger` 的尺寸 / 圆角 / 悬停 / 按压 / 聚焦环 / 禁用色 / 兜底字形）；`item` 只剩「在行里怎么占位」（不缩、不超过一行）。标签吃 `tag.css`：三档高 22 / 26 / 30 装进控件的 28 / 32 / 40 里，框仍是一行控件高；就地编辑框的行框、内衬与字号照 `tag` 那一档写，换进换出时与标签一样高、行不跳。

  **破坏面：**

  - `tags-input` 的解剖少三个部件（12 → 9）：`item-preview` / `item-text` / `item-delete-trigger` 删除。按 `[data-scope='tags-input'][data-part='item-preview' | 'item-text' | 'item-delete-trigger']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='root' | 'label' | 'close-trigger']`（要限定在 `tags-input` 里就前缀 `[data-scope='tags-input'][data-part='item']`）。
  - `tags-input.css` 的这些覆盖槽随之删除：`--xh-tags-input-item-bg` / `-fg` / `-gap`，`--xh-tags-input-delete-size` / `-radius` / `-bg` / `-fg` / `-font-size` / `-fg-highlight` / `-bg-hover` / `-fg-hover` / `-bg-active`，改用 `tag` 的 `--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-gap` / `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`（写在 `tags-input` 的根上即对整框的标签生效）。`--xh-tags-input-item-radius` / `-py` / `-px` / `-font-size` 只剩就地编辑框在用，`-radius` 的缺省从 `--xh-shape-pill` 改成 `--xh-shape-control`（与 `tag` 同）。
  - 标签的高从随字号算的一档变成 `tag` 的三档 22 / 26 / 30，圆角从胶囊圆改成 `--xh-shape-control`，字重取 `tag` 的 `--xh-font-weight-medium`；反白档描边收成透明。
  - 悬停 / 按压底色从 `--xh-bg-subtle-hover` / `-active` 换成由当前前景色兑出的 `color-mix`；缺省字色从 `--xh-fg-muted` 换成标签自己的文字色。
  - 聚焦环不再由 `tags-input.css` 画，走 `focus.css` 的通用环；反白标签里的叉取 `currentColor`。
  - 只读时删除钮从「原生 `disabled`（由整组只读推得）」保持原生 `disabled` 不变，但现在是 `tag` 的 `readOnly` 给的：钮带 `data-disabled`，标签的 `root` 不带。

- fb01380: Toast 新增必需的 `content` 文本列与可选 `description`，并将默认卡片改为中性浮层；语气只落到标题和状态图标。

  全局服务默认落在底部，最多显示 3 条、间距 12px；默认停留与退场窗口分别改为 4000ms 和 300ms，关闭入口默认可用，全局服务在页面转入后台时自动暂停计时。

  移除中部三种落位，只保留顶部与底部的六种边缘落位。

- a16f7f2: **轻提示与通知的 `type` 改名 `tone`，取值收成全库语气轴的 `info | success | warning | danger`；加载中从语气里拆出来，独立成 `loading?: boolean`。**

  原来的 `type` 一位说了两件事：既是配色语气，又用 `'loading'` 表达"事情还没完"，于是 `'error'` 得先翻译成语气层的 `danger`，`'loading'` 又得偷偷派生成中性色。现在语气与加载态各占一位：`tone` 直接落到 `data-tone`，决定配色、行首字形与实时区级别（`danger` 走 alert + assertive）；`loading` 落到 `data-loading`，字形换成转圈且不自动消失，配色照语气走，完事后写 `{ loading: false, tone: 'success' }` 收尾。皮肤不再读 `data-severity`。

  三端与服务同步：Vue / React 的 `type` prop、自定义元素的 `type` attribute 改为 `tone` + `loading`；`ToastType` / `NotificationType` 改名 `ToastTone` / `NotificationTone`；轻提示与通知服务的 `error()` 糖改名 `danger()`，`loading()` 糖改为打开 `loading` 位，`promise()` 落定后以 `{ loading: false, tone }` 改写；`@xihan-ui/sound` 的 `withToastSound` 端口同步改成 `danger`，`sounds` 覆盖表的键从 `error` 改为 `danger`（缺省仍发主题里那把 `error` 声）。

- d51d182: **轻提示的严重度补上字形通道，字形改由皮肤画。**

  `toast` 的 root 一直在发 `data-severity`，而皮肤一条规则都不读它：严重度只剩淡底与描边这一条色相通道，色觉障碍用户与黑白打印下「已保存」与「保存失败」长得一模一样。同一台机器出来的 `notification` 有整套字形指示符。

  皮肤现在按 `data-severity` 在条子行首各画一枚字形，取的是 `notification` 那套 `--xh-glyph-mark-*` 令牌，两家从此同一副读法：`info` 圆圈问号、`success` 勾、`warning` 三角、`error` 叉、`loading` 转圈箭头。轻提示的解剖到 root 为止、没有第二个节点可挂，字形因此画在 root 的伪元素上，与 `checkbox-group` 全选格同一种写法。颜色走语气层派生的前景档，新增使用者覆盖槽 `--xh-toast-icon-fg`；尺寸沿用已有的 `--xh-toast-icon-size`。

  减弱动效与打印下 `loading` 那一档停转。

  **破坏性（`@xihan-ui/vue`）：`createToastService` 的默认模板不再渲染那枚字形节点。** 此前字形只在这一条路径上存在——声明式的 `<XhToastRoot>` 与 `<xh-toast>` 元素上一枚都没有。现在三条路径都由皮肤统一画，模板里那个 `<span>` 随之删除。

  影响面：按 `[data-scope="toast"][data-part="root"] > span:first-child` 这类结构选择器给字形写过样式的，选不中了——改成写 `--xh-toast-icon-fg` / `--xh-toast-icon-size`，或按 `[data-scope="toast"][data-part="root"]::before` 覆盖。另外，条子里子节点的序号整体前移一位。

- f0a2e34: **读屏文案与排布方向收成单一形状：不再收字符串文案，不再收 `direction` 别名。**

  四处形状此前是为了不推翻既有调用方而放宽的：两处文案收「字符串或函数」的并集，两处排布方向收 `orientation` 与 `direction` 两个同义入参。并集与别名都已收回，只留一种写法。

  ### 删掉的名字

  在自己的代码库里全文搜索以下字符串，命中处按下面的对照改写：

  | 删掉的名字       | 出处                                      |
  | ---------------- | ----------------------------------------- |
  | `FlexDirection`  | `@xihan-ui/headless` 的导出类型           |
  | `direction`      | `flex` 组件的 prop / `<xh-flex>` 的特性   |
  | `direction`      | `space` 组件的 prop / `<xh-space>` 的特性 |
  | `data-direction` | `flex` 根部件发出的属性                   |

  `DiffViewTranslations.expandGap` 与 `MessageFeedTranslations.item` 名字仍在，但只收函数。

  ### 文案：字符串改成函数

  `DiffViewTranslations.expandGap` 由 `string | ((count: number) => string)` 收成 `(count: number) => string`。

  ```ts
  // 旧
  translations: {
    expandGap: "展开";
  }
  // 新：入参是这一格折起来的行数
  translations: {
    expandGap: (count) => `展开折起的 ${count} 行`;
  }
  ```

  `MessageFeedTranslations.item` 由 `string | ((position, size, role?) => string)` 收成 `(position: number, size: number, role?: MessageFeedItemRole) => string`。

  ```ts
  // 旧
  translations: {
    item: "消息";
  }
  // 新：入参是第几条、共几条、谁说的；size 为 -1 表示宿主没声明总数
  translations: {
    item: (position, size, role) => `第 ${position}/${size} 条，${role}`;
  }
  ```

  不想插值的，把原来那句字符串包成常量函数即可：`item: () => '消息'`。

  ### 排布方向：direction 改成 orientation

  `flex` 与 `space` 的 `direction` 入参删除，方向只由 `orientation` 一个入口给；`flex` 根部件不再另发 `data-direction`，方向只由 `data-orientation` 表出。

  ```html
  <!-- 旧 -->
  <xh-flex direction="column">
    <xh-space direction="vertical">
      <!-- 新 -->
      <xh-flex orientation="vertical">
        <xh-space orientation="vertical"></xh-space></xh-flex></xh-space
  ></xh-flex>
  ```

  `flex` 的取值一并换词：`row` → `horizontal`、`column` → `vertical`，与全库其余组件的排布轴说同一句话。写在自己样式表里的 `[data-direction='column']` 一类选择器改成 `[data-orientation='vertical']`。

- 61773be: 完成 TreeSelect 懒分支反馈与自动空态合同：公开 loading/error/retry/loaded-empty 结构和请求事件，收起、重试、节点移除或换代时严格作废旧请求，并为 collection 与手写树自动渲染空态和首次加载态。
- dc64383: **补间不再自带一套缓动曲线，改从共用的那张表取。** `tween.ts` 从前写死四条曲线（`ease-in` 是 `t³`、`ease-out` 是 `1-(1-t)³`），与 `easing.ts` 里同名的那几条**不是同一条曲线**——同一个动作用 CSS 声明和用 JS 逐帧算，走出来的路径不一样。现在补间经 `resolveEasing` 取曲线，JS 侧只剩 `easing.ts` 一张表，而它逐值对着设计令牌，由 `check-motion-source` 对账。

  **删掉的公开面（`@xihan-ui/motion`）**：

  | 删掉                  | 改用                                                  |
  | --------------------- | ----------------------------------------------------- |
  | `TweenEasing` 类型    | `EasingName`（曲线名）或 `EasingFunction`（自带函数） |
  | `tweenEasings` 曲线表 | `easing` 曲线串表 + `resolveEasing`                   |
  | `resolveTweenEasing`  | `resolveEasing`                                       |

  `TweenSpec.easing` 现在收三种写法：曲线名、`cubic-bezier(...)` / `linear` 串，或函数本身。`@xihan-ui/headless` 随之不再转出 `TweenEasing`，改转 `EasingName`。

  **破坏性：`number-animation` 的 `easing` 换了取值域。** 从前的四档 `linear` / `ease-in` / `ease-out` / `ease-in-out` 里，只有 `linear` 还认；另外三个不再是已知曲线名，会退回线性。逐条改成曲线表里的名字：

  | 从前          | 改成        |
  | ------------- | ----------- |
  | `ease-in`     | `easeIn`    |
  | `ease-out`    | `easeOut`   |
  | `ease-in-out` | `easeInOut` |

  同时可选的还有 `standard` / `emphasized` / `decelerate` / `accelerate` / `outStrong`，以及直接写一条 `cubic-bezier(...)` 串。曲线换过之后数字滚动的路径与同名 CSS 声明一致。

  **对账面加一条。** `check-motion-source` 从四对缓动常量扩到五对，把 `ease.in-out` ↔ `easing.easeInOut` 也纳入逐字比对——令牌那条 `$description` 早就写着两者同值，此前没人拦。

- 3284947: **统一部件上同名事件处理器的先后：作者的先跑，部件的后跑。**

  此前同一个部件，只因为写不写 `asChild`，同名处理器的顺序就反过来：带 `asChild` 那条路是作者的先跑，直接把属性写在部件上那条路是部件的先跑。同一份心智模型下写出来的两段代码，行为不一样。

  判据是「作者传的处理器能不能拦住部件的默认动作」——能拦才是有用的口子，所以两条路统一成作者的先跑。Web Components 那一侧本来就是这个顺序（Light DOM 里先后就是 DOM 监听器的注册顺序，作者的标记先在页面上），这次只补了用例把它钉住，没有改动。

  `class` / `className` / `style` 与其余普通值的取舍没有变化。

  **破坏性**：如果你依赖「部件先跑完再轮到自己」——例如在自己的 `onClick` 里读部件刚写进去的状态——顺序反了。改法是把那段逻辑挪到微任务里，或改用组件的变更回调（`onOpenChange` 这类），那才是「部件动作之后」的正规出口。

  这处不一致是铺 React 适配器时对照出来的：React 侧当时照 Vue 抄了，所以两家都带着。

- 33c6805: **形态轴收敛为一套词。**

  **字段类默认落 `outline`。** text-field 的 `variant` 未提供时由 connect 落成 `data-variant="outline"`
  （root 与 control 两处一致；此前不发属性，由皮肤基础规则按缺省档绘制）。Field Chrome 家族的基础规则已是
  描边式（canvas 底 + `--xh-border-control` 描边 + 无影），显式落值后皮肤不再依赖缺省档，外观不变；
  自定义皮肤若以"无 `data-variant`"判定默认态需改为读取 `outline`。

  **number-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，
  皮肤基础规则按缺省档绘制）。默认外观从「透明描边 + raised 落影」改为「`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边」；皮肤未改，outline 档仍保留 raised 落影，与 Field Chrome 家族的无影对齐留给
  后续配方矩阵。自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **color-field 默认落 `outline`。** `variant` 未提供时 root 与 control 都落 `data-variant="outline"`（此前
  不发属性，由 Field Chrome 家族基础规则按缺省档绘制）。家族基础规则与 outline 逐值相同，外观不变；
  自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **password-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，
  由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影两处都保留），外观不变；自定义皮肤若以「无 `data-variant`」
  判定默认态需改为读取 `outline`。

  **pin-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态
  需改为读取 `outline`。

  **date-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则的常态描边是透明、悬停才浮出 `--xh-border-default`；outline 档把常态
  描边换成 `--xh-border-control`、悬停换成 `--xh-border-control-hover`，底色仍是 `--xh-bg-canvas`，raised
  落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以「无 `data-variant`」
  判定默认态需改为读取 `outline`。

  **time-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则的常态描边是透明、悬停才浮出 `--xh-border-default`；outline 档把常态
  描边换成 `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，
  底色仍是 `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；
  自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **editable 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。editable 的基础规则本就是 `--xh-bg-canvas` 底 + `--xh-border-control` 描边 +
  raised 落影，与 outline 档逐值相同，默认外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需改为
  读取 `outline`。

  **tags-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 + `--xh-border-control`
  描边，raised 落影保留），外观不变；内嵌标签仍按 `tagVariantForControl(outline)` 落 subtle，与此前一致。
  自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **prompt-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按 M1 柔和实体面绘制）。默认外观从「`--xh-material-soft-bg` 底 + `--xh-material-soft-border`
  描边 + 顶光与背景模糊」改为「`--xh-bg-canvas` 底 + `--xh-border-control` 描边，关掉顶光与背景模糊」，
  `--xh-material-soft-shadow` 落影保留；皮肤未改，去掉 soft 材质本身留给后续配方矩阵。自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **select 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。默认外观从「`--xh-bg-canvas` 底 + 透明描边 + raised 落影」改为
  「`--xh-bg-canvas` 底 + `--xh-border-control` 描边 + 无影」；皮肤未改，由既有 outline 规则承担。内嵌标签
  仍按 `tagVariantForControl(outline)` 落 subtle，与此前一致。自定义皮肤若以「无 `data-variant`」判定默认态
  需改为读取 `outline`。

  **combobox 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **cascader 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **tree-select 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **mention 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **date-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
  不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`，底色仍是 `--xh-bg-canvas`，raised 落影保留。
  默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **date-range-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
  不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
  `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **time-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
  不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
  `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **time-range-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`
  （此前不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
  `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **input-group 改用 `outline` / `subtle` / `ghost`。** `primary` → `outline`、`secondary` → `subtle`，新增
  `ghost`（静息不画底、描边与落影，悬停与聚焦沿用现有规则浮出）；`variant` 未提供时 root 落
  `data-variant="outline"`（此前不发属性，皮肤基础规则按缺省档绘制，与 outline 逐值相同，外观不变）。
  `InputGroupVariant` 类型删除，改用 `ControlVariant`，与组内字段同一套词。皮肤只把 `secondary` 选择器映射到
  `subtle`，outline 基础规则仍是 `--xh-border-subtle` 假边 + raised 落影，回归 `--xh-border-control` 留给后续
  Field Chrome 配方矩阵。

  **card 改用 `outline` / `subtle` / `ghost`。** `default` → `outline`、`secondary` → `subtle`、`tertiary` → `ghost`、
  `transparent` → `ghost`；`variant` 未提供时 root 落 `data-variant="outline"`（此前落 `default`，皮肤基础规则即
  该档，默认外观不变）。`CardVariant` 类型删除，三端改用 `ControlVariant`。皮肤只把 `secondary` / `transparent`
  选择器映射到 `subtle` / `ghost`，规则体不动；`tertiary` 的 `--xh-bg-subtle-hover` 底色档退役，原 tertiary 作者
  迁到 `ghost` 后卡面不再画底与影。本节覆盖未发布 changeset `card-semantic-surfaces.md` 里的四值旧词。

  **tree 改用 `outline` / `subtle` / `ghost`。** `surface` → `outline`、`plain` → `ghost`；`variant` 未提供时 root 落
  `data-variant="outline"`（此前落 `surface`，皮肤基础规则即该档，默认外观不变）。`TreeVariant` 类型删除，三端改用
  `ControlVariant`。皮肤只把 `plain` 选择器映射到 `ghost`，规则体不动；`subtle` 为新增最小规则（描边透明 +
  `--xh-bg-subtle` 底），此前没有对应外观。

  **json-viewer 改用 `outline` / `subtle` / `ghost`。** `surface` → `outline`、`plain` → `ghost`；`variant` 未提供时 root 落
  `data-variant="outline"`（此前落 `surface`，皮肤基础规则即该档，默认外观不变）。`JsonViewerVariant` 类型删除，三端改用
  `ControlVariant`。皮肤只把 `plain` 选择器映射到 `ghost`，规则体不动；`subtle` 为新增最小规则（描边透明 +
  `--xh-bg-subtle` 底），此前没有对应外观。

  **toolbar 改用 `outline` / `subtle` / `ghost`。** `plain` → `ghost`、`surface` → `outline`；`variant` 未提供时 root 落
  `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。`ToolbarVariant` 类型删除，三端改用
  `ControlVariant`。皮肤只把 `plain` / `surface` 选择器映射到 `ghost` / `outline`，规则体不动：outline 本阶段仍是
  `--xh-bg-surface` 底 + raised 落影、无描边，补 `--xh-border-default` 留给后续配方矩阵；`subtle` 为新增最小规则
  （带内距 + `--xh-bg-subtle` 底，无描边无影），此前没有对应外观。

  **accordion 改用 `outline` / `subtle` / `ghost`。** `plain` → `ghost`、`surface` → `outline`、`bordered` → `outline`；
  `variant` 未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。
  `AccordionVariant` 类型删除，三端改用 `ControlVariant`。皮肤把 `surface` 选择器映射到 `outline`，规则体不动；
  `bordered` 的逐条外框形态退役（其 `gap` 与条目 `border` / `border-radius` 规则删除，公开覆盖槽
  `--xh-accordion-item-gap` 随之退役），原 bordered 作者迁到 `outline` 后得到单一连续表面；`subtle` 为新增最小规则
  （同 outline 的连续表面，底换成 `--xh-bg-subtle`），此前没有对应外观。

  **list 的 `bordered` 并入形态轴。** `bordered` → `variant="outline"`；新增 `variant` 轴，取值 `outline` / `subtle` /
  `ghost`，未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。DOM 属性
  `data-bordered` 不再由 list 发出；三端的 `bordered` prop / attribute 删除。皮肤把 `[data-bordered]` 选择器映射到
  `[data-variant='outline']`，规则体不动；`subtle` 为新增最小规则（不画描边，surface 圆角 + `--xh-bg-subtle` 底），
  此前没有对应外观。示例 `list/03-bordered-hoverable` 改名 `list/03-outline-hoverable`。

  **descriptions 的 `bordered` 并入形态轴。** `bordered` → `variant="outline"`；新增 `variant` 轴，取值 `outline` /
  `subtle` / `ghost`，未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。DOM
  属性 `data-bordered` 不再由 descriptions 发出；三端的 `bordered` prop / attribute 删除。皮肤把 `[data-bordered]`
  选择器（含逐档网格线共 17 处）映射到 `[data-variant='outline']`，规则体不动；`subtle` 为新增最小规则（不画描边也不补
  网格线，surface 圆角 + `--xh-bg-subtle` 底），此前没有对应外观。示例 `descriptions/04-bordered` 改名
  `descriptions/04-outline`。

  **table 的 `borderless` 并入形态轴。** `borderless` → `variant="ghost"`；新增 `variant` 轴，取值 `outline` /
  `subtle` / `ghost`，未提供时 root 落 `data-variant="outline"`（此前由 `borderless` 取反发 `data-bordered`，皮肤
  外框规则即该档，默认外观不变）。DOM 属性 `data-bordered` 不再由 table 发出；三端的 `borderless` prop /
  attribute 删除。皮肤把 `[data-bordered]` 选择器映射到 `[data-variant='outline']`，规则体不动；`subtle` 为新增
  最小规则（不画描边，surface 圆角 + `--xh-bg-subtle` 底），此前没有对应外观。

  **page-header 改用 `outline` / `subtle` / `ghost`，`bordered` 改名 `split`。** `plain` → `ghost`、`surface` →
  `outline`、`raised` → `outline`；`variant` 未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则
  即该档，默认外观不变）。`PageHeaderVariant` 类型删除，三端改用 `ControlVariant`。`bordered` 改名 `split`：
  它画的是页头与下方内容之间的分隔线而非有框/无框，DOM 属性 `data-bordered` 改 `data-split`，且只在 `ghost` 上
  画；有面的两档由描边承担边界。皮肤把 `surface` 映射到 `outline` 并合并原 `raised` 的整圈描边，outline 因此恒带
  `--xh-border-subtle` 描边（原 surface 不写 bordered 时无描边）；`raised` 的抬起投影退役，公开覆盖槽
  `--xh-page-header-shadow` 随之删除；`subtle` 为新增最小规则（描边透明 + `--xh-bg-subtle` 底 + 无影），此前没有
  对应外观。示例 `page-header/02-bordered-footer` 改名 `page-header/02-split-footer`。

  **layout 的 `bordered` 改名 `split`。** 它画的是头部、侧栏、脚部与内容之间的分隔线而非有框/无框（layout 根本身
  无壳），与 `data-split` 既有语义一致，因此不加 `variant` 轴；三端的 `bordered` prop / attribute 改名 `split`，DOM
  属性 `data-bordered` 改 `data-split`，皮肤只把 `[data-bordered]` 选择器映射到 `[data-split]`，规则体不动，外观不变。
  至此库内不再有任何组件发出 `data-bordered`，该属性名进入退役清单。

  **tabs 默认变体改为 `line`。** `variant` 未提供时 root 落 `data-variant="line"`（此前不发属性，皮肤基础规则按
  segment 绘制）。默认外观从「浅色标签带 + 浮起选中面」改为「透明标签带 + 底部指示条 + 品牌字色」；原默认外观写
  `variant="segment"` 取得。皮肤基础规则改为 line 取值（Web Components 升级前无 `data-variant` 的一帧与默认一致），
  `segment` 与 `card` 块补齐原来靠基础规则继承的私有槽（触发器描边、选中描边、选中字色），显式写这两档的外观逐值不变。
  指示条不再对「无 `data-variant`」的根隐藏，只对 `segment` / `card` 隐藏。示例 `tabs/03-variant` 改为展示 segment。

  **text-field 清空钮改走 field-inset ghost 档，标签字号不随档。** connect 在 clear-trigger 上补投影
  `data-xh-action-variant="ghost"`；皮肤删除自写的 `--xh-action-bg-rest/-hover/-pressed` 取值（原悬停
  `--xh-bg-subtle-hover`、按下 `--xh-bg-subtle-active` 属淡底承载阶梯），改由家族 ghost 档给：字段底是 canvas，
  清空钮悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）；使用者槽 `--xh-text-field-action-bg`
  /`-bg-hover`/`-bg-active` 保留为覆盖入口，缺省指向家族档值。label 的私有 `--xh-_text-field-label-font-size` 删除，
  `--xh-text-field-label-font-size` 缺省改为 `--xh-text-label-size`：sm 档标签由 13px 升为 14px、lg 档由 16px 降为
  14px，md 不变。control 上补映射 `--xh-field-glyph-size`，`--xh-text-field-icon-size` 使用者槽在视觉盒内重新生效
  （此前被家族 chrome 的 `--xh-icon-size` 覆盖）；清空钮内字形改按 field-inset 档取 `--xh-_action-profile-glyph-size`。

  **color-field 清空钮改走 field-inset ghost 档，标签字号不随档。** connect 在 clear-trigger 上补投影
  `data-xh-action-variant="ghost"`；皮肤不再自写 200/300 的淡底阶梯，清空钮悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200），使用者槽 `--xh-color-field-action-bg`/`-bg-hover`/`-bg-active` 保留为覆盖入口。
  label 的私有 `--xh-_color-field-label-font-size` 删除，`--xh-color-field-label-font-size` 缺省改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。control 补映射 `--xh-field-glyph-size`，
  `--xh-color-field-icon-size` 在视觉盒内重新生效；清空钮内字形按 field-inset 档取 `--xh-_action-profile-glyph-size`。

  **number-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，加减钮改为 field-inset 正方盒。**
  connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省
  `outline`），input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
  prefix / suffix 投影 `data-xh-field-affix`，increment / decrement 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `always` + size。皮肤删除 control 自画盒与五态、input / affix 自写重置、三档
  variant 块与 `--xh-_number-field-*` 形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带
  `--xh-elevation-raised` 落影（字段家族不消费 raised）；focus 与 invalid 时底色保持 canvas（原聚焦换
  `--xh-bg-subtle` 底）；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；加减钮由「占满控件高度、
  圆角 0、悬停透明、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，
  compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
  粗指针下不再放大真实按钮盒与控件最小高度，改由家族伪元素外扩 44px 命中区，control 不再 `overflow: hidden`；
  输入与动作组之间的半高分隔线改画在减钮的 `background-image` 上（`::after` 让给粗指针热区），RTL 由
  `[dir='rtl']` 换边，forced-colors 用 `ButtonText` 重画。label 的 `--xh-number-field-label-font-size` 缺省改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。公开覆盖槽退役：`--xh-number-field-touch-target-size`
  （家族热区不读组件槽）、`--xh-number-field-control-bg-focus`、`--xh-number-field-control-bg-invalid`（家族聚焦与
  无效态不换底）；新增 `--xh-number-field-control-fg`、`--xh-number-field-trigger-radius`；
  `--xh-number-field-trigger-bg-active` 改指向家族按压桥接槽，`--xh-number-field-trigger-divider-h` 改按钮高的
  百分比解析（缺省仍 50%）。

  **password-input 接入 Field Chrome 与 Action Control，默认去 raised 落影，无 control 结构不再画盒。**
  connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省
  `outline`），input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
  visibility-trigger 投影 `data-xh-action-control` + `field-inset` + `ghost` + `always` + size。皮肤删除 control
  自画盒与五态、独立 input 自画盒与五态、四条 autofill、三档 variant 块、tone 语气块与 `--xh-_password-input-*`
  形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；不写
  `control` 时输入框与按钮是独立元素，不再绘制描边、底与落影的外壳；自动填充由家族用 `--xh-bg-canvas` 实体底
  与 `--xh-fg-default` 前景重绘，不再按形态 / 只读 / 禁用派生；切换钮由「`--xh-control-action-size` 方盒、control
  圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 /
  md 32 / lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+
  0.97 按压，粗指针命中区由家族伪元素外扩 44px；切换钮占 Tab 位，control 内仍保留自己的焦点环以区分两个停靠点。
  输入与切换钮之间的半高分隔线改画在切换钮的 `background-image` 上（`::after` 让给粗指针热区），贴在靠输入的
  那一侧、长度按钮高的 50% 解析，RTL 由 `[dir='rtl']` 换边，forced-colors 用 `CanvasText` / `GrayText` 重画。
  label 的 `--xh-password-input-label-font-size` 缺省改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。
  公开覆盖槽退役（独立 input 不再画盒）：`--xh-password-input-input-bg`、`-input-bg-disabled`、`-input-bg-hover`、
  `-input-bg-readonly`、`-input-border`、`-input-border-focus`、`-input-border-hover`、`-input-border-invalid`、
  `-input-h`、`-input-min-w`、`-input-px`、`-input-radius`、`-input-shadow`；新增 `--xh-password-input-control-fg`。

  **pin-input 每格接入 Field Chrome，默认去 raised 落影，焦点边不随 tone。** connect 在每一格 input 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；格子自身就是视觉盒，
  不投影 `data-xh-field-input`（否则家族会重置格子的边框）。皮肤删除格子自画的描边、底、圆角、落影、悬停与
  invalid / readonly / disabled 面、三档 variant 块与 `--xh-_pin-input-box-*` 形态私有槽，改为向家族桥接槽映射
  （`--xh-pin-input-box-*` 使用者槽全部保留）；自动填充仍由皮肤自写（家族规则命不中），但不再叠加落影。默认
  外观变化：outline 档格子不再带 `--xh-elevation-raised` 落影；当前格与聚焦格的描边一律
  `--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；
  填满态品牌描边不变。label 的 `--xh-pin-input-label-font-size` 缺省改为 `--xh-text-label-size`（sm 13px → 14px、
  lg 16px → 14px）。

  **date-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，段位前景改
  淡底前景。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、
  缺省 `outline`）；段位是 div 而非原生输入，不投影 `data-xh-field-input`；clear-trigger 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
  invalid / readonly / disabled 五态、三档 variant 块与 `--xh-_date-field-control-*` 形态私有槽，改为向家族桥接槽映射
  （`--xh-date-field-control-*` 使用者槽全部保留，`--xh-date-field-control-shadow` 缺省改为 `none`）。默认外观变化：
  outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`（subtle / ghost
  的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled 描边由家族落 `--xh-border-default`；盒上的指针改为
  `default`（段位靠键盘编辑，不是文本光标）。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停
  `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 /
  lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
  粗指针命中区由家族伪元素外扩 44px；使用者槽 `--xh-date-field-action-bg`/`-bg-hover`/`-bg-active`/`-action-radius`
  保留为覆盖入口，`--xh-date-field-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。当前段反白的
  前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`（淡底前景一律 on-brand-subtle）。label 的私有
  `--xh-_date-field-label-font-size` 删除，`--xh-date-field-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。

  **time-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，段位前景改
  淡底前景。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、
  缺省 `outline`）；段位是 div 而非原生输入，不投影 `data-xh-field-input`；clear-trigger 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
  invalid / readonly / disabled 五态、三档 variant 块与 `--xh-_time-field-control-*` 形态私有槽，改为向家族桥接槽映射
  （`--xh-time-field-control-*` 使用者槽全部保留，`--xh-time-field-control-shadow` 缺省改为 `none`）。默认外观变化：
  outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`（subtle / ghost
  的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled 描边由家族落 `--xh-border-default`；盒上的指针改为
  `default`。段位悬停底由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载阶梯）；当前段反白的前景由
  `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停
  `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 /
  lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
  粗指针命中区由家族伪元素外扩 44px；使用者槽 `--xh-time-field-action-bg`/`-bg-hover`/`-bg-active`/`-action-radius`
  保留为覆盖入口，`--xh-time-field-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。label 的私有
  `--xh-_time-field-label-font-size` 删除，`--xh-time-field-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。

  **editable 接入 Field Chrome 与 Action Control，默认去 raised 落影，三颗动作钮改为 field-inset 正方盒。** connect
  在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）与
  `data-readonly`，input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
  edit / submit / cancel 三颗钮投影 `data-xh-action-control` + `field-inset` + `ghost` + `always` + size。皮肤删除
  control 自画盒与悬停 / 聚焦 / invalid / readonly / disabled 五态、input 自写重置 / 五态 / 两条 autofill、三档
  variant 块与 `--xh-_editable-control-*` 形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带
  `--xh-elevation-raised` 落影；聚焦与 invalid 不再换底（此前聚焦底 `--xh-bg-subtle`）；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`；disabled 描边由 `--xh-border-subtle` 改为家族的 `--xh-border-default`；
  control 不再 `overflow: hidden`（家族粗指针热区伪元素会被它裁掉）。三颗钮由「占满控件高度、圆角 0、悬停透明、
  按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，compact 依令牌）、inset
  圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针下不再放大真实按钮盒与
  控件最小高度，改由家族伪元素外扩 44px 命中区；动作组与内容段之间的半高分隔线改画在编辑钮 / 确认钮的
  `background-image` 上（`::after` 让给粗指针热区），RTL 由 `[dir='rtl']` 换边，forced-colors 用 `ButtonText` 重画。
  label 的私有 `--xh-_editable-label-font-size` 删除，`--xh-editable-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。公开覆盖槽退役：`--xh-editable-touch-target-size`（家族热区不读组件槽）、
  `--xh-editable-control-bg-focus`、`--xh-editable-control-bg-invalid`（家族聚焦与无效态不换底）、`--xh-editable-input-h`
  （盒内 input 由家族撑满控件高度）；新增 `--xh-editable-control-fg`、`--xh-editable-control-px`（缺省 0）、
  `--xh-editable-trigger-radius`；`--xh-editable-trigger-bg` / `-bg-hover` / `-bg-active` / `-bg-disabled` 改指向家族
  ghost 档桥接槽。

  **tags-input 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，键盘走到的
  标签改为当前项淡底。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` /
  `data-xh-field-layout="multi-tag"` / `data-variant`（与 root 同源、缺省 `outline`），input 上投影
  `data-xh-field-input`（布局落在 control 上，不重复投影），clear-trigger 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
  invalid / readonly / disabled 五态、input 自写重置 / 两条 autofill、三档 variant 块与 `--xh-_tags-input-control-*`
  形态私有槽，改为向家族桥接槽映射（`--xh-tags-input-control-*` 使用者槽保留，`--xh-tags-input-control-shadow`
  缺省改为 `none`）。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled
  描边由家族落 `--xh-border-default`；纵向内衬由 `--xh-space-0_5` 改为家族 multi-tag 布局的 `--xh-space-1`，
  **公开覆盖槽 `--xh-tags-input-control-py` 退役**（纵向内衬由家族布局给，不再读组件槽）；新增
  `--xh-tags-input-input-fg`。键盘走到的标签（`data-highlighted`）由品牌实心 `--xh-bg-brand` + `--xh-fg-on-brand`
  改为当前项淡底 `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle`（写了 `tone` 时取 `--xh-_tone-subtle` /
  `--xh-_tone-fg`），删除钮字色随之换成淡底前景；就地编辑框的焦点环改直接取 `--xh-ring-focus`，invalid 时
  `--xh-ring-invalid`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 `--xh-bg-subtle-hover`（200）、
  按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，compact 依令牌）、inset
  圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针命中区由家族伪元素外扩
  44px；`--xh-tags-input-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。label 的私有
  `--xh-_tags-input-label-font-size` 删除，`--xh-tags-input-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。

  **mention 输入框接入 Field Chrome，默认去 raised 落影；候选行接入 Collection Item，补上按下面。** connect 在
  input 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-xh-field-layout="single-line"` / `data-variant`
  （与 root 同源、缺省 `outline`）与 `data-readonly`；输入框自身就是视觉盒，不投影 `data-xh-field-input`。item 投影
  `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context="overlay"`，item-text 投影
  `data-xh-collection-slot="text"`。皮肤删除 input 自画盒与悬停 / 聚焦 / invalid / readonly / disabled 五态、三档
  variant 块与 `--xh-_mention-input-*` 形态私有槽，改为向家族桥接槽映射（`--xh-mention-input-*` 使用者槽保留，
  `--xh-mention-input-shadow` 缺省改为 `none`）；自动填充仍由皮肤自写（家族按 input 角色给的规则命不中），不再叠
  落影。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再
  随 `tone`；disabled 描边由家族落 `--xh-border-default`。候选行删除自写的网格 / 内衬 / 圆角 / 字色 / 高亮底 / 禁用
  色，改为映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长
  （此前零 `:active` 面）；新增 `--xh-mention-item-bg-pressed` 覆盖槽。候选面加 `overscroll-behavior: contain`；三端
  自绘条改传 `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的 `--xh-mention-label-font-size` 缺省由随档的
  `--xh-_mention-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **combobox 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，`data-multiline` 视觉钩子与
  `--xh-combobox-control-py` 槽退役。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` /
  `data-variant`（与 root 同源、缺省 `outline`）；input 投影 `data-xh-field-input` 与 `data-xh-field-layout`
  （单行 `single-line`、textarea 宿主 `textarea`），旧 `data-multiline` 属性不再产出，自定义皮肤改读布局值，不提供
  双写兼容。trigger（展开钮，`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）
  投影 field-inset ghost 档；item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text 与
  item-indicator 各投影 `data-xh-collection-slot`。皮肤删除 control 自画盒与悬停 / 聚焦 / invalid / readonly /
  disabled 五态、三档 variant 块与 `--xh-_combobox-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-combobox-control-*`
  使用者槽保留，`--xh-combobox-control-shadow` 缺省改为 `none`）；多行宿主的 `padding-block` 由家族 textarea 布局给
  （写在 textarea 自身），`--xh-combobox-control-py` 槽删除。input 删除自写重置、占位与两条 autofill，改映射
  `--xh-field-input-*` / `--xh-field-placeholder-fg` / `--xh-field-autofill-*`，新增 `--xh-combobox-input-fg` 覆盖槽。
  默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随
  `tone`；disabled 描边由家族落 `--xh-border-default`。展开钮与清空钮由「`--xh-control-action-size` 方盒、control
  圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒
  （sm 24 / md 32 / lg 36px）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97
  按压，粗指针命中区由家族伪元素外扩；`--xh-combobox-action-radius` 缺省由 `--xh-shape-control` 改为
  `--xh-shape-inset`。候选行删除自写的排布 / 内衬 / 圆角 / 字色 / 高亮底 / 禁用色，改为映射家族桥接槽：悬停与高亮
  `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面）；新增
  `--xh-combobox-item-bg-pressed` 与 `--xh-combobox-item-check-fg` 覆盖槽（旧 `--xh-combobox-item-indicator-fg`
  留在兜底位）；对号显隐由家族按 `aria-selected` 给。候选面加 `overscroll-behavior: contain`；三端自绘条改传
  `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的 `--xh-combobox-label-font-size` 缺省由随档的
  `--xh-_combobox-label-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **select 接入 Field Chrome 与 Action Control，默认去 raised 落影，列表接自绘条。** connect 在 control 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger 是撑满盒的
  按钮，不投影 `data-xh-field-input`；clear-trigger 投影 field-inset ghost 档（`display="has-value"` +
  `data-xh-action-has-value`）。皮肤删除 control 自画盒与悬停 / invalid / 聚焦 / readonly / disabled 五态、三档 variant
  块与 `--xh-_select-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-select-control-*` 使用者槽保留，
  `--xh-select-control-shadow` 缺省改为 `none`，盒上指针 `pointer`）。默认外观变化：不写 variant 时描边由透明改为
  `--xh-border-control`（与 outline 档逐值相同），不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`；disabled 描边由家族落 `--xh-border-default`。清空钮由
  「`--xh-control-action-size` 方盒、control 圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`
  （300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针命中区由家族伪元素外扩；`--xh-select-action-radius` 缺省由
  `--xh-shape-control` 改为 `--xh-shape-inset`。list 三端接入自绘条（壳 positioner、浮层 4px 档）并加
  `overscroll-behavior: contain`；Vue / React 的 select 上下文新增 `controlRef` / `listRef`，层分支由 `[trigger]`
  改为 `[control, positioner]`（点清空钮与按住条子都算层内交互）。label 的 `--xh-select-label-font-size` 缺省由
  随档的 `--xh-_select-label-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **tree-select 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，
  `--xh-tree-select-item-selected-font-weight` 改名 `--xh-tree-select-item-font-weight-selected`。** connect 在
  control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
  clear-trigger 投影 field-inset ghost 档（`display="has-value"` + `data-xh-action-has-value`）；叶子 item 与分支
  branch-control 都投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text / branch-text 投影
  `data-xh-collection-slot="text"`，item-indicator 投影 `"indicator"`，branch-trigger / branch-indicator 投影
  `"prefix"`。皮肤删除 control 自画盒与五态、三档 variant 块与 `--xh-_tree-select-border/-bg/-shadow/-ring` 形态私有
  槽，改为映射家族桥接槽（`--xh-tree-select-control-*` 使用者槽保留，`--xh-tree-select-control-shadow` 缺省改为
  `none`，盒上指针 `pointer`）。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`；disabled 描边由家族落 `--xh-border-default`。清空钮由
  「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300」改为 field-inset 档正方盒、inset 圆角、
  悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压；`--xh-tree-select-action-radius`
  缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。树行删除自写的排布 / 高亮底 / 选中字色字重 / 禁用色，改为
  映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长
  （此前零 `:active` 面）；叶子的层级缩进由 `padding-inline-start` 改为家族网格首列的占位伪元素（文字起点不变）；
  新增 `--xh-tree-select-item-bg-pressed` 与 `--xh-tree-select-item-check-fg` 覆盖槽（旧
  `--xh-tree-select-item-indicator-fg` 留在兜底位）；分支行的选中对号与半选横线仍按 `data-selected` /
  `data-indeterminate` 显形；懒分支取数失败（`data-error`）的行面映射回常态，不引入家族告警面，该行仍可激活
  （Enter / 点行重试），悬停与键盘高亮 100、按下 200 与键盘焦点环由皮肤在家族解算点上接回。content 加
  `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的
  `--xh-tree-select-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、
  lg 16px → 14px）。

  **cascader 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，
  `--xh-cascader-item-selected-font-weight` 改名 `--xh-cascader-item-font-weight-selected`。** connect 在 control
  上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
  clear-trigger 投影 field-inset ghost 档（`display="has-value"` + `data-xh-action-has-value`）；列内 item 与搜索
  search-item 都投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text 投影
  `data-xh-collection-slot="text"`，item-indicator 投影 `"indicator"`。皮肤删除 control 自画盒与五态、三档 variant
  块与 `--xh-_cascader-border/-bg/-shadow/-ring` 形态私有槽，改为映射家族桥接槽（`--xh-cascader-control-*`
  使用者槽保留，`--xh-cascader-control-shadow` 缺省改为 `none`，盒上指针 `pointer`）。默认外观变化：outline 档
  不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；disabled 描边由
  家族落 `--xh-border-default`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300」改为
  field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97
  按压；`--xh-cascader-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。列内条目删除自写的
  排布 / 高亮底 / 展开路径底 / 选中字色字重 / 禁用色，改为映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）、
  展开路径 `--xh-cascader-item-bg-active` 缺省 `--xh-bg-subtle`（与悬停同档）不变，新增按下
  `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面）；分支箭头落在家族网格的 suffix 列；新增
  `--xh-cascader-item-bg-pressed` 与 `--xh-cascader-item-check-fg` 覆盖槽（旧 `--xh-cascader-item-indicator-fg`
  留在兜底位）。搜索候选没有正文部件，行保持块级排版、对号仍在末端预留轨内绝对定位，状态面同走家族。
  content / column / search-list 加 `overscroll-behavior: contain`；content 横向自绘条改传 `size: 'sm'`
  （浮层 4px 档）；每一列与搜索列表各自接一路贴层（`anchor: 'layer'`）的自绘竖条，条子节点紧跟在该列 /
  列表之后、贴其行内末端，列的原生细条随之隐藏，列间分隔线改按 `column ~ column` 取后续列；content 上声明
  `--xh-scrollbar-track-bg: transparent`。label 的 `--xh-cascader-label-font-size` 缺省由随档的私有槽改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **date-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  `--xh-date-picker-content-highlight` / `--xh-date-picker-content-backdrop` 槽退役。** connect 在 control 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（日历钮，
  `display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost 档；
  confirm-trigger 投影 Action Control `profile="text"` / `variant="solid"`（面板内唯一主要动作，固定 sm 档）；preset
  与 time-item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与五态、
  三档 variant 块与 `--xh-_date-picker-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-date-picker-control-*`
  使用者槽保留，`--xh-date-picker-control-shadow` 缺省改为 `none`，盒上指针 `default`）。默认外观变化：outline 档
  描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，
  不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由家族落 `--xh-border-default`；段位反白前景由
  `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。日历钮与清空钮由「`--xh-control-action-size` 方盒、control 圆角、
  悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；`--xh-date-picker-action-radius` 缺省由
  `--xh-shape-control` 改为 `--xh-shape-inset`。确认钮的品牌实心、悬停 / 按下 / 按压 / 焦点环改由家族 solid 档给，
  `--xh-date-picker-confirm-trigger-shadow` 缺省由内高光改为 `none`。浮层 content 由「`--xh-border-subtle` 描边 +
  frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default` 描边 + `--xh-bg-surface` 底 +
  `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，`--xh-date-picker-content-highlight` /
  `--xh-date-picker-content-backdrop` 槽删除。time-item 选中面由「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 +
  medium 字重」改为透明底 + 末端对号、正文与字重保持 rest（§7.3 浮层瞬态集合）；preset 与 time-item 新增按下
  `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-date-picker-preset-bg-pressed` /
  `--xh-date-picker-time-item-bg-pressed` 覆盖槽。content / preset-group / time-column 加
  `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'` 并补横轴（皮肤 `overflow: auto` 两轴都滚）；preset-group
  （竖 + 横）与每一 time-column（竖）各自接一路贴层（`anchor: 'layer'`）的自绘条，条子节点紧跟在该列之后、贴其盒子，
  列的原生细条随之隐藏，content 上声明 `--xh-scrollbar-track-bg: transparent`，选项列与日历之间的空当改按
  `preset-group ~ calendar` 取。time-item 的行字色与字重改按值选择族同一套映射：新增
  `--xh-date-picker-time-item-fg`（rest 字色，缺省家族行字色 `--xh-material-frosted-fg`，各主题与 forced-colors 下
  与 `--xh-fg-default` 同值）与 `--xh-date-picker-time-item-font-weight-selected`（缺省 regular）覆盖槽。label 的
  `--xh-date-picker-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **date-range-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  `--xh-date-range-picker-content-highlight` / `--xh-date-range-picker-content-backdrop` 槽退役。** connect 在
  control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
  trigger（日历钮，`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影
  field-inset ghost 档；preset 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control
  自画盒与五态、三档 variant 块与 `--xh-_date-range-picker-control-*` 形态私有槽，改为映射家族桥接槽
  （`--xh-date-range-picker-control-*` 使用者槽保留，`--xh-date-range-picker-control-shadow` 缺省改为 `none`，盒上
  指针 `default`）。默认外观变化：outline 档描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised`
  落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由
  家族落 `--xh-border-default`；两组段位的反白前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。日历钮与清空钮
  由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、
  inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；
  `--xh-date-range-picker-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。浮层 content 由
  「`--xh-border-subtle` 描边 + frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default` 描边 +
  `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，
  `--xh-date-range-picker-content-highlight` / `--xh-date-range-picker-content-backdrop` 槽删除。preset 新增按下
  `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-date-range-picker-preset-bg-pressed`
  覆盖槽。content 与 preset-group 加 `overscroll-behavior: contain`；三端 content 自绘条改传 `size: 'sm'` 并补横轴
  （皮肤 `overflow: auto` 两轴都滚）；preset-group 接一路贴层（`anchor: 'layer'`，竖 + 横）的自绘条，条子节点紧跟
  在该列之后、贴其盒子，列的原生细条随之隐藏，content 上声明 `--xh-scrollbar-track-bg: transparent`，选项列与
  日历之间的空当改按 `preset-group ~ calendar` 取；Vue 的 `XhDateRangePickerPresetGroup` 因此以片段作根，直通属性由
  组件自己接住落到列节点。label 的 `--xh-date-range-picker-label-font-size` 缺省由随档的私有槽改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **time-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  时间格选中只留对号，`--xh-time-picker-content-highlight` / `-backdrop` 与 `--xh-time-picker-item-bg-checked` /
  `-bg-checked-hover` / `-fg-checked` / `-weight-checked` 槽退役。** connect 在 control 上投影 `data-xh-field-chrome`
  / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（展开钮，`display="always"`）与
  clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost 档；preset 与 item 投影
  `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与五态、三档 variant 块与
  `--xh-_time-picker-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-time-picker-control-*` 使用者槽保留，
  `--xh-time-picker-control-shadow` 缺省改为 `none`，盒上指针 `default`）。默认外观变化：outline 档描边由透明改为
  `--xh-border-control`，不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随
  `tone`；打开中的 control 不再另画焦点环；disabled 描边由家族落 `--xh-border-default`；段位反白前景由
  `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`，段位悬停底由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
  （100，canvas 承载）。展开钮与清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300、打开中
  300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+
  0.97 按压，打开中与悬停同档；`--xh-time-picker-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。
  浮层 content 由「`--xh-border-subtle` 描边 + frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default`
  描边 + `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，
  `--xh-time-picker-content-highlight` / `--xh-time-picker-content-backdrop` 槽删除。item 选中面由
  「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 + medium 字重」改为透明底 + 末端对号、正文与字重保持 rest
  （§7.3 浮层瞬态集合）：`--xh-time-picker-item-bg-checked` / `-bg-checked-hover` / `-weight-checked` 槽删除，
  `--xh-time-picker-item-fg-checked` 改名为 `--xh-time-picker-item-fg-selected`（与值选择族同名），新增
  `--xh-time-picker-item-font-weight-selected`（缺省 regular）；item 的 rest 字色缺省由 `--xh-fg-default` 改为家族
  行字色 `--xh-material-frosted-fg`（各主题与 forced-colors 下同值）。preset 与 item 新增按下 `--xh-bg-subtle-hover`
  （200）与按压时长（此前零 `:active` 面），新增 `--xh-time-picker-preset-bg-pressed` / `--xh-time-picker-item-bg-pressed`
  覆盖槽。preset-group 与各 column 加 `overscroll-behavior: contain`，各自接一路贴层（`anchor: 'layer'`，竖）的
  自绘条：条子节点紧跟在该列之后、贴其盒子，列的原生细条随之隐藏，content 上声明
  `--xh-scrollbar-track-bg: transparent`，列与列之间的分隔线改按 `column ~ column` 取；Vue 的
  `XhTimePickerPresetGroup` / `XhTimePickerColumn` 因此以片段作根，直通属性由组件自己接住落到列节点。label 的
  `--xh-time-picker-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **time-range-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  时间格选中只留对号，`--xh-time-range-picker-content-highlight` / `-backdrop` 与 `--xh-time-range-picker-item-bg-checked`
  / `-bg-checked-hover` / `-fg-checked` / `-weight-checked` 槽退役。** 与 time-picker 同构：connect 在 control 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（展开钮，
  `display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost
  档；preset 与 item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与
  五态、三档 variant 块与 `--xh-_time-range-picker-control-*` 形态私有槽，改为映射家族桥接槽
  （`--xh-time-range-picker-control-*` 使用者槽保留，`--xh-time-range-picker-control-shadow` 缺省改为 `none`，盒上
  指针 `default`）。默认外观变化：outline 档描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised`
  落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由
  家族落 `--xh-border-default`；两组段位的反白前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`，段位悬停底由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）。展开钮与清空钮由「`--xh-control-action-size` 方盒、
  control 圆角、悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、
  按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；`--xh-time-range-picker-action-radius` 缺省由
  `--xh-shape-control` 改为 `--xh-shape-inset`。浮层 content 由「`--xh-border-subtle` 描边 + frosted 落影 + 透明
  顶光」改为 floating 三件套：`--xh-border-default` 描边 + `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，
  顶光伪元素与 backdrop 两行删除，`--xh-time-range-picker-content-highlight` / `--xh-time-range-picker-content-backdrop`
  槽删除。item 选中面由「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 + medium 字重」改为透明底 + 末端对号、
  正文与字重保持 rest（§7.3 浮层瞬态集合）：`--xh-time-range-picker-item-bg-checked` / `-bg-checked-hover` /
  `-weight-checked` 槽删除，`--xh-time-range-picker-item-fg-checked` 改名为 `--xh-time-range-picker-item-fg-selected`
  （与值选择族同名），新增 `--xh-time-range-picker-item-font-weight-selected`（缺省 regular）；item 的 rest 字色缺省由
  `--xh-fg-default` 改为家族行字色 `--xh-material-frosted-fg`（各主题与 forced-colors 下同值）。preset 与 item 新增
  按下 `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-time-range-picker-preset-bg-pressed`
  / `--xh-time-range-picker-item-bg-pressed` 覆盖槽。content（横向）、preset-group 与各 column 加
  `overscroll-behavior: contain`；content 的横向自绘条三端接在浮层壳上（`size: 'sm'`，浮层壳记进层分支），
  preset-group 与各 column 各接一路贴层（`anchor: 'layer'`，竖）的自绘条：条子节点紧跟在该列之后、贴其盒子，列的
  原生细条随之隐藏，positioner 与 content 上声明 `--xh-scrollbar-track-bg: transparent`，列与列之间的分隔线改按
  `column ~ column` 取；Vue 的 `XhTimeRangePickerPresetGroup` / `XhTimeRangePickerColumn` 因此以片段作根，直通属性
  由组件自己接住落到列节点。label 的 `--xh-time-range-picker-label-font-size` 缺省由随档的私有槽改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **input-group 组壳改为字段描边式，去 raised 落影。** 组壳（root 的 `::before` 外轮廓）静息描边由 `--xh-border-subtle`
  改为 `--xh-border-control`、悬停由 `--xh-border-default` 改为 `--xh-border-control-hover`；`--xh-input-group-shadow`
  缺省由 `--xh-elevation-raised` 改为 `none`（槽保留）。`subtle` 档悬停浮出的描边由 `--xh-border-default` 改为
  `--xh-border-control`，`ghost` 档悬停同样浮出 `--xh-border-control`（此前 ghost 悬停边取基础规则的
  `--xh-border-default`）。子字段压平规则以 `[data-xh-field-chrome]` 为键，接入家族的字段在组内自动压平为透明，
  不另画一层。

  **prompt-input 接入 Field Chrome 与 Action Control，去 soft 材质与顶光 / 背景模糊，输入段改透明。** connect 在 root
  上投影 `data-xh-field-chrome` / `data-xh-field-size`（缺省 `md`，`data-variant` 已缺省 `outline`），input 投影
  `data-xh-field-input`（刻意不投影 `data-xh-field-layout`），submit-trigger 投影 Action Control `profile="text"` /
  `display="always"` / `size`，`variant` 按 loading 在 `solid`（发送，与 Button 缺省同为品牌实心）与 `subtle`（停止，
  中性淡底）间切换，并与原生 `disabled` 同步投影 `data-disabled`。皮肤删除 root 的 soft 材质私有槽、渐变顶光、
  backdrop 两行、自写 hover / focus-within / disabled 与三档 variant 块，改为映射家族桥接槽（`--xh-prompt-input-bg`
  / `-bg-hover` / `-bg-disabled` / `-border` / `-border-hover` / `-border-focus` / `-shadow` / `-radius` / `-p` /
  `-gap` / `-icon-size` 使用者槽保留为第一参数，`--xh-prompt-input-shadow` 缺省改为 `none`，`--xh-field-control-height`
  落 `auto` 随内容长高）。默认外观变化：root 由「M1 soft 底 + soft 描边 + 顶光 + 背景模糊 + soft 落影」（outline
  档已是 canvas + border-control）改为家族描边式，全部三档不再有落影与顶光；焦点描边一律 `--xh-border-control-focus`，
  不再随 `tone`；disabled 描边由家族落 `--xh-border-default`；生成中（`data-loading`）外框仍保持默认前景与文本光标。
  textarea 由「`--xh-material-soft-focus-surface` 实体阅读底 + `--xh-material-soft-fg` 字」改为透明底 + `--xh-fg-default`
  字（`--xh-prompt-input-input-fg` / `-input-font-size` / `-placeholder-fg` / `-input-autofill-bg` / `-input-autofill-fg`
  使用者槽保留，自动填充底缺省改为 `--xh-bg-canvas`）。发送钮的品牌实心 / 悬停 / 按下 / 0.97 按压 / 焦点环 / 禁用面
  改由家族 text solid 档给（`--xh-prompt-input-send-bg*` / `-send-fg` / `-send-bg-off` / `-stop-bg*` / `-stop-fg` /
  `-submit-px` / `-submit-radius` / `-submit-shadow` / `-submit-font-size` / `-submit-font-weight` 使用者槽保留），
  停止身份的悬停 / 按下由自写 200 / 300 改为家族 subtle 档 200 / 300。

  **field 的 control 接入 Field Chrome，去 raised 落影、加描边。** connect 在 control（作者自己的原生控件）上投影
  `data-xh-field-chrome` / `data-xh-field-size="md"` / `data-variant="outline"`（Field 没有 size / variant 轴，固定投这
  两档），控件自身即视觉盒。皮肤删除 control 自写的边、底、影、圆角、outline、transition 与 hover / focus-visible /
  invalid / disabled 四条规则，改为映射家族桥接槽：`--xh-field-control-h` / `-px` / `-bg` / `-bg-hover` / `-bg-disabled`
  / `-fg` / `-border` / `-border-hover` / `-border-focus` / `-border-invalid` / `-shadow` / `-radius` / `-font-size`
  使用者槽保留，新增 `--xh-field-control-bg-readonly`（只读底，缺省 `--xh-bg-subtle`）；`--xh-field-control-ring` 槽删除
  （焦点环一律公共 `--xh-ring-focus`）。默认外观变化：静息由「透明边 + `--xh-elevation-raised` 落影」改为
  `--xh-border-control` 描边 + `--xh-bg-canvas` 底 + 无影（`--xh-field-control-shadow` 缺省改为 `none`）；悬停描边由
  `--xh-border-default` 改为 `--xh-border-control-hover`；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；
  只读换 `--xh-bg-subtle` 底；禁用由家族落 `--xh-border-default` 描边 + `--xh-bg-subtle` 底 + `--xh-fg-disabled`。
  Vue / React 的 `XhFieldControl` 把属性合并到自带解剖的子节点（库内薄封装或写了 `data-scope` 的元素）时，与
  `data-scope` / `data-part` 一并剔除家族标记（`data-xh-*`）与 `data-variant`，封装根上不会再套一层字段外壳、作者在
  封装上写的形态也不被盖掉；`useFieldControl` 同样只交出接线属性。Web Components 的 `<xh-field>` 把 control 属性直接
  打在作者标出的节点上：`control` 应标在真控件（`<input>` / `<textarea>` / `<select>`）上，标在包裹层上会在真控件外
  多出一层外壳。

  **form 的提交 / 重置钮接入 Action Control，错误摘要去 raised 落影。** connect 在 submit-trigger 上投影
  `data-xh-action-control` / `profile="text"` / `variant="solid"`（表单提交是主要动作，与 Button 缺省同为品牌实心）/
  `display="always"` / `size="md"`，reset-trigger 同样投影但 `variant="outline"`（非 Button 的触发器缺省中性描边）。
  皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active / 缩放 / disabled 与提交钮的品牌底 / 高光规则，
  改为映射家族桥接槽（`--xh-form-trigger-h` / `-px` / `-radius` / `-font-size` / `-bg` / `-bg-hover` / `-bg-active` /
  `-bg-disabled` / `-fg` / `-border` / `-border-hover` / `-border-disabled` 与 `--xh-form-submit-bg` / `-bg-hover` /
  `-bg-active` / `-fg` / `-border` / `-border-hover` / `-border-active` / `-shadow` 使用者槽保留为第一参数）。默认外观
  变化：重置钮由「`--xh-bg-subtle` 淡底 + `--xh-border-control` 描边、悬停 200 / 按下 300」改为透明底 +
  `--xh-border-control` 描边、悬停 `--xh-bg-subtle`（100）/ 按下 `--xh-bg-subtle-hover`（200）；提交钮的品牌实心、
  悬停 / 按下、0.97 按压、currentColor 焦点环与顶边内高光改由家族给，禁用面由家族落 `--xh-bg-subtle` 底 +
  `--xh-fg-disabled`（`--xh-form-trigger-bg-disabled` / `-border-disabled` 仍可覆盖）；error-summary 的
  `--xh-form-summary-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态反馈面只靠描边分层）。

  **fieldset 的组标题归集合标题角色。** legend 的 `--xh-fieldset-legend-fg` 缺省由 `--xh-fg-default` 改为
  `--xh-fg-muted`（§6.4 集合标题：`--xh-fg-muted`，与组 `--xh-space-2`，字号字重同字段标签）；无效 / 禁用 /
  必填星、说明与错误文案不变。

  **field-array 的四颗把手接入 Action Control，阶梯改 100 / 200。** connect 在 item-delete-trigger /
  move-up-trigger / move-down-trigger 上投影 `data-xh-action-control` / `profile="icon"` / `variant="ghost"` /
  `display="always"` / `size="xs"`（24px 正方盒，与此前 `--xh-control-action-size` 同尺寸），add-trigger 投影
  `profile="text"` / `variant="outline"` / `display="always"` / `size="md"`。皮肤删除四颗钮自写的盒、底、边、字体、
  transition、hover / active / 缩放 / `[aria-disabled]` 规则，改为映射家族桥接槽（`--xh-field-array-trigger-size` /
  `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-fg` / `-fg-hover` / `-font-size`、`--xh-field-array-item-delete-fg-hover`、
  `--xh-field-array-add-height` / `-px` / `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-fg` / `-border` /
  `-border-hover` / `-border-disabled` / `-font-size`、`--xh-field-array-action-gap` 使用者槽保留为第一参数）；
  add-trigger 保留 `border-style: dashed`。默认外观变化：三颗行内把手与新增钮的悬停由 `--xh-bg-subtle-hover`（200）
  改为 `--xh-bg-subtle`（100）、按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）（白底承载
  阶梯）；`--xh-field-array-icon-size` 由 root 上的 `--xh-glyph-size-text`（随文 1em）改为各钮按档取
  `--xh-_action-profile-glyph-size`（行内把手 16px、新增钮 20px），只在四颗钮上生效；粗指针下四颗钮由家族
  外扩 44px 热区；禁用面由家族按 `data-disabled` 给（透明底 + `--xh-fg-disabled`，新增钮描边 `--xh-border-subtle`）。

  **card 的 outline 卡面补 `--xh-border-default` 描边，subtle 去落影，标题与说明按 Surface 排版档。**
  `--xh-card-border` 缺省由 `transparent` 改为 `--xh-border-default`（Card 是唯一登记 raised 的静态面，raised
  必带描边，边界由描边承担、落影只是抬起的加成）；subtle 档改为 `--xh-bg-subtle` 淡底 + 透明占位边 + 无影
  （`--xh-card-shadow` 在 subtle 与 ghost 两档的缺省都是 `none`），ghost 档补透明占位边，三档几何一致。
  `--xh-card-title-font-weight` 缺省由 `--xh-font-weight-medium` 改为 `--xh-font-weight-semibold`（Surface 标题
  14/600）；`--xh-card-description-font-size` 缺省由 `--xh-text-label-size` 改为 `--xh-text-secondary-size`、
  `--xh-card-description-leading` 由 `--xh-text-body-leading` 改为 `--xh-leading-normal`（说明 13/fg-muted）；
  `--xh-card-p` 缺省由 `--xh-space-4` 改为 `--xh-surface-pad-lg`（同为 16px，Surface 内衬只走 `--xh-surface-*`）。

  **alert 改中性描边面去 raised 落影，关闭钮接入 Action Control，指示符统一 md 档。** 根面的
  `--xh-alert-border` 缺省由 `transparent` 改为 `--xh-border-default`、`--xh-alert-bg` 缺省直接落 `--xh-bg-surface`、
  `--xh-alert-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态反馈面只靠描边分层，私有槽
  `--xh-_alert-surface` / `--xh-_alert-edge` 删除）；`--xh-alert-icon-size` 在 root 上的缺省由 `--xh-glyph-size-sm`
  改为 `--xh-glyph-size-md`（Feedback 指示符统一 md）。connect 在 close-trigger 上投影 `data-xh-action-control` /
  `profile="icon"` / `variant="ghost"` / `display="always"` / `size="sm"`；皮肤删除关闭钮自写的盒、底、字体、
  transition、hover / active / 缩放 / disabled 规则与粗指针外扩伪元素，改为映射家族桥接槽（`--xh-alert-close-size` /
  `-radius` / `-bg-hover` / `-bg-active` / `-fg` / `-fg-hover` 使用者槽保留为第一参数，`--xh-alert-icon-size` 在关闭钮上
  按 sm 档取 16px）。默认外观变化：关闭钮悬停由 `--xh-_tone-subtle-hover`（20%）改为 `--xh-_tone-subtle`（12%）、按下由
  `--xh-_tone-subtle-active`（28%）改为 `--xh-_tone-subtle-hover`（20%）（白底承载阶梯，随语气）；粗指针热区与禁用面
  （透明底 + `--xh-fg-disabled`）改由家族给。

  **toast 改 sheet 三件套，两颗钮接入 Action Control，指示符统一 md 档，标题与说明按 Feedback 排版档。**
  `--xh-toast-border` 缺省由 `transparent` 改为 `--xh-material-elevated-border`、`--xh-toast-bg` 由 `--xh-bg-surface`
  改为 `--xh-material-elevated-bg`、`--xh-toast-fg` 由 `--xh-fg-default` 改为 `--xh-material-elevated-fg`、
  `--xh-toast-shadow` 由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`（sheet 面必有 1px 描边，亮暗两档
  同源；亮色 `--xh-material-elevated-bg` 为 oklch 0.99 非纯白，与页面白底有极浅色差，属 sheet 三件套既定取值，与 dialog
  同）。`--xh-toast-icon-size` 在 root 上的缺省由 `--xh-glyph-size-sm` 改为 `--xh-glyph-size-md`；
  `--xh-toast-title-font-weight` 缺省 medium → semibold，`--xh-toast-description-font-size` 缺省 `--xh-text-label-size` →
  `--xh-text-secondary-size`、`--xh-toast-description-leading` `--xh-text-body-leading` → `--xh-leading-normal`。
  connect 在 action-trigger 上投影 `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` /
  `size="sm"`，close-trigger 投影 `profile="icon"` / `variant="ghost"` / `display="always"` / `size="xs"`（24px，与此前
  `--xh-control-action-size` 同尺寸；显隐仍由皮肤按 root 悬停 / 焦点只压 opacity，不走家族的 hover-focus——那一档用
  visibility 收起，占 Tab 位的叉会被键盘漏掉）。皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active /
  缩放 / disabled 规则与粗指针外扩伪元素，改为映射家族桥接槽（`--xh-toast-action-h` / `-px` / `-radius` / `-bg` /
  `-bg-hover` / `-bg-active` / `-fg` / `-border` / `-font-weight` 与 `--xh-toast-close-size` / `-radius` / `-bg` /
  `-bg-hover` / `-bg-active` / `-border` / `-fg` / `-fg-hover` 使用者槽保留为第一参数）。默认外观变化：操作钮由
  「`--xh-bg-subtle` 淡底 + `--xh-border-default` 描边、悬停 200 / 按下 300、字号随条子 14px」改为透明底 +
  `--xh-border-control` 描边、悬停 `--xh-bg-subtle`（100）+ `--xh-border-control-hover` / 按下 `--xh-bg-subtle-hover`
  （200）、字号取 sm 档 `--xh-control-font-sm`，底 / 边 / 字钉在中性面上不随 `tone`；关闭钮由「`--xh-bg-subtle` 淡底 +
  `--xh-border-default` 描边、悬停 200 / 按下 300」改为静息透明无边、悬停 `--xh-_tone-subtle`（12%，随语气）/ 按下
  `--xh-_tone-subtle-hover`（20%）；粗指针热区与禁用面改由家族给；compact 密度下关闭钮固定 24px（此前 20px）。

  **notification 卡片改 sheet 三件套，两颗钮接入 Action Control，卡片内图标统一 md 档。**
  `--xh-notification-item-border` 缺省由 `--xh-border-default` 改为 `--xh-material-elevated-border`、`--xh-notification-item-bg`
  由 `--xh-bg-surface-raised` 改为 `--xh-material-elevated-bg`、`--xh-notification-item-fg` 由 `--xh-fg-default` 改为
  `--xh-material-elevated-fg`、`--xh-notification-item-shadow` 由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`
  （与 toast 同一套 sheet 三件套）；`--xh-notification-icon-size` 在 item 上的缺省由 `--xh-control-indicator-size` 改为
  `--xh-glyph-size-md`（Feedback 指示符统一 md；叉与操作钮的字形改按各自按钮档取值）。connect 在 item-action-trigger 上
  投影 `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` / `size="sm"`，
  item-close-trigger 投影 `profile="icon"` / `variant="ghost"` / `display="always"` / `size="sm"`（32px，钉在卡片角上的
  叉与浮层角落关闭钮同一档）。皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active / 缩放 / disabled 规则与
  粗指针外扩伪元素，改为映射家族桥接槽（`--xh-notification-action-h` / `-px` / `-radius` / `-bg` / `-bg-hover` /
  `-bg-active` / `-fg` / `-border` / `-font-weight` 与 `--xh-notification-close-size` / `-radius` / `-bg-hover` /
  `-bg-active` / `-fg` / `-fg-hover` 使用者槽保留为第一参数）。默认外观变化：操作钮由「`--xh-bg-subtle` 淡底 +
  `--xh-border-default` 描边、悬停 200 / 按下 300、字号随卡片 14px」改为透明底 + `--xh-border-control` 描边、悬停
  `--xh-bg-subtle`（100）+ `--xh-border-control-hover` / 按下 `--xh-bg-subtle-hover`（200）、字号取 sm 档
  `--xh-control-font-sm`，底 / 边 / 字钉在中性面上不随 `tone`；叉的悬停由 `--xh-bg-subtle-hover`（200）改为
  `--xh-_tone-subtle`（12%，随语气）/ 按下由 `--xh-bg-subtle-active`（300）改为 `--xh-_tone-subtle-hover`（20%）；
  粗指针热区与禁用面改由家族给。

  **empty-state 的标题与说明按 Surface 排版档。** md 档标题由 `--xh-control-font-lg`（16px）改为 `--xh-text-label-size`
  （14/600，Surface / Feedback 标题档；真源 §6.4 只有 14/600 与页面级 heading-3 两档），sm 档不再另给字号（同 14），
  lg 档仍为 `--xh-text-heading-3-size`；`--xh-empty-state-description-font-size` 缺省由 `--xh-text-body-size` 改为
  `--xh-text-secondary-size`、`--xh-empty-state-description-leading` 由 `--xh-text-body-leading` 改为 `--xh-leading-normal`
  （说明 13/fg-muted）。根面无壳，不画边、底与影，未变。

  **code-view 根面去 raised 落影，折叠条接入 Action Control disclosure-trigger 档。** `--xh-code-view-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = `--xh-border-default` 描边 + `--xh-bg-surface` + 无影，边与底未变）。
  connect 在 fold-trigger 上投影 `data-xh-action-control` / `profile="disclosure-trigger"` / `variant="ghost"` /
  `display="always"` / `size`（随 `size`，缺省 md）。皮肤删除折叠条自写的盒、底、字体、transition、hover 与整条缩放规则，
  改为映射家族桥接槽（`--xh-code-view-px` / `--xh-code-view-fold-py` / `--xh-code-view-header-font-size` /
  `--xh-code-view-fold-fg` / `--xh-code-view-fold-bg-hover` / `--xh-code-view-header-border` 使用者槽保留为第一参数，
  圆角归零贴住卡边，顶边分隔线经家族四个状态的边色槽映射保持在场）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）
  改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为只换面到 `--xh-bg-subtle-hover`（200）；折叠条的
  最小高度取 md 档 `--xh-control-h-md`（36px，此前随内容约 31px），字与内衬不变。

  **diff-view 根面改 border-default 描边去 raised 落影，折叠格按钮接入 Action Control disclosure-trigger 档，图标改 md 档。**
  `--xh-diff-view-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-diff-view-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影，`--xh-border-subtle` 不作根面外边）；
  头部下边、行号列右边与并排接缝的内部分隔线从 `--xh-diff-view-border` 拆出新槽 `--xh-diff-view-divider`（缺省
  `--xh-border-subtle`），此前一把 `--xh-diff-view-border` 同时改根边与分隔线的作者需再写 `--xh-diff-view-divider`。
  `--xh-diff-view-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md` 并随 `data-size` 换档
  （sm 16 / md 20 / lg 24；截断提示条的警告字形随之）。connect 在 gap-trigger 上投影 `data-xh-action-control` /
  `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`，缺省 md）；皮肤删除折叠格按钮
  自写的盒、底、字体、transition、hover 与整条缩放规则，改为映射家族桥接槽（`--xh-diff-view-px` / `--xh-diff-view-font-size` /
  `--xh-diff-view-gap-fg` / `--xh-diff-view-gap-bg-hover` 使用者槽保留为第一参数，高度锚在 `--xh-diff-view-line-height` 上
  与相邻代码行同高），gap 行作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：按下由整条缩放 0.97
  改为只换面到 `--xh-bg-subtle-active`（300，淡底承载），悬停仍为 `--xh-bg-subtle-hover`（200）。

  **log 根面改 surface 底，回底钮接入 Action Control floating 档并改 frosted 四件套。** `--xh-log-bg` 缺省由
  `--xh-bg-subtle` 改为 `--xh-bg-surface`（描边与淡底互斥：`--xh-border-default` 描边 + surface 底 + 无影，与
  code-view / diff-view / json-viewer 同走 solid），root 新增 `--xh-log-shadow` 槽（缺省 `none`）。connect 在
  scroll-to-end-trigger 上投影 `data-xh-action-control` / `profile="floating"` / `variant="ghost"` / `display="always"` /
  `size="xs"`（`--xh-control-box-sm` 32px，与此前 `--xh-control-h-sm` 同尺寸）。皮肤删除回底钮自写的盒、边、底、影、
  transition、hover 与缩放规则，改为映射家族桥接槽（`--xh-log-scroll-to-end-trigger-size` / `-radius` / `-bg` / `-bg-hover` /
  `-border` / `-shadow` / `-fg` 使用者槽保留为第一参数）；材质由「`--xh-bg-surface-raised` + `--xh-border-default` +
  `--xh-elevation-raised`」改为角落浮钮族的 frosted 四件套（`--xh-material-frosted-bg / -border / -shadow / -backdrop`，
  字色 `--xh-material-frosted-fg`；raised 只给 Card 与可抬起部件）。`--xh-log-icon-size` 从 root 移到回底钮上，缺省由
  `--xh-glyph-size-text` 改为家族 xs 档字形 `--xh-_action-profile-glyph-size`（16px）。默认外观变化：悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）并保留
  0.97 缩放；粗指针热区与禁用面改由家族给。

  **json-viewer 三端不再渲染自绘滚动条，分支行补按压换面，图标改 md 档。** 树档 / 原文档容器是页内结构容器
  （与 Tree 同类），真源 §6.6 把自绘条只给浮层与定高小列表：Vue / React / Web Components 删除 `useScrollbars` /
  `ScrollbarsController` 接线，root 下不再挂 `[data-scope="scrollbar"]` 节点、`tree` / `text` 不再带 `data-xh-scrollbar`，
  两档容器走 reset 层的原生细条（依赖 `[data-scope][data-part]` 节点或作者容器的 `data-xh-scroll`）；皮肤删除 root 上的
  `--xh-scrollbar-track-bg: transparent` 死声明与 `position: relative`。以「root 下有条子」为前提的 DOM 查询与样式需改。
  面的写法收敛：`tree` / `text` / `empty` 三块面直接写 `--xh-json-viewer-border` → `--xh-border-default`、
  `--xh-json-viewer-bg` → `--xh-bg-surface`，新增 `--xh-json-viewer-shadow`（缺省 `none`），subtle / ghost 两档改由
  root 的 `data-variant` 向三块面下发透明边与底（此前经私有槽 `--xh-_json-viewer-border` / `-bg` 中转，外观逐值不变）。
  分支行 `branch-control` 新增按下换面 `--xh-json-viewer-row-bg-active`（缺省 `--xh-bg-subtle-hover`，白底承载 hover 100 →
  pressed 200，集合行不允许零反馈）。`--xh-json-viewer-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`
  并随 `data-size` 换档（sm 16 / md 20 / lg 24；展开箭头的兜底字形随之）。

  **tool-call 根面改 border-default 描边去 raised 落影，开关接入 Action Control disclosure-trigger 档，退场改 exit 曲线。**
  `--xh-tool-call-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-tool-call-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；subtle 档随之无影；语气色条叠写时
  以 `0 0 0 transparent` 零影占位）；审批位与详情区的内部分隔线从 `--xh-tool-call-border` 拆出新槽 `--xh-tool-call-divider`
  （缺省 `--xh-border-subtle`），此前一把 `--xh-tool-call-border` 同时改根边与分隔线的作者需再写 `--xh-tool-call-divider`。
  connect 在 trigger 上投影 `data-xh-action-control` / `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` /
  `size`（随 `size`，缺省 md）；皮肤删除开关自写的盒、底、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
  （`--xh-tool-call-px` / `-py` / `-font-size` / `-trigger-gap` / `-trigger-fg` / `-trigger-bg-hover` / `-trigger-radius` 使用者槽
  保留为第一参数，内衬沿用卡片档位），subtle 档根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。
  `--xh-tool-call-icon-size` 在 root 上的缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`，开关内的指示符改按家族档字形取值。
  详情区收起动画的曲线由 `--xh-motion-ease-enter-strong` 改为 `--xh-motion-ease-exit`（§9.4 退场 exit 档）。默认外观变化：
  outline 档悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为只换面到
  `--xh-bg-subtle-hover`（200）；subtle 档悬停 200 / 按下 300；开关最小高度取 md 档 `--xh-control-h-md`（36px，此前随内容约
  33px），行内文字行高改 `--xh-leading-none`；粗指针热区与禁用面改由家族给。

  **reasoning 淡底面去 raised 落影，outline 档改 border-default 描边，开关接入 Action Control disclosure-trigger 档。**
  `--xh-reasoning-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（缺省 subtle 淡底面无影；语气色条叠写时以
  `0 0 0 transparent` 零影占位），outline 档 `--xh-reasoning-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`
  （静态内容面 = 描边 + `--xh-bg-surface` + 无影）。connect 在 trigger 上投影 `data-xh-action-control` /
  `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`；不写时取 sm，与皮肤缺省字号
  `--xh-control-font-sm` 同档）；皮肤删除开关自写的盒、底、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
  （`--xh-reasoning-px` / `-py` / `-font-size` / `-trigger-gap` / `-trigger-fg` / `-trigger-bg-hover` / `-trigger-radius`
  使用者槽保留为第一参数，内衬沿用本组件档位），缺省 subtle 根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`
  （200 → 300），outline / ghost 档改回白底阶梯（100 → 200）。`--xh-reasoning-icon-size` 在 root 上的缺省由
  `--xh-glyph-size-text` 改为按 `data-size` 换档（缺省与 sm 档 `--xh-glyph-size-sm` 16px、md 20px、lg 24px，此前 1em），
  与开关的家族档位同步。
  默认外观变化：按下由整条缩放 0.97 改为只换面到 `--xh-bg-subtle-active`（300）；开关最小高度取 sm 档 `--xh-control-h-sm`
  （32px），行内文字行高改 `--xh-leading-none`；开关字色三态停在 `--xh-fg-muted`；粗指针热区与禁用面改由家族给。

  **approval 根面改 border-default 描边去 raised 落影，授权行接入 Action Control row 档，两颗钮接入 text 档。**
  `--xh-approval-border` 缺省由 `--xh-border-strong` 改为 `--xh-border-default`（语气色边只在作者打了 `tone` 时染上，
  拆成独立的 `[data-tone]` 规则）、落定后 `--xh-approval-border-settled` 缺省由 `--xh-border-subtle` 改为
  `--xh-border-default`、`--xh-approval-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 +
  `--xh-bg-surface` + 无影；subtle 档随之无影）。connect 在 item 上投影 `data-xh-action-control` / `profile="row"` /
  `variant="ghost"` / `display="always"` / `size`，在 approve-trigger 上投影 `profile="text"` / `variant="solid"`、在
  deny-trigger 上投影 `profile="text"` / `variant="outline"`（档位随 `size`，缺省 md）；两颗钮新增 `data-disabled`
  （落定时两颗都投，必选项没勾满时只投批准；判定在途仍只走 `data-loading` + `aria-disabled`，家族给在途面）。
  皮肤删除授权行与两颗钮自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
  （`--xh-approval-item-*`、`--xh-approval-action-*`、`--xh-approval-approve-*`、`--xh-approval-deny-*` 使用者槽保留为
  第一参数）；subtle 档根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：授权行悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整行缩放 0.97 改为只换面到
  `--xh-bg-subtle-hover`（200），行最小高度取 row 档 `--xh-control-h-md`（36px，此前随内容约 29px），行内文字行高由 UA
  `normal` 改为 `--xh-leading-normal`（皮肤在 item 上写正文行高，不吃家族单行档）；批准钮按下同时换底到 `--xh-bg-brand-active`、
  必选项没勾满时的置灰底 `--xh-approval-approve-bg-off`
  缺省由 `--xh-bg-muted` 改为 `--xh-bg-subtle`；拒绝钮悬停由 200 改为 100、按下换面 200 并浮出 `--xh-border-control-hover`
  描边，落定后的描边 `--xh-approval-deny-border-off` 缺省由 `--xh-border-default` 改为 `--xh-border-subtle`（家族 outline
  禁用面）。标题字重 `--xh-approval-title-font-weight` 缺省由 `--xh-text-label-weight`（500）改为
  `--xh-font-weight-semibold`（600），说明行高由 `--xh-text-body-leading` 改为 `--xh-leading-normal`。connect 在
  approve-trigger 上与根同值投影 `data-tone`（与 Button 同构）：家族的深色 solid 规则只看触发器自身的 `data-tone`，此前
  暗色下批准钮的实心面会落回品牌色，现在亮暗两态都随 `tone` 取语气色。
  `--xh-approval-icon-size` 缺省由 `--xh-glyph-size-text` 改为按 `data-size` 换档（sm 16 / md 20 / lg 24），勾选记号里的勾
  改按指示符盒比例量（0.75 盒宽），新增 `--xh-approval-indicator-icon-size` 覆盖它；在途圆环的圆角由 `--xh-shape-pill`
  改为 `--xh-shape-circle`（正方盒取圆）。

  **question-flow 根面改 border-default 描边去 raised 落影，选项行接入 Action Control row 档，四颗钮接入 icon / text 档。**
  `--xh-question-flow-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-question-flow-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；subtle 档随之无影），三档形态改由
  `data-variant` 规则直接写底与边（此前经私有槽中转，outline / subtle / ghost 观感逐值不变）。connect 在 item 上投影
  `data-xh-action-control` / `profile="row"` / `variant="ghost"`，在 prev-trigger / next-trigger 上投影 `profile="icon"` /
  `variant="ghost"` / `size="xs"`（24px 方格），在 skip-trigger 上投影 `profile="text"` / `variant="ghost"`、在 submit-trigger 上
  投影 `profile="text"` / `variant="solid"`（档位随 `size`，缺省 md）；四颗钮新增 `data-disabled`（与原生 `disabled` 同步，
  家族按它给禁用面）。皮肤删除选项行与四颗钮自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则，改为映射家族
  桥接槽（`--xh-question-flow-item-*`、`-step-*`、`-action-*`、`-skip-*`、`-submit-*` 使用者槽保留为第一参数）；subtle 档
  根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：选项行、翻页钮与跳过钮悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）——选项行
  只换面不再缩放，行最小高度取 row 档 `--xh-control-h-md`（36px，此前随内容约 29px），行内文字行高仍是
  `--xh-leading-normal`（皮肤在 item 上写回正文行高，不吃家族单行档）；
  翻页钮字号取 xs 档 `--xh-control-font-sm`（箭头字形仍按根上的 `--xh-question-flow-icon-size` 量）；提交钮答不动时的置灰底
  `--xh-question-flow-submit-bg-off` 缺省由 `--xh-bg-muted` 改为 `--xh-bg-subtle`。题干字重 `--xh-question-flow-prompt-font-weight`
  缺省由 `--xh-text-label-weight`（500）改为 `--xh-font-weight-semibold`（600）。单选记号盒的圆角
  `--xh-question-flow-indicator-radius-single` 缺省由 `--xh-shape-pill` 改为 `--xh-shape-circle`（正方盒取圆）；记号盒里的勾
  `--xh-question-flow-indicator-icon-size` 缺省由 `--xh-glyph-size-text` 改为按盒比例量（0.75 盒宽）。connect 在
  submit-trigger 上与根同值投影 `data-tone`（与 Button 同构）：家族的深色 solid 规则只看触发器自身的 `data-tone`，此前
  暗色下提交钮的实心面会落回品牌色，现在亮暗两态都随 `tone` 取语气色。

  **message-feed 回底钮接入 Action Control floating 档并改 frosted 四件套，粘底视口补稳定滚动槽。** connect 在
  scroll-to-end-trigger 上投影 `data-xh-action-control` / `profile="floating"` / `variant="ghost"` / `display="always"` /
  `size="xs"`（`--xh-control-box-sm` 32px 正方盒，与此前 `--xh-control-h-sm` 同尺寸）；皮肤删除回底钮自写的盒、边、底、影、
  transition、hover / 缩放规则，改为映射家族桥接槽（`--xh-message-feed-scroll-to-end-trigger-*` 使用者槽保留为第一参数），
  材质由 raised 三件（`--xh-border-default` + `--xh-bg-surface-raised` + `--xh-elevation-raised`）改为 frosted 四件套
  （`--xh-material-frosted-bg` / `-border` / `-shadow` / `-backdrop`，字色 `--xh-material-frosted-fg`；角落浮钮族与
  log / back-top 同档）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下
  缩放并换面到 `--xh-bg-subtle-hover`（200）；`--xh-message-feed-icon-size` 从 root 移到回底钮，缺省由 `--xh-glyph-size-text`
  改为家族 xs 档字形 `--xh-_action-profile-glyph-size`（16px）。viewport 新增 `scrollbar-gutter: stable`（带 `data-xh-scrollbar`
  的容器除外）：流式视口的内容高度一直在变，原生条出现与消失时不再推动文字，右侧常留一条条宽的空道。

  **accordion outline 根面补 border-default 描边，标题栏接入 Action Control disclosure-trigger 档；collapsible 触发器同档接入。**
  accordion 的 outline 档新增使用者槽 `--xh-accordion-border`（缺省 `--xh-border-default`，1px 描边；此前只有底无边），
  与条与条之间的分隔线槽 `--xh-accordion-item-border` 各管各的；subtle 档补一圈透明边位（三档几何一致）并作为淡底承载面
  下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。两家的 connect 在 trigger 上投影 `data-xh-action-control` /
  `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`，缺省 md）；皮肤删除触发器自写的
  盒、底、边、字体、transition、hover / 缩放 / disabled 规则与三档私有槽，改为映射家族桥接槽（`--xh-accordion-trigger-*` /
  `--xh-collapsible-trigger-*` 使用者槽保留为第一参数，三档 gap / 高度 / 内衬 / 字号取家族 disclosure-trigger 档，与迁移前逐值
  相同）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为
  只换面到 `--xh-bg-subtle-hover`（200）；展开态的标题栏不再排除悬停换面（open 与家族 hover 同档中性，字色仍走
  `-fg-open`）；粗指针热区与禁用面改由家族给。指示器转向由 `--xh-motion-duration-micro` 改为 `--xh-motion-duration-enter`
  （与正文展开同档）；`--xh-accordion-icon-size` / `--xh-collapsible-icon-size` 在 root 上的缺省由 `--xh-glyph-size-text` 改为
  `--xh-glyph-size-md`，触发器内的指示符改按家族档字形取值（sm 16 / md 20 / lg 24）。

  **toolbar outline 改 border-default 描边去 raised 落影，条目接入 Action Control text 档，选中字色改淡底前景。**
  outline 档由「边宽 0 + `--xh-elevation-raised` 落影」改为 `--xh-border-default` 1px 描边 + `--xh-bg-surface` + 无影
  （`--xh-toolbar-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`，静态内容面 = 描边 + surface 底 + 无影）；subtle 档
  补一圈透明边位（与 outline 同一几何）并作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。
  connect 在 item 上投影 `data-xh-action-control` / `profile="text"` / `variant="ghost"` / `display="always"` / `size`（随
  `size`，缺省 md）；皮肤删除条目自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则与分组内的重复三态规则，
  改为映射家族桥接槽（`--xh-toolbar-item-*` 使用者槽保留为第一参数），分组作为淡底承载面下发 host 槽。`aria-pressed`
  选中态的字色 `--xh-toolbar-item-fg-pressed` 缺省由 `--xh-fg-brand-strong` 改为 `--xh-fg-on-brand-subtle`（无滑块开关 =
  品牌淡底 + 淡底前景，§7.3），新增 `--xh-toolbar-item-bg-pressed-active`（缺省 `--xh-bg-brand-subtle-active`）作为选中
  段的按下面（12% → 20% → 28%）。默认外观变化：ghost 根上散落的条目悬停由 `--xh-bg-subtle-hover`（200）改为
  `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）并缩放 0.97；分组内条目悬停 200 / 按下 300
  且按下同样缩放（此前分组内不缩放）；条目改为定高盒（`block-size` 取档位，此前 `min-block-size`），
  边由 0 改为 1px 透明边位（与 Button 同构，border-box 下总高不变）。

  **page-header outline 描边改 border-default，subtle 补透明边位，标题字重走标题档令牌。** `--xh-page-header-border`
  在 outline 根面上的缺省由 `--xh-border-subtle` 改为 `--xh-border-default`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；
  ghost 贴底 `split` 那条分隔线仍缺省 `--xh-border-subtle`）；subtle 档补一圈透明边位，与 outline 同一几何。
  `--xh-page-header-title-font-weight` 缺省由字重原语 `--xh-font-weight-semibold` 改为标题档令牌 `--xh-text-heading-3-weight`
  （同为 600，观感不变）。

  **layout 覆盖档侧栏改 sheet 三件套，折叠把手接入 Action Control text 档。** `data-presentation="sheet"` 的侧栏由只有
  `--xh-elevation-sheet` 落影改为 sheet 三件套：`--xh-layout-sider-bg` 在这一档的缺省由 `--xh-bg-subtle` 改为
  `--xh-material-elevated-bg`、`--xh-layout-sider-shadow` 缺省由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`，
  并在贴着内容那一侧新描一条 `--xh-layout-border`（这一档缺省 `--xh-material-elevated-border`；`placement="end"` 时描在
  行首侧）；占位档的侧栏不变。connect 在 sider-trigger 上投影 `data-xh-action-control` / `profile="text"` / `variant="ghost"` /
  `display="always"` / `size="sm"`（把手是一枚装着文字的小档按钮，几何与此前的 `--xh-control-h-sm` / `--xh-control-px-sm` 逐值
  相同）；皮肤删除把手自写的盒、底、边、字体、transition、hover / 缩放规则，改为映射家族桥接槽（`--xh-layout-sider-trigger-*`
  使用者槽保留为第一参数）；占位档侧栏作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`，覆盖档侧栏换成 elevated
  白底后把阶梯写回 100 / 200。默认外观变化：把手摆在顶栏等白底上时悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
  （100），按下换面到 `--xh-bg-subtle-hover`（200）；摆进占位档侧栏时仍是 200 / 300，摆进覆盖档侧栏时同白底 100 / 200；
  把手字号由 `--xh-text-secondary-size` 改为家族 sm 档 `--xh-control-font-sm`（同为 13px）。

  **descriptions subtle 补透明边位，标签与取值的间距改 space-2。** subtle 档补一圈 `--xh-stroke-thin` 透明边位，与
  outline 同一边宽（淡底面 = `--xh-bg-subtle` + 透明边位 + 无影）；outline 档仍是 `--xh-border-default` 描边 +
  `--xh-bg-surface` + 无影，网格线 `--xh-border-subtle` 只作内部分隔。标签是每一格的集合标题（14 / 500 /
  `--xh-fg-muted`），叠着排时与取值的间距 `--xh-descriptions-pair-gap` 缺省由 `--xh-space-1`（4px）改为
  `--xh-space-2`（8px，§6.4 集合标题与集合的间距）；sm 档此前继承 md 的 4px，现同为 8px，lg 档不变。标签在左时的
  列间距不变。

  **list subtle 补透明边位，淡底档里的 hoverable 条目悬停抬到 200。** subtle 档补一圈 `--xh-stroke-thin` 透明边位，与
  outline 同一几何（淡底面 = `--xh-bg-subtle` + 透明边位 + 无影）；outline 档仍是 `--xh-border-default` 描边 +
  `--xh-bg-surface` + 无影，`split` 分隔线 `--xh-border-subtle` 只作内部分隔。`--xh-list-item-bg-hover` 的缺省改经根上的
  私有槽 `--xh-_list-item-bg-hover` 下发：白底 / ghost / outline 仍是 `--xh-bg-subtle`（100），subtle 档的根把它抬到
  `--xh-bg-subtle-hover`（200，§7.2 坐在淡底上的条目按承载面取阶梯；此前与淡底同色，悬停看不出来）。皮肤体积
  基线 list.css 3517 → 3883 字节：涨在 subtle 档的透明边位、根上的悬停面私有槽与淡底档对它的覆盖。

  **kbd 字号改次级标注档 12px。** `--xh-kbd-font-size` 缺省由 `--xh-text-label-size`（14px）改为
  `--xh-text-caption-size`（12px，§6.4 快捷键属次级标注）；键帽高 `--xh-space-6`（24px）、最小宽 24px、control 4px 圆角、
  subtle 材质（透明边位 + `--xh-bg-subtle` + 无影）与 `light` 档的透明底都不变，单行行高 `--xh-leading-none` 随字号缩到
  12px，键帽内的字在 24px 盒里仍居中。

  **tag 改胶囊。** `--xh-tag-radius` 缺省由 `--xh-shape-control`（4px）改为 `--xh-shape-pill`（§6.3 pill 只给状态 chip 与
  一维对象，Tag 是状态 chip），四种形态与三档尺寸同一身份；关闭钮 `--xh-tag-close-radius` 仍是 `--xh-shape-inset`
  （随文标记档的 16px 正方盒，与 checkbox 系方框同档，内层圆角不越过外层胶囊）。缺省 subtle 档仍是 soft 材质
  （`--xh-material-soft-border / -bg / -shadow`，§8 登记消费者），outline 描边 `--xh-border-default`、solid / ghost 不变。
  波及复用 tag 皮肤的 select 多选标签、tags-input 条目与 tag-group 成员：它们的默认圆角一并由 4px 变为胶囊；以
  `--xh-tag-radius` 覆盖过的作者不受影响。

  **statistic 涨跌箭头改按字形档取尺。** root 新增使用者槽 `--xh-statistic-icon-size`（映射 `--xh-icon-size`），缺省
  `--xh-glyph-size-sm`（16px，跟着前后缀那一档 14px 字走），lg 档抬到 `--xh-glyph-size-md`（20px）；趋势箭头的兜底字形
  与作者塞进 trend 的图标读同一把尺（此前箭头 `--xh-glyph-size-text` 随文 1em ≈ 14px，作者图标落 `--xh-icon-size` 缺省
  20px，两者不一致）。标签 / 数值 / 前后缀 / 涨跌的字号、字重与颜色不变，无壳无形状。

  **timeline 说明改说明档 13px。** `--xh-timeline-description-font-size` 缺省由 `--xh-text-body-size`（14px）改为
  `--xh-text-secondary-size`（13px，§6.4 说明 / helper 档：13 / `--xh-fg-muted` / `--xh-leading-normal`），字色与行高本就在档上；
  条目标题仍是 `--xh-text-label-weight` 500（它是每条事件的标题，不是 Surface 面板标题），label / time 的 12px 次级标注、
  圆点 circle 与连线 pill 的身份、tone 圆点的 `--xh-fg-muted` 兜底都不变。

  **badge 圆点档改取 circle。** `indicator[data-dot]` 新增使用者槽 `--xh-badge-dot-radius`，缺省 `--xh-shape-circle`
  （§6.3 宽高同槽的正方盒必须取 circle，不得用胶囊冒充圆）；此前圆点档沿用计数档的 `--xh-badge-radius`（`--xh-shape-pill`
  9999px），在 6 / 8 / 10px 的正方盒上画出的仍是圆，像素不变，但作者按圆点覆盖圆角时只能改动计数档那一槽。计数档的
  胶囊身份、`--xh-badge-ring` 切边环、13 / 500 字形与三档尺寸都不变。check-shape-scale 身份表新增
  `badge:indicator[data-dot]=circle`。

  **timer 起停钮接入 Action Control text outline 档，去抬升，阶梯改 100 / 200。** connect 在 control 上投影
  `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` / `size`（随 `size` 取
  sm / md / lg，缺省 `md`，钮高 32 / 36 / 40px 与此前一致）。皮肤 `@import` 家族 action-control，删除起停钮自写的盒、底、
  边、transition、hover / active / 缩放 / focus-visible / `:disabled` 规则与粗指针 `::before` 外扩，改为映射家族桥接槽
  （`--xh-timer-control-h` / `-px` / `-gap` / `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-bg-disabled` / `-fg` /
  `-border` / `-border-hover` / `-border-focus` / `-border-disabled` / `-shadow-hover` / `-shadow-active` 使用者槽全部保留为
  第一参数），只留 `--xh-text-label-size` 字号与 `--xh-text-label-weight` 字重；新增使用者槽 `--xh-timer-icon-size`
  （映射 `--xh-icon-size`，缺省按档取 `--xh-_action-profile-glyph-size` 16 / 20 / 24px，作者塞进钮里的图标随档取尺）。
  默认外观变化：静息底由 `--xh-bg-surface` 改为透明（描边仍 `--xh-border-control`、control 圆角、无影）；悬停由
  `--xh-bg-subtle-hover`（200）+ `--xh-elevation-raised` 抬升改为 `--xh-bg-subtle`（100）+ `--xh-border-control-hover`、
  不抬升（§8 raised 只给 Card 与可抬起部件）；按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）
  （白底承载阶梯），0.97 按压与 120 / 200ms 节奏不变；焦点边不再随 `--xh-_tone`，由家族给中性边 + `--xh-ring-focus`
  焦点环（§7.2.5）；粗指针热区由家族外扩到 44px；禁用面由家族按 `data-disabled` 给（透明底 + `--xh-fg-disabled` +
  `--xh-border-subtle`），作者直接写原生 `disabled` 的钮不再有专属禁用面（Headless 未定义该状态）。

  **tabs 按下改为只换面，segment 档选中标签改白色抬起面并补描边，line 档悬停 / 按下改字色三步。** 标签是铺开的一段
  （§9.2 Tabs trigger 归行级），皮肤删除 `:active` 的 0.97 缩放与 transition 里的 `scale` 项，按下改为按形态换面：`card`
  坐在画布上，悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）；`segment`
  坐在淡底轨道里，悬停 200、按下 `--xh-bg-subtle-active`（300），标签带作为淡底承载面向内下发 `--xh-action-host-bg-hover / -pressed`；选中标签不叠按下面（§7.3 有滑块开关无叠加态）。新增使用者槽 `--xh-tabs-trigger-bg-pressed`（缺省按形态取
  私有槽）与 `--xh-tabs-trigger-fg-pressed`（line 档，缺省 `--xh-_tabs-accent-text`）。`line` 档无底，悬停与按下只换前景：
  `--xh-tabs-trigger-fg-hover` 缺省由 `--xh-_tabs-accent-text` 改为 `--xh-fg-default`，静息 muted → 悬停 default → 按下与
  当前页 `--xh-fg-brand-strong` 三步各一档（此前悬停即品牌字色，按住与悬停无可见差别）；当前页补 `--xh-font-weight-medium`
  字重（新增槽 `--xh-tabs-trigger-font-weight-active`，与静息 `--xh-text-label-weight` 同为 500，像素不变）。`segment` 档
  （§7.3 有滑块开关）：选中标签的底由 `--xh-bg-surface` 改为 `--xh-bg-surface-raised`，补 `--xh-stroke-thin` 的
  `--xh-border-default` 描边（未选中标签带同宽透明边位，盒高不变），`--xh-elevation-raised` 影保留；标签带补一圈
  `--xh-stroke-thin solid transparent` 占位边（§8.3 淡底面 = subtle 底 + 透明边位 + 无影，`--xh-tabs-list-border` 在这一档也
  可覆盖它），标签带的盒因此各向外扩 1px。高对比档补按下通道（Highlight / HighlightText）。皮肤体积基线随三条新增规则
  （segment 标签带、segment 选中面、line 按下前景）重落。

  **segmented 轨道改透明占位边，滑块补 border-default 描边，按下改只换面。** 轨道是淡底面（§8.3）：`--xh-segmented-border`
  缺省由 `--xh-border-subtle` 改为 `transparent`（`--xh-bg-subtle` 底 + 同宽透明边位 + 无影，`--xh-border-subtle` 只作内部
  分隔），轨道作为淡底承载面向内下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。滑块 indicator 是有滑块开关的白色
  抬起面（§7.3）：底由 `--xh-bg-surface` 改为 `--xh-bg-surface-raised`，新增 `--xh-stroke-thin` 的 `--xh-border-default`
  描边（新增使用者槽 `--xh-segmented-indicator-border`；`data-tone` 档描边与实心语气底同色），`--xh-elevation-raised` 影保留；
  描边吃进连接层量出的盒里，滑块与段仍是同一块矩形。段是轨道里铺开的一段（§9.2）：删除 `:active` 的 0.97 缩放与 transition
  里的 `scale` 项，未选中段按下改为换到 `--xh-bg-subtle-active`（300，新增使用者槽 `--xh-segmented-item-bg-pressed`），选中段
  不叠按下面（有滑块开关无叠加态）；悬停 `--xh-bg-subtle-hover`（200）不变。高对比档补按下通道（Highlight / HighlightText）。

  **toggle-group 段接入 Action Control text 档，选中改品牌淡底前景，阶梯按承载面分档。** connect 在 item 上投影
  `data-xh-action-control` / `profile="text"` / `display="always"` / `size`（随 `size`，缺省 md）/ `variant`（随 `variant`，
  缺省 subtle）；皮肤 `@import` 家族 action-control，删除段自写的盒、底、边、transition、hover / active / disabled 规则与粗指针
  `::after` 外扩，改为映射家族桥接槽（`--xh-toggle-group-item-*` 使用者槽全部保留为第一参数），`--xh-action-scale-pressed: none`
  保住共边接缝（按下只换面）。选中段是无滑块开关（§7.3）：`--xh-toggle-group-item-fg-on` 缺省由 `--xh-fg-brand` 改为
  `--xh-fg-on-brand-subtle`，subtle / outline / ghost 三档选中后的悬停与按下面由 `--xh-bg-brand-subtle` 改为
  `--xh-bg-brand-subtle-hover` / `-active`（12% → 20% → 28%，此前选中段悬停与按下不换面），solid 仍是品牌实心；solid 选中段的
  焦点环改经 `--xh-action-ring-color-focus-visible` 灌 currentColor。阶梯按承载面（§7.2）：缺省 subtle 档的段坐在自己的淡底
  上，悬停 200 → 按下 300 不变；outline / ghost 的段坐在画布上，悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
  （100）、按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）。段改为定高盒并带 `min-inline-size`
  （与 Button 同构，text 档最小宽等于档位高度）；禁用段的光标由家族给 `not-allowed`。

  **radio-group 圆圈补悬停描边与按下换底，集合标题字号不随档、间距改 space-2。** 整行是命中区、回执落在圆圈上（§9.2
  集合行不允许零反馈）：未选中且未校验失败的圆圈在整行悬停时描边升到 `--xh-border-control-hover`（新增使用者槽
  `--xh-radio-group-indicator-border-hover`），整行按下时圆圈换底到 `--xh-bg-subtle-hover`（200，白底承载，新增
  `--xh-radio-group-indicator-bg-pressed`），圆点与几何不动，禁用与只读的行不给回执，选中圈与失败圈保住各自的描边；高对比档
  按下把描边换成 Highlight。集合标题（§6.4）：`--xh-radio-group-label-font-size` 缺省由随档的 `--xh-control-font-*` 改为
  `--xh-text-label-size`（14px 不随 size），单行行高 `--xh-leading-none`，整组禁用时标题落 `--xh-fg-subtle`（新增
  `--xh-radio-group-label-fg-disabled`）；`--xh-radio-group-gap` 缺省由 `--xh-stack-gap-md`（16px）改为 `--xh-space-2`
  （8px），标题到集合与条目之间同为一档紧密关系。皮肤体积基线随新增的四条规则重落。

  **checkbox-group 删除 `variant`，方框改字段家族控制盒，按下补换底，集合标题间距与条目字号归位。** 破坏性：`variant`
  （`primary | secondary`）从 Headless `CheckboxGroupProps`、Vue / React props 与 `<xh-checkbox-group>` 的 `variant` attribute
  中删除，root 不再投影 `data-variant`；它只剩「收掉控制盒海拔」一件事，海拔退出后为空 API（未发布的
  checkbox-group-secondary-variant changeset 一并撤回；独立 Checkbox 的 `CheckboxVariant` 随其自身迁移处理）。方框是字段
  家族的控制盒（§8.3）：`--xh-checkbox-group-indicator-bg` 缺省由 `--xh-material-soft-bg` 改为 `--xh-bg-canvas`，删除顶光
  渐变、静息 `--xh-material-soft-shadow` 与悬停 `--xh-elevation-raised` 抬升（使用者槽 `--xh-checkbox-group-indicator-highlight`
  / `-shadow-hover` / `-shadow-pressed` / `-shadow-disabled` / `-shadow-readonly` 随之删除，`-shadow` 保留、缺省 `none`），悬停时
  未勾选方框描边由语气色改为 `--xh-border-control-hover`（勾中方框悬停不换描边）；按下保留 0.97 缩放并补换底：未勾选换到
  `--xh-bg-subtle-hover`（新增 `--xh-checkbox-group-indicator-bg-pressed`），勾中 / 半选换到 `--xh-_tone-active`（缺省
  `--xh-bg-brand-active`，新增 `--xh-checkbox-group-indicator-bg-checked-pressed`）；禁用面改 `--xh-border-default` +
  `--xh-bg-subtle` + `--xh-fg-disabled`（此前 `--xh-border-control` + `--xh-bg-muted`）。`--xh-checkbox-group-gap` 缺省由
  `--xh-stack-gap-md`（16px）改为 `--xh-space-2`（8px，§6.4 集合标题与集合）；条目与全选格文字改随 size 档
  （`--xh-checkbox-group-item-font-size` / `-select-all-trigger-font-size` 缺省由 `--xh-text-label-size` 改为
  `--xh-control-font-sm / md / lg`，与 checkbox 标签、radio-group 条目统一），全选格圆角由 `--xh-shape-control` 改为
  `--xh-shape-inset`（同值 4px，身份归位）；`--xh-icon-size` 缺省改按方框比例取字形（与 checkbox 同一把尺）。示例
  `checkbox-group/05-tone-size`（变体）改为 `05-size`（尺寸）。

  **checkbox 删除 `variant`，方框改字段家族控制盒，按下补换底，禁用改中性面。** 破坏性：`CheckboxVariant`（`primary | secondary`）类型与 `variant` prop 从 Headless `CheckboxSchema`、Vue / React props 与 `<xh-checkbox>` 的 `variant` attribute 中
  删除，root 不再投影 `data-variant`；它只剩「收掉控制盒海拔」一件事，海拔退出后为空 API（未发布的
  checkbox-secondary-variant changeset 一并撤回）。方框是字段家族的控制盒（§8.3）：
  `--xh-checkbox-bg` 缺省由 `--xh-material-soft-bg` 改为 `--xh-bg-canvas`，删除顶光渐变、静息 `--xh-material-soft-shadow` 与
  悬停 `--xh-elevation-raised` 抬升（使用者槽 `--xh-checkbox-highlight` / `-shadow-hover` / `-shadow-pressed` /
  `-shadow-disabled` / `-shadow-readonly` 随之删除，`-shadow` 保留、缺省 `none`），悬停时未勾选方框描边由语气色改为
  `--xh-border-control-hover`（勾中方框悬停不换描边）；按下保留 0.97 缩放并补换底：未勾选换到 `--xh-bg-subtle-hover`（新增
  `--xh-checkbox-bg-pressed`），勾中 / 半选换到 `--xh-_tone-active`（缺省 `--xh-bg-brand-active`，新增
  `--xh-checkbox-bg-checked-pressed`），按压选择器改 `:is(:active, [data-pressed])`；禁用不再只降 opacity，改为
  `--xh-border-default` 描边 + `--xh-bg-subtle` 底 + `--xh-fg-disabled` 字形（新增 `--xh-checkbox-bg-disabled` /
  `-border-disabled` / `-fg-disabled`），勾中的禁用方框同样退回中性面、勾由置灰色画出；禁用标签色
  `--xh-checkbox-label-fg-disabled` 缺省由 `--xh-fg-disabled` 改为 `--xh-fg-subtle`（§6.4 禁用标签统一）。标签文字保持随
  size 档取 `--xh-control-font-*`（与 checkbox-group 条目同一把尺）。示例 `checkbox/03-tone` 由变体改为语气六档。

  **switch 滑块改 raised 抬起面，按下补换底，禁用改中性面，标签字号随档。** 滑块是可拖起部件（§5.3，逐部件登记 raised）：
  `--xh-switch-thumb` 缺省由 `--xh-material-soft-bg` 改为 `--xh-bg-surface-raised`，`--xh-switch-thumb-border` 缺省由
  `--xh-material-soft-border` 改为 `--xh-border-default`，`--xh-switch-thumb-shadow` 缺省由 `--xh-material-soft-shadow` 改为
  `--xh-elevation-raised`，`--xh-switch-thumb-fg` 缺省改 `--xh-fg-default`；删除顶光渐变（`--xh-switch-thumb-highlight` 随之删除）
  与悬停抬升规则（静息即 raised，`--xh-switch-thumb-shadow-hover` 随之删除）。轨道是定尺控件（§9.1）：按下保留 0.97 缩放并补
  换底——未选中轨道静息已是 `--xh-bg-subtle-active`（300），中性阶梯无更深一档，按下缺省仍取轨道面（新增
  `--xh-switch-bg-pressed`，换面通道由滑块拉伸与压平投影承担），选中轨道换到 `--xh-_tone-active`（缺省 `--xh-bg-brand-active`，
  新增 `--xh-switch-bg-checked-pressed`），按压选择器改 `:is(:active, [data-pressed])`，高对比档按下把轨道 outline 换成
  Highlight。禁用不再只降 opacity：轨道改 `--xh-bg-subtle` 底 + `--xh-border-default` 内描边 + `--xh-fg-disabled` 前景（新增
  `--xh-switch-bg-disabled` / `-border-disabled` / `-fg-disabled`），滑块前景置灰（新增 `--xh-switch-thumb-fg-disabled`），
  选中的禁用轨道同样退回中性面、值由滑块位置读出。只读选中轨道 `--xh-switch-bg-checked-readonly` 缺省由 `--xh-bg-muted` 改为
  `--xh-bg-subtle-active`（与未选中轨道同一中性面，§7.2 交互态的底只从语义面派生）；焦点环改为除禁用外一律灌 currentColor。
  加载环圆角由 `--xh-shape-pill` 改为 `--xh-shape-circle`（正方盒取 circle，像素不变）。标签：
  `--xh-switch-label-font-size` 缺省由 `--xh-text-label-size` 改为随 size 档的 `--xh-control-font-sm / md / lg`（与 checkbox
  标签同形），新增 `--xh-switch-label-leading`（缺省 `--xh-leading-normal`，长文字可换行），禁用标签色
  `--xh-switch-label-fg-disabled` 缺省由 `--xh-fg-disabled` 改为 `--xh-fg-subtle`。

  **calendar-picker 今天改品牌环，格子与钮的阶梯按白底承载分档，按下补换底，年网格滚动链改 auto。** 今天退出品牌淡底
  （§7.3）：`--xh-calendar-picker-today-bg` 缺省由 `--xh-bg-brand-subtle` 改为 `transparent`，`--xh-calendar-picker-today-border`
  缺省由 `transparent` 改为 `--xh-fg-brand`（格子自带的 1px 透明边位画成品牌环），品牌字保留；今天的悬停不再另给品牌淡底
  （`--xh-calendar-picker-today-bg-hover` 删除），走普通格子的阶梯。格子、四颗翻页钮与标题钮坐在日历的白底上：悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100），按下保留 0.97 缩放并补换底到 `--xh-bg-subtle-hover`（200，新增
  `--xh-calendar-picker-cell-bg-pressed` / `-nav-bg-pressed` / `-heading-trigger-bg-pressed`），选中格按下由 `--xh-bg-brand-hover`
  改为 `--xh-bg-brand-active`（§7.3 格状当前 pressed），按压选择器改 `:is(:active, [data-pressed])`，高对比档按下把边换成
  Highlight。不可用又选中的格由 `--xh-bg-muted` 改为 `--xh-bg-subtle` + `--xh-fg-disabled`（新增
  `--xh-calendar-picker-cell-bg-selected-disabled`）。快速选年的网格是页内结构容器（§6.6），删除
  `overscroll-behavior: contain`（嵌进 date-picker 浮层时由那份皮肤补）。翻页钮里的字形 `--xh-calendar-picker-icon-size` 缺省由
  `--xh-glyph-size-text` 改为 sm 档 `--xh-glyph-size-sm`（钮是 `--xh-control-h-sm` 见方的图标钮，§6.5）。

  **calendar-range-picker 今天改品牌环，格子与钮的阶梯按承载面分档，按下补换底，年网格滚动链改 auto。** 与 calendar-picker
  同构：`--xh-calendar-range-picker-today-bg` 缺省由 `--xh-bg-brand-subtle` 改为 `transparent`、`-today-border` 缺省由
  `transparent` 改为 `--xh-fg-brand`，今天的悬停不再另给品牌淡底（`-today-bg-hover` 删除），落在区间里的今天不再单独写透明底
  （环压在淡色带上）；格子、翻页钮与标题钮悬停 200 → 100、按下补换底 200 并保留缩放（新增 `-cell-bg-pressed` /
  `-nav-bg-pressed` / `-heading-trigger-bg-pressed`），端点按下由 `--xh-bg-brand-hover` 改为 `--xh-bg-brand-active`；区间中段的
  格坐在品牌淡底的轨道上，补悬停 `--xh-bg-brand-subtle-hover`（20%）与按下 `--xh-bg-brand-subtle-active`（28%，新增
  `-range-cell-bg-hover` / `-range-cell-bg-pressed`，§7.3 页内选中的叠加态）；按压选择器改 `:is(:active, [data-pressed])`，高对比档
  按下把边换成 Highlight；不可用又选中的格由 `--xh-bg-muted` 改为 `--xh-bg-subtle`（新增 `-cell-bg-selected-disabled`）；年网格删除
  `overscroll-behavior: contain`；翻页钮字形缺省改 `--xh-glyph-size-sm`。两份日历的日期格基础块、今天、选中、悬停与按下自此由
  check-family-parity 的「日历族」钉住同源。

  **pagination 四类格子接入 Action Control text 档，当前页经桥接槽画，面板补滚动隔离。** 上一页 / 下一页 / 页码 /
  省略位由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='text'` + `data-xh-action-variant='ghost'` +
  `data-xh-action-size`，盒型、三档几何、悬停 / 按下 / 禁用面、按压缩放与过渡改由家族配方给（§7.2 缺省中性；§9.1
  0.97 缩放并换底）：非当前页悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）、按下由 `--xh-bg-subtle-active`
  （300）改为 `--xh-bg-subtle-hover`（200，画布承载阶梯）；使用者槽 `--xh-pagination-item-bg / -bg-hover / -bg-active / -fg / -item-h / -item-px / -item-min-size / -item-radius / -font-size` 改为映射到 `--xh-action-*` 桥接槽，名字与语义不变。当前页
  （§7.3 格状当前）三态与描边、顶高光改经桥接槽交给家族画（`--xh-pagination-item-shadow` 缺省由顶高光改为 `none`，高光
  走家族的 highlight 通道），环色改经 `--xh-action-ring-color-focus-visible` 灌 `currentColor`；省略位三态都压
  `--xh-pagination-ellipsis-trigger-fg`。摊开的页码面板补 `overscroll-behavior: contain`（浮层滚动面，§6.6），三端自绘条改传
  `size: 'sm'`（浮层 4px 档）。`--xh-pagination-icon-size` 缺省由 `--xh-glyph-size-text` 改为随档的 `--xh-glyph-size-sm / md / lg`
  （§6.5）。三端 computed 快照里格子多出家族给的 `gap`（单子节点，像素不变）与 `transition-property`。

  **file-upload 文件条目与禁用投放区的外边改 `--xh-border-default`。** `--xh-file-upload-item-border` 缺省由
  `--xh-border-subtle` 改为 `--xh-border-default`：条目是 `--xh-bg-surface` 底上带四边描边的列表卡面，§8.3 规定
  `--xh-border-subtle` 只作内部分隔线，根面外边一律 `--xh-border-default`。禁用的投放区外边同样由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条：disabled = `--xh-border-default` + `--xh-bg-subtle` + `--xh-fg-disabled`，
  与独立 Checkbox / Switch 的禁用边一致）。

  **steps 禁用步骤的指示器描边改 `--xh-border-default`。** `--xh-steps-indicator-border-disabled` 缺省由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条：disabled 外边一律 `--xh-border-default`，与独立 Checkbox / Switch 的禁用边一致；
  `--xh-border-subtle` 只作内部分隔线）。

  **tag 禁用标签的描边改 `--xh-border-default`。** `--xh-tag-border-disabled` 缺省由 `--xh-border-subtle` 改为
  `--xh-border-default`（§7.2 第 9 条：disabled 外边一律 `--xh-border-default`；`--xh-border-subtle` 只作内部分隔线）。

  **table 三颗勾选框的禁用描边改 `--xh-border-default`。** select-all-trigger / column-visibility-trigger / row-select-trigger
  禁用时的 `border-color` 由 `--xh-border-subtle` 改为 `--xh-border-default`（§7.2 第 9 条，与独立 Checkbox 的禁用边一致）。

  **transfer 内嵌勾选框的禁用描边改 `--xh-border-default`。** `--xh-transfer-checkbox-border-disabled` 缺省由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条，与独立 Checkbox 的禁用边一致；`--xh-border-subtle` 只作内部分隔线）。

  **tree 内嵌勾选框的禁用描边改 `--xh-border-default`。** `--xh-tree-checkbox-border-disabled` 缺省由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条，与独立 Checkbox 的禁用边一致；`--xh-border-subtle` 只作内部分隔线）。

  **color-picker 面板改 floating 实体面，自绘条走浮层 4px 档。** content 是取色面域 + 色相 / 透明度滑杆 + 通道输入的
  表单型多列面板，按 §8.4「含网格或多列的锚定面板 → floating」由 frosted 改为 floating：`--xh-color-picker-content-border`
  缺省由 `--xh-material-frosted-border` 改为 `--xh-border-default`、`-content-bg` 由 `--xh-material-frosted-bg` 改为
  `--xh-bg-surface`、`-content-fg` 由 `--xh-material-frosted-fg` 改为 `--xh-fg-default`、`-content-shadow` 由
  `--xh-material-frosted-shadow` 改为 `--xh-elevation-floating`；不再透景、不再画顶部边界光，`--xh-color-picker-content-backdrop`
  与 `--xh-color-picker-content-highlight` 两个槽删除。面板补 `overscroll-behavior: contain`（浮层滚动面，§6.6），三端自绘条
  改传 `size: 'sm'`（浮层 4px 档）。

  **checkbox 方框接入 Action Control icon 档。** root 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='icon'` +
  `data-xh-action-variant='outline'` + `data-xh-action-display='always'` + `data-xh-action-size`（随 size，缺省 md），盒型、悬停 /
  按下 / 禁用面、0.97 缩放与换底、粗指针 44px 热区、焦点环与过渡改由家族配方给（§9.1「方框」）；边长仍按
  `--xh-control-indicator-sm / md / lg`（皮肤把 `--xh-action-visual-size` 钉在 16px 档），面按字段静息形态取值（canvas 底 +
  `--xh-border-control` 描边 + 无影，悬停只升描边、按下换到 200 档中性面，勾中按下换语气 active 档）。使用者槽
  `--xh-checkbox-bg / -bg-checked / -bg-pressed / -bg-checked-pressed / -bg-disabled / -border / -border-hover / -border-checked / -border-invalid / -border-disabled / -fg / -fg-disabled / -shadow / -radius` 名字与语义不变，改为映射到 `--xh-action-*`
  桥接槽。只读方框由映射钉回静息面：悬停不升描边、按下不缩放不换底。粗指针命中区改由家族 `::after` 外扩到 44px（此前皮肤自写
  14 / 16px 外扩）。三端 computed 快照里方框多出家族给的 `gap: 0`、控件字号 14px 与 `transition-property` 的 box-shadow / opacity。

  **switch 轨道接入 Action Control text 档。** root 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='text'` +
  `data-xh-action-variant='outline'` + `data-xh-action-display='always'` + `data-xh-action-size`（随 size，缺省 md），按下 /
  禁用面、0.97 缩放与换底、粗指针 44px 热区、焦点环与过渡改由家族配方给（§9.1「轨道」）；轨道宽高仍按
  `--xh-switch-track-h-sm / md / lg` 算（皮肤钉 `--xh-action-visual-size` / `-min-inline-size`），边界仍由内描边经 shadow 通道画、
  border 宽度归零，滑块贴 inline-start（覆盖家族的居中排布）。悬停不换面（静息已是 300 档，阶梯只给按下）。使用者槽
  `--xh-switch-bg / -bg-checked / -bg-pressed / -bg-checked-pressed / -bg-checked-readonly / -bg-disabled / -border / -border-checked / -border-checked-readonly / -border-invalid / -border-disabled / -fg / -fg-checked / -fg-checked-readonly / -fg-disabled / -radius` 名字与语义不变，改经私有槽映射到 `--xh-action-*` 桥接槽。只读与提交中的手型经
  `--xh-action-cursor-*` 给（只读另钉按下不缩放不换底）。forced-colors 下按住的轨道由家族按压块换 Highlight 底，皮肤删自写的
  outline 换色。三端 computed 快照里轨道的边色由描边色改为 transparent（宽度本就为 0）、控件字号 14px、过渡多出
  border-color / opacity。

  **rating 星接入 Action Control icon 档。** item 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='icon'` +
  `data-xh-action-variant='ghost'` + `data-xh-action-display='always'` + `data-xh-action-size='xs'`（24px 正方盒，与此前
  `--xh-control-action-size` 同尺寸），按下 / 禁用面、0.97 缩放与换底、焦点环与过渡改由家族配方给（§9.1「星」）。静息透明；
  悬停不换底——悬停预览由点亮的星形（`data-highlighted`）表达，再给盒换面是重复的通道；按下换到 200 档中性面。使用者槽
  `--xh-rating-item-fg / -fg-highlighted / -bg-pressed / -radius / -font-size` 名字与语义不变，改为映射到 `--xh-action-*` 桥接槽；
  只读由映射钉回静息面（不缩放、不换底、手型 default）。粗指针下星本身不外扩热区（五颗星密排，44px 热区会压住相邻的星并让
  半颗判定串到邻星），家族 icon 档 `::after` 的 44px 下限在本皮肤归零。forced-colors 下家族把悬停 / 按下的盒填成
  Highlight，会吞掉同为 Highlight 的点亮星形：皮肤把盒钉回 Canvas 底，字色仍按点亮与否取 GrayText / Highlight，按住画一圈
  Highlight 内环。三端 computed 快照里星多出家族的 1px 透明描边与 `gap: 0`，`color` 不再在过渡列表里（作者图标的点亮换色
  改为即时；皮肤字形的点亮仍走 `::after` 的 clip-path 过渡）。皮肤体积基线 rating.css 6675 → 7907，涨在桥接槽映射与
  forced-colors 补救。

  **steps 触发器接入 Action Control row 档，序号圆点改读宿主 host 槽换面。** trigger 由 Headless 投影 `data-xh-action-control` +
  `data-xh-action-profile=row` + `data-xh-action-variant=ghost` + `data-xh-action-display=always` +
  `data-xh-action-size`（随 `size`，缺省 md）：序号 + 标题 + 说明的整块内容行按 §9.2 归行级，悬停 / 按下 / 禁用面、手型、过渡与
  焦点环改由家族给，按下只换面不缩放；悬停 / 按下面改经桥接槽（`--xh-steps-trigger-bg-hover / -bg-pressed` 名字与缺省不变：
  坐画布走 100 → 200）。圆点是格状当前的标记（§7.3），但不是激活宿主，不投影配方：trigger 以 `--xh-action-host-bg-hover / -pressed`
  向内声明自己是圆点的承载面（圆点静息就坐在 `--xh-bg-subtle` 上，阶梯 100 → 200 → 300），圆点在 trigger 的悬停 / 按压选择器下
  读 host 槽的同一来源换面：悬停 200（`--xh-steps-indicator-bg-hover / -bg-completed-hover` 缺省来源改为喂给 host 槽的私有槽
  `--xh-_steps-host-bg-hover`）、按下 300（`--xh-steps-indicator-bg-pressed`，缺省来源 `--xh-_steps-host-bg-pressed`），当前步按下
  换语气 active 档（`--xh-steps-indicator-bg-current-pressed`，缺省 `--xh-_tone-active` / `--xh-bg-brand-active`），不缩放。
  三端 computed 快照里 trigger 多出家族的过渡列表、`user-select: none` 与透明描边色位。

  **table 四颗把手接入 Action Control icon 档，排序把手接入 row 档。** select-all-trigger / row-select-trigger /
  column-visibility-trigger 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='icon'` +
  `data-xh-action-variant='outline'`，expand-trigger 投 `ghost`，sort-trigger 投 `row` + `ghost`；五者都带
  `data-xh-action-display='always'` 与 `data-xh-action-size`（随 size，缺省 md）。四颗把手的盒型、按下 / 禁用面、0.97 缩放与换底、
  焦点环与过渡改由家族配方给（§9.1「方框」），边长仍钉在 `--xh-control-indicator-size`；三颗勾选框按字段静息形态取值
  （空框由透明底改为 `--xh-bg-canvas` 底 + `--xh-border-control` 描边，与独立 Checkbox 同值），勾中实心品牌面按下派生
  `--xh-bg-brand-active`；禁用底由 `--xh-bg-muted` 改为 `--xh-bg-subtle`（§7.2 第 9 条）。排序把手按表头 host 槽下发的淡底阶梯
  悬停 200 / 按下 300 只换面不缩放，内距与最小高度归零（列头自己已给）；不可排序列的把手手型改为 not-allowed（家族禁用面）。
  使用者槽 `--xh-table-trigger-size / -radius / -bg-pressed / -bg-checked / -bg-checked-pressed / -border / -border-checked / -fg / -expand-fg / -sort-bg-hover / -sort-bg-pressed / -sort-gap` 名字与语义不变，改为映射到 `--xh-action-*` 桥接槽。
  粗指针下四颗把手不外扩热区（coarse-target 登记的密排存量），家族 `::after` 的 44px 下限在本皮肤归零；排序箭头字形的
  `::after` 钉回行内位置。三端 computed 快照里把手多出家族的 1px 透明描边（展开箭头）、`gap: 0`、`line-height` 与过渡列表。

  **transfer 全选格接入 Action Control text 档。** select-all-trigger 由 Headless 投影 `data-xh-action-control` +
  `data-xh-action-profile='text'` + `data-xh-action-variant='ghost'` + `data-xh-action-display='always'` +
  `data-xh-action-size='xs'`：它是「方框 + 文案」的整行命中区（§9.2），悬停 / 按下 / 禁用面与过渡改由家族配方给
  （白底承载 hover 100 → pressed 200），按下只换面不缩放；盒随内容收宽、高度由内容高改为 xs 档的 24px 命中地板
  （16px 方框居中其间），text 档的内距与最小宽度归零。使用者槽 `--xh-transfer-select-all-gap / -radius / -bg-hover / -bg-pressed / -fg / -font-size` 名字与语义不变，改为映射到 `--xh-action-*` 桥接槽。三端 computed 快照里全选格多出家族的
  1px 透明描边与过渡列表。

  **calendar-picker 翻页钮、标题钮与日期格接入 Action Control。** prev-year / prev / next / next-year 四颗方向钮由 Headless 投影
  `data-xh-action-control` + `data-xh-action-profile='icon'` + `data-xh-action-variant='ghost'` + `data-xh-action-size='sm'`
  （32px 正方盒），heading-year / heading-month 两颗标题钮与 cell-trigger 投 `text` + `ghost` + `sm`，都带
  `data-xh-action-display='always'`；悬停 / 按下 / 禁用面、0.97 缩放与换底、焦点环与过渡改由家族配方给（§9.1「日期翻页按钮、日历格」；
  §4.1 格状当前）。日期格几何仍由网格给（家族的固定高归 auto，宽由等分轨道、高按 aspect-ratio），今天 / 选中 / 邻月 / 不可用
  经三支私有槽或桥接槽三态换值；标题钮悬停只换字色不换底，到顶那层手型 default 且不换面；只读日视图的格手型 default。
  使用者槽 `--xh-calendar-picker-nav-size / -nav-radius / -nav-bg / -nav-bg-hover / -nav-bg-pressed / -nav-fg / -nav-fg-hover / -heading-trigger-px / -heading-trigger-radius / -heading-trigger-bg-pressed / -heading-trigger-fg-hover / -heading-fg / -heading-font-size / -cell-size / -cell-radius / -cell-bg-hover / -cell-bg-pressed / -cell-fg / -cell-fg-outside / -cell-font-size / -today-bg / -today-border / -today-fg / -cell-bg-selected / -cell-bg-selected-active / -cell-bg-selected-disabled / -cell-fg-selected`
  名字与语义不变，改为映射到 `--xh-action-*` 桥接槽。粗指针下铺满整格的命中区 `::after` 钉回原几何（家族 text 档用它扩热区）。
  三端 computed 快照里方向钮的 UA 内距 6px 归 0、字号取 sm 档 13px、过渡列表随家族。

  **calendar-range-picker 翻页钮、标题钮与日期格接入 Action Control。** 与 calendar-picker 同构：四颗方向钮投 icon ghost sm、
  两颗标题钮与 cell-trigger 投 text ghost sm。区间中段的格经私有槽把悬停 / 按下换到品牌淡底阶梯（20% / 28%，§7.3 页内选中的
  叠加态），区间两端与单选的选中格重写桥接槽三态（实心品牌、按下 brand-active），邻月的区间格钉回透明底与透明边，不可用格映射
  置灰字与置灰底，只读日视图的格手型 default。使用者槽名字与语义不变，改为映射到 `--xh-action-*` 桥接槽；
  check-family-parity 的「日历族」改比日期格基础块、今天换的三支私有槽与选中格重写的桥接槽（两份皮肤不再各写 :hover / :active）。
  三端 computed 快照里方向钮的 UA 内距归 0、字号取 sm 档、过渡列表随家族。

  **checkbox-group 条目与全选格接入 Action Control row 档，方框改读宿主桥接槽换面、不再缩放。** item 与 select-all-trigger 由
  Headless 投影 `data-xh-action-control` + `data-xh-action-profile='row'` + `data-xh-action-variant='ghost'` +
  `data-xh-action-display='always'` + `data-xh-action-size='xs'`：整行是「方框 + 文案」的行级命中区（§9.2），悬停 / 按下 / 禁用面、
  手型、过渡与焦点环由家族给，按下只换面不缩放；行自己坐画布走 hover 100 → pressed 200（新增使用者槽
  `--xh-checkbox-group-item-bg-hover / -bg-pressed`、`--xh-checkbox-group-select-all-trigger-bg-hover / -bg-pressed`，缺省
  `--xh-bg-subtle` / `--xh-bg-subtle-hover`），同时以 `--xh-action-host-bg-hover / -pressed` 向内声明自己是方框的承载面
  （200 / 300）。方框（indicator 与全选格的 `::before`）不投影配方，在宿主的悬停 / 按压选择器下读宿主 host 槽的同一来源换面：
  按下由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle-active`（300，`--xh-checkbox-group-indicator-bg-pressed` 的缺省来源改为
  喂给 host 槽的私有槽 `--xh-_checkbox-group-host-bg-pressed`），勾中 / 半选按下仍换语气 active 档，不再 0.97 缩放（过渡列表去掉
  `scale`）。条目行高由 16px 变为 xs 档的 24px 命中地板（方框居中其间），组的纵向节奏每项多 8px；只读时从槽上收回整行的悬停 /
  按下面与手型；粗指针下家族 44px 热区归零（条目密排，热区会压进相邻条目）。三端 computed 快照里 item / select-all-trigger 多出
  家族的过渡列表与 `min-height: 24px`，描边色位归透明。皮肤体积基线 checkbox-group.css 11448 → 13421，涨在桥接槽映射。

  **radio-group 条目接入 Action Control row 档，圆圈改读宿主桥接槽换面、与 checkbox-group 逐档一致。** item 由 Headless 投影
  `data-xh-action-control` + `data-xh-action-profile='row'` + `data-xh-action-variant='ghost'` + `data-xh-action-display='always'` +
  `data-xh-action-size='xs'`：整行是「圆圈 + 文案」的行级命中区（§9.2），悬停 / 按下 / 禁用面、手型、过渡与焦点环由家族给，按下只换面
  不缩放；行自己坐画布走 hover 100 → pressed 200（新增使用者槽 `--xh-radio-group-item-bg-hover / -bg-pressed`，缺省 `--xh-bg-subtle` /
  `--xh-bg-subtle-hover`），同时以 `--xh-action-host-bg-hover / -pressed` 向内声明自己是圆圈的承载面（200 / 300）。圆圈不投影配方，在宿主的
  按压选择器下读宿主 host 槽的同一来源换面：按下由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle-active`（300，
  `--xh-radio-group-indicator-bg-pressed` 的缺省来源改为喂给 host 槽的私有槽 `--xh-_radio-group-host-bg-pressed`）；选中圈的描边保住，
  按下换的是圆点（新增 `--xh-radio-group-indicator-dot-pressed`，缺省语气 active / `--xh-bg-brand-active`，与 checkbox-group 勾中方框按下同档）；
  禁用圆圈补上与独立 checkbox 同档的面（新增 `--xh-radio-group-indicator-border-disabled` / `-bg-disabled` / `-dot-disabled`，缺省
  `--xh-border-default` / `--xh-bg-subtle` / `--xh-fg-disabled`），此前禁用只置灰文字、圆圈不变。条目行高由 16px 变为 xs 档的 24px 命中地板
  （圆圈居中其间），组的纵向节奏每项多 8px；只读时从槽上收回整行的悬停 / 按下面与手型；粗指针下家族 44px 热区归零（条目密排）。
  三端 computed 快照里 item 多出家族的过渡列表与 `min-height: 24px`，描边色位归透明。皮肤体积基线 radio-group.css 5328 → 7313，涨在桥接槽映射。

- 4f7ac7a: **虚拟列表的区间回调改名：`onChange` → `onRangeChange`，事件 `change` → `range-change`，载荷类型 `VirtualizerChangeDetails` → `VirtualizerRangeChangeDetails`。**

  `change` 在库里是「值变了」的名字，虚拟列表回的却是该渲哪一段——同一个名字两种含义，作者在表单里同时接 `@change` 时分不清是哪一路。现在按它真回的东西取名。三个适配器同步：Vue `@range-change`、React `onRangeChange`、自定义元素 `range-change` 事件；载荷不变（`virtualItems` / `totalSize` / `startIndex` / `endIndex`）。

- 80f9809: 新增单一 `VisualEnvironmentController`，统一解析、继承、持久化并投影 mode、brand、density、dir、contrast、motion、transparency 七轴；根作用域可显式注入 motion sink 同步 JS 动效，局部作用域只影响自身 DOM 与 Portal 壳。`createThemeController` 改为七轴控制器的五轴视图，`contrast` 基线由无效的 `base` 更正为 CSS 正式值 `default`，启用 `storageKey` 必须提供 `onStorageError`。

  移除三端 `XhConfig.motion` 隐式全局 override。React/Vue 配置改以带显式 root 的 `visualEnvironment` 绑定接线，Web Components 的全局配置接受同一绑定，`<xh-config>` 直接提供七轴局部 scope；嵌套配置不再污染兄弟树。

- faa68bc: 修正 Vue DatePicker 挂载在 iframe 或其他 Document 时的运行时归属。

  组合组件现在以实际渲染出的根节点延迟绑定 Scope，并在机器启动前创建同一 Document 的 RuntimeConfig、LayerRegistry、Portal 与滚动条。SSR 与客户端首帧均在来源位置保留面板，运行时就绪后再搬到所属 Document 的默认或显式 Portal 目标，保留内容与实例 ID；真实 hydration 回归验证两端结构一致、内容唯一和主题桥接。

  未配置 `portalContainer` 的 iframe 挂载和显式同 Document 目标均可用；目标 getter 延迟到真实根和同轮兄弟 ref 均已提交、Portal 真正选址时才读取。显式跨 Document 目标会明确失败，不回退到全局 `document`，核心消解层的同 Document 约束保持不变。直接调用 `useDatePicker` 的既有 ambient Scope 行为不变。

  DatePicker 不再把“字段存在但 getter 返回 `null`”解释成默认 Portal。需要默认落点时请省略 `portalContainer`；显式提供时必须在真实根就绪后返回同一 Document 的 `Element`。这是对既有 `null → body` 用法的破坏性收紧，因此本 changeset 为 major。

### Minor Changes

- 2c2e470: **修复**三处按钮的可访问名。

  `question-flow` 的提交键**不再无条件发英文 `aria-label`**。这颗按钮按惯例带可见文字（库里的示例写的是「继续」/「发送」），写死的 `Continue` / `Send answers` 会把那行字盖掉：语音控制照着屏幕上看得见的词说「点击 继续」就再也点不动它。现在与同一份 footer 里的跳过键同一口径——`translations.continue` / `translations.send` 给了才发，不给就让可见文字自己当名字。**注意**：原先靠这两句英文兜底的用法，现在需要显式给 `translations`。

  **新增** `TransferTranslations.toTarget` / `toSource`，两颗搬运钮从此各带一个 `aria-label`（兜底 `Move to target list` / `Move to source list`）。它们默认是空按钮——箭头由皮肤画在伪元素上，伪元素进不了可及树——而这两颗钮是 transfer 唯一的操作出口，名字缺席等于整个组件对读屏不可用。`transfer` 同时补上 `translations` 这个 prop，Vue 与 Web Components 两侧都接得到全局配置。

  **新增** `TableTranslations.selectAll`，全选把手从此带 `aria-label`（兜底 `Select all rows`）。这一格默认没有内容，行内那颗把手又是 `aria-hidden` 的，它是整张表的选择功能对读屏唯一的入口。

- 8cbcd83: **Accordion 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  机器 context 新增 `pressedValue`（正被按住的条目 value），事件 `PRESS.START` / `PRESS.END`；整组或条目禁用时不进，按住途中整组转禁用
  时由机器松开。trigger 的方向键导航与按压跟踪合成为同一个 keydown 处理器。键盘表新增 `accordion.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **动作与触发族补能力：三轴铺齐、两个 group 补分隔线与组级禁用、剪贴板补禁用与播报区、按钮补圆角档与标签选择。** 纯新增，公开面一个名字都没删。

  **三轴铺齐。** `toggle-group` 是全族唯一「有 tone 没 variant」的一件，现在补上 `variant`：四档与 `toggle` 一处对一处——未选中那些段的壳与选中那一段用哪一档底都由它定，切换仍由 `data-state='on'` 一条完成。`float-button` 补 `variant` / `tone` / `size`（尺寸缺省与 `lg` 同档，悬浮钮起步就比行内按钮大一号），`back-top` 补 `variant`，`download-trigger` 与 `clipboard` 补 `variant` / `tone` / `size`。五份皮肤同批把颜色改成「使用者令牌 → 私有槽 → 语义令牌」三级：使用者令牌排在形态之前，没写 `data-variant` 时逐值与从前相同。`float-button` 的前景这一支顺带接上语气槽，与 `back-top` 补齐；两颗角落浮钮的按钮块现在逐条同形，`check-family-parity` 立了「角落浮钮族」把它钉住。

  **两个 group。** `button-group` 与 `toggle-group` 各补一个可选的 `separator` 部件（`aria-hidden`，朝向是这条线自己的，与组的排布相反）与 `fullWidth`。`toggle-group` 另补 `hidden-input` 表单出口与 `name`，机器认 `FORM.RESET`，`check-form-reset` 的分母里因此多了一件。插了分隔线之后首末两段不再是 root 的首末子节点，圆角另按元素类型认一遍（条目是原生 `button`，分隔线不是），没有分隔线时与从前逐值相同。

  **组级禁用是真禁用。** `button-group` 补 `disabled`：Vue 侧经注入让组内每颗 `XhButton` 拿到原生 `disabled`，Web Components 侧把 `disabled` 写到组根的每个直接子节点上（作者自己声明的那一份按元素记住首见值，解禁时解得开）。只打 `data-*` 是假禁用——段照样可聚焦、照样派 click。

  **`toggle` 与 `button`。** `toggle` 补 `iconOnly` / `fullWidth` 与三档 `--xh-icon-size`，同一枚图标放进 `button` 与 `toggle` 直径终于一样。`button` 补 `shape`（`rounded` / `pill` / `square`，只换圆角这一个私有槽，不写进尺寸档）与 `as`（`button` / `a`，写成 `a` 时不再产出 `type` 与原生 `disabled`，禁用改由 `aria-disabled` 表达、点击仍被拦下），官方示例里那份「往 `<a>` 上手抄 `data-scope` / `data-part`」的写法可以退休了。

  **`clipboard` 与 `download-trigger`。** `clipboard` 补 `disabled`（守卫在机器层，作者调 `api.copy()` 也绕不过去）、`copy-trigger` 的 `indicator` 补上 `aria-hidden`，并新增一个可选的 `status` 部件：`role="status"` + `aria-live="polite"` 的视觉隐藏播报区，不给内容时念 `translations.copied`——在这之前，复制成功对读屏用户是零反馈。`ClipboardTranslations` 与 `DownloadTriggerTranslations` 从空接口立起来（`copy` / `copied`、`trigger`），两处的可及名都只在作者给了文案时才产出，不凭空盖掉按钮上的可见文字。`download-trigger` 另补兜底字形，新增令牌 `--xh-glyph-mark-download`。

  体积：`clipboard.css` 5630 → 9144 字节、`download-trigger.css` 3143 → 6914 字节，涨的全是四档形态与两档尺寸的槽赋值，与 `button.css` 同形。

- 19570ad: **补齐两个适配器漏露的 headless 能力：七个浮层的 `dir`、五个元素的 `translations`、分页省略位浮层的四项。**

  `dir` 是条真接线：机器把它交给定位引擎翻转行内轴，connect 把它写到被搬走的浮层落点上——那里继承不到作者子树的方向，只能由作者显式给。41 个组件在 headless 的作者面声明了它，`combobox` / `date-picker` / `mention` / `popover` / `time-picker` / `tooltip` / `tour` 这七个两个适配器一侧都没露，而文档站的 Props 表照登，RTL 下这七个浮层的 `-start` / `-end` 落点翻不过来。现在两侧都有：Vue 是 `dir` prop，Web Components 是 `dir` 属性（字段名 `direction`，避开 HTMLElement 自带的存取器）。

  `translations` 是逐实例的读屏文案。Vue 侧 64 个组件全都做成了 prop，Web Components 侧 `dialog` / `resizable` / `sortable` / `table` / `tags-input` 五个没有这条通道，作者只能用 `<xh-config>` 改整棵子树。`sortable` 与 `table` 尤其吃亏：键盘拖拽的拾起 / 移动 / 放下 / 取消四句播报全在里面。五个元素现在都收 `translations` property（对象递不进属性）并转交进机器。

  `pagination` 的省略位是个可展开的悬停浮层，headless 给了 `placement` / `offset` / `openDelay` / `closeDelay` 四项，`<xh-pagination>` 四项全露，`XhPaginationRoot` 一项都没有。Vue 侧补齐，缺省值仍由 connect 给。

  两道门禁跟着立：新增 `check-dir-exposed`——headless 作者面声明了 `dir` 的组件，两个适配器都必须露出来且转交进机器，反向还查「适配器露了 headless 却没声明」（复合件登记进 `COMPOSED`，带过期反查）；`check-config-wiring` 的 translations 判据从「跑没跑机器」加严成「元素上有没有这个 property、有没有转交进 props」。

- fa08fb4: **AI 与流式族补七项能力，全部是加法：不写新 prop 的既有用法逐值不变。**

  **`tool-call` 补形态轴 `variant`**（`outline` / `subtle` / `ghost`，缺省 `outline`）。三档与 `reasoning` 逐条同形——两件本来就共用一台机器，此前只有 `reasoning` 有形态轴，把两件并排放，一件能收成无壳内联、另一件永远自带一张抬起的面。`ghost` 供卡中卡用：嵌在 `message-feed` 的一条消息里时不再自带投影与描边。海拔改经私有槽 `--xh-_tool-call-shadow` 走，语气档那条 `box-shadow` 一并改读它，缺省档与语气档的计算值不变。

  **`tool-call` 补 `data-settled` / `data-errored` 两位布尔**（落根，配套只读 api 字段 `settled` / `errored` 与纯函数 `isToolCallSettled` / `isToolCallErrored`）。根上的 `data-state` 被开合占着，阶段此前只发在下面八个部件上，作者只渲根节点时选不中「跑完了」「跑砸了」。出错换描边色那条规则现在两条并列：`[data-errored]` 与原来的 `:has([data-state='output-error'])`。

  **`approval` 补形态轴 `variant`**（同三档，缺省 `outline`）。两档排在「判过了描边退回中性」那条之后，`subtle` / `ghost` 的透明描边不会被它按同等特指度盖回来。

  **`log` 补尺寸轴 `size`**（三档，缺省档逐值等于 `md`）。全族此前 8 件有档、只有它没有。三档只改行文字号（`--xh-_log-font-size`）与内衬（`--xh-_log-content-px`）两个私有槽；**行高不入档**——视口按 `rows` 定高读的是同一个基准，三档同值才对得上整数行。

  **`log` 补 `data-level`**（`debug` / `info` / `warn` / `error`）。Vue 侧是 `XhLogLine` 的 `level` prop，Web Components 侧是 line 角色节点上的 `level` 属性；不写就不落属性，行走内容层的前景色。新增 4 个使用者覆盖槽：`--xh-log-level-debug-fg` / `-info-fg` / `-warn-fg` / `-error-fg`。级别只染颜色不动排版——四档必须等高。官方示例 `05-levels` 两版随之改成走这一位，手写的行内级别色删掉。

  **`markdown-stream` 的 `announce` 补 `'assertive'` 一档**，与 `approval` 的 `live` 对齐。这一档下播报区换成 `role="alert"` + `aria-live="assertive"`；`off`（缺省）与 `polite` 两档一字未动。

  **`prompt-input` 新增 1 个公开只读槽 `--xh-prompt-input-computed-px`**：整框内衬的当前值，随尺寸档与 `--xh-prompt-input-p` 一起变。附件条与动作行由作者写在 root 里、不是本组件的部件，此前只能靠猜才对得齐那条内衬线。

- e72ed26: **新增** `RenderedBlock.source`：代码块与公式块除了已消毒的 `html`，另给一份未转义的正文原文。

  代码块给的是剥掉起止围栏的代码，公式块给的是剥掉 `$$` 的公式。`html` 对这两种块只是降级产物——代码要交给代码组件重排行号与着色，公式要交给公式引擎，两者都得拿到未经转义的正文，此前只能从已转义的 html 反解。其余种类的块不带这个字段。

  **新增** `logMachine`，`log` 组件不再借用 `thread` 的机器。

  两者本来就是各自独立的组件，共用一台机器只是历史遗留。这一改顺带修好一处 `<xh-log>` 的全局文案失效：Web Components 侧按机器名给 `<xh-config>` 的文案分桶，`<xh-log>` 此前会去取 `thread` 那一格，作者写在 `<xh-config>` 上的日志区可访问名从来到不了元素；同时元素的行数、载入态与文案三个视图属性此前完全不过全局配置，现在一并接上。

  `stick-change` 事件的载荷类型随之改名为 `LogStickChangeDetails`（形状不变，仍是 `{ atBottom, sticking }`）。

- 262f119: AI 组件族八件统一补齐动效、表面语言与几处真实能力缺口。全部纯增量，没有删名或改名。

  **动效**

  - 卡片进场：`approval` / `tool-call` / `message-feed` 的条目与回到底部按钮都有了淡入上移的进场。
  - 折叠开合：`tool-call` 与 `reasoning` 的详情区改为行高与内缩同帧动的展开收起，收起在动画播完之后才真正落成，退场窗口内由 `inert` 挡住读屏与 Tab 序；折叠指示器的转向与它同一档时长同一条曲线。
  - 位移与高度类动画统一走新的 `--xh-motion-ease-enter-strong`，微交互仍走 `--xh-motion-ease-enter`。
  - 「正在跑 / 正在想」有了表达：`tool-call` 的状态文字与 `reasoning` 的标题会扫一道光，减少动效偏好下自动换回平色。
  - `markdown-stream` 的光标改成等第一个字时闪、开始出字后淡入一次并停在实心；块列表还空着时光标落在根上，「请求已经发出去」第一帧就看得见。

  **表面**

  `approval` / `code-view` / `diff-view` / `tool-call` / `reasoning` / `prompt-input` 的卡面与输入壳统一接了一档静态海拔，各自留有 `--xh-<组件>-shadow` 覆盖槽；`code-view` 补上了此前完全没有的描边与卡片底色。

  **新增的部件与属性**

  - `tool-call`：`summary`（收起态也看得见这次查了什么、改了哪个文件）与 `duration` 两个部件，配 `startTime` / `endTime` 两个属性、`durationMs` 与纯函数 `toolCallDuration()`、文案键 `ranFor`。
  - `reasoning`：`icon` 部件、`variant` 属性（`outline` / `subtle` / `ghost`，`ghost` 是无壳内联形态）、`statusText`（此前声明了却从没被消费的三个文案键现在真的生效）与纯函数 `reasoningStatusText()`。
    自定义元素侧另有只读属性 `element.durationMs`，与 Vue 根插槽的同名字段对齐。
  - `approval`：`note`（附在判定上的自由文本）、`result`（判定落定后看得见的那一格）、`actions` 三个部件，配 `note` / `defaultNote` / `onNoteChange` 与 `ApprovalNoteChangeDetails`。
  - `diff-view`：`stat`（头部的增删统计位）与 `segment`（字级差异高亮）两个部件，配 `wrap` 属性与 `DiffViewSegment` / `DiffViewSegmentProps`。
  - `prompt-input`：可选的 `input-row` 部件——写了它，外壳翻成竖排、输入框与按钮收进这一行，上下两侧腾出来放附件条与工具行。
  - `markdown-stream`：`caret` 开关与 `data-caret` 落点。

  **修复**

  - `code-view` 的行号被语法数字色染成琥珀色（`--xh-code-view-number-fg` 一个名字被两处消费）。
  - `prompt-input` 发送按钮禁用态的字底对比度（浅色 1.96:1、深色 2.08:1）。
  - 八处按下缩放没有过渡，按下与松手都是硬切。
  - `code-view` 的 `<pre>` 挂着 `aria-labelledby` 却没有能承载可访问名的角色，属性无效；现在发 `role="group"`。
  - `message-feed` 的集合语义从最外层挪到直接包着条目的内容层：`role="feed"` 只认 `role="article"` 的子节点，而播报区与回到底部按钮都是最外层的孩子。最外层继续当唯一的 Tab 停靠点与键盘宿主。播报区不再发 `role="status"`，改用等价的 `aria-live` + `aria-atomic` 两条。
  - `approval` 的备注框在根内，组合输入法期间按 Escape 是收候选词框而不是拒绝，现在挡住了组合态。

- eb33c91: **Alert 的关闭按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END`；不可关闭时不进，提示收起（关闭按钮随 root 隐藏）或按住途中
  转成不可关闭时由机器松开。键盘表新增 `alert.kbd.press`。三端公开 props 与事件不变。
- 121caf3: **Anchor 链接接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context
  新增 `pressedValue`（正被按住的链接，按 value 记），事件 `PRESS.START { value }` / `PRESS.END { value }` 挂根级（按住
  Enter 点过去后机器在 `scrolling`，抬起在那里到达）；锚点没有禁用，守卫 `canPress` 恒放行。激活项与按压互相独立。键盘表
  新增 `anchor.kbd.press`。三端公开 props 与事件不变。
- e65c6a5: **新增** `approval` 组件：危险动作执行前的人在环闸门，Vue 与 Web Components 两侧同时可用。

  **超时一律按拒绝收口，这条由机器结构保证、不靠调用方守规矩**：判定的取值域只有批准与拒绝，`expired` 只是显示态；通往批准的转移全机只有一条且必过守卫；到点事件只声明在待决态上，迟到的定时事件落地即静默丢弃；拒绝那条路不吃挂起中、不吃必选项、不吃任何闸门。

  **缺省不给默认超时值**——替宿主定安全策略比不定更危险。时长非有限或非正数时一个计时器都不起、停在待决：既不当 0ms 立刻到期，也绝不当成无限期放行。

  勾选与判定是原子的：批准的载荷带着「批的是哪几项」。拆成两个组件等于让每个宿主自己接线并保证先后顺序，中间必然存在「已批准但范围还没同步」的窗口，而这正是安全闸门最不该有的东西。

  `requestId` 变了即重入待决并按新时长重起计时，**不替旧一轮补一次拒绝**——旧结果由宿主自己作废。「卸载即拒绝」默认关着：机理成立不等于默认值成立，列表换 key、路由切换、热更新任何一次重挂都会替用户发出他没做过的判定。

  待决时批准键用 `aria-disabled` 而不是原生 `disabled`，保住可聚焦、让读屏念得到为什么按不动；授权项是 `role=checkbox`，只认 `Space`；`Escape` 判为拒绝而不是「关闭」——本组件不提供不作答的出口。剩余时间对读屏隐藏，逐秒跳字进活区会不停打断。

  导出 `APPROVAL_DENY_SELECTOR` 供 `dialog` 的 `initialFocus` 用：配 `role="alertdialog"` 并关掉 `closeOnEscape`，浮层就只剩批准与拒绝两个出口。

- b2e1edf: **Approval 的批准钮、拒绝钮与授权项接入按压通道：Space / Enter（授权项只认 Space）与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`（`ApprovalPressedKey`：`approve` / `deny` / `item:<value>`，按键记按住的那一个），事件 `PRESS.START` / `PRESS.END` 只在待决态接；判定在途、必选项未勾满的批准钮与禁用的授权项不进，判定落定或转入在途时由机器松开。
  键盘表新增 `approval.kbd.press` 与 `approval.kbd.item-press`；`ApprovalPressedKey` 进公开面。三端公开 props 与事件不变。
- fa08fb4: **控件下方那一行辅助文字同时只留一段。** 新增 `css/description.css`，`field` 与 `fieldset` 的根一旦带上 `data-invalid`，它们自己那段 `description` 收起，位置让给 `error-text`。两段原先会同时在场，辅助区撑成两行，同一行栅格里的字段高度跟着参差。

  只收视觉：说明的 id 仍挂在控件的 `aria-describedby` 上——直接被 `aria-describedby` 指到的节点，隐藏与否都计入可及描述，读屏两段照旧都念得到。

  限定到直接子节点，字段集无效时收起的是它自己那段说明，不是组内各字段的。scope 逐个列出而不写通配：`description` 这个部件名在提示、气泡、空状态、说明列表上指的是另一段文字。按需引入的人多引一份：`import '@xihan-ui/styles/description.css'`，位置排在组件皮肤之前。

  **表单：字段一被编辑，就清掉它身上那条来自库外的错误。** 服务端返回后经 `setFieldError` 写进来的错误、作者预置的 `defaultErrors`、受控 `errors` 里那些，本库的校验都不认识：`validateOn` 是 `submit` 时两次提交之间没有任何一条路径会重算它们，而 `validate` 与 `rules` 都没给的表单连提交那一路的整表替换也不发生——用户照着提示改完，错误还挂在原处。现在 `FIELD.SET` 会先把这一条清掉，受控档经 `onErrorsChange` 回传。

  校验自己算出来的那几条不动，仍由下一次校验负责收回：提交失败后接着打字，规则报的错照旧留在那里。禁用与只读两档整条 `FIELD.SET` 都吃掉，也就不清。

  **`dialog` 新增 `indicator` 部件。** 语气徽记此前只活在命令式服务的一个私有渲染函数里，声明式写 `<XhDialogRoot role="alertdialog">` 的人拿不到它。现在它是正式部件：Vue 侧 `XhDialogIndicator`、Web Components 侧 `data-part="indicator"`，两条路得到同一个东西。

  圆底与字形两层，圆底是节点自己、字形走 `:empty::before`，作者往里塞节点即整枚换掉。画哪枚字形跟着节点自己那份 `data-tone` 走：`success` 勾、`warning` 三角、`danger` 叉，其余为圆圈问号。颜色取语气层派生的淡底与前景档，新增使用者覆盖槽 `--xh-dialog-indicator-size`、`--xh-dialog-indicator-mark-size`、`--xh-dialog-indicator-radius`、`--xh-dialog-indicator-bg`、`--xh-dialog-indicator-fg`。

  `createDialogService` 的默认模板改渲这个部件，那枚徽记从此由皮肤画：节点位置与标签名都没变，变的是它不再自带内联样式，改为按 `[data-scope="dialog"][data-part="indicator"]` 取样式。

  覆盖槽名、部件名、props、事件与 `data-*` 取值一个没删也没改名。

- bdf4028: **新增 `bar-code`（条形码）：一维码七种常用码制，三端同时可用。**

  `matrix-code` 管二维码，`bar-code` 管一维码：货号、运单号、序列号、零售商品码、外箱码这些要让扫描枪一枪读出的内容。`format` 选码制——`code128`（缺省，任意 ASCII；`gs1` 打开即 GS1-128，起始符后放 FNC1，内容里的 GS 编成变长 AI 之间的分隔）、`ean13` / `ean8` / `upca` / `upce`（定长数字，校验位不给就补上、给了就核对）、`itf14`（缺省带上下承载条）、`code39`（`checksum` 附 mod 43 校验字符）。编码器自写（ISO/IEC 15417 / 15420 / 16390 / 16388），Code 128 按 GS1 通用规范的规则自动切换 A / B / C 子集与 shift；每种码制都配了独立重写的解码器做回环。

  几何走一个 `<svg>`：全部条合成一条 `<path>`，人读文字（`text`，缺省印）每段一个 `<text>`，EAN / UPC 的数字逐位落在自己那格下面、守卫条按规范延长 5X。`barWidth` 是最窄条的像素宽，整张码等比放大；`height` 是条高；`margin` 是静区，缺省按码制的规范值。内容不合码制规则（字符不在字符集、位数不对、校验位对不上）或码制不认识时一根条都不铺，根落到 `error` 态并在 `error` 里说明——画一张扫出错内容的码比不画更坏。对当前码制没有意义的选项（`gs1` 给了非 code128、`checksum` 给了非 code39、`bearerBars` 给了非 itf14）往诊断通道报一条 `bar-code.option-ignored` 警告，按没给处理。

  皮肤 `bar-code.css`：条色与底色取固定档（`--xh-bar-code-fg` / `--xh-bar-code-bg`），深色主题下不反相；人读文字走等宽字体（`--xh-bar-code-font-family`）。自定义元素 `<xh-bar-code>` 作者只写一个空的 `<svg data-xh-part="root">`。

- 0e7de3f: **Breadcrumb 链接接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  面包屑此前没有状态机，按 button 的先例补最小机器 `breadcrumbMachine`（state `idle`，context `pressedValue`
  按链接 value 记，事件 `PRESS.START { value, current }` / `PRESS.END { value }`，守卫 `canPress` 把当前页那条
  挡在外面——它带 `aria-current` 与 `aria-disabled`，是不可点的终点）。

  **破坏性：`connectBreadcrumb` 第一参由 props 改为 `Service<BreadcrumbSchema>`**，与其余跑机器的组件同构；
  `BreadcrumbProps` 仍导出（= `BreadcrumbSchema['props']`），新增导出 `breadcrumbMachine` 与 `BreadcrumbSchema`。
  `BreadcrumbLinkProps` 新增必填的 `value`（链接身份，按压通道按它记）。直接调用 headless 的使用者需改为先建机器。

  三端：Vue / React / Web Components 的 Breadcrumb 改跑 `breadcrumbMachine`（公开 props 不变）；Link 部件新增可选
  `value`（Vue / React prop、WC 的 `value` 属性），未声明时由适配器派生一个实例内稳定的键，只作按压通道的键、不写回 DOM；
  按 collection 铺开时取节点的 value。键盘表新增 `breadcrumb.kbd.press`。

- 09f8388: TreeSelect 新增 headless 懒分支加载合同：`hasChildren` 声明未取回的分支，`loadChildren({ node, signal })` 在首次展开时取得直接子项；失败保留 cause，并通过 `api.branchLoadState(value)` 与 `api.retryBranch(value)` 公开。重试、节点移除和卸载都会中止并作废旧请求，过期回调不能覆盖当前有效树。三端均透传 loader，React/Vue 默认树把懒节点渲染为 branch，Web Components 将相位接到既有 branch 属性。
- f408efb: **ButtonGroup 的 variant / tone / size 下发到组内每一段，缺省形态显式落 subtle。** `connectButtonGroup`
  的 api 新增只读的 `variant`（缺省 `subtle`，组缺省中性淡底）、`tone`、`size`，根的 `data-variant` 不传时
  投影 `subtle`。三端适配器按整组禁用同一条路把三轴落到每一段：Vue 的 `provideButtonGroupDisabled` /
  `useButtonGroupDisabled` 改为 `provideButtonGroupContext` / `useButtonGroupContext`（内部 API），React 的
  `ButtonGroupDisabledProvider` 改为 `ButtonGroupProvider`，Web Components 对未自写 `variant` / `tone` /
  `size` 属性的 `<xh-button>` 子节点写入组值并记住作者自写的那一档；段自己写了的优先，组值压过全局配置的
  `size`。段因此自带 `data-xh-action-variant`，颜色由家族形态矩阵给出。皮肤删除向段灌色的
  `--xh-button-bg / -bg-hover / -bg-active / -fg` 与依赖「段不带 data-variant」的选择器；outline 组内每一段
  的描边一律压平（外框由组根画）；solid 段成组时静息不落贴地软影、悬停不抬起，只留顶光；组内段的
  `scale: none` 兼认 `data-pressed`。视觉默认变化：组内 outline / ghost 段的按下面从 300 改家族阶梯的 200。
- 80c0cc0: **CalendarPicker 翻页钮、标题两截与日期格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressed`（`CalendarPickerPressedKey`：`prev-year` / `prev` / `next` / `next-year` /
  `heading-year:面板` / `heading-month:面板` / `cell:ISO`，类型进公开面），根级事件 `PRESS.START { key, disabled? }` /
  `PRESS.END { key }`；守卫 `canPress` 在整张禁用、到界 / 到顶 / 不可选的部件上不进，只读只挡日期格（翻页与钻层照常）；
  按住途中转入禁用或只读、钻层换视图、视窗挪动时由机器自行松开对应的那一个。DatePicker / DateRangePicker 内嵌的日历复用
  同一份 connect，随之接上。皮肤按压面由 Action Control 家族配方给出；键盘表新增 `calendar-picker.kbd.press`。三端公开
  props 与事件不变。
- 701a791: **CalendarRangePicker 翻页钮、标题两截与日期格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针
  `:active` 同一副按压面。** 机器 context 新增 `pressed`（`CalendarRangePickerPressedKey`：`prev-year` / `prev` / `next` /
  `next-year` / `heading-year:面板` / `heading-month:面板` / `cell:ISO`，类型进公开面），根级事件 `PRESS.START { key, disabled? }`
  / `PRESS.END { key }`；守卫 `canPress` 在整张禁用、到界 / 到顶 / 不可选的部件上不进，只读只挡日期格（翻页与钻层照常）；
  按住途中转入禁用或只读、钻层换视图、视窗挪动、拖选结束时由机器自行松开对应的那一个。触屏按下先投影按压面，拖选起点仍按
  延时落下，两者互不打断；手指滑到另一格抬起时松开先前按住的那一格。DateRangePicker 内嵌的日历复用同一份 connect，随之接上。
  皮肤按压面由 Action Control 家族配方给出；键盘表新增 `calendar-range-picker.kbd.press`。三端公开 props 与事件不变。
- 3e5079c: Cascader 与 Combobox 的 Layer、DismissableLayer 及 Cascader FocusScope 现在由 Headless 共享 Presence 资源控制器持有：逻辑关闭立即令 content `inert` 并退出可访问树，行为资源延后到全部有限 CSS 退场完成后释放；退场中重开会复用原 Layer，并重新激活 Cascader 焦点域。
- c2ca771: **Carousel 的两端翻页钮、播放开关与指示点接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`（`CarouselPressedKey`：`prev` / `next` / `autoplay` / `indicator:<页码>`），事件 `PRESS.START` / `PRESS.END` 挂根级；到边界的翻页钮与没配自动播放的开关不进，按住途中翻到边界、关掉 `loop` 或去掉 `autoplay` 时由机器松开。
  指示点皮肤的按压规则改为 `:is(:active, [data-pressed])`，并补 `forced-colors: active` 下的系统前景描边。键盘表新增 `carousel.kbd.press`；`CarouselPressedKey` 进公开面。三端公开 props 与事件不变。
- a35d0b2: **级联选择补齐首次加载的默认状态面。** 此前 `Content` 只自动装配 Empty；`collection=[]` 且
  `loading=true` 时，连接层会把 Empty 隐藏，却没有 Loading 接住，浮层只剩一圈没有内容的边框。
  Vue、React 与 Web Components 现在都会在作者未写 Loading 时自动补一枚，并读取新增的
  `CascaderTranslations.loading`（缺省 `Loading`）；作者显式写了 Loading 时只保留作者这一枚，
  不会并排生成第二份。

  Loading 只在当前视图没有候选时占据状态区。已有候选或已展开的祖先列仍保持可见、可操作，
  浮层只用 `aria-busy` 报告后台刷新；空态与在途态都以 `role="status"` 独立于各列的 listbox 语义。

- 92b0a56: **Cascader 列内条目、检索候选与清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressedPart`（`item` / `search-item` / `clear-trigger`）与 `pressedValue`（条目
  value 或候选整条路径的键，清空按钮记 null），根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个状态都认；守卫 `canPress` 在禁用、只读或加载时三者都不进，条目或候选自身禁用时不进，清空按钮没有值可清
  时不进；`endPress` 只松开 part + value 对应的那一个，open 态 exit 时随浮层收起一并松开，按住途中转入禁用 / 只读 /
  加载或值被清空时由机器自行松开。列内条目自己接键盘与触屏；检索视图里焦点恒在检索框，候选的键盘按压由检索框代发
  （Enter 按住时高亮候选投影），候选自己只接触屏。trigger 与 control 是字段外壳，不接。Collection Item（overlay 语境）
  与 Action Control（field-inset 档）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增
  `cascader.kbd.press` 与 `cascader.kbd.search.press`。三端公开 props 与事件不变。
- 3490b78: **CheckboxGroup 条目与全选格接入按压通道：Space 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行换面、方框随行换底）。**
  机器 context 新增 `pressedPart`（`item` / `select-all-trigger`，类型 `CheckboxGroupPressedPart`）与 `pressedValue`（按住的条目
  value，全选格为 null），事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }`；守卫 `canPress` 在整组禁用、
  只读或条目自身禁用时不进；`endPress` 只松开 part + value 对应的那一个；按住途中整组转入禁用或只读时由机器自行松开。
  `role=checkbox` 只有 Space 是激活键，Enter 不进按压面；选中与按压互相独立，Space 在 keydown 那一刻照旧翻转。皮肤的按压选择器
  已是 `:is(:active, [data-pressed])`（缩放归零，只换面）；键盘表新增 `checkbox-group.kbd.press`。三端公开 props 与事件不变。
- 4b0f2c0: **Checkbox 方框接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，根级事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 在禁用或只读时不进；按住途中
  转入禁用或只读时由机器自行松开。方框是原生按钮，Space 与 Enter 都是激活键，两键都进按压面；按压与勾选态互相
  独立，按住途中勾选态翻转不会丢掉按压面。皮肤按压面由 Action Control 家族配方给出（选择器已是
  `:is(:active, [data-pressed])`）；键盘表新增 `checkbox.kbd.press`。三端公开 props 与事件不变。
- c859508: **新增** `code-view` 组件：一段代码的逐行呈现，Vue 与 Web Components 两侧同时可用。

  它比 `code-block` 多出行号、指定行高亮、超长折叠与文件名四件，而这四件都建立在同一件事上——**逐行切分在连接层完成**。词法器是单趟不回溯的，一个记号可以横跨多行（未闭合的字符串与块注释就是这样），所以「一个记号一个 span」的渲染方式切不出行；行号与高亮行不是皮肤能反推出来的东西。切分保证无损：`lines.map(l => l.text).join('\n')` 逐字等于原文，着色实现即使给不全记号也用纯文本片段补齐。

  `lineNumbers` 的行号由皮肤用 `attr()` 画出来，因此**复制代码不会带上行号**，读屏也不会逐行念数字。`startLine` 让摘录与 patch 片段的行号对得上真实文件，`highlightLines` 收 `'3,7-9'` 或行号数组，写错的片段丢掉而不是让整段代码渲不出来。

  `clamp` 给出折叠阈值，`clamped` 是**纯受控**的：折叠态通常由页面上「全部展开 / 全部折叠」统一持有，组件内建一份只会跟它打架；要非受控就套 `collapsible`。折叠按钮带 `aria-expanded` 与指向代码区的 `aria-controls`。

  `complete` 与 `highlighter` 沿用 `code-block` 的取舍：未闭合默认不着色，着色端口返回 `null` 是合法结果、退回纯文本。渲了文件名节点它就成为代码区的可访问名，没渲则用 `translations.code` 兜底。复制不内建，与 `clipboard` 组合。

  **新增** 语义令牌 `--xh-text-code-leading`：代码行距从此有名字，`code-block` 与 `code-view` 都指向它，不再各写一份字面量。

- f204269: **CodeView 的折叠条接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  代码块此前没有状态机，按 button 的先例补最小机器 `codeViewMachine`（state `idle`，context `pressed`，事件 `PRESS.START` / `PRESS.END`，
  守卫 `canPress` 只在代码可折叠时放行——不可折叠时折叠条带 `hidden`；按住途中代码或阈值变了、折叠条随之收起时由机器松开）。

  **破坏性：`connectCodeView` 由 `(props, scope, normalize)` 改为 `(service, normalize)`**，与其余跑机器的组件同构；`CodeViewProps` 仍导出
  （= `CodeViewSchema['props']`），新增导出 `codeViewMachine`、`CodeViewSchema` 与 `isCodeViewFoldable`（connect 与守卫共用的可折叠判据）。
  直接调用 headless 的使用者需改为先建机器并把 scope 交给它。

  三端：Vue / React / Web Components 的 CodeView 改跑 `codeViewMachine`（公开 props、事件与部件不变）；`<xh-code-view>` 只在作者未给
  `highlighter` 时于 wire 阶段请求默认着色包，读 props 的路径不再触发加载。键盘表新增 `code-view.kbd.press`。

- 1e79021: **Collapsible 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 在开合两态都接；禁用时不进，按住途中转禁用时由机器松开。
  键盘表新增 `collapsible.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **集合件的三种非条目相位补齐：空 `empty`、在途 `loading`、还有更多 `load-more-trigger`。**

  同一个库里「筛完没有结果」这件事，级联和组合框有正式部件、树没有；「远程取数在途」只有表格有；「还有更多，去取下一页」哪家都没有。三条本来就是同一件事——集合件在没有条目可看时处在哪一种相位——现在按同一套名字、同一套收放判据铺开。

  **`loading` 部件**给到八家：`select` / `combobox` / `tree-select` / `cascader` / `mention` / `transfer` / `listbox` / `tree`。配一个新的 `loading?: boolean` prop，缺省 `false`，不写即与此前逐像素相同。为真时条目容器报 `aria-busy`，在途占位顶上来、空态占位让位——两者摆在同一个位置，永远不同屏。给了 `collection` 时收放全归连接层；条目手写时库数不出有几条，那一档只按 `loading` 收放，其余归作者。相位判据与 `table` 一致：已经有条目可看时两个占位都不顶上来。

  **`empty` 部件**补给 `tree`（放在 `root` 里、`tree` 的兄弟——`role=tree` 只许拥有 `treeitem` 与 `group`）。其余七家此前已有。

  **`load-more-trigger` 部件**给 `table` 与 `listbox`，与 `infinite-scroll` 上那一颗同名同角色：还有没有下一页、点了做什么都归作者，连接层只保证取数在途与整列禁用两档点不动，并按 `data-loading` / `data-disabled` 转述给皮肤。它是一颗铺满一行的按钮，带悬停底色与按压缩放。

  八家的根节点同时多出 `data-loading` 一位，供作者接线；在途的观感由只在取数期在场的 `loading` 部件承载，不额外压灰任何东西。

  **新增部件**：`loading` × 9（含 `table` 已有的那一份不计）、`empty` × 1、`load-more-trigger` × 2。**新增 Vue 组件导出**：`XhSelectLoading`、`XhComboboxLoading`、`XhTreeSelectLoading`、`XhCascaderLoading`、`XhMentionLoading`、`XhTransferLoading`、`XhListboxLoading`、`XhTreeEmpty`、`XhTreeLoading`、`XhListboxLoadMoreTrigger`、`XhTableLoadMoreTrigger`。

- e124792: **ColorField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，按压与清空同一道 `canClear` 守卫（未开 clearable、
  禁用、只读或没有值时不进）；按住途中值被清空、关掉 clearable 或转入禁用 / 只读时由机器自行松开。清空按钮的
  pointerdown 仍拦默认聚焦，焦点留在输入框。键盘表新增 `color-field.kbd.press`。三端公开 props 与事件不变。
- 74004f7: **新增** `color-field` 组件（颜色字段）：一个能手打颜色串的单行框，旁边一块当前颜色的色块。

  - 认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`；打字只留草稿（`data-editing`），回车或失焦收下后按 `format` 重写成规范写法，`alpha` 决定带不带透明度；Escape 放弃草稿；收不下的草稿留在框里并标成无效。
  - 空串是合法的「没有颜色」：`clearable` 开清空按钮与 Escape 清空；表单出口经 `hidden-input` 提交收下的值，框里的半截字不会被提交。
  - 视觉盒走 Field Chrome、色块走 Swatch 家族、清空按钮走 Action Control 的 field-inset 档；放进 `field` 里时说明、错误与四条状态轴随字段下发。
  - Vue `XhColorField*` 与 `useColorField`；React 同名组件与 hook；自定义元素 `<xh-color-field>`（`value` / `default-value` / `format` / `alpha` / `clearable` / `name` 等 attribute，`translations` 只走 property；`setValue` / `clear` / `commit` 命令式方法与 `canClear` / `editing` 只读属性）；皮肤 `@xihan-ui/styles/color-field.css`，覆盖槽前缀 `--xh-color-field-*`。

- 33aa758: ColorPicker 与 HoverCard 现在复用 Headless Presence 行为资源控制器：逻辑关闭立即令 content `inert` 并退出可访问树，Layer、DismissableLayer 及 ColorPicker FocusScope 延后到有限 CSS 退场完成后释放；退场中重开复用原资源。
- 740e2e7: **ColorPicker 屏幕取色按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级；禁用、只读或环境没有 EyeDropper 时不进；屏幕取色一开
  （窗口随即失焦）、浮层收起，或按住途中转入禁用 / 只读时由机器松开。皮肤里取色按钮的按压规则由 `:active` 改为
  `:is(:active, [data-pressed])`，并在 `forced-colors: active` 下用系统高亮反色画回按压面。键盘表新增 `color-picker.kbd.press`。
  三端公开 props 与事件不变。
- 8503826: **新增** `color-slider` 组件（颜色滑块）：一条只推颜色某一路的滑杆，值是整个颜色串。

  - `channel` 七选一：`hue`（0-360）、`saturation` / `brightness` / `alpha`（0-100）、`red` / `green` / `blue`（0-255）；`format` 决定写法，`alpha` 决定串里带不带透明度（缺省时推透明度那一路带、其余不带）。
  - 轨道渐变由连接层按当前颜色现算写成内联 `background-image`（其余分量不动，只让本通道从 min 走到 max），拇指填当下那一档的颜色；透明度那一路皮肤垫棋盘格。
  - 拖动、键盘（方向键 / PageUp / PageDown / Home / End）、RTL 掉头与竖直排布整份取自内嵌的 `slider` 机器；`onValueChange` 拖动中连发，`onValueChangeEnd` 松手只发一次；灰度处色相靠锚保住。
  - Vue `XhColorSlider*` 与 `useColorSlider`；React 同名组件与 hook；自定义元素 `<xh-color-slider>`（`value` / `default-value` / `channel` / `format` / `alpha` / `orientation` / `dir` / `size` / `name` 等 attribute，`translations` 只走 property）；皮肤 `@xihan-ui/styles/color-slider.css`，覆盖槽前缀 `--xh-color-slider-*`。

- 5b8a8fd: **ColorSwatchPicker 色格接入按压通道：Space 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（换描边并缩放）。**
  机器 context 新增 `pressedValue`（正被按住的格子，按颜色串记），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
  守卫 `canPress` 在整组禁用、只读与格子自身禁用时不进，按住途中整组转入禁用或只读时由机器自行松开。role=radio 只有
  Space 是激活键，Enter 那一路没有按压面。ColorPicker 内嵌的预设色板复用同一份 connect，随之接上。键盘表新增
  `color-swatch-picker.kbd.press`。三端公开 props 与事件不变。
- 1b63bf3: **新增** `color-swatch-picker` 组件（颜色色块选择器）：从一组固定颜色里挑一个，每格是一颗 `role=radio` 的色块。

  - 与单选组同一套 roving tabindex：整组一个 Tab 位，四个方向键移焦点并选中、回绕、跳过禁用格，Space 选中；焦点从组外进来落在已选中的格子上。
  - 选中按颜色比不按串比（`rgb(255, 0, 0)` 与 `#ff0000` 是同一格）；`swatches` 给数据时可及名字与禁用从数据里查，格子部件只报 `value`，不写默认内容时按数据自动铺开。
  - 每格的色块面走 Swatch 家族；`readOnly` 只挡落值不挡焦点；表单出口是每格内一份 `inert` 的隐藏原生 radio。
  - Vue `XhColorSwatchPicker{Root,Label,Item}` 与 `useColorSwatchPicker`；React 同名组件与 hook；自定义元素 `<xh-color-swatch-picker>`（`value` / `default-value` / `disabled` / `read-only` / `invalid` / `required` / `dir` / `name` / `size` attribute，`swatches` 与 `translations` 只走 property；格子部件用 `value` / `label` 属性声明）；皮肤 `@xihan-ui/styles/color-swatch-picker.css`，覆盖槽前缀 `--xh-color-swatch-picker-*`。

- 216095b: **新增** `color-swatch` 组件（颜色色块）与 Swatch 色块面家族配方。

  - 色块把一个颜色画成一小块给人看，不接交互：认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`，解析不出时只画棋盘格底并带 `data-invalid`；`label` 给读屏一个有含义的名字，不给就念颜色串，两者都没有时整块视为装饰。
  - 家族配方 `@xihan-ui/styles/swatch.css`（`recipes/swatch.recipe.json` 生成）：棋盘格底、颜色填充层、描边与 sm / md / lg 尺寸档只有这一份真源，消费者投影 `data-xh-swatch` / `data-xh-swatch-size` 并经私有槽 `--xh-_swatch-color` 写入颜色；高对比模式退出强制着色保住原色，打印保留底色。色块选择器、颜色字段与取色器里的当前色块随后都改吃它。
  - Vue `XhColorSwatch`；React 同名组件；自定义元素 `<xh-color-swatch>`（`value` / `size` / `label` 三个 attribute）；皮肤 `@xihan-ui/styles/color-swatch.css`，覆盖槽前缀 `--xh-color-swatch-*`。

- e2956f1: **Combobox 候选、展开按钮与清空按钮接入按压通道：Enter / Space 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressedPart`（`item` / `trigger` / `clear-trigger`）与 `pressedValue`（候选
  value，两个按钮记 null），根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个
  状态都认；守卫 `canPress` 在禁用、只读或加载时三者都不进，候选自身禁用（部件声明或 collection）时不进，清空按钮没有
  东西可清时不进；`endPress` 只松开 part + value 对应的那一个，open 态 exit 时候选随浮层收起一并松开，按住途中转入
  禁用 / 只读 / 加载或值与输入串都被清空时由机器自行松开。焦点恒在输入框：候选的键盘按压由输入框代发（Enter 按住时
  高亮候选投影），候选自己只接触屏；两个按钮在焦点落到自己身上时由 Enter / Space 按住投影。Collection Item（overlay
  语境）与 Action Control（field-inset 档）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增
  `combobox.kbd.press`。三端公开 props 与事件不变。
- a2a1be7: **Command 接入 Collection Item 配方：面板改 overlay 圆角 + sheet 三件套，命令补按下面，结果列表三端接自绘条。**

  - 命令投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽。`aria-selected` 仍跟着活动候选走，家族的浮层选中面映射到与悬停同一档（`--xh-bg-subtle`），不投影对号槽，视觉上仍不绘制对号或选中底；按下 200（`--xh-bg-subtle-hover`，此前零反馈）与禁用面由家族给，新增 `--xh-command-item-bg-pressed`。
  - 面板由「surface 8px 圆角 + `--xh-bg-surface` + `--xh-elevation-sheet` 无描边」改为与 Dialog 同档：`--xh-shape-overlay` 12px 圆角，`--xh-material-elevated-border` 描边 + `--xh-material-elevated-bg` 底 + `--xh-material-elevated-shadow` 影，新增 `--xh-command-border`；`--xh-command-bg` / `--xh-command-fg` / `--xh-command-shadow` / `--xh-command-radius` 槽名不变、缺省随之改变。
  - 结果列表接自绘条：Vue / React `useScrollbars`、Web Components `ScrollbarsController`，壳是面板自己，条子走 4px 档；list 补 `overscroll-behavior: contain`，content 声明 `--xh-scrollbar-track-bg: transparent`。
  - 定位层与面板上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
  - 皮肤体积基线随面板三件套与家族槽映射重落（10621 → 11969 字节）。

- 652936c: **Command 命令接入按压通道：Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增
  `pressedValue`（命令 value），根级事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }` 两个状态都认；守卫
  `canPress` 在加载中不进，命令自身禁用（部件声明或清单）时不进；`endPress` 只松开 value 对应的那一条，open 态 exit 时随
  面板收起一并松开，按住途中转入加载时由机器自行松开。焦点恒在检索框，命令的键盘按压由检索框代发（Enter 按住时锚点命令
  投影），命令自己只接触屏。Collection Item（overlay 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；
  键盘表新增 `command.kbd.press`。三端公开 props 与事件不变。
- 57adc57: Command 与 Tooltip 现在由 Headless Presence 资源控制器持有真实退场资源：逻辑关闭立即令 content
  `inert` 并退出可访问树，Layer、DismissableLayer 及 Command 的 FocusScope、滚动锁与背景失活延后
  到全部有限 CSS 退场完成后释放；退场中不重复消解，重开复用原资源。Tooltip 原有开闭延时与
  trigger/content 间悬停语义保持不变。
- 2c5c5ac: **新增** `command` 组件（命令面板）：Vue 与 Web Components 两侧同时可用，组件数 125 → 126。

  一块盖在页面上的检索面板：打字筛出命令，方向键选，回车执行。功能散在很多层菜单里、
  用户知道要做什么却找不到入口时用它。

  它由既有地基组合而成，没有新造轮子：浮层的开合、焦点陷阱、滚动锁与背景失活照 `dialog` 那一套；
  检索框的 `role=combobox` 与 `aria-activedescendant` 照 `combobox`；结果列表是 `role=listbox`；
  唤起的快捷键与行尾的键帽用 `hotkeys`，命中片段的标注用 `highlight`——后两件由使用者组合，
  库不把它们焊进来。

  与 `combobox` 的分工：那一族把过滤留给调用方，这一族自己做。命令清单经 `collection` 交进来，
  按检索串逐词筛（`keywords` 让一条命令同时认英文名、拼音与旧称）、按 `group` 归组、空组自动丢掉。
  条目节点只报 `value`，此刻露不露面由连接层打的 `hidden` 说了算——铺开与手写部件因此产出同一棵 DOM。
  远端检索把 `filter` 置否即可关掉内置过滤。

  承诺的行为：面板是模态浮层，Escape 与点遮罩收起、收起后焦点还给触发按钮；焦点全程在检索框，
  锚点经 `aria-activedescendant` 报给读屏，方向键跳过禁用项；打字后锚点自动钉回首条命中项；
  空态与在途两个占位不同屏。`closeOnSelect` 决定选完收不收。

  实现细节，不进承诺：过滤与方向键落点走的是数据而不是活 DOM（因此开场首帧锚点就准）；
  面板贴着视口上沿摆，位置由皮肤的 inset 排布，不问定位引擎要坐标。

  动效沿用既有关键帧，不新增名字：遮罩 `xh-fade-in` / `xh-fade-out`，面板 `xh-overlay-pop-in`
  （`--xh-_overlay-enter-down` 让它从上方落下一小段）与 `xh-pop-out`，结果逐条 `xh-rise-in`，
  交错间隔走 `--xh-motion-stagger-step`，第六条起统一钉在第五级。

  体积：新增一份皮肤 `command.css`（去注释压空白后 11.1 kB），`.size-limit.json` 里 styles 那条的
  限额未动。

  新增的公开面：`@xihan-ui/headless` 14 个值导出与 13 个类型导出（`connectCommand` / `commandMachine` /
  `commandAnatomy` / `commandMeta` / `commandKeyboard`、过滤那一层的 `normalizeCommandQuery` /
  `matchesCommandTerms` / `flattenCommandGroups` / `resolveCommandGroups` / `resolveCommandNode` /
  `navigateCommandResults` / `COMMAND_UNGROUPED`，以及 `CommandSchema` / `CommandApi` /
  `CommandNode` / `CommandGroup` 等类型）；`@xihan-ui/vue` 12 个组件加 `useCommand` 与
  `CommandRootSlotProps` / `CommandContext`；`@xihan-ui/web-components` 的 `<xh-command>` 与
  `XhCommandElement`（17 个 attribute，另有 `collection` / `groups` / `translations` 三个 property
  与 9 个取数口）；`@xihan-ui/styles` 多一条子路径导出 `@xihan-ui/styles/command.css`，随之出
  55 个使用者槽（`--xh-command-*`）。

- 49ed6b0: **修复**四处「想改一处视觉，改不动，或者调 A 把 B 一起改了」。四处都补了新槽名；被顶替的旧名不留兼容位，删掉的名字逐条列在「摘掉全部旧名兼容层」那份里。

  **toggle-group 整件不接语气轴。** 同族的 toggle 与 segmented 都发 `data-tone`，只有它不发，选中档的底、悬停底、按下底、前景与描边一律钉死在品牌色上——把一组开关放进 `data-tone="danger"` 的区域里，旁边的 toggle 变红，它一点不变。补上 `tone` prop 与 `data-tone`，选中档与「禁用且选中」档改读语气槽（`--xh-_tone` / `-hover` / `-active` / `-on`），没有语气时逐值退回原来的品牌配色。使用者的组件槽仍排在语气之前：写了 `--xh-toggle-group-item-bg-on` 就以它为准。顺带把作用在条目上的圆角槽改名成带部件段的 `--xh-toggle-group-item-radius`，与同文件另外 22 个条目槽同段；`--xh-toggle-group-radius` 已删。

  **button-group 把使用者的圆角槽写成 0。** 组在根上直接写 `--xh-button-radius: 0` 让段与段接成一条，可那正是使用者改按钮圆角的入口：设了胶囊按钮，进了组就静默归零，而且组内怎么写都盖不回来——继承来的值压不过组根上的那条声明。改成写私有槽 `--xh-_button-group-radius`（与同文件高度、内距、间距、字号四项一致），按钮的圆角兜底链插进这一层。不写覆盖时段与段照旧是直角，两端的圆角照旧归 `--xh-button-group-radius` 管。

  **navigation-menu 的两种面板形态共用一个内衬槽。** 逐项面板 content 的默认内衬是一档，共享外壳 viewport 是两档，两处却都读 `--xh-navigation-menu-content-p`——使用者一改，两者一起走，缺省的这一档差值再也调不开。外壳另立 `--xh-navigation-menu-viewport-p`，缺省仍是两档；`--xh-navigation-menu-content-p` 从此只管 content 那一处。

  **typography 一个槽吃掉六个语气。** `--xh-typography-text-fg` 同时管次要文字档与全部六个语气档，两条规则同权重：想把次要文字调淡一点，六族语气当场一起塌成同一个灰。拆成 `--xh-typography-text-fg-muted` 与 `--xh-typography-text-fg-tone`，`--xh-typography-text-fg` 已删。

- 21bcb16: **ContextMenu 接入 Collection Item 配方：条目按下面由 300 改 200，浮层条子走 4px 档并补 overscroll 隔离。**

  - 条目投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子菜单触发项由子层的 Menu 机器合并同一批标记并在子层开着时报 `data-in-path`。
  - 悬停 / 键盘锚点 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-context-menu-item-bg-pressed` 缺省随之改变。
  - 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；根与定位层上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档，content 上的重复声明删除。
  - content 补 `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`（浮层里的条子走 4px 档）。

- 921463b: **ContextMenu 条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  触发区的长按等待已占用 `PRESS.START` / `PRESS.END`（`closed → pressing`，投影 `data-pressing`），条目的按压另起
  事件 `ITEM.PRESS.START { value, disabled }` / `ITEM.PRESS.END { value }`，写入新增的 context `pressedValue`，不复用
  `pressing` 状态；守卫 `canPressItem` 在条目禁用（部件声明或 collection）时不进，`endItemPress` 只松开 value 对应的
  那一条，open 态 exit 时由机器自行松开。条目 getter 投影 `data-pressed`，Collection Item 家族配方的按压选择器已是
  `:is(:active, [data-pressed])`；键盘表新增 `context-menu.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **数据展示族补能力：描述列表补跨列、统计数补涨跌、时间线补坐标列、JSON 视图补空态、树与 JSON 视图补形态轴、无限滚动补取下一页的按钮。** 纯新增，公开面一个名字都没删。

  **描述列表的跨列。** `descriptions` 的 `getItemProps` 从零参改成收一个可选的 `DescriptionsItemProps`（`{ span?: number }`），产出 `style.gridColumn`；`span` 钳在 1 与当前 `columns` 之间——跨出网格的格子会另起一行，比截断更难看。旧的零参调用照样成立。Vue 侧 `XhDescriptionsItem` 补 `span` prop，Web Components 侧从格子自己的 `span` 特性上读。

  **统计数的涨跌。** `statistic` 补 `trend` 部件与 `trend` prop（`up` / `down` / `flat`），方向落成部件上的 `data-direction`，皮肤据它出兜底箭头——示例里不必再手打箭头。`trend` 与 `tone` 保持正交，方向与颜色互不联动：跌也可以是好事（差错率、退货率），要不要联动由作者自己定。新增令牌 `--xh-glyph-mark-arrow-down`（`arrow-up` 与 `minus` 早已在册）。

  **时间线的坐标列。** `timeline` 补 `label` 部件：与内容对置的那一列，装这一条的日期或版本号。竖排三种侧别各给它一条轨道——结束侧占线之前那列、起始侧占线之后那列、逐条交替时恒在内容对面，时间戳因此不再跟着内容左右横跳。`time` 留在 `content` 里不动，两者语义不同：`label` 是这一条的坐标，`time` 是内容的一部分。横排不为它单开轨道。

  **JSON 视图的空态。** `json-viewer` 补 `empty` 部件与 `api.isEmpty` / `api.emptyText`：一行也摊不出来时（`value` 没给或给的是 `undefined`）由它说话，有行可摊时组件给它打 `hidden`。文案走新增的 `translations.empty`（缺省 `No data`），Vue 侧另有一个 `empty` 插槽，Web Components 侧由元素铺兜底文案。**这一件会改 DOM**：两个适配器都会在根里多渲一个 `[data-part='empty']` 节点，有数据时它带 `hidden` 不占位置；写了 `:last-child` 一类结构选择器的使用者要复核。

  **两条形态轴。** `tree` 与 `json-viewer` 各补 `variant`（`'plain' | 'surface'`），落成根上的 `data-variant`。**缺省是 `surface`，逐值与从前相同**；`plain` 是新增档，边框留着但转成透明——去掉外框不会让行的位置跳一格。皮肤同批把那两条边框与底色的声明改成「使用者令牌 → 私有槽 → 语义令牌」三级，使用者写的 `--xh-tree-border` / `--xh-json-viewer-bg` 仍排在形态之前。

  **无限滚动的键盘等价通路。** `infinite-scroll` 补 `load-more-trigger` 部件：一颗真按钮，点它与哨兵进可视区走同一段（机器新增 `LOAD` 事件，取数中与关掉两段同样不响应），按钮在这两段自动 `disabled` 并带 `data-loading` / `data-disabled`。读屏在虚拟光标模式下不产生滚动事件，只靠哨兵那条路取不到第二页——这颗按钮是它的等价入口。**文案由作者写在按钮里，组件不代填可及名字**：写死一句英文会与可见文字对不上，读屏念的与眼睛看的就分了家。部件是可选的，不写它的页面 DOM 一字不变。文档首段同批改口径：本组件是「取下一页」的通用触发器，滚动只是默认的触发方式。

  体积（去注释压空白后）：`statistic.css` 2190 → 3559 字节、`timeline.css` 9561 → 11643 字节、`json-viewer.css` 7740 → 8710 字节、`tree.css` 13253 → 13455 字节、`infinite-scroll.css` 447 → 2123 字节；`descriptions.css` 未动。涨的是新增部件的排版块与两条形态轴的槽赋值。

- 441c426: **DateField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，守卫 `canPress` 与清空按钮的显隐同一口径（可编辑且在用的
  段里填了哪怕一段，禁用、只读或一段都没填时不进）；按住途中段位被清空或转入禁用 / 只读时由机器自行松开。清空按钮的
  pointerdown 仍拦默认聚焦，焦点留在段位上。date-picker / date-range-picker 自家的清空按钮由各自的根机器负责，不在此列。
  键盘表新增 `date-field.kbd.press`。三端公开 props 与事件不变。
- fa05663: **DatePicker 触发钮、清空钮、确认钮、快捷选项与时间格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针
  `:active` 同一副按压面。** 编排机器 context 新增 `pressed`（按 key 记住正被按住的那一个，新增导出类型 `DatePickerPressedKey`；
  日历里的翻页钮、标题与日期格由 calendar-picker 自己投影），事件 `PRESS.START` / `PRESS.END` 挂根级：整体禁用谁都不进；
  只读时触发钮与确认钮只管开合、照有回执，清空钮、快捷选项与时间格与它们的写值同一道门不进；与模式不配、不可用或作者禁用的
  快捷选项不进，藏起的确认钮不进。浮层收起时浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值 / 确认收起，不再有 keyup）；
  按住途中转入禁用 / 只读或值被清空同样自行松开。键盘表新增 `date-picker.kbd.press`。三端公开 props 与事件不变。
- 9e57b36: **DateRangePicker 触发钮、清空钮与快捷选项接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 编排机器 context 新增 `pressed`（按 key 记住正被按住的那一个，新增导出类型 `DateRangePickerPressedKey`；日历里的
  翻页钮、标题与日期格由 calendar-range-picker 自己投影），事件 `PRESS.START` / `PRESS.END` 挂根级：整体禁用谁都不进；只读时
  触发钮照常展开、照有回执，清空钮与快捷选项与它们的写值同一道门不进；不成一对、不可用或作者禁用的快捷选项不进。浮层收起时
  浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值收起，不再有 keyup）；按住途中转入禁用 / 只读或值被清空同样自行松开。
  键盘表新增 `date-range-picker.kbd.press`。三端公开 props 与事件不变。
- d374f89: **新增** `date-range-picker` 组件（日期范围选择器）：起止两组可键入的分段日期框、`range-separator`、日历触发器与内嵌 `calendar-range-picker` 的浮层组合成一个字段，承接原 `date-picker` `selectionMode="range"` 那一路。

  - 值恒为区间两端 `[start, end]`，按位存放，空缺的一端用空串占位（只填了终点是 `['', end]`），受控回写按同一份下标认领；`api.start` / `api.end` 直接取两端，两端都落定时 `periodValue` 给出周期首尾与回显键。
  - `name` 与 `endName` 各自决定两份 `hidden-input` 参不参与提交；`segment-group` 带 `data-index`（0 起点、1 终点），方向键换段不跨组，两组各报「开始日期」「结束日期」（`translations.startDate` / `endDate`）。
  - 浮层里是范围日历：先落起点再落终点，两端都落定才写值并（`closeOnSelect`）收起；`min` / `max` / `isDateUnavailable(value, anchor)` / `allowsNonContiguousRanges` / `visibleCount` / `granularity` 一并转给日历；终点早于起点或任一端越界时整个字段标为不合法。
  - `presets` 只收区间（`start/end` 写法），`dateRangePickerPresetRange` / `dateRangePickerPresetMonth` / `dateRangePickerPresetYear` 三个纯函数按时区算「近 N 天」「本月」「今年」。
  - Vue `XhDateRangePicker*` 与 `useDateRangePicker`；React 同名组件与 hook；自定义元素 `<xh-date-range-picker>`（`value` / `default-value` 是数组，只走 property）；皮肤 `@xihan-ui/styles/date-range-picker.css`，覆盖槽前缀 `--xh-date-range-picker-*`。

- 38efe68: 修复日期时间选择器的完整分段显示，统一清空按钮与选择图标的互斥状态，并为字段聚焦、日历按压和组件内部滚动补齐一致的反馈。
- 1587d60: DatePicker 与 TimePicker 现在复用 Headless Presence 行为资源控制器：逻辑关闭立即令 content `inert` 并退出可访问树，Layer、DismissableLayer 与 FocusScope 延后到有限 CSS 退场完成后释放；退场中重开复用原资源并重新激活焦点域。
- 09a1a45: Dialog 与共用机器的 Drawer 在退出期间立即失活内容，保持模态资源直到内容和遮罩实际完成退出，并提供 onExitComplete/exit-complete 通知。重开撤销旧退出且恢复原焦点域，卸载立即清理。

  Presence.claimExit 删除 timeoutMs 参数，CSS 退出不再猜测声明时长或首个事件完成，而等待全部实际有限动画对象完成或取消；自定义租约必须由创建方完成或取消。FocusScope 增加 reactivate()，供保留中的焦点域恢复域内焦点。

- ccec02d: **新增** `diff-view` 组件：一份改动的逐行呈现，单栏与并排两种形态，Vue 与 Web Components 两侧同时可用。

  **两个入口归一到同一个模型**：`computeTextDiff(before, after)` 拿新旧两版全文算（Myers 最短编辑脚本），`parseUnifiedPatch(patch)` 解析统一格式的补丁；组件只认模型，两种输入在 AI 场景里都真实存在。另导出 `diffStats(model)` 数增删。

  **着色在建模时一次算好，不在连接层跑。** `computeTextDiff` 手里有两份完整文本，整体切一次再按行取，跨行的块注释与多行字符串才不会着错色；`parseUnifiedPatch` 拿不到完整文件，因此**一律不填着色**——宁可不着色也不错着色，与代码视图「未闭合默认不着色」是同一条取舍。

  `maxLines` 是必须有的上限：AI 会吐超大文件，超出即截断并在根上标出来。编辑距离超过内部上限时整段按「全删全增」呈现——那种情况下两份文本几乎没有共同行，逐行对齐既算不快也读不出意义。

  表格语义完整：`role=table` 配 `role=row` 与 `role=cell`，带 `aria-rowcount` / `aria-rowindex` / `aria-colcount` / `aria-colindex`。**列数只数真正暴露的内容列**——行号不算列，它不给 role、对读屏隐藏、由皮肤用 `attr()` 画出来，所以复制差异不会带上行号。并排视图里空的那一侧**照发格子**，否则列号会串位。每一行都带一段视觉隐藏的变更类型文字：变更不能只靠颜色传达。

  **刻意不采表格那套行级 roving**：只读差异不是网格，给每份差异一个吞方向键的焦点组会把页面滚动抢走，而读屏本来就有表格浏览模式。整份差异只占一个 Tab 停靠点。

  `contextLines` 把远离变更的连续上下文折成一格，展开集合可受控。

  **新增** 语义令牌 `--xh-diff-added-bg` / `--xh-diff-added-fg` / `--xh-diff-removed-bg` / `--xh-diff-removed-fg`：增删两色随主题明暗切换。

- 12958c2: **DiffView 的展开按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  diff-view 机器 context 新增 `pressedValue`（按折叠格 id 记），事件 `PRESS.START { value }` / `PRESS.END { value }`；按住途中那一格被展开
  （Enter 在 keydown 即 click，折叠格离开行序）时由机器松开，受控写回同样松开。`<xh-diff-view>` 在行序未变时也刷新展开按钮的属性，
  按压面不再被「内容未变不重铺」挡住。键盘表新增 `diff-view.kbd.press`。三端公开 props 与事件不变。
- 009167e: **Editable 编辑 / 提交 / 撤销三颗按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 part 键记住正被按住的那颗，新增导出类型 `EditablePressedPart`），事件
  `PRESS.START` / `PRESS.END`：预览态只认编辑按钮（禁用 / 只读时不进），编辑态只认提交 / 撤销按钮；进出编辑态时由机器
  自行松开（Enter 在 keydown 即激活，随后按钮藏起不再有 keyup），按住编辑按钮途中转入禁用 / 只读同样自行松开。
  提交 / 撤销按钮的 pointerdown 仍把焦点摁在输入框里。键盘表新增 `editable.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **反馈与状态族补十一项能力，全部是加法：不渲染新部件、不写新 prop 的既有用法逐值不变。**

  **`alert` 补 `content` 与 `action` 两个部件。** `content` 是文本列容器，套上它标题与说明就排成真正的一列；不套时 root 那层 `flex-wrap` 的旧排法一字未动。`action` 是操作槽，圈出按钮区、自占一行——此前全族只有 `alert` 是「能关不能做」的一件。Vue 侧新增 `XhAlertContent` / `XhAlertAction`，Web Components 侧新增两个 `csspart`。新增覆盖槽 `--xh-alert-content-gap` 与 `--xh-alert-action-gap`。

  **`toast` 补 `indicator` 与 `progress` 两个部件。** `indicator` 让作者换得掉那枚严重度字形：不渲染它时 root 伪元素上的兜底字形照旧，渲染了就由 `:has()` 让位，一行里不会出现两枚图形；部件为空时皮肤按 `data-severity` 画同一套兜底字形（`loading` 那一档连自转一起带上，并各自配了两块减弱动效停表）。`progress` 是倒计时条：连接层把机器算出的停留时长写进 `--xh-toast-progress-duration`，不自动消失的那些整条收起；指针悬停或焦点停留把计时按住时，动画随 `data-paused` 一并停住。新增 api 只读字段 `duration`，新增覆盖槽 `--xh-toast-progress-thickness` / `--xh-toast-progress-bg`。

  **`notification` 补 `item-progress` 部件**，与 `toast` 的那条同一件事：横跨卡片、走同一条 `xh-countdown`、同样随 `data-paused` 停表。新增 api 只读字段 `duration`，新增覆盖槽 `--xh-notification-progress-thickness` / `-radius` / `-bg`。

  `toast` 与 `notification` 的 `data-paused` 此前登记在 `check-dead-state-attr` 的「解剖里没有能承载停表的部件」名下，两条登记随这两个部件删除。

  **`loading-bar` 补 `peg` 部件**：跟在进度段末端的一道亮边，作者也可以往里塞自己的图形。它是纯装饰，进度仍由 range 的宽度与 root 上的 `aria-valuenow` 表出；高对比档整层背景图被丢弃，这一档由 range 自己的底色接住。新增覆盖槽 `--xh-loading-bar-peg-w` / `-fg`。

  **`empty-state` 补 `media` 部件**：插画槽，与图标槽二选一，尺寸另走一档（缺省由图标档翻一倍派生，跟着三个尺寸档走）。插画塞进按字形量的图标槽会被压到 40px 以下，这是它此前无处可放的原因。新增覆盖槽 `--xh-empty-state-media-size` / `-fg`。

  **`empty-state` 补语气轴 `tone`**（六值，不写即维持中性）。写了就把图标区的强调色接到语气层派生好的前景档上；两条规则排在状态码那几条之后，`status` 与 `tone` 都写时以显式的语气为准。

  **`spinner` 补形态轴 `variant`**（`ring` / `arc` / `dots`，缺省 `ring` 逐值等于现状）。`arc` 用锥形渐变加一圈环形遮罩画渐隐弧，转的还是同一条 `xh-spinner-rotate`；`dots` 是一行三点整组呼吸，自带 `xh-spinner-dots` 与两块减弱动效停表。高对比档会把整层背景图丢掉，两档在那一档里退回描边画法。

  **`skeleton` 补动效轴 `animation`**（`shimmer` / `pulse` / `none`，缺省 `shimmer` 逐值等于现状），落在容器的 `data-animation` 上。`pulse` 撤掉微光那层、整根条子在原色与禁用档之间来回淡（自带 `xh-skeleton-pulse` 与两块停表），`none` 两层动效都撤掉只留底色。新增覆盖槽 `--xh-skeleton-pulse-duration`。

  **`progress` 补语义轴 `semantics`**（`progress` / `meter`，缺省 `progress`）。`meter` 档发 `role="meter"` 并且 `indeterminate` 不再生效——磁盘占用、电量、评分这类量没有「未知」这一档。不新建组件：两者的皮肤逐行同构，拆开只会多出一份要同步维护的孪生皮肤。新增 api 只读字段 `semantics`。

- 1ff2803: **FieldArray 新增把手与行内的删除 / 上移 / 下移把手接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针
  `:active` 同一副按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，行内把手按机器分配的行序号区分；
  新增导出类型 `FieldArrayPressedKey`），事件 `PRESS.START` / `PRESS.END` 挂根级；整体禁用 / 只读，以及到上下限、首末行
  这类 aria-disabled 的把手不进。删除 / 换序落地后把手随行离场或换位时由机器当场松开；按住途中转入禁用 / 只读，或作者
  整份换掉值使该行离场时同样松开。键盘表新增 `field-array.kbd.press`。三端公开 props 与事件不变。
- 5c202e3: **FileUpload 选择钮、逐条删除钮与清空钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，删除钮按文件标识；新增导出类型 `FileUploadPressedKey`），
  事件 `PRESS.START` / `PRESS.END` 挂根级，禁用时不进；按住途中转入禁用，或按住的删除钮随文件一起离开列表（Enter 在 keydown
  即删）时由机器自行松开；选择钮打开系统文件框后随窗口失焦撤下。投放区仍不投影（按下回执由拖入态给出）。皮肤里三颗钮的按压规则
  由 `:active` 改为 `:is(:active, [data-pressed])`，并在 `forced-colors: active` 下用系统高亮反色画回按压面。键盘表新增
  `file-upload.kbd.press`。三端公开 props 与事件不变。
- cf2e555: 为 FloatButton 建立专用 Headless 状态机与逻辑浮层生命周期。click/hover 展开后由同一
  Document 的 LayerRegistry 仲裁层外 pointerdown 和全局 Escape，后开的 Drawer/Popover
  优先消解，Toast 反馈通道不占可消解父层；关闭、禁用写回与卸载均精确释放资源。

  受控实例的交互只派发 open-change 意图，父级写回前不改可见 DOM；hover 模式的层外
  pointer/focus 由同一次 pointerleave 收口，disabled watch 每次变更只派一次意图。三端适配器仅桥接 RuntimeConfig、
  LayerRegistry 登记函数与根节点引用。

- 1f472ba: `floating-panel` 接上退场闸门，并补上进退场动画。

  此前它是浮层族里唯一没接 presence 的一个：收起那一帧定位层直接 `display: none`，退场动画连播都播不出来。现在两个适配器都把定位层的收起从「跟着展开态」改成「跟着 presence」——退场动画播完才真收。

  皮肤补一对关键帧（`xh-pop-in` / `xh-pop-out`，与锚定浮层族同一份内容），挂在 `positioner` 上：面板整棵子树都在它底下，收起与动画落在同一个节点才不会互相掐掉。随之撤掉 `[data-part='positioner'][hidden] { display: none }`——留着它退场一帧都播不出来，真正的收起改由适配器写内联 `display`。

  Vue 侧 `FloatingPanelContext` 多出 `positionerRef` 与 `visible` 两个字段。

- fa08fb4: **新增**文本输入与表单外壳族的能力补齐，九个组件共 16 条，全部是加法：部件、prop、覆盖槽都是新增，一个都没删也没改名，不改一行代码升上来渲染逐值不变。

  **装饰段**。`text-field` 与 `number-field` 各补 `prefix` / `suffix` 两个部件，流式排在 `input` 两侧、随 `data-disabled` 变淡、`aria-hidden` 不进可及树。框内摆货币符、单位或图标不必再自己套节点：

  ```vue
  <XhTextFieldControl>
    <XhTextFieldPrefix>¥</XhTextFieldPrefix>
    <XhTextFieldInput />
    <XhTextFieldSuffix>元</XhTextFieldSuffix>
  </XhTextFieldControl>
  ```

  **字数提示**。`text-field` 与 `tags-input` 各补 `count` 部件与 `showCount` prop；不写子节点时自己渲「已用 / 上限」，`TextFieldApi` 另开 `count` / `maxLength` / `showCount` 三个只读项。机器早就算得出 `atLimit`，现在有承载它的落点。

  **口令强度**。`password-input` 补 `strength-meter` 部件与 `strength` prop（0–4 五档，夹回区间后落 `aria-valuenow` 与 `data-level`，不给即整条收起）。打分算法归调用方——库不猜什么叫「强」。

  **分段与只读**。`pin-input` 补 `group` / `separator` 两个部件（`123-456` 这类分段写法有了角色节点，下标仍按文档序算）、逐格补发 `data-empty`，并补 `readOnly` 与 `required` 两个 prop（原生 `readonly` / `required` 加机器守卫，从此不必用全禁用代替只读）。

  **就地编辑的三条轴**。`editable` 补 `variant` / `tone` / `size`：尺寸换根上四个私有槽，形态给 outline / subtle / ghost 三档，语气落在聚焦描边与提交钮上。三颗按钮刻意不进尺寸档——比框小一号是形上的固定关系。

  **数组字段**。`field-array` 补 `invalid` / `readOnly` / `name` 三个 prop 与根级 `FORM.RESET`，给了 `name` 之后每行经 `item.name` 拿到 `名字[下标]`；另补 `item-label` 部件与行级 `data-invalid` / `data-readonly` / `data-at-min` / `data-at-max`。整份数组从此进得了原生表单、也认表单重置。

  **提及框**。`mention` 补 `label` 部件（`for` 写向真输入框）与 `empty` 部件（给了 `collection` 却一条不剩时显出，`role=status`），再补 `name` prop 与根级 `FORM.RESET`。

  **字段组排布**。`fieldset` 补 `field-group`（够宽自动分栏的一段字段）与 `actions`（组末尾那一行按钮）两个部件，并排字段与按钮行不必再自己套裸 `div`。

  配套的覆盖槽同批开出：`--xh-text-field-affix-*` / `-count-*`、`--xh-number-field-affix-*`、`--xh-password-input-strength-*`、`--xh-pin-input-separator-*` 与 `-box-bg-readonly`、`--xh-field-array-item-label-*`、`--xh-mention-label-*` / `-empty-*`、`--xh-tags-input-count-*`、`--xh-fieldset-field-group-*` / `-actions-gap`。

  **未做**：`field-array` 的 `variant` / `tone` 两条轴（那两条说的是控件盒的底与描边，而它的行没有盒，只补 `size` 会成半套三轴）、`fieldset` 的禁用够到 `div` 型控件（两条实现路径一条要拿无障碍换行为正确、一条要越过「只产出属性不改作者 DOM」的契约）。`fieldset` 的 doc 已写明现状：`disabled` 只连坐原生表单控件，组内 `div` 型控件须各自接 `disabled`。

- fee406a: **新增**表单的网格排布档。`layout` 从三档变四档，多出来的 `grid` 把字段排进等宽列；三档老值渲染逐值不变，不改一行代码升上来看不出差别。

  列数走新 prop `columns`，与栅格的 `cols` 同一套写法：整数是各档同一个列数，断点对象 `{ base, sm, md, lg, xl }` 逐档取值，没写的档沿用比它窄的那一档。取值 1 至 4，范围外按一列排。

  ```vue
  <XhFormRoot layout="grid" :columns="{ base: 1, md: 2 }">
    <XhFormFieldGroup value="name">…</XhFormFieldGroup>
    <XhFormFieldGroup value="phone">…</XhFormFieldGroup>
    <XhFormFieldGroup value="address" span="full">…</XhFormFieldGroup>
  </XhFormRoot>
  ```

  跨列由字段容器自报：`FormFieldGroupProps` 补 `span`，收 1 至 4 与 `full` 两种写法，落成 `data-span`。`full` 占满整行且跟着当下的列数走——窄视口收成一列时它仍是一整行；写数字则是固定跨度，比当下列数还大会多撑出一列。

  Web Components 侧 `<xh-form>` 补 `columns` 特性（写整数或 JSON 对象），字段容器的角色节点上再写个 `span` 特性；两者的取值判定与 Vue 侧同一份代码。

  皮肤补 `[data-layout='grid']` 一段：`data-columns` 与逐档的 `data-columns-sm/-md/-lg/-xl` 各接一条规则，`data-span` 接跨列。四个断点宽度与栅格同源。

  **未做**：整份轨道表的使用者覆盖槽（`columns` 已覆盖 1 至 4 与逐档写法，要非等宽的两列直接在自己的表单元素上写 `grid-template-columns`）；`labelWidth` / `labelAlign` 仍只在 `horizontal` 下生效，网格档里标签在控件上方。

- affa413: **Form 提交钮、重置钮与错误摘要条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，摘要条目按字段路径键区分；新增导出类型
  `FormPressedKey`），事件 `PRESS.START` / `PRESS.END` 挂根级；整体禁用一律不进，只读时重置钮不进，所指字段没有错误
  （藏着）的条目不进；异步校验在途（提交或逐字段）时不进，按住途中开跑即由机器松开。按住途中转入禁用 / 只读，或条目所指
  字段改好了时同样松开。皮肤里错误摘要条目补上集合行的换面反馈：悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200）只换面不缩放，走按压 / 释放时间线，`forced-colors: active` 下用系统高亮反色画回；新增
  覆盖槽 `--xh-form-summary-item-bg / -bg-hover / -bg-pressed / -px / -radius`。键盘表新增 `form.kbd.press`。三端公开
  props 与事件不变。
- e59b69d: Form 增加独立的 validationError 状态和校验执行异常事件，保留原始 cause、值快照及触发字段。
  同步抛错和异步拒绝都会结束当前快照的校验，不再产生未处理拒绝或卡在忙碌态，也不伪装成字段错误。
  已启动异步规则后再遇到同步异常时，仍将整批 Promise 纳入拒绝处理，不遗漏随后失败的任务。
  新校验、变值和重置清除旧异常，重试由业务显式触发。
  三端均提供异常状态读取；Vue/Web Components 发出 validation-error，React 使用 onValidationError。
- cd1a841: **HoverCard 说明文字改说明档，卡片面补 overscroll 隔离，自绘条走浮层档。** 视觉默认变化：description 字号
  `--xh-text-body-size` 14 → `--xh-text-secondary-size` 13（新增 `--xh-hover-card-description-font-size` 槽）；content
  新增 `overscroll-behavior: contain`，滚到头不再把页面一起带走；三端的自绘滚动条改走浮层 4px 档（`size: 'sm'`）。
- 21b006a: `trackHoverIntent` 的触发器从误导性的动态 `getTriggerEl` 改为必填 `trigger` 创建快照。跟踪器固定使用该元素所属的 Document 与 Window，严格校验动态 content、计时参数与活动 realm，并在 content 换代、重复安全三角和重复清理时完整释放旧资源。

  Menu 与 SideNav 在各自 effect 的 DOM flush 中解析 trigger；无渲染器或该次提交没有节点时，该 effect 明确保持未绑定。SideNav 后续悬停会话会重新建立状态 effect，Menu 调用方则必须在启动服务前接好锚点引用。

  Vue 与 React 的 `useHoverIntent` 继续接受 nullable trigger getter，并新增各自公开的 `UseHoverIntentOptions`。包装会在 DOM 提交后绑定，随 trigger 与计时参数重建；Vue 的 content getter 和意图回调读取当前响应式选项，React 读取最近一次已提交选项。

- 5e2efdd: `image-viewer` 现在以 Headless 的 Presence 租约为退出生命周期真源：逻辑关闭立即让内容 `inert` 并退出可访问树，内容和遮罩的全部有限退场完成后才释放 Layer、焦点域、滚动锁与背景失活。退场期间不会再次响应 Escape 或外部交互；重开撤销旧租约并重新激活原焦点域，卸载立即释放资源。

  三端均追踪 content 与 backdrop 的退出租约，避免一侧提前完成就提前卸载；不新增 ImageViewer 的退出完成公开事件或回调。

- c87cc26: **ImageViewer 的关闭钮、工具条七颗与两端翻页钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`（`ImageViewerPressedPart`，按 part 键记按住的那一颗），事件 `PRESS.START` / `PRESS.END` 挂根级、只在展开态接；贴住缩放端点的缩放钮与到边界的翻页钮不进，按住途中转禁用或浮层收起时由机器松开。
  键盘表新增 `image-viewer.kbd.press`；`ImageViewerPressedPart` 进公开面。三端公开 props 与事件不变。
- fa08fb4: **Web Components 侧补齐四个命令式反馈服务；轻提示与通知的两套队列合成一套。**

  **四个服务**（新子入口 `@xihan-ui/web-components/services`）：`createToastService` / `createNotificationService` / `createDialogService` / `createLoadingBarService`，句柄与 Vue 侧同名同形，命令在任意模块作用域可调（路由守卫、请求拦截器、store）。在此之前这一整层只有 Vue 有，同一套设计系统的两个适配器在服务层能力不对等。

  形态跟着 WC 的身份走，与 Vue 侧有两点不同：一是没有 `config` 入参也没有 `setConfig`——全局配置沿 DOM 祖先链解析，服务的宿主容器就挂在文档里，`setXhConfig` 与外层 `<xh-config>` 直接说了算；二是模板生成的是真实的自定义元素与角色节点（`<xh-toast>` / `<xh-notification>` / `<xh-dialog>` / `<xh-loading-bar>` 加 `data-xh-part` 子节点），作者拿到的仍是一棵可查、可选中的 DOM。用到的元素在服务建起来时按需注册，不必先 import `/define`。

  **队列合一**：`toast` 服务里那个裸数组撤掉，改跑 `notification` 那台队列机器。此前同一个概念有两套实现、两套上限策略，且只有通知那套能被 WC 复用。合完之后上限、挤条、合并计数全库一份，两个适配器共享。轻提示的公开面一个没动：`createToastService()` 的入参、`ToastService` 的方法、渲染出来的 DOM 与 `data-*` 全部照旧。

  同批补上队列层四样能力，两个适配器、两条服务都有：

  - **行内动作**——`ToastRecord` / `NotificationRecord` 加 `actionLabel`（纯文案，队列记录仍只放可搬运的数据），回调按 id 存在服务侧一张表里，默认模板据此渲染 `action-trigger`。解剖、皮肤与 `action` 事件本就齐全，缺的只是命令式入口够不着它。
  - **`pauseAll` / `resumeAll`**——机器侧的多源暂停计数早就有，缺的是服务把它抬出来。`ToastPauseSource` 加第五路 `'service'`，`toast` 机器加 `paused` prop（起手为真的那条直接落在暂停态），Vue 的 `XhToastRoot` / `XhNotificationItem` 与 WC 的 `<xh-toast>` / `<xh-notification-item>` 一并露出。
  - **`promise()`**——先弹一条 loading，Promise 落定后就地改写成 success / error，结果与拒绝都原样交回调用方。
  - **去重与优先级**——队列加 `dedupe` prop（默认 `'id'`，现行为；给 `'content'` 则语气与两层文本全同的合并成一条并累加 `count`，标题后追加计数），记录加 `priority`。挤条规则从「挤掉最旧的」改成「先挤低优先级、同级里挤最旧」，优先级不给则按语气派生（error=2 / warning=1 / 其余=0）——一条报错不再被随后的五条提示顶掉。

- ea27877: **`infinite-scroll` 的取下一页按钮接入 Action Control row outline 档，默认几何与阶梯会变。** connect 在
  `load-more-trigger` 上投影 `data-xh-action-control` / `profile="row"` / `variant="outline"` / `display="always"` /
  `size="md"`（本组件没有 size 轴，档位固定）。真源 §9.2 把 load-more trigger 归为铺满一行的独立动作条目：宽度由容器给
  （`inline-size: 100%`）、高度随内容（至少一个控件高 36px，内衬 `--xh-list-option-py-md`、正文行高，文案可折行）、按下只换面
  不缩放。此前它是一颗行内 `inline-flex` 描边钮，宽度随文案、按下缩到 0.97。

  皮肤 `@import` 家族 action-control，删除按钮自写的盒、底、边、transition、hover / active / 缩放规则，改为映射家族桥接槽
  （`--xh-infinite-scroll-load-more-gap` / `-h` / `-px` / `-radius` / `-border` / `-border-hover` / `-bg` / `-bg-hover` /
  `-bg-active` / `-fg` / `-font-size` 使用者槽全部保留为第一参数），只留文案居中、正文行高与 `touch-action: manipulation`；
  新增使用者槽 `--xh-infinite-scroll-load-more-icon-size`（映射 `--xh-icon-size`，缺省按档取
  `--xh-_action-profile-glyph-size` 20px）。默认外观变化：静息底由 `--xh-bg-canvas` 改为透明（描边仍 `--xh-border-control`、
  control 圆角、无影）；悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）+ `--xh-border-control-hover`；按下由
  `--xh-bg-subtle-active`（300）+ 0.97 缩放改为 `--xh-bg-subtle-hover`（200）只换面（白底承载阶梯）；焦点环、禁用面
  （`data-disabled` 时透明底 + `--xh-fg-disabled` + `--xh-border-subtle`）与粗指针 44px 热区由家族给；取数中（`data-loading`）
  不再响应悬停。

  登记如实缩小：check-press-feedback 把 `infinite-scroll:load-more-trigger` 改登记为 `{ feedback: 'surface' }`，family-backlog
  删 press 段 1 条与 ladder 段 hover / pressed 2 条；check-dead-state-attr 删 `infinite-scroll:data-loading` 钩子（在途守卫由家族
  配方消费）。文档示例的取页钮外层不再用 flex 居中，按钮自己铺满一行。

- 714cc99: **InfiniteScroll 的 load-more-trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（row 档只换面不缩放）。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级；取数中与关闭时不进，按住途中进入取数 / 关闭两段时由机器松开。
  键盘表新增 `infinite-scroll.kbd.press`。三端公开 props 与事件不变。
- c4e10d5: 为 InputGroup 新增 `primary | secondary` 视觉变体，并将前缀、输入控件与后缀统一为一个输入表面。皮肤体积增加用于补齐外层材质、悬停、聚焦、校验与强制色状态，同时消除子输入重复绘制的背景、描边和阴影。
- fa08fb4: **新增** `input-group` 组件（输入组）：Vue 与 Web Components 两侧同时可用。

  它收编的是一份此前只存在于示例里的写法：输入框与它的前后缀、动作钮拼成一个盒。
  拼法有四处要拿捏——中缝合并、首尾圆角、聚焦那一段的层叠顺序、前后缀块与邻座同高——
  照抄示例意味着每个使用者各写一遍，四处各写各的，这正是同一套控件长出两种模样的来源。

  承诺的部分：`root` 负责中缝与两端圆角，`item` 是不可交互的前后缀块，档位跟着组内控件
  自己的 `data-size` 走（组上写 `size` 可以直接指定）。覆盖入口是 `--xh-input-group-radius`
  与 `--xh-input-group-item-*`。

  实现细节、不作承诺的部分：段的识别只认直接子节点与它下面那一层的控件盒；更深的节点是
  控件自己的内部结构，本组件不去动它。

- 31b54f4: **JsonViewer 的分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行只换面不缩放）。**
  机器 context 新增 `pressedValue`，事件 `PRESS.START` / `PRESS.END` 按行路径记按住的那一行；键盘那一路由 `branch` 代发（焦点落在它身上），触屏按在 `branch-control` 上。
  皮肤的按压规则改为 `:is(:active, [data-pressed])`，并补 `forced-colors: active` 下的系统高亮反色。键盘表新增 `json-viewer.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **新增**布局与滚动族的能力补齐（滚动区的边缘渐隐单独一份变更集）。全部是加法，缺省档逐值等于改动前。

  **拖动能撤销了**。`splitter` 新增 `DRAG.CANCEL` 事件，拖动态在文档上听 Escape：按下即把布局退回按下那一刻的快照，`onSizesChangeEnd` 不发。`resizable` 的 `resizing` 态挂同一条通路，Escape 走既有的 `RESIZE.CANCEL`，尺寸与位移一起退回。两条键盘表各多一行 `cancel`。此前拖过头只能再拖回去猜原值，而错值已经发出去了。

  **骨架有名字了**。`splitter` 立 `SplitterTranslations { root, resizeTrigger(index, total) }`，根与每条分隔条从此各带一个 `aria-label`（兜底 `Split panels` / `Resize panel N`）。多条分隔条对读屏不再是一串同名盒子。Vue 侧接 `withXhConfig('splitter')`，Web Components 侧收 `translations` property。

  **拖动排序看得见落点**。`sortable` 新增 `drop-indicator` 部件：拾起时机器记下容器原点，连接层按当前落点算出那条缝并写进内联 `transform`，落点回到起点即 `hidden`。竖排画横线、横排与换行网格画竖线。换行网格里两个方向的项都在动，此前看不出会落到哪一格。同批把 `item-drag-trigger` 的禁用从 `aria-disabled` 改为**同时**发 `data-disabled`（`aria-disabled` 原样保留），全局 `[data-disabled]` 规则从此命中得到它。

  **侧栏会自己收了**。`layout` 新增 `siderBreakpoint`（`sm` / `md` / `lg` / `xl`，落根上的 `data-sider-breakpoint`）：没达到那一档时侧栏按折叠宽显示；同时发 `onSiderBreakpoint({ matched })`，宿主据此换成抽屉。断点像素值现读 `--xh-breakpoint-<档>` 令牌，JS 里不另抄一份。

  **栅格接得住真实版面**。`grid` 新增 `rows`（显式行轨道）、`minColWidth`（四档，走新令牌 `--xh-layout-col-min-xs|sm|md|lg`，皮肤改用 `repeat(auto-fill, minmax(…, 1fr))`，从此做得了「卡片最小 N，放得下几列就几列」）、`rowGap` / `columnGap`（排在 `gap` 档位之后取胜）。`span` 与 `offset` 另外收断点对象：

  ```vue
  <XhGridRoot :cols="{ base: 1, md: 2, lg: 3 }">
    <XhGridItem :span="{ base: 1, lg: 2 }">…</XhGridItem>
  </XhGridRoot>
  ```

  窄屏收成一列时 `span=6` 那一格不再溢出。两个适配器都收 JSON 串写法。

  **未做**：拖起态的观感调整、分隔条的抓手字形、瀑布流的换档动效——三条都是视觉/动效条目，且后者依赖「列与项交给作者持有」那次结构变更。

- ab2417c: **Layout 的 sider-trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 在两个折叠态都接；把手没有禁用态，按住一律进。
  键盘表新增 `layout.kbd.press`。三端公开 props 与事件不变。
- 2c5c5ac: **侧栏能盖上来了**。`layout` 新增 `siderPresentation`（`inline` / `sheet`）：覆盖档下侧栏移出画外，展开时盖在内容之上并铺一层遮罩，侧栏那一列于是收成零宽、内容占满整宽。缺省仍是 `inline`，不写这个 prop 的骨架逐值等于改动前。

  与已有的 `siderBreakpoint` 配着写就是「宽屏占一列、窄屏覆盖」：覆盖档只在未达那一档时成立，宽屏落回占位档；跨档时侧栏跟着开合（进覆盖档收起、免得一挂上来就盖住内容，回占位档展开），走的仍是 `siderCollapsed` 那条通道，受控宿主照常收到 `onSiderCollapsedChange`。解析后的档位落在根的 `data-sider-presentation` 与侧栏的 `data-presentation` 上，`api.siderPresentation` 读得到同一个值。

  ```vue
  <XhLayoutRoot sider-breakpoint="md" sider-presentation="sheet">
    <XhLayoutHeader><XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger></XhLayoutHeader>
    <XhLayoutSiderBackdrop />
    <XhLayoutSider>…</XhLayoutSider>
    <XhLayoutContent>…</XhLayoutContent>
  </XhLayoutRoot>
  ```

  **新增 `sider-backdrop` 部件**（Vue 侧 `XhLayoutSiderBackdrop`，Web Components 侧同名 part）：点它收起侧栏；占位档下带 `hidden`，不占位也不吃指针。它与面板同一个层号，渲染时排在 `sider` 之前——谁盖谁由文档序决定。

  **键盘表多一行**：覆盖档下 Escape 收起侧栏（`layout.kbd.dismiss-sider-sheet`）。覆盖档不锁焦点、不把背后的内容标成惰性——它是骨架里的一段，不是模态浮层；要模态用 `drawer`。

  皮肤侧：面板贴死视口那条边、按自身宽度的百分比推出画外，位移与 `visibility` 同拍走 `--xh-motion-duration-slide` / `--xh-motion-ease-slide`；贴边的四条内衬与安全区取大的一头。新增使用者槽 `--xh-layout-sider-layer` / `--xh-layout-sider-shadow` / `--xh-layout-sider-backdrop-layer` / `--xh-layout-sider-backdrop-bg`。`layout.css` 的体积基线因这一档从 5742 涨到 7844 字节。

- 9cb1db6: **Listbox 接入 Collection Item 与 Action Control 配方，选中改页内持久集合的品牌淡底 + 前导对号，列表接自绘条。**

  - 条目投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='page'`，文字与对号落在家族网格的 `text` / `indicator` 列；悬停 100、按下 200 只换面（此前按下零反馈），选中行铺 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景，对号前置到起始侧（此前透明底 + 行尾对号）；selected + hover 20%、+ pressed 28%。公开槽名不变，新增 `--xh-listbox-item-bg-pressed` / `--xh-listbox-item-bg-selected` / `--xh-listbox-item-check-fg`。
  - 取下一页的钮接 Action Control `row` 档 ghost 形态：铺满一行只换面不缩放（此前 0.97 缩放且不换底）。
  - 根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档；条目内字形由家族按档下发。
  - 三端把 `content` 接上自绘滚动条（真源 §6.6 定高小列表）：条子挂在 `root` 上、贴层锚定、两轴都摆、走 6px 缺省档；Vue 的 `XhListboxContent` 与 React 的同名组件根节点从此是片段（列表 + 条子），直通属性仍落在列表节点上。

- eb1bc18: **Listbox 条目与「取下一页」接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressedPart`（`item` / `load-more-trigger`）与 `pressedValue`（条目 value，取下一页记
  null），事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }`；守卫 `canPress` 在整列禁用时
  两者都不进，条目在只读或自身禁用（部件声明或 collection）时不进，取下一页在取数在途中（`loading`）不进；
  `endPress` 只松开 part + value 对应的那一个，按住途中转入禁用 / 只读 / 加载时由机器自行松开。item 与
  load-more-trigger 的 getter 投影 `data-pressed`，Collection Item（page 语境）与 Action Control（row 档）家族配方的
  按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `listbox.kbd.press`。三端公开 props 与事件不变。
- 6c876c8: **Log 的回到底部按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  log 机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 只在视口离底（按钮在场）时放行，
  按住途中回到底部、按钮随之收起时由贴底回报一并松开。键盘表新增 `log.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **标记与身份族补齐四项能力**，全是新增：不写新 prop、不加新部件的既有用法逐值不变。

  **`separator` 补带分节文字的三段形态。** 解剖由 `['root']` 扩为 `['root', 'line', 'content']`：
  渲染了 `content` 之后 `root` 改当容器，两条 `line` 夹着文字，间距、字号与靠边时的线长全部走令牌。
  形态由部件在不在决定，没有开关。Vue 侧新增 `XhSeparatorRoot` / `XhSeparatorLine` /
  `XhSeparatorContent` 三个部件组件；`XhSeparator` 保留为一体式入口——不给插槽仍是今天那一条线，
  给了插槽自动排成三段。此前 `XhSeparator` 收到插槽会投一条 `core.ignored-slot` 诊断并丢掉内容，
  这条诊断随之删除。同批补三个 prop：`align`（`start` / `center` / `end`，缺省居中）、
  `variant`（`default` / `subtle` / `strong`，三档只换线的深浅）、`dashed`（虚线，横竖两个朝向
  各自成立，段长走 `--xh-separator-dash-length` / `--xh-separator-dash-gap`）。
  三者缺省档都不落 DOM 属性。

  **`avatar` 补 `tone` 语气轴。** 落 `root` 的 `data-tone`，换的是淡底与回退字的配色族；
  整块规则带 `[data-tone]` 限定，没写语气的头像逐值不变。不开形态轴——头像只有「淡底 + 字/图」
  一种形态，实心底会压住图片。

  **`watermark` 补字体与图片两项能力。** `fontFamily` 指定印文字的字体（缺省 `sans-serif`，
  与从前产出逐字相同）；`image` 在文字上方印一张图，`imageSize` 给它的像素尺寸（缺省 64 × 64）。
  两条约束写在类型里也写在文档里：印子是当遮罩用的 SVG，遮罩只取透明度，所以图印出来是**剪影**，
  颜色仍由 `--xh-watermark-fg` 给；`image` 只收 `data:image/` 开头的内联图片，别的来源在入口挡下并
  报一条诊断——SVG 当图片用时取不到外部资源，收了也印不出东西。文字与图片都空了才落
  `data-state="empty"`。

  **`tag` 的纯文字自动包 `label`（仅 Vue）。** `<XhTagRoot>前端</XhTagRoot>` 这种写法此前拿不到
  `label` 上的截断规则，文字过长会把关闭钮挤出去；现在默认插槽里只有文字时自动包一层
  `XhTagLabel`，作者自己写了节点就一个都不动。Web Components 侧是 Light DOM，作者自己写节点，
  这件事改到不了，`tag` 的文档里加了一条反模式。

- a0ae74b: **新增** `markdown-stream` 组件：把已经渲好的 Markdown 块列表投影成带稳定 key 的正文结构，Vue 与 Web Components 两侧同时可用。

  它把 `@xihan-ui/markdown` 这个一直没有消费方的流式渲染内核接到了组件层上。**组件不解析 Markdown，也不持有渲染器**：块列表由宿主调 `createStreamRenderer().render(全文)` 得到后传进来——渲染器是有状态的，做成组件的 prop 会诱导使用者共享一个实例、每帧把整张缓存作废。

  块的 `key` 是稳定的：生长中的那一块 key 恒定，定型的块 key 不再变化。两个适配器都按 key 逐条比对复用节点，只有真正在长的那一块每帧重渲——整表重铺会把已定型的块连同用户正在拖的选区一起弄没，而稳定 key 正是为了避免这件事。

  **`html` 只对 markdown 块有效**，这条契约写在类型上：代码块与公式块拿 `source`（未转义的正文原文）交给 `code-view` 或宿主自选的公式引擎，照 `html` 渲会让同一段代码出现两次。没人接管时把原文当正文显示，这个降级是明写的，不是意外。

  流式光标是皮肤的 `::after`，挂在带 `data-live` 的那一块上，减弱动效时停在实心不闪。正文不套 role、也不做成活区——每来一个 token 播报一次会把读屏刷爆；要在一段回复写完时念一句，把 `announce` 设成 `polite` 并渲出播报区。

  **新增** 语义令牌 `--xh-caret-duration`：文本光标闪一次的周期。

- 8b6b118: **`matrix-code` 新增 `pdf417` 与 `aztec` 两种码制；`level` 的取值域随码制，新增 `columns`。**

  `format="pdf417"` 画 PDF417（ISO/IEC 15438）：字节压缩模式（每 6 个字节按 900 进制压成 5 个码字，含 ASCII 以外的字符时声明 ECI 26），GF(929) 素域里德-所罗门，九档纠错 0–8（缺省按数据量取规范推荐档），行列在宽高比最接近 3:1 的一档里挑，`columns` 可指定数据列数 1–30；每个码字行占 3 个模块高。它是堆叠条码不是点阵，`moduleShape` 不认。

  `format="aztec"` 画 Aztec（ISO/IEC 24778）：大写 / 小写 / 数字三种字符模式贪心切换、其余字节成串二进制移位，紧凑型 1–4 层与完整型 4–32 层自动挑（5 层起插参考网格），字宽随层数取 6 / 8 / 10 / 12 位、各自建 GF(2^m) 域，模式信息走 GF(16)；不需要静区，缺省 `margin` 为 0。

  `level` 现在是 `MatrixCodeLevel`：qr 认 L / M / Q / H，pdf417 认 0–8，aztec 认纠错码字至少占的百分比 5–95（缺省 33）；给了码制不认的值不画码，根落到 `error` 态并在 `error` 里说明取值域——不静默换成缺省档。自定义元素的 `level` attribute 照旧是字符串，数字串交给 connect 核。`columns` 三端同名；`columns` / `moduleShape` / `gs1` 给了不认它们的码制，往诊断通道报 `matrix-code.option-ignored` 警告，按没给处理。共享的 `createReedSolomon` 多一个位宽参数，QR 与 Data Matrix 不受影响。

  四种码制都配了独立重写的解码器做回环，并用 zxing-cpp（WASM）逐一交叉解码过（PDF417 九档级别 × 列数 1–30 × 近容量；Aztec 1–32 层、纠错 5–80%、二进制长短移位）。

- fa08fb4: 媒体与图形族补齐五处能力缺口，全部是加法：既有部件、槽、props 与事件一个都没有改名或退役。

  **`image` 新增 `placeholder` 部件**（`XhImagePlaceholder` / `part="placeholder"`）。此前 `fallback` 一个部件同时承担「还在加载」与「加载失败」，作者只能靠 `showFallback` 载荷自己分流，而它的默认长相是一行居中文字——加载中最需要的占位面没有着落。`placeholder` 只在 `idle` / `loading` 两相露面，铺满图位，默认给一层比根底稍重的面（槽 `--xh-image-placeholder-bg` / `--xh-image-placeholder-fg`），作者把骨架屏或模糊小图放进去即可。默认插槽的载荷同批加 `showPlaceholder`。节点是可选的，不写照旧。

  **`image-viewer` 新增大图的取图相位。** 打开一张几 MB 的原图时，`content` 已经淡入、`image` 还是空的，台前是一整块什么都没有的暗底。现在 `image` 与 `viewport` 两个部件在取图期间带 `data-loading`，`viewport` 同时报 `aria-busy`，皮肤给出 `cursor: progress` 与画面正中的一块占位面（槽 `--xh-image-viewer-loading-size` / `-radius` / `-bg`）；`ImageViewerApi` 加只读的 `imageStatus`（`loading` / `loaded` / `error`），Vue 侧经根组件默认插槽透出。换图与重开都回到 `loading`。

  **`image-viewer` 新增 `+` / `=` / `-` / `0` 四个键位**：放大一档、缩小一档、变换整体复位，与工具条上那三颗钮同一条通道（`ZOOM.BY` / `TRANSFORM.RESET`）。带 `Ctrl` / `Meta` 的同样按键不接，留给浏览器的页面缩放。**注意**：看片浮层打开期间，这三个按键不再冒泡到宿主——原先在宿主上监听 `+` / `-` / `0` 的页面，浮层开着时收不到它们。

  **`image-cropper` 新增 `zoom-slider` / `rotate-slider` 两个部件**（`XhImageCropperZoomSlider` / `XhImageCropperRotateSlider`，两侧都是原生 `<input type="range">`）。示例里早就有「缩放与旋转」这一档，解剖里却一个控制件都没有，作者只能各自拿滑块拼一套。同批把 `rotation` 从只读 prop 补成与 `zoom` 同形的受控通道：新增 `defaultRotation`、`onRotationChange`（Vue 的 `rotation-change` / `update:rotation`，WC 的 `rotation-change` 事件）与 `api.setRotation`；两条滑杆的区间与步长各留 `minZoom` / `maxZoom` / `zoomStep` 与 `minRotation` / `maxRotation` / `rotationStep`（缺省 1–3 步长 0.01、−180–180 步长 1），只约束滑杆，命令式赋值不受它们夹取。给了 `rotation` 的既有用法行为不变。

  **`file-upload` 新增 `item-progress` 部件**（`XhFileUploadItemProgress` / `part="item-progress"`）。机器一直在算 `progress`，解剖里却没有承载它的地方，示例只好自己拼一条进度条。新部件在传输中露面，宽度按连接层写下的比例走（槽 `--xh-file-upload-item-progress-w` / `-h` / `-radius` / `-track` / `-fill`）。同批给传完的那一行补一枚对勾字形（槽 `--xh-file-upload-item-fg-done`），与失败那一行的警示字形对称——此前「传完了」与「还没开始」在行上看不出分别。

- 592ab23: **Mention 候选接入按压通道：触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增
  `pressedValue`（候选 value），根级事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }` 两个状态都认；守卫
  `canPress` 在禁用、只读或加载时不进，候选自身禁用（部件声明或 collection）时不进；`endPress` 只松开 value 对应的那一条，
  open 态 exit 时随浮层收起一并松开，按住途中转入禁用 / 只读 / 加载时由机器自行松开。焦点恒在输入框，Enter 在同一次
  keydown 里插入候选并收起浮层，键盘那一路没有可见的按住帧，候选只接触屏。Collection Item（overlay 语境）家族配方的
  按压选择器已是 `:is(:active, [data-pressed])`。三端公开 props 与事件不变。
- 1587d60: Mention 与 TreeSelect 现在复用 Headless Presence 行为资源控制器：逻辑关闭立即令 content
  `inert` 并退出可访问树，Layer、DismissableLayer 与 TreeSelect FocusScope 延后到全部有限 CSS
  退场完成后释放；退场中重开复用原资源并重新激活 TreeSelect 焦点域。
- 858eac5: **Menu 接入 Collection Item 配方：条目按下面由 300 改 200，展开着的触发器改中性面，浮层条子走 4px 档并补 overscroll 隔离。**

  - 条目与子菜单触发项投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子层开着时子菜单触发项同报 `data-in-path`，打开路径的面由家族按它给。
  - 悬停 / 键盘锚点 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-menu-item-bg-pressed` 缺省随之改变。
  - 展开着的触发器由「品牌淡底、随 tone 换色」改为与家族 hover 同档的 `--xh-bg-subtle`；`--xh-menu-trigger-bg-active` 槽名不变，私有槽 `--xh-_menu-active-bg` 删除。
  - 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；content 上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
  - content 补 `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`（浮层里的条子走 4px 档）。

- c530797: ContextMenu、Menu 与 Menubar 现在由 Headless Presence 生命周期持有行为资源：根菜单与各级子菜单分别等待自己的退出，Menubar 按菜单 value 精确配对当前 Layer owner；逻辑关闭立即令 content `inert` 并退出可访问树，退场中重开复用行为资源。
- 1eae644: **Menu 条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressedValue`（正被按住的条目 value），根级事件 `PRESS.START { value, disabled }` /
  `PRESS.END { value }` 两个状态都认；守卫 `canPress` 在整张菜单禁用或条目自身禁用（部件声明或 collection）时不进，
  `endPress` 只松开 value 对应的那一条，open 态 exit 与按住途中整张菜单被禁用时由机器自行松开。条目与子菜单触发条目的
  getter 投影 `data-pressed`，Collection Item 家族配方的按压选择器已是 `:is(:active, [data-pressed])`，键盘与触屏按住
  呈现与指针一致的 pressed 底；键盘表新增 `menu.kbd.press`。三端公开 props 与事件不变。
- d74e0f2: **Menubar 接入 Collection Item 配方：条目按下面由 300 改 200，展开着的入口改中性面并只换面不缩放，下拉菜单三端接自绘条。**

  - 条目投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子菜单触发项由子层的 Menu 机器合并同一批标记并在子层开着时报 `data-in-path`。
  - 悬停 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-menubar-item-bg-pressed` 缺省随之改变。
  - 展开着的入口由「品牌淡底、随 tone 换色」改为与悬停同档的 `--xh-bg-subtle`；按下由缩放改为只换面到 200，新增 `--xh-menubar-trigger-bg-pressed`；私有槽 `--xh-_menubar-active-bg` 删除。
  - 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；根与定位层上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档，content 上的重复声明删除。
  - 下拉菜单接自绘条：Vue / React 每张菜单的 positioner 各配一套（`useScrollbars`，`size: 'sm'`），Web Components 由 `ScrollbarsController` 跟着最近展开的那张菜单走；层分支把当前那张的 positioner 记进去，按住条子拖动不再把菜单消解掉；content 补 `overscroll-behavior: contain`，positioner 声明 `--xh-scrollbar-track-bg: transparent`。

- fd6ec65: **Menubar 入口与条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedPart`（`trigger` / `item`）与 `pressedValue`，根级事件 `PRESS.START { part, value, disabled }` / `PRESS.END { part, value }` 两个状态都认；守卫 `canPress` 在整条菜单栏禁用或部件自身禁用（部件声明或
  collection）时不进，`endPress` 只松开 part + value 对应的那一颗；trigger 的开合与按压互不影响，条目随 open 态 exit
  一并松开，按住途中整条菜单栏被禁用时由机器自行松开。trigger 与 item 的 getter 投影 `data-pressed`，Collection Item
  家族配方（nav / overlay 语境）的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `menubar.kbd.press`。

  `@xihan-ui/testing` 的共享步骤 `heldPress` / `heldPressIgnored` 新增可选 `{ value }`，多条目部件可按 `data-value`
  指定按哪一条（Web Components 只把展开的浮层搬到落点，文档序里第一条不一定是它的）。三端公开 props 与事件不变。

- 4abf7a4: **新增** `message-feed` 组件：一段会话的消息序列，Vue 与 Web Components 两侧同时可用。

  它把「粘底跟随」和「消息集合语义」合成一件。粘底那一半是内容增高时自动到底、用户上滚即解除、滚回底部阈值内自动恢复，并在往上插入历史消息时补偿滚动位置；集合那一半是 `role=feed` 配 `role=article`，带 `aria-posinset` 与 `aria-setsize`。

  **总数由 `count` 声明，不从 DOM 数**：分页加载或截断历史时，DOM 里的条数不等于会话长度；不给 `count` 就报 `-1`，那是 ARIA 规定的「总数未知」。

  **整份消息列表只占一个 Tab 停靠位。** `PageDown` / `PageUp` 在消息之间走，`Ctrl+End` / `Ctrl+Home` 一步走到消息流之外（会话界面里前者通常就是输入框），方向键一概不接管、留给浏览器滚动。这是对 APG Feed 示例的一处刻意偏离：示例给每个 article 都写 `tabindex="0"`，两百条消息就是两百个 Tab 停靠位。

  「回到底部」只看在不在底、不看粘附意图——粘着但内容还没追上时按钮不该冒出来。

  播报走一个独立的原子活区：一份会话只该有一个，每条消息各开一个会互相打断。消息流本身**不发 `aria-busy`**，它会压住同一棵子树内播报区的播报。

  消息内容全部由作者写：气泡、头像、时间、动作条都不是本组件的部件，按条目上的 `data-role` 出样式即可。

- 86345b1: **MessageFeed 的回到底部按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  message-feed 机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 只在视口离底（按钮在场）时放行，
  按住途中回到底部、按钮随之收起时由贴底回报一并松开。键盘表新增 `message-feed.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **导航与展开族补一批能力，全部是加法：不渲染新部件、不写新 prop 的既有用法逐值不变。**

  **`menu` 补 `item-text` / `item-indicator` / `item-description` 三个部件，与 `menubar` / `context-menu` 那两家同形。** 连打检索从此优先取 `item-text`，条目里塞的图标与副文本不再算进检索串（没写这个部件时仍退回条目自身文本）。三个部件共用条目那一份 `data-disabled` / `data-highlighted`，样式层各处状态一致。Vue 侧新增 `XhMenuItemText` / `XhMenuItemIndicator` / `XhMenuItemDescription` 与条目上下文 `provideMenuItem` / `useMenuItemContext`，Web Components 侧新增三个 `csspart`。新增导出 `menuItemText`、类型 `MenuItemContext`。

  **`menu` 补 `typeahead` / `disabled` / `translations` 三条 prop。** 首字符连打默认开（APG 的 menu button 模式把它列为必需），收起时缓冲区清空；`disabled` 一票封住触发器与全部条目；`translations.content` 给菜单容器一个名字，不给时仍由触发器经 `aria-labelledby` 代为命名。

  **`menubar` 补 `arrow` / `item-description` 两个部件，`MenubarNode` 补 `group` / `groupLabel` / `separatorBefore` / `description` 四个字段。** 箭头指向它那张菜单自己的锚点（坐标取本菜单名下那份，换菜单时收起中的那张不会跳到新位置），定位引擎因此开始产出箭头落点。相邻同 `group` 的条目并成一段铺进 `group` 部件，段标题取组内首个给出 `groupLabel` 的条目，段首的分隔线落在分组外面——与 `context-menu` 的数据形状逐条对齐。Vue 侧新增 `XhMenubarArrow` / `XhMenubarItemDescription`。

  **`context-menu` 补 `item-description` 部件**，`ContextMenuNode` 随之补 `description`；没给这一项的条目不铺那个部件，行高与此前逐值相同。Vue 侧新增 `XhContextMenuItemDescription`。

  **`navigation-menu` 补 `trigger-indicator` 部件与 `disabled` prop。** 方向标记排在入口文字之后、展开时转 180°，没写内容时由皮肤画兜底字形；`disabled` 一票封住全部入口与面板展开。Vue 侧新增 `XhNavigationMenuTriggerIndicator`。

  **`accordion` 补 `item-separator` 部件与 `variant` / `loop` / `disabled` 三条 prop。** 显式渲染分隔线时原来那条「相邻条目画边」的规则自然不再命中，两条线不会同时出现；`variant` 三档 `plain`（缺省，即现状）/ `surface` / `bordered` 决定条目怎么与页面分开；`loop` 让方向键在首尾之间回绕（缺省仍不回绕）；`disabled` 一票封住整组。新增类型 `AccordionVariant`，Vue 侧新增 `XhAccordionItemSeparator`。

  **`collapsible` 补 `header` 部件与 `tone` / `dir` 两条 prop。** `header` 是触发器与其同排内容住的那一行，只写触发器时可以不渲染它；展开态的字色单开 `--xh-collapsible-trigger-fg-open` 一个槽接语气，不与常态共用一个。Vue 侧新增 `XhCollapsibleHeader`。

  **`pagination` 补 `summary` / `jumper` 两个部件。** 信息区的文本由新的只读字段 `api.summaryText` 给出（文案走 `translations.summary`，默认 `1-10 of 42` 这一形），跳页框敲页码按回车即跳、越界值由 `setPage` 夹回合法区间。两者都与页码格子同一族盒型，并排在一行上平齐。Vue 侧新增 `XhPaginationSummary` / `XhPaginationJumper`，`PaginationTranslations` 新增 `summary` 与 `jumper` 两句。

  **`anchor` 补 `link-text` 部件与 `bounds` prop。** 链接里另塞图标时，省略号只裁 `link-text` 这一段文字；`bounds` 是压线判定的容差（缺省 1px，与此前写死的那一档同值），长目录里靠它调「滚到哪儿才算进入下一节」。Vue 侧新增 `XhAnchorLinkText`，新增导出 `ANCHOR_DEFAULT_BOUNDS`，`resolveActiveAnchor` 多收一个可选参数。

  **`breadcrumb` 补 `link-icon` 部件与 `collection` / `maxItems` 两条 prop。** 折叠算法进 headless（`buildBreadcrumbItems`，纯函数）：层数超过 `maxItems` 才折，折的是中间那一段，首层与末层恒在序列里，展开的层数恒等于 `maxItems`。`api.items` 给出折叠后的序列，省略位自带被折掉的那几层；只交 `collection` 时 Vue 侧按它铺开整套结构。新增类型 `BreadcrumbNode` / `BreadcrumbNodeMeta` / `BreadcrumbItem`，新增导出 `normalizeBreadcrumbNodes`，Vue 侧新增 `XhBreadcrumbLinkIcon`。

  **`side-nav` 补 `tone` / `size` 两条轴。** 尺寸只换根与定位层上那三个私有槽（行高、行内边距、行内间距），中档逐值等于此前写死的那一份；语气把选中行的淡底与强调字、在途枝的字色接到语气层派生好的档上，不写 `data-tone` 时退回品牌色。折叠态的弹出面板被搬去落点、继承不到根上的槽，两条轴因此在 `positioner` 上再输出一次。

  **`toolbar` 补 `variant` 轴**：缺省 `surface` 就是此前那条描边加底色的控件带，新增的 `plain` 档把整块面撤掉、只留排布——嵌在卡片或另一条工具栏里时不会叠成双框。新增类型 `ToolbarVariant`。

  **`steps` 补 `collection` / `statuses` / `loop` / `translations` 四条 prop，`StepStatus` 扩到五档。** `error` 与 `warning` 两档不由步序算出，只能由 `statuses`（按下标覆盖）或 `collection` 显式指定，皮肤给出对应的描边与字色，出错那一步不必再由每个项目各写一套覆盖槽。`count` 缺省取 `collection` 的长度；`loop` 让方向键在首尾之间回绕（缺省仍不回绕）；`translations.list` 给 `role=tablist` 的容器一个名字。新增类型 `StepNode` / `StepNodeMeta`。

  **`tabs` 补 `indicator` / `separator` 两个部件与 `closable` prop。** 指示条照 `anchor` / `navigation-menu` 那一套写：主轴的位置与长度由机器量好写成内联样式、交叉轴的贴边与粗细归皮肤，选中值一变与窗口尺寸一变各重量一次，横竖两排各走一根轴。它是可选部件——不渲染它时选中态仍由标签自己的底色与字色表达，三档形态的画法一条都没动。`closable` 打开后，焦点落在标签上按 Delete / Backspace 即发 `tab-close`（携带关掉这一条之后余下的标签序），库不持有标签序、只发意图。新增类型 `TabsIndicatorRect` / `TabsCloseDetails`，新增导出 `tabsTriggerQuery`，Vue 侧新增 `XhTabsIndicator` / `XhTabsSeparator`。

- 1f6afdb: **NavigationMenu 入口与面板链接接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressedPart`（`trigger` / `link`）与 `pressedValue`，根级事件
  `PRESS.START { part, value, disabled? }` / `PRESS.END { part, value }` 三个状态都认；守卫 `canPress` 在整套导航禁用时
  不进，入口自身禁用时不进；`endPress` 只松开 part + value 对应的那一个；按住 Enter 激活链接后面板收起（或换到另一
  张），链接藏进 inert 的面板里不会再来 keyup，机器随 `value` 变化撤下链接的按压；按住途中导航转入禁用时由机器自行
  松开。入口的 Enter / Space 开合现在拦下自动重复（按住不放不再来回翻转）。键盘表新增 `navigation-menu.kbd.press`。

  **破坏性（headless）：`NavigationMenuLinkProps` 新增必填 `value`。** 面板里可以有多条链接，按压通道按它记按住的
  那一条。三端适配器按实例生成（Vue / React `useId`，Web Components 升级时按节点分配一次），作者不必提供；直接消费
  `connectNavigationMenu` 的调用方需给每条链接一个稳定且不重复的串。三端公开 props、attribute 与事件不变。

- c13579f: **Notification 卡片的关闭按钮与操作按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  卡片复用 toast 状态机，按住的那颗记在它的 `pressed`（`ToastPressedPart`）里，卡片按 part 键比对投影；不可关闭时关闭按钮
  不进，卡片进入退场或按住途中转成不可关闭时由机器松开。notification 自身状态机不变，三端公开 props 与事件不变。
- bc80c37: **NumberField 加减按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`（按 part 键记住正被按住的那颗，新增导出类型 `NumberFieldPressedPart`），事件
  `TRIGGER.PRESS.START` / `TRIGGER.PRESS.END` 挂根级——`PRESS.*` 仍是指针按住连发的事件，按压通道只投影按压面、不改
  步进；守卫 `canPressTrigger` 与按钮的 disabled 同一口径（禁用、只读或该侧已贴住端点时不进）；按住途中值贴到端点、
  区间收紧或转入禁用 / 只读时由机器自行松开。键盘表新增 `number-field.kbd.press`。三端公开 props 与事件不变。
- d51d182: **分页浮层里的视觉轴、拖动中的海拔档、树选择器的叶子对齐，以及折叠区域补上指示符部件。**

  **分页展开省略号后，面板里的页码格子不再塌。** `pagination` 的三档尺寸私有槽（`--xh-_pagination-item-size` / `-item-px` / `-font-size`）与四个语气派生槽此前只声明在 `root` 上，而 `positioner` 会被搬到 portal 落点、不再是 `root` 的后代。面板里的 `item` 取不到这几个槽，`var()` 没有第二层默认值即整条声明在计算值阶段失效：真实浏览器里量到的是最小宽 `auto`（应为 28/32/40px）、行高与字号 16px（应为 13/14/16px）、行内内衬 0（应为 8/12/16px）——三档尺寸全部退回初值，折叠页码丢掉等宽骨架。三轴私有槽现在在 `root` 与 `positioner` 上各声明一次，与同仓其余 11 份浮层皮肤同一种写法。`--xh-icon-size` 也从 `content` 上那份单独声明并进这一处，不再写两遍。

  面板与主区逐项同值这件事由一条浏览器态用例焊住（`overlay-visual-axes.spec.ts` 加了 `pagination`，量最小宽、高、行内内衬、行高与字号五项）。

  **滑杆拖动中的拇指改引 `--xh-elevation-lifted`。** 此前它借的是 `floating`——那是 portal 出去的锚定浮层那一档，浮层为自己调深时跟着手走的拇指会一起变重。新档在 `raised` 与 `floating` 之间，语义独立。`check-elevation-role` 的角色表随之从三档扩到四档，`slider` 的 `thumb` 登记成 `raised` + `lifted`。

  **树选择器的叶子行补上首格对齐。** 分支行的首格是展开箭头，叶子行没有这一格；作者摆了 `item-indicator` 时由它顶着，没摆（勾选档首位直接是作者自己的方框）就得由行盒自己补出来，否则叶子比同级分支往行首缩 24px，层级关系读不出来。`tree` 早有这条补偿，但那条规则的选择器带 `[data-orientation='vertical']` 前置，而 `tree-select` 的连接层一处都不发这个属性，照抄过去一条都不命中，所以这里写的是等价而真能命中的一条。摆了指示符的那档不受影响（`:has()` 匹配即不命中，不会重复缩进）。两档都由新的浏览器态用例 `tree-select-leaf-indent.spec.ts` 量住。

  **`collapsible` 新增 `indicator` 部件。** 折叠区域此前只有 `root` / `trigger` / `content` 三件，开箱的触发器看不出能展开——而触发器的皮肤是按两端对齐排的，却没有第二个部件可排；同构的 `accordion` / `reasoning` / `tool-call` 三家都有这个部件。现在 `connect` 产出 `getIndicatorProps()`（`aria-hidden` + `data-state` + `data-disabled`；开合语义仍由 `trigger` 的 `aria-expanded` 承担），两个适配器各接一处：Vue 是新组件 `XhCollapsibleIndicator`，Web Components 是新 csspart `indicator`。皮肤在部件空着时画一枚兜底箭头（`--xh-glyph-mark-chevron-down`），展开时转 180°；作者往部件里塞了自己的图形，兜底那条即不命中，转向照旧由皮肤按 `data-state` 打。新增使用者覆盖槽 `--xh-collapsible-icon-size`。纯新增，原有的三件与它们的属性一个都没动。

- 1f472ba: **新增**有遮罩的浮层的遮罩形态轴：`dialog` / `drawer` / `image-viewer` 三家收下 `variant`，落成 `backdrop` 上的 `data-variant`。

  三档封闭：`opaque` 是缺省档（不写这个 prop 时逐像素与从前相同）、`blur` 在同一层底色之上再糊背后的页面、`transparent` 去掉底色只留下吃指针的那一层（交互外关闭与滚动锁定照旧）。走 `variant` 而不另开属性名：形态、语气、尺寸三轴之外不再多一个概念。

  `tour` 不在此列：它的暗幕真身是 spotlight 那圈大扩散阴影，`backdrop` 只是下面一层垫子——`transparent` 档改了垫子暗幕照样在，`blur` 档会把洞里的高亮目标一起糊掉。

  **新增**全局令牌 `--xh-overlay-backdrop-blur`（12px）与三条组件覆盖槽 `--xh-dialog-backdrop-blur` / `--xh-drawer-backdrop-blur` / `--xh-image-viewer-backdrop-blur`。

- fa08fb4: **浮层容器族的三处能力补齐**：全是加法，既有的部件名、槽名、props 与事件一个没动。

  **`hover-card` 补 `title` / `description` 两个部件**（`XhHoverCardTitle` / `XhHoverCardDescription`，
  Web Components 侧对应 `title` / `description` 两个 part）。卡片是 `role="dialog"`，它的可及名
  此前恒取触发器：触发器是一张头像时，读屏念出来的对话框名字就是头像的替代文字。补上之后
  `aria-labelledby` 指 `title`、`aria-describedby` 指 `description`。

  **两个部件都不放的写法不受影响**：连接层现读 `getTitleEl` / `getDescriptionEl`，取不到节点
  就把可及名指回触发器、也不发 `aria-describedby`，与升级前逐字一致。皮肤新增
  `--xh-hover-card-title-*` 与 `--xh-hover-card-description-fg` 三支覆盖槽。

  **`popconfirm` 补 `arrow` 部件**（`XhPopconfirmArrow` / `arrow` part）：它此前是族内唯一没有
  尖角的锚定气泡，同一页上与 popover 并排时两者对不上。箭头坐标由它本来就在跑的 popover
  机器给出，几何走共享的 `overlay-arrow.css`，皮肤只出底色与描边色，新增 `--xh-popconfirm-arrow-size`。
  面板同批加了 `position: relative`——箭头的贴边要从面板自己的盒子起算。

  **`tour` 补 `progress-indicator` / `progress-dot` 两个部件**（`XhTourProgressIndicator` /
  `XhTourProgressDot`）：此前的进度只有 `progress-text` 一句话。圆点组挂 `aria-hidden`，
  读屏仍走 `progress-text` 那一份；每颗圆点带 `data-index`，走过的带 `data-complete`、
  当前那颗带 `data-current` 并拉成胶囊，换步时宽度与底色一起过渡。Vue 侧的
  `XhTourProgressIndicator` 不写子节点时按 `steps` 的长度自己铺圆点，Web Components 侧由作者
  逐个写节点、序号取节点上的 `index`（缺省按文档序）。新增 `--xh-tour-progress-indicator-gap`
  与 `--xh-tour-progress-dot-bg` / `-bg-complete` / `-bg-current` 四支覆盖槽；
  高对比档里走过的那几颗改由描边表出。

- 4c287eb: **修复**四个浮层「键盘表白纸黑字写着焦点回到触发器，指针打开的那一次却回不去」。

  **dialog / drawer / popover / image-viewer 关掉之后，焦点显式落回触发器。** 焦点域此前只按「创建前谁持有焦点」这份快照归还，而各平台对「点按按钮给不给焦点」的处理不一致（Safari 不给），指针打开时快照可能就是 `body`。症状是用鼠标打开对话框、按 Escape 关掉，Tab 得从页首重新走一遍。四台机器现在都把触发器交给焦点域的 `restoreTarget`：dialog / drawer / image-viewer 按 connect 落给 `trigger` 的 id 现取，popover 取锚点。没有触发器的用法（程序化展开）取不到落点，照旧走创建前的快照。显式落点只在归还那一刻生效，`restoreFocus: false` 仍然整条关掉归还。

  **`KeyboardRow` 新增可选字段 `restoresFocus`。** 「这一下之后焦点回不回触发器」此前只写在 `does` 的中文措辞里，同一件事有「焦点归还 trigger」「把焦点还给 trigger」「焦点回到 trigger」「焦点还给触发按钮」等七八种写法，`check-focus-restore` 拿措辞去匹配，七家写法不同的组件整体落在盲区外——上面那四个缺口就是这么攒出来的。承诺的真源改成这个字段：`true` 是对外承诺，机器必须为焦点域交出显式落点；`false` 用在明说不归还的键位上（Tab 走 Tab 序列）；与焦点无关的键位不写。字段可选，读键盘表的代码不受影响。

  date-picker 的两行键位跟着补标了 `restoresFocus`，它的归还行为不变——触发器是输入行，点它必然把焦点落到某一段上，创建前的快照就是它本身。

- 674ee88: **Pagination 两端翻页钮、页码与省略位接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressed`（`PaginationPressedKey`：`prev` / `next` / `item:页号` /
  `ellipsis:侧`，类型进公开面），根级事件 `PRESS.START { key, disabled? }` / `PRESS.END { key }`；守卫 `canPress` 在到
  边界的翻页钮上不进；`endPress` 只松开 key 对应的那一个；摊开的页码面板收起时一并松开（面板里被按住的页码不会再来
  keyup）。皮肤按压面由 Action Control 家族配方给出；键盘表新增 `pagination.kbd.press`。三端公开 props 与事件不变。
- c247435: **PasswordInput 切换按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，按压与切换同一道 `canReveal` 守卫（禁用时不进；
  只读不拦明暗，按压面也照常给）；按住途中明暗翻面不影响按压面，转入禁用时由机器自行松开。键盘表新增
  `password-input.kbd.press`。三端公开 props 与事件不变。
- 2c2e470: **走马灯：自动播放补上暂停控件，并且不再在减弱动效档下自己起播。**

  `autoplay` 一直没有任何播放 / 暂停入口——解剖里没有这样的部件，`connect` 里的 `play` / `pause` / `resume` 三个方法从来没有被接出来过。自动翻页因此是一段用户按不住的动画：读得慢的人永远读不完一张，屏幕上的东西自己在动而没有出口。减弱动效那一路也只关掉了滑动过渡，翻页照走。

  - **新增**部件 `autoplay-trigger`（Vue 的 `XhCarouselAutoplayTrigger`，自定义元素的 `data-xh-part="autoplay-trigger"`）。它承载 `data-state="running" / "paused"`，名字随动作走（`translations.autoplayTriggerPlay` / `autoplayTriggerPause`），没配 `autoplay` 时转原生 `disabled`。
  - **新增** API 成员 `autoplayStopped`：只算「用户按停了没有」，不含悬停与焦点那两路一挪开就自己续上的临时按住。开关的名字与图形跟着它走，指针碰到按钮时不会翻面。
  - **变更**：减弱动效档下 `autoplay` 不再自己起播（停在 `idle`），要播由用户按下开关。偏好探测走 `@xihan-ui/motion` 的 `resolveMotionPreference`，应用级 `setMotionOverride` 同样管用。
  - **新增**字形令牌 `--xh-glyph-mark-play` / `--xh-glyph-mark-pause`，皮肤按 `data-state` 换字形。

  **差异视图：补上截断提示条，展开按钮补上可访问名。**

  超过 `maxLines` 的差异从尾部断开，界面上没有任何痕迹（`data-truncated` 全库无人消费），看着仍像一份完整差异——评审的人会以为自己看完了，而少掉的恰恰是没被审到的那几行。

  - **新增**部件 `truncation`（Vue 的 `XhDiffViewTruncation`，自定义元素的 `data-xh-part="truncation"`）与文案 `translations.truncated`，文字默认由组件自己填。
  - **新增** `DiffModel.truncatedLines` 与 API 的 `truncatedLines` / `truncationText`：砍掉多少行现在是模型的一部分。
  - **修正** `truncated` 的判据：上限改为按新旧两侧各自计，真砍掉了行才置位。旧判据用两侧行数之和，会在一行都没砍的情况下报「截断了」。
  - `DiffViewTranslations.expandGap` 由 `string` 放宽为 `string | ((count: number) => string)`。它是这个组件里唯一没有兜底的文案，此前展开按钮的可访问名就是按钮上那串「⋯ 12」，读屏念出来什么都没说明。给函数就能把折起来的行数念进名字；仍传字符串的调用方一行不用改——收两种形状是为了不把这一条修复变成整个锁步组的主版本。

- 4b4db79: **Popconfirm 三颗按钮接入 Action Control 与按压通道，取消钮改中性描边，内容面接自绘条。** 连接层的 trigger 新增
  稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"` / `data-xh-action-variant="outline"`；confirm-trigger 新增
  `data-xh-action-size="sm"` / `data-xh-action-variant="solid"`（确认是本浮层的主要动作，与 Button 主动作同待遇，语气
  仍随 content 的 `data-tone`）；cancel-trigger 新增 `data-xh-action-size="sm"` / `data-xh-action-variant="outline"`。
  Space / Enter 与触屏按住期间该按钮投影 `data-pressed`（记在共用的 popover 机器 `context.pressed` 里，浮层收起时一并
  松开），键盘表新增 `popconfirm.kbd.press`。

  视觉默认变化：trigger 此前是 UA 裸按钮，现由家族配方按 outline 列给出 md 档盒型与中性描边。确认钮删除自写的顶光、
  soft 影与悬停 `--xh-elevation-raised` 抬升，改由配方 solid 列给出（悬停 / 按下按语气色阶梯换底并 0.97 缩放，无影）。
  取消钮由 soft 材质淡底改为透明底 + `--xh-border-control` 描边，悬停 `--xh-bg-subtle`（100）→ 按下
  `--xh-bg-subtle-hover`（200），聚焦不再铺 `--xh-material-soft-focus-surface` 实体底。挂起圆环由 pill 改为
  `--xh-shape-circle`。description 字号 `--xh-text-body-size` 14 → `--xh-text-secondary-size` 13，颜色
  `--xh-material-frosted-fg-muted` → `--xh-fg-muted`（同值）。content 新增 `overscroll-behavior: contain`，并在三端
  接上与 Popover 同款的自绘滚动条（浮层 4px 档，positioner 记进层分支、轨道透明）。

  公开槽 `--xh-popconfirm-action-px / -radius / -shadow`、`--xh-popconfirm-confirm-bg / -fg / -shadow`、
  `--xh-popconfirm-cancel-bg / -fg / -bg-focus / -fg-focus` 改为桥接到配方之前（`-bg-focus` / `-fg-focus` 桥到配方
  的 focus-visible 面，缺省不再铺实体底而是透明底 + 静息字色，槽本身保留）；新增
  `--xh-popconfirm-cancel-bg-hover / -bg-active / -border / -border-hover`、`--xh-popconfirm-action-font-weight`、
  `--xh-popconfirm-description-font-size`、`--xh-popconfirm-icon-size`。

- 8cbf0be: Popconfirm 的确认动作改为一项明确的事务。`onConfirm` 现在接收任意 `PromiseLike` 返回值，调用前即同步占用；
  跨 realm Promise、自定义 thenable、同步抛错、读取 `then` 时抛错和异步拒绝都走同一条生命周期，不再依赖
  `instanceof Promise`。pending 会阻止重复确认、trigger 切换、`setOpen(false)`、Escape 与层外交互；兑现后才收起。

  新增 `actionError` 状态与 `confirm-error` 通知，`details.cause` 保留原始抛出或拒绝值，包括 `undefined`。
  新一轮确认会清除旧错误。取消会立即解除 pending、关闭浮层并使当前事务票据失效；它不会声称取消业务 Promise，
  迟到的兑现或拒绝不会关闭新会话，也不会写回错误。组件卸载后的旧结算同样失效。
  受控 `open` 的真实关闭再重开也会换一张事务票据并解除 pending；已取消或停机的回调即使返回已拒绝 Promise，
  组件仍会接管其拒绝，避免产生未处理拒绝，但不会恢复已失效事务。

  非模态 Popconfirm 的内容角色由 `alertdialog` 校正为 `dialog`，与不陷焦点、不锁滚动、不隐藏页面其它内容的既有合同一致；
  这次调整没有引入完整模态行为。pending 确认按钮新增 `aria-disabled="true"`，仍保留焦点并通过 `aria-busy` 报告在途。

- 36ff669: **Popover 触发器与关闭按钮接入 Action Control 与按压通道，说明文字改说明档。** 连接层的 trigger 新增稳定属性
  `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"` / `data-xh-action-variant="outline"`；close-trigger 新增
  `data-xh-action-profile="icon"` / `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`。作者以 asChild
  换成自己的按钮时，家族标记不落到它身上。机器新增按压通道（`context.pressed` 记正被按住的那颗：`trigger` /
  `close-trigger`，导出类型 `PopoverPressedPart`），Space / Enter 与触屏按住期间该按钮投影 `data-pressed`，浮层收起时
  一并松开；键盘表新增 `popover.kbd.press`。

  视觉默认变化：trigger 此前是 UA 裸按钮，现由家族配方按 outline 列给出 md 档盒型、中性描边、悬停
  `--xh-bg-subtle`（100）→ 按下 `--xh-bg-subtle-hover`（200）并 0.97 缩放。close-trigger 删除自写的悬停 200 / 按下
  300、聚焦铺 `--xh-material-frosted-focus-surface` 实体底，改由配方 ghost 列给出（悬停 100 → 按下 200，焦点面透明吃
  库环）；作者塞入的图标由随文 1em 改为随档 16px。description 字号 `--xh-text-body-size` 14 →
  `--xh-text-secondary-size` 13，颜色 `--xh-material-frosted-fg-muted` → `--xh-fg-muted`（两者同值）。content 的
  `--xh-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`，并新增 `overscroll-behavior: contain`；
  三端的自绘滚动条改走浮层 4px 档（`size: 'sm'`）。

  公开槽 `--xh-popover-close-size / -radius / -fg / -fg-hover / -bg-hover / -bg-active / -bg-focus / -fg-focus` 改为
  桥接到配方之前（`-bg-focus` / `-fg-focus` 桥到配方的 focus-visible 面，缺省不再铺实体底而是透明底 + 悬停字色，
  槽本身保留）；新增 `--xh-popover-description-font-size`。

- 4babe65: **按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 此前按压反馈只挂在 `:active` 上：键盘 Enter 按住、触屏手指按下时按钮纹丝不动，只有鼠标看得见缩放与换底（真源 §9.1 / §9.2）。

  - `@xihan-ui/core` 新增 `createPressTracker({ isPressed, onChange })`：把 Space / Enter 的 keydown / keyup / blur 与触屏的 pointerdown / pointerup / pointercancel 翻成「该按下 / 该松开」，不自存状态、不持有 DOM；长按重复键、输入法组合键、鼠标与笔一律不算。
  - `@xihan-ui/headless` 新增 `pressHandlers(service)` 与 `PressEvent` / `PressService`；`button` 与 `toggle` 的机器接上 `PRESS.START` / `PRESS.END`（context `pressed`），root 投影 `data-pressed`，禁用或进入加载途中按住的由机器自行松开。**破坏性：** `connectButton` 的第一个参数由 props 改为 `Service<ButtonSchema>`——按钮此前没有状态机，现在由 `buttonMachine` 承载按压通道，与其余跑机器的组件同构；`ButtonProps` 仍导出，等于 `ButtonSchema['props']`。
  - `@xihan-ui/styles` 的家族配方 `family/action-control.css` 与 `family/collection-item.css` 把按压选择器改为 `:is(:active, [data-pressed])`，特指度不变；组件皮肤自己写的 `:active` 规则由各组件迁移时改写。
  - 三个适配器的 `Button` 改跑 `buttonMachine`（公开 props 不变），键盘与触屏按住时呈现与指针一致的 0.97 缩放与 pressed 底；`Toggle` 同步接入。
  - `@xihan-ui/testing` 新增 `heldPress` / `heldPressIgnored` 共享步骤，button 与 toggle 套件三端核对按住中间帧。

  其余可按部件（`check-press-feedback` 的 PRESSABLE 表）已随各组件提交逐个接入；`family-backlog.json` 里的 `*:data-pressed` 总豁免随之删除，门禁 ⑧ 对没投影 `data-pressed` 的 getter 直接判红，不再留豁免入口。

- 6c05da3: **新增** `prompt-input` 组件：会话界面的输入框，Vue 与 Web Components 两侧同时可用。

  **发送与停止原位共用一个节点**：生成期间同一颗按钮换成停止身份、恒可用，只翻 `aria-label` 与 `data-mode`。另起一颗停止按钮摆在旁边会让两颗按钮互相挤位置，而按下去的那一刻它正好换了位置。

  `submitKey` 一个 prop 表达两档：`enter` 档 Enter 提交、Shift+Enter 换行、Mod+Enter 也提交；`mod-enter` 档 Enter 换行、只有 Mod+Enter 提交。输入法组合期间的 Enter 一律放行——那一下是在确认候选词；按住 Enter 不放只提交一次。

  **同一个输入框上叠了别的处理器且它已经处理过这一下时，组件让位。** 事件处理器是链式组合的，前一个 `preventDefault` 挡不住后一个，这条判断写在组件的 `onKeyDown` 首行，作者不必再包一层。

  `loading` 用一个布尔而不是四档运行态字符串：组件只需要二值判断，「这一轮走到哪一步」是宿主的事。`allowEmptySubmit` 是唯一为附件留的钩子，附件本身用 `file-upload` 装配。

  输入框的可访问名**只在给了 `translations.input` 时才发**：无条件发会盖掉作者自己的 `<label for>` 与 `aria-label`。三个视觉轴（形态 / 语气 / 尺寸）全接，自动长高仍是皮肤的两行 CSS、不进状态机。

- 7c5f97f: **PromptInput 发送 / 停止按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级；守卫与按钮的可用性同口径——禁用不进，发送身份要可提交
  （空内容、输入法组合中不进），停止身份（loading）恒可用、同样有回执；按钮身份随 loading 切换时由机器松开，提交后清空 /
  组合开始使发送钮转禁用时同样松开。键盘表新增 `prompt-input.kbd.press`。三端公开 props 与事件不变。
- cd74476: **新增** `prompt-input` 的 `submitKey` 第三档 `'none'`：Enter 与 Mod+Enter 都只换行，键盘一个提交出口都不留，提交只剩发送按钮与程序化的 `submit()` 两条路。

  原来的两档表达不出「按键完全不提交」这件事——`enter` 与 `mod-enter` 都至少留着 Mod+Enter 一条键盘通路。要把提交收束到一颗按钮上（长文起草、多段粘贴、提交前要先过一道确认的场景），此前只能在输入框上再叠一个 `onKeyDown` 把 Enter 拦下来，而那样拦掉的是整条链上后面所有处理器的机会。

  `'none'` 档不拦截默认行为：Enter 原样放行给浏览器插换行，与 `mod-enter` 档的裸 Enter 是同一条路径。Shift+Enter 换行、输入法组合期间放行、别人已处理过就让位，三条既有行为在这一档下一字未变。

  纯新增：`'enter'` 与 `'mod-enter'` 两档的行为、默认值 `'enter'`，以及两个适配器的 prop / attribute 形状都不动。

- 80bf4c8: **QuestionFlow 的选项与四颗按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  question-flow 机器 context 新增 `pressed`（按 `QuestionFlowPressedKey` 记：`'prev'` / `'next'` / `'skip'` / `'submit'` / `` `item:${value}` ``，
  类型进公开面），事件 `PRESS.START { key, disabled }`（只在答题态接，部件自身的禁用随事件带入守卫 `canPress`）/ `PRESS.END { key }`；
  换题、题目改写、交卷与关掉跳过时由机器松开。选项是 `role=radio` / `checkbox`，只有 Space 是激活键，Enter 归选项组的前进、不进按压面。
  键盘表新增 `question-flow.kbd.item-press` 与 `question-flow.kbd.press`。三端公开 props 与事件不变。
- 12d3a04: **新增** `question-flow` 组件：动手之前先问几句的澄清问卷，一次一题、答完一起提交，Vue 与 Web Components 两侧同时可用。

  **一次只暴露一题**：题目栈纵向排在轨道上，非当前题对读屏 `aria-hidden`、对键盘 `inert`，里面的可聚焦物另发 `tabindex="-1"`。它们仍留在轨道上，所以卡片高度有得可量，来回翻页也不必重建 DOM。

  **高度与位移是量出来的，不是猜的**：机器在活 DOM 上量当前题的盒，把结果写进 context，连接层只把它格式化成两个私有槽（视口高度与轨道位移）。连接层仍是渲染期纯函数——不查 DOM、不起定时器、不读时钟。

  **单选自动前进，多选等人点继续**：选中一项后隔一小段自动翻到下一题，连着改主意时每改一次都从整段延时重新计。**自动前进只走下一题**——末题上它停住，不替人按发送。

  **一颗按钮两个身份**：不是末题时是「继续」，末题时是「发送」，原位换 `data-mode` 与可访问名，正在按它的人不会按空。跳过关掉时整颗收起，而不是留一颗按不动的按钮；末题上跳过即交卷，否则最后一题没有出口。

  自由文本与选项同等算数：写了一句「都不是，我想要……」就算答过这一题。进度只播报一次——计数那格对读屏隐藏，换题与交卷由播报区念。

  每题是 `role=group`，题干同时是选项组的可访问名；选项组按题型取 `radiogroup` 或 `group`，组内漫游焦点，`Enter` 前进、`Space` 切换、`Home` / `End` 一步到头。上一题 / 下一题只给按钮入口，不吃全局按键——那会和选项漫游抢同一批方向键。

  它与既有的 `approval` 并存、语义不同：`approval` 是危险动作的人在环闸门（批准 / 拒绝，超时按拒绝收口），`question-flow` 收的是「怎么做」，没有拒绝这条路。

- 797a14f: **RadioGroup 条目接入按压通道：Space 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行与圆圈一起换面）。**
  机器 context 新增 `pressedValue`（按住的条目 value），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
  守卫 `canPress` 在整组禁用、只读或条目自身禁用时不进；`endPress` 只松开 value 对应的那一个；按住途中整组转入禁用或
  只读时由机器自行松开。`role=radio` 只有 Space 是激活键，Enter 不进按压面；选中与按压互相独立，Space 在 keydown 那一刻
  照旧选中。皮肤的按压选择器已是 `:is(:active, [data-pressed])`（换面落在行与 `indicator`）；键盘表新增
  `radio-group.kbd.press`。三端公开 props 与事件不变。
- 655ac38: Calendar 的区间模式新增 hover 预览状态，连续轨道使用轻量行边界与完整起止圆帽，中间日期不再叠加普通悬停圆底。

  DatePicker 的区间模式新增 `range-separator` 部件及三适配器组件，起止日期输入可使用正式分隔部件组合，不再依赖空白区分。

- 2fca91b: **Rating 星接入按压通道：触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增 `pressedValue`
  （正被按住的星，按序号记），事件 `PRESS.START { value }` / `PRESS.END { value }`，守卫沿用 `canInteract`（禁用或只读不进），
  按住途中转入禁用或只读时由机器自行松开；松开不清悬停预览。星是 role=radio 的 span，Space / Enter 在它上面什么都不做
  （评分靠方向键走档），键盘那一路没有按压面。三端公开 props 与事件不变。
- 140cf60: **Reasoning 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  connect 读共用的 tool-call 机器 `context.pressed`，不另建机器；禁用时不进，按住途中转禁用时由机器松开；思考中 trigger 照常可点，按压面同样照有。
  键盘表新增 `reasoning.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **滚动区补边缘渐隐：新增 `variant` 形态轴与四位到头状态。**

  滚动区此前不暴露「还能往哪边滚」这件事：内容在容器边缘被齐平切断，看不出下面还有没有东西，也没有任何属性给作者自己去画。

  新增 `variant?: 'plain' | 'fade'`，缺省 `plain` 就是现在的样子，逐像素不变。写 `fade` 时视口在两条轴上各按「那一头还滚不滚得动」铺一道渐隐带：还回得去的那一侧把内容淡出，滚到头即收成 0。渐隐由双层 `mask-image` 取交集做出，两条轴互不干扰；自绘滚动条是视口的兄弟节点，不跟着一起淡掉。带宽跟着组件已有的 `size` 走（`sm` / `md` / `lg` 三档），**不另开第二个尺寸类 prop**。

  两条轴各自到没到头同时落成视口上的四位布尔：`data-at-min-vertical` / `data-at-max-vertical` / `data-at-min-horizontal` / `data-at-max-horizontal`。要自己画「还能往下滚」的提示，接这四位即可，不必开 `fade`。判据取滚动量而不是滑块起点——滑块长度有像素下限，贴着末端时那个比例到不了 1。

  从右往左排版时横向那一层的两端对调（渐变没有逻辑方向，只能沿物理方向铺），逻辑侧的取值不动。

  `ScrollAreaAxisState` 随之多出 `atMin` / `atMax` 两项；新增 1 个使用者覆盖槽 `--xh-scroll-area-fade-size`。

- e24a3d3: Scrollbar 新增 `anchor` 属性（`shell` | `layer`，默认 `shell`）：`layer` 时根节点仍挂在定位壳里，
  但按滚动层在壳内的偏移盒（offsetLeft / offsetTop / offsetWidth / offsetHeight）由连接层写成内联几何
  贴在该层的盒子上，根带 `data-anchor="layer"`，皮肤放开壳边的 inset；层与并排兄弟的伸缩、增减都会
  重新测量。多个滚动层并排共用一个壳（级联的列、时间列）时每层各自一套滚动条。三端 `useScrollbars`
  / `ScrollbarsController` 同步接收 `anchor`，Web Components 的 `ScrollbarsController` 另支持
  `scrollables` 多路形态（按当前在场的层逐层建一套、离场即拆），并提供 `dispose()`。
- 6ec0c4b: **Segmented 分段接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedValue`（按住的段 value），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
  守卫 `canPress` 在整组禁用、只读或段自身禁用时不进；`endPress` 只松开 value 对应的那一个；按住途中整组转入禁用或
  只读时由机器自行松开。选中与按压互相独立，选中语义照旧由平台把这两个键翻成 click。皮肤的按压选择器已是
  `:is(:active, [data-pressed])`（`--xh-action-scale-pressed: none` 保接缝）；键盘表新增 `segmented.kbd.press`。
  三端公开 props 与事件不变。
- 8efcd86: Select 现在以 Headless Presence 租约管理真实退出：逻辑关闭会立即令 content `inert` 并退出可访问树，Layer、DismissableLayer 与焦点域保留到 content 的全部有限 CSS 退场完成。退场期间不再接受重复消解；重开撤销旧视觉租约、复用 Layer 并重新激活焦点域，卸载立即清理。
- ea9fc5b: **Select 条目与清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压
  面。** 机器 context 新增 `pressedPart`（`item` / `clear-trigger`）与 `pressedValue`（条目 value，清空按钮记 null），
  根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个状态都认；守卫 `canPress` 在
  禁用或只读时两者都不进，条目自身禁用（部件声明或 collection）时不进，清空按钮没有值可清时不进；`endPress` 只松开
  part + value 对应的那一个，open 态 exit 时条目随浮层收起一并松开，按住途中转入禁用 / 只读或值被清空时由机器自行
  松开。item 与 clear-trigger 的 getter 投影 `data-pressed`，Collection Item（overlay 语境）与 Action Control
  （field-inset 档）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `select.kbd.press`。三端公开
  props 与事件不变。
- fa08fb4: **选择与开关族补七项能力，全部是加法：不渲染新部件、不写新 prop 的既有用法逐值不变。**

  **`select` / `cascader` / `transfer` 补 `group` 与 `group-label` 两个部件。** 段落壳是 `role=group`（列表框允许拥有的两种子节点之一），段标题经 `aria-labelledby` 挂上来；条目照旧归到同一份集合，方向键与连打检索跨段贯通。三家的段标题与条目同一个 `padding-inline`，标题与条目文字因此在一条竖线上。`transfer` 的分组两侧各挂一份，身份连 `side` 一起算，两边的标题 id 不会撞；组内条目搬空或被搜索筛净时整段连标题一起收起。Vue 侧新增 `XhSelectGroup` / `XhSelectGroupLabel`、`XhCascaderGroup` / `XhCascaderGroupLabel`、`XhTransferGroup` / `XhTransferGroupLabel`，Web Components 侧各新增两个 `csspart`（段落壳自报 `value`）。新增类型 `SelectGroupProps` / `CascaderGroupProps` / `TransferGroupProps`。

  **`cascader` / `tree-select` 补 `footer` 部件**，与 `select` 的那条同一件事：浮层底部的操作区，写在 `content` 里，不进列表框与树的拥有关系，方向键与连打检索都走不到。`cascader` 的底栏横跨全部列——底栏在场时浮层壳才允许换行，没写它的浮层列多到放不下时仍是整体横向滚动。Vue 侧新增 `XhCascaderFooter` / `XhTreeSelectFooter`。新增覆盖槽 `--xh-cascader-footer-gap` / `-py` / `-px` / `-border` / `-font-size` 与同名的 `--xh-tree-select-footer-*` 五支。

  **`select` / `listbox` / `tree-select` / `transfer` 补 `empty` 部件。** 它一律待在列表框（或 `role=tree`）之外：`select` 与 `tree-select` 放 `content` 里当 `list` / `tree` 的兄弟，`listbox` 放 `root` 里当 `content` 的兄弟，`transfer` 放面板里当 `list` 的兄弟。露不露面的判据分两档：`transfer` 按本侧此刻可见的条目数由连接层收放；另外三家给了 `collection` 才由连接层按条数判定，条目手写时库数不出有几条，那一档不写 `hidden`，收放归作者。Vue 侧新增 `XhSelectEmpty` / `XhListboxEmpty` / `XhTreeSelectEmpty` / `XhTransferEmpty`。新增覆盖槽为四家各三支 `--xh-<组件>-empty-py` / `-px` / `-fg`（另有 `-font-size`）。

  **`slider` 补 `value-text` 部件**：挂在拇指里的值气泡，跟着拇指走位，默认只在推动那一刻露面（多拇指时只有手真正推着的那一个冒出来）。它是 `aria-hidden` 的，读屏仍走拇指自己的 `aria-valuetext`。新增 api `valueText(index)`：给了 `getValueText` 就是它的产出，否则是值本身；Web Components 侧留空的气泡由元素代填。新增覆盖槽 `--xh-slider-value-text-offset` / `-py` / `-px` / `-radius` / `-bg` / `-fg` / `-font-size`。

  **`rating` 补 `value-text` 部件**：写在 `root` 里、`control` 的兄弟，显示当前该点亮到的那个数（指针预览期间跟着预览值走），数字等宽因此不会带着星星左右挪。它在场时根改成两列栅格，星星带与分值并排、标题仍独占一整行；没写这个部件的评分不命中那条规则，还是原来的竖排。新增 api 只读字段 `valueText`。新增覆盖槽 `--xh-rating-value-text-fg` / `-font-size`。

  **`listbox` 与 `transfer` 补 `tone` / `size` / `invalid` / `readOnly` 四条轴，`checkbox-group` 补 `tone` / `size` 两条。** 尺寸只换根上的几个私有槽（条目内边距、间距、字号，以及 `transfer` / `checkbox-group` 的勾选方框直径），中档逐值等于此前写死的那一份；语气把勾选标记与勾中填色接到语气层派生好的档上，不写 `data-tone` 时退回品牌色。`listbox` / `transfer` 的只读改不动选中值但照常浏览与聚焦（`transfer` 连搬运一起封住、搜索照旧可用），校验失败在 `listbox` 落到列表框描边、在 `transfer` 落到两侧面板描边，两者同时发 `aria-readonly` 与 `aria-invalid`。两件随之登记进 `check-field-wiring` 的分组名单：它们的根有分组角色、焦点在各条目上，不是单一可聚焦控件。

- 690200f: **SideNav 链接行与分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedPart`（`link` / `branch-trigger`）与 `pressedValue`（入口 value），根级事件
  `PRESS.START { part, value, disabled? }` / `PRESS.END { part, value }` 平铺与弹出两个状态都认；守卫 `canPress` 在整个侧栏
  禁用时不进，入口自身禁用时不进；`endPress` 只松开 part + value 对应的那一个，弹出面板收起（exit）时一并松开，按住途中
  侧栏转入禁用时由机器自行松开。导航当前（`aria-current`）与按压互相独立；激活与展开语义照旧由同一次按键承担。
  Collection Item（page 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `side-nav.kbd.press`。
  三端公开 props 与事件不变。
- 297fb1e: **Sortable 拖动把手接入按压通道：触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增 `pressedId`
  （按项 id 记住正被按住的把手），事件 `PRESS.START` / `PRESS.END`；整体禁用或该项禁用时不进。把手的 pointerdown 同时是拖动起点：
  触屏那一下先进按压面、拖动会话同时起步，走够激活距离升级成拖动时由机器撤下，拖动中的回执只剩 `data-dragging`；键盘的
  Space / Enter 在 keydown 即拾起转拖动、按压面随即撤下。按住途中整体转禁用或该项离开 `ids` 时同样松开。键盘表新增
  `sortable.kbd.press`。三端公开 props 与事件不变。
- 295d6e0: **Steps 触发器接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行与圆点一起
  换面）。** 机器 context 新增 `pressedStep`（按住的那一步的下标），事件 `PRESS.START { step, disabled? }` /
  `PRESS.END { step }`；守卫 `canPress` 在整组禁用、作者自报禁用或 linear 未解锁时不进；`endPress` 只松开 step 对应的那
  一个；按住途中整组转入禁用时由机器自行松开。切步与按压互相独立，Enter / Space 在 keydown 那一刻照旧切步。皮肤按压规则
  已是 `:is(:active, [data-pressed])`（换面落在行与 `indicator`）；键盘表新增 `steps.kbd.press`。三端公开 props 与事件不变。
- 498ce78: **Switch 轨道接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，根级事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 在禁用、提交中或只读时不进；按住
  途中转入禁用、提交中或只读时由机器自行松开。轨道是原生按钮，Space 与 Enter 都是激活键，两键都进按压面；按压与开关态
  互相独立，按住途中开关态翻转不会丢掉按压面。皮肤按压规则已是 `:is(:active, [data-pressed])`；键盘表新增
  `switch.kbd.press`。三端公开 props 与事件不变。
- 2c5c5ac: **`table` 补出列设置区与工具条两块，`page-header` 补出形态轴与面包屑 / 头像两个位。**

  排序（`sort` / `sortPriority`）、列宽（`resizable` / `setColumnWidth`）、显隐与列序（`COLUMN_PREF.PATCH`）这三样表格内部一直都有，缺的只是把它们摆出来的那两个部件——于是每个用它的应用都自己长一层几百行的设置面板壳。现在两块都在库里：

  - `toolbar` 是搜索、筛选、密度与列设置这些**对整张表下手**的控件的位置。它是 root 的兄弟不是子节点——root 是 grid 系角色，子节点只能是 row 与 rowgroup，所以 Vue 侧另开一个 `toolbar` 插槽（不写就一个节点都不渲），Web Components 侧照旧由作者写在元素里、摆在 root 之外。它不带 `role`：一条控件带要不要 `role=toolbar` 连同那套方向键 roving 归作者，要就往里放一个 Toolbar。
  - `column-list` + `column-visibility-trigger` 是列设置区与它的显隐把手（`role=checkbox`，勾着＝这一列显示着）。渲什么照新增的 `api.columnSettings` 走：作者定义的那些列按偏好排过序，**藏起来的也在其中**——生效列（`api.columns`）把它们滤掉了，而设置区正是把它们放回来的地方。只剩最后一列显示着时那颗把手转 `aria-disabled`：全藏起来的表是一张没有列的网格，而设置区里的把手都长在列上，用户从那里再也点不出一个把手把列放回来。
  - 冻结档补上写入口：`COLUMN_PREF.PATCH` 收 `sticky`，`api.setColumnSticky(columnId, sticky)` 与显隐、列宽、列序并列。此前 `TableColumnPreference.sticky` 只读得出、改不了，只能整份 `setColumnPreference` 换掉。
  - `columnSettings` 与 `setColumnSticky` 两侧都露：Vue 在两个插槽的载荷里，Web Components 上是 `el.columnSettings` 与 `el.setColumnSticky()`。

  `page-header` 这一侧：

  - 新增 `variant`（`plain` / `surface` / `raised`）。不写即不发 `data-variant`，与写 `plain` 长一个样，既有页头逐值不变；`surface` 加底色、圆角与左右内衬，`raised` 再加一层抬起投影。`bordered` 在有面的两档改画整圈描边——一块切了圆角的面底下横一条直线，两头会露在圆角外面。
  - 新增 `breadcrumb`（整行排在标题之上）与 `media`（头像 / 图标位，排在返回位与标题之间）两个部件，都可缺省。此前面包屑只能塞进 `footer`，而那是标题**下方**的位置。
  - `XhPageHeaderTitle` 收 `as`（默认仍是 `div`）：这一块在页面大纲里确实是一级标题时写 `as="h1"`，组件自己照旧不往文档大纲里插标题。

- 101f8cb: **Table 七个可按部件接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  行（`row`）、全选把手、行选把手、展开把手、列显隐把手、排序把手与取下一页按钮共用一个机器，context 新增
  `pressed`（`TablePressedKey`：`select-all` / `load-more` / `row:<id>` / `row-select:<id>` / `expand:<id>` /
  `column-visibility:<id>` / `sort:<id>`），根级事件 `PRESS.START { key, disabled? }` / `PRESS.END { key }` 四个状态
  都认；守卫 `canPress` 在加载中不进，部件自身禁用（行禁用、不可展开、列不可排序、选择关停、只剩最后一列）时不进；
  `endPress` 只松开键对应的那一个，按住途中转入加载时由机器自行松开。行的按压只认落在行自己（含普通格子）上的
  事件，行里两颗把手与作者放进格子的控件各有自己的按压面。Space / Enter 的选中、排序与展开语义照旧。Action
  Control（icon / row 档）与 Collection Item（page 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；
  键盘表新增 `table.kbd.press`。三端公开 props 与事件不变。
- a145f51: **Tabs 页签接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedValue`（按住的 trigger value），事件 `PRESS.START { value, disabled? }` /
  `PRESS.END { value }`；守卫 `canPress` 在条目禁用时不进（Tabs 没有整组禁用，条目自身的禁用由 connect 判定后随事件
  带入）；`endPress` 只松开 value 对应的那一个。选中（`aria-selected` / `data-current`）与按压互相独立，确认语义照旧由
  同一次按键承担；同一个 pointerdown 先过按压跟踪器再判拖动起手（触屏归按压、鼠标归拖动）。line 档的 Collection Item
  nav 语境与 card / segment 皮肤的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `tabs.kbd.press`。
  三端公开 props 与事件不变。
- 32142f9: Tabs 的标签带放不下时不再折行：标签整体沿主轴位移露出被裁掉的那截。新增 `prev-trigger` / `next-trigger` 两个可选部件（Vue / React 为 `XhTabsPrevTrigger` / `XhTabsNextTrigger`，Web Components 为 `data-xh-part="prev-trigger|next-trigger"`），放在 `list` 里作两端翻页钮：接 Action Control icon 档 ghost 面，对读屏隐藏、不占 Tab 位，放得下时 `hidden`，挪到头那一侧禁用并收起；不写内容时皮肤画 chevron，盖底缺省取 surface（`segment` 轨道取 subtle），使用者槽 `--xh-tabs-scroll-trigger-bg` / `-fg`、`--xh-tabs-scroll-icon-size`。标签带上横向滚轮（触控板两指横划、Shift + 滚轮）按量位移并拦住页面滚动，竖滚轮放行；触屏手指按在标签带上沿主轴拖即跟手平移（走够激活距离才算平移，拖着时撤掉指下标签的按压面，抬手后紧跟的那次 click 不算点选；放不下时 `list` 写 `touch-action: pan-y pinch-zoom` 让出交叉轴，竖排为 `pan-x`），与换位拖动共用同一个指针会话；选中或聚焦的标签被裁在外面时自动挪进视野；位移在机器里按 continuous 档补间，减弱动效下一步到位。`api.overflow` 报两端各还有没有被裁掉的标签，放得下时为 `null`；新增事件 `SCROLL.PREV` / `SCROLL.NEXT` / `SCROLL.BY`。皮肤侧 `list` 改为 `flex-wrap: nowrap` + `overflow: clip visible`（只裁主轴，不是滚动容器：焦点环、粗指针外扩与 segment 抬起面的影都不被裁），`root` 加 `min-inline-size: 0` 让它在一行弹性 / 网格容器里也缩得下；指示条的几何改按排布几何（`offset*`）量，与位移无关。一致性夹具的标签带两端补上两只翻页钮，钉三端把它们建成同一种节点。tabs.css 涨约 3.7KB，全是翻页钮与位移规则。
- a316462: Tag 新增第四种公开 `ghost` variant，与既有 solid、subtle、outline 组成完整形态轴。默认与 subtle 改用 M1 soft material 的背景、边界、文字和轻阴影；outline 与 ghost 明确清除表面阴影，ghost 保持透明并可读取 tone 前景色。

  关闭钮维持 16px 视觉盒，同时用透明伪元素把实际指针命中扩到 24px，不改变标签行高。共同连接层现在通过 `setOpen(false)` 关闭，静态受控标签已经关闭时不会重复发同值 open-change 意图。

  皮肤按去注释、压空白的统一标准从 5581 增至 6314 字节（+733），增量对应 ghost 形态、M1 材质与关闭命中层；只重登记 Tag 基线，逐组件 10% 容差保持不变。

- 86ce3e7: TagGroup 按页内持久集合归位选中语义：新增 `item-indicator` 部件（Headless `getItemIndicatorProps`，Vue / React `XhTagGroupItemIndicator`，Web Components `data-xh-part="item-indicator"`）作为文字前的选中标记，选中时展示、未选中以 `hidden` 收起，内容留空时由皮肤绘制对号；按 `collection` 铺开的默认结构已包含它，手写部件时需自行加入。皮肤侧选中的标签改为品牌淡底 + 配对前景（`--xh-tag-group-item-bg-selected` / `-selected-hover` / `-selected-pressed` 新增，`--xh-tag-group-item-border-selected` 缺省改透明、`--xh-tag-group-item-fg-selected` 缺省改 `--xh-fg-on-brand-subtle`），实心档保留 currentColor 选中环；悬停改白底承载的 100 档，按下在缩放之外同时换底（`--xh-tag-group-item-bg-pressed`，实心档 `--xh-tag-group-item-bg-pressed-solid`）。皮肤体积增长来自选中三态、按下面、前导对号与高对比补救块。
- 61f60de: **TagGroup 标签本体与移除钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedPart` / `pressedValue`（正被按住的那一枚的哪个部件），事件 `PRESS.START { part, value, disabled? }`
  / `PRESS.END { part, value }`；守卫 `canPress` 在整组禁用、只读，条目禁用、不参与选中的本体、摘不掉的移除钮上不进；按住途中
  整组转入禁用 / 只读、正按着的那一枚被摘掉时由机器自行松开。按压经 `connectStaticTag` 的 `press` 入参交给静态标签，
  `data-pressed` 投影在 tag 的 root 与 close-trigger 上，皮肤按压面已是 `:is(:active, [data-pressed])`。三端公开 props 与事件不变。
- fa08fb4: **新增** `tag-group` 组件（标签组）：Vue 与 Web Components 两侧同时可用。

  它补的是标记族最大的一个缺口：一排可摘标签，此前只能逐枚写 `tag`，而每枚标签的关闭钮
  各占一个 Tab 停靠点——十枚标签就是十个停靠点；`tag` 的文档又明令禁止把标签整块当按钮用，
  却不给替代件。标签组把这一排收成**一个** Tab 停靠点：组内走方向键（roving tabindex），
  摘除走 `Delete` / `Backspace`，每枚标签的 `item-delete-trigger` 一律 `tabindex="-1"`。

  承诺的行为：

  - **焦点有去处**。摘掉一枚之后焦点交给前一枚——摘完之后它在文档里的位置原样不动、节点必然还在；
    前面没有就交给后一枚，一枚不剩就交给列表容器（它恒在，且此刻会重新认领 Tab 停靠点）。
    鼠标点摘除钮同样按这条走，焦点不会掉回页面开头。
  - **条目的去留归宿主**。`item-delete` 只报「用户要摘这一枚」，组件顺手把它从选中集合里去掉，
    节点由宿主改自己的数据摘掉——撤销、二次确认、服务端失败回滚都只有宿主知道。
  - **选中是另一条独立线**。`selectionMode` 取 `none`（默认）/ `single` / `multiple`；
    方向键只搬焦点，落值要按 `Enter` / `Space`，`Ctrl`/`Cmd` + `A` 全选。
    不接选中时不发 `aria-selected`——一排纯标记标签报「未选中」是句假话。

  解剖比单枚 `tag` 多一层 `cell`：摘除钮是可聚焦的按钮，而可聚焦的东西不许待在 `option`
  这类控件角色里（axe 的 `nested-interactive` 会判 serious），`gridcell` 允许，所以
  `list` 发 `role="grid"`、每枚标签发 `role="row"`、标签里那一格发 `role="gridcell"`。
  用 `collection` 时这一层由组件自己铺开，手写部件才需要写它。

  实现细节，不是承诺：这三个角色的具体取值；连打检索的取字处是 `item-text`。

  每一枚标签的观感与 `tag` 同源：形态 · 语气 · 尺寸三轴写在组上，由连接层打到每一枚标签身上。

- 6922cce: **Tag 关闭钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context
  新增 `pressed`（`TagPressedPart`：`root` / `close-trigger`，类型进公开面），根级事件 `PRESS.START { part }` / `PRESS.END { part }`；守卫 `canPress` 在禁用、只读时不进，关闭钮还要 `closable`，按住途中转入禁用 / 只读、收回关闭钮或标签收起时由机器
  自行松开。root 同一条通道只在触屏按下时进来，供把标签当条目用的宿主投影。`connectStaticTag` 新增可选的第四个入参 `press`
  （`TagPressPort`）：宿主替静态标签供给按压通道，未提供时两个部件都不接按压，既有调用不受影响。皮肤关闭钮的按压面改为
  `:is(:active, [data-pressed])`；键盘表新增 `tag.kbd.press`。三端公开 props 与事件不变。
- 3ef5a6e: **`tag` 新增 `readOnly`：只锁关闭钮，标签本身不置灰；新导出 `tagVariantForControl`。**

  从前 `tag` 表达「摘不掉」只有两条路：`closable=false` 把关闭钮连同位置一起收起（标签宽度跳变），`disabled` 把整枚标签置灰。宿主整体只读时要的是第三种——叉留在原地但按不动、标签本身照常——`tag` 表达不了，套 `tag` 的宿主只能各自再画一颗钮。

  - **`readOnly`**（Vue / React 同名 prop，Web Components 写 `read-only` 属性）：关闭钮留在原位、带原生 `disabled` 与 `data-disabled`，不打 `hidden`；`root` 不新发任何属性，`data-disabled` 仍只由 `disabled` 决定，皮肤里禁用那一档的置灰不会误伤只读标签。`readOnly` 与 `disabled` 同时在时按禁用那一副画。直接派 click 不收标签、不发 `open-change`，机器路与不建机器的快路同一条规矩。皮肤不改：关闭钮的 `:disabled` 已画成置灰色，光标由公共层给 `not-allowed`。
  - **`tagVariantForControl(variant)`**：控件面到标签形态的映射，`subtle` 的面上摆描边标签、`outline` / `ghost` / 缺省的面上摆淡底标签。此前是 `select` 连接层里的私有函数，套 `tag` 的控件类宿主都要这一份，改从 `tag` 导出。

  判据：headless `tag.spec` 加 5 条（只读的机器路与快路、撤销只读当场解禁、形态映射四个入参）；三侧一致性套件加「readOnly：关闭钮留在原位但禁用，root 不打 data-disabled，直接派 click 也不收标签」；Vue 快路 `tag-static-path.spec` 加 1 条；浏览器态新增 `tag-read-only-skin.spec`（三档形态 × 只读 / 禁用：宽高不跳、只读的底与字与常态逐字相同、禁用退成置灰、只读的叉悬停不换底）。文档站示例新增「只读」一份。

- cb9e315: **TagsInput 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，守卫 `canPress` 与清空按钮的显隐同一口径（禁用、
  只读，或既无标签也无文本时不进）；按住途中标签与文本被清空或转入禁用 / 只读时由机器自行松开。清空按钮的
  pointerdown 仍拦默认聚焦，焦点留在输入框。键盘表新增 `tags-input.kbd.press`。三端公开 props 与事件不变。
- 089ef81: **TextField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，按压与清空同一道 `canClear` 守卫（未开 clearable、
  禁用、只读或没有值时不进）；按住途中值被清空、关掉 clearable 或转入禁用 / 只读时由机器自行松开。清空按钮的
  pointerdown 仍拦默认聚焦，焦点留在输入框。键盘表新增 `text-field.kbd.press`。三端公开 props 与事件不变。
- 8795555: **补齐十一处缺失的读屏文案位**，都是「屏幕上看得清、读屏里说不明白」那一类。文案只增不减，已有写法一律照旧。

  **新增** `ComboboxTranslations.trigger`（兜底 `Show suggestions`）。展开钮里只有一枚箭头，此前一个 `aria-label` 都不发，读屏念到的是一颗没有名字的按钮——同一个组件里的清空钮早就有名字了。

  **新增** `DatePickerTranslations.hour` / `minute` / `second`。`showTime` 的三列此前直接把内部枚举 `hour` / `minute` / `second` 当 `aria-label` 发出去，作者改不动。现在走文案桶，内建英文与 `time-picker` 那份逐字相同。

  **新增** `ImageViewerTranslations.toolbar`（兜底 `Image tools`）。工具条此前借用对话框那句 `Image preview`，读屏里两块区域同名，走到哪儿分不出来。

  **新增** `MenubarTranslations.root`（兜底 `Menu bar`）与 `menubar` 的 `translations` prop。`role=menubar` 的名字不从内容来，此前整条菜单栏没有名字。

  **新增** `RatingTranslations.item` 与 `rating` 的 `translations` prop。星星那一格里只有符号，亮着与暗着画的还不是同一个，名字此前随高亮在两个符号之间来回变。**不给文案就不发名字**：写死一句会把作者标在星星上的那句盖掉，读屏念到的就不是屏幕上的东西。

  **新增** `TourTranslations.next` / `finish`。末步那颗按钮的语义是「完成」，此前只有一个 `data-last` 供皮肤换样子，没有任何地方能给它一句名字。两句都**不给就不产出 `aria-label`**——这颗按钮通常带可见文字。

  `MessageFeedTranslations.item` 现在**同时收字符串与函数**：给函数拿得到「第几条、共几条、谁说的」，给字符串仍是一句固定名字。它此前写着「模板串由调用方现场代入」，可连接层并不插值，`Message {position} of {size}` 里的占位符会被原样念出来；它也是这个组件唯一没有兜底的一条，现在兜底 `Message 2 of 5, assistant`。已经传字符串的调用方一行都不用改。

  `resizable` 八个把手的兜底名字不再是 `Resize n` / `Resize ne`——内部枚举念给用户听没人懂。改成方位说法（`Resize top edge` / `Resize top right corner`），与 `floating-panel` 那份一致；作者给了 `translations.handle` 仍以作者为准。

  `sortable` 的拖动播报不再念内部 id，退回那一项屏幕上写着的字（与 `table` 的列拖拽、`tabs` 的标签换位同一口径）；项上一个字都取不到时才退回 id。

  `tag` 关闭钮的兜底名字由 `Remove` 改为 `Delete`：摘掉一枚标签这个动作，`select` 与 `tags-input` 念的都是 `Delete`，三处从此用同一个词。

- 8ee8efe: **TimeField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，守卫 `canPress` 与清空按钮的显隐同一口径（可编辑且有值，
  禁用、只读或没有值时不进）；按住途中值被清空或转入禁用 / 只读时由机器自行松开。清空按钮的 pointerdown 仍拦默认聚焦，
  焦点留在段位上。time-picker / time-range-picker 自家的清空按钮由各自的根机器负责，不在此列。键盘表新增
  `time-field.kbd.press`。三端公开 props 与事件不变。
- 2ca7fc2: **TimePicker 触发钮、清空钮、快捷选项与时间格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，新增导出类型 `TimePickerPressedKey`），事件 `PRESS.START` /
  `PRESS.END` 挂根级：整体禁用谁都不进；只读时触发钮照常展开、照有回执，清空钮、快捷选项与时间格与它们的写值同一道门不进；越界或
  作者禁用的快捷选项与时间格不进。浮层收起时浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值收起，不再有 keyup）；按住途中
  转入禁用 / 只读或值被清空同样自行松开。键盘表新增 `time-picker.kbd.press`。三端公开 props 与事件不变。
- af55d45: **TimeRangePicker 触发钮、清空钮、快捷选项与时间格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个（时间格再带起 / 止端下标），新增导出类型 `TimeRangePickerPressedKey`），事件 `PRESS.START` /
  `PRESS.END` 挂根级：整体禁用谁都不进；只读时触发钮照常展开、照有回执，清空钮、快捷选项与时间格与它们的写值同一道门不进；越界或
  作者禁用的快捷选项与时间格不进。浮层收起时浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值收起，不再有 keyup）；按住途中
  转入禁用 / 只读或值被清空同样自行松开。键盘表新增 `time-range-picker.kbd.press`。三端公开 props 与事件不变。
- 0460036: **新增** `time-range-picker` 组件（时间范围选择器）：起止两组可键入的分段时间框、`range-separator`、触发器与浮层里并排的两组时列组合成一个字段；`time-picker` 本身不承接区间，这一路是净新增。

  - 值恒为区间两端 `[start, end]`，按位存放，空缺的一端用空串占位（只填了终点是 `['', end]`），受控回写按同一份下标认领；`api.start` / `api.end` 直接取两端，终点早于起点时 `api.reversed` 为真并把整个字段标为不合法。
  - `name` 与 `endName` 各自决定两份 `hidden-input` 参不参与提交；`segment-group` 带 `data-index`（0 起点、1 终点），方向键换段不跨组，两组各报「开始时间」「结束时间」（`translations.startTime` / `endTime`）。
  - 浮层里是 `column-group` × 2（各带 `column-group-label`），每组按 `granularity` / `hourCycle` / `step` 铺时、分、秒（与上下午）列；`min` / `max` 裁掉两组共同的界外值，另一端一填全再各自收窄一次（终点的下界是起点，起点的上界是终点）；`isTimeUnavailable(value, unit, index)` 多收一个端号，逐格判定；方向键在一组内换列、跨到另一组继续。
  - `presets` 只收区间，值用 `start/end` 写法：`timeRangePickerPresetValue` 拼两端，`timeRangePickerPresetTimes` 拆回，`timeRangePickerPresetFromNow(minutes)` 算「接下来 N 分钟」；不是恰好两端、越界或倒序的快捷项直接置灰。
  - Vue `XhTimeRangePicker*` 与 `useTimeRangePicker`；React 同名组件与 hook；自定义元素 `<xh-time-range-picker>`（`value` / `default-value` 是数组，只走 property；`columnGroups` 只读属性给出两组该铺的列与格）；皮肤 `@xihan-ui/styles/time-range-picker.css`，覆盖槽前缀 `--xh-time-range-picker-*`。

- 6b161da: **Timer 的 control 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级、四段状态都接；同一颗钮在 running / paused 下语义不同，按住途中起停翻转按压面不丢。按钮没有禁用态，按住一律进。
  键盘表新增 `timer.kbd.press`。三端公开 props 与事件不变。
- 5dfa0f2: **Toast 的关闭按钮与操作按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`（`ToastPressedPart`：`'close' | 'action'`，记正被按住的那颗），事件 `PRESS.START` / `PRESS.END`；
  不可关闭时关闭按钮不进，进入退场（点关闭、点操作、到点自动退场）或按住途中转成不可关闭时由机器松开。
  `ToastPressedPart` 类型进入公开面；键盘表新增 `toast.kbd.press`。三端公开 props 与事件不变。
- 0a6b3d2: **ToggleGroup 条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedValue`（按住的条目 value），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
  守卫 `canPress` 在整组禁用或条目自身禁用时不进；`endPress` 只松开 value 对应的那一个；按住途中整组转入禁用时由机器
  自行松开。开关态（`aria-pressed` / `aria-checked`）与按压互相独立，切换照旧由平台把这两个键翻成 click。Action Control
  家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `toggle-group.kbd.press`。三端公开 props 与事件不变。
- 1536143: **ToolCall 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  tool-call 机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级、auto / held 四个叶态都接；禁用时不进，按住途中转禁用时由机器松开；运行中 trigger 照常可点，按压面同样照有。
  键盘表新增 `tool-call.kbd.press`。三端公开 props 与事件不变。
- 252e2d5: **新增** `tool-call` 与 `reasoning` 两个组件：Agent 界面里的「它正在做什么」与「它是怎么想的」，Vue 与 Web Components 两侧同时可用。两者共用同一台机器，但解剖、皮肤与文案各一份——正文形态不同，工具调用的参数与结果是等宽结构块，思考过程是散文。

  **自动开合的锁存靠转移的放置位置，不靠一个布尔位。** 跑起来自动展开、结束自动收起；用户手动开合过一次之后，阶段变化在结构上就够不着任何转移，自动开合永久停用。挂载那一刻已经在跑的调用会**直接展开**——工具块往往是带着「正在跑」被建出来的，等状态「翻真」是等不到的。

  `tool-call` 有五档阶段，比 AI 协议里的工具状态多出 `awaiting-approval` 一档：协议层的审批只改审批状态、不改工具状态，没有这一档的话「在等人批准」会被当成「在跑」。审批闸门是 `approval` 部件，**常驻在开关与详情之间**，不会被折叠藏起来。

  `reasoning` 的「想了多久」由起止两个时刻算出来，**任一缺席即算不出来**——流被中止时兜底收尾不写结束时刻，推理块会只有起点没有终点。名字与时长都排在开关里，「思考过程，用时 12 秒」整句自然构成开关的可访问名，不再另发 `aria-label`。

  两者收起都走 `hidden` + `inert`：退场动画播完之前内容还在渲染，`inert` 把这段窗口挡在读屏与 Tab 序之外。卡片自己都不开活区——一屏若干张各开一个会互相打断；播报文本由 `statusText` 交出去，由宿主写进会话级的那一个播报区。

  另导出两个纯函数：`isToolCallRunning(phase)` 与 `toneOfToolCallPhase(phase)`，后者给徽章之类的纯样式联动用。

- 0d7cd38: **Toolbar 的 item 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedValue`，事件 `PRESS.START` / `PRESS.END` 按条目 value 记按住的那一个；整条或条目禁用时不进，按住途中整条转禁用时由机器松开。
  键盘表新增 `toolbar.kbd.press`。三端公开 props 与事件不变。
- 3a3b478: `tour` 以 Headless 的 Presence 租约作为退出生命周期真源：逻辑关闭立即让内容 `inert` 并退出可访问树，Layer、DismissableLayer 与焦点域会等气泡、遮罩和聚光灯的全部有限退场完成后才释放。退场期间不会再次接受 Escape 或层外交互；中途重开会结清旧租约、复用原 Layer 并重新激活焦点域，卸载立即释放资源。

  三端均把真实的 content、backdrop 与 spotlight 接入同一份 Presence。Tour 不新增滚动锁、背景失活、退出完成事件或回调。

- 46a5116: **Transfer 接入 Collection Item 与 Action Control 配方，勾选行改品牌淡底，搬运钮改中性描边，两侧列表接自绘条。**

  - 条目投影 `data-xh-collection-item` / `-size` / `-context='page'`，文字落 `text` 槽、勾选方框是前导标记（`prefix`）；悬停 100、按下 200 只换面（此前按下零反馈），勾中的行铺 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景（此前行不染色），selected + hover 20%、+ pressed 28%。新增 `--xh-transfer-item-bg-pressed` / `--xh-transfer-item-bg-selected` / `--xh-transfer-item-fg-selected`。
  - 两颗搬运钮接 Action Control `icon` 档 outline 形态：中性描边、透明底，hover 100 → pressed 200 并 0.97 缩放（此前淡底 + 悬停 raised 抬升 + 200 / 300 阶梯）；`--xh-transfer-trigger-shadow-hover` / `-active` 缺省改 none。
  - 全选把手补悬停 / 按下面（`--xh-transfer-select-all-bg-hover` / `-pressed`），圆角改 `--xh-shape-inset` 档（与 control 同值）。
  - 面板标题字重由 500 改为 `--xh-font-weight-semibold`（Surface 内标题档）；根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档，勾选格里的勾按边长比例取尺。
  - 三端把两侧 `list` 接上自绘滚动条（真源 §6.6 定高小列表）：条子挂在 `root` 上、贴层锚定、紧跟在各自列表后面、两轴都摆、走 6px 缺省档；Vue 的 `XhTransferList` 与 React 的同名组件根节点从此是片段（列表 + 条子），直通属性仍落在列表节点上。

- e416596: 穿梭框增加 name/form 原生表单支持，三端自动为每个目标值装配同名隐藏字段，逗号原值无损提交；支持禁用排除和原生重置恢复声明默认目标与勾选。
- 54c56f6: **Transfer 条目、全选格与两颗搬运按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 四类部件共用一个机器，context 新增 `pressed`（`TransferPressedKey`：`to-target` / `to-source` /
  `item:<side>:<value>` / `select-all:<side>`），根级事件 `PRESS.START { key, disabled? }` / `PRESS.END { key }`；守卫
  `canPress` 在禁用、只读或加载时不进，部件自身不可用（条目禁用或被藏起、全选格无可操作条目、搬运按钮没有勾中的
  条目）时不进；`endPress` 只松开键对应的那一个，按住途中转入禁用 / 只读 / 加载，或按住 Enter 搬完后按钮失去可搬的
  条目（原生 disabled 不再来 keyup）时由机器自行松开。Space 的勾选与搬运语义照旧。Action Control（icon / text 档）
  与 Collection Item（page 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增
  `transfer.kbd.press`。三端公开 props 与事件不变。
- db1dc9a: **Tree 叶子行与分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedPart`（`item` / `branch-control`）与 `pressedValue`（节点 value），事件
  `PRESS.START { part, value, disabled? }` / `PRESS.END { part, value }`；守卫 `canPress` 在整棵树禁用或加载时不进，
  节点自身禁用时不进；`endPress` 只松开 part + value 对应的那一个，按住途中整棵树转入禁用 / 加载时由机器自行松开。
  叶子行自己接键盘与触屏；分支行的焦点落在 branch 上，键盘按压由 branch 代发（只认落在自己身上的按键与失焦，
  子树里冒泡上来的不算），`branch-control` 投影 `data-pressed` 并只接触屏；同一个值按住分支行时叶子不亮。
  Space / Enter 的选中与展开语义照旧由 tree 容器承担，按压只记事实。Collection Item（page 语境）家族配方的按压
  选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `tree.kbd.press`。三端公开 props 与事件不变。
- 261f03d: **TreeSelect 叶子行、分支行与清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressedPart`（`item` / `branch-control` / `clear-trigger`）与 `pressedValue`
  （节点 value，清空按钮记 null），根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个
  状态都认；守卫 `canPress` 在禁用、只读或加载时三者都不进，节点自身禁用时不进，清空按钮没有值可清时不进；`endPress`
  只松开 part + value 对应的那一个，open 态 exit 时随浮层收起一并松开，按住途中转入禁用 / 只读 / 加载或值被清空时由
  机器自行松开。叶子行自己接键盘与触屏；分支行的焦点落在 branch 上，键盘按压由 branch 代发（只认落在自己身上的按键与
  失焦，子树里冒泡上来的不算），`branch-control` 投影 `data-pressed` 并只接触屏；同一个值按住分支行时叶子不亮。
  Collection Item（overlay 语境）与 Action Control（field-inset 档）家族配方的按压选择器已是
  `:is(:active, [data-pressed])`；键盘表新增 `tree-select.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **排版与文字效果族补齐八项能力：富文本排版真源、两条轴、两处语气、行数槽、受控暂停、图标八档直径与旋转翻转。全部是加法，既有写法一行不动。**

  `typography` 多了一个 `prose` 部件——这是库里第一份富文本排版真源。`@xihan-ui/markdown` 与 `markdown-stream` 产出的整段 HTML 套进它就有排版：标题六档字号与 `heading` 部件同源、段与段之间只留一份间距、列表缩进、行内代码与 `text` 的 `code` 形态同源、代码块自己成一片面并横向滚动、引用带起始描边、图片不撑宽容器、表格行线到底。标签选择器一律包在 `:where()` 里，块内嵌 XiHan 组件时那份皮肤仍然赢。两个适配器分别是 `XhTypographyProse` 与 `data-xh-part="prose"`。

  `typography` 同批补 `align`（start / center / end / justify）与 `weight`（regular / medium / semibold / bold）两条轴，落在 `root` 上整块一起换；`weight` 也能只写在一段行内文字上，排在形态之后——与 `variant="strong"` 同写时粗到哪一档由它说了算。

  `highlight` 补 `tone`，落在 `root` 而不是 `mark` 上：一段里的命中片段有好几个，用哪族颜色是整段的属性。`mark` 的字重同批开出 `--xh-highlight-mark-font-weight`。

  `gradient-text` 补 `tone`：两端取该族主色与它压深一档的取值，深浅两态自动跟随；排在 `from` / `to` 之后，作者写了两端颜色即以作者为准。

  `truncate` 的行数开出 `--xh-truncate-lines`，排在连接层写的内联私有槽前面——在外层写一句即可整片改档。

  `marquee` 补受控暂停 `paused` → `data-paused`，排在悬停两条之后：作者说了停就停，指针离开也不会把它带回去走。`speed` 的口径同批在文档里说清——它按 `--xh-marquee-span` 换算成一圈时长，要逐字对上每秒像素数就把这支槽改到内容的真实长度。

  `icon` 的 `size` 从三档放宽到八档 `IconSize`（`text` / `sm` / `md` / `lg` / `xl` / `2xl` / `3xl` / `4xl`，逐档对应 `--xh-glyph-size-*`，`text` 跟着相邻文字的字号走），缺省仍是 `md`；同批补 `rotate`（90 / 180 / 270 三档，其余值不写出）与 `flip`（horizontal / vertical / both），两者是独立属性可以叠加。翻转的 `scale: -1` 登记进 `check-motion-amplitude` 的 `STATIC_GEOMETRY`：翻转是几何不是幅度，减弱动效档压成 1 等于把翻转撤掉。

- 5e4b0cb: 补齐视口与特殊浮层的实例级 Portal 容器入口。

  Vue Dialog、Command、ImageViewer、FloatingPanel 与 SideNav 分支，以及 React/Vue Tour，均可让实例
  容器优先于应用配置；React SideNav 同步获得分支实例容器。Tour 的 backdrop、spotlight、positioner
  共享根实例目标，避免三张表面被配置到不同容器。

- 2e7b3f0: 为 Popover、Popconfirm、HoverCard、Tooltip、Menu、ContextMenu、Menubar 与 Pagination 的 Portal 部件增加实例级 `container`。
  实例容器优先于应用配置；Pagination 的省略页浮层与 PageSizeSelect 浮层可分别指定容器。
- 6a08317: 为 Select、Cascader、Combobox、TreeSelect、DatePicker、TimePicker、ColorPicker 与 Mention
  的 Positioner 增加实例级 `container`。

  实例容器优先于应用配置和运行时默认 Portal 根；局部视觉桥、SSR 首帧和既有全局配置语义保持不变。

### Patch Changes

- 233739b: Vue 的 `useScrollLock` 改在 mounted 后用 post watcher 读取当前 active 与 RuntimeConfig，确保初始启用时模板 ref 已经提交。释放会先清空包装层句柄再调用 Core dispose，因此清理抛错后下一次 false→true 仍能用最新配置建立新锁；单次 active 阶段继续固定创建时配置，不因普通对象换代重锁。

  React 的 `useScrollLock` 改用同构 layout effect，在浏览器绘制前完成首帧加锁，并保持单次 active 阶段的 RuntimeConfig 固定；false→true 会读取最近一次已提交配置，StrictMode 的探测清理不会留下额外锁。

  Web Components 的 `<xh-command>` 现在与 Dialog、Drawer、ImageViewer 一样，在每次实际获取滚动锁时沿元素祖先链读取最近的 `<xh-config>` 或全局 `scrollRoot`。未配置时显式返回 `null` 表示页面，不再依赖 Core 自动探测。

- 4192265: Breadcrumb 的数据模式默认使用皮肤绘制的箭头分隔符，不再输出斜杠文字；自定义分隔内容仍通过现有插槽与渲染函数提供。
- a880755: CodeView 默认高亮器的异步请求、单例缓存、订阅与失败边界现由 Headless 资源控制器统一管理，三端适配器只注入可选模块 loader 并桥接各自响应式更新。
  显式关闭高亮不会请求默认模块；明确缺少可选 peer 时保持纯文本，已安装模块的加载或初始化异常不再被静默吞掉。
- ced9f26: Command 的非模态模式不再创建或显示遮罩；全屏 positioner 只负责布局，不截获页面指针，content 自身保持可交互。

  展开期间切换 `modal` 会由无头状态机同步焦点陷阱、Tab 回绕、滚动锁和背景失活。默认模态行为保持不变。

- 02de41e: Command 无可见命令时收起空列表的额外内距，隐藏分组和隐藏条目不会留下空白行；禁用命令仍作为真实候选显示。
  没有作者内容的 Empty / Loading 节点不再占据纯留白。搜索输入、状态文案、底栏及焦点位置保持正常。

  数据集合保持不变，已有 DOM 中明确隐藏的候选退出键盘、指针、执行与 ARIA 高亮；未挂载或虚拟候选不作隐藏推断。
  三端在 List 节点提交和释放时通知私有可见性端口，保持展开替换节点时撤销旧观察并绑定新列表，不扫描整个 Document。

  皮肤体积（去注释、压空白）：前一提交源码 10959 字节，当前 11264 字节；登记基线 10959 → 11264，只更新本组件，10% 容差保持不变。

- c7966d3: 新增框架无关的 `groupAdjacentRuns` 集合投影；ContextMenu 与 Menubar 的数据驱动默认渲染改用同一 Core 真源，不再由 Vue、React 各自复制相邻分组算法。
- 249819e: 新增统一的 `normalizeItemIndex` 部件下标归一函数；Slider 与 Splitter 的 Vue、React、Web Components 接线不再分别复制有限数与回退判定。
- f171e1a: **DatePicker 交给焦点域的 `getContentEl` 只回答 DOM 事实，不再复核 Portal 配置。**

  焦点域在框架错误通道之外（机器 flush、rAF）调用这个 getter；此前它读的是带校验的 `portalTarget` computed，运行期收到跨 Document 或非 Element 的 `portalContainer` 时，先到的这一路把异常截走成未捕获 rejection，渲染只剩缓存的旧值，`app.config.errorHandler` 收不到错误。现在 getter 直接按显式 `portalContainer` 或运行时默认落点做包含判断（不包含即视为正文尚未进落点），配置错误仍由渲染读 `portalTarget` 抛出并交给框架上报。

- c5bed6b: 日期选择器初始展开时，等正文实际进入目标 Portal 后再交给焦点域，避免原地挂载时取得的焦点在 Teleport 搬运后丢失。覆盖默认及显式 iframe 目标、受控展开和 SSR 水合。
- aea229b: **DateRangePicker 交给焦点域的 `getContentEl` 只回答 DOM 事实，不再复核 Portal 配置。**

  与 DatePicker 同型：getter 直接按显式 `portalContainer` 或运行时默认落点做包含判断，配置错误仍由渲染读 `portalTarget` 抛出并交给框架上报，不再在机器 flush / rAF 那一路成为未捕获 rejection。

- 7e512dc: Dialog 在 `modal=false` 时不再创建或激活全屏遮罩，定位层不再拦截面板之外的页面指针；展开期间切换 `modal` 会同步更新焦点陷阱、滚动锁、背景失活和遮罩。

  FocusScope 的 `loop` 选项新增 getter 形式，使共享核心能够在不重建焦点域的情况下切换 Tab 边界回绕策略。

- 0308154: 新增框架无关的 DialogService controller，统一管理请求排队、单次结算、真实退出身份、动作 attempt 与宿主失败或卸载时的队列清场。

  Vue、React 与 Web Components 的 DialogService 改为共享该控制器；各端公开 API、Promise 结算时点、动作错误语义及渲染结构保持不变。

- 192876a: 命令式对话框服务改用公共 Header、Body、Footer 组件，统一三端结构及间距；长正文只滚动 Body，标题和确认/取消按钮保持可见，字符串、函数正文与 prompt 合同不变。
- 1f1c06a: DialogService 队列改由当前请求对应的真实退出完成通知推进，不再固定等待 250ms。自定义长退场会完整播放，无动画或减动效则立即进入下一项；重复关闭和旧请求的迟到完成不会跳过新请求。
- 4640530: Drawer 在 `modal=false` 时不再创建或激活遮罩，定位层继续允许指针穿透到页面；展开期间切换 `modal` 会同步更新焦点陷阱、滚动锁、背景失活和遮罩。
- 4cebbcf: Toast 与 Notification 的默认服务投影现在由 Headless 统一计算：合并计数标题、Toast 默认语气、
  有效停留时长、默认关闭出口及服务级退场/页面暂停值不再由三端适配器分别判断。DialogService 的
  徽记到语气映射也迁入同一核心层；适配器只保留框架节点、Light DOM、宿主挂载和事件桥接。
- 2cbfb51: 新增 Toast 与 Notification 命令式服务共享的框架无关 controller，统一管理服务级暂停、Toast id、行内动作回调、create/update/dismiss、真实退场回收、Promise 三态和 dispose 生命周期。

  记录数组、max、priority 与 dedupe 继续由既有 notificationMachine 统一处理，没有新增第二套队列。三端公开 API、id、顺序、合并、挤条与渲染语义保持不变。

- be08778: **修复**复选框与开关套进表单字段后说明与错误文本念不出来：给了默认插槽时封装根是外面那个 `<label>`，`XhFieldControl` 把整份接线合在它身上，焦点却在里面那颗 `button` 上，读屏只念焦点所在节点的描述，`aria-describedby` 与 `aria-invalid` 因此永远播报不出来。两个封装改为在按钮上取 `useFieldStateWiring()`；名字同时补上 `useFieldLabelWiring()`，文字那段带 id，按钮的 `aria-labelledby` 写成「字段的标签 + 组件自己那段文字」，两截都念得到。没给文字的用法一个字节不变。

  布尔状态属性的名字改由门禁守住：`state-vocabulary.json` 的 `boolean` 表此前从没有任何脚本读过，7 条登记对着 connect 实发的 104 种属性，「同一含义只用一个名字」无从落地。判据补成两头都查——发了没登记即报，登记了没人发算名单过期——并把实发的 97 个补登进表，逐条写明语义。

- d41017b: Checkbox、Switch、RadioGroup 与 NumberField 现已接入统一的 FormControlContext 状态继承：
  `disabled`、`readOnly`、`invalid`、`required` 按实例、最近 Field、Form、默认值的顺序逐轴解析。
  Vue、React 与 Web Components 共用 Headless resolver；Web Components 同时支持显式 `false` 覆盖继承状态。
- c27da1f: Rating、Segmented、ToggleGroup 与 Transfer 现已接入统一 FormControlContext 状态继承。
  各组件只消费原有公开状态轴，并按实例、最近 Field、Form、默认值逐轴解析；显式 `false` 可覆盖继承状态。
- fb56533: Editable、TagsInput、CheckboxGroup 与 Slider 现已接入统一的 FormControlContext 状态继承。
  各组件只按原有公开契约消费 `disabled`、`readOnly`、`invalid`，TagsInput 另消费 `required`；
  所有支持轴均按实例、最近 Field、Form、默认值逐轴解析，并允许实例显式 `false` 覆盖继承状态。
- 36b4098: FieldArray、FileUpload、ImageCropper 与 SignaturePad 现已接入统一 FormControlContext 状态继承。
  各组件只消费原有公开状态轴，并按实例、最近 Field、Form、默认值逐轴解析；显式 `false` 可覆盖继承状态。
- 2d35bc5: 让 Listbox 与 TagGroup 接入统一 FormControlContext 状态继承。

  Listbox 消费既有 disabled/readOnly/invalid 三轴，TagGroup 消费 disabled/readOnly 两轴；实例显式
  `false` 继续优先于最近 Field 与 Form，Web Components 的条目禁用快照使用解析后的有效状态。

- 4da51d1: DatePicker、TimePicker、ColorPicker 与 Mention 现已接入统一 FormControlContext 状态继承。每个组件只消费既有公开状态轴，按实例、最近 Field、Form、默认值逐轴解析，并允许显式 `false` 覆盖继承状态。
- c61f90c: PasswordInput、PinInput、DateField 与 TimeField 现已接入统一的 FormControlContext 状态继承。
  `disabled`、`readOnly`、`invalid`、`required` 按实例、最近 Field、Form、默认值逐轴解析，
  且三端都保留显式 `false` 覆盖继承状态的能力。
- 8507ce8: Select、Cascader、Combobox 与 TreeSelect 现已接入统一 FormControlContext 状态继承。三轴或四轴严格按各组件现有公开契约消费，并按实例、最近 Field、Form、默认值逐轴解析；显式 `false` 可覆盖继承状态。
- 3577e4c: 表单重置桥支持显式 form 归属；未指定时继续查找祖先表单，指定无效目标时不回退其他表单，三端按机器正式 form 属性接线。
- 934a51b: Grid 的单值与逐断点对象/JSON 声明统一由 Headless 归一；Vue、React、Web Components 不再分别解析数字、有限值和断点键。
- 1322aa6: Headless 新增纯数据投影 `groupJsonViewerNodesByParent` / `JsonViewerNodesByParent` 与 `diffViewSides` / `DiffViewSides`，供自定义 JsonViewer 和 DiffView 渲染器复用与官方三端保持一致的数据形状。

  Vue、React 与 Web Components 删除各自重复的父路径分组和差异列序实现，改为调用 Headless 投影；DOM 结构、渲染顺序和公开组件 API 保持不变。

- 5226181: 将 DatePicker 公开部件的面板下标、起止字段身份和字段投影归一逻辑下沉到 Headless。

  三适配器复用同一组纯函数，非法下标回到真实父面板，非区间模式的终点继续如实缺席；
  适配器只保留各框架上下文与 DOM 接线。

- 89b2640: Heatmap 的数字与字符串身份归一改由 Headless 唯一真源提供；三端适配器只读取框架 props 或 Light DOM attribute，不再复制空值与有限数判定。
- 48d6b88: LayerRegistry 现在按每个 Document 的真实逻辑栈派生视觉序号与 lane，并通过统一
  `--xh-_layer` 槽驱动已登记浮层的 z-index。嵌套 popover 高于所属 modal，后来登记的层
  不再被组件静态层级压住；动态 modal 会显式同步 Registry 与视觉绑定。

  删除 `Layer.setModal`。模态性继续由只读 `isModal()` getter 提供，变化后调用
  `LayerRegistry.sync(layer)`；`visualOf(layer)` 返回当前 `visualIndex`、`visualLane` 与可写入
  CSS 的 `visualLayer`。公开组件层级变量仍优先于 Registry 私有槽。

- 31ada22: Layout 覆盖式侧栏的 Escape 层级判断改为读取所在运行时显式注入的
  `RuntimeConfig.layerRegistry`，不再按机器 Scope 的 Document 另取默认注册表。使用自定义
  LayerRegistry 时，上层浮层会先处理 Escape；默认注册表里的层不会串进这份自定义层栈。

  `LayoutSchema.refs` 新增并公开 `LayoutRefs.config`。RuntimeConfig、LayerRegistry 与机器 Scope
  必须属于同一 Document，缺少配置或混接会在副作用挂载时明确失败。Vue、React 与 Web Components
  适配器都在机器 mount 前注入配置；Web Components 重连时会按元素当前 ownerDocument 重建。

  直接启动 `layoutMachine` 的调用方必须先建立同源 Scope 与 RuntimeConfig，并在启动运行时之前注入：

  ```ts
  const scope = createScope(root, idGenerator);
  const service = createService(layoutMachine, { props, runtime, scope });
  service.refs.set("config", createRuntimeConfig({ scope, idGenerator }));
  runtime.start();
  ```

- 10dd5f4: 新增框架无关的 LoadingBarService controller，统一管理并发在途计数、正常与错误语气、确定进度值，以及 finish、error、finishAll 和 dispose 的状态转换。

  Vue、React 与 Web Components 的命令式 LoadingBar 服务改为消费同一份状态快照；公开 API 和进度条爬升、收尾及淡出视觉语义保持不变。

- 4e0aadf: Masonry 的 DOM 测量与作者序高度投影现在由 Headless `measureMasonry` 统一提供，
  `sameMasonryHeights` 统一判断连续两次高度序列是否真的变化。React 与 Vue 只保留
  ResizeObserver、框架响应式状态和节点渲染接线，不再各自查询 item、读取矩形或复制数组判等。

  Web Components 保持其 Light DOM“首次见到顺序”合同，不套用依赖稳定 `data-index` wrapper 的
  框架投影，也不改变运行期新增项的顺序语义。

- 1042c06: 修正多级 Menu、ContextMenu 与 Menubar 在 Portal 之间悬停时祖先提前关闭的问题。

  `trackHoverIntent` 新增可选的 `getHoverBranches` 端口：调用方可显式登记同一 Document 中、
  逻辑上属于当前悬停树的 Portal 后代。主内容、后代分支与触发器之间均使用实时区域快照和
  安全多边形仲裁；没有登记的 Dialog、Popover 等无关浮层不会被推断成菜单后代。

  Menu 机器新增适配器 ref `getHoverBranches`。React 与 Vue 的 Menu、ContextMenu、Menubar
  组合部件按真实父子关系递归登记仅处于展开态的子菜单 positioner；进入三级、在三级内移动、
  返回二级均不会触发祖先的旧关闭计时。末级选择改为从叶到根同步收链，避免共享 LayerRegistry
  出现非栈顶释放；键盘逐层进入、返回与 Escape 栈顶语义保持不变。

- 82d9e67: **Menubar：浮层里的条目失焦到菜单栏外，三端一并收起。** `MENUBAR.BLUR` 的意思一直是「焦点离开整条菜单栏（含浮层里的菜单）即收起」，但上报只挂在根的 `focusout` 上：浮层被搬去了 portal 落点，条目的 `focusout` 走 DOM 树到不了根——Vue 与 Web Components 在 Alt+Tab、程序化 `blur()` 或进 iframe 时菜单留在原地，React 却因合成事件沿组件树穿过 Portal 而收起，三端行为不一致。

  现在 `content` 自己也接 `focusout`：离开的节点在它子树里、落点（`relatedTarget`）既不在根、不在任何一张浮层、也不在子菜单里，就发 `MENUBAR.BLUR`；`relatedTarget` 为 `null` 按 DOM 语义一律算离场。一次离场只由一个部件上报——根只认自己子树里、且不在任何浮层里的节点——所以 React 合成事件把同一次 `focusout` 送到根时不会再报一回，受控宿主只收到一条 `value-change`。子菜单里的条目失焦仍归子层的 Menu 机器，本次不动。

- 1774c08: NavigationMenu 逻辑关闭后不再立刻释放 Layer 与消解层：三端当前面板的退出 presence 完成前，
  资源继续保持；退场中重开会撤销旧完成订阅并复用原 Layer。该修正不改变 NavigationMenu 的
  公开 props、事件、Portal 或视觉环境轴。
- 3f9c145: **修复**随包发到 npm 的文本。

  `@xihan-ui/pointer` 补上 README。它是唯一一个没有 README 的发布包，npm 页面此前只有 package.json 的一句 description。

  三份 README 的示例引了不存在的名字，照抄即解析失败：`@xihan-ui/chat-stream` 的 `createChatStore` / `httpSseTransport` 改成真名 `createThreadStore` / `createHttpSseTransport`；`@xihan-ui/behavior` 的 `createDismissableLayer` 改成 `createDismissLayer`；`@xihan-ui/vue` 的 `XhDialog` 改成组合式的 `XhDialogRoot` / `XhDialogTrigger` / `XhDialogContent`。

  `@xihan-ui/web-components` 的 README 把两处过期说法改写成结论：逐帧 parity 的覆盖面是 101 个套件（不是只有 Button 一个），收不进来的 26 个逐条登记在 `EXCLUDED` 里并各带理由，dialog 属两端 presence 模型不同的永久性差异；受控 open 的跨适配器一致性由两端各自跑同一份 conformance 规格覆盖。

  十份 CHANGELOG 里 38 处指向仓外文档目录的引用整体删掉——那些路径不随包发布，点过去是 404。

  三道门禁把这几类问题焊住：`check-package-manifests`（每个发布包必须有 README，16 张包清单与实际发布包双向对账）、`check-doc-imports`（README 与文档正文里的导入名必须在公开面里）、`check-published-refs`（包内文本不许指向仓外文档目录）。

- f49e42b: Pagination 的省略位面板与 SideNav 的折叠弹出面板现由 Headless 按视觉 Presence 管理真实退出资源。
  逻辑关闭立即令内容 `inert` 并退出可访问树，Layer、DismissableLayer 与 SideNav 可选 FocusScope
  在对应退出完成前保持；SideNav 按分支身份登记 Presence，换枝时两份资源并存，旧层退出就绪后等待
  重新成为栈顶再安全释放，旧完成信号不会误拆新会话。
- f155ad3: **分格输入受控接法下敲一下就跳一格，不再要按两下。** `value` + `onValueChange` 回写的接法里（文档站「一次性验证码」示例，Vue 的 `v-model:value` 同样），敲第一个数字后焦点停在原格不走，再敲一下才跳格，且第二下会把第一格盖掉——用户看到的是首格填了第二个数字、光标才到第二格。

  根因在连接层写完值之后回读 context 裁落点：受控时 context 里的值直读宿主的 prop，宿主把值写回要等它自己重渲（Vue 的 nextTick、React 的提交），事件处理器里回读到的仍是写之前那份，第一个空格还是刚填过的这一格，落点于是停在原地。Web Components 的 property 写回是同步的，不受影响。

  现在落点在机器里随值一起裁定：`VALUE.FILL` 与 `VALUE.CLEAR_AT` 只按刚写下的值把 `focusedIndex` 挪到该去的格子（铺完落到下一格、`blurOnComplete` 且填满时撤到 -1、清格停在被清的那一格），连接层只照锚点搬焦点，不再按值裁一次；`INPUT.FOCUS` 发现锚点已在这一格上就不再裁，避免焦点事件到达时按旧值把焦点拽回去。方向键的落点同样先交机器裁定。

  `PinInputApi` 没有增删条目。三端各补一条真实键盘的 Chromium 用例：受控与非受控、numeric / alphanumeric、otp 与非 otp、数字小键盘、粘贴整串与退格逐键断言焦点、各格的值与回调发数。

- ed257c8: 让 Vue 与 Web Components 的 Popconfirm 将真实 Presence 句柄交给共享 Popover 状态机。

  逻辑关闭后内容立即失活，但 Layer、消解层与焦点域会继续保留到有限退场动画实际完成；
  退场中重开复用同一组行为资源，卸载仍立即完整释放。

- 80c03ee: Popover 的 `modal` 现在由无头状态机统一兑现完整模态约束：锁住页面滚动、让背景失活，并保留后开的嵌套 Portal 层。

  展开期间可动态切换模态策略；关闭内容立即退出焦点与交互树，滚动锁、背景失活和层登记会保留到实际 CSS 退场完成。退场中重开与组件卸载不会遗留资源。

- ff84284: Separator 的 decorative 模式现在同时输出 `role="none"` 与 `aria-hidden="true"`，确保带可见文案的纯装饰分隔整段退出无障碍树；语义分隔继续使用 `role="separator"`，垂直时才显式输出 `aria-orientation="vertical"`。

  默认线色改用会随浅深主题、对比度与透明度策略变化的 frosted material separator，subtle 档使用 soft material separator，strong 档保留高对比边界。根线与文字两侧端线增加统一的胶囊端点，让 1px 横竖线在实体和玻璃表面都保持细腻边缘。

- 75ec9fb: 按压音效的声明归一、禁用标记判断与首手势解锁接线迁入框架无关的 sound 包；Vue、React 不再各自维护三份相同规则。
- 995d675: `@xihan-ui/sound` 新增框架无关的共享播放器、业务语义声音与 Toast/Dialog 服务装饰控制器。控制器通过最小结构化服务端口和解锁接线回调工作，不反向依赖 Headless 或 UI 框架。

  Vue 与 React 的 `withToastSound`、`withDialogSound`、`getSoundPlayer`、`setSoundPlayer` 公开 API 保持不变，内部改为复用声音包控制器；各自的 directive/hook、DOM 点击与首次手势监听仍由适配器持有。

- 5ae85a9: Table 的排序把手改为列头里独立的定尺图标钮，不再撑满整个列头、也不再包着列名：列名装进 `column-header` 里新增的 `column-label` 部件，`sort-trigger` 写在列名之后，被推到列头行尾侧与列宽把手并排（两颗并排时只有排序钮吃 `auto` 外边距，列宽把手紧贴其后）；点列头文字不再排序，点钮才排序。

  Headless 新增 `column-label` 部件（anatomy 登记、`getColumnLabelProps()` 只投部件属性、无状态）：列名装进它而不是裸写在 `column-header` 里。列头是 flex 行，裸文本是匿名 flex item、min-inline-size 为 auto 缩不下去，窄列配长列名时定尺的把手（排序 / 列宽 / 列拖拽）连同 auto 外边距一起被挤出列头盒、被 overflow: hidden 裁掉，排序只剩 Tab 可达；皮肤给不了匿名项 min-inline-size: 0 / text-overflow，只有真实节点接得住。同时新增 `TableTranslations.sort(columnLabel)`（默认 `Sort by <列名>`），写成排序钮的 `aria-label`——钮里只剩一枚箭头，名字得自己说清是给哪一列排序的。`role=button`、Tab 位、Enter / Space、按住 Shift 追加排序链、`aria-disabled`、`data-sort` / `data-sort-index` 都不变；`data-xh-action-profile` 由 `row` 改为 `icon`，与展开箭头同款。

  皮肤侧的破坏性变化：排序钮接进五颗把手共用的 16px 方盒（`--xh-table-trigger-size`，comfortable 16 / compact 14），静息透明、悬停 / 按下按表头淡底阶梯换面（200 → 300）并 0.97 缩放；方向箭头从 `::after` 改画在 `:empty::before` 上（作者塞进钮里的图标整个顶掉兜底），尺寸经钮自己改接的 `--xh-icon-size`（公开槽 `--xh-table-sort-size`，缺省与方盒同边长）量；多列排序的序号角标改画在 `::after`，压在钮的行尾上角（rtl 自动换边）；`--xh-table-sort-gap` 槽随撑满列头那套写法一起退役。**列名应放进 `column-label`**（`[data-scope='table'][data-part='column-label']`：`flex: 1`、`min-inline-size: 0`、省略号，列头里唯一可收窄的一格），排序钮、列宽把手与列拖拽把手写在它旁边作为兄弟；不可排序、不可改宽的列也用它。粗指针下多列排序的序号角标补了 `inset-inline-start: auto`，不再被家族热区的行首起点过约束成方盒的一半（两位数序号此前会被截断）。作者自己给 `sort-trigger::after` 写过覆盖、或依赖把列名塞进 `XhTableSortTrigger` / `<span data-xh-part="sort-trigger">` 的标记要按新写法改：列名装进 `XhTableColumnLabel` / `<span data-xh-part="column-label">`、把手在后。

  三端各新增列名部件：Vue `XhTableColumnLabel`、React `XhTableColumnLabel`、Web Components `data-xh-part="column-label"`（CEM 已登记）；文档站全部表格示例与 03-data-page 的列头改为列名装进部件、把手在旁。

- a9f9c2e: TagGroup 现在把标签本体的选择与摘除钮的删除严格分成两个点击边界。摘除钮会先停止 click 向标签行冒泡，再执行 Tag 的删除逻辑；single/multiple 模式下删除已选项只发一次移除后的 `value-change` 与一次 `item-delete`，不会把待删值重新选回。
- 148f500: TextField textarea 的 `autoSize` 现在完整跟随运行期值与配置：程序化写值、`minRows` / `maxRows`
  变化都会重新测量，切为 `false`、改回 input、节点换代或组件卸载时会归还 helper 首次启用前的
  `block-size` 与 `overflow-y` 内联声明，包括各自的 `!important` priority。作者原本没有声明的项
  才会被移除，不再把作者样式一并清空。

  测量与样式读取严格使用 textarea 所属 Document 的 Window，三端适配器共用同一 helper。
  `minRows` 与 `maxRows` 作为原生 rows 同义的行数边界，给值时必须是大于等于 1 的有限整数，
  且 `minRows` 不得大于 `maxRows`；无效配置现在明确抛错并撤销旧量高结果，不再静默沿用旧配置。
  这项约束收紧了已公开的 `TextFieldAutoSize` 数值语义，因此 Headless 按 major 记录。

- 9ec6c65: TextField textarea 的 `autoSize` 现在用所属 Document 内短暂挂载的 textarea 镜像测量内容与单行高度。
  `line-height: normal` 不再退回 `font-size * 1.2` 或固定 `20px`；`minRows` / `maxRows` 会按浏览器
  实际行盒换算。

  量高同时区分 `content-box` 与 `border-box`：内容的 padding-box、块轴内距和边框先换到同一种
  声明尺寸口径再夹取，避免 content-box 重复计入内距、遗漏边框或在 maxRows 处错误开启滚动。
  现有 helper 管理的是纵向滚动，因此当前只接受 `writing-mode: horizontal-tb`；其他书写模式会明确失败
  并归还 autoSize 接管前的内联声明，不再产生轴向错误的高度。

  对已公开量高函数的书写模式约束改为显式拒绝，因此 Headless 按 major 记录。
  Vue 输入部件也改在挂载或更新完成后量高，不会再从尚未接入 Document 的模板 ref 回调读取排版。

- beab157: 修正 Toast 与 HeroUI 原实现的差异：全局服务改为测量真实高度的 Sonner 式堆叠，最新一条置前，后层按 12px 偏移和 0.05 比例收拢，鼠标或焦点进入后展开并暂停整组计时。

  进场从对应视口边缘落入折叠层级，退场沿相同方向移出；堆叠位移、缩放、高度和透明度使用独立过渡。

  Toast 独立皮肤增加真实堆叠、六个落位与三类进退场规则，压缩后体积由 11,650 字节调整为 14,487 字节。

  宽度覆盖槽由 `--xh-toast-w` 更名为 `--xh-toast-inline-size`，默认宽度对齐为 460px。

- e164db0: TreeSelect 的单选、多选、叶子与分支统一使用末端对号表示选中，级联半选显示横线。
  选中正文不再变色或加粗，中性底仅表示悬停和键盘高亮；展开箭头与选择标记独立排布。

  补齐 Vue / React 自动分支结构的 `item-indicator`，Web Components 同一部件按最近叶子或分支接线。
  同步现有三端示例，级联示例使用正式标记部件，移除另外自绘的方框和重复状态判断。
  自定义分支结构应显式加入 `item-indicator`，未提供时不猜测或自动插入作者节点。

  皮肤体积（去注释、压空白）：前一提交源码 21941 字节，当前 21942 字节；登记基线 21941 → 21942，只更新本组件，10% 容差保持不变。

- 6ba818f: **修 `message-feed` 与 `menubar` 的离场焦点上报从来不发。**

  持有焦点的条目被移出 DOM 时浏览器不派 `focusout`，焦点无声地掉到 body 上，而机器那一侧仍记着一个已经不存在的锚点。`message-feed` 的容器按「`focusedId == null` 才兜底进 Tab 序列」判自己的 tabindex，于是那个 Tab 位没人认领，**整份消息流键盘再进不来**；`menubar` 的触发器同理。

  同仓的 `tree` / `table` / `transfer` / `select` 早就有这条上报，这两个是漏的。现在照它们的形状补齐：`watch` 到身份变更时若本节点正持有焦点就重报锚点，`onBeforeUnmount` 时若本节点正持有焦点就发离场事件。

  这是铺 React 适配器时对照出来的——React 侧补上之后回头看 Vue，才发现这两个一直缺。

- 0c85ebe: 标记 Dialog、Menu、Select 与 Toast 族的 `defineComponent` 声明为无副作用，使生产构建按需导入 Root 时删除未使用的兄弟部件定义；全部公开导出与运行时行为保持不变。
- 85db5c3: 删除普通类型 Vue prop 中与框架缺省行为等价的 `default: undefined`，保留 Boolean
  三态转换所需的显式 undefined。组件 prop 值、公开类型与运行时行为不变，减少完整适配器
  和按需组件产物中的重复选项字段。
- 402e4d5: **命令式服务在组件 `onMounted` 里懒建后，第一条命令不再撞上 SEND_BEFORE_MOUNT。** 冷启动直接打开在 `onMounted` 里报错的页面（OAuth 回调失败页）时，`toast.danger()` 抛 `[xh:machine:SEND_BEFORE_MOUNT] (notification)`；先在别处弹过一次再进该页反而正常。

  宿主的 mounted 回调排在 Vue 的 post-flush 队列里，从业务组件的 `onMounted` 里 `app.mount` 宿主时会被追加到那条队列的队尾，要等调用方的 `onMounted` 返回后才跑；而服务端口在 setup 已接上，中间发出的命令机器还没 start。`useMachine` 新增第四个参数 `{ start: 'setup' }`，只给没有 DOM 锚点的机器：toast 与 notification 服务宿主的队列机器在 setup 里当场 start。组件照旧缺省等 mounted。

- 1d442bb: 标记 Table 族的 `defineComponent` 声明为无副作用，使生产构建在只导入 `XhTableRoot` 时能删除未使用的兄弟部件定义；组件运行时与公开导出不变。
- Updated dependencies [2c2e470]
- Updated dependencies [8cbcd83]
- Updated dependencies [3c49382]
- Updated dependencies [fa08fb4]
- Updated dependencies [fa08fb4]
- Updated dependencies [e72ed26]
- Updated dependencies [317b582]
- Updated dependencies [262f119]
- Updated dependencies [eb33c91]
- Updated dependencies [8f810d8]
- Updated dependencies [dc0d5ea]
- Updated dependencies [121caf3]
- Updated dependencies [e65c6a5]
- Updated dependencies [b2e1edf]
- Updated dependencies [fa08fb4]
- Updated dependencies [c9cf5c8]
- Updated dependencies [c5d69ee]
- Updated dependencies [bdf4028]
- Updated dependencies [6444083]
- Updated dependencies [0e7de3f]
- Updated dependencies [09f8388]
- Updated dependencies [08850a2]
- Updated dependencies [f408efb]
- Updated dependencies [795eaa6]
- Updated dependencies [0dd39b5]
- Updated dependencies [abcb2c1]
- Updated dependencies [80c0cc0]
- Updated dependencies [1fb94ea]
- Updated dependencies [701a791]
- Updated dependencies [785be0a]
- Updated dependencies [3e5079c]
- Updated dependencies [edaa3dc]
- Updated dependencies [cc63f16]
- Updated dependencies [c2ca771]
- Updated dependencies [d013ff2]
- Updated dependencies [a35d0b2]
- Updated dependencies [17e3d21]
- Updated dependencies [92b0a56]
- Updated dependencies [0daae33]
- Updated dependencies [1b713d6]
- Updated dependencies [10c198a]
- Updated dependencies [3490b78]
- Updated dependencies [4b0f2c0]
- Updated dependencies [fa08fb4]
- Updated dependencies [7df7b1a]
- Updated dependencies [c859508]
- Updated dependencies [a880755]
- Updated dependencies [f204269]
- Updated dependencies [dc64383]
- Updated dependencies [1e79021]
- Updated dependencies [99e8787]
- Updated dependencies [270d162]
- Updated dependencies [fa08fb4]
- Updated dependencies [e124792]
- Updated dependencies [74004f7]
- Updated dependencies [33aa758]
- Updated dependencies [6c20a6d]
- Updated dependencies [b908e0e]
- Updated dependencies [740e2e7]
- Updated dependencies [e63a9fd]
- Updated dependencies [8503826]
- Updated dependencies [45e4ab9]
- Updated dependencies [5b8a8fd]
- Updated dependencies [1b63bf3]
- Updated dependencies [216095b]
- Updated dependencies [e2956f1]
- Updated dependencies [66c4abd]
- Updated dependencies [b483c3b]
- Updated dependencies [a2a1be7]
- Updated dependencies [ced9f26]
- Updated dependencies [02de41e]
- Updated dependencies [652936c]
- Updated dependencies [57adc57]
- Updated dependencies [2c5c5ac]
- Updated dependencies [bdbf03c]
- Updated dependencies [49ed6b0]
- Updated dependencies [21bcb16]
- Updated dependencies [921463b]
- Updated dependencies [c7966d3]
- Updated dependencies [9658294]
- Updated dependencies [f070bb8]
- Updated dependencies [249819e]
- Updated dependencies [589d192]
- Updated dependencies [fa08fb4]
- Updated dependencies [441c426]
- Updated dependencies [9a7827b]
- Updated dependencies [fa05663]
- Updated dependencies [9e57b36]
- Updated dependencies [d374f89]
- Updated dependencies [38efe68]
- Updated dependencies [1587d60]
- Updated dependencies [2c2e470]
- Updated dependencies [fc89b39]
- Updated dependencies [c981f41]
- Updated dependencies [ae38d9a]
- Updated dependencies [19570ad]
- Updated dependencies [7e512dc]
- Updated dependencies [09a1a45]
- Updated dependencies [0308154]
- Updated dependencies [ccec02d]
- Updated dependencies [12958c2]
- Updated dependencies [2dd6293]
- Updated dependencies [d822ffd]
- Updated dependencies [3116bd3]
- Updated dependencies [b23b40a]
- Updated dependencies [02713ab]
- Updated dependencies [51f2cbf]
- Updated dependencies [4640530]
- Updated dependencies [31ab5d8]
- Updated dependencies [19570ad]
- Updated dependencies [f0a2e34]
- Updated dependencies [f0a2e34]
- Updated dependencies [19570ad]
- Updated dependencies [009167e]
- Updated dependencies [651befe]
- Updated dependencies [8e35021]
- Updated dependencies [7b187ca]
- Updated dependencies [ce5d75a]
- Updated dependencies [fa08fb4]
- Updated dependencies [4cebbcf]
- Updated dependencies [2cbfb51]
- Updated dependencies [1ff2803]
- Updated dependencies [90564e7]
- Updated dependencies [3480651]
- Updated dependencies [df18553]
- Updated dependencies [5c202e3]
- Updated dependencies [1516b35]
- Updated dependencies [cf2e555]
- Updated dependencies [72ac8eb]
- Updated dependencies [67a4aeb]
- Updated dependencies [d5576cb]
- Updated dependencies [9bf22c1]
- Updated dependencies [147daa4]
- Updated dependencies [ffe0797]
- Updated dependencies [add5b79]
- Updated dependencies [1540cc1]
- Updated dependencies [8b4d452]
- Updated dependencies [d41017b]
- Updated dependencies [36b4098]
- Updated dependencies [2e9ee9d]
- Updated dependencies [fa08fb4]
- Updated dependencies [fee406a]
- Updated dependencies [c60f032]
- Updated dependencies [4fe1897]
- Updated dependencies [affa413]
- Updated dependencies [5982974]
- Updated dependencies [3577e4c]
- Updated dependencies [e59b69d]
- Updated dependencies [294dfa4]
- Updated dependencies [19570ad]
- Updated dependencies [934a51b]
- Updated dependencies [548ef58]
- Updated dependencies [1322aa6]
- Updated dependencies [5226181]
- Updated dependencies [8e6070d]
- Updated dependencies [89b2640]
- Updated dependencies [afcb45b]
- Updated dependencies [8d395ab]
- Updated dependencies [ab984e8]
- Updated dependencies [7640d5c]
- Updated dependencies [8e8d953]
- Updated dependencies [21b006a]
- Updated dependencies [f241bea]
- Updated dependencies [de42a74]
- Updated dependencies [5e2efdd]
- Updated dependencies [c87cc26]
- Updated dependencies [0daae33]
- Updated dependencies [fa08fb4]
- Updated dependencies [ea27877]
- Updated dependencies [714cc99]
- Updated dependencies [c4e10d5]
- Updated dependencies [fa08fb4]
- Updated dependencies [31b54f4]
- Updated dependencies [5f18462]
- Updated dependencies [78ccfcb]
- Updated dependencies [0e5bed0]
- Updated dependencies [66d7ad5]
- Updated dependencies [16f8296]
- Updated dependencies [502ee35]
- Updated dependencies [bd67168]
- Updated dependencies [48d6b88]
- Updated dependencies [f30630d]
- Updated dependencies [fa08fb4]
- Updated dependencies [31ada22]
- Updated dependencies [ab2417c]
- Updated dependencies [2c5c5ac]
- Updated dependencies [9cb1db6]
- Updated dependencies [c6a9c39]
- Updated dependencies [19570ad]
- Updated dependencies [eb1bc18]
- Updated dependencies [0edf9bd]
- Updated dependencies [10dd5f4]
- Updated dependencies [0d35f1a]
- Updated dependencies [6c876c8]
- Updated dependencies [cd74476]
- Updated dependencies [ed347e1]
- Updated dependencies [fa08fb4]
- Updated dependencies [a0ae74b]
- Updated dependencies [4e0aadf]
- Updated dependencies [db52f9b]
- Updated dependencies [8b6b118]
- Updated dependencies [fa08fb4]
- Updated dependencies [592ab23]
- Updated dependencies [0daae33]
- Updated dependencies [0781fa5]
- Updated dependencies [1587d60]
- Updated dependencies [858eac5]
- Updated dependencies [c530797]
- Updated dependencies [1eae644]
- Updated dependencies [1042c06]
- Updated dependencies [f12bee3]
- Updated dependencies [d74e0f2]
- Updated dependencies [82d9e67]
- Updated dependencies [fd6ec65]
- Updated dependencies [ccc453d]
- Updated dependencies [c8790c8]
- Updated dependencies [4abf7a4]
- Updated dependencies [86345b1]
- Updated dependencies [14b9dcd]
- Updated dependencies [fa08fb4]
- Updated dependencies [5d97aab]
- Updated dependencies [3956657]
- Updated dependencies [1774c08]
- Updated dependencies [1f6afdb]
- Updated dependencies [e3abd75]
- Updated dependencies [c13579f]
- Updated dependencies [3f9c145]
- Updated dependencies [bc80c37]
- Updated dependencies [db84441]
- Updated dependencies [4c287eb]
- Updated dependencies [c8790c8]
- Updated dependencies [1f472ba]
- Updated dependencies [d51d182]
- Updated dependencies [1f472ba]
- Updated dependencies [fa08fb4]
- Updated dependencies [4c287eb]
- Updated dependencies [05e809c]
- Updated dependencies [c1ddd60]
- Updated dependencies [6b4c5d0]
- Updated dependencies [674ee88]
- Updated dependencies [f49e42b]
- Updated dependencies [bdbf03c]
- Updated dependencies [19570ad]
- Updated dependencies [c247435]
- Updated dependencies [5bd9ec2]
- Updated dependencies [2c2e470]
- Updated dependencies [680e9a2]
- Updated dependencies [f155ad3]
- Updated dependencies [b81590f]
- Updated dependencies [4b4db79]
- Updated dependencies [8cbf0be]
- Updated dependencies [ed257c8]
- Updated dependencies [36ff669]
- Updated dependencies [80c03ee]
- Updated dependencies [fc0ecaf]
- Updated dependencies [963fe2c]
- Updated dependencies [eabcc37]
- Updated dependencies [07e29f9]
- Updated dependencies [c544218]
- Updated dependencies [b991bb5]
- Updated dependencies [ff3593c]
- Updated dependencies [95ebc66]
- Updated dependencies [4babe65]
- Updated dependencies [6c05da3]
- Updated dependencies [7c5f97f]
- Updated dependencies [cd74476]
- Updated dependencies [dc64383]
- Updated dependencies [80e6fdf]
- Updated dependencies [80bf4c8]
- Updated dependencies [12d3a04]
- Updated dependencies [797a14f]
- Updated dependencies [9c43f67]
- Updated dependencies [655ac38]
- Updated dependencies [2fca91b]
- Updated dependencies [f45e0f7]
- Updated dependencies [2c2e470]
- Updated dependencies [140cf60]
- Updated dependencies [5397ae3]
- Updated dependencies [cd74476]
- Updated dependencies [82b5de5]
- Updated dependencies [842da07]
- Updated dependencies [fa08fb4]
- Updated dependencies [a15f0f3]
- Updated dependencies [e24a3d3]
- Updated dependencies [6ec0c4b]
- Updated dependencies [3ef5a6e]
- Updated dependencies [2962b7d]
- Updated dependencies [8efcd86]
- Updated dependencies [ea9fc5b]
- Updated dependencies [e3abd75]
- Updated dependencies [1f6da9d]
- Updated dependencies [fa08fb4]
- Updated dependencies [ff84284]
- Updated dependencies [7f77bdd]
- Updated dependencies [1ed8f67]
- Updated dependencies [00bca80]
- Updated dependencies [dc64383]
- Updated dependencies [f7cd99b]
- Updated dependencies [690200f]
- Updated dependencies [2fdf721]
- Updated dependencies [30a811b]
- Updated dependencies [3be9407]
- Updated dependencies [297fb1e]
- Updated dependencies [d366e45]
- Updated dependencies [75ec9fb]
- Updated dependencies [995d675]
- Updated dependencies [e6bb853]
- Updated dependencies [f0a2e34]
- Updated dependencies [295d6e0]
- Updated dependencies [f7495fd]
- Updated dependencies [9c32ad7]
- Updated dependencies [498ce78]
- Updated dependencies [42f7f15]
- Updated dependencies [2c5c5ac]
- Updated dependencies [101f8cb]
- Updated dependencies [5ae85a9]
- Updated dependencies [bf75f85]
- Updated dependencies [9a866b2]
- Updated dependencies [a145f51]
- Updated dependencies [ee85e3b]
- Updated dependencies [32142f9]
- Updated dependencies [a316462]
- Updated dependencies [a9f9c2e]
- Updated dependencies [86ce3e7]
- Updated dependencies [3ef5a6e]
- Updated dependencies [61f60de]
- Updated dependencies [fa08fb4]
- Updated dependencies [6922cce]
- Updated dependencies [3ef5a6e]
- Updated dependencies [3ef5a6e]
- Updated dependencies [cb9e315]
- Updated dependencies [148f500]
- Updated dependencies [9ec6c65]
- Updated dependencies [089ef81]
- Updated dependencies [8795555]
- Updated dependencies [8ee8efe]
- Updated dependencies [134dea9]
- Updated dependencies [2ca7fc2]
- Updated dependencies [af55d45]
- Updated dependencies [7cf8734]
- Updated dependencies [0460036]
- Updated dependencies [6b161da]
- Updated dependencies [fb01380]
- Updated dependencies [a16f7f2]
- Updated dependencies [5dfa0f2]
- Updated dependencies [beab157]
- Updated dependencies [0a6b3d2]
- Updated dependencies [9ad1389]
- Updated dependencies [1536143]
- Updated dependencies [252e2d5]
- Updated dependencies [9e47622]
- Updated dependencies [0d7cd38]
- Updated dependencies [d67fd51]
- Updated dependencies [3a3b478]
- Updated dependencies [d642ddd]
- Updated dependencies [00d9c58]
- Updated dependencies [46a5116]
- Updated dependencies [e416596]
- Updated dependencies [54c56f6]
- Updated dependencies [f0a2e34]
- Updated dependencies [8ea0ff8]
- Updated dependencies [db1dc9a]
- Updated dependencies [61773be]
- Updated dependencies [261f03d]
- Updated dependencies [afeb764]
- Updated dependencies [dc64383]
- Updated dependencies [fa08fb4]
- Updated dependencies [3b7a72b]
- Updated dependencies [33c6805]
- Updated dependencies [4f7ac7a]
- Updated dependencies [80f9809]
  - @xihan-ui/headless@2.0.0
  - @xihan-ui/motion@2.0.0
  - @xihan-ui/core@2.0.0
  - @xihan-ui/position@2.0.0
  - @xihan-ui/code-highlight@2.0.0
  - @xihan-ui/backgrounds@2.0.0
  - @xihan-ui/sound@2.0.0
  - @xihan-ui/pointer@2.0.0

## 1.1.0

### Minor Changes

- fe95f03: **新增** `@xihan-ui/pointer` 指针会话：一根指针从按下到抬起的跟手、过滤与收尾收在一处，自研，零依赖，压缩后 316 B。

  七个需要跟手的组件（`slider` · `splitter` · `scrollbar` · `color-picker` · `image-cropper` · `floating-panel` · `signature-pad`）此前各自手写了一遍同样的文档监听循环，四个必须一次都不漏的点（监听挂文档、收 `pointercancel`、认 `pointerId`、拆卸摘干净）分散在七处，改一处不会带上另外六处。现在统一走会话，行为不变。

- 442bdcc: **新增** `resizable` 组件：一块能拖着改尺寸的区域，八条边都能推，键盘也能推。

  `edges` 决定开放哪几条边（默认八向全开），没开放的边不显示把手。`minWidth` / `maxWidth` / `minHeight` / `maxHeight` 夹住范围，`aspectRatio` 锁宽高比，`step` 吸附到整数倍。两个回调分工明确：`onSizeChange` 拖动途中连着发，`onSizeChangeEnd` 收尾才发一次，存尺寸用后者。

  键盘按**屏幕方向**推：推东边时右键变宽、推西边时右键变窄，与拖动完全同义；Home / End 直接推到两端。`edge` 说的是逻辑方向——`e` 是行尾侧，从右往左排版时它落在屏幕左边，机器把逻辑边翻成物理边再算几何。

  **推西边与北边时容器的起点会动**，那段位移写成 root 的 `left` / `top`。皮肤已给 `position: relative`，开箱即对；把 root 改成 `static` 会让这两个方向只变尺寸不移位。只用东 / 南 / 东南三向时没有这个前提。

- 97482ad: **新增** `sortable` 组件：列表 / 网格拖拽排序，Vue 与 Web Components 两侧同时可用。

  落点走乐观投影——拖动过程中其余条目实时让位，松手即定，不是拖完才跳一下。判据是被拖项的中心越过了谁的中心，沿轴扫描一遇到没越过的就停，因此落点连续，不会从第 0 位跳到第 5 位。几何一律取按下那一刻的快照：让位之后布局已经变了，拿变形后的几何再算会自激振荡。

  **键盘路径默认开着且关不掉**：空格拾起、方向键挪一格、空格放下、Esc 取消，每一步都写进视觉隐藏的 `role=status` 区域。手柄带 `aria-roledescription="sortable"` 与 `aria-pressed`；拖动中的 Tab 被拦下，焦点一旦移走这一场就没有出口。

  `orientation` 三档：竖排、横排，以及换行网格用的 `both`（按最近中心判落点）。排版方向由首尾两项的先后推出，从右往左排时自动反向。按下之后要走够 `activationDistance`（默认 5px）才算拖动，因此条目本身仍然可以点击。拖到容器边缘会自动滚动，速度随入侵深度线性上升。

  `sort` 事件直接给出重排好的 `ids`，可以直接写回数据源，Vue 侧支持 `v-model:ids`。

  **新增** `@xihan-ui/pointer` 的拖放几何层：排序投影、让位计算、激活阈值与边缘滚动，全部是纯函数，零 DOM、零状态。

- 69577fa: **新增** `table` 的列拖拽排序：列上标了 `reorderable` 才产出拖拽把手，拖到别的列上换位；
  把手自占一个 Tab 位，方向键挪一格、Home / End 挪到可拖区段的首末。

  **新增** 两个部件 `column-drag-trigger` 与 `live-region`，一个属性名 `data-drop`（落点参照列，
  取值 `before` / `after`），以及 `api.draggableColumns` / `api.dropTarget` / `api.announcement`。

  **新增** `shared/drag.ts` 的沿轴落点判定（两档与三档）、插入下标折算与拖拽播报，
  `table.drag.ts` 的可拖列判定与列偏好下标折算。

  拖动中被拖的列**原地不动**，只落 `data-dragging`，落点由参照列上的一条指示线表示。
  不写位移是因为冻结列是 `position: sticky` 的后代，祖先一有 `transform` 就掉出吸附；
  斑马纹与行间线按 DOM 位置算，跟手让位会让它们在拖动全程与行错开。

  键盘不做拾起 / 放下两态：按一下就是一次已过守卫的完整提交，各自播报一句。
  列头里已经有排序把手与改宽把手两个 Tab 位，再加一套模态按键会让三者互相抢键。

  提交走既有的 `COLUMN_PREF.PATCH`，列序仍然只有一处在改。落点按列 id 认而不是按第几个，
  于是隐藏列自然留在原本的邻居旁边，前缀列压根不进落点快照。

  不可拖的列与冻结列都是**屏障**：可拖范围被它们切成段，只有最长的那一段能拖。
  跨过冻结列去落，落下来那一列会夹在两根钉住的列当中一起悬在滚动之上。

  播报区渲在 `root` **之外**。`root` 是 `role=grid`，它的子节点只能是 `row` 与 `rowgroup`，
  塞一个活动区域进去是 `aria-required-children`（critical）——不带 role 只留 `aria-live` 也一样，
  无角色但带全局 aria 属性的节点照样被算进 owned。两个适配器都自己把它渲成 `root` 的兄弟，
  使用者不必操心位置。

- 0a147ba: **新增** `table` 的列宽拖拽：列上标了 `resizable` 就产出改宽把手，拖动与方向键都能调。

  把手是可聚焦的分隔条，报出当前列宽与上下限；拖出表头仍跟手，系统收走指针时宽度退回按下那一刻。方向键一次 8px、按住 Shift 一次 40px，rtl 下左右两键对调而语义恒是「加宽 / 收窄」。列宽落在列偏好里，可以直接存起来下次还原。

  列宽写成百分比这类算不出 px 的写法时不认可改宽——读屏要一个数值，给不出就不该声称自己是可调控件，键盘本来也动不了它。

  **新增** `@xihan-ui/pointer` 的尺寸调整几何层：八向边推动加约束（上下限 / 宽高比 / 吸附步进 / 容器夹取），纯函数。`floating-panel` 的 `resizeFloatingPanel` 与 `clampFloatingPanelSize` 保留签名、内部改走它，行为不变。

- 889c54d: **新增** `table` 的行拖拽排序：`rowReorderable` 打开后整行都是拖动源，拖到别的行上换位；
  焦点在表体里时 `Alt` + 上下键挪一格。搬完发 `onRowMove`，载荷是 `{ id, parent, index, ids }`——
  搬到 `parent` 那一行底下的第 `index` 位（`parent` 为 `null` 即根层，`index` 已算过「先摘后插」），
  `ids` 是重排好的整份行序。

  **新增** 行上的 `data-row-draggable` 与 `data-drop`（`before` / `after` / `inside`），
  以及 `api.rowReorderDisabledReason`。

  行序**不进机器**：`rows` 是 prop，库没有一份自己的行序可写，所以只发意图、写回归宿主。
  这与列不同——列序有 `columnPreference.order` 这个受控通道。

  按下不等于拖动：整行可拖没有把手表明意图，要走够 5px 才算，在那之前界面上一点变化都没有。
  按在行内的输入框、按钮、链接一类控件上不起拖。

  **树形行照样搬**：`rows` 里有行声明了 `parentId` 就是树，落点分三档——拖到一行的上下两端
  是插在它前后（跟着换到那一层），拖到中段是落进它里面、认它当父。只有可展开或已经有子行的行
  给中段那一档，普通数据行不会因为被拖过就凭空长出一层。键盘上 `Alt` + 左右键改缩进层级：
  往里认上一个兄弟当爹，往外变成父行的下一个兄弟，rtl 下两键对调；平表下这两个键不归表格管。
  落进自己的后代会拖出一个环，库自己拦下，指示线也不画。新增 `allowRowDrop` 收业务侧的规矩。

  写回是**两件事**：按 `ids` 重排、再把那一行的 `parentId` 设成 `parent`。只做一件都对不上——
  表格的树是一份带 `parentId` 的扁平数组，结构由 `parentId` 定、同层次序由数组先后定。

  **两条降级**，各自有原因可读：排序链非空（拖出来的新序下一帧就被排序键覆盖）、
  宿主只渲了一段（量到的行数与数据行数对不上，窗口外的行没有矩形）。
  前一条渲染期就知道，后一条按下量过才知道。

  展开着的行按**整块**算：数据行连同紧跟它的详情行是一个落点。不并块的话，
  拖过一个展开着的行时指针明明还在这一块里，落点却因为跨进详情行那一段而反复跳。

  拖动中被拖的行**原地不动**：斑马纹按 `nth-of-type` 算、行间线按兄弟选择器算，
  两者认的都是 DOM 位置，跟手让位会让它们在拖动全程与行错开。

  **触屏不开拖**。纵向手势在按下那一刻就归了浏览器滚动，`touch-action` 事后改不回来；
  而把行设成 `touch-action: none` 又会让长表在行上完全滚不动。触屏那一路要等一个专门的
  拖动把手（不占 Tab 位，自带 `touch-action: none`），单独排。

  **修复** `table` 的键盘处理器不再吞掉落在可编辑单元格里的按键。表体的处理器挂在 `body` 上，
  单元格里输入框冒上来的按键也经过它：焦点先落过行再进输入框时，打空格会被当成
  「切换这一行的选中」、`Ctrl+A` 会全选行、方向键会换行。现在输入法组合中的按键与
  落在可编辑控件上的按键一律放行。

- 161ee77: **新增** `tabs` 的标签拖拽换位：`reorderable` 打开后整个标签都是拖动源，拖到别的标签上换位；
  焦点在标签带里时 `Alt` + **主轴**方向键挪一位。搬完发 `onTabMove`，载荷是
  `{ value, from, to, values }`，`values` 是重排好的整份标签序，可直接写回数据源。

  **新增** `live-region` 部件、标签上的 `data-dragging` / `data-drop` / `data-draggable`、
  `translations` prop，以及 `api.dropTarget` / `api.announcement`。

  轴向跟随 `orientation`：横排量横轴、竖排量纵轴，键盘也只认主轴那两个键——
  另一轴的方向键照常放行给页面滚动与读屏。横排 rtl 下左右对调。

  禁用的标签**仍进落点快照**。它自己挪不动，但别人可以落在它前后；把它摘掉的话，
  指针划过它那一段会没有落点，指示线一闪一闪。

  顺序不进机器：`collection` 是 prop，库没有一份自己的标签序可写，只发意图、写回归宿主。

  **重构** 一维重排的三件算术提到 `shared/drag`：`reorderFlat`、`flatMoveCommand`、
  `flatMoveIntentFromKey`（后者收轴向与文字方向两个参数）。`table` 的行拖拽改指共享实现，
  `moveRowIds` / `rowMoveCommand` / `rowMoveIntentFromKey` 三个行专用名字随之删除——
  它们与本批同属一个未发布的系列，现在合并是免费的。三个组件从此共用同一份重排语义，
  往后要改「先摘后插」这类算术只有一处。

- c0a190f: **新增** 三个拖动把手：`table` 的 `row-drag-trigger`、`tree` 的 `node-drag-trigger`、
  `tabs` 的 `tab-drag-trigger`。它们是**触屏那一路的入口**。

  三处的「整块起手」此前都不认触屏：纵向手势在按下那一刻就归了浏览器滚动，
  `touch-action` 事后改不回来；而把整行 / 整个节点设成 `touch-action: none`
  又会让长列表在上面完全滚不动。把手是一小块专门让出去的地方，自带 `touch-action: none`，
  手势从按下那一刻就是拖动的——同仓的 `column-resize-trigger` 早就是这个机制。

  把手**不占 Tab 位**（`aria-hidden` + `tabindex=-1`）：键盘那一路早就由容器上的
  `Alt` + 方向键承担，把手只是指针侧的第二个入口。整块起手（鼠标与笔）原样保留。

  按下即拖，不等激活距离——把手是专门的入口，意图无歧义。三处的 `*_DRAG.START` 事件
  因此多一个 `activate` 旗标，整块起手仍走激活距离那条路。

  把手常挂即可：开关关着或这一项拖不动时它自报 `data-disabled`、也不再让出滚动。
  按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。

  **修复** `tabs` 的 Web Components 侧：把手此前只收 `value`，漏了「没给 `collection`、
  禁用写在标记上」那条来路，于是标签禁着而把手仍判可拖。现在与 `trigger` 走同一条判定。

  抓手字形按「线的走向与能拖的方向垂直」转了向：列是横排所以画竖线，行与树节点是纵排
  所以画横线，`tabs` 跟着 `orientation` 两种都给。

- e14c407: **新增** `tree` 的节点拖拽搬家：`draggable` 打开后整个节点都是拖动源，拖到别的节点上换位或换父。
  焦点在树里时 `Alt` + 上下键在同层兄弟间挪，`Alt` + 左右键改缩进层级。
  搬完发 `onNodeMove`，载荷是 `{ value, parent, index }`——搬到哪个父下面的第几位，父为 `null` 即根层。

  **新增** `allowDrop` 与 `translations` 两个 prop、`live-region` 部件、
  节点上的 `data-dragging` / `data-drop` / `data-draggable`，以及 `api.dropTarget` / `api.announcement`。
  （`TreeTranslations` 以前只有类型没有对应的 prop，空接口所以一直没人发现，这次一并补上。）

  **落点三档**：`before` / `after` 插在同层，`inside` 落进这个分支。叶子上只有前后两档。
  「放进这个文件夹」和「插在这两行之间」是两件事，皮肤上必须一眼分得开。

  **分支量的是 `branch-control` 不是 `branch`**。后者是「这一行 + 整棵子层」的外壳，
  展开着的时候它的矩形把整棵子树都吞进去，落点会永远命中最外层那个分支，一辈子落不到子节点上。

  **自我后代判据用 `indexPath` 前缀，不沿 `parent` 上溯**。作者写出自引用的数据是被支持的
  （`collectNodes` 有祖先链防护），沿 `parent` 走会死循环；而同一个 value 挂在两个父下时
  `parent` 只留先出现的那一支，判出来的祖先也是错的。前缀比较 O(深度) 且天然无环。

  树的**状态树一行未改**：跟手的会话挂在根级效应上常驻，8 个既有事件原地不动。

  **修复** `@xihan-ui/pointer` 的 `createMultiPointerSession`：`onEnd` 现在带 `reason`
  （`pointerup` / `pointercancel`）。此前两者走同一条路、调用方分不开，于是**系统收走指针会被当成落定提交**。
  `carousel` 与 `image-viewer` 不受影响（它们本就把两者同等对待）。

  **修复** `tree` 的键盘处理器不再吞掉落在可编辑节点内容里的按键。处理器挂在 `tree` 部件上，
  节点里输入框冒上来的按键也经过它：打空格会被当成「选中这一项」，打字会被连打检索吃掉。
  `isEditableTarget` 从 `table` 提到 `shared/`——这是它的第二个消费者。

  **触屏不开拖**（与 table 行拖拽同因）。

  **改写** `tree/10-drag-move` 示例。它此前整个用 HTML5 `draggable` + `dataTransfer` 手写，
  只支持「拖进文件夹」、没有前后排序、落点提示是内联 style——正是 AntD 审计点名的那份样板。
  现在落点判定、三档落点、指示线、自我后代守卫全归库，宿主只留按 `{ value, parent, index }`
  搬数组这一段。

### Patch Changes

- ba81107: **修复** 拖动中版面滚走之后落点全错。落点矩形是按下那一刻量的，而拖动中页面、祖先或
  容器自己都可能滚动，快照不跟着动，指示线就指着另一项。参照取**拖动源自己**而不是容器：
  容器自己内部滚动时它的矩形一动不动，量不出来；而拖动中被拖的项原地不动（只画指示线、
  不做跟手让位），它挪了多远，所有人就挪了多远。

  命中与激活分在两个坐标系里判：命中要减掉版面漂移换算回快照坐标，激活看的是「手指动没动」，
  用原始视口坐标——内容滚过去了但手没动，不算拖了一段。

  **修复** `table` 的 `Alt` + 方向键在没打开 `rowReorderable` 时也吞键。另外三处（列、树、
  标签）都是「开关关着就放行给页面」，只有它不一样。降级（排序中、树形行、只渲了一段）时
  照样挡住——键是认下了的，只是这张表此刻搬不动。

  **修复** 八个 Vue 组件收不到全局配置里的读屏文案：`combobox` / `popselect` / `resizable` /
  `sortable` / `table` / `tabs` / `text-field` / `tree`。跑机器的组件经 `useMachine` 只并了
  `locale` 与 `size`（`fillXhConfigDefaults` 只认这两个键），而 `translations` 按组件名分桶、
  只有 `withXhConfig` 认得出自己是谁。`table` 连实例上的 `translations` prop 都没有，一并补上。

  `check-config-wiring` 把「跑了机器」当作 translations 已接线，是这八个一起漏网的原因。
  判据拆开：`size` 认 `useMachine` 或 `withXhConfig`，`translations` 只认 `withXhConfig`。

- fad7a5a: **修复** `createMultiPointerSession` 只能用一次：最后一根指针抬起就把会话整个闩死，
  `add()` 从此空转。会话是根级效应建的、整个生命周期只建一次，于是 `tabs` / `tree` /
  `carousel` 三处的拖动**第二次彻底起不来**。「本场收尾」与「会话作废」现在是两件事。

  **修复** `XhTableRoot` 丢掉作者写在它上面的 `class` / `aria-*` / 监听器。它渲的是
  Fragment（表格本体 + 播报区），而 Vue 只在单个元素根上自动透传 attrs——改成 Fragment
  那一批把这条通道弄断了，示例里已经有两处在用（分组表头传 `aria-rowcount`、
  虚拟滚动示例传 `@scroll`）。

  **修复** RTL 下指针与键盘互相矛盾：键盘三处早就跟着文字方向翻，指针这一路漏了。
  RTL 横排的 DOM 首项在最右，它的几何左半是逻辑末侧，而 `hitAlong` 一律按几何判。
  现在它收 `rtl`，横轴两处（列、横排标签）接上；行与树是纵轴，与文字方向无关。

  **修复** 禁用的项仍是拖动源，六处：`tabs` 的整块起手 / `data-draggable` / `Alt` 方向键、
  `tree` 的 `Alt` 方向键、`table` 行的整块起手 / `data-row-draggable` / `Alt` 方向键。
  判据统一成「这一项自己禁用了就不是拖动源」。

  **修复** `tabs` 的拖动轴钉死在挂载那一刻：跟手的会话由根级效应建、只在 INIT 挂一次，
  轴却在效应顶部就求了值。运行期把 `orientation` 从横排改成竖排之后，落点仍按横轴算。

  **修复** `tree` 把「本来就是这个父的末位孩子」也当成一次搬家：落进父节点里算下来还是原位，
  却仍报出一次空的 `onNodeMove`。与同文件 before / after 那一支同一条约定。

  **改动** `tree` 对禁用节点的落点判定收窄成只拦 `inside`。往一个禁用的分支里塞东西说不通，
  但在它前后插只是绕着它排序——`table` 与 `tabs` 那边本来就是这个口径，三处现在一致。

- Updated dependencies [1b03cdb]
- Updated dependencies [ba81107]
- Updated dependencies [be46eab]
- Updated dependencies [fad7a5a]
- Updated dependencies [3d41890]
- Updated dependencies [df08c58]
- Updated dependencies [fe95f03]
- Updated dependencies [442bdcc]
- Updated dependencies [5b62d15]
- Updated dependencies [97482ad]
- Updated dependencies [69577fa]
- Updated dependencies [0a147ba]
- Updated dependencies [889c54d]
- Updated dependencies [161ee77]
- Updated dependencies [03fb633]
- Updated dependencies [c0a190f]
- Updated dependencies [9ae6c64]
- Updated dependencies [e14c407]
  - @xihan-ui/headless@1.1.0
  - @xihan-ui/pointer@1.1.0
  - @xihan-ui/behavior@1.1.0
  - @xihan-ui/kernel@1.1.0
  - @xihan-ui/machine@1.1.0
  - @xihan-ui/motion@1.1.0
  - @xihan-ui/code-highlight@1.1.0
  - @xihan-ui/position@1.1.0

## 1.0.0

### Major Changes

- bc7eeed: 徽标收窄成「只做角标」，并补齐角标该有的能力。

  原先 badge 与 tag 是一对孪生：`variant` 三形态、`size` 三档、默认插槽放任意内容，
  连档位取值都逐个相同。两个组件做同一件事，使用者只能靠猜。

  现在 badge 只做一件事——挂在别的元素角上的一枚标记：

  ```vue
  <XhBadge :count="5" tone="danger" label="5 条未读">
    <XhButton>收件箱</XhButton>
  </XhBadge>
  ```

  - 解剖从单层 `root` 变成 `root`（锚点）+ `indicator`（角标），定位归组件自己管，
    不再要宿主手写 `position: relative` 与负偏移。
  - 新增 `placement`：`top-end`（默认）/ `top-start` / `bottom-end` / `bottom-start`，
    用逻辑属性写，rtl 下自动落到另一侧。
  - `size` 换的是圆点直径、两位数时的最小宽度与字号，不再是药丸那套内衬与行高。
  - Vue 侧另出 `XhBadgeRoot` / `XhBadgeIndicator`，要往角标里塞自定义内容时用它们。

  **破坏性**：删掉 `variant`；行内的状态药丸请改用 `tag`（`XhTagRoot` + `XhTagLabel`）。
  `data-size` 与 `data-tone` 从 `root` 挪到 `indicator`。

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

- 84b1aa3: 新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

  旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
  npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
  描边、`stroke-width` 2。

  用法：

  - `@xihan-ui/kernel` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
  - `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
  - `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/web-components` 注册 `<xh-icon>`
  - `@xihan-ui/styles` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

  图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
  解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
  整个失效。

  WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
  作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
  `<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

  可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
  输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
  读屏会念两遍。

- d43624c: 把跨组件已经分叉的名字统一回一套。part 名与 prop 名在 1.0 之后就是公开 API——皮肤按
  `data-part` 选择、使用者按 prop 名调用——改名一律是破坏性变更，所以趁 alpha 一次改完。

  **time-picker 的列表条目由 `option` 改叫 `item`。** 另外 32 个组件的列表条目都叫 `item`，
  只有它是 `option`。ARIA 角色仍是 `role="option"`（那是角色不是部件名），列里的候选值集合
  `TimePickerColumn.options` 也不动（那是数据不是部件）。

  迁移点：

  - `data-part='option'` 改成 `data-part='item'`；皮肤覆盖槽 `--xh-time-picker-option-*`
    改成 `--xh-time-picker-item-*`（共 10 个）。
  - Vue 组件 `XhTimePickerOption` 改名 `XhTimePickerItem`。
  - WC 的 `::part(option)` 改成 `::part(item)`。
  - headless 导出：`timePickerOptionQuery` → `timePickerItemQuery`、`findTimePickerOption` →
    `findTimePickerItem`、`timePickerOptionValue` → `timePickerItemValue`、
    `TimePickerOptionProps` → `TimePickerItemProps`。
  - `TimePickerApi` 上：`getOptionProps` → `getItemProps`、`isOptionSelected` → `isItemSelected`、
    `isOptionDisabled` → `isItemDisabled`、`focusedOption` → `focusedItem`。
  - 键盘规格号 `time-picker.kbd.option-*` → `time-picker.kbd.item-*`。

  **transfer 的数据入口由 `items` 改叫 `collection`。** 另外 17 个集合组件的数据入口都叫
  `collection`。单条的类型名 `TransferItem`、某一侧看得见的条目 `visibleItems`、纯函数
  `transferVisibleItems` 都不动——它们说的是「条目」，不是「数据入口」。

  迁移点：

  - Vue：`<XhTransferRoot :items="…">` 改成 `:collection="…"`。
  - WC：`el.items = […]` 改成 `el.collection = […]`（这个入口表达不成属性，本来就只能走 property）。
  - `TransferApi.items` → `TransferApi.collection`。

  **checkbox-group 的组内子部件对齐 radio-group。** 同一语义两套名字：checkbox-group 用
  `item-control` / `item-hidden-input`，radio-group 用 `indicator` / `hidden-input`。裸名是全仓
  多数（`indicator` 13 处、`hidden-input` 10 处），checkbox-group 随大流。`item-text` 不动
  （21 份解剖都这么叫）。

  迁移点：

  - `data-part='item-control'` → `'indicator'`，`data-part='item-hidden-input'` → `'hidden-input'`。
  - 皮肤覆盖槽 `--xh-checkbox-group-control-*` → `--xh-checkbox-group-indicator-*`（10 个），
    与 radio-group 的 `--xh-radio-group-indicator-*` 对齐。
  - `CheckboxGroupApi.getItemControlProps` → `getIndicatorProps`，
    `getItemHiddenInputProps` → `getHiddenInputProps`（两个名字 radio-group 早就在用）。
  - Vue 组件 `XhCheckboxGroupItemControl` → `XhCheckboxGroupIndicator`。

  **table 的空态部件由 `empty-state` 改叫 `empty`。** 部件名不该与组件的 scope 名撞车——
  `empty-state` 是一个独立组件的 `data-scope`，再拿它当 table 的部件名，写皮肤时
  `[data-part='empty-state']` 与 `[data-scope='empty-state']` 混在一起读不出谁是谁。
  combobox 早就叫 `empty`。独立的 `empty-state` 组件本身不动。

  迁移点：

  - `data-part='empty-state'` → `'empty'`。
  - `TableApi.getEmptyStateProps` → `getEmptyProps`。
  - Vue 组件 `XhTableEmptyState` → `XhTableEmpty`（`XhEmptyState*` 那一族是另一个组件，不变）。
  - WC 的 `::part(empty-state)` → `::part(empty)`。

  **transfer 的 `onSelectedChange` 改叫 `onSelectionChange`。** table 与 tree 都叫
  `onSelectionChange`。

  - `TransferSelectedChangeDetails` → `TransferSelectionChangeDetails`。
  - Vue 事件 `@selected-change` → `@selection-change`；WC 的 `selected-change` 事件同改。

  **`size` 不再一名两用。** 三轴里的 `size` 是语气枚举，而 qr-code 的 `size` 是像素数值、
  splitter 的 `size` 是百分比数组——两者占着同一个名字却是完全不同的类型，使用者写
  `size="md"` 得到的是静默的错。

  - qr-code：`size` → `pixelSize`（WC 属性 `size` → `pixel-size`）。中心 logo 挖空区的
    `QrCodeLogoArea.size` 是模块数标量，不动。
  - splitter：数组值的一律改复数——`size` → `sizes`、`defaultSize` → `defaultSizes`、
    `onSizeChange` → `onSizesChange`、`onSizeChangeEnd` → `onSizesChangeEnd`、载荷字段
    `{ size }` → `{ sizes }`、机器事件 `SIZE.SET` → `SIZES.SET`、Vue 的 `v-model:size` →
    `v-model:sizes`、WC 属性 `size` → `sizes`。标量的不动：每块面板的 `collapsedSize`、
    `BOUNDARY.SET` 的 `size`、`setPanelSize`、`SplitterPanelState.size`。

  **「移除列表里的一项」统一叫 `item-delete-trigger`。** 同一个动作四个组件三个名字：tags-input
  与 file-upload 已经是 `item-delete-trigger`，select 叫 `tag-remove`、dynamic-input 叫
  `remove-trigger`。tag 的 `close-trigger` 不动——它关的是标签自身，不是列表里的一项。

  迁移点：

  - select：`data-part='tag-remove'` → `'item-delete-trigger'`；皮肤覆盖槽
    `--xh-select-tag-remove-*` → `--xh-select-item-delete-*`（6 个）；
    `SelectApi.getTagRemoveProps` → `getItemDeleteTriggerProps`；Vue 组件 `XhSelectTagRemove` →
    `XhSelectItemDeleteTrigger`；WC 的 `::part(tag-remove)` → `::part(item-delete-trigger)`。
  - dynamic-input：`data-part='remove-trigger'` → `'item-delete-trigger'`；皮肤覆盖槽
    `--xh-dynamic-input-remove-fg-hover` → `--xh-dynamic-input-item-delete-fg-hover`；
    `DynamicInputApi.getRemoveTriggerProps` → `getItemDeleteTriggerProps`；Vue 组件
    `XhDynamicInputRemoveTrigger` → `XhDynamicInputItemDeleteTrigger`；WC 的
    `::part(remove-trigger)` → `::part(item-delete-trigger)`。

  **这枚按钮的文案键统一叫 `deleteItem`。** 四个组件的签名各不相同，统一的是命名形态。

  - select：`SelectTranslations.removeTag: string` → `deleteItem: (label: string) => string`，
    由定值串改成接收标签文本的函数，缺省 `Delete ${label}`。
  - tags-input：`deleteTagTrigger` → `deleteItem`。
  - file-upload：`deleteFile` → `deleteItem`；`FileUploadApi.deleteFile` 方法与 `FILE.DELETE`
    事件名不动——那是动作不是文案。
  - dynamic-input：`removeTrigger` → `deleteItem`。

  **没有合并的一处，记在这里免得后人重新翻案。** 就绪度审计说 pin-input 的 `onValueComplete`、
  editable 的 `onValueCommit`、slider 的 `onValueChangeEnd` 是「三个名字表达同一语义」，
  逐条读过源码后判定不成立：`onValueComplete` 是「每格都填满的那一刻」（值的形状谓词），
  `onValueCommit` 是「提交那一刻」（用户显式确认），`onValueChangeEnd` 是「一次操作结束」
  （手势结束，splitter 的 `onSizesChangeEnd` 用的是同一套）。三件不同的事，合并会让 API 更差。

- 516bd46: 浮层搬进单一落点，层号与背景失活跟着改口。

  ## 浮层不再原地渲染

  此前 20 个带 positioner 的浮层里只有 dialog / drawer / image-viewer 搬走，其余 16 个
  留在触发器旁边。坐标一直是对的（定位引擎特意处理了「祖先抢走包含块」），坏的是层叠序：
  宿主应用的祖先只要建了层叠上下文——`transform` / `translate` / `scale` / `filter` /
  `backdrop-filter` / `opacity` 小于 1 / `contain` / `will-change` / `position: sticky` /
  定位元素带 `z-index` / `isolation`——浮层的层号就退化成那个上下文里的局部序号，被任何
  上层兄弟盖住。这是库无法从自身约束的：宿主怎么写 DOM 不归库管。

  kernel 新增 `ensurePortalRoot(doc)`，在 body 末尾维护单一 `#xh-portal-root`，
  `RuntimeConfig.portalContainer` 的默认值指向它。Vue 侧 19 个浮层的 positioner
  （tour 连同 backdrop 与 spotlight）一律 Teleport 过去。落点自身一条样式都不写——
  子元素全是 `position: fixed`，不占布局，而任何 `position` / `transform` / `contain` /
  `isolation` 都会平白建出新的层叠上下文，正是要躲的东西。

  WC 适配器是 Light DOM，解剖契约就是「作者写在哪就在哪」，搬不动。改为在浮层展开时
  沿祖先链探一次层叠上下文，命中就投一条诊断，指名是哪个祖先的哪条属性。

  **破坏性**：浮层的 DOM 位置变了。按 `wrapper.querySelector` 之类以挂载根为基准取浮层
  节点的代码要改从 `document` 取。

  ## 遮罩式浮层并到同一档层号

  `--xh-z-drawer` 删除，`--xh-layer-drawer` 与 `--xh-layer-modal` 解析到同一个值。

  原先抽屉 1000 低于对话框 1100，而两者都在同一个栈上下文里，纯靠数字定序：从对话框里
  拉出抽屉时，抽屉连同自己的遮罩一起沉在对话框遮罩底下，用户只看到画面又暗一层、什么都
  没出现，而焦点已经陷进看不见的面板。反方向是对的，所以这是只在一个方向上炸的组合。
  并档之后先后交给 portal 顺序决定，与对话框套对话框的现有行为一致。

  **破坏性**：`--xh-z-drawer` 这个名字没有了。改用 `--xh-layer-drawer`。

  ## 背景失活改走祖先链

  `hideOutside` 此前只遍历 body 直接子元素，判据是「这个子元素包含 target 就整块放行」。
  WC 适配器的浮层长在作者写它的位置，应用只要有一层根容器（`#app` 之类）就会因包含浮层
  被整块豁免——模态对话框身后的整个应用对读屏依然完全可遍历，不认外点关闭的
  `alertdialog` 更是完全可点。改成沿每个 target 到 body 的祖先链逐层罩住其余兄弟。

  `data-xh-inert-exempt` 的语义随之扩大：带标记的元素及其后代不被罩住，**其祖先只递归、
  不整块罩住**。通知队列因此在任意嵌套深度都能保持可点，外点判定也一并豁免（点通知不再
  把模态关掉）。

  ## 其余

  - `--xh-editable-preview-line-height` 删除，改用 `--xh-editable-preview-min-h`：预览态
    原先拿行高冒充高度，实测比同组件的编辑态高 2px，切换时跳一下。
  - tooltip 与 navigation-menu 入层栈，Escape 不再连它们下面的对话框一起关掉。
  - 定位引擎新增 size 中间件，回报可用空间与锚点宽度；菜单族补上高度上限与内部滚动。
  - 包含块判定补齐 `translate` / `rotate` / `scale` 独立属性与 `backdrop-filter`。
  - 滚动锁补滚动条补偿与滚动根探测。

- e788896: Select 支持多选，选中值由单值改为集合，公开 API 破坏性变更。

  多选打开方式是 `multiple`：点中条目即在集合里增删该项，列表不收起；单选行为不变，只是选中值
  的容器形状统一成了数组（单选恒为长度 ≤ 1）。

  迁移点：

  - `SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`。原先判空写 `details.value === null`
    的，改判 `details.value.length === 0`；取单选值写 `details.value[0]`。
  - `SelectApi` 的 `value` 与 `valueText` 由单值变数组，两者逐项对应；`setValue` 签名变
    `(next: string | string[]) => void`，裸串按单选简写处理；新增 `multiple`。
    想拿「显示成什么字」不必自己拼，用 `displayText`：有选中取选中项文本（多选按半角逗号加空格连起来），
    否则取 `placeholder`。
  - Vue 默认插槽暴露的 `value` 与 `setValue` 随之变化；`update:value` 的载荷由单值变数组，
    因此 `v-model:value` 绑定的变量类型要一并改。`value` / `default-value` 两个 prop 仍接受裸串与 `null`。
  - WC `value-change` 事件的 `detail` 由 `{ value: string | null }` 变 `{ value: string[] }`；
    新增 `multiple` 属性。`value` 属性只递得进单值，多选集合请写 property。
    表单影子 `hidden-select` 不再写 `value`，选中态一律由 `option` 的 `selected` 表达（多选时开原生
    `multiple`）—— 靠读 `hidden-select.value` 反查选中项的代码要改成读 `selectedOptions`。

- d0202b2: **选择态一族（table / tree / transfer）的选中集合统一叫 `selection`。** 三个组件表达的是同一件事，
  却各叫各的：table 是 `selection`、tree 是 `selectedValue`、transfer 是 `selected`。1.0 之后 prop 名
  就是公开 API，趁 alpha 一次改完，不留别名。

  三家统一为 `selection` / `defaultSelection`，回调仍是 `onSelectionChange`，载荷字段一律 `{ value }`
  （全库同类载荷都用 `value`，transfer 的 `{ selected }` 是唯一破例）。

  迁移点：

  - tree：prop `selectedValue` → `selection`、`defaultSelectedValue` → `defaultSelection`；
    `TreeApi.selectedValue` → `selection`、`setSelectedValue` → `setSelection`；
    机器事件 `SELECTED.SET` → `SELECTION.SET`；Vue 的 `v-model:selectedValue` → `v-model:selection`；
    WC 的 `el.selectedValue` → `el.selection`、`el.defaultSelectedValue` → `el.defaultSelection`。
  - transfer：prop `selected` → `selection`、`defaultSelected` → `defaultSelection`；
    载荷 `TransferSelectionChangeDetails.selected` → `value`；
    `TransferApi.selected` → `selection`、`setSelected` → `setSelection`；
    机器事件 `SELECTED.SET { selected }` → `SELECTION.SET { value }`；
    纯函数入参与 `TransferMoveInput` / `TransferMoveResult` 的 `selected` 字段 → `selection`；
    Vue 的 `v-model:selected` → `v-model:selection`，默认插槽载荷 `selected` → `selection`、
    `setSelected` → `setSelection`；WC 的 `el.selected` → `el.selection`、
    `el.defaultSelected` → `el.defaultSelection`。
  - table 本来就是这套名字，不变。

  三者的语义各不相同，改的只是名字：table 的 `selection` 可以是 `'all'`，tree 分单选/复选，
  transfer 的 `selection` 是两侧的勾选集合，与「已搬到右侧」的 `value` 是两回事。

- 5a1aedd: 轻提示与通知分家：新增 notification，toast 收窄成操作反馈，toaster 删除。

  原先 toast 一个组件担了两件事——「用户刚点了一下，告诉他结果」和「系统主动推来一条消息」。
  两者的信息量、停留时长、落位习惯、谁触发都不一样，混在一起的结果是标题加正文两层文本、
  九宫格落位、堆叠上限这些只有后者需要的东西全压在轻提示上，而轻提示自己反倒要靠一个
  额外的容器组件才能用起来。

  **通知（新增）**

  ```vue
  <XhNotificationRoot v-slot="{ create, dismiss }">
    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem :id="item.id" :title="item.title" :description="item.description">
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
  ```

  队列与卡片是同一个组件的两层：`root`（队列的作用域包装）/ `group`（某个位置上的那一摞，也是 `role=region` 的地标）/ `item` 起是单条卡片。
  九宫格落位、`max` 上限、同 id 就地改写、逐条计时与暂停都在这里。
  Web Components 侧是 `<xh-notification>` 与 `<xh-notification-item>`。

  单条卡片的生命周期复用 toast 那台机器——「会自己消失的卡片」这一行为与消息来源无关。

  通知另有命令式的 `createNotificationService`：推送连接的回调、后台任务的收尾、
  拦截器里的一条系统消息，调用点都在组件之外，让它们各自去找一份队列上下文并不现实。
  队列要长在页面结构里（通知中心那一栏自己排版）时用组件形态，两者不共享队列。

  **轻提示（收窄）**

  - 解剖去掉 `description`：一次操作的结果一句话说得完，说不完的那是通知。
  - 新增 `group` 部件：同时在场的几条叠成一摞。这一摞由全局服务渲染，没有对应的容器组件——
    反馈落在哪儿是整个服务的口径，不该让每个业务页面各挂一份容器再各自决定。
  - `createToastService` 的队列改为服务内部私有，`info` / `success` / `warning` / `error` /
    `loading` / `create` / `update` / `dismiss` / `dismissAll` 签名不变，调用点零改动。
    服务选项新增 `placement`（默认 `top`）、`max`（默认 5）、`gap`。

  **破坏性**

  - 删除 toaster：`XhToasterRoot` / `XhToasterGroup` / `useToaster` / `<xh-toaster>` /
    `connectToaster` / `toasterMachine` / `toasterAnatomy` / `@xihan-ui/styles/toaster.css` 等
    一并移除。组件树内的通知队列改用 notification，命令式轻提示继续用 `createToastService`。
  - toast 删掉 `description` 部件与 `getDescriptionProps`；`<xh-toast>` 的 `description` 属性同时移除。
    机器上的 `description` prop 保留——notification 的卡片复用同一台机器。
  - `ToastOptions` / `ToastRecord` 不再带 `placement`：轻提示的落位归服务，不逐条各去一处。
  - 覆盖槽 `--xh-toaster-inset` / `--xh-toaster-layer` 改名为 `--xh-notification-inset` /
    `--xh-notification-layer`；`--xh-toast-description-*` 随部件一起移除。

### Minor Changes

- 906b712: 真机 axe 扫出的无障碍缺陷逐条修，并把三个模态补进扫描名单。

  **dialog / drawer / image-viewer 此前从没被真机 axe 扫过**：它们的 presence 模型与共享套件对不上，各自单开了一份 WC 规格，因而不在扫描名单里——而焦点陷阱、`aria-modal`、背景 inert 恰恰最该在真浏览器里验。补进名单后三者全绿。

  同一次扫描照出四类既有缺陷：

  - **side-nav 折叠成图标栏后，行按钮与链接没有可及名**（critical + serious，14 条）：皮肤把 `branch-text` / `link-text` 整个 `display: none`，可及名随之归零——读屏用户在折叠侧栏里完全不知道每一项是什么。改成仓内既有的视觉隐藏配方（文字仍在无障碍树里），可及名恒等于可见文本，不必再让连接层去猜名字，也不会覆盖作者自己写的 `aria-label`。
  - **side-nav 的 `ul` 直接装 `a`**（serious，19 条）：Vue 适配器早就偷偷包了一层没登记的 `<li>`。把它提成正式的 `item` 部件（解剖 / connect / meta / 两个适配器 / 套件 / 示例同步），与同族的 breadcrumb、anchor、navigation-menu 一致。
  - **有值时下拉钮被藏掉**（date-picker / time-picker / combobox）：清空钮的互斥契约此前让「清空钮顶替下拉钮」，但这三家的 `trigger` 是打开浮层的那颗按钮而不是装饰箭头——藏掉它，鼠标用户在有值之后没有入口，浮层收起时的焦点归还也会落到隐藏节点上，键盘用户当场丢失位置（真机里 Escape 后焦点掉到 `body`）。改为只有纯装饰的 `indicator` 才让位（select / cascader / tree-select 那三家），这三家的清空钮与下拉钮并排显示。
  - select 的隐藏原生 `select` 在派生用例里被插了两份，第二份没有接线因而没有可及名——套件的 fixture 助手补幂等判断。

  `data-name` 这类写成常量再当计算键用的属性，此前公开面采集器的正则扫不到，基线漏登记；采集器补上常量形态。新增 `check-release-tag`：标签写的版本号必须与 changesets 的 pre 模式对得上，否则打 `v1.0.0` 却发出 `1.0.0-alpha.N`、或退出 pre 后打 `v1.0.0-rc.1` 直接占掉 `latest`。

- e73b671: 行为原语补一条 Vue 出口，并修掉滚动锁那段假文档。

  **新增 `@xihan-ui/vue/behavior` 子入口**，收五个组合式：`useScrollLock`、`useHoverIntent`、`useScrollTracker`、`useStickToBottom`、`useTypeahead`。它们只做一件事——把原语句柄的释放挂到 Vue 作用域结束，语义与原语一字不差。与主入口分开是因为自建浮层才用得上这一层，不用的应用不必把它压进主入口的体积预算（子入口本身 gzip 3.39 kB）。

  需要层栈仪式的那几个（消解层、焦点域、背景失活）**刻意不收**：它们要按顺序接四五个东西，接错的表现是「点子菜单父层跟着关」这类不报错的怪症，那种场景请直接用库里现成的浮层组件。

  **`docs/guide/behavior.md` 的滚动锁一节此前写的是不存在的 API**：示例里的 `shards` 选项与句柄上的 `addShard()` 从未实现过，`ScrollLockOptions` 一直只有 `config`，句柄一直只有 `dispose()`。照实现重写，并补上实现里有、文档里没写的两件：锁哪个元素由 `config.scrollRoot?.()` 决定（宿主把滚动搬进内容容器时必须注入，否则锁到的是不滚的那个）；加锁期间让出来的滚动条宽度写在文档根的 `--xh-scroll-lock-gutter` 上，供 `fixed` 元素让位。

  **破坏性**：`@xihan-ui/kernel` 删除 `DATA_SCROLL_SHARD`。它是那段假文档的来源——声明处之外全库零引用，配套的分片机制从未实现。留着等于承认公开面里有一个永远不生效的名字。没有使用者能真的依赖它（它不参与任何代码路径），但名字确实从公开面消失，故记为 major。

- e12e337: 日历可以并排展示连续几个月，date-picker 的区间选择默认就是两个。

  区间的起止常常跨月，只有一个面板就得「点起点 → 翻页 → 点终点」，翻的时候还看不见起点在哪。
  两个并排是这类选择器的通行做法，也是这次补上的。

  - **calendar 新增 `visibleCount`**（默认 1）与 **`panels`**：一个锚点铺出 N 个连续月，
    翻页只动锚点、整窗一起走一个月，不是各翻各的。跨年自然接上（12 月的下一个面板是次年 1 月）。
  - **`getGridProps` / `getHeadingProps` 收面板下标**，每个面板一份标题 id，网格各由自己那行标题命名。
    不给下标即首个面板，旧调用一字不改。
  - **`CalendarCellProps` 多一个 `index`**：同一天会同时出现在两个面板里（8 月末那几天也铺在 9 月首行），
    「是不是本月」只有连着面板一起看才判得出来。
  - **往后翻的边界按整窗算**：新露出来的是窗口末尾再往后一个月。单面板时与从前逐字一致。
  - **date-picker 新增 `visibleCount`**，缺省单选 1、区间 2。
  - 皮肤只在 `content` 直接摆了两张日历时才横排（`:has`），并给第二张起画一道左分隔线——
    `showTime` 那套结构里 content 的直属子节点是作者自己的包裹块与确认行，无条件横排会把它们并到日历旁边去。

  旧字段 `weeks` / `visibleMonth` / `headingLabel` 保留，恒指首个面板。

- ff84a16: 日历补上按月 / 季度 / 年 / 周挑，并修掉多面板下的两处硬伤。

  **面板粒度 `view`**（`day` 默认 / `month` / `quarter` / `year`）

  格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态——min/max 比较、区间逻辑、
  不可用判定、表单出口于是全都原样复用。点 Q3 落的就是 `2026-07-01`。

  - 月面板一年 12 格、季度 4 格、年面板一页十年（两端各带一格邻十年，与日视图带邻月同一套做法）
  - 一页翻多久跟着视图走：日 1 个月、月与季度 12 个月、年 120 个月；翻页边界同样按整页算
  - 标题按 locale 出：`2026年8月` / `2026年` / `2020年-2029年`
  - 网格上多一个 `data-view`，皮肤据此换排布（月与年 3 列、季度 4 列）；日视图一个字没动

  **周选 `weekSelection`**：点任意一天落的是它所在的整整一周（两端一起给），周首日随 locale。
  只在 `view=day` 且区间模式下生效，其余情形照旧只落这一天。

  **修：点第二个面板里的日子会整窗往后翻一页**

  视窗起点此前直接由聚焦日反推，于是点右边那个面板 → 聚焦日落到下个月 → 整窗跟着走，
  看着就像「点一下翻一页、根本选不中」。现在视窗是独立的浏览位置，只在聚焦日走出视窗时
  才挪过去，挪到刚好把它露出来的那一端。

  **修：浮层展开后指针那条路没有出口**

  上一版把触发钮变成可选部件后，点输入行只能展开、不能收起——而段位里敲出来的值又不触发
  「选完即收」（那时人还在打字），于是浮层关不掉。现在点输入行是开合对称的，段上按 `Enter`
  也收起（`Alt+ArrowDown` 展开的对偶）。

- a55c76e: 日历补上快速翻年、周选整周预览，日期示例按粒度重整。

  **« / » 快速翻**：新增 `prev-year-trigger` / `next-year-trigger` 两个可选部件（不写即不渲染），
  步长跟着视图走——日视图一年，月与季度十年，年视图一百年（它的 `‹ ›` 本来就走十年，
  大步得更大才有用）。边界与 `‹ ›` 各判各的：上界卡在今年之内时，下一页还翻得动、整年跳出去就按不动了。

  **周选悬停整周亮**：`weekSelection` 下指针扫过哪一行哪一行整整七天一起亮，与点下去的结果对得上。
  此前沿用的是「起点 → 悬停点」那一段，一格一格拉出来的区间在周选里讲不通。不开周选时照旧。

  **示例重整**

  - 天 / 周 / 月 / 季度 / 年归拢成一个「五种粒度」示例，一套结构走完
  - 「区间选择」补齐五种粒度，都是并排两页
  - 删掉旧的「按月选择」——它是 `view` 出现之前手搓的一版面板（拿 `XhButton` 拼的），
    与新的 `view="month"` 长相不一致；它想演的「输入行只留年月两段」并进新示例，
    按年挑就只留年那一段

- a19bbaa: 级联选择补空态兜底：新增 empty 部件，搜索无候选或 collection 为空（根列没有条目）时露面，其余时候带 hidden。

  - headless：`getEmptyProps` 管空态占位的露面与收起；`getSearchListProps` 无候选时带 `data-empty`，`getContentProps` 根列没有条目时带 `data-empty`；新增 `translations` prop（`empty` / `noMatch` 两键，默认英文）与 api 上并入默认后的完整一份。
  - vue：`XhCascaderContent` 自动补渲空态占位，`empty` 插槽可换内容，缺省文案按视图取无匹配或无数据；`translations` prop 接入全局 `provideXhConfig` 注入点（`translations.cascader`）。
  - web-components：新增可缺省的 `empty` 部件，元素代管其 hidden，文案归作者。
  - styles：空态占位居中排版（`--xh-cascader-empty-min-h` / `--xh-cascader-empty-p` / `--xh-cascader-empty-fg` 可覆写）；无候选时候选列表不再占位，根列没有条目时空列让位。

- ea78591: checkbox 与 switch 能进 HTML 表单了。表单字段组件从 18 个变成 20 个，五个缺口清完。

  **先纠正一条我此前记错的约束**：我曾把这两个记为「要单独一轮，因为 HTML 内容模型禁止 button 有
  交互后代」。查规范后不成立——interactive content 的定义里 `input` 那条写的是「**type 属性不处于
  Hidden 状态时**」，所以 `<input type="hidden">` 不是交互内容，放进 `<button>` 里是合法的。
  DOM 不必重构，与 color-picker、combobox 同一条路。

  - 新增 `hidden-input` 部件、`name` 与 `value` 两个 prop（`value` 缺省 `'on'`，与原生一致）。
  - **勾上才带 `name`**：没勾就整条不参与提交，这是原生复选框的语义。
  - **半选按未勾处理**：原生里 indeterminate 只是外观，提交与否看 `checked`。
  - Vue 侧由组件自己渲染（单体控件没有子部件插槽，作者递不进来），**给了 `name` 才有这个节点**——
    没给就与从前逐字节相同。WC 侧照旧由作者写 `data-xh-part="hidden-input"`。

  **两者的重置走转移而不是写 context**：它们的值就是机器状态（`on` / `off` / `indeterminate`），
  没有值 cell 可 reset。`FORM.RESET` 因此是一组带守卫的转移，受控时只发意图、非受控才真的转过去；
  已经停在默认态就不白发一次通知。

  如实记一处限制：`onCheckedChange` 的载荷刻意只有布尔（「用户交互的落点只可能是全选或全不选」），
  表达不了半选。所以回落点是半选时状态照常转、通知不发；受控且默认半选的组合因此拿不到重置。
  不为这一处去改已公开的载荷类型。

- 089db90: 清空 / 关闭 / 移除按钮收成四类契约，`check-clear-trigger` 门禁固化。

  **内嵌清空钮**（cascader · tree-select · combobox · date-picker · time-picker · text-field · tags-input · select，以及新增部件的 popselect · date-field · time-field）统一为：`tabindex=-1` 不占 Tab 位但**不再 aria-hidden**——读屏按 `aria-label` 找得到它，文案统一走 `translations.clearTrigger`（缺省 `'Clear'`；select 的 `clear` 键改名）；pointerdown 不夺焦，点完发 `VALUE.CLEAR` 并把焦点送回宿主（trigger / input / 第一段）；没值就 `hidden`，不再同时打 `disabled`/`data-disabled`、皮肤也不再留一颗永远看不见的灰钮；尺寸与圆角统一为 `var(--xh-<c>-action-size, var(--xh-control-action-size))` / `var(--xh-<c>-action-radius, var(--xh-shape-control))`——text-field 此前与输入框等高、select / tags-input 按指示符尺寸走 pill，`--xh-text-field-clear-*` / `--xh-tags-input-clear-*` / `--xh-select-clear-*` 槽改名 `action-*`；互斥一律由 connect 在被让位的部件上打 `data-clearable`、皮肤一条 `display: none`——select 去掉了 `:has()` 让位与 `:hover` 才显形（触屏此前根本看不到清空钮），清空钮改为 trigger 的兄弟并排（`--xh-select-control-gap`）。

  **键盘清空**：select · cascader · tree-select · popselect 此前没有任何键盘清空路径。现在焦点在 trigger、有值且可编辑时 **Delete 清空全部、Backspace 单选清空 / 多选去掉最后一个**，键盘表与一致性套件同步。

  **select** 补 `readOnly`（浮层照常展开、值改不动、清不掉）与 `VALUE.CLEAR` 事件（`api.clear()` 不再借 `VALUE.SET []`）；Vue 的 select / combobox Root 新增 `clearable`（缺省 false）决定 collection 自动渲染树是否带清空钮——combobox 此前无条件渲染，示例已补 `clearable`。

  **独立动作钮**（file-upload · signature-pad）：file-upload 的 `api.clearFiles()` 改名 `clear()`、`translations.clearFiles` 改名 `clearTrigger`；列表为空时不再原生 disabled（清完焦点会掉回 body），只打 `data-empty` 压淡。

  **浮层关闭钮**（dialog · drawer · popover · tour · toast · alert · floating-panel · image-viewer）统一 `var(--xh-<c>-close-size, var(--xh-control-h-sm))` / `var(--xh-<c>-close-radius, var(--xh-shape-control))`，dialog / drawer / popover / tour 补上使用者槽；image-viewer 保持 `--xh-control-h-lg`（全屏看片的 chrome 钮按触控靶走）但圆角归 control。**标签内移除钮**（tag · tags-input item · select tag）尺寸基准 `--xh-control-indicator-size`、圆角 `--xh-shape-inset`；行级删除钮（file-upload item · dynamic-input）按 `--xh-control-action-size` / `--xh-shape-control`。

  四类按钮都补了 `:active` 按压反馈（`--xh-motion-scale-press`），27 处登记进 `check-press-feedback`。

  `--xh-select-clear-*` / `--xh-tags-input-clear-*` / `--xh-text-field-clear-*` 共 20 个槽名变更是公开面删减，基线已推。

- 72dc39c: color-picker 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 里提交，`FormData` 里没有这个字段。
  同仓 11 个组件早就做全了这件事，它是缺口之一。

  照仓内既成的形状补：新增 `hidden-input` 部件（`type=hidden`，排在解剖末位）、`name?: string` prop、
  `ColorPickerApi.getHiddenInputProps()`。影子产出的属性恰好五条——parts 属性、`type`、`name`、`value`、
  `disabled`——`type` 必须排在 `value` 前（改 type 会重置输入的值），`name` 不给就整条不产出、这份输入
  不参与提交，禁用时带原生 `disabled` 不提交值，只读照常提交。

  **这是纯增量**：影子是作者自己写的可选部件（Vue 侧新增 `XhColorPickerHiddenInput`，WC 侧新增
  `::part(hidden-input)`），不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。

- a7e8755: combobox 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 提交，`FormData` 里没有这个字段。

  **形状照 tree-select，不另起一套**：单个 `hidden-input` 部件（`type=hidden`，排在解剖末位），
  多选按逗号拼成一串。同为多值浮层选择器的 tree-select 已经是这个形状，combobox 换一种（比如
  一值一个影子输入、或隐藏 `<select multiple>`）会凭空造出第二套约定。

  如实记一笔：逗号拼串对含逗号的值不可逆，也不是原生的多值 `FormData`（`name=a&name=b`）。
  这是 tree-select 已有的性质，要改得两个一起改，是另一件事。

  纯增量：影子是作者自己写的可选部件，不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。
  判据也按这个形状加——只在本用例的 fixture 里挂影子，其余用例的 order/counts 一条没改。

  **顺带被门禁逼出来的一件事**：加了 `name` 之后 `check-form-reset` 当场变红——带 `name` 就是表单
  字段，就必须认表单重置。combobox 因此一并接上了 `FORM.RESET`：值与输入串是两条独立受控轴各判各的，
  高亮锚点一并清（它指向的条目可能已被过滤掉）。表单字段组件从 17 个变成 18 个。

- ada8a01: 全局配置做成真正的 ConfigProvider：全局默认 + 局部覆盖，两个适配器一份语义。

  **嵌套注入改成逐键合并。** 此前子树里再 `provideXhConfig` 会把外层整份遮蔽——只想改一句文案，外层的 `locale` 与 `portalContainer` 一并丢掉，而文档一直把「不同子树各注各的」当卖点。现在键缺席与写成 `undefined` 都算「这一层没说」，一律回落外层；同一个组件下的文案也按键并。

  **Web Components 侧补上作用域。** 新增 `<xh-config>`：包住一棵子树，里面的元素沿 DOM 祖先链解析配置，合并规则与 Vue 侧完全一样（那边找组件树，这边找 DOM 树）。`setXhConfig` 仍管整页。元素自己不渲染任何东西，`display: contents`。

  **新增两个字段。** `size` 是尺寸档的应用级默认（对齐 AntD 的 `componentSize`），落到每个声明了三轴 `size` 的组件上；`floating-panel` 的 `size` 是一对像素数、同名不同义，两侧都在豁免名单里。`scrollRoot` 交出真正在滚的那个元素——宿主把滚动搬进内容容器时 `body` 本身不滚，模态浮层的滚动锁此前是空操作。`dir` 刻意不收：它走 DOM，行为层从计算样式读，再加一条 JS 通道只会对不上。

  **补上三处漏接。** `context-menu` 与 `tree-select` 声明了 `translations` 却没走 `withXhConfig`，全局文案对它们一直静默失效；`XhTranslationOverrides['date-field']` 指的是 `DatePickerTranslations`（`startDate` / `endDate`），而 `date-field` 的文案是逐段映射，类型过得去、运行期 100% 不命中，现改为 `DateFieldTranslations` 并把它从空接口填成段位映射。

  新增 `check-config-wiring` 门禁：两侧配置面字段必须一致、`size` 豁免名单两侧一致且与 headless 的类型对得上、声明了 `translations` 或三轴 `size` 的 Vue 组件必须真接上配置通道。

- f1b2c16: date-picker 补上 `defaultFocusedValue`，决定展开时先落在哪一页。

  日历一直有这个 prop，date-picker 没往外露：它的聚焦日单元格默认值写死为 `null`，只能退回首个选中值、再退回今天。没有初始值又想让面板先停在某个月（报表默认看上个月、排期表默认看下个月）此前没有出口。

  补上之后三路收口不变：写过的聚焦日 → `defaultFocusedValue` → 首个选中值 → 今天。表单重置回到 `defaultFocusedValue`，与其余 `default*` 一致。Web Components 那侧是 `default-focused-value`。

  顺带说明一处已有的误用：`defaultFocusedValue` 此前不是 date-picker 的 prop，测试里写了也不生效，那几条其实是靠「今天」恰好落在同一个月才通过的。现在它们真的按写的那一天算。

- 7f8021e: 日期区间的框选改成逐行横杠，面板数按区间跨不跨页现算，面板号写在日历上一处即可。

  **区间底色画成了一整块实心方块。** 底色铺在格子的背景上，格子上下的内衬也算背景区，
  而行与行之间没有间距——七月一整月被选中时，五行底色首尾相接连成一个大方块，
  两端那两枚圆点像是被按在方块上，看不出区间是一天一天连起来的。

  底色改由格子的 `::before` 铺：横向铺满格子，相邻两格接成一条；纵向收在格子内衬里，
  行与行之间留出 4px 空当。每一行的行首与行尾各自收圆，跨周的区间于是是一行一条两头圆的横杠。
  摆了周序号格的行里，行首那一格排在周序号后面，圆角跟着落到它身上。

  **两端那一格只铺半格**，另外半格由选中圆片占满：区间收在圆点上而不是收在格子边上。
  起止落在同一天时两条一起生效，底色宽度归零，只剩那枚圆点。

  **邻月的日子不再吃区间底色与选中圆片。** 并排两张面板里同一天会各出现一次
  （7 月 31 日既在七月的末行、也在八月的首行），两张都画就成了两个端点、两段底色。
  邻月的日子回到「压暗的数字」这一档。

  **粗粒度视图的邻月判定修正。** 月/季度/年三档里格子的值是那一段的第一天，与面板起点比月份恒不相等，
  于是除首格外整页都被判成邻月、整页压暗。这三档改用网格自报的 `inView`。

  **区间默认铺几个面板改成现算**：已选的两端落在同一页里就一张，跨页才并排两张；
  只落了一端（还在挑）时仍按两张算。日历同时恒渲染六行（新 prop `fixedWeeks`，默认开），
  并排的两张面板等高，翻页时浮层高度也不再跟着月份变。

  **面板号写在 `XhDatePickerCalendar` 上一处即可**：新增 `index` prop，面板内的
  `Heading` / `HeadingYearTrigger` / `HeadingMonthTrigger` / `Grid` / `Cell` 不写就跟着它走，
  自己写了仍按自己写的算。此前这五个部件各要写一遍，漏掉任何一个都会静默落到面板 0——
  两张面板显示同一个月份、第二张面板的邻月判定整片错位，都是这么来的。五个 prop 一并兼收字符串。

  **快捷选项列的高度由并排的日历给。** 此前这一列按内容收、上限写死一档，
  右侧那道分隔线只画到最后一条选项，比日历矮一截；它与旁边那张日历之间也补上了与两张日历之间同样的空当。

- e2292bf: date-picker 与 time-picker 补上三条视觉轴：`variant` / `tone` / `size`。

  这两个组件此前是全仓仅有的两处「有输入行却没有形态轴」——同一张表单里，
  文本框、数字框、分段日期、分段时间都能换档，唯独这两个换不了，只能靠覆盖令牌硬凑。
  它们各自内嵌的 `date-field` / 分段时间输入早就有三轴，缺的一直是外层这一份。

  轴的落法与全仓一致：三个属性只写在 `root` 上，输入行、日历格与浮层里的列都从那里继承皮肤声明的私有槽，
  所以换一档不必给每个部件各写一条选择器。

  皮肤同步把两份里原先散着的写死值收成私有槽：

  - 尺寸档换 `control-h` / `control-px` / 两档字号（time-picker 还多一个列表格子的内边距）
  - 形态档换底色与两档描边；输入类照例不做实心档——填满一个要往里打字的框，字与底没法同时读
  - 语气只落在聚焦环、段位反白、时间列选中与确认按钮上，正文与日期数字不归它管

  不写这三个属性时一个 `data-*` 都不产出，皮肤走缺省档，观感与之前逐像素一致。

- d0202b2: 开箱默认语言跟随运行时，兜底英文。

  此前是自相矛盾的：i18n 文档明写「内建文案默认是英文」，而日期系的兜底 locale 写死 `zh-CN`（calendar / heatmap / time 三处常量）——开箱就是**英文按钮配中文月份名**，热力图图例还是「少 / 多」。命令式 dialog 的按钮也硬编码着「确定 / 取消」，而那个服务自建 `createApp` 挂在 body 上，根本读不到组件树里的 `provideXhConfig`。

  现在 kernel 提供一条解析链 `resolveLocale(locale, scope)`：**作者显式传的 locale → 全局配置 → 宿主 `navigator.language` → `en-US`**。宿主读取一律经 `config.scope`（SSR 安全）。calendar / heatmap / date-field / date-picker / time 全部接上；`RuntimeConfig.locale` 的 `zh-CN` 兜底同改。

  **行为变更（预期之内）**：默认周首日随之从周一变成周日（`en-US` 口径）——要固定就显式传 `locale` 或 `firstDayOfWeek`。同时修掉一个此前没有测试覆盖的连带 bug：日历的周序号原先取每行**行首**那天算 ISO 周数，注释写着「行首正是周一」；周首日变成周日后，周日在 ISO 里属于上一周，整列周序号会集体少 1——改成取行内第 4 天，两种周首日下都必落在本行覆盖的那个 ISO 周内。

  `TimeProps.locale` 此前是 `'zh-CN' | 'en'` 的窄联合，与全局配置的 BCP 47 `locale` 对不上：配 `de-DE` 会让所有非 `'en'` 的语言（含 `en-US`）拿到中文用词。类型放开为 `string`，判据改成 `zh` 前缀匹配，`TimeLocale` 直接删除、不留别名。`HEATMAP_LEGEND_TEXT` 的「少 / 多」改 `Less / More`。

  `createDialogService` / `createToastService` 新增 `config?: XhConfig` 选项——服务在自己那棵子树里 `provideXhConfig` 一次，不造全局单例；按钮兜底改 `OK` / `Cancel`。

  登记未接的两处（都写进了 i18n 文档）：`time-picker` / `time-field` 的 `locale` 只影响小时制推断，接上宿主会让 `en-US` 环境静默翻成 12 时制，属另一条裁决；`heatmap` 的 `firstDayOfWeek` 是独立的 prop 轴，不随 locale 走。

- 0be028c: 抽屉可以挂在页面里的某一块区域上了，`portalContainer` 也不再是个死字段。

  `RuntimeConfig.portalContainer` 自打声明起就没人读过——全部浮层的搬运目标一律写死 `'body'`，
  所以「局部抽屉」根本做不出来。这次两头一起接：

  - **drawer 新增 `contained`**：遮罩与定位层从 `fixed` 换成 `absolute`，只罩住最近的定位祖先而不是盖满整屏。
    `data-contained` 同时落在 root / backdrop / positioner / content 上，页面里那半边与被搬走的那半边都能选到。
  - **Vue 新增 `container`**（选择器或元素）：浮层搬进那个容器，并**隐含 `contained`**——
    一处给定、两件事从它派生，不会出现「搬进去了但还画着全屏遮罩」这种两边各说各话。
    显式写了 `contained` 以显式的为准。
  - **`portalContainer` 真正接上**：`XhConfig` 多一个同名字段，应用级注入一次，
    没写 `container` 的浮层就落到它给的容器里；都没有才落 `body`。
  - **Web Components** 是 Light DOM，作者写在哪浮层就在哪，因此只需要 `contained` 这一个属性来让皮肤按容器画。

  那个容器要自己带 `position`（`relative` 之类），否则 `absolute` 会往上找到别的定位祖先——
  这一条写进了 props 说明与示例。

- 1b7a5f1: 统一性审计收口后的六条遗留项。

  **px 与 rem 按口径归位。** 字号七档 `--xh-font-size-xs…3xl` 从 px 改为 rem（0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75rem，根字号 16 时像素不变，使用者改根字号时整套排版随之缩放）；字形与控件几何改为 px：`--xh-glyph-size-sm/md/lg` 16 / 20 / 24px、`--xh-glyph-size-xl…4xl` 32 / 40 / 56 / 72px、`--xh-control-action-size` 24px（compact 20px）、`--xh-control-indicator-size` 16px（compact 14px）；color-picker 的动作钮与色块同样归 px。

  **side-nav 折叠态换枝播退场。** 机器里弹出面板的坐标改为按分支记账（`popoutPlacements`），换枝时旧面板保留坐标、`data-state=closed` 播 `xh-pop-out`，新面板同帧 `open` 播 `xh-pop-in`；此前旧面板的坐标在新枝 OPEN 那一拍被作废，退场瞬时。

  **tree-select 的 Vue Root 补 collection 自动渲染树。** 没给默认插槽且传了 `collection` 时自动铺 label? / trigger / clear-trigger? / positioner / content / tree（分支与叶子递归），新增 `label` prop 与插槽、`clearable` prop（缺省 false）；自动树与手写树 DOM 逐字同构，与 select / combobox 同口径。

  **门禁与测试整洁。** 三道浮层门禁共用 `tooling/scripts/lib/overlay-families.mjs`（名单与核实逻辑一份，各门禁的子集差异写明）；27 处测试里为旧 kernel 缺省桩的 `matchMedia` 删掉（减弱动效探测无 matchMedia 时已一律不减弱）。

- e50a7c9: 复合控件开始响应表单重置。这一版落地机制本身与首个组件 radio-group，其余 16 个随后。

  实测过的缺陷：把本库的控件放进 `<form>`，调 `form.reset()`（或点 `XhFormResetTrigger`），
  显示与提交值都停在用户改后的状态——原生重置只还原原生控件，而这些控件的值攥在机器里，
  没有任何一处监听所属表单的 reset。

  **机制**：认重置的机器在根级声明一条无守卫、无载荷的 `FORM.RESET`，动作只做一件事——
  对若干个 cell 各调一次 `context.reset(key)`，即**重新求一遍那个 cell 自己的 `defaultValue` 表达式**
  再走原来的 `set`。落点因此与 cell 定义是同一份代码，不会各写一份而漂移；受控分支原样保留，
  所以「受控只发意图」是免费守住的。适配器侧只在唯一的机器接入点（Vue 的 `useMachine`）挂桥，
  组件文件零改动。

  一句话：`FORM.RESET` = 「把这个组件变回它此刻挂载会长成的样子」。

  **落点不取挂载时冻结的 `initial`，而是按当下 props 重算**。宿主换了 `defaultValue`（比如切去编辑
  另一条记录）就该回到新的那一份，这与原生 `reset()` 回到「当下的 default」一致。

  **受控且宿主没声明 `defaultValue` 时一动不动。** 这是最要紧的一条：cell 里那句 `?? 兜底` 把
  「宿主声明的默认值」和「组件的空值」烘在同一个表达式里（radio-group 是 `null`、rating 是 `0`、
  tags-input 是空数组）。照直落下去，受控分支会把这个空值当意图发给宿主——重置就从「没反应」
  变成「把宿主的数据抹掉」。`resetDeclaredValue` 把这一步挡住了，并有专门的判据钉着。
  **受控组件要拿到重置，必须显式传 `defaultValue`**，这是本库与「受控 reset 是纯空操作」的分歧点。

  **监听挂在锚点的 root node 上**，不挂在那个 form 上：form 会被条件渲染换掉、组件也会被搬走。
  归属在事件那一刻用 `closest('form')` 现算，因此嵌套表单不会误伤。重置被 `preventDefault` 拦下时
  不动——那时同表单的原生控件也没还原，组件单方面还原会拼出半份默认值。

  无 form、无 DOM、作者没写影子输入三种情形都不需要特别处理：归属判定不命中、服务端根本不挂效应、
  锚点是组件根节点而不是影子输入。

  BREAKING CHANGE: `Bindable` 新增必填成员 `reset()`，`ContextFacade` 新增 `reset(key)`。
  自建 `ReactiveRuntime`（写第三个适配器）的实现方需要补上 `reset`。仓内三处实现已全部跟进。

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

- 1e90ce6: 热力图新增 `palette` 色板轴：`green` / `blue` / `orange` / `purple` / `red` / `gray`，直接按颜色点名色阶满档那一端，三种形态与图例一起跟着走。它是装饰性的一条轴，不是第四条语义轴——与 `tone` 同时写时听色板的，两条都压不过作者自己写的 `--xh-heatmap-ink`；不写时行为与之前逐字一致。

  令牌层随之补上紫色原语 `--xh-color-purple-600`：明度与彩度照 danger 的 600 档，只把色相换成 302。

- 689ed0f: 13 个宿主的滚动层自带自绘滚动条：滚动时或指针在这一片时露出、静止后收起，浮在内容之上不占宽度。

  **哪些宿主**：12 个浮层族的 `content`（cascader / color-picker / combobox / context-menu / date-picker / hover-card / mention / menu / pagination / popover / popselect / tree-select）与 json-viewer 的 `tree`、`text`，共 14 个滚动容器。条子由库自己建，作者一个部件都不用写：它是滚动层的兄弟，绝对定位贴在组件既有的壳上（浮层族是 `positioner`，json-viewer 是 `root`）。轴按各自的溢出方向摆——cascader 只摆横的，tree-select 与 json-viewer 竖横都摆、两条都溢出时各让出交叉口那一格，其余只摆竖的。

  挂上条子的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此把原生条藏成零宽：容器的可用宽度一点不减，也不再需要为原生条留空道。露面时机、尺寸档、拖动、触屏交给原生滚动这些全是 `scrollbar` 那一套，与手写 `<XhScrollbar>` / `<xh-scrollbar>` 挂上去的完全一致，缺省档是 `scroll-hover`。

  **json-viewer 换档跟随**：树档与原文档互斥，换档时条子跟到此刻在场的那个容器，节点不重建（换档不会把滚动条闪一下）。

  **按在 `positioner` 上不再消解浮层**：条子住在 `positioner` 里、是 `content` 的兄弟，浮层的层分支因此把 `positioner` 一并记上——不记的话按住条子拖动那一下会被判成层外交互，面板当场收起。副作用是 `positioner` 的其他子节点也算进了层内：吃指针的只有 combobox 的 `empty` 空态占位，按它不再关闭候选面板（此前会关）。其余 11 个浮层的 `positioner` 除了条子没有吃指针的子节点（`positioner` 自身是 `pointer-events: none`），按在面板之外仍照旧消解。

  **皮肤侧要跟着改的**：自带皮肤给这 13 个壳补了 `--xh-scrollbar-track-bg: transparent`（浮在内容上的条子不该有实色轨道），json-viewer 的 `root` 补了 `position: relative`（条子贴它的内边距盒）。第三方皮肤若整份接管这些 part，同样要给壳一个定位上下文，并把轨道底色关掉。滚动条自身的 `root` 补了 `pointer-events: auto`，抵消 `positioner` 那句 `none`。

- a3be6d6: 命令式服务补齐三件：顶部进度条服务、取值型弹窗、配置源可运行期换。

  **新增 `createLoadingBarService`**。路由守卫与请求拦截器要在组件树之外开合进度条，此前只有组件形态 `XhLoadingBarRoot`，使用者只能自己在应用根挂一个再拿模块级状态去桥接。形态与另两个服务一致：一个工厂、自建 holder 挂 body、句柄带 `dispose`。

  句柄上是**在途计数**而不是布尔开关：`start()` 递增、`finish()` 递减并夹到 0，归零才收。这是它比自搭那层壳多出来的东西——布尔开关下三个并发请求里第一个回来就把条子收掉，剩下两个还在跑。另有 `error()` 换语气收尾、`finishAll()` 不管在途一律收、`set(value)` 切确定进度（再 `start()` 回到不确定）。

  **命令式对话框的正文加宽，并新增 `prompt`**。`ConfirmOptions.content` 从 `string` 放宽成 `DialogBody = string | (() => VNodeChild)`：给串仍走 `XhDialogDescription`（读屏的 `aria-describedby` 接在它上面），给渲染函数则整块摊在正文位。不收裸 VNode——服务宿主是常驻的，忙态一翻就整棵重渲，同一个 VNode 实例被复用时行为未定义。

  `prompt` 解决的是「弹窗里要填东西，填完把值带回来」：每次打开建一份 `reactive` 初值，`body(value)` 与 `onOk(value)` 拿的是同一份可写代理，确认后 `resolve` 一份普通对象快照，取消 / Esc / 卸载 `resolve null`。`prompt` 的 `onOk` 返回 `false` 表示校验没过、弹窗保持打开；`confirm` 的 `onOk` 签名不吃 `false`，语义一字未动（现有 `onOk: () => api.check()` 恰好 resolve false 时不会静默变成「按了确定不关」）。

  **配置源与文案改成可运行期换**。三个服务的 `config` 从 `XhConfig` 放宽成 `MaybeRefOrGetter<XhConfig>`，句柄上多一个 `setConfig`；`okText` / `cancelText` / `translations` 一并放宽。此前文案只在创建服务那一刻求值一次，应用切语言后服务子树里的按钮与读屏名不跟——队列里的对话框还会跨过一次切换。取值优先级：调用点 > 服务选项 > `config.translations.<组件>` > 组件内建。

  顺带修正 `docs/guide/versioning.md` 里两个失准的样式钩子计数（114 → 119、500 → 505）。

- 843e17a: json-viewer 补原文视图：`view="text"` 直接出缩进过的 JSON 原文。

  树档是拿来"翻"的——折叠、逐层看结构；而"核对这份报文与后端下发的是不是一字不差"、
  "把它整段拷走"这两件事树档做不到：值受 `maxStringLength` 截断、成员受 `maxItems` 折减，
  分支摘要与把手还带 `user-select: none`，框选拿到的不是原文。原文档就是补这一件事，
  因此它刻意不吃那两个折减选项。

  `api.text` 在两档下都取得到，作者要做"复制原文"按钮时不必自己再序列化一遍。
  序列化与树同源：同一个 `jsonEntries` 排键（`sortKeys` 一样生效）、同一条祖先链判环
  （环落成 `"[Circular]"`，两条不相干分支共享同一个对象照样摊开），
  `bigint` / `undefined` / 函数这些 JSON 没有写法的值退回树上那份文本并按字符串写出，
  整份始终解析得动。

  新增 headless 出口 `jsonText` 与类型 `JsonViewerView`，解剖新增 `text` 部件。
  皮肤与树档共用同一套边框、内衬与高度令牌，两档切过去盒子不跳。

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- 3c033ca: 通知按卡片重排：左侧类型字形、右上角关闭钮、两列网格。

  它的皮肤是从旧的 toast 卡片逐字搬来的，搬完没人按「通知该长什么样」审过一遍，
  于是留下三处硬伤：

  - **叉掉到了卡片左下方**。`item` 是竖排 flex，而叉上写着
    `align-self: flex-start` + `margin-inline-start: auto`——交叉轴上的 auto 外边距
    会让对齐属性整条失效（flexbox §9.6），`align-self` 那行一点作用都没有，
    叉成了正文下面的第三行。实测它落在距卡片顶 55px 处，卡片因此高出一截。
    三家参考实现（Ant Design / Element Plus / Naive UI）都是绝对定位钉在右上角内衬处。
  - **组件路径下一个类型指示物都没有**。徽记只由服务档的默认模板画，
    12 份示例与所有 Web Components 使用者拿到的卡片，语气全靠起始侧那条 4px 色条承载，
    而它压在卡片底上只有 1.9–2.8:1，`loading` 与 `info` 除颜色外完全同形。
  - **字号比轻提示还小一档**（13px），标题与说明只差 7.7%，两层文字挤成一片。

  现在：

  - 新增 `item-indicator` 部件。作者留空即由皮肤按 `data-type` 画一枚兜底字形
    （info / success / warning / error 各一枚，`loading` 给转圈），
    颜色取 `--xh-_tone-fg`——与 alert 的状态图标同档，压在卡片底上十二组最低 4.08:1。
  - **两列网格**：左列字形、右列标题与说明；叉绝对定位钉在右上角，标题自动让位
    （写法照 dialog / drawer）。起始侧那条语气色条随之删除——三家都没有，
    语气改由字形承载。
  - 卡片宽 320 → 384px（`--xh-overlay-max-w-lg`，与 Ant Design 同值），
    内衬四边 16px，字号回到正文档 14px。
  - 服务档的默认模板改成四个节点平铺（不再套一层皮肤够不着的行容器），
    说明部件恒渲染——`aria-describedby` 是无条件发的，节点缺席就成了悬空引用。
  - 地标 `role="region"` 从 `root` 搬到 `group`。root 是 `display: contents` 的作用域包装，
    量出来 0×0，地标挂在它身上跳过去落不到任何看得见的地方；那一摞才是真盒子。

  顺带补上三处从来没有门禁看管的地方：`check-elevation-role`、`check-press-feedback`、
  `check-clear-trigger` 三份名单都没登记过 notification，眼下合规纯属巧合。

  **破坏性**：删掉 `--xh-notification-accent` 与 `--xh-notification-accent-width`
  两个覆盖槽（色条没了）。另有几个槽的默认值变了：`--xh-notification-w`（20rem → 24rem）、
  `--xh-notification-py` / `-px`（12/16 → 16/16）、`--xh-notification-font-size`（13 → 14）、
  `--xh-notification-gap` 的语义从「行距」改为「图标与正文的列距」（行距另开
  `--xh-notification-row-gap`）。地标从 root 挪到 group，按 `root[role=region]` 写过
  自动化断言的要跟着改。

- 1a36b7e: 省略号能摊开了：折进去的那几页现在有路走到。

  原先省略位是 `aria-hidden` + `pointer-events: none` 的死占位，而 `pages` 序列
  只说「这里折了一段」，说不出折的是哪几页——那几页除了手打跳页输入框没有任何入口。

  分页因此升级成浮层族，新增 `positioner` 与 `content` 两个部件：

  ```vue
  <XhPaginationRoot v-slot="{ pageItems }" :count="2000" :page-size="10">
    <template v-for="item in pageItems">
      <XhPaginationEllipsis v-if="item.type === 'ellipsis'" :side="item.side" />
      <XhPaginationItem v-else :value="item.value">{{ item.value }}</XhPaginationItem>
    </template>
    <XhPaginationPositioner>
      <XhPaginationContent v-slot="{ pages }">
        <XhPaginationItem v-for="p in pages" :key="p" :value="p">{{ p }}</XhPaginationItem>
      </XhPaginationContent>
    </XhPaginationPositioner>
  </XhPaginationRoot>
  ```

  - 新增 `api.pageItems`：与 `pages` 同一串序列，但省略位带着被折叠的那几页。
    `pages` 由它派生，两者的窗口数学只有一份。旧的 `pages` 写法一行不用改。
  - 悬停摊开（`openDelay` / `closeDelay`），**点一下也摊开**——纯悬停会把键盘用户挡在外面。
    Escape 与点外面都能收起（走消解层）。
  - 至多两个省略位，用 `side`（`'start' | 'end'`）区分；同时只开一个，一份定位层就够。
    Web Components 侧由作者在节点上写 `side="end"`，与页码按钮自报 `value` 同一套写法。
  - 浮层 portal 到统一落点，三视觉轴在 `positioner` 上重打一遍。

  **破坏性**：`getEllipsisProps()` 改为收 `{ side }`；省略位从 `<span>` 变 `<button>`、
  不再带 `aria-hidden`。

- 911d0b7: 每页条数控制器随分页一起给了。

  ```vue
  <XhPaginationPageSizeSelect v-slot="{ options }">
    <option v-for="o in options" :key="o" :value="String(o)">{{ o }} 条 / 页</option>
  </XhPaginationPageSizeSelect>
  ```

  用**原生 `<select>`** 而不是再造一个浮层：档位就那么几档，浮层带不来什么，
  却要多接一层定位、消解与键盘；原生控件在 Web Components 侧也一样能用，键盘天然可达。
  不给插槽时按 `pageSizeOptions` 渲染默认档位。

  受控时会把 DOM 的选中项同步回填：宿主不写回的话，用户改过的原生 select 与真正生效的
  档位会对不上，而 vdom 那边没有变化就不会打补丁——这一条两个适配器共用。

- 720cf75: 每页条数从只读 prop 升成真状态。

  原先 `pageSize` 只是个 prop：组件读它算总页数，改档只能由宿主自己写回，
  换档后当前页越界还得宿主自己夹。现在它住进 cell，与 `page` 同一套受控/非受控语义：

  - `pageSize` 给定即受控——**与升级前一字不差**，现有写法一行不用改；
  - 只给 `defaultPageSize` 则由组件自持；
  - 新增 `pageSizeOptions`（缺省 `[10, 20, 50, 100]`，升序去重、每档至少 1）、
    `onPageSizeChange`、`api.setPageSize()`。

  **换档时页码跟着换算，而不是夹取。** 10 条一页看到第 5 页（第 41 条起），换成 50 条一页时
  夹取会给出第 2 页（第 51 条起）——刚在看的那条反而不见了。改为按改档前第一条换算，
  给出第 1 页，第 41 条仍在页内。换算结果天然落在合法区间，不必再夹一次。

  `onPageChange` 报出的 `pageSize` 现在取自当下的档位；非受控改档后它跟着变，
  不再是 prop 上那个陈旧值。

- d738f78: `date-picker` 与 `time-picker` 新增快捷选项：给 `presets` 数据就在浮层里多排一列（「今天」「近 7 天」「此刻」这类），点一条整份写进值。新增 `presets` / `preset` 两个部件、`getPresetsProps` / `getPresetProps` 两个产出与两条键盘行；这一列自成一套 listbox 键盘，与日历网格、时分秒那几列互不抢键。

  单日的值就是一条 ISO 日期串，区间用 ISO 8601 的区间写法把两端拼起来（`2026-08-15/2026-08-21`），一个串同时充当这一项的身份。日子由使用者算好传进来——连接层每帧求值，`today()` 放进渲染期会跨零点算出两个答案；headless 备了 `datePickerPresetDay` / `-Range` / `-Month` / `-Year` 与 `timePickerPresetNow` 五个纯函数。

  date-picker 的收起沿用 `closeOnSelect` 那条守卫（区间要两端齐、showTime 仍由确认按钮收口）；time-picker 的快捷选项给的是整份时间，写完即收。

- a41b931: 进度条新增环形与仪表盘两种形态。

  - 新增 `variant` 轴：`line`（缺省，行为逐字不变）/ `circle` / `dashboard`，以及 `canvas`（承载环的 svg）与 `label`（环心那一块）两个可缺省部件。
  - 新增 props：`strokeWidth`（环的线宽，viewBox 单位，缺省 6）、`gapDegree` 与 `gapPosition`（仪表盘的缺口，缺省 75 度朝下）、`valueText`（进度不是百分比时给读屏念的那句话）。线宽是 prop 不是令牌——它改的是几何，半径要跟着往里收；线形的厚度仍走 `--xh-progress-thickness`。
  - 环的直径、底槽色、进度色与端点形状走令牌（`--xh-progress-size` / `-track` / `-range` / `-linecap`），几何由连接层算好写进标记，皮肤只上色。

  顺带两处修正：

  - 退化输入不再算成满进度：`max` 不为正或不是数时回落 100，`value` 不是数时按 0 处理（此前 `max=0` 会让进度算成满格）。
  - 线形的长度不再取整：`value=3 / max=8` 由 38% 改为 37.5%，相邻两档不会再看起来一样长。

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

- 9548330: 新增 `scrollbar` 组件：自绘滚动条，挂在**任意一个**滚动容器上——表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行，不必是本组件的后代。此前这套东西焊在 `scroll-area` 里，只有连视口带内容一起交出去的场景用得上。

  解剖 `root` / `track` / `thumb` 三层必需、`corner` 可选（横竖两条同时摆着时写在其中一条里补交叉口，配合 `gutter` 让两条各自让出那一格）；四种露面时机（`auto` / `always` / `scroll` / `hover`）带收起延时；拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限、成段的 `scroll-start` / `scroll-end` 与 `drag-start` / `drag-end` 都在库里。`focusable` 打开后滑块进 Tab 序、报 `role="scrollbar"` 与三个 `aria-value*`，方向键 / 翻页键 / Home / End 可用；缺省不进 Tab 序也对读屏隐藏——滚动本身由滚动容器报，同一件事没必要报两遍。触屏（粗指针）上默认交给原生滚动，整条不画并带 `data-native`，`forceVisible` 打开才画。收起不再打 `hidden`，而是 `data-state=hidden` 由皮肤淡出（`visibility` 随退场播完才收），露出同样淡入；根上另有 `data-hover` 标指针在不在这一片。

  **`scroll-area` 改由 `scrollbar` 组装。** 滚动区不再有自己的机器：它是视口加两条 scrollbar——`scrollbar` 角色节点是那条滚动条的挂载点、同时充当它的根，里面照 scrollbar 的写法摆 `track` / `thumb` / `corner`（戴 `data-scope="scrollbar"`），显隐、拖动、键盘、几何、触屏原生、淡入淡出全是 scrollbar 那一套，两个组件共用一份滚动条。Vue 新增 `XhScrollAreaTrack`；交叉口 `corner` 改写在竖条的挂载点里，两条都显形时才露；`scroll-area` 新增 `size` / `forceVisible`；视口的占道改打在视口自己身上（`data-lane-vertical` / `data-lane-horizontal`），不再依赖 `:has()`。原 `--xh-scroll-area-thumb-*` / `-bar-*` / `-corner-bg` 那几个槽随之归到 `--xh-scrollbar-*` 名下；`scrollAreaMachine` / `ScrollAreaSchema` / `SCROLL_AREA_*` 导出不再有，连接层改收两台 scrollbar 机器与 props（`scrollAreaScrollbarProps` 给出每台的 props）。挂了自绘滚动条的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此藏掉原生滚动条的外观——表格放进滚动区即可滚（吸顶表头与吸附列钉在视口上），虚拟滚动的视口给个 id 用 `controls` 挂上即可。

  滚动容器换了会自动把监听挪过去（`scrollable` / `controls` 指向另一个节点、或条件渲染的容器重建）；查不到时投一条 `scrollbar.missing-scrollable` 诊断，不静默，容器后到时调一次 `api.measure()` 即接上。容器里内容长短变了会自动重量（`MutationObserver` 盯着子树，一拍内合并成一次），量不到的场合另有 `api.measure()`。

- abe790b: 滚动条新增 `scroll-hover` 档，并把它定为缺省档。

  **新增 `'scroll-hover'`**：滚动时露出，指针进入滚动容器或滚动条时也露出；指针占着容器时滚动只重画滑块、不起收起倒计时，指针离开或停手满 `hideDelay` 才收起。它是 `hover` 与 `scroll` 两档显形条件的并集，与那两档一样浮在内容之上——`data-lane-*` 的判据只认 `auto` / `always`，视口宽度一点不减（横条同理不占高度）。

  **缺省档由 `'hover'` 改为 `'scroll-hover'`**：`scrollbar` 与 `scroll-area` 不写 `type` 时都走新档。显形集合是原缺省档的严格超集，没有一条本来看得见的滚动条会消失；占道与否、触屏交给原生滚动那一路都不变。

  **需要跟着改的代码**：对 `ScrollbarType` 做穷尽 `switch` / 映射表的地方要补 `'scroll-hover'` 分支；读 `ScrollbarApi.type` 或 `data-type` 并按值分派的代码会收到这个新值。

  状态机的两个判据改了名：`isHoverType` → `showsOnHover`、`isScrollType` → `showsOnScroll`（原名在新档下会读成谎话）。判据名只在机器内部与文档的「状态机」小节露面，不进公开 API。

  日志的视口那条 `scrollbar-gutter` 收窄到「还在用原生条」的情形：带 `data-xh-scrollbar` 的容器原生条已被藏成零宽，空道对它没有布局作用。没挂自绘条时空道照留，原生滚动条出现与消失仍不推动文字。

- 35c9b65: 四家分段控件（date-field · time-field · date-picker · time-picker）的盒内布局统一。

  **解剖新增 `segment-group`**：包住全部段位与作者写在段间的分隔符。date-field / time-field /
  time-picker 三家新增这个部件，date-picker 已有的分段容器 `input` 改名为它——四家从此同名同职。
  time-picker 的 `input` 仍是段位本身（多实例），语义不动。

  破坏性改动：

  - `date-picker` 的 `input` 部件改名 `segment-group`，不留别名。
    - `getInputProps` → `getSegmentGroupProps`；`DatePickerInputProps` → `DatePickerSegmentGroupProps`。
    - Vue `XhDatePickerInput` → `XhDatePickerSegmentGroup`。
    - WC `@csspart input` → `@csspart segment-group`（作者标记写 `data-xh-part="segment-group"`）。
  - `--xh-time-field-segment-fg-placeholder` → `--xh-time-field-placeholder-fg`；
    `--xh-time-picker-segment-fg-placeholder` → `--xh-time-picker-placeholder-fg`。
  - `--xh-time-picker-column-max-h` → `--xh-time-picker-column-h`（列改定高）。
  - `--xh-date-picker-content-p` → `--xh-date-picker-content-py` / `-px`；
    `--xh-time-picker-content-p` → `--xh-time-picker-content-py` / `-px`。

  作者要把段位与分隔符挪进 `segment-group` 里，清空钮与展开钮留在 `control` 直属：

  ```html
  <div data-xh-part="control">
    <div data-xh-part="segment-group">
      <span data-xh-part="segment"></span>
      <span>:</span>
      <span data-xh-part="segment"></span>
    </div>
    <button data-xh-part="clear-trigger"></button>
  </div>
  ```

  行为与外观：

  - 尾部按钮一律靠框内末端，靠 `segment-group` 的 `flex: 1 1 auto` 顶；
    time-field 清空钮与 time-picker 展开钮的 `margin-inline-start: auto` 删掉。
  - 四家 `control` 的 `gap` / `block-size` / `padding-inline` / `min-inline-size` 逐条同值，
    `gap` 随尺寸档走 `--xh-control-gap-sm/md/lg`。
  - 时间列定高：`time-picker` 的 `column` 与 `date-picker` 的 `time-column` 走 `--xh-viewport-h-sm`，
    两家的快捷选项列同档；两家浮层补上最大高度。
  - 段位内衬统一 `--xh-space-1`；标题不再写 `cursor`；`:focus-within` 一律带 `:not([data-disabled])`；
    time-picker 聚焦时补画聚焦环；图标尺寸随尺寸档走 `--xh-glyph-size-sm/md/lg`。

- bbc3431: select 浮层多出一个底部操作区：「新建」「全选」这类按钮终于有地方放了。

  原来放不进去有两条硬理由，都不是样式能绕的：`content` 既是 `role="listbox"`
  （而 listbox 只许拥有 option 与 group，塞按钮进去是违规），又是那个 `overflow-y: auto` 的滚动容器
  （放进去的按钮会跟着条目滚走）。所以这次把两件事拆开：

  - **`content` 退成浮层外壳** —— 描边、底色、阴影、整体尺寸与键盘收口归它，它自己不滚。
  - **新增 `list` 部件** —— `role="listbox"`、条目的拥有关系、滚动与那个「无锚点时兜底的 Tab 位」全在它身上。
  - **新增 `footer` 部件** —— `list` 的兄弟。因此它既不进列表框的拥有关系，方向键与连打检索也走不到它，
    条目多到要滚时它仍贴在下沿不动。

  **破坏性变更（alpha 期）**：条目现在要写在 `list` 里。

  - Vue：`<XhSelectContent>` 与条目之间加一层 `<XhSelectList>`；底部操作区用新增的 `<XhSelectFooter>`。
    只传 `collection`、不写插槽的那条路由组件自己铺好，一个字都不用改。
  - Web Components：`<div data-xh-part="content">` 里加一层 `<div data-xh-part="list">` 包住条目。
    `list` 已列进 `requiredParts`，忘了写会在诊断通道上报 `wc.missing-part`，不会静默丢掉列表框语义。
  - `trigger` 的 `aria-controls` 随之改指 `list`（它才是那个列表框）。

- 70fe4bb: `useStickToBottom` 交出整个句柄，并在节点到位后自动重绑。

  原先只返回状态 ref，句柄上的 `scrollToBottom` / `retarget` 被吞掉。丢的不只是便利：
  原语在建好那一刻就绑一次，而 setup 阶段模板 ref 还是 null——包装既不重绑、
  又不把 `retarget` 交出来，这个 use 在最常见的用法（两个 getter 读模板 ref）下
  根本没挂上，状态永远停在初值。

  返回值改为 `{ state, scrollToBottom, retarget }`，并 watch 两个 getter，
  节点变了就重绑（写法同 `useThread`）。「回到底部」按钮现在直接 `scrollToBottom()` 即可。

  **破坏性**：原来的 `const state = useStickToBottom(...)` 要改成 `const { state } = ...`。

- f942e75: 表格补列偏好：一份可序列化的状态 + 几个写入口。

  ```ts
  interface TableColumnPreference {
    order?: string[]; // 列序
    hidden?: string[]; // 藏起来的列
    widths?: Record<string, number | string>; // 列宽覆盖
    sticky?: Record<string, boolean | "start" | "end">; // 冻结覆盖
  }
  ```

  `columnPreference` 给定即受控，`defaultColumnPreference` 非受控，
  变更走 `onColumnPreferenceChange`。写入口四个：`setColumnHidden` / `moveColumn` /
  `setColumnWidth` / `setColumnPreference`。

  **存到哪儿归使用者**——存 localStorage、存后端、跟着用户设置同步，都是应用的事；
  把存储通道焊进组件库只会让它绑死一种后端。库只负责把偏好算进生效列。

  三条语义值得单说：

  - `order` 只列一部分也成立：列到的排在前面，没列到的按原顺序跟在后面，
    于是「把某一列挪到最前」不必把全表列一遍。
  - 隐藏列**不占列号**，其余列跟着重排——让它继续占，读屏会报出一个数不到的格子。
  - 前缀列不受偏好摆布：它们是结构性的，由 `prefixColumns` 说了算。

- 9b8a795: 表格补前缀列、树形子行与行号。

  **前缀列**：`prefixColumns: ['index', 'select', 'expand']` 按给定顺序插在最前面，
  并**占住列号**——不占的话右侧所有列的 `aria-colindex` 会整体串位，而这正是使用者
  手工往 `columns` 里塞假列的原因。作者照 `api.columns` 渲染即可，每一项自报 `kind`。
  默认一列都不插，现有用法一行不用改。

  **树形子行**：`TableRowDef.parentId` 指父行。有子行的行不再产出详情行——
  一行不可能同时既展开出子行、又展开出一块详情。`aria-level` / `aria-posinset` /
  `aria-setsize` 从写死的 1 与 2 改成按真实层级给。

  **行号** `api.rowNumber(rowId)`：

  - 平表是**分页全局序号** `(page - 1) * pageSize + 可见序`，翻到第二页不会又从 1 开始；
    `page` / `pageSize` 只用来算序号，不参与切片（切片归调用方或分页组件的 `api.slice`）。
  - 树形是**大纲编号**（`1` / `1.1` / `1.2`），取的是「在父的 children 里的下标」
    而不是可见序：**收起某一枝时，仍在场的行编号一个都不变**。取可见序的话收起一枝，
    其后所有行的号会整体前移，用户看到的是「序号跳了」。

- f4d3708: 轻提示改成短消息的样子：顶部居中、宽度包着内容、一行图标加一句话。

  上一版把 toast 从通知卡片收窄成操作反馈时只动了结构，皮肤还是照着卡片那份抄的——
  定宽 320px、竖排、起始侧一条 4px 语气色条、行尾一颗叉。一句「已保存」于是撑成一个
  方块，右边留着一大片空白，看着仍然像一则公告。

  现在它是这样：

  ```
  ┌──────────────────┐
  │  ✓  已保存        │   ← 贴着文字收缩，顶部居中
  └──────────────────┘
  ```

  - **收缩包裹**：`inline-size` 的默认值从 `--xh-overlay-max-w` 改成 `auto`，
    上限压在 `min(48rem, 100%)`，长文案在上限处换行、仍然居中。
  - **单行横排**：`flex-direction` 去掉，`align-items: center`；标题吃掉剩余宽度，
    操作钮与叉自动落到行尾（两者不再 `align-self: flex-start`）。
  - **矮一档**：纵内衬从面档（12px）换成控件档 `--xh-field-py`（8px），条子高 39px，
    与 Element Plus message 的 39px 齐平、比 Ant Design message 的 40px 矮 1px。
  - **语气走淡底**：底与描边取语气层的 `--xh-_tone-subtle` / `--xh-_tone-border`
    （与 alert 同一套口径），正文留中性——正文也跟着兑成语气色的话，绿字压绿底是整条里
    对比度最差的一处。起始侧那条 4px 色条随之删除。
  - **字号回到正文档**：13px → 14px；标题不再加粗、不再换行高，一句话的反馈没有主次之分。
  - **状态字形不带圆底**：服务档的默认模板改用新的 `typeGlyph`（16px 裸字形，颜色取
    `--xh-_tone-fg`，与 alert 的状态图标同档），圆底徽记 `typeBadge` 留给对话框那种有余裕的版面（通知的类型字形由皮肤在 `item-indicator` 上画）。
  - **到点自己走的不出关闭按钮**：`createToastService` 的默认模板据此分两档——
    会自己消失的不出叉（三家参考实现都是这样），`loading` 与 `duration <= 0` 这种走不掉的
    反过来默认出叉，否则界面上一个可点、可聚焦的节点都没有。两档都能用 `closable` 显式改口。

  **破坏性**：删掉 `--xh-toast-accent` 与 `--xh-toast-accent-width` 两个覆盖槽（色条没了）。
  另有四个槽的默认值变了：`--xh-toast-w`（20rem → auto）、`--xh-toast-bg`
  （`--xh-bg-surface-raised` → 语气淡底）、`--xh-toast-border`（中性 → 语气描边）、
  `--xh-toast-title-font-weight`（semibold → regular）；`--xh-toast-close-size` 的默认值
  从 `--xh-control-h-sm`（28px）降到 `--xh-control-action-size`（24px）。
  靠「轻提示是 320px 定宽」做过对齐、或依赖默认那颗叉关闭常驻提示的用法要跟着改。

- a69cead: 树补一条 `leafOrientation`：末端那一层可以横排。

  只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层。一个菜单下十几个按钮，
  横排一行铺完，省掉大量纵向翻找：

  ```vue
  <XhTreeRoot :collection="menus" leaf-orientation="horizontal" />
  ```

  **中间层与整棵树恒是竖排，不提供开关。** 它们承载的是层级本身，横过来层级就读没了。
  判据是「这一层不再往下分」而不是「深度等于几」：同一棵树里各枝深浅不一，
  按深度判会把浅枝的中间层也横过来。

  **方向键不跟着改。** 树上左右是层级操作（收起 / 展开、回父层 / 进子层）、上下走可见行，
  这是 treeview 的规范语义，横排只是排布。

  顺带修一处：叶子行在竖排下会自己补出「箭头那一格」与同级分支对齐，横排下补出来的
  是节点之间的空隙而不是层级，那条规则因此按行盒**所在的那层容器**判定方向。

- e7d404a: 树补 `multiple` 布尔，`selectionMode` 转为它的旧写法。

  `TreeSelectionMode` 只有 `single | multiple` 两个取值，与一个布尔完全等价；而同族的
  `tree-select` 与另外六家（accordion / cascader / combobox / listbox / select / toggle-group）
  表达同一件事时用的都是 `multiple?: boolean`。同一个概念，树上要写
  `selection-mode="multiple"`、下拉树上要写 `multiple`——记不住是必然的。

  树现在也收 `multiple`（Vue 的 prop、自定义元素的 `multiple` 属性、api 上的 `multiple` 布尔）。
  `selectionMode` 保留一个大版本，标为 deprecated；**两者同时给时以 `selectionMode` 为准**，
  与 listbox 的规矩一致——所以已经在用 `selectionMode` 的代码行为一点不变，不必赶着改。

  `listbox` 的 `selectionMode` 不动：它有 `single | multiple | extended` 三个取值，
  不是布尔能表达的。`calendar` / `date-picker` 的同名 prop 同理。

- 4b949c2: 摇树第一次真的生效：只用一个组件不再拖来整个库。

  此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效——
  使用者只 `import { XhBadge }`，打出来的东西和全量 barrel 一样大。

  产物改为保留模块结构（每个源文件一份产物），实测（esbuild 打真实 dist，gzip）：

  | 用例                | 改前      | 改后         |
  | ------------------- | --------- | ------------ |
  | 只用 `XhBadge`      | 168,947 B | **538 B**    |
  | 只用 `XhButton`     | 168,947 B | **1,029 B**  |
  | 只用 `XhDialogRoot` | 168,947 B | **11,374 B** |
  | 全量 barrel         | 173,005 B | 178,768 B    |

  单组件占全量从 **97.7% 降到 0.3%**。全量 barrel 略涨 3%，是模块边界不再被合并的代价，值得。

  **判据补上了此前没有的分辨力。** `.size-limit.json` 原有 18 条全是整包 barrel，改回单入口不会让任何
  一条变红。新增三条带 `import` 字段的按组件预算（badge / button / dialog），退回打包形态时它们会
  立刻超标一个数量级。

  顺带修掉两处被这次改动照出来的既有缺陷：

  - **公开面基线虚高 81 个名字。** `build-public-surface.mjs` 抽类型名的正则里 `export` 是可选的，
    于是把打包版 d.ts 里那些**没有导出**的内部类型别名（`AccordionProps` 这类局部别名共 72 个）也算
    成了受 semver 约束的公开名。实测确认它们从来就 import 不到（`TS2305: has no exported member`）。
    正则补上 `export`，基线随之收敛。
  - **文档生成器只认 `declare`。** 拆包后 barrel 里不再有 `declare`，导致 102 页组件文档的
    「Vue 组件」整列凭空消失。改成 import 与 export 两种形态都收。

  新增一个公开类型 `TweenEasing`：`NumberAnimationEasing` 本就是它的别名，拆包后别名要能被命名，
  这一支就必须公开。

- 4abe899: 统一性收口的头两批：先立门禁让跑偏能红，再补语义令牌把皮肤里的原语引用与互异的字面量收成一处。

  **海拔改按角色走。** `--xh-elevation-0…4` 五档删掉，换成三个角色：`raised`（静态抬起面：卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）、`floating`（锚定浮层：下拉、菜单、popover、hover-card、tooltip）、`sheet`（遮罩式与通知：dialog / drawer / toast / tour / floating-panel / float-button / back-top）。深色主题的三档更重、外加一圈 1px 浅描边，暗底上浮层才分得出层。34 份皮肤全部迁过去，`check-elevation-role` 校验每处阴影都走角色、且 27 个浮层/遮罩面的角色与部件对得上。这是公开面的删减，基线已推。

  **字号不再下探原语。** 新增 `--xh-control-font-sm/md/lg`（控件主文字，与 `--xh-control-h-*` 同构按档走）、`--xh-control-caption-sm/md/lg`（控件里的次级文字：提示、计数、快捷键、清空钮，比同档主文字低一级）、`--xh-text-heading-1/2-*`、`--xh-text-caption-size`、`--xh-text-secondary-size`。皮肤里两百三十处 `--xh-font-size-*` 引用全部换成语义档；typography 的六级标题与 rating 的星标是字号阶梯本身，登记为例外。`check-text-scale` 守住。

  **默认宽度、内衬、轨道、折叠面的共享字面量收成令牌。** `--xh-control-min-w`（12rem）统一了 select / combobox / tree-select / cascader / color-picker / date-picker 六个触发器此前的六个值，time-picker / text-field / date-field / time-field / password-input 五家此前没有任何宽度声明，现在同样接上；`--xh-surface-py/px-sm/md` 统一了 dialog / drawer / tour / floating-panel / toast 的内衬；`--xh-track-thickness` / `--xh-track-thumb-size` 给滑杆与进度条；`--xh-nav-link-max-w`、`--xh-viewport-max-h`、`--xh-motion-scale-drag`（减弱动效归 1）、`--xh-glyph-size-text`（跟文字走的字形尺寸）、`--xh-control-box-sm/md/lg`（pin-input 的方格，随 compact 收）、`--xh-switch-track-h-*`、`--xh-syntax-string/number/keyword`（code-block 与 json-viewer 的语法色，随主题明暗切换，皮肤里不再有 hex 字面量）。`check-shared-slots` 新增「同后缀跨组件字面量互异也报」。

  **聚焦态描边统一成一派。** 此前三派：描边不变只画环、描边跟着环色走（语气轴在这一派整个失效）、只画环不管描边。现在 21 份输入类皮肤都写 `border-color: var(--xh-<c>-<part>-border-focus, var(--xh-_tone, var(--xh-border-control-focus)))`，新令牌 `--xh-border-control-focus` 缺省等于 `--xh-border-control`；time-field 聚焦补上了此前缺的环。`check-focus-ring` 加校验。

  **图标尺寸接线。** 38 份画兜底字形的皮肤在 root（浮层族在 content）上声明 `--xh-icon-size: var(--xh-<c>-icon-size, var(--xh-glyph-size-text))`，兜底字形的盒同样按它量——作者往指示符槽塞 `<XhIcon>` 时不再从 1em 跳到 20px。`check-icon-size` 守住。

  **几何修正。** pin-input 的方格此前缺省引的是 lg 档高度、sm 档引 md；segmented 横排外盒此前 38px（item 32 + 轨道内衬 + 描边），现在外盒本身即一档控件高、段撑满轨道内侧；checkbox 的方框锚在 `--xh-control-indicator-size` 上随 compact 收；checkbox-group 的指示符不再是 16px 字面量。radio-group / checkbox-group / composer 的禁用态去掉叠加的不透明度（与容器一起变淡会把对比度压穿）。

  **门禁。** 新增 `check-stroke-scale`（描边宽度只走 `--xh-stroke-*` / ring）、`check-keyboard-suites`（键盘表非空 ⇒ 一致性套件存在且两个适配器都登记）；`check-control-height` 按「组件 → 控件本体部件」显式管辖（button / toggle / segmented / pagination 等此前在门禁外）并校验 sm/md/lg 档位与 `data-size` 对应；`check-disabled-contrast` 改正则并加跨块判定；`check-shape-scale` 扩到逻辑角与私有槽；`check-keyframe-refs` 增扫适配器源码里的内联动画名（反馈服务的加载徽记改用 Web Animations，不再依赖某份皮肤在场）；`check-state-vocabulary` 接上 `state-vocabulary.json` 真源（`data-state` 的 43 个取值分 9 个族，connect 字面量与皮肤选择器两头对表，并报告「发射但零引用」的属性）；`check-token-refs` 禁皮肤里的颜色字面量。

  **套件。** 补 image-viewer（8 行键盘表，Tab 循环两行 jsdom 豁免）与 side-nav（10 行含折叠态弹出）的一致性套件，Vue 与 WC 两侧登记。

- c5c5f7f: 两个适配器接上视觉层，各自走独立子入口 `@xihan-ui/vue/backgrounds` 与 `@xihan-ui/web-components/backgrounds`。

  `@xihan-ui/backgrounds` 声明为**可选 peer**：主入口一行都不引它，不用视觉效果的应用不会因为装了适配器
  而多出一个 WebGL 引擎。

  Vue 侧三种用法，从轻到重：`v-background` 指令、`XhBackground` 组件、`useBackground` 组合式函数。
  指令用在组件上时 Vue 会把它落到该组件的单一根元素上，所以给现成组件加背景不必改动组件本身。

  WC 侧是 `<xh-background>`：元素自身就是画布容器，内容照常写在里面，效果铺在内容底下，
  画布 `pointer-events: none` 不挡交互。参数走 `.params` property，点云走 `.setCloud()`。

- 35c9b65: 相似组件与组合组件的视觉、动效、行为收成一套口径。

  **盒的定义统一了。** 此前 16 个输入 / 选择控件有三种「盒」：9 家由 `control` 画描边与底、5 家由 `trigger`（一个 `<button>`）当盒、2 家由 `input` 自画。盒是 button 的那 5 家（select · cascader · tree-select · popselect · color-picker）没法把清空钮放进框里，只能贴在框外——这就是「清空钮位置不统一」的总根因。现在判据只有一条：**解剖里有 `control` 就是盒**，`trigger` 退化成盒内那颗 `flex: 1 1 auto; border: 0; background: transparent` 的按钮，聚焦环改画在 `control:focus-within` 上。cascader / tree-select / popselect / color-picker / text-field 的解剖新增 `control` 部件。

  **尾部按钮一律在框内最右。** 盒内布局恒为「内容区 `flex: 1` → 尾钮组 `flex: none`」。段位并排、没有单一容器的四家（date-field · time-field · date-picker · time-picker）新增 `segment-group` 部件把段位与分隔符包起来当内容区（date-picker 原有的 `input` 分段容器改名 `segment-group`，四家从此同名同职），`margin-inline-start: auto` 那套 hack 删掉。行内动作钮（清空 / 展开 / 明暗切换 / 加减）一律 `--xh-control-action-size` 方钮——number-field 的加减钮与 password-input 的明暗钮此前是「贴边的控件高钮」。

  **并排成对的面板定高。** 新增 `--xh-viewport-h-sm/md/lg`（12/16/24rem，compact 同比例收）。transfer 两侧列表此前是 `min 8rem / max 16rem`，条目搬走后整个组件跟着变矮——现在定高 `--xh-viewport-h-md`，左右等高、空侧也占满。cascader 的列、date-picker / time-picker 的时间列同样定高；单个浮层面板仍内容驱动，但补上了此前缺失的高度上限。

  **菜单族三家逐条同值。** `menu` / `menubar` / `context-menu` 共用同一台机器，皮肤却各写各的：menubar 根本没有 `item[data-state='open']` 这条规则，所以「发送到…」展开时不像 menu 那样加粗高亮。现在条目内衬 / 字号 / 圆角 / 行高 / 展开态 / 高亮态 / `content` 外观 / `separator` / `group-label` 全族同值，menu 补齐 `group` / `group-label` / `separator` 部件，子菜单箭头走字形令牌。navigation-menu 与 side-nav 的弹出面板按同族口径归队。

  **浮层面板与输入族小件归队。** `content` 一律双槽内衬 + 族档 min-w / max-w；cascader 的 48rem、color-picker 的 15rem、tour 的 22rem 等裸值改令牌（新增 `--xh-overlay-max-w-xl`）；label 颜色与间距、图标尺寸随档、聚焦环私有槽（invalid 时变红）、`:focus-within` 的禁用守卫、disabled / readonly 的三样齐——逐条统一。password-input 的明暗钮用上了新的 `--xh-glyph-mark-eye` / `-eye-off` 字形令牌。

  **门禁**：`check-control-box`（盒结构 12 条判据）、`check-panel-height`（面板高度只走滚动面令牌、并排面板必须定高）、`check-family-parity`（菜单族 / 分段族 / 下拉族 / 气泡族逐条同值）。

  公开面：五家 `--xh-<c>-trigger-*` → `--xh-<c>-control-*` 槽改名、date-picker 的 `input` 部件与 `XhDatePickerInput` 组件改名 `segment-group` / `XhDatePickerSegmentGroup`、`--xh-hover-card-font-size` 与 transfer 的 `-list-min-h` / `-list-max-h` 删除，共 43 项，基线已推。

- 1eed29d: 补两条 Vue 侧的逃生口：只注册不渲染的快捷键，以及控件藏在薄封装里的字段接线。

  **新增 `useHotkeys`**。此前 hotkeys 只有渲染键帽的组件形态，全局快捷键（Ctrl+K 开搜索、Alt+L 锁屏）只想要注册、不想要键帽，只能自己写原生 `keydown` 监听——还得自己处理 Mac 上 Option 会改 `event.key`、必须用 `event.code` 兜底这类事。

  组件里那段「算 API + 挑监听节点 + 绑 keydown + 解绑」整段移进组合式，`XhHotkeys` 改成它的消费者，一份逻辑两种形态。`target` 除组件已有的 `'document'` / `'parent'` 外，还收一个返回节点的函数，用于挂在滚动容器或 `window` 上。一次调用管一组组合，注册四条就调四次——与组件形态一比一对齐，免得两种形态的 `preventDefault` / `enabled` / `platform` 语义各走各的。

  `XhHotkeys` 的 props、emits 与渲染结果一个都没变。

  **`XhFieldControl` 新增 `asChild`（默认 `true` = 今天的行为）与配套的 `useFieldControl`**。字段默认把接线属性合到控件槽里唯一的子节点上；子节点是组件时合的是组件根，而薄封装的根往往是 `div`。标签的 `for` 只对可标注元素生效，指到 `div` 上什么也不会发生——点标题聚不了焦、读屏报不出名字，**而且不报错**。

  现在封装内部调 `useFieldControl()` 取到那组属性，绑到真正可聚焦的节点上，外层写 `:as-child="false"` 让父节点别再合一遍（合两遍会在页面上留下两个相同的 `id`）。`useFieldControl` 在字段外返回空对象，封装照样能单独用。

  `asChild` 这个词是库里现成的——13 个组件的触发器都用它表示「把属性合到作者的子节点上」，这里语义一致，只是这个部件此前把它写死成了真。

  顺带导出此前一直漏在包外的 `provideField` / `useFieldContext`，并新增 `useOptionalFieldContext`。

  Web Components 侧不需要对应改动：那边是 Light DOM，作者本来就把 `data-xh-part="control"` 写在真控件上。

- 520b847: 周序号成为一等部件 `week-number`，不再由使用者自己拼一列出来。

  上一版只把数字算出来（`panel.weekNumbers`），列宽得作者用行内 `grid-template-columns` 自己撑，
  库不管它的皮——同一份东西在不同项目里会长得不一样，这不是组件库该留的样子。

  - 解剖新增 `week-number`（可选部件，不写即不渲染），语义是这一行的表头（`role=rowheader`）：
    在 `role=grid` 里，一行的标号本就该是 rowheader，而不是又一个可选的格子
  - `getWeekNumberProps` / `getWeekNumberText` 两条，文字由两个适配器各自填，保证同构；
    表头那一格是占位、不带值，解析不了不抛、给空串占住列宽
  - 皮肤接管列宽与字样：摆了周序号格的行自动让出行首一列
    （`--xh-calendar-week-number-w`，默认 2.25rem），数字比日子小一号、颜色压下去、不跟着选中态走
  - 新增 `XhCalendarWeekNumber` / `XhDatePickerWeekNumber`；WC 侧写
    `<span data-xh-part="week-number" value="行首那天">` 即可

  选择器那条列宽规则写的是 `:not([hidden]):has(...)`——同特指度的规则谁在后面谁赢，
  不带这一道的话收起态会被这条 `display` 掀开（上一轮刚栽过一次，已有门禁拦着）。

### Patch Changes

- 09b5ad8: 「collection 铺开的结构凑齐必备部件」这条判据改成机检，并把三档语义写进文档。

  `collection` 收了数据不等于会替你渲染结构，而这件事此前既没有对外判据、也没有任何东西守着：
  14 个组件里 13 个在根上代铺、popselect 只在 content 里铺，使用者只能一个个试。
  官网落地时那棵树就是把数据写了一遍、DOM 又手码了一遍，两份得自己保持同步。

  新增 `tests/collection-required-parts.spec.ts`：逐个组件只交 `collection`、不写任何部件，
  断言铺出来的 DOM 含该组件 `meta.requiredParts` 里的每一个部件。少一个就是渲染出一个
  看着正常、其实不工作的组件——浮层打不开、方向键找不到条目、同一份结构写到自定义元素那侧
  会报 `wc.missing-part`。给新组件加代铺时先往这份测试加一行，铺漏了当场红。

  顺带查出并钉住两处此前没人测的差别：`popselect` 的铺开落在 content 部件里而不是根上
  （`<XhPopselectRoot :collection>` 单独用什么都不出），`mention` 的候选浮层没有 `defaultOpen`、
  敲下前缀字符才铺开。

  `guide/anatomy.md` 补「collection 管不管铺开结构」一节，三档逐个列出组件名，
  并写明判据是结构的自由度：扁平集合的 DOM 形状是确定的，代铺挡不住任何写法；
  层级与多区（`tree` / `cascader` / `transfer`）的结构有太多合理变体，代铺只会逼作者推翻重写。

- 7da1272: 废弃提示落地：五种没有 IDE 提示的介质在 dev 里经诊断通道发 `warn`。

  版本政策承诺过「dev 构建下经诊断通道发 warn」，此前一直未落地。现在 `@xihan-ui/kernel` 新增
  废弃登记表与探测：维护者 `registerDeprecation({ medium, match, message, replaceWith, until })` 登记
  一条，消费方的旧用法在 dev 里变成一条带迁移方向的诊断。

  五种介质与探测面：

  - `css-var` / `layer` / `selector` —— 样式表（`<style>` 文本与 CSSOM，跨域样式表静默跳过）
  - `attribute` —— DOM 里 `xh-*` 元素上的废弃 attribute（业务元素同名属性不误报）
  - `part` —— 作者写的 `data-xh-part` 角色名，由 Web Components 适配器的部件契约校验带上下文投递

  两个适配器都在 dev 里自动启动探测（Vue 在第一个组件建机器时借路启动一次，Web Components 在
  `defineXhElements()` 里启动），生产构建跳过；登记表为空时扫描器直接早退，零开销。同一废弃名
  无论命中多少条规则只报一次（通道去重）。登记表当前为空，发废弃时随 changeset 一起登记第一条。

- 82afde0: 套进表单字段的复合控件念得出字段的标签了。

  复合控件的可聚焦部件自带 `aria-labelledby`，指的是它自己的 `label` 部件。套进字段时
  作者用的是字段的标签、组件那个 `label` 部件根本没渲染，这条引用于是悬空——按 accname
  规则悬空 IDREF 直接跳过；名字也回退不到 `label` 的 `for`，因为 `for` 指的是封装根那个
  `div`，只对可标注元素生效。结果是焦点所在的那个控件**一个名字都没有**：下拉只念得出
  当前值，输入框连值都没有，读屏进去就是一句「编辑框」。

  `FieldApi` 补 `labelId`；Vue 侧新增 `useFieldLabelWiring()`，11 个单一可聚焦控件的封装
  在真控件那一层把字段的标签**并进**名字链最前面（不是覆盖：只换上去会挤掉当前值）。
  `check-field-wiring` 一并钉住这半边。

  Web Components 侧还没有字段接线这一层（状态那半边同样没有），此次不涉及。

- ed01a81: 框架元数据：名称、版本与运行时信息的单一事实源，与 XiHan.Framework 的 `XiHanMetadata` 同构。

  `@xihan-ui/kernel/metadata` 子路径新增 `XIHAN_UI_METADATA` 与 `XIHAN_UI_VERSION`（与 Framework 的独立 Metadata 包同理，主入口保持结构原语，不背它的体积棘轮）：

  - **静态常量集中维护**：名称 / 显示名 / 版权 / 作者 / 组织 / 仓库 / 文档 / 许可证 / 关键词 /
    支持平台 / 适配器清单 / 标志 / 寄语，全部 `Object.freeze`。
  - **版本从 package.json 派生**：`version` 与 `majorVersion` / `minorVersion` / `patchVersion` /
    `prerelease` 自动解析，锁步发版下改版本只改 package.json 一处。
  - **运行时信息**：`getRuntimeInfo()` 报 dev/prod 模式与 SSR 状态；两个适配器启动时用
    `registerRuntimeHost()` 登记自己，元数据据此报出「运行在哪个适配器、什么版本」——
    Framework 侧 EntryAssembly 概念在浏览器语境下的对应物。
  - **输出**：`getMetadataSummary()` / `getMetadataDetails()` 返回格式化文本（宿主行如实报
    锁步一致性），`print` 版只在 dev 出声，生产静默。
  - **启动横幅**：对齐 Framework 的 `XiHanApplicationBase`——引用即打印。适配器启动时
    （Vue 首个组件建机器 / WC 注册元素）自动打一次 Logo + 摘要（整页一次、生产静默），
    `setMetadataAutoPrint(false)` 可关。

  文档见新章节「框架元数据」（guide/metadata）。

- af56819: 注入键改用全局符号注册表，模块被加载成两份时不再整棵子树白屏。

  `Symbol('xh-select')` 每执行一次就是一个新键。链到工作区的库在 dev server 下重建
  产物后，运行中的模块图会新旧混杂，`context` 模块重新执行一遍就换了键——
  `provide` 拿新的、`inject` 拿旧的，部件当场抛「必须用在 XxxRoot 内」。
  报错指向的是部件本身，与真正的原因隔着十万八千里。

  147 个注入键改用 `Symbol.for`：按字符串查同一个键，两份模块也对得上，
  这类失败于是从「白屏」降级成「照常工作」。

- 9c2704c: 修 XhJsonViewerRoot 的 value 在类型上被推成 undefined：任何跑 vue-tsc 的工程传真实数据都编译不过。

  `type: null as unknown as PropType<unknown>` 这个断言把 `null` 伪装成了 PropType，
  绕开了 Vue 的 InferPropType 中 `{ type: null | true } → any` 那条专为「任意类型」准备的分支，
  于是掉进 `IfAny<V, V, D>` 落到 D —— 也就是 `default` 的类型 `undefined`。
  结果是这个 prop 除 undefined 外什么都不收，`v-bind` 展开也一样被拦（TS2345）。

  运行期一直是好的（`as` 断言会被擦除，`type` 的运行期值就是 null，Vue 不据此校验），
  所以这是纯编译期缺陷；但库自己的示例 demos/json-viewer/01-basic.vue 就过不了类型检查。

  给 default 标注 `as unknown`，推导结果与 headless 契约 `value?: unknown` 对齐。

- 430c3bc: 进度条服务的宿主自己渲染，不再经 provide/inject 拿 api。

  这棵子树是固定的三层、全归服务自己拥有，用上下文传 api 什么也没换来，
  却把「跨模块 provide/inject 必须对得上」加成了一条本可以没有的前提。
  模块被加载成两份时那条链会断，而报错指向的是 `XhLoadingBarTrack` 而不是真正的原因。

  同时把挂载守卫做干净：失败后不再调 `app.unmount()`（`mount` 抛出时 Vue 并没把
  `isMounted` 置真，卸载只会再吐一条警告），并让服务整体惰化——半挂载的树仍订阅着
  响应式状态，继续写它只会让那棵残骸一遍遍重渲，每次都吐一串
  「slot invoked outside of the render function」。

- a321a50: 锁步版本检查:混装版本在 dev 里报 `core.version-mismatch`,不再只靠自觉。

  17 包同版本是硬承诺,但包管理器不会拦「vue alpha.2 + kernel alpha.3」这种跨包组合——
  类型对不上、同一个 `xh-` 标签被两个版本注册直接抛错,全部静默到运行时。现在 `@xihan-ui/kernel`
  导出自己的 `VERSION` 与 `checkLockstepVersion()`,两个适配器在 dev 启动时(与废弃探测同一次
  借路)拿自身版本比对,不一致经诊断通道发一条 warn,生产构建跳过。

- ac885c9: number-field 新增可选 `control` 部件:加减按钮叠进输入框内,与输入框成为视觉一体。

  此前加减钮与输入框是兄弟节点,受 HTML 约束进不了框内,只能三件并排。现在把输入框与两个按钮
  放进 `control` 部件,皮肤把描边、底色、聚焦环(改为 `:focus-within`)整体画在 control 上:
  框内 input 退成透明,减钮在左、加钮在右、输入框居中(顺序由作者模板决定),前后缀图标/文字
  直接流式插在 input 两侧,不用绝对定位;悬停/按下/贴边禁用沿用原有语义色。

  - **Vue**:新增 `XhNumberFieldControl`;`data-disabled` / `data-readonly` / `data-invalid`
    三个状态属性由 connect 落到 control 上。
  - **Web Components**:作者写 `<div data-xh-part="control">` 包裹即得同样的一体式。
  - **不写 control 时完全退回旧观感**:control 是可选部件,旧模板一行不改照常渲染,三档
    variant / tone / size 与旧式并排布局一致。

  一致性测试的 fixture 改成一体的 control 结构,两个适配器的 conformance 同步通过。

- b04e182: number-field 新增 `parse` / `format`：千位分隔符、单位后缀这类带格式的数字，现在不用把组件拆开自己拼了。

  `parse` 把显示串读成数（默认 `Number()`，`'12abc'` 判为非法），`format` 把数写回显示串（默认 `String()`）。
  两个方向必须互逆——`format` 出来的串要能被 `parse` 读回同一个数，否则按一下加号值就会漂。

  落点分得很清楚：

  - **`parse` 管所有"读"**：步进、取端点、失焦规范化、`aria-valuenow`、`valueAsNumber`、贴边判定，
    全都从它拿数。读屏念的因此是数，不是那串带逗号的显示文本。
  - **`format` 只管组件自己改写显示的那三处**：步进、取端点、失焦规范化。
    用户正在打字时一律不碰——中途补格式会打断光标位置。

  界仍按数比而不按串比，越界时先夹回区间再补格式。作者的 `parse` 返回了非数按 `NaN` 处理、
  `format` 返回了非串退回 `String(value)`，坏的返回值不会顺着流进后续计算。

- 89d8c54: 修四处在真实宿主里才现形的缺陷，`hideOutside` 的入参形状随之变化。

  **嵌套浮层不再被外层罩死。** 对话框里再开一个对话框（或抽屉），内层 portal 到 `body` 之后也是
  `body` 的直接子元素，会被外层背景失活的 `MutationObserver` 一并打上 `inert`——看得见、点不动。
  层注册表新增 `elementsAbove(layer)`，给出栈中位于该层之上的各层全部节点；`dialog` 与 `drawer`
  把它并进背景失活的目标集。

  **破坏性变更**：`hideOutside(targets, scope, options)` 的第一个参数由 `Element[]` 改为
  `() => Element[]`。施加 `inert` 的时机横跨整个展开期，晚于调用时刻才挂载的节点必须也能被算进目标，
  定死的数组做不到。调用点把数组包成箭头函数即可。同时 `LayerRegistry` 新增 `elementsAbove` 成员，
  自行实现该接口的需要补上。

  **破坏性变更**：`@xihan-ui/machine` 的 `Dict` 改为从 `@xihan-ui/kernel` 转出。两个包此前对同一个
  名字给出不同泛型元数（`Record<string, T>` 与 `Record<string, any>`），从哪个包导入会决定
  `Dict<string>` 编不编得过。

  **首屏即展开的对话框与抽屉能服务端直出了。** `rendered` 的初值此前整块圈在「有 document」的分支里，
  服务端算不出它，只发一个 23 字节的空占位：首屏没有对话框、没有可被索引与读屏读到的正文，
  客户端水合时再整棵补出来。初值改取状态机的展开态。

  **没有 window 的宿主里不再抛异常。** `prefersReducedMotion`、`onReducedMotionChange`、
  `createEnvSignals` 的默认参数写的是裸 `window`，而默认参数在函数体的守卫之前求值——三者的注释都
  承诺 SSR 期回落，实际是 `ReferenceError`。改走 `globalThis.window`，签名不变。

- 93fdcb8: pin-input 新增 `pattern`：每格接受哪些字符可以自己定，不再只有 numeric / alphabetic / alphanumeric 三档。

  `pattern` 收一段正则源码，内部补上首尾锚与 `u` 标志后逐个字符整格匹配——作者写 `[0-9A-Fa-f]`
  就够，不必自己写锚点，代理对（emoji 这类）也匹得上。给了它就盖过 `type` 的准入表；
  写坏了（编不成正则）**退回 `type` 的准入表而不是放行一切**，也不抛。

  敲、粘贴、外部 `setValue` 三条写值的路都过同一份准入表。

  `type` 保留原职：它仍然决定移动端弹哪种键盘。准入放宽到字母时记得把 `type` 一并改掉，
  否则弹的还是数字键盘、那几个字符敲不进来——这一条写进了 props 说明与示例。

- 47a3f1d: 命令式服务的宿主挂不起来时，退化成空操作，不再连累调用方。

  轻提示、通知、确认框、进度条这四个服务是从路由守卫、请求拦截器这类地方懒建的。
  那些位置抛异常，后果不是「提示没弹出来」而是**整次导航失败、整站白屏**——
  而报错指向的是浮层部件，与真正的原因隔着十万八千里。
  一条轻提示、一根进度条都不该有这个权力。

  挂载改走一道守卫：失败时发一条说得清的诊断（原始错误留在 `detail` 里）、
  把容器收走、交回 false，服务本次退化成空操作。用户看不到提示，但页面照常能用。

- 902cc49: 不可关闭的标签不再建状态机，挂载开销减半。

  标签的事件只有 OPEN / CLOSE 两个，都从关闭钮或 `setOpen` 来。不给关闭钮时这两条路
  都走不到，状态恒等于 `open ?? defaultOpen ?? true`——一台机器在这里纯属开销，
  而表格一页几十行、每行几个状态药丸就是几百台。

  量过：400 枚标签从 39.1ms 降到 18.3ms，每枚 0.095ms → 0.043ms。

  连接层主体抽成一份，`connectTag`（机器路）与新增的 `connectStaticTag`（快路）
  各调它一次，语义不会漂。受控/非受控两态与机器路逐条一致，包括「受控期间的
  `setOpen` 不许偷偷落进内部值」——那一条只有在宿主把 `open` 撤回 `undefined`
  转非受控的那一刻才看得出来。

- 23bb4a3: thread 补导出 provideThread / useThreadContext，与孪生组件 log 对称。

  thread 与 log 结构完全同构，log 一直导出着这一对，thread 却漏了。
  后果是「用 useThread 自己起一份上下文、再拿官方部件铺 DOM」这条组合路径在 thread 上走不通——
  拿不到 provideThread，XhThreadViewport / XhThreadContent 就 inject 不到东西。

- 8d6e450: 整洁度归队（统一性审计的最后一批）。

  **令牌**：dialog / drawer 的宽度档提为 `--xh-overlay-sheet-w-sm/md/lg`（24/32/48rem）与 `--xh-overlay-drawer-w-sm/md/lg`（16/20/28rem），empty-state / result 的图标档提为 `--xh-glyph-size-xl/2xl/3xl/4xl`；`--xh-control-gap-lg` 此前与 md 恒等，改为 space-3（compact space-2）；补 `--xh-fg-warning` / `--xh-fg-info`（与 success 同构）。tokens README 写明 px 与 rem 的口径，以及「单行控件本体的槽一律叫 control」。

  **皮肤**：number-field 的 `--xh-number-field-input-h` 在 control 上用错部件名，改 `--xh-number-field-control-h`；spinner 三档归 glyph 尺寸族、anchor / pagination / steps / composer / menubar 的内衬对齐 control-px 阶梯；back-top / card / float-button / switch / dynamic-input 的阴影补使用者槽；timeline / typography / field / slider 的字面残留改令牌；30 处与令牌同值却不引令牌的兜底改引（15 处登记理由）；checkbox-group / transfer 的指示符字形与 checkbox 同一配方。菜单与列表族的条目高亮只认 `[data-highlighted]`（菜单族此前还并挂 `:focus` / `:focus-visible`）。

  **无障碍**：select 的触发器按 APG select-only combobox 打 `role=combobox` + `aria-haspopup=listbox` + `aria-controls`（popselect 是按钮式弹出保持 button）；image-viewer 触发器补 `aria-controls`；83 处 `aria-hidden` 统一写布尔；iconOnly 按钮没有 `aria-label` / `aria-labelledby` 时开发模式提醒一次（Vue / WC 把作者写在根节点上的可及名转告连接层）。

  **共享配方**：visually-hidden 的 9 条声明收成 headless 的 `VISUALLY_HIDDEN_STYLE`，六份 connect 引它；七份皮肤各自那份必须与 `visually-hidden.css` 逐条一致。

  **门禁**：`check-literal-fallbacks`（兜底字面量与令牌同值即红）、`check-visually-hidden`、`check-tone-contrast`（自算 oklch → WCAG 对比度，六族 × 两主题 26 组配对，1 组已知例外登记理由）、`check-aria-shapes`（aria-hidden 字符串写法 / listbox 触发器角色）；`check-elevation-role` 增「阴影必须带使用者槽」。

- bb47c3d: time-picker 的上午/下午在浮层里也成列：从此点得中，不必回到输入行敲。

  此前 12 小时制下浮层只排时分秒三列，上下午只有输入行里那一段能改——指针用户点开浮层，
  挑完时与分还得把手挪回段上，一次选值走两个地方。

  - 列的单位与分段输入里的段同名同域（新增 `dayPeriod`），恒排在末位、只在 12 小时制下出现；
    两格写 `'00'` / `'01'`，与这一段在 `aria-valuenow` 上报的数同一个域，
    选中比对、写值换算于是全都复用现成的那条路，浮层里挑与段上按 a / p 落到同一个 `setTimeDayPeriod`。
  - 新增 `getItemText`：格子上的文字改由它给，数字列还是格子自己的值，上下午列按 locale 译成
    「上午 / 下午」。两个适配器都改用它填文本，保证同构。
  - 上下午列跟着 min / max 收窄：当前小时翻到另一半天即出界时，那一格不可选（与时列互为对方的裁剪条件）。
    这与段上按 a / p 的处置不同——段上照写只做越界标注，列里则直接裁掉，两条路本来的语义就不一样。
  - 两端那一段的外角与浮层其余列一致；`granularity` 与它无关，`hour` 档也照排。

  `TimePickerColumn` 因此带上了单位的类型参数（缺省仍是全集，写 `TimePickerColumn` 的地方不用改）。
  date-picker 内嵌的时间面板恒为 24 小时制，用新增的 `DatePickerTimeUnit` 把「没有上下午那一列」写进类型里。

  顺带把 `custom-elements.json` 与 `public-surface.json` 重新生成：前者自 number-field 的
  control 部件落地起就没跟着更新过，后者漏了 kernel 的两个子路径入口。

- ae21590: 75 个组件的插槽写上真类型，`vue-tsc` 从此接得住插槽名与载荷键名的拼写错误。

  组件是渲染函数写的，`.d.ts` 里插槽泛型一直是空的（`DefineComponent` 的 `S` 位是 `{}`），
  于是 `#panel="node"`、`v-slot="{ pages, page }"` 这些载荷在消费端全是 `any`：
  键名写错不报、插槽名写错不报，只在运行期渲染出 `undefined`。props 与 emits 早就有完整类型，
  唯独插槽这一层没有对外描述——而无头库恰恰是靠插槽把控制权交回作者的。

  现在每个带载荷的插槽都有具名载荷类型（`TabsPanelSlotProps`、`StepsRootSlotProps` 这样命名，
  均从主入口导出），组件上声明 `slots: Object as SlotsType<…>`：

  ```vue
  <template #panel="node">{{ node.lable }}</template>
  <!-- TS2551: Property 'lable' does not exist on type 'TabsNodeMeta'. Did you mean 'label'? -->
  ```

  两条形状上的取舍值得写下来：

  - **键一律可选**。非可选时 `slots.default ? 作者内容 : 按 collection 铺开` 这类判断在类型上恒为真，
    而它承载的正是「没写默认插槽就铺开整套结构」的核心行为——类型不能对着它撒谎。
  - **值一律写成函数类型**而不是裸载荷类型。Vue 的 `UnwrapSlotsType` 对函数类型原样保留、
    对裸类型套一层 `Slot<T>`，而 `Slot<T>` 的实参元组在 `T` 不 extends `undefined` 时是 `[T]`
    ——零参调用会变成非法，而库里到处是 `slots.default?.()`。

  新增 `check-slot-types` 门禁盯住这两条与「带载荷就必须声明」，`pnpm gate` 由十七项变十八项。

- ba3b3aa: 自定义元素补上全局文案层：`setXhConfig`。

  `provideXhConfig` 一直只有 Vue 适配器有。自定义元素拿不到 provide/inject，文案又是对象、
  只能走 property 不能走 attribute，于是 31 个元素只能在 JS 里逐实例各设一次 `.translations`——
  一个中文应用要为此写几十行。而 `guide/i18n.md` 通篇把 `provideXhConfig` 当作「这套机制」讲，
  一次都没提 Web Components，读的人会以为两端通用。

  现在两端各有一处全局出口，取值优先级一致：**实例 → 全局 → 组件内建默认（英文）**，
  `translations` 逐键合并。切语言再调一次 `setXhConfig` 即可，已挂载的元素跟着重渲。

  接线落在 `MachineController` 一处——31 个元素的机器 props 都从那里过，不必逐个改。

  `XhTranslationOverrides` 那张 31 条的映射表下沉到 `@xihan-ui/headless`，两个适配器共用一份。
  在 WC 侧另抄一份是唯一的替代方案，而两份 31 条的表迟早会漂。Vue 侧原样再导出，导出名不变。

  与 Vue 侧的两处差别写进文档了：`setXhConfig` 是整份替换而非深合并；它是模块级的，
  没有「只在某棵子树里换语言」的能力。

- Updated dependencies [906b712]
- Updated dependencies [b8afdb2]
- Updated dependencies [bc7eeed]
- Updated dependencies [e73b671]
- Updated dependencies [6456704]
- Updated dependencies [e12e337]
- Updated dependencies [ff84a16]
- Updated dependencies [97cbb2a]
- Updated dependencies [a55c76e]
- Updated dependencies [a19bbaa]
- Updated dependencies [ea78591]
- Updated dependencies [089db90]
- Updated dependencies [72dc39c]
- Updated dependencies [a7e8755]
- Updated dependencies [ada8a01]
- Updated dependencies [1461cec]
- Updated dependencies [f1b2c16]
- Updated dependencies [7f8021e]
- Updated dependencies [e2292bf]
- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [3469066]
- Updated dependencies [0be028c]
- Updated dependencies [378d511]
- Updated dependencies [82afde0]
- Updated dependencies [bc65cb7]
- Updated dependencies [1b7a5f1]
- Updated dependencies [e50a7c9]
- Updated dependencies [98d7ffe]
- Updated dependencies [ed01a81]
- Updated dependencies [1e90ce6]
- Updated dependencies [56310b8]
- Updated dependencies [84b1aa3]
- Updated dependencies [843e17a]
- Updated dependencies [a321a50]
- Updated dependencies
- Updated dependencies [8d35702]
- Updated dependencies [d43624c]
- Updated dependencies [3c033ca]
- Updated dependencies [ac885c9]
- Updated dependencies [b04e182]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [1a36b7e]
- Updated dependencies [911d0b7]
- Updated dependencies [720cf75]
- Updated dependencies [e31cc0a]
- Updated dependencies [d738f78]
- Updated dependencies [93fdcb8]
- Updated dependencies [516bd46]
- Updated dependencies [a41b931]
- Updated dependencies [0a57e2f]
- Updated dependencies [466f143]
- Updated dependencies [24721f4]
- Updated dependencies [9548330]
- Updated dependencies [abe790b]
- Updated dependencies [35c9b65]
- Updated dependencies [bbc3431]
- Updated dependencies [e788896]
- Updated dependencies [d0202b2]
- Updated dependencies [7a5d898]
- Updated dependencies [309feb2]
- Updated dependencies [fb97d76]
- Updated dependencies [f942e75]
- Updated dependencies [9b8a795]
- Updated dependencies [902cc49]
- Updated dependencies [8d6e450]
- Updated dependencies [bb47c3d]
- Updated dependencies [5a1aedd]
- Updated dependencies [52729a1]
- Updated dependencies [0148cf7]
- Updated dependencies [1126110]
- Updated dependencies [a69cead]
- Updated dependencies [e7d404a]
- Updated dependencies [4b949c2]
- Updated dependencies [35c9b65]
- Updated dependencies [46b82b0]
- Updated dependencies [ba3b3aa]
- Updated dependencies [520b847]
- Updated dependencies [c2b9748]
  - @xihan-ui/headless@1.0.0
  - @xihan-ui/sound@1.0.0
  - @xihan-ui/kernel@1.0.0
  - @xihan-ui/backgrounds@1.0.0
  - @xihan-ui/machine@1.0.0
  - @xihan-ui/behavior@1.0.0
  - @xihan-ui/position@1.0.0
  - @xihan-ui/code-highlight@1.0.0
  - @xihan-ui/motion@1.0.0

## 1.0.0-preview.0

### Major Changes

- bc7eeed: 徽标收窄成「只做角标」，并补齐角标该有的能力。

  原先 badge 与 tag 是一对孪生：`variant` 三形态、`size` 三档、默认插槽放任意内容，
  连档位取值都逐个相同。两个组件做同一件事，使用者只能靠猜。

  现在 badge 只做一件事——挂在别的元素角上的一枚标记：

  ```vue
  <XhBadge :count="5" tone="danger" label="5 条未读">
    <XhButton>收件箱</XhButton>
  </XhBadge>
  ```

  - 解剖从单层 `root` 变成 `root`（锚点）+ `indicator`（角标），定位归组件自己管，
    不再要宿主手写 `position: relative` 与负偏移。
  - 新增 `placement`：`top-end`（默认）/ `top-start` / `bottom-end` / `bottom-start`，
    用逻辑属性写，rtl 下自动落到另一侧。
  - `size` 换的是圆点直径、两位数时的最小宽度与字号，不再是药丸那套内衬与行高。
  - Vue 侧另出 `XhBadgeRoot` / `XhBadgeIndicator`，要往角标里塞自定义内容时用它们。

  **破坏性**：删掉 `variant`；行内的状态药丸请改用 `tag`（`XhTagRoot` + `XhTagLabel`）。
  `data-size` 与 `data-tone` 从 `root` 挪到 `indicator`。

- 5a1aedd: 轻提示与通知分家：新增 notification，toast 收窄成操作反馈，toaster 删除。

  原先 toast 一个组件担了两件事——「用户刚点了一下，告诉他结果」和「系统主动推来一条消息」。
  两者的信息量、停留时长、落位习惯、谁触发都不一样，混在一起的结果是标题加正文两层文本、
  九宫格落位、堆叠上限这些只有后者需要的东西全压在轻提示上，而轻提示自己反倒要靠一个
  额外的容器组件才能用起来。

  **通知（新增）**

  ```vue
  <XhNotificationRoot v-slot="{ create, dismiss }">
    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem :id="item.id" :title="item.title" :description="item.description">
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
  ```

  队列与卡片是同一个组件的两层：`root`（队列的作用域包装）/ `group`（某个位置上的那一摞，也是 `role=region` 的地标）/ `item` 起是单条卡片。
  九宫格落位、`max` 上限、同 id 就地改写、逐条计时与暂停都在这里。
  Web Components 侧是 `<xh-notification>` 与 `<xh-notification-item>`。

  单条卡片的生命周期复用 toast 那台机器——「会自己消失的卡片」这一行为与消息来源无关。

  通知另有命令式的 `createNotificationService`：推送连接的回调、后台任务的收尾、
  拦截器里的一条系统消息，调用点都在组件之外，让它们各自去找一份队列上下文并不现实。
  队列要长在页面结构里（通知中心那一栏自己排版）时用组件形态，两者不共享队列。

  **轻提示（收窄）**

  - 解剖去掉 `description`：一次操作的结果一句话说得完，说不完的那是通知。
  - 新增 `group` 部件：同时在场的几条叠成一摞。这一摞由全局服务渲染，没有对应的容器组件——
    反馈落在哪儿是整个服务的口径，不该让每个业务页面各挂一份容器再各自决定。
  - `createToastService` 的队列改为服务内部私有，`info` / `success` / `warning` / `error` /
    `loading` / `create` / `update` / `dismiss` / `dismissAll` 签名不变，调用点零改动。
    服务选项新增 `placement`（默认 `top`）、`max`（默认 5）、`gap`。

  **破坏性**

  - 删除 toaster：`XhToasterRoot` / `XhToasterGroup` / `useToaster` / `<xh-toaster>` /
    `connectToaster` / `toasterMachine` / `toasterAnatomy` / `@xihan-ui/styles/toaster.css` 等
    一并移除。组件树内的通知队列改用 notification，命令式轻提示继续用 `createToastService`。
  - toast 删掉 `description` 部件与 `getDescriptionProps`；`<xh-toast>` 的 `description` 属性同时移除。
    机器上的 `description` prop 保留——notification 的卡片复用同一台机器。
  - `ToastOptions` / `ToastRecord` 不再带 `placement`：轻提示的落位归服务，不逐条各去一处。
  - 覆盖槽 `--xh-toaster-inset` / `--xh-toaster-layer` 改名为 `--xh-notification-inset` /
    `--xh-notification-layer`；`--xh-toast-description-*` 随部件一起移除。

### Minor Changes

- e73b671: 行为原语补一条 Vue 出口，并修掉滚动锁那段假文档。

  **新增 `@xihan-ui/vue/behavior` 子入口**，收五个组合式：`useScrollLock`、`useHoverIntent`、`useScrollTracker`、`useStickToBottom`、`useTypeahead`。它们只做一件事——把原语句柄的释放挂到 Vue 作用域结束，语义与原语一字不差。与主入口分开是因为自建浮层才用得上这一层，不用的应用不必把它压进主入口的体积预算（子入口本身 gzip 3.39 kB）。

  需要层栈仪式的那几个（消解层、焦点域、背景失活）**刻意不收**：它们要按顺序接四五个东西，接错的表现是「点子菜单父层跟着关」这类不报错的怪症，那种场景请直接用库里现成的浮层组件。

  **`docs/guide/behavior.md` 的滚动锁一节此前写的是不存在的 API**：示例里的 `shards` 选项与句柄上的 `addShard()` 从未实现过，`ScrollLockOptions` 一直只有 `config`，句柄一直只有 `dispose()`。照实现重写，并补上实现里有、文档里没写的两件：锁哪个元素由 `config.scrollRoot?.()` 决定（宿主把滚动搬进内容容器时必须注入，否则锁到的是不滚的那个）；加锁期间让出来的滚动条宽度写在文档根的 `--xh-scroll-lock-gutter` 上，供 `fixed` 元素让位。

  **破坏性**：`@xihan-ui/kernel` 删除 `DATA_SCROLL_SHARD`。它是那段假文档的来源——声明处之外全库零引用，配套的分片机制从未实现。留着等于承认公开面里有一个永远不生效的名字。没有使用者能真的依赖它（它不参与任何代码路径），但名字确实从公开面消失，故记为 major。

- f1b2c16: date-picker 补上 `defaultFocusedValue`，决定展开时先落在哪一页。

  日历一直有这个 prop，date-picker 没往外露：它的聚焦日单元格默认值写死为 `null`，只能退回首个选中值、再退回今天。没有初始值又想让面板先停在某个月（报表默认看上个月、排期表默认看下个月）此前没有出口。

  补上之后三路收口不变：写过的聚焦日 → `defaultFocusedValue` → 首个选中值 → 今天。表单重置回到 `defaultFocusedValue`，与其余 `default*` 一致。Web Components 那侧是 `default-focused-value`。

  顺带说明一处已有的误用：`defaultFocusedValue` 此前不是 date-picker 的 prop，测试里写了也不生效，那几条其实是靠「今天」恰好落在同一个月才通过的。现在它们真的按写的那一天算。

- 7f8021e: 日期区间的框选改成逐行横杠，面板数按区间跨不跨页现算，面板号写在日历上一处即可。

  **区间底色画成了一整块实心方块。** 底色铺在格子的背景上，格子上下的内衬也算背景区，
  而行与行之间没有间距——七月一整月被选中时，五行底色首尾相接连成一个大方块，
  两端那两枚圆点像是被按在方块上，看不出区间是一天一天连起来的。

  底色改由格子的 `::before` 铺：横向铺满格子，相邻两格接成一条；纵向收在格子内衬里，
  行与行之间留出 4px 空当。每一行的行首与行尾各自收圆，跨周的区间于是是一行一条两头圆的横杠。
  摆了周序号格的行里，行首那一格排在周序号后面，圆角跟着落到它身上。

  **两端那一格只铺半格**，另外半格由选中圆片占满：区间收在圆点上而不是收在格子边上。
  起止落在同一天时两条一起生效，底色宽度归零，只剩那枚圆点。

  **邻月的日子不再吃区间底色与选中圆片。** 并排两张面板里同一天会各出现一次
  （7 月 31 日既在七月的末行、也在八月的首行），两张都画就成了两个端点、两段底色。
  邻月的日子回到「压暗的数字」这一档。

  **粗粒度视图的邻月判定修正。** 月/季度/年三档里格子的值是那一段的第一天，与面板起点比月份恒不相等，
  于是除首格外整页都被判成邻月、整页压暗。这三档改用网格自报的 `inView`。

  **区间默认铺几个面板改成现算**：已选的两端落在同一页里就一张，跨页才并排两张；
  只落了一端（还在挑）时仍按两张算。日历同时恒渲染六行（新 prop `fixedWeeks`，默认开），
  并排的两张面板等高，翻页时浮层高度也不再跟着月份变。

  **面板号写在 `XhDatePickerCalendar` 上一处即可**：新增 `index` prop，面板内的
  `Heading` / `HeadingYearTrigger` / `HeadingMonthTrigger` / `Grid` / `Cell` 不写就跟着它走，
  自己写了仍按自己写的算。此前这五个部件各要写一遍，漏掉任何一个都会静默落到面板 0——
  两张面板显示同一个月份、第二张面板的邻月判定整片错位，都是这么来的。五个 prop 一并兼收字符串。

  **快捷选项列的高度由并排的日历给。** 此前这一列按内容收、上限写死一档，
  右侧那道分隔线只画到最后一条选项，比日历矮一截；它与旁边那张日历之间也补上了与两张日历之间同样的空当。

- 689ed0f: 13 个宿主的滚动层自带自绘滚动条：滚动时或指针在这一片时露出、静止后收起，浮在内容之上不占宽度。

  **哪些宿主**：12 个浮层族的 `content`（cascader / color-picker / combobox / context-menu / date-picker / hover-card / mention / menu / pagination / popover / popselect / tree-select）与 json-viewer 的 `tree`、`text`，共 14 个滚动容器。条子由库自己建，作者一个部件都不用写：它是滚动层的兄弟，绝对定位贴在组件既有的壳上（浮层族是 `positioner`，json-viewer 是 `root`）。轴按各自的溢出方向摆——cascader 只摆横的，tree-select 与 json-viewer 竖横都摆、两条都溢出时各让出交叉口那一格，其余只摆竖的。

  挂上条子的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此把原生条藏成零宽：容器的可用宽度一点不减，也不再需要为原生条留空道。露面时机、尺寸档、拖动、触屏交给原生滚动这些全是 `scrollbar` 那一套，与手写 `<XhScrollbar>` / `<xh-scrollbar>` 挂上去的完全一致，缺省档是 `scroll-hover`。

  **json-viewer 换档跟随**：树档与原文档互斥，换档时条子跟到此刻在场的那个容器，节点不重建（换档不会把滚动条闪一下）。

  **按在 `positioner` 上不再消解浮层**：条子住在 `positioner` 里、是 `content` 的兄弟，浮层的层分支因此把 `positioner` 一并记上——不记的话按住条子拖动那一下会被判成层外交互，面板当场收起。副作用是 `positioner` 的其他子节点也算进了层内：吃指针的只有 combobox 的 `empty` 空态占位，按它不再关闭候选面板（此前会关）。其余 11 个浮层的 `positioner` 除了条子没有吃指针的子节点（`positioner` 自身是 `pointer-events: none`），按在面板之外仍照旧消解。

  **皮肤侧要跟着改的**：自带皮肤给这 13 个壳补了 `--xh-scrollbar-track-bg: transparent`（浮在内容上的条子不该有实色轨道），json-viewer 的 `root` 补了 `position: relative`（条子贴它的内边距盒）。第三方皮肤若整份接管这些 part，同样要给壳一个定位上下文，并把轨道底色关掉。滚动条自身的 `root` 补了 `pointer-events: auto`，抵消 `positioner` 那句 `none`。

- a3be6d6: 命令式服务补齐三件：顶部进度条服务、取值型弹窗、配置源可运行期换。

  **新增 `createLoadingBarService`**。路由守卫与请求拦截器要在组件树之外开合进度条，此前只有组件形态 `XhLoadingBarRoot`，使用者只能自己在应用根挂一个再拿模块级状态去桥接。形态与另两个服务一致：一个工厂、自建 holder 挂 body、句柄带 `dispose`。

  句柄上是**在途计数**而不是布尔开关：`start()` 递增、`finish()` 递减并夹到 0，归零才收。这是它比自搭那层壳多出来的东西——布尔开关下三个并发请求里第一个回来就把条子收掉，剩下两个还在跑。另有 `error()` 换语气收尾、`finishAll()` 不管在途一律收、`set(value)` 切确定进度（再 `start()` 回到不确定）。

  **命令式对话框的正文加宽，并新增 `prompt`**。`ConfirmOptions.content` 从 `string` 放宽成 `DialogBody = string | (() => VNodeChild)`：给串仍走 `XhDialogDescription`（读屏的 `aria-describedby` 接在它上面），给渲染函数则整块摊在正文位。不收裸 VNode——服务宿主是常驻的，忙态一翻就整棵重渲，同一个 VNode 实例被复用时行为未定义。

  `prompt` 解决的是「弹窗里要填东西，填完把值带回来」：每次打开建一份 `reactive` 初值，`body(value)` 与 `onOk(value)` 拿的是同一份可写代理，确认后 `resolve` 一份普通对象快照，取消 / Esc / 卸载 `resolve null`。`prompt` 的 `onOk` 返回 `false` 表示校验没过、弹窗保持打开；`confirm` 的 `onOk` 签名不吃 `false`，语义一字未动（现有 `onOk: () => api.check()` 恰好 resolve false 时不会静默变成「按了确定不关」）。

  **配置源与文案改成可运行期换**。三个服务的 `config` 从 `XhConfig` 放宽成 `MaybeRefOrGetter<XhConfig>`，句柄上多一个 `setConfig`；`okText` / `cancelText` / `translations` 一并放宽。此前文案只在创建服务那一刻求值一次，应用切语言后服务子树里的按钮与读屏名不跟——队列里的对话框还会跨过一次切换。取值优先级：调用点 > 服务选项 > `config.translations.<组件>` > 组件内建。

  顺带修正 `docs/guide/versioning.md` 里两个失准的样式钩子计数（114 → 119、500 → 505）。

- 843e17a: json-viewer 补原文视图：`view="text"` 直接出缩进过的 JSON 原文。

  树档是拿来"翻"的——折叠、逐层看结构；而"核对这份报文与后端下发的是不是一字不差"、
  "把它整段拷走"这两件事树档做不到：值受 `maxStringLength` 截断、成员受 `maxItems` 折减，
  分支摘要与把手还带 `user-select: none`，框选拿到的不是原文。原文档就是补这一件事，
  因此它刻意不吃那两个折减选项。

  `api.text` 在两档下都取得到，作者要做"复制原文"按钮时不必自己再序列化一遍。
  序列化与树同源：同一个 `jsonEntries` 排键（`sortKeys` 一样生效）、同一条祖先链判环
  （环落成 `"[Circular]"`，两条不相干分支共享同一个对象照样摊开），
  `bigint` / `undefined` / 函数这些 JSON 没有写法的值退回树上那份文本并按字符串写出，
  整份始终解析得动。

  新增 headless 出口 `jsonText` 与类型 `JsonViewerView`，解剖新增 `text` 部件。
  皮肤与树档共用同一套边框、内衬与高度令牌，两档切过去盒子不跳。

- 3c033ca: 通知按卡片重排：左侧类型字形、右上角关闭钮、两列网格。

  它的皮肤是从旧的 toast 卡片逐字搬来的，搬完没人按「通知该长什么样」审过一遍，
  于是留下三处硬伤：

  - **叉掉到了卡片左下方**。`item` 是竖排 flex，而叉上写着
    `align-self: flex-start` + `margin-inline-start: auto`——交叉轴上的 auto 外边距
    会让对齐属性整条失效（flexbox §9.6），`align-self` 那行一点作用都没有，
    叉成了正文下面的第三行。实测它落在距卡片顶 55px 处，卡片因此高出一截。
    三家参考实现（Ant Design / Element Plus / Naive UI）都是绝对定位钉在右上角内衬处。
  - **组件路径下一个类型指示物都没有**。徽记只由服务档的默认模板画，
    12 份示例与所有 Web Components 使用者拿到的卡片，语气全靠起始侧那条 4px 色条承载，
    而它压在卡片底上只有 1.9–2.8:1，`loading` 与 `info` 除颜色外完全同形。
  - **字号比轻提示还小一档**（13px），标题与说明只差 7.7%，两层文字挤成一片。

  现在：

  - 新增 `item-indicator` 部件。作者留空即由皮肤按 `data-type` 画一枚兜底字形
    （info / success / warning / error 各一枚，`loading` 给转圈），
    颜色取 `--xh-_tone-fg`——与 alert 的状态图标同档，压在卡片底上十二组最低 4.08:1。
  - **两列网格**：左列字形、右列标题与说明；叉绝对定位钉在右上角，标题自动让位
    （写法照 dialog / drawer）。起始侧那条语气色条随之删除——三家都没有，
    语气改由字形承载。
  - 卡片宽 320 → 384px（`--xh-overlay-max-w-lg`，与 Ant Design 同值），
    内衬四边 16px，字号回到正文档 14px。
  - 服务档的默认模板改成四个节点平铺（不再套一层皮肤够不着的行容器），
    说明部件恒渲染——`aria-describedby` 是无条件发的，节点缺席就成了悬空引用。
  - 地标 `role="region"` 从 `root` 搬到 `group`。root 是 `display: contents` 的作用域包装，
    量出来 0×0，地标挂在它身上跳过去落不到任何看得见的地方；那一摞才是真盒子。

  顺带补上三处从来没有门禁看管的地方：`check-elevation-role`、`check-press-feedback`、
  `check-clear-trigger` 三份名单都没登记过 notification，眼下合规纯属巧合。

  **破坏性**：删掉 `--xh-notification-accent` 与 `--xh-notification-accent-width`
  两个覆盖槽（色条没了）。另有几个槽的默认值变了：`--xh-notification-w`（20rem → 24rem）、
  `--xh-notification-py` / `-px`（12/16 → 16/16）、`--xh-notification-font-size`（13 → 14）、
  `--xh-notification-gap` 的语义从「行距」改为「图标与正文的列距」（行距另开
  `--xh-notification-row-gap`）。地标从 root 挪到 group，按 `root[role=region]` 写过
  自动化断言的要跟着改。

- 1a36b7e: 省略号能摊开了：折进去的那几页现在有路走到。

  原先省略位是 `aria-hidden` + `pointer-events: none` 的死占位，而 `pages` 序列
  只说「这里折了一段」，说不出折的是哪几页——那几页除了手打跳页输入框没有任何入口。

  分页因此升级成浮层族，新增 `positioner` 与 `content` 两个部件：

  ```vue
  <XhPaginationRoot v-slot="{ pageItems }" :count="2000" :page-size="10">
    <template v-for="item in pageItems">
      <XhPaginationEllipsis v-if="item.type === 'ellipsis'" :side="item.side" />
      <XhPaginationItem v-else :value="item.value">{{ item.value }}</XhPaginationItem>
    </template>
    <XhPaginationPositioner>
      <XhPaginationContent v-slot="{ pages }">
        <XhPaginationItem v-for="p in pages" :key="p" :value="p">{{ p }}</XhPaginationItem>
      </XhPaginationContent>
    </XhPaginationPositioner>
  </XhPaginationRoot>
  ```

  - 新增 `api.pageItems`：与 `pages` 同一串序列，但省略位带着被折叠的那几页。
    `pages` 由它派生，两者的窗口数学只有一份。旧的 `pages` 写法一行不用改。
  - 悬停摊开（`openDelay` / `closeDelay`），**点一下也摊开**——纯悬停会把键盘用户挡在外面。
    Escape 与点外面都能收起（走消解层）。
  - 至多两个省略位，用 `side`（`'start' | 'end'`）区分；同时只开一个，一份定位层就够。
    Web Components 侧由作者在节点上写 `side="end"`，与页码按钮自报 `value` 同一套写法。
  - 浮层 portal 到统一落点，三视觉轴在 `positioner` 上重打一遍。

  **破坏性**：`getEllipsisProps()` 改为收 `{ side }`；省略位从 `<span>` 变 `<button>`、
  不再带 `aria-hidden`。

- 911d0b7: 每页条数控制器随分页一起给了。

  ```vue
  <XhPaginationPageSizeSelect v-slot="{ options }">
    <option v-for="o in options" :key="o" :value="String(o)">{{ o }} 条 / 页</option>
  </XhPaginationPageSizeSelect>
  ```

  用**原生 `<select>`** 而不是再造一个浮层：档位就那么几档，浮层带不来什么，
  却要多接一层定位、消解与键盘；原生控件在 Web Components 侧也一样能用，键盘天然可达。
  不给插槽时按 `pageSizeOptions` 渲染默认档位。

  受控时会把 DOM 的选中项同步回填：宿主不写回的话，用户改过的原生 select 与真正生效的
  档位会对不上，而 vdom 那边没有变化就不会打补丁——这一条两个适配器共用。

- 720cf75: 每页条数从只读 prop 升成真状态。

  原先 `pageSize` 只是个 prop：组件读它算总页数，改档只能由宿主自己写回，
  换档后当前页越界还得宿主自己夹。现在它住进 cell，与 `page` 同一套受控/非受控语义：

  - `pageSize` 给定即受控——**与升级前一字不差**，现有写法一行不用改；
  - 只给 `defaultPageSize` 则由组件自持；
  - 新增 `pageSizeOptions`（缺省 `[10, 20, 50, 100]`，升序去重、每档至少 1）、
    `onPageSizeChange`、`api.setPageSize()`。

  **换档时页码跟着换算，而不是夹取。** 10 条一页看到第 5 页（第 41 条起），换成 50 条一页时
  夹取会给出第 2 页（第 51 条起）——刚在看的那条反而不见了。改为按改档前第一条换算，
  给出第 1 页，第 41 条仍在页内。换算结果天然落在合法区间，不必再夹一次。

  `onPageChange` 报出的 `pageSize` 现在取自当下的档位；非受控改档后它跟着变，
  不再是 prop 上那个陈旧值。

- abe790b: 滚动条新增 `scroll-hover` 档，并把它定为缺省档。

  **新增 `'scroll-hover'`**：滚动时露出，指针进入滚动容器或滚动条时也露出；指针占着容器时滚动只重画滑块、不起收起倒计时，指针离开或停手满 `hideDelay` 才收起。它是 `hover` 与 `scroll` 两档显形条件的并集，与那两档一样浮在内容之上——`data-lane-*` 的判据只认 `auto` / `always`，视口宽度一点不减（横条同理不占高度）。

  **缺省档由 `'hover'` 改为 `'scroll-hover'`**：`scrollbar` 与 `scroll-area` 不写 `type` 时都走新档。显形集合是原缺省档的严格超集，没有一条本来看得见的滚动条会消失；占道与否、触屏交给原生滚动那一路都不变。

  **需要跟着改的代码**：对 `ScrollbarType` 做穷尽 `switch` / 映射表的地方要补 `'scroll-hover'` 分支；读 `ScrollbarApi.type` 或 `data-type` 并按值分派的代码会收到这个新值。

  状态机的两个判据改了名：`isHoverType` → `showsOnHover`、`isScrollType` → `showsOnScroll`（原名在新档下会读成谎话）。判据名只在机器内部与文档的「状态机」小节露面，不进公开 API。

  日志的视口那条 `scrollbar-gutter` 收窄到「还在用原生条」的情形：带 `data-xh-scrollbar` 的容器原生条已被藏成零宽，空道对它没有布局作用。没挂自绘条时空道照留，原生滚动条出现与消失仍不推动文字。

- 70fe4bb: `useStickToBottom` 交出整个句柄，并在节点到位后自动重绑。

  原先只返回状态 ref，句柄上的 `scrollToBottom` / `retarget` 被吞掉。丢的不只是便利：
  原语在建好那一刻就绑一次，而 setup 阶段模板 ref 还是 null——包装既不重绑、
  又不把 `retarget` 交出来，这个 use 在最常见的用法（两个 getter 读模板 ref）下
  根本没挂上，状态永远停在初值。

  返回值改为 `{ state, scrollToBottom, retarget }`，并 watch 两个 getter，
  节点变了就重绑（写法同 `useThread`）。「回到底部」按钮现在直接 `scrollToBottom()` 即可。

  **破坏性**：原来的 `const state = useStickToBottom(...)` 要改成 `const { state } = ...`。

- f942e75: 表格补列偏好：一份可序列化的状态 + 几个写入口。

  ```ts
  interface TableColumnPreference {
    order?: string[]; // 列序
    hidden?: string[]; // 藏起来的列
    widths?: Record<string, number | string>; // 列宽覆盖
    sticky?: Record<string, boolean | "start" | "end">; // 冻结覆盖
  }
  ```

  `columnPreference` 给定即受控，`defaultColumnPreference` 非受控，
  变更走 `onColumnPreferenceChange`。写入口四个：`setColumnHidden` / `moveColumn` /
  `setColumnWidth` / `setColumnPreference`。

  **存到哪儿归使用者**——存 localStorage、存后端、跟着用户设置同步，都是应用的事；
  把存储通道焊进组件库只会让它绑死一种后端。库只负责把偏好算进生效列。

  三条语义值得单说：

  - `order` 只列一部分也成立：列到的排在前面，没列到的按原顺序跟在后面，
    于是「把某一列挪到最前」不必把全表列一遍。
  - 隐藏列**不占列号**，其余列跟着重排——让它继续占，读屏会报出一个数不到的格子。
  - 前缀列不受偏好摆布：它们是结构性的，由 `prefixColumns` 说了算。

- 9b8a795: 表格补前缀列、树形子行与行号。

  **前缀列**：`prefixColumns: ['index', 'select', 'expand']` 按给定顺序插在最前面，
  并**占住列号**——不占的话右侧所有列的 `aria-colindex` 会整体串位，而这正是使用者
  手工往 `columns` 里塞假列的原因。作者照 `api.columns` 渲染即可，每一项自报 `kind`。
  默认一列都不插，现有用法一行不用改。

  **树形子行**：`TableRowDef.parentId` 指父行。有子行的行不再产出详情行——
  一行不可能同时既展开出子行、又展开出一块详情。`aria-level` / `aria-posinset` /
  `aria-setsize` 从写死的 1 与 2 改成按真实层级给。

  **行号** `api.rowNumber(rowId)`：

  - 平表是**分页全局序号** `(page - 1) * pageSize + 可见序`，翻到第二页不会又从 1 开始；
    `page` / `pageSize` 只用来算序号，不参与切片（切片归调用方或分页组件的 `api.slice`）。
  - 树形是**大纲编号**（`1` / `1.1` / `1.2`），取的是「在父的 children 里的下标」
    而不是可见序：**收起某一枝时，仍在场的行编号一个都不变**。取可见序的话收起一枝，
    其后所有行的号会整体前移，用户看到的是「序号跳了」。

- f4d3708: 轻提示改成短消息的样子：顶部居中、宽度包着内容、一行图标加一句话。

  上一版把 toast 从通知卡片收窄成操作反馈时只动了结构，皮肤还是照着卡片那份抄的——
  定宽 320px、竖排、起始侧一条 4px 语气色条、行尾一颗叉。一句「已保存」于是撑成一个
  方块，右边留着一大片空白，看着仍然像一则公告。

  现在它是这样：

  ```
  ┌──────────────────┐
  │  ✓  已保存        │   ← 贴着文字收缩，顶部居中
  └──────────────────┘
  ```

  - **收缩包裹**：`inline-size` 的默认值从 `--xh-overlay-max-w` 改成 `auto`，
    上限压在 `min(48rem, 100%)`，长文案在上限处换行、仍然居中。
  - **单行横排**：`flex-direction` 去掉，`align-items: center`；标题吃掉剩余宽度，
    操作钮与叉自动落到行尾（两者不再 `align-self: flex-start`）。
  - **矮一档**：纵内衬从面档（12px）换成控件档 `--xh-field-py`（8px），条子高 39px，
    与 Element Plus message 的 39px 齐平、比 Ant Design message 的 40px 矮 1px。
  - **语气走淡底**：底与描边取语气层的 `--xh-_tone-subtle` / `--xh-_tone-border`
    （与 alert 同一套口径），正文留中性——正文也跟着兑成语气色的话，绿字压绿底是整条里
    对比度最差的一处。起始侧那条 4px 色条随之删除。
  - **字号回到正文档**：13px → 14px；标题不再加粗、不再换行高，一句话的反馈没有主次之分。
  - **状态字形不带圆底**：服务档的默认模板改用新的 `typeGlyph`（16px 裸字形，颜色取
    `--xh-_tone-fg`，与 alert 的状态图标同档），圆底徽记 `typeBadge` 留给对话框那种有余裕的版面（通知的类型字形由皮肤在 `item-indicator` 上画）。
  - **到点自己走的不出关闭按钮**：`createToastService` 的默认模板据此分两档——
    会自己消失的不出叉（三家参考实现都是这样），`loading` 与 `duration <= 0` 这种走不掉的
    反过来默认出叉，否则界面上一个可点、可聚焦的节点都没有。两档都能用 `closable` 显式改口。

  **破坏性**：删掉 `--xh-toast-accent` 与 `--xh-toast-accent-width` 两个覆盖槽（色条没了）。
  另有四个槽的默认值变了：`--xh-toast-w`（20rem → auto）、`--xh-toast-bg`
  （`--xh-bg-surface-raised` → 语气淡底）、`--xh-toast-border`（中性 → 语气描边）、
  `--xh-toast-title-font-weight`（semibold → regular）；`--xh-toast-close-size` 的默认值
  从 `--xh-control-h-sm`（28px）降到 `--xh-control-action-size`（24px）。
  靠「轻提示是 320px 定宽」做过对齐、或依赖默认那颗叉关闭常驻提示的用法要跟着改。

- a69cead: 树补一条 `leafOrientation`：末端那一层可以横排。

  只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层。一个菜单下十几个按钮，
  横排一行铺完，省掉大量纵向翻找：

  ```vue
  <XhTreeRoot :collection="menus" leaf-orientation="horizontal" />
  ```

  **中间层与整棵树恒是竖排，不提供开关。** 它们承载的是层级本身，横过来层级就读没了。
  判据是「这一层不再往下分」而不是「深度等于几」：同一棵树里各枝深浅不一，
  按深度判会把浅枝的中间层也横过来。

  **方向键不跟着改。** 树上左右是层级操作（收起 / 展开、回父层 / 进子层）、上下走可见行，
  这是 treeview 的规范语义，横排只是排布。

  顺带修一处：叶子行在竖排下会自己补出「箭头那一格」与同级分支对齐，横排下补出来的
  是节点之间的空隙而不是层级，那条规则因此按行盒**所在的那层容器**判定方向。

- e7d404a: 树补 `multiple` 布尔，`selectionMode` 转为它的旧写法。

  `TreeSelectionMode` 只有 `single | multiple` 两个取值，与一个布尔完全等价；而同族的
  `tree-select` 与另外六家（accordion / cascader / combobox / listbox / select / toggle-group）
  表达同一件事时用的都是 `multiple?: boolean`。同一个概念，树上要写
  `selection-mode="multiple"`、下拉树上要写 `multiple`——记不住是必然的。

  树现在也收 `multiple`（Vue 的 prop、自定义元素的 `multiple` 属性、api 上的 `multiple` 布尔）。
  `selectionMode` 保留一个大版本，标为 deprecated；**两者同时给时以 `selectionMode` 为准**，
  与 listbox 的规矩一致——所以已经在用 `selectionMode` 的代码行为一点不变，不必赶着改。

  `listbox` 的 `selectionMode` 不动：它有 `single | multiple | extended` 三个取值，
  不是布尔能表达的。`calendar` / `date-picker` 的同名 prop 同理。

- 1eed29d: 补两条 Vue 侧的逃生口：只注册不渲染的快捷键，以及控件藏在薄封装里的字段接线。

  **新增 `useHotkeys`**。此前 hotkeys 只有渲染键帽的组件形态，全局快捷键（Ctrl+K 开搜索、Alt+L 锁屏）只想要注册、不想要键帽，只能自己写原生 `keydown` 监听——还得自己处理 Mac 上 Option 会改 `event.key`、必须用 `event.code` 兜底这类事。

  组件里那段「算 API + 挑监听节点 + 绑 keydown + 解绑」整段移进组合式，`XhHotkeys` 改成它的消费者，一份逻辑两种形态。`target` 除组件已有的 `'document'` / `'parent'` 外，还收一个返回节点的函数，用于挂在滚动容器或 `window` 上。一次调用管一组组合，注册四条就调四次——与组件形态一比一对齐，免得两种形态的 `preventDefault` / `enabled` / `platform` 语义各走各的。

  `XhHotkeys` 的 props、emits 与渲染结果一个都没变。

  **`XhFieldControl` 新增 `asChild`（默认 `true` = 今天的行为）与配套的 `useFieldControl`**。字段默认把接线属性合到控件槽里唯一的子节点上；子节点是组件时合的是组件根，而薄封装的根往往是 `div`。标签的 `for` 只对可标注元素生效，指到 `div` 上什么也不会发生——点标题聚不了焦、读屏报不出名字，**而且不报错**。

  现在封装内部调 `useFieldControl()` 取到那组属性，绑到真正可聚焦的节点上，外层写 `:as-child="false"` 让父节点别再合一遍（合两遍会在页面上留下两个相同的 `id`）。`useFieldControl` 在字段外返回空对象，封装照样能单独用。

  `asChild` 这个词是库里现成的——13 个组件的触发器都用它表示「把属性合到作者的子节点上」，这里语义一致，只是这个部件此前把它写死成了真。

  顺带导出此前一直漏在包外的 `provideField` / `useFieldContext`，并新增 `useOptionalFieldContext`。

  Web Components 侧不需要对应改动：那边是 Light DOM，作者本来就把 `data-xh-part="control"` 写在真控件上。

### Patch Changes

- 82afde0: 套进表单字段的复合控件念得出字段的标签了。

  复合控件的可聚焦部件自带 `aria-labelledby`，指的是它自己的 `label` 部件。套进字段时
  作者用的是字段的标签、组件那个 `label` 部件根本没渲染，这条引用于是悬空——按 accname
  规则悬空 IDREF 直接跳过；名字也回退不到 `label` 的 `for`，因为 `for` 指的是封装根那个
  `div`，只对可标注元素生效。结果是焦点所在的那个控件**一个名字都没有**：下拉只念得出
  当前值，输入框连值都没有，读屏进去就是一句「编辑框」。

  `FieldApi` 补 `labelId`；Vue 侧新增 `useFieldLabelWiring()`，11 个单一可聚焦控件的封装
  在真控件那一层把字段的标签**并进**名字链最前面（不是覆盖：只换上去会挤掉当前值）。
  `check-field-wiring` 一并钉住这半边。

  Web Components 侧还没有字段接线这一层（状态那半边同样没有），此次不涉及。

- af56819: 注入键改用全局符号注册表，模块被加载成两份时不再整棵子树白屏。

  `Symbol('xh-select')` 每执行一次就是一个新键。链到工作区的库在 dev server 下重建
  产物后，运行中的模块图会新旧混杂，`context` 模块重新执行一遍就换了键——
  `provide` 拿新的、`inject` 拿旧的，部件当场抛「必须用在 XxxRoot 内」。
  报错指向的是部件本身，与真正的原因隔着十万八千里。

  147 个注入键改用 `Symbol.for`：按字符串查同一个键，两份模块也对得上，
  这类失败于是从「白屏」降级成「照常工作」。

- 9c2704c: 修 XhJsonViewerRoot 的 value 在类型上被推成 undefined：任何跑 vue-tsc 的工程传真实数据都编译不过。

  `type: null as unknown as PropType<unknown>` 这个断言把 `null` 伪装成了 PropType，
  绕开了 Vue 的 InferPropType 中 `{ type: null | true } → any` 那条专为「任意类型」准备的分支，
  于是掉进 `IfAny<V, V, D>` 落到 D —— 也就是 `default` 的类型 `undefined`。
  结果是这个 prop 除 undefined 外什么都不收，`v-bind` 展开也一样被拦（TS2345）。

  运行期一直是好的（`as` 断言会被擦除，`type` 的运行期值就是 null，Vue 不据此校验），
  所以这是纯编译期缺陷；但库自己的示例 demos/json-viewer/01-basic.vue 就过不了类型检查。

  给 default 标注 `as unknown`，推导结果与 headless 契约 `value?: unknown` 对齐。

- 430c3bc: 进度条服务的宿主自己渲染，不再经 provide/inject 拿 api。

  这棵子树是固定的三层、全归服务自己拥有，用上下文传 api 什么也没换来，
  却把「跨模块 provide/inject 必须对得上」加成了一条本可以没有的前提。
  模块被加载成两份时那条链会断，而报错指向的是 `XhLoadingBarTrack` 而不是真正的原因。

  同时把挂载守卫做干净：失败后不再调 `app.unmount()`（`mount` 抛出时 Vue 并没把
  `isMounted` 置真，卸载只会再吐一条警告），并让服务整体惰化——半挂载的树仍订阅着
  响应式状态，继续写它只会让那棵残骸一遍遍重渲，每次都吐一串
  「slot invoked outside of the render function」。

- 47a3f1d: 命令式服务的宿主挂不起来时，退化成空操作，不再连累调用方。

  轻提示、通知、确认框、进度条这四个服务是从路由守卫、请求拦截器这类地方懒建的。
  那些位置抛异常，后果不是「提示没弹出来」而是**整次导航失败、整站白屏**——
  而报错指向的是浮层部件，与真正的原因隔着十万八千里。
  一条轻提示、一根进度条都不该有这个权力。

  挂载改走一道守卫：失败时发一条说得清的诊断（原始错误留在 `detail` 里）、
  把容器收走、交回 false，服务本次退化成空操作。用户看不到提示，但页面照常能用。

- 902cc49: 不可关闭的标签不再建状态机，挂载开销减半。

  标签的事件只有 OPEN / CLOSE 两个，都从关闭钮或 `setOpen` 来。不给关闭钮时这两条路
  都走不到，状态恒等于 `open ?? defaultOpen ?? true`——一台机器在这里纯属开销，
  而表格一页几十行、每行几个状态药丸就是几百台。

  量过：400 枚标签从 39.1ms 降到 18.3ms，每枚 0.095ms → 0.043ms。

  连接层主体抽成一份，`connectTag`（机器路）与新增的 `connectStaticTag`（快路）
  各调它一次，语义不会漂。受控/非受控两态与机器路逐条一致，包括「受控期间的
  `setOpen` 不许偷偷落进内部值」——那一条只有在宿主把 `open` 撤回 `undefined`
  转非受控的那一刻才看得出来。

- 23bb4a3: thread 补导出 provideThread / useThreadContext，与孪生组件 log 对称。

  thread 与 log 结构完全同构，log 一直导出着这一对，thread 却漏了。
  后果是「用 useThread 自己起一份上下文、再拿官方部件铺 DOM」这条组合路径在 thread 上走不通——
  拿不到 provideThread，XhThreadViewport / XhThreadContent 就 inject 不到东西。

- Updated dependencies [bc7eeed]
- Updated dependencies [e73b671]
- Updated dependencies [6456704]
- Updated dependencies [f1b2c16]
- Updated dependencies [7f8021e]
- Updated dependencies [378d511]
- Updated dependencies [82afde0]
- Updated dependencies [56310b8]
- Updated dependencies [843e17a]
- Updated dependencies [3c033ca]
- Updated dependencies [1a36b7e]
- Updated dependencies [911d0b7]
- Updated dependencies [720cf75]
- Updated dependencies [abe790b]
- Updated dependencies [fb97d76]
- Updated dependencies [f942e75]
- Updated dependencies [9b8a795]
- Updated dependencies [902cc49]
- Updated dependencies [5a1aedd]
- Updated dependencies [0148cf7]
- Updated dependencies [1126110]
- Updated dependencies [a69cead]
- Updated dependencies [e7d404a]
  - @xihan-ui/headless@1.0.0-preview.0
  - @xihan-ui/kernel@1.0.0-preview.0
  - @xihan-ui/machine@1.0.0-preview.0
  - @xihan-ui/behavior@1.0.0-preview.0
  - @xihan-ui/motion@1.0.0-preview.0
  - @xihan-ui/code-highlight@1.0.0-preview.0
  - @xihan-ui/position@1.0.0-preview.0
  - @xihan-ui/backgrounds@1.0.0-preview.0
  - @xihan-ui/sound@1.0.0-preview.0

## 1.0.0-alpha.3

### Major Changes

- 516bd46: 浮层搬进单一落点，层号与背景失活跟着改口。

  ## 浮层不再原地渲染

  此前 20 个带 positioner 的浮层里只有 dialog / drawer / image-viewer 搬走，其余 16 个
  留在触发器旁边。坐标一直是对的（定位引擎特意处理了「祖先抢走包含块」），坏的是层叠序：
  宿主应用的祖先只要建了层叠上下文——`transform` / `translate` / `scale` / `filter` /
  `backdrop-filter` / `opacity` 小于 1 / `contain` / `will-change` / `position: sticky` /
  定位元素带 `z-index` / `isolation`——浮层的层号就退化成那个上下文里的局部序号，被任何
  上层兄弟盖住。这是库无法从自身约束的：宿主怎么写 DOM 不归库管。

  kernel 新增 `ensurePortalRoot(doc)`，在 body 末尾维护单一 `#xh-portal-root`，
  `RuntimeConfig.portalContainer` 的默认值指向它。Vue 侧 19 个浮层的 positioner
  （tour 连同 backdrop 与 spotlight）一律 Teleport 过去。落点自身一条样式都不写——
  子元素全是 `position: fixed`，不占布局，而任何 `position` / `transform` / `contain` /
  `isolation` 都会平白建出新的层叠上下文，正是要躲的东西。

  WC 适配器是 Light DOM，解剖契约就是「作者写在哪就在哪」，搬不动。改为在浮层展开时
  沿祖先链探一次层叠上下文，命中就投一条诊断，指名是哪个祖先的哪条属性。

  **破坏性**：浮层的 DOM 位置变了。按 `wrapper.querySelector` 之类以挂载根为基准取浮层
  节点的代码要改从 `document` 取。

  ## 遮罩式浮层并到同一档层号

  `--xh-z-drawer` 删除，`--xh-layer-drawer` 与 `--xh-layer-modal` 解析到同一个值。

  原先抽屉 1000 低于对话框 1100，而两者都在同一个栈上下文里，纯靠数字定序：从对话框里
  拉出抽屉时，抽屉连同自己的遮罩一起沉在对话框遮罩底下，用户只看到画面又暗一层、什么都
  没出现，而焦点已经陷进看不见的面板。反方向是对的，所以这是只在一个方向上炸的组合。
  并档之后先后交给 portal 顺序决定，与对话框套对话框的现有行为一致。

  **破坏性**：`--xh-z-drawer` 这个名字没有了。改用 `--xh-layer-drawer`。

  ## 背景失活改走祖先链

  `hideOutside` 此前只遍历 body 直接子元素，判据是「这个子元素包含 target 就整块放行」。
  WC 适配器的浮层长在作者写它的位置，应用只要有一层根容器（`#app` 之类）就会因包含浮层
  被整块豁免——模态对话框身后的整个应用对读屏依然完全可遍历，不认外点关闭的
  `alertdialog` 更是完全可点。改成沿每个 target 到 body 的祖先链逐层罩住其余兄弟。

  `data-xh-inert-exempt` 的语义随之扩大：带标记的元素及其后代不被罩住，**其祖先只递归、
  不整块罩住**。通知队列因此在任意嵌套深度都能保持可点，外点判定也一并豁免（点通知不再
  把模态关掉）。

  ## 其余

  - `--xh-editable-preview-line-height` 删除，改用 `--xh-editable-preview-min-h`：预览态
    原先拿行高冒充高度，实测比同组件的编辑态高 2px，切换时跳一下。
  - tooltip 与 navigation-menu 入层栈，Escape 不再连它们下面的对话框一起关掉。
  - 定位引擎新增 size 中间件，回报可用空间与锚点宽度；菜单族补上高度上限与内部滚动。
  - 包含块判定补齐 `translate` / `rotate` / `scale` 独立属性与 `backdrop-filter`。
  - 滚动锁补滚动条补偿与滚动根探测。

- d0202b2: **选择态一族（table / tree / transfer）的选中集合统一叫 `selection`。** 三个组件表达的是同一件事，
  却各叫各的：table 是 `selection`、tree 是 `selectedValue`、transfer 是 `selected`。1.0 之后 prop 名
  就是公开 API，趁 alpha 一次改完，不留别名。

  三家统一为 `selection` / `defaultSelection`，回调仍是 `onSelectionChange`，载荷字段一律 `{ value }`
  （全库同类载荷都用 `value`，transfer 的 `{ selected }` 是唯一破例）。

  迁移点：

  - tree：prop `selectedValue` → `selection`、`defaultSelectedValue` → `defaultSelection`；
    `TreeApi.selectedValue` → `selection`、`setSelectedValue` → `setSelection`；
    机器事件 `SELECTED.SET` → `SELECTION.SET`；Vue 的 `v-model:selectedValue` → `v-model:selection`；
    WC 的 `el.selectedValue` → `el.selection`、`el.defaultSelectedValue` → `el.defaultSelection`。
  - transfer：prop `selected` → `selection`、`defaultSelected` → `defaultSelection`；
    载荷 `TransferSelectionChangeDetails.selected` → `value`；
    `TransferApi.selected` → `selection`、`setSelected` → `setSelection`；
    机器事件 `SELECTED.SET { selected }` → `SELECTION.SET { value }`；
    纯函数入参与 `TransferMoveInput` / `TransferMoveResult` 的 `selected` 字段 → `selection`；
    Vue 的 `v-model:selected` → `v-model:selection`，默认插槽载荷 `selected` → `selection`、
    `setSelected` → `setSelection`；WC 的 `el.selected` → `el.selection`、
    `el.defaultSelected` → `el.defaultSelection`。
  - table 本来就是这套名字，不变。

  三者的语义各不相同，改的只是名字：table 的 `selection` 可以是 `'all'`，tree 分单选/复选，
  transfer 的 `selection` 是两侧的勾选集合，与「已搬到右侧」的 `value` 是两回事。

### Minor Changes

- 906b712: 真机 axe 扫出的无障碍缺陷逐条修，并把三个模态补进扫描名单。

  **dialog / drawer / image-viewer 此前从没被真机 axe 扫过**：它们的 presence 模型与共享套件对不上，各自单开了一份 WC 规格，因而不在扫描名单里——而焦点陷阱、`aria-modal`、背景 inert 恰恰最该在真浏览器里验。补进名单后三者全绿。

  同一次扫描照出四类既有缺陷：

  - **side-nav 折叠成图标栏后，行按钮与链接没有可及名**（critical + serious，14 条）：皮肤把 `branch-text` / `link-text` 整个 `display: none`，可及名随之归零——读屏用户在折叠侧栏里完全不知道每一项是什么。改成仓内既有的视觉隐藏配方（文字仍在无障碍树里），可及名恒等于可见文本，不必再让连接层去猜名字，也不会覆盖作者自己写的 `aria-label`。
  - **side-nav 的 `ul` 直接装 `a`**（serious，19 条）：Vue 适配器早就偷偷包了一层没登记的 `<li>`。把它提成正式的 `item` 部件（解剖 / connect / meta / 两个适配器 / 套件 / 示例同步），与同族的 breadcrumb、anchor、navigation-menu 一致。
  - **有值时下拉钮被藏掉**（date-picker / time-picker / combobox）：清空钮的互斥契约此前让「清空钮顶替下拉钮」，但这三家的 `trigger` 是打开浮层的那颗按钮而不是装饰箭头——藏掉它，鼠标用户在有值之后没有入口，浮层收起时的焦点归还也会落到隐藏节点上，键盘用户当场丢失位置（真机里 Escape 后焦点掉到 `body`）。改为只有纯装饰的 `indicator` 才让位（select / cascader / tree-select 那三家），这三家的清空钮与下拉钮并排显示。
  - select 的隐藏原生 `select` 在派生用例里被插了两份，第二份没有接线因而没有可及名——套件的 fixture 助手补幂等判断。

  `data-name` 这类写成常量再当计算键用的属性，此前公开面采集器的正则扫不到，基线漏登记；采集器补上常量形态。新增 `check-release-tag`：标签写的版本号必须与 changesets 的 pre 模式对得上，否则打 `v1.0.0` 却发出 `1.0.0-alpha.N`、或退出 pre 后打 `v1.0.0-rc.1` 直接占掉 `latest`。

- e12e337: 日历可以并排展示连续几个月，date-picker 的区间选择默认就是两个。

  区间的起止常常跨月，只有一个面板就得「点起点 → 翻页 → 点终点」，翻的时候还看不见起点在哪。
  两个并排是这类选择器的通行做法，也是这次补上的。

  - **calendar 新增 `visibleCount`**（默认 1）与 **`panels`**：一个锚点铺出 N 个连续月，
    翻页只动锚点、整窗一起走一个月，不是各翻各的。跨年自然接上（12 月的下一个面板是次年 1 月）。
  - **`getGridProps` / `getHeadingProps` 收面板下标**，每个面板一份标题 id，网格各由自己那行标题命名。
    不给下标即首个面板，旧调用一字不改。
  - **`CalendarCellProps` 多一个 `index`**：同一天会同时出现在两个面板里（8 月末那几天也铺在 9 月首行），
    「是不是本月」只有连着面板一起看才判得出来。
  - **往后翻的边界按整窗算**：新露出来的是窗口末尾再往后一个月。单面板时与从前逐字一致。
  - **date-picker 新增 `visibleCount`**，缺省单选 1、区间 2。
  - 皮肤只在 `content` 直接摆了两张日历时才横排（`:has`），并给第二张起画一道左分隔线——
    `showTime` 那套结构里 content 的直属子节点是作者自己的包裹块与确认行，无条件横排会把它们并到日历旁边去。

  旧字段 `weeks` / `visibleMonth` / `headingLabel` 保留，恒指首个面板。

- ff84a16: 日历补上按月 / 季度 / 年 / 周挑，并修掉多面板下的两处硬伤。

  **面板粒度 `view`**（`day` 默认 / `month` / `quarter` / `year`）

  格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态——min/max 比较、区间逻辑、
  不可用判定、表单出口于是全都原样复用。点 Q3 落的就是 `2026-07-01`。

  - 月面板一年 12 格、季度 4 格、年面板一页十年（两端各带一格邻十年，与日视图带邻月同一套做法）
  - 一页翻多久跟着视图走：日 1 个月、月与季度 12 个月、年 120 个月；翻页边界同样按整页算
  - 标题按 locale 出：`2026年8月` / `2026年` / `2020年-2029年`
  - 网格上多一个 `data-view`，皮肤据此换排布（月与年 3 列、季度 4 列）；日视图一个字没动

  **周选 `weekSelection`**：点任意一天落的是它所在的整整一周（两端一起给），周首日随 locale。
  只在 `view=day` 且区间模式下生效，其余情形照旧只落这一天。

  **修：点第二个面板里的日子会整窗往后翻一页**

  视窗起点此前直接由聚焦日反推，于是点右边那个面板 → 聚焦日落到下个月 → 整窗跟着走，
  看着就像「点一下翻一页、根本选不中」。现在视窗是独立的浏览位置，只在聚焦日走出视窗时
  才挪过去，挪到刚好把它露出来的那一端。

  **修：浮层展开后指针那条路没有出口**

  上一版把触发钮变成可选部件后，点输入行只能展开、不能收起——而段位里敲出来的值又不触发
  「选完即收」（那时人还在打字），于是浮层关不掉。现在点输入行是开合对称的，段上按 `Enter`
  也收起（`Alt+ArrowDown` 展开的对偶）。

- a55c76e: 日历补上快速翻年、周选整周预览，日期示例按粒度重整。

  **« / » 快速翻**：新增 `prev-year-trigger` / `next-year-trigger` 两个可选部件（不写即不渲染），
  步长跟着视图走——日视图一年，月与季度十年，年视图一百年（它的 `‹ ›` 本来就走十年，
  大步得更大才有用）。边界与 `‹ ›` 各判各的：上界卡在今年之内时，下一页还翻得动、整年跳出去就按不动了。

  **周选悬停整周亮**：`weekSelection` 下指针扫过哪一行哪一行整整七天一起亮，与点下去的结果对得上。
  此前沿用的是「起点 → 悬停点」那一段，一格一格拉出来的区间在周选里讲不通。不开周选时照旧。

  **示例重整**

  - 天 / 周 / 月 / 季度 / 年归拢成一个「五种粒度」示例，一套结构走完
  - 「区间选择」补齐五种粒度，都是并排两页
  - 删掉旧的「按月选择」——它是 `view` 出现之前手搓的一版面板（拿 `XhButton` 拼的），
    与新的 `view="month"` 长相不一致；它想演的「输入行只留年月两段」并进新示例，
    按年挑就只留年那一段

- 089db90: 清空 / 关闭 / 移除按钮收成四类契约，`check-clear-trigger` 门禁固化。

  **内嵌清空钮**（cascader · tree-select · combobox · date-picker · time-picker · text-field · tags-input · select，以及新增部件的 popselect · date-field · time-field）统一为：`tabindex=-1` 不占 Tab 位但**不再 aria-hidden**——读屏按 `aria-label` 找得到它，文案统一走 `translations.clearTrigger`（缺省 `'Clear'`；select 的 `clear` 键改名）；pointerdown 不夺焦，点完发 `VALUE.CLEAR` 并把焦点送回宿主（trigger / input / 第一段）；没值就 `hidden`，不再同时打 `disabled`/`data-disabled`、皮肤也不再留一颗永远看不见的灰钮；尺寸与圆角统一为 `var(--xh-<c>-action-size, var(--xh-control-action-size))` / `var(--xh-<c>-action-radius, var(--xh-shape-control))`——text-field 此前与输入框等高、select / tags-input 按指示符尺寸走 pill，`--xh-text-field-clear-*` / `--xh-tags-input-clear-*` / `--xh-select-clear-*` 槽改名 `action-*`；互斥一律由 connect 在被让位的部件上打 `data-clearable`、皮肤一条 `display: none`——select 去掉了 `:has()` 让位与 `:hover` 才显形（触屏此前根本看不到清空钮），清空钮改为 trigger 的兄弟并排（`--xh-select-control-gap`）。

  **键盘清空**：select · cascader · tree-select · popselect 此前没有任何键盘清空路径。现在焦点在 trigger、有值且可编辑时 **Delete 清空全部、Backspace 单选清空 / 多选去掉最后一个**，键盘表与一致性套件同步。

  **select** 补 `readOnly`（浮层照常展开、值改不动、清不掉）与 `VALUE.CLEAR` 事件（`api.clear()` 不再借 `VALUE.SET []`）；Vue 的 select / combobox Root 新增 `clearable`（缺省 false）决定 collection 自动渲染树是否带清空钮——combobox 此前无条件渲染，示例已补 `clearable`。

  **独立动作钮**（file-upload · signature-pad）：file-upload 的 `api.clearFiles()` 改名 `clear()`、`translations.clearFiles` 改名 `clearTrigger`；列表为空时不再原生 disabled（清完焦点会掉回 body），只打 `data-empty` 压淡。

  **浮层关闭钮**（dialog · drawer · popover · tour · toast · alert · floating-panel · image-viewer）统一 `var(--xh-<c>-close-size, var(--xh-control-h-sm))` / `var(--xh-<c>-close-radius, var(--xh-shape-control))`，dialog / drawer / popover / tour 补上使用者槽；image-viewer 保持 `--xh-control-h-lg`（全屏看片的 chrome 钮按触控靶走）但圆角归 control。**标签内移除钮**（tag · tags-input item · select tag）尺寸基准 `--xh-control-indicator-size`、圆角 `--xh-shape-inset`；行级删除钮（file-upload item · dynamic-input）按 `--xh-control-action-size` / `--xh-shape-control`。

  四类按钮都补了 `:active` 按压反馈（`--xh-motion-scale-press`），27 处登记进 `check-press-feedback`。

  `--xh-select-clear-*` / `--xh-tags-input-clear-*` / `--xh-text-field-clear-*` 共 20 个槽名变更是公开面删减，基线已推。

- ada8a01: 全局配置做成真正的 ConfigProvider：全局默认 + 局部覆盖，两个适配器一份语义。

  **嵌套注入改成逐键合并。** 此前子树里再 `provideXhConfig` 会把外层整份遮蔽——只想改一句文案，外层的 `locale` 与 `portalContainer` 一并丢掉，而文档一直把「不同子树各注各的」当卖点。现在键缺席与写成 `undefined` 都算「这一层没说」，一律回落外层；同一个组件下的文案也按键并。

  **Web Components 侧补上作用域。** 新增 `<xh-config>`：包住一棵子树，里面的元素沿 DOM 祖先链解析配置，合并规则与 Vue 侧完全一样（那边找组件树，这边找 DOM 树）。`setXhConfig` 仍管整页。元素自己不渲染任何东西，`display: contents`。

  **新增两个字段。** `size` 是尺寸档的应用级默认（对齐 AntD 的 `componentSize`），落到每个声明了三轴 `size` 的组件上；`floating-panel` 的 `size` 是一对像素数、同名不同义，两侧都在豁免名单里。`scrollRoot` 交出真正在滚的那个元素——宿主把滚动搬进内容容器时 `body` 本身不滚，模态浮层的滚动锁此前是空操作。`dir` 刻意不收：它走 DOM，行为层从计算样式读，再加一条 JS 通道只会对不上。

  **补上三处漏接。** `context-menu` 与 `tree-select` 声明了 `translations` 却没走 `withXhConfig`，全局文案对它们一直静默失效；`XhTranslationOverrides['date-field']` 指的是 `DatePickerTranslations`（`startDate` / `endDate`），而 `date-field` 的文案是逐段映射，类型过得去、运行期 100% 不命中，现改为 `DateFieldTranslations` 并把它从空接口填成段位映射。

  新增 `check-config-wiring` 门禁：两侧配置面字段必须一致、`size` 豁免名单两侧一致且与 headless 的类型对得上、声明了 `translations` 或三轴 `size` 的 Vue 组件必须真接上配置通道。

- e2292bf: date-picker 与 time-picker 补上三条视觉轴：`variant` / `tone` / `size`。

  这两个组件此前是全仓仅有的两处「有输入行却没有形态轴」——同一张表单里，
  文本框、数字框、分段日期、分段时间都能换档，唯独这两个换不了，只能靠覆盖令牌硬凑。
  它们各自内嵌的 `date-field` / 分段时间输入早就有三轴，缺的一直是外层这一份。

  轴的落法与全仓一致：三个属性只写在 `root` 上，输入行、日历格与浮层里的列都从那里继承皮肤声明的私有槽，
  所以换一档不必给每个部件各写一条选择器。

  皮肤同步把两份里原先散着的写死值收成私有槽：

  - 尺寸档换 `control-h` / `control-px` / 两档字号（time-picker 还多一个列表格子的内边距）
  - 形态档换底色与两档描边；输入类照例不做实心档——填满一个要往里打字的框，字与底没法同时读
  - 语气只落在聚焦环、段位反白、时间列选中与确认按钮上，正文与日期数字不归它管

  不写这三个属性时一个 `data-*` 都不产出，皮肤走缺省档，观感与之前逐像素一致。

- d0202b2: 开箱默认语言跟随运行时，兜底英文。

  此前是自相矛盾的：i18n 文档明写「内建文案默认是英文」，而日期系的兜底 locale 写死 `zh-CN`（calendar / heatmap / time 三处常量）——开箱就是**英文按钮配中文月份名**，热力图图例还是「少 / 多」。命令式 dialog 的按钮也硬编码着「确定 / 取消」，而那个服务自建 `createApp` 挂在 body 上，根本读不到组件树里的 `provideXhConfig`。

  现在 kernel 提供一条解析链 `resolveLocale(locale, scope)`：**作者显式传的 locale → 全局配置 → 宿主 `navigator.language` → `en-US`**。宿主读取一律经 `config.scope`（SSR 安全）。calendar / heatmap / date-field / date-picker / time 全部接上；`RuntimeConfig.locale` 的 `zh-CN` 兜底同改。

  **行为变更（预期之内）**：默认周首日随之从周一变成周日（`en-US` 口径）——要固定就显式传 `locale` 或 `firstDayOfWeek`。同时修掉一个此前没有测试覆盖的连带 bug：日历的周序号原先取每行**行首**那天算 ISO 周数，注释写着「行首正是周一」；周首日变成周日后，周日在 ISO 里属于上一周，整列周序号会集体少 1——改成取行内第 4 天，两种周首日下都必落在本行覆盖的那个 ISO 周内。

  `TimeProps.locale` 此前是 `'zh-CN' | 'en'` 的窄联合，与全局配置的 BCP 47 `locale` 对不上：配 `de-DE` 会让所有非 `'en'` 的语言（含 `en-US`）拿到中文用词。类型放开为 `string`，判据改成 `zh` 前缀匹配，`TimeLocale` 直接删除、不留别名。`HEATMAP_LEGEND_TEXT` 的「少 / 多」改 `Less / More`。

  `createDialogService` / `createToastService` 新增 `config?: XhConfig` 选项——服务在自己那棵子树里 `provideXhConfig` 一次，不造全局单例；按钮兜底改 `OK` / `Cancel`。

  登记未接的两处（都写进了 i18n 文档）：`time-picker` / `time-field` 的 `locale` 只影响小时制推断，接上宿主会让 `en-US` 环境静默翻成 12 时制，属另一条裁决；`heatmap` 的 `firstDayOfWeek` 是独立的 prop 轴，不随 locale 走。

- 0be028c: 抽屉可以挂在页面里的某一块区域上了，`portalContainer` 也不再是个死字段。

  `RuntimeConfig.portalContainer` 自打声明起就没人读过——全部浮层的搬运目标一律写死 `'body'`，
  所以「局部抽屉」根本做不出来。这次两头一起接：

  - **drawer 新增 `contained`**：遮罩与定位层从 `fixed` 换成 `absolute`，只罩住最近的定位祖先而不是盖满整屏。
    `data-contained` 同时落在 root / backdrop / positioner / content 上，页面里那半边与被搬走的那半边都能选到。
  - **Vue 新增 `container`**（选择器或元素）：浮层搬进那个容器，并**隐含 `contained`**——
    一处给定、两件事从它派生，不会出现「搬进去了但还画着全屏遮罩」这种两边各说各话。
    显式写了 `contained` 以显式的为准。
  - **`portalContainer` 真正接上**：`XhConfig` 多一个同名字段，应用级注入一次，
    没写 `container` 的浮层就落到它给的容器里；都没有才落 `body`。
  - **Web Components** 是 Light DOM，作者写在哪浮层就在哪，因此只需要 `contained` 这一个属性来让皮肤按容器画。

  那个容器要自己带 `position`（`relative` 之类），否则 `absolute` 会往上找到别的定位祖先——
  这一条写进了 props 说明与示例。

- 1b7a5f1: 统一性审计收口后的六条遗留项。

  **px 与 rem 按口径归位。** 字号七档 `--xh-font-size-xs…3xl` 从 px 改为 rem（0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75rem，根字号 16 时像素不变，使用者改根字号时整套排版随之缩放）；字形与控件几何改为 px：`--xh-glyph-size-sm/md/lg` 16 / 20 / 24px、`--xh-glyph-size-xl…4xl` 32 / 40 / 56 / 72px、`--xh-control-action-size` 24px（compact 20px）、`--xh-control-indicator-size` 16px（compact 14px）；color-picker 的动作钮与色块同样归 px。

  **side-nav 折叠态换枝播退场。** 机器里弹出面板的坐标改为按分支记账（`popoutPlacements`），换枝时旧面板保留坐标、`data-state=closed` 播 `xh-pop-out`，新面板同帧 `open` 播 `xh-pop-in`；此前旧面板的坐标在新枝 OPEN 那一拍被作废，退场瞬时。

  **tree-select 的 Vue Root 补 collection 自动渲染树。** 没给默认插槽且传了 `collection` 时自动铺 label? / trigger / clear-trigger? / positioner / content / tree（分支与叶子递归），新增 `label` prop 与插槽、`clearable` prop（缺省 false）；自动树与手写树 DOM 逐字同构，与 select / combobox 同口径。

  **门禁与测试整洁。** 三道浮层门禁共用 `tooling/scripts/lib/overlay-families.mjs`（名单与核实逻辑一份，各门禁的子集差异写明）；27 处测试里为旧 kernel 缺省桩的 `matchMedia` 删掉（减弱动效探测无 matchMedia 时已一律不减弱）。

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

- 1e90ce6: 热力图新增 `palette` 色板轴：`green` / `blue` / `orange` / `purple` / `red` / `gray`，直接按颜色点名色阶满档那一端，三种形态与图例一起跟着走。它是装饰性的一条轴，不是第四条语义轴——与 `tone` 同时写时听色板的，两条都压不过作者自己写的 `--xh-heatmap-ink`；不写时行为与之前逐字一致。

  令牌层随之补上紫色原语 `--xh-color-purple-600`：明度与彩度照 danger 的 600 档，只把色相换成 302。

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- d738f78: `date-picker` 与 `time-picker` 新增快捷选项：给 `presets` 数据就在浮层里多排一列（「今天」「近 7 天」「此刻」这类），点一条整份写进值。新增 `presets` / `preset` 两个部件、`getPresetsProps` / `getPresetProps` 两个产出与两条键盘行；这一列自成一套 listbox 键盘，与日历网格、时分秒那几列互不抢键。

  单日的值就是一条 ISO 日期串，区间用 ISO 8601 的区间写法把两端拼起来（`2026-08-15/2026-08-21`），一个串同时充当这一项的身份。日子由使用者算好传进来——连接层每帧求值，`today()` 放进渲染期会跨零点算出两个答案；headless 备了 `datePickerPresetDay` / `-Range` / `-Month` / `-Year` 与 `timePickerPresetNow` 五个纯函数。

  date-picker 的收起沿用 `closeOnSelect` 那条守卫（区间要两端齐、showTime 仍由确认按钮收口）；time-picker 的快捷选项给的是整份时间，写完即收。

- 9548330: 新增 `scrollbar` 组件：自绘滚动条，挂在**任意一个**滚动容器上——表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行，不必是本组件的后代。此前这套东西焊在 `scroll-area` 里，只有连视口带内容一起交出去的场景用得上。

  解剖 `root` / `track` / `thumb` 三层必需、`corner` 可选（横竖两条同时摆着时写在其中一条里补交叉口，配合 `gutter` 让两条各自让出那一格）；四种露面时机（`auto` / `always` / `scroll` / `hover`）带收起延时；拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限、成段的 `scroll-start` / `scroll-end` 与 `drag-start` / `drag-end` 都在库里。`focusable` 打开后滑块进 Tab 序、报 `role="scrollbar"` 与三个 `aria-value*`，方向键 / 翻页键 / Home / End 可用；缺省不进 Tab 序也对读屏隐藏——滚动本身由滚动容器报，同一件事没必要报两遍。触屏（粗指针）上默认交给原生滚动，整条不画并带 `data-native`，`forceVisible` 打开才画。收起不再打 `hidden`，而是 `data-state=hidden` 由皮肤淡出（`visibility` 随退场播完才收），露出同样淡入；根上另有 `data-hover` 标指针在不在这一片。

  **`scroll-area` 改由 `scrollbar` 组装。** 滚动区不再有自己的机器：它是视口加两条 scrollbar——`scrollbar` 角色节点是那条滚动条的挂载点、同时充当它的根，里面照 scrollbar 的写法摆 `track` / `thumb` / `corner`（戴 `data-scope="scrollbar"`），显隐、拖动、键盘、几何、触屏原生、淡入淡出全是 scrollbar 那一套，两个组件共用一份滚动条。Vue 新增 `XhScrollAreaTrack`；交叉口 `corner` 改写在竖条的挂载点里，两条都显形时才露；`scroll-area` 新增 `size` / `forceVisible`；视口的占道改打在视口自己身上（`data-lane-vertical` / `data-lane-horizontal`），不再依赖 `:has()`。原 `--xh-scroll-area-thumb-*` / `-bar-*` / `-corner-bg` 那几个槽随之归到 `--xh-scrollbar-*` 名下；`scrollAreaMachine` / `ScrollAreaSchema` / `SCROLL_AREA_*` 导出不再有，连接层改收两台 scrollbar 机器与 props（`scrollAreaScrollbarProps` 给出每台的 props）。挂了自绘滚动条的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此藏掉原生滚动条的外观——表格放进滚动区即可滚（吸顶表头与吸附列钉在视口上），虚拟滚动的视口给个 id 用 `controls` 挂上即可。

  滚动容器换了会自动把监听挪过去（`scrollable` / `controls` 指向另一个节点、或条件渲染的容器重建）；查不到时投一条 `scrollbar.missing-scrollable` 诊断，不静默，容器后到时调一次 `api.measure()` 即接上。容器里内容长短变了会自动重量（`MutationObserver` 盯着子树，一拍内合并成一次），量不到的场合另有 `api.measure()`。

- 35c9b65: 四家分段控件（date-field · time-field · date-picker · time-picker）的盒内布局统一。

  **解剖新增 `segment-group`**：包住全部段位与作者写在段间的分隔符。date-field / time-field /
  time-picker 三家新增这个部件，date-picker 已有的分段容器 `input` 改名为它——四家从此同名同职。
  time-picker 的 `input` 仍是段位本身（多实例），语义不动。

  破坏性改动：

  - `date-picker` 的 `input` 部件改名 `segment-group`，不留别名。
    - `getInputProps` → `getSegmentGroupProps`；`DatePickerInputProps` → `DatePickerSegmentGroupProps`。
    - Vue `XhDatePickerInput` → `XhDatePickerSegmentGroup`。
    - WC `@csspart input` → `@csspart segment-group`（作者标记写 `data-xh-part="segment-group"`）。
  - `--xh-time-field-segment-fg-placeholder` → `--xh-time-field-placeholder-fg`；
    `--xh-time-picker-segment-fg-placeholder` → `--xh-time-picker-placeholder-fg`。
  - `--xh-time-picker-column-max-h` → `--xh-time-picker-column-h`（列改定高）。
  - `--xh-date-picker-content-p` → `--xh-date-picker-content-py` / `-px`；
    `--xh-time-picker-content-p` → `--xh-time-picker-content-py` / `-px`。

  作者要把段位与分隔符挪进 `segment-group` 里，清空钮与展开钮留在 `control` 直属：

  ```html
  <div data-xh-part="control">
    <div data-xh-part="segment-group">
      <span data-xh-part="segment"></span>
      <span>:</span>
      <span data-xh-part="segment"></span>
    </div>
    <button data-xh-part="clear-trigger"></button>
  </div>
  ```

  行为与外观：

  - 尾部按钮一律靠框内末端，靠 `segment-group` 的 `flex: 1 1 auto` 顶；
    time-field 清空钮与 time-picker 展开钮的 `margin-inline-start: auto` 删掉。
  - 四家 `control` 的 `gap` / `block-size` / `padding-inline` / `min-inline-size` 逐条同值，
    `gap` 随尺寸档走 `--xh-control-gap-sm/md/lg`。
  - 时间列定高：`time-picker` 的 `column` 与 `date-picker` 的 `time-column` 走 `--xh-viewport-h-sm`，
    两家的快捷选项列同档；两家浮层补上最大高度。
  - 段位内衬统一 `--xh-space-1`；标题不再写 `cursor`；`:focus-within` 一律带 `:not([data-disabled])`；
    time-picker 聚焦时补画聚焦环；图标尺寸随尺寸档走 `--xh-glyph-size-sm/md/lg`。

- bbc3431: select 浮层多出一个底部操作区：「新建」「全选」这类按钮终于有地方放了。

  原来放不进去有两条硬理由，都不是样式能绕的：`content` 既是 `role="listbox"`
  （而 listbox 只许拥有 option 与 group，塞按钮进去是违规），又是那个 `overflow-y: auto` 的滚动容器
  （放进去的按钮会跟着条目滚走）。所以这次把两件事拆开：

  - **`content` 退成浮层外壳** —— 描边、底色、阴影、整体尺寸与键盘收口归它，它自己不滚。
  - **新增 `list` 部件** —— `role="listbox"`、条目的拥有关系、滚动与那个「无锚点时兜底的 Tab 位」全在它身上。
  - **新增 `footer` 部件** —— `list` 的兄弟。因此它既不进列表框的拥有关系，方向键与连打检索也走不到它，
    条目多到要滚时它仍贴在下沿不动。

  **破坏性变更（alpha 期）**：条目现在要写在 `list` 里。

  - Vue：`<XhSelectContent>` 与条目之间加一层 `<XhSelectList>`；底部操作区用新增的 `<XhSelectFooter>`。
    只传 `collection`、不写插槽的那条路由组件自己铺好，一个字都不用改。
  - Web Components：`<div data-xh-part="content">` 里加一层 `<div data-xh-part="list">` 包住条目。
    `list` 已列进 `requiredParts`，忘了写会在诊断通道上报 `wc.missing-part`，不会静默丢掉列表框语义。
  - `trigger` 的 `aria-controls` 随之改指 `list`（它才是那个列表框）。

- 4abe899: 统一性收口的头两批：先立门禁让跑偏能红，再补语义令牌把皮肤里的原语引用与互异的字面量收成一处。

  **海拔改按角色走。** `--xh-elevation-0…4` 五档删掉，换成三个角色：`raised`（静态抬起面：卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）、`floating`（锚定浮层：下拉、菜单、popover、hover-card、tooltip）、`sheet`（遮罩式与通知：dialog / drawer / toast / tour / floating-panel / float-button / back-top）。深色主题的三档更重、外加一圈 1px 浅描边，暗底上浮层才分得出层。34 份皮肤全部迁过去，`check-elevation-role` 校验每处阴影都走角色、且 27 个浮层/遮罩面的角色与部件对得上。这是公开面的删减，基线已推。

  **字号不再下探原语。** 新增 `--xh-control-font-sm/md/lg`（控件主文字，与 `--xh-control-h-*` 同构按档走）、`--xh-control-caption-sm/md/lg`（控件里的次级文字：提示、计数、快捷键、清空钮，比同档主文字低一级）、`--xh-text-heading-1/2-*`、`--xh-text-caption-size`、`--xh-text-secondary-size`。皮肤里两百三十处 `--xh-font-size-*` 引用全部换成语义档；typography 的六级标题与 rating 的星标是字号阶梯本身，登记为例外。`check-text-scale` 守住。

  **默认宽度、内衬、轨道、折叠面的共享字面量收成令牌。** `--xh-control-min-w`（12rem）统一了 select / combobox / tree-select / cascader / color-picker / date-picker 六个触发器此前的六个值，time-picker / text-field / date-field / time-field / password-input 五家此前没有任何宽度声明，现在同样接上；`--xh-surface-py/px-sm/md` 统一了 dialog / drawer / tour / floating-panel / toast 的内衬；`--xh-track-thickness` / `--xh-track-thumb-size` 给滑杆与进度条；`--xh-nav-link-max-w`、`--xh-viewport-max-h`、`--xh-motion-scale-drag`（减弱动效归 1）、`--xh-glyph-size-text`（跟文字走的字形尺寸）、`--xh-control-box-sm/md/lg`（pin-input 的方格，随 compact 收）、`--xh-switch-track-h-*`、`--xh-syntax-string/number/keyword`（code-block 与 json-viewer 的语法色，随主题明暗切换，皮肤里不再有 hex 字面量）。`check-shared-slots` 新增「同后缀跨组件字面量互异也报」。

  **聚焦态描边统一成一派。** 此前三派：描边不变只画环、描边跟着环色走（语气轴在这一派整个失效）、只画环不管描边。现在 21 份输入类皮肤都写 `border-color: var(--xh-<c>-<part>-border-focus, var(--xh-_tone, var(--xh-border-control-focus)))`，新令牌 `--xh-border-control-focus` 缺省等于 `--xh-border-control`；time-field 聚焦补上了此前缺的环。`check-focus-ring` 加校验。

  **图标尺寸接线。** 38 份画兜底字形的皮肤在 root（浮层族在 content）上声明 `--xh-icon-size: var(--xh-<c>-icon-size, var(--xh-glyph-size-text))`，兜底字形的盒同样按它量——作者往指示符槽塞 `<XhIcon>` 时不再从 1em 跳到 20px。`check-icon-size` 守住。

  **几何修正。** pin-input 的方格此前缺省引的是 lg 档高度、sm 档引 md；segmented 横排外盒此前 38px（item 32 + 轨道内衬 + 描边），现在外盒本身即一档控件高、段撑满轨道内侧；checkbox 的方框锚在 `--xh-control-indicator-size` 上随 compact 收；checkbox-group 的指示符不再是 16px 字面量。radio-group / checkbox-group / composer 的禁用态去掉叠加的不透明度（与容器一起变淡会把对比度压穿）。

  **门禁。** 新增 `check-stroke-scale`（描边宽度只走 `--xh-stroke-*` / ring）、`check-keyboard-suites`（键盘表非空 ⇒ 一致性套件存在且两个适配器都登记）；`check-control-height` 按「组件 → 控件本体部件」显式管辖（button / toggle / segmented / pagination 等此前在门禁外）并校验 sm/md/lg 档位与 `data-size` 对应；`check-disabled-contrast` 改正则并加跨块判定；`check-shape-scale` 扩到逻辑角与私有槽；`check-keyframe-refs` 增扫适配器源码里的内联动画名（反馈服务的加载徽记改用 Web Animations，不再依赖某份皮肤在场）；`check-state-vocabulary` 接上 `state-vocabulary.json` 真源（`data-state` 的 43 个取值分 9 个族，connect 字面量与皮肤选择器两头对表，并报告「发射但零引用」的属性）；`check-token-refs` 禁皮肤里的颜色字面量。

  **套件。** 补 image-viewer（8 行键盘表，Tab 循环两行 jsdom 豁免）与 side-nav（10 行含折叠态弹出）的一致性套件，Vue 与 WC 两侧登记。

- 35c9b65: 相似组件与组合组件的视觉、动效、行为收成一套口径。

  **盒的定义统一了。** 此前 16 个输入 / 选择控件有三种「盒」：9 家由 `control` 画描边与底、5 家由 `trigger`（一个 `<button>`）当盒、2 家由 `input` 自画。盒是 button 的那 5 家（select · cascader · tree-select · popselect · color-picker）没法把清空钮放进框里，只能贴在框外——这就是「清空钮位置不统一」的总根因。现在判据只有一条：**解剖里有 `control` 就是盒**，`trigger` 退化成盒内那颗 `flex: 1 1 auto; border: 0; background: transparent` 的按钮，聚焦环改画在 `control:focus-within` 上。cascader / tree-select / popselect / color-picker / text-field 的解剖新增 `control` 部件。

  **尾部按钮一律在框内最右。** 盒内布局恒为「内容区 `flex: 1` → 尾钮组 `flex: none`」。段位并排、没有单一容器的四家（date-field · time-field · date-picker · time-picker）新增 `segment-group` 部件把段位与分隔符包起来当内容区（date-picker 原有的 `input` 分段容器改名 `segment-group`，四家从此同名同职），`margin-inline-start: auto` 那套 hack 删掉。行内动作钮（清空 / 展开 / 明暗切换 / 加减）一律 `--xh-control-action-size` 方钮——number-field 的加减钮与 password-input 的明暗钮此前是「贴边的控件高钮」。

  **并排成对的面板定高。** 新增 `--xh-viewport-h-sm/md/lg`（12/16/24rem，compact 同比例收）。transfer 两侧列表此前是 `min 8rem / max 16rem`，条目搬走后整个组件跟着变矮——现在定高 `--xh-viewport-h-md`，左右等高、空侧也占满。cascader 的列、date-picker / time-picker 的时间列同样定高；单个浮层面板仍内容驱动，但补上了此前缺失的高度上限。

  **菜单族三家逐条同值。** `menu` / `menubar` / `context-menu` 共用同一台机器，皮肤却各写各的：menubar 根本没有 `item[data-state='open']` 这条规则，所以「发送到…」展开时不像 menu 那样加粗高亮。现在条目内衬 / 字号 / 圆角 / 行高 / 展开态 / 高亮态 / `content` 外观 / `separator` / `group-label` 全族同值，menu 补齐 `group` / `group-label` / `separator` 部件，子菜单箭头走字形令牌。navigation-menu 与 side-nav 的弹出面板按同族口径归队。

  **浮层面板与输入族小件归队。** `content` 一律双槽内衬 + 族档 min-w / max-w；cascader 的 48rem、color-picker 的 15rem、tour 的 22rem 等裸值改令牌（新增 `--xh-overlay-max-w-xl`）；label 颜色与间距、图标尺寸随档、聚焦环私有槽（invalid 时变红）、`:focus-within` 的禁用守卫、disabled / readonly 的三样齐——逐条统一。password-input 的明暗钮用上了新的 `--xh-glyph-mark-eye` / `-eye-off` 字形令牌。

  **门禁**：`check-control-box`（盒结构 12 条判据）、`check-panel-height`（面板高度只走滚动面令牌、并排面板必须定高）、`check-family-parity`（菜单族 / 分段族 / 下拉族 / 气泡族逐条同值）。

  公开面：五家 `--xh-<c>-trigger-*` → `--xh-<c>-control-*` 槽改名、date-picker 的 `input` 部件与 `XhDatePickerInput` 组件改名 `segment-group` / `XhDatePickerSegmentGroup`、`--xh-hover-card-font-size` 与 transfer 的 `-list-min-h` / `-list-max-h` 删除，共 43 项，基线已推。

- 520b847: 周序号成为一等部件 `week-number`，不再由使用者自己拼一列出来。

  上一版只把数字算出来（`panel.weekNumbers`），列宽得作者用行内 `grid-template-columns` 自己撑，
  库不管它的皮——同一份东西在不同项目里会长得不一样，这不是组件库该留的样子。

  - 解剖新增 `week-number`（可选部件，不写即不渲染），语义是这一行的表头（`role=rowheader`）：
    在 `role=grid` 里，一行的标号本就该是 rowheader，而不是又一个可选的格子
  - `getWeekNumberProps` / `getWeekNumberText` 两条，文字由两个适配器各自填，保证同构；
    表头那一格是占位、不带值，解析不了不抛、给空串占住列宽
  - 皮肤接管列宽与字样：摆了周序号格的行自动让出行首一列
    （`--xh-calendar-week-number-w`，默认 2.25rem），数字比日子小一号、颜色压下去、不跟着选中态走
  - 新增 `XhCalendarWeekNumber` / `XhDatePickerWeekNumber`；WC 侧写
    `<span data-xh-part="week-number" value="行首那天">` 即可

  选择器那条列宽规则写的是 `:not([hidden]):has(...)`——同特指度的规则谁在后面谁赢，
  不带这一道的话收起态会被这条 `display` 掀开（上一轮刚栽过一次，已有门禁拦着）。

### Patch Changes

- 7da1272: 废弃提示落地：五种没有 IDE 提示的介质在 dev 里经诊断通道发 `warn`。

  版本政策承诺过「dev 构建下经诊断通道发 warn」，此前一直未落地。现在 `@xihan-ui/kernel` 新增
  废弃登记表与探测：维护者 `registerDeprecation({ medium, match, message, replaceWith, until })` 登记
  一条，消费方的旧用法在 dev 里变成一条带迁移方向的诊断。

  五种介质与探测面：

  - `css-var` / `layer` / `selector` —— 样式表（`<style>` 文本与 CSSOM，跨域样式表静默跳过）
  - `attribute` —— DOM 里 `xh-*` 元素上的废弃 attribute（业务元素同名属性不误报）
  - `part` —— 作者写的 `data-xh-part` 角色名，由 Web Components 适配器的部件契约校验带上下文投递

  两个适配器都在 dev 里自动启动探测（Vue 在第一个组件建机器时借路启动一次，Web Components 在
  `defineXhElements()` 里启动），生产构建跳过；登记表为空时扫描器直接早退，零开销。同一废弃名
  无论命中多少条规则只报一次（通道去重）。登记表当前为空，发废弃时随 changeset 一起登记第一条。

- ed01a81: 框架元数据：名称、版本与运行时信息的单一事实源，与 XiHan.Framework 的 `XiHanMetadata` 同构。

  `@xihan-ui/kernel/metadata` 子路径新增 `XIHAN_UI_METADATA` 与 `XIHAN_UI_VERSION`（与 Framework 的独立 Metadata 包同理，主入口保持结构原语，不背它的体积棘轮）：

  - **静态常量集中维护**：名称 / 显示名 / 版权 / 作者 / 组织 / 仓库 / 文档 / 许可证 / 关键词 /
    支持平台 / 适配器清单 / 标志 / 寄语，全部 `Object.freeze`。
  - **版本从 package.json 派生**：`version` 与 `majorVersion` / `minorVersion` / `patchVersion` /
    `prerelease` 自动解析，锁步发版下改版本只改 package.json 一处。
  - **运行时信息**：`getRuntimeInfo()` 报 dev/prod 模式与 SSR 状态；两个适配器启动时用
    `registerRuntimeHost()` 登记自己，元数据据此报出「运行在哪个适配器、什么版本」——
    Framework 侧 EntryAssembly 概念在浏览器语境下的对应物。
  - **输出**：`getMetadataSummary()` / `getMetadataDetails()` 返回格式化文本（宿主行如实报
    锁步一致性），`print` 版只在 dev 出声，生产静默。
  - **启动横幅**：对齐 Framework 的 `XiHanApplicationBase`——引用即打印。适配器启动时
    （Vue 首个组件建机器 / WC 注册元素）自动打一次 Logo + 摘要（整页一次、生产静默），
    `setMetadataAutoPrint(false)` 可关。

  文档见新章节「框架元数据」（guide/metadata）。

- a321a50: 锁步版本检查:混装版本在 dev 里报 `core.version-mismatch`,不再只靠自觉。

  17 包同版本是硬承诺,但包管理器不会拦「vue alpha.2 + kernel alpha.3」这种跨包组合——
  类型对不上、同一个 `xh-` 标签被两个版本注册直接抛错,全部静默到运行时。现在 `@xihan-ui/kernel`
  导出自己的 `VERSION` 与 `checkLockstepVersion()`,两个适配器在 dev 启动时(与废弃探测同一次
  借路)拿自身版本比对,不一致经诊断通道发一条 warn,生产构建跳过。

- ac885c9: number-field 新增可选 `control` 部件:加减按钮叠进输入框内,与输入框成为视觉一体。

  此前加减钮与输入框是兄弟节点,受 HTML 约束进不了框内,只能三件并排。现在把输入框与两个按钮
  放进 `control` 部件,皮肤把描边、底色、聚焦环(改为 `:focus-within`)整体画在 control 上:
  框内 input 退成透明,减钮在左、加钮在右、输入框居中(顺序由作者模板决定),前后缀图标/文字
  直接流式插在 input 两侧,不用绝对定位;悬停/按下/贴边禁用沿用原有语义色。

  - **Vue**:新增 `XhNumberFieldControl`;`data-disabled` / `data-readonly` / `data-invalid`
    三个状态属性由 connect 落到 control 上。
  - **Web Components**:作者写 `<div data-xh-part="control">` 包裹即得同样的一体式。
  - **不写 control 时完全退回旧观感**:control 是可选部件,旧模板一行不改照常渲染,三档
    variant / tone / size 与旧式并排布局一致。

  一致性测试的 fixture 改成一体的 control 结构,两个适配器的 conformance 同步通过。

- b04e182: number-field 新增 `parse` / `format`：千位分隔符、单位后缀这类带格式的数字，现在不用把组件拆开自己拼了。

  `parse` 把显示串读成数（默认 `Number()`，`'12abc'` 判为非法），`format` 把数写回显示串（默认 `String()`）。
  两个方向必须互逆——`format` 出来的串要能被 `parse` 读回同一个数，否则按一下加号值就会漂。

  落点分得很清楚：

  - **`parse` 管所有"读"**：步进、取端点、失焦规范化、`aria-valuenow`、`valueAsNumber`、贴边判定，
    全都从它拿数。读屏念的因此是数，不是那串带逗号的显示文本。
  - **`format` 只管组件自己改写显示的那三处**：步进、取端点、失焦规范化。
    用户正在打字时一律不碰——中途补格式会打断光标位置。

  界仍按数比而不按串比，越界时先夹回区间再补格式。作者的 `parse` 返回了非数按 `NaN` 处理、
  `format` 返回了非串退回 `String(value)`，坏的返回值不会顺着流进后续计算。

- 93fdcb8: pin-input 新增 `pattern`：每格接受哪些字符可以自己定，不再只有 numeric / alphabetic / alphanumeric 三档。

  `pattern` 收一段正则源码，内部补上首尾锚与 `u` 标志后逐个字符整格匹配——作者写 `[0-9A-Fa-f]`
  就够，不必自己写锚点，代理对（emoji 这类）也匹得上。给了它就盖过 `type` 的准入表；
  写坏了（编不成正则）**退回 `type` 的准入表而不是放行一切**，也不抛。

  敲、粘贴、外部 `setValue` 三条写值的路都过同一份准入表。

  `type` 保留原职：它仍然决定移动端弹哪种键盘。准入放宽到字母时记得把 `type` 一并改掉，
  否则弹的还是数字键盘、那几个字符敲不进来——这一条写进了 props 说明与示例。

- 8d6e450: 整洁度归队（统一性审计的最后一批）。

  **令牌**：dialog / drawer 的宽度档提为 `--xh-overlay-sheet-w-sm/md/lg`（24/32/48rem）与 `--xh-overlay-drawer-w-sm/md/lg`（16/20/28rem），empty-state / result 的图标档提为 `--xh-glyph-size-xl/2xl/3xl/4xl`；`--xh-control-gap-lg` 此前与 md 恒等，改为 space-3（compact space-2）；补 `--xh-fg-warning` / `--xh-fg-info`（与 success 同构）。tokens README 写明 px 与 rem 的口径，以及「单行控件本体的槽一律叫 control」。

  **皮肤**：number-field 的 `--xh-number-field-input-h` 在 control 上用错部件名，改 `--xh-number-field-control-h`；spinner 三档归 glyph 尺寸族、anchor / pagination / steps / composer / menubar 的内衬对齐 control-px 阶梯；back-top / card / float-button / switch / dynamic-input 的阴影补使用者槽；timeline / typography / field / slider 的字面残留改令牌；30 处与令牌同值却不引令牌的兜底改引（15 处登记理由）；checkbox-group / transfer 的指示符字形与 checkbox 同一配方。菜单与列表族的条目高亮只认 `[data-highlighted]`（菜单族此前还并挂 `:focus` / `:focus-visible`）。

  **无障碍**：select 的触发器按 APG select-only combobox 打 `role=combobox` + `aria-haspopup=listbox` + `aria-controls`（popselect 是按钮式弹出保持 button）；image-viewer 触发器补 `aria-controls`；83 处 `aria-hidden` 统一写布尔；iconOnly 按钮没有 `aria-label` / `aria-labelledby` 时开发模式提醒一次（Vue / WC 把作者写在根节点上的可及名转告连接层）。

  **共享配方**：visually-hidden 的 9 条声明收成 headless 的 `VISUALLY_HIDDEN_STYLE`，六份 connect 引它；七份皮肤各自那份必须与 `visually-hidden.css` 逐条一致。

  **门禁**：`check-literal-fallbacks`（兜底字面量与令牌同值即红）、`check-visually-hidden`、`check-tone-contrast`（自算 oklch → WCAG 对比度，六族 × 两主题 26 组配对，1 组已知例外登记理由）、`check-aria-shapes`（aria-hidden 字符串写法 / listbox 触发器角色）；`check-elevation-role` 增「阴影必须带使用者槽」。

- bb47c3d: time-picker 的上午/下午在浮层里也成列：从此点得中，不必回到输入行敲。

  此前 12 小时制下浮层只排时分秒三列，上下午只有输入行里那一段能改——指针用户点开浮层，
  挑完时与分还得把手挪回段上，一次选值走两个地方。

  - 列的单位与分段输入里的段同名同域（新增 `dayPeriod`），恒排在末位、只在 12 小时制下出现；
    两格写 `'00'` / `'01'`，与这一段在 `aria-valuenow` 上报的数同一个域，
    选中比对、写值换算于是全都复用现成的那条路，浮层里挑与段上按 a / p 落到同一个 `setTimeDayPeriod`。
  - 新增 `getItemText`：格子上的文字改由它给，数字列还是格子自己的值，上下午列按 locale 译成
    「上午 / 下午」。两个适配器都改用它填文本，保证同构。
  - 上下午列跟着 min / max 收窄：当前小时翻到另一半天即出界时，那一格不可选（与时列互为对方的裁剪条件）。
    这与段上按 a / p 的处置不同——段上照写只做越界标注，列里则直接裁掉，两条路本来的语义就不一样。
  - 两端那一段的外角与浮层其余列一致；`granularity` 与它无关，`hour` 档也照排。

  `TimePickerColumn` 因此带上了单位的类型参数（缺省仍是全集，写 `TimePickerColumn` 的地方不用改）。
  date-picker 内嵌的时间面板恒为 24 小时制，用新增的 `DatePickerTimeUnit` 把「没有上下午那一列」写进类型里。

  顺带把 `custom-elements.json` 与 `public-surface.json` 重新生成：前者自 number-field 的
  control 部件落地起就没跟着更新过，后者漏了 kernel 的两个子路径入口。

- Updated dependencies [906b712]
- Updated dependencies [e12e337]
- Updated dependencies [ff84a16]
- Updated dependencies [97cbb2a]
- Updated dependencies [a55c76e]
- Updated dependencies [089db90]
- Updated dependencies [ada8a01]
- Updated dependencies [1461cec]
- Updated dependencies [e2292bf]
- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [0be028c]
- Updated dependencies [1b7a5f1]
- Updated dependencies [ed01a81]
- Updated dependencies [1e90ce6]
- Updated dependencies [a321a50]
- Updated dependencies [8d35702]
- Updated dependencies [ac885c9]
- Updated dependencies [b04e182]
- Updated dependencies [e31cc0a]
- Updated dependencies [d738f78]
- Updated dependencies [93fdcb8]
- Updated dependencies [516bd46]
- Updated dependencies [9548330]
- Updated dependencies [35c9b65]
- Updated dependencies [bbc3431]
- Updated dependencies [d0202b2]
- Updated dependencies [309feb2]
- Updated dependencies [8d6e450]
- Updated dependencies [bb47c3d]
- Updated dependencies [35c9b65]
- Updated dependencies [520b847]
- Updated dependencies [c2b9748]
  - @xihan-ui/headless@1.0.0-alpha.3
  - @xihan-ui/kernel@1.0.0-alpha.3
  - @xihan-ui/motion@1.0.0-alpha.3
  - @xihan-ui/behavior@1.0.0-alpha.3
  - @xihan-ui/backgrounds@1.0.0-alpha.3
  - @xihan-ui/position@1.0.0-alpha.3
  - @xihan-ui/machine@1.0.0-alpha.3
  - @xihan-ui/code-highlight@1.0.0-alpha.3
  - @xihan-ui/sound@1.0.0-alpha.3

## 1.0.0-alpha.2

### Minor Changes

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

### Patch Changes

- 09b5ad8: 「collection 铺开的结构凑齐必备部件」这条判据改成机检，并把三档语义写进文档。

  `collection` 收了数据不等于会替你渲染结构，而这件事此前既没有对外判据、也没有任何东西守着：
  14 个组件里 13 个在根上代铺、popselect 只在 content 里铺，使用者只能一个个试。
  官网落地时那棵树就是把数据写了一遍、DOM 又手码了一遍，两份得自己保持同步。

  新增 `tests/collection-required-parts.spec.ts`：逐个组件只交 `collection`、不写任何部件，
  断言铺出来的 DOM 含该组件 `meta.requiredParts` 里的每一个部件。少一个就是渲染出一个
  看着正常、其实不工作的组件——浮层打不开、方向键找不到条目、同一份结构写到自定义元素那侧
  会报 `wc.missing-part`。给新组件加代铺时先往这份测试加一行，铺漏了当场红。

  顺带查出并钉住两处此前没人测的差别：`popselect` 的铺开落在 content 部件里而不是根上
  （`<XhPopselectRoot :collection>` 单独用什么都不出），`mention` 的候选浮层没有 `defaultOpen`、
  敲下前缀字符才铺开。

  `guide/anatomy.md` 补「collection 管不管铺开结构」一节，三档逐个列出组件名，
  并写明判据是结构的自由度：扁平集合的 DOM 形状是确定的，代铺挡不住任何写法；
  层级与多区（`tree` / `cascader` / `transfer`）的结构有太多合理变体，代铺只会逼作者推翻重写。

- ae21590: 75 个组件的插槽写上真类型，`vue-tsc` 从此接得住插槽名与载荷键名的拼写错误。

  组件是渲染函数写的，`.d.ts` 里插槽泛型一直是空的（`DefineComponent` 的 `S` 位是 `{}`），
  于是 `#panel="node"`、`v-slot="{ pages, page }"` 这些载荷在消费端全是 `any`：
  键名写错不报、插槽名写错不报，只在运行期渲染出 `undefined`。props 与 emits 早就有完整类型，
  唯独插槽这一层没有对外描述——而无头库恰恰是靠插槽把控制权交回作者的。

  现在每个带载荷的插槽都有具名载荷类型（`TabsPanelSlotProps`、`StepsRootSlotProps` 这样命名，
  均从主入口导出），组件上声明 `slots: Object as SlotsType<…>`：

  ```vue
  <template #panel="node">{{ node.lable }}</template>
  <!-- TS2551: Property 'lable' does not exist on type 'TabsNodeMeta'. Did you mean 'label'? -->
  ```

  两条形状上的取舍值得写下来：

  - **键一律可选**。非可选时 `slots.default ? 作者内容 : 按 collection 铺开` 这类判断在类型上恒为真，
    而它承载的正是「没写默认插槽就铺开整套结构」的核心行为——类型不能对着它撒谎。
  - **值一律写成函数类型**而不是裸载荷类型。Vue 的 `UnwrapSlotsType` 对函数类型原样保留、
    对裸类型套一层 `Slot<T>`，而 `Slot<T>` 的实参元组在 `T` 不 extends `undefined` 时是 `[T]`
    ——零参调用会变成非法，而库里到处是 `slots.default?.()`。

  新增 `check-slot-types` 门禁盯住这两条与「带载荷就必须声明」，`pnpm gate` 由十七项变十八项。

- ba3b3aa: 自定义元素补上全局文案层：`setXhConfig`。

  `provideXhConfig` 一直只有 Vue 适配器有。自定义元素拿不到 provide/inject，文案又是对象、
  只能走 property 不能走 attribute，于是 31 个元素只能在 JS 里逐实例各设一次 `.translations`——
  一个中文应用要为此写几十行。而 `guide/i18n.md` 通篇把 `provideXhConfig` 当作「这套机制」讲，
  一次都没提 Web Components，读的人会以为两端通用。

  现在两端各有一处全局出口，取值优先级一致：**实例 → 全局 → 组件内建默认（英文）**，
  `translations` 逐键合并。切语言再调一次 `setXhConfig` 即可，已挂载的元素跟着重渲。

  接线落在 `MachineController` 一处——31 个元素的机器 props 都从那里过，不必逐个改。

  `XhTranslationOverrides` 那张 31 条的映射表下沉到 `@xihan-ui/headless`，两个适配器共用一份。
  在 WC 侧另抄一份是唯一的替代方案，而两份 31 条的表迟早会漂。Vue 侧原样再导出，导出名不变。

  与 Vue 侧的两处差别写进文档了：`setXhConfig` 是整份替换而非深合并；它是模块级的，
  没有「只在某棵子树里换语言」的能力。

- Updated dependencies [3469066]
- Updated dependencies [466f143]
- Updated dependencies [7a5d898]
- Updated dependencies [52729a1]
- Updated dependencies [ba3b3aa]
  - @xihan-ui/backgrounds@1.0.0-alpha.2
  - @xihan-ui/headless@1.0.0-alpha.2
  - @xihan-ui/motion@1.0.0-alpha.2
  - @xihan-ui/behavior@1.0.0-alpha.2
  - @xihan-ui/kernel@1.0.0-alpha.2
  - @xihan-ui/machine@1.0.0-alpha.2
  - @xihan-ui/code-highlight@1.0.0-alpha.2
  - @xihan-ui/position@1.0.0-alpha.2
  - @xihan-ui/sound@1.0.0-alpha.2

## 1.0.0-alpha.1

### Major Changes

- d43624c: 把跨组件已经分叉的名字统一回一套。part 名与 prop 名在 1.0 之后就是公开 API——皮肤按
  `data-part` 选择、使用者按 prop 名调用——改名一律是破坏性变更，所以趁 alpha 一次改完。

  **time-picker 的列表条目由 `option` 改叫 `item`。** 另外 32 个组件的列表条目都叫 `item`，
  只有它是 `option`。ARIA 角色仍是 `role="option"`（那是角色不是部件名），列里的候选值集合
  `TimePickerColumn.options` 也不动（那是数据不是部件）。

  迁移点：

  - `data-part='option'` 改成 `data-part='item'`；皮肤覆盖槽 `--xh-time-picker-option-*`
    改成 `--xh-time-picker-item-*`（共 10 个）。
  - Vue 组件 `XhTimePickerOption` 改名 `XhTimePickerItem`。
  - WC 的 `::part(option)` 改成 `::part(item)`。
  - headless 导出：`timePickerOptionQuery` → `timePickerItemQuery`、`findTimePickerOption` →
    `findTimePickerItem`、`timePickerOptionValue` → `timePickerItemValue`、
    `TimePickerOptionProps` → `TimePickerItemProps`。
  - `TimePickerApi` 上：`getOptionProps` → `getItemProps`、`isOptionSelected` → `isItemSelected`、
    `isOptionDisabled` → `isItemDisabled`、`focusedOption` → `focusedItem`。
  - 键盘规格号 `time-picker.kbd.option-*` → `time-picker.kbd.item-*`。

  **transfer 的数据入口由 `items` 改叫 `collection`。** 另外 17 个集合组件的数据入口都叫
  `collection`。单条的类型名 `TransferItem`、某一侧看得见的条目 `visibleItems`、纯函数
  `transferVisibleItems` 都不动——它们说的是「条目」，不是「数据入口」。

  迁移点：

  - Vue：`<XhTransferRoot :items="…">` 改成 `:collection="…"`。
  - WC：`el.items = […]` 改成 `el.collection = […]`（这个入口表达不成属性，本来就只能走 property）。
  - `TransferApi.items` → `TransferApi.collection`。

  **checkbox-group 的组内子部件对齐 radio-group。** 同一语义两套名字：checkbox-group 用
  `item-control` / `item-hidden-input`，radio-group 用 `indicator` / `hidden-input`。裸名是全仓
  多数（`indicator` 13 处、`hidden-input` 10 处），checkbox-group 随大流。`item-text` 不动
  （21 份解剖都这么叫）。

  迁移点：

  - `data-part='item-control'` → `'indicator'`，`data-part='item-hidden-input'` → `'hidden-input'`。
  - 皮肤覆盖槽 `--xh-checkbox-group-control-*` → `--xh-checkbox-group-indicator-*`（10 个），
    与 radio-group 的 `--xh-radio-group-indicator-*` 对齐。
  - `CheckboxGroupApi.getItemControlProps` → `getIndicatorProps`，
    `getItemHiddenInputProps` → `getHiddenInputProps`（两个名字 radio-group 早就在用）。
  - Vue 组件 `XhCheckboxGroupItemControl` → `XhCheckboxGroupIndicator`。

  **table 的空态部件由 `empty-state` 改叫 `empty`。** 部件名不该与组件的 scope 名撞车——
  `empty-state` 是一个独立组件的 `data-scope`，再拿它当 table 的部件名，写皮肤时
  `[data-part='empty-state']` 与 `[data-scope='empty-state']` 混在一起读不出谁是谁。
  combobox 早就叫 `empty`。独立的 `empty-state` 组件本身不动。

  迁移点：

  - `data-part='empty-state'` → `'empty'`。
  - `TableApi.getEmptyStateProps` → `getEmptyProps`。
  - Vue 组件 `XhTableEmptyState` → `XhTableEmpty`（`XhEmptyState*` 那一族是另一个组件，不变）。
  - WC 的 `::part(empty-state)` → `::part(empty)`。

  **transfer 的 `onSelectedChange` 改叫 `onSelectionChange`。** table 与 tree 都叫
  `onSelectionChange`。受控的 `selected` prop 与载荷字段 `{ selected }` 不动——那是「被勾中的值」，
  与回调名说的不是一回事。

  - `TransferSelectedChangeDetails` → `TransferSelectionChangeDetails`。
  - Vue 事件 `@selected-change` → `@selection-change`；WC 的 `selected-change` 事件同改。
  - `v-model:selected` 不变。

  **`size` 不再一名两用。** 三轴里的 `size` 是语气枚举，而 qr-code 的 `size` 是像素数值、
  splitter 的 `size` 是百分比数组——两者占着同一个名字却是完全不同的类型，使用者写
  `size="md"` 得到的是静默的错。

  - qr-code：`size` → `pixelSize`（WC 属性 `size` → `pixel-size`）。中心 logo 挖空区的
    `QrCodeLogoArea.size` 是模块数标量，不动。
  - splitter：数组值的一律改复数——`size` → `sizes`、`defaultSize` → `defaultSizes`、
    `onSizeChange` → `onSizesChange`、`onSizeChangeEnd` → `onSizesChangeEnd`、载荷字段
    `{ size }` → `{ sizes }`、机器事件 `SIZE.SET` → `SIZES.SET`、Vue 的 `v-model:size` →
    `v-model:sizes`、WC 属性 `size` → `sizes`。标量的不动：每块面板的 `collapsedSize`、
    `BOUNDARY.SET` 的 `size`、`setPanelSize`、`SplitterPanelState.size`。

  **没有合并的一处，记在这里免得后人重新翻案。** 就绪度审计说 pin-input 的 `onValueComplete`、
  editable 的 `onValueCommit`、slider 的 `onValueChangeEnd` 是「三个名字表达同一语义」，
  逐条读过源码后判定不成立：`onValueComplete` 是「每格都填满的那一刻」（值的形状谓词），
  `onValueCommit` 是「提交那一刻」（用户显式确认），`onValueChangeEnd` 是「一次操作结束」
  （手势结束，splitter 的 `onSizesChangeEnd` 用的是同一套）。三件不同的事，合并会让 API 更差。

### Minor Changes

- a19bbaa: 级联选择补空态兜底：新增 empty 部件，搜索无候选或 collection 为空（根列没有条目）时露面，其余时候带 hidden。

  - headless：`getEmptyProps` 管空态占位的露面与收起；`getSearchListProps` 无候选时带 `data-empty`，`getContentProps` 根列没有条目时带 `data-empty`；新增 `translations` prop（`empty` / `noMatch` 两键，默认英文）与 api 上并入默认后的完整一份。
  - vue：`XhCascaderContent` 自动补渲空态占位，`empty` 插槽可换内容，缺省文案按视图取无匹配或无数据；`translations` prop 接入全局 `provideXhConfig` 注入点（`translations.cascader`）。
  - web-components：新增可缺省的 `empty` 部件，元素代管其 hidden，文案归作者。
  - styles：空态占位居中排版（`--xh-cascader-empty-min-h` / `--xh-cascader-empty-p` / `--xh-cascader-empty-fg` 可覆写）；无候选时候选列表不再占位，根列没有条目时空列让位。

- ea78591: checkbox 与 switch 能进 HTML 表单了。表单字段组件从 18 个变成 20 个，五个缺口清完。

  **先纠正一条我此前记错的约束**：我曾把这两个记为「要单独一轮，因为 HTML 内容模型禁止 button 有
  交互后代」。查规范后不成立——interactive content 的定义里 `input` 那条写的是「**type 属性不处于
  Hidden 状态时**」，所以 `<input type="hidden">` 不是交互内容，放进 `<button>` 里是合法的。
  DOM 不必重构，与 color-picker、combobox 同一条路。

  - 新增 `hidden-input` 部件、`name` 与 `value` 两个 prop（`value` 缺省 `'on'`，与原生一致）。
  - **勾上才带 `name`**：没勾就整条不参与提交，这是原生复选框的语义。
  - **半选按未勾处理**：原生里 indeterminate 只是外观，提交与否看 `checked`。
  - Vue 侧由组件自己渲染（单体控件没有子部件插槽，作者递不进来），**给了 `name` 才有这个节点**——
    没给就与从前逐字节相同。WC 侧照旧由作者写 `data-xh-part="hidden-input"`。

  **两者的重置走转移而不是写 context**：它们的值就是机器状态（`on` / `off` / `indeterminate`），
  没有值 cell 可 reset。`FORM.RESET` 因此是一组带守卫的转移，受控时只发意图、非受控才真的转过去；
  已经停在默认态就不白发一次通知。

  如实记一处限制：`onCheckedChange` 的载荷刻意只有布尔（「用户交互的落点只可能是全选或全不选」），
  表达不了半选。所以回落点是半选时状态照常转、通知不发；受控且默认半选的组合因此拿不到重置。
  不为这一处去改已公开的载荷类型。

- 72dc39c: color-picker 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 里提交，`FormData` 里没有这个字段。
  同仓 11 个组件早就做全了这件事，它是缺口之一。

  照仓内既成的形状补：新增 `hidden-input` 部件（`type=hidden`，排在解剖末位）、`name?: string` prop、
  `ColorPickerApi.getHiddenInputProps()`。影子产出的属性恰好五条——parts 属性、`type`、`name`、`value`、
  `disabled`——`type` 必须排在 `value` 前（改 type 会重置输入的值），`name` 不给就整条不产出、这份输入
  不参与提交，禁用时带原生 `disabled` 不提交值，只读照常提交。

  **这是纯增量**：影子是作者自己写的可选部件（Vue 侧新增 `XhColorPickerHiddenInput`，WC 侧新增
  `::part(hidden-input)`），不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。

- a7e8755: combobox 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 提交，`FormData` 里没有这个字段。

  **形状照 tree-select，不另起一套**：单个 `hidden-input` 部件（`type=hidden`，排在解剖末位），
  多选按逗号拼成一串。同为多值浮层选择器的 tree-select 已经是这个形状，combobox 换一种（比如
  一值一个影子输入、或隐藏 `<select multiple>`）会凭空造出第二套约定。

  如实记一笔：逗号拼串对含逗号的值不可逆，也不是原生的多值 `FormData`（`name=a&name=b`）。
  这是 tree-select 已有的性质，要改得两个一起改，是另一件事。

  纯增量：影子是作者自己写的可选部件，不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。
  判据也按这个形状加——只在本用例的 fixture 里挂影子，其余用例的 order/counts 一条没改。

  **顺带被门禁逼出来的一件事**：加了 `name` 之后 `check-form-reset` 当场变红——带 `name` 就是表单
  字段，就必须认表单重置。combobox 因此一并接上了 `FORM.RESET`：值与输入串是两条独立受控轴各判各的，
  高亮锚点一并清（它指向的条目可能已被过滤掉）。表单字段组件从 17 个变成 18 个。

- e50a7c9: 复合控件开始响应表单重置。这一版落地机制本身与首个组件 radio-group，其余 16 个随后。

  实测过的缺陷：把本库的控件放进 `<form>`，调 `form.reset()`（或点 `XhFormResetTrigger`），
  显示与提交值都停在用户改后的状态——原生重置只还原原生控件，而这些控件的值攥在机器里，
  没有任何一处监听所属表单的 reset。

  **机制**：认重置的机器在根级声明一条无守卫、无载荷的 `FORM.RESET`，动作只做一件事——
  对若干个 cell 各调一次 `context.reset(key)`，即**重新求一遍那个 cell 自己的 `defaultValue` 表达式**
  再走原来的 `set`。落点因此与 cell 定义是同一份代码，不会各写一份而漂移；受控分支原样保留，
  所以「受控只发意图」是免费守住的。适配器侧只在唯一的机器接入点（Vue 的 `useMachine`）挂桥，
  组件文件零改动。

  一句话：`FORM.RESET` = 「把这个组件变回它此刻挂载会长成的样子」。

  **落点不取挂载时冻结的 `initial`，而是按当下 props 重算**。宿主换了 `defaultValue`（比如切去编辑
  另一条记录）就该回到新的那一份，这与原生 `reset()` 回到「当下的 default」一致。

  **受控且宿主没声明 `defaultValue` 时一动不动。** 这是最要紧的一条：cell 里那句 `?? 兜底` 把
  「宿主声明的默认值」和「组件的空值」烘在同一个表达式里（radio-group 是 `null`、rating 是 `0`、
  tags-input 是空数组）。照直落下去，受控分支会把这个空值当意图发给宿主——重置就从「没反应」
  变成「把宿主的数据抹掉」。`resetDeclaredValue` 把这一步挡住了，并有专门的判据钉着。
  **受控组件要拿到重置，必须显式传 `defaultValue`**，这是本库与「受控 reset 是纯空操作」的分歧点。

  **监听挂在锚点的 root node 上**，不挂在那个 form 上：form 会被条件渲染换掉、组件也会被搬走。
  归属在事件那一刻用 `closest('form')` 现算，因此嵌套表单不会误伤。重置被 `preventDefault` 拦下时
  不动——那时同表单的原生控件也没还原，组件单方面还原会拼出半份默认值。

  无 form、无 DOM、作者没写影子输入三种情形都不需要特别处理：归属判定不命中、服务端根本不挂效应、
  锚点是组件根节点而不是影子输入。

  BREAKING CHANGE: `Bindable` 新增必填成员 `reset()`，`ContextFacade` 新增 `reset(key)`。
  自建 `ReactiveRuntime`（写第三个适配器）的实现方需要补上 `reset`。仓内三处实现已全部跟进。

- a41b931: 进度条新增环形与仪表盘两种形态。

  - 新增 `variant` 轴：`line`（缺省，行为逐字不变）/ `circle` / `dashboard`，以及 `canvas`（承载环的 svg）与 `label`（环心那一块）两个可缺省部件。
  - 新增 props：`strokeWidth`（环的线宽，viewBox 单位，缺省 6）、`gapDegree` 与 `gapPosition`（仪表盘的缺口，缺省 75 度朝下）、`valueText`（进度不是百分比时给读屏念的那句话）。线宽是 prop 不是令牌——它改的是几何，半径要跟着往里收；线形的厚度仍走 `--xh-progress-thickness`。
  - 环的直径、底槽色、进度色与端点形状走令牌（`--xh-progress-size` / `-track` / `-range` / `-linecap`），几何由连接层算好写进标记，皮肤只上色。

  顺带两处修正：

  - 退化输入不再算成满进度：`max` 不为正或不是数时回落 100，`value` 不是数时按 0 处理（此前 `max=0` 会让进度算成满格）。
  - 线形的长度不再取整：`value=3 / max=8` 由 38% 改为 37.5%，相邻两档不会再看起来一样长。

- 4b949c2: 摇树第一次真的生效：只用一个组件不再拖来整个库。

  此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效——
  使用者只 `import { XhBadge }`，打出来的东西和全量 barrel 一样大。

  产物改为保留模块结构（每个源文件一份产物），实测（esbuild 打真实 dist，gzip）：

  | 用例                | 改前      | 改后         |
  | ------------------- | --------- | ------------ |
  | 只用 `XhBadge`      | 168,947 B | **538 B**    |
  | 只用 `XhButton`     | 168,947 B | **1,029 B**  |
  | 只用 `XhDialogRoot` | 168,947 B | **11,374 B** |
  | 全量 barrel         | 173,005 B | 178,768 B    |

  单组件占全量从 **97.7% 降到 0.3%**。全量 barrel 略涨 3%，是模块边界不再被合并的代价，值得。

  **判据补上了此前没有的分辨力。** `.size-limit.json` 原有 18 条全是整包 barrel，改回单入口不会让任何
  一条变红。新增三条带 `import` 字段的按组件预算（badge / button / dialog），退回打包形态时它们会
  立刻超标一个数量级。

  顺带修掉两处被这次改动照出来的既有缺陷：

  - **公开面基线虚高 81 个名字。** `build-public-surface.mjs` 抽类型名的正则里 `export` 是可选的，
    于是把打包版 d.ts 里那些**没有导出**的内部类型别名（`AccordionProps` 这类局部别名共 72 个）也算
    成了受 semver 约束的公开名。实测确认它们从来就 import 不到（`TS2305: has no exported member`）。
    正则补上 `export`，基线随之收敛。
  - **文档生成器只认 `declare`。** 拆包后 barrel 里不再有 `declare`，导致 102 页组件文档的
    「Vue 组件」整列凭空消失。改成 import 与 export 两种形态都收。

  新增一个公开类型 `TweenEasing`：`NumberAnimationEasing` 本就是它的别名，拆包后别名要能被命名，
  这一支就必须公开。

### Patch Changes

- 89d8c54: 修四处在真实宿主里才现形的缺陷，`hideOutside` 的入参形状随之变化。

  **嵌套浮层不再被外层罩死。** 对话框里再开一个对话框（或抽屉），内层 portal 到 `body` 之后也是
  `body` 的直接子元素，会被外层背景失活的 `MutationObserver` 一并打上 `inert`——看得见、点不动。
  层注册表新增 `elementsAbove(layer)`，给出栈中位于该层之上的各层全部节点；`dialog` 与 `drawer`
  把它并进背景失活的目标集。

  **破坏性变更**：`hideOutside(targets, scope, options)` 的第一个参数由 `Element[]` 改为
  `() => Element[]`。施加 `inert` 的时机横跨整个展开期，晚于调用时刻才挂载的节点必须也能被算进目标，
  定死的数组做不到。调用点把数组包成箭头函数即可。同时 `LayerRegistry` 新增 `elementsAbove` 成员，
  自行实现该接口的需要补上。

  **破坏性变更**：`@xihan-ui/machine` 的 `Dict` 改为从 `@xihan-ui/kernel` 转出。两个包此前对同一个
  名字给出不同泛型元数（`Record<string, T>` 与 `Record<string, any>`），从哪个包导入会决定
  `Dict<string>` 编不编得过。

  **首屏即展开的对话框与抽屉能服务端直出了。** `rendered` 的初值此前整块圈在「有 document」的分支里，
  服务端算不出它，只发一个 23 字节的空占位：首屏没有对话框、没有可被索引与读屏读到的正文，
  客户端水合时再整棵补出来。初值改取状态机的展开态。

  **没有 window 的宿主里不再抛异常。** `prefersReducedMotion`、`onReducedMotionChange`、
  `createEnvSignals` 的默认参数写的是裸 `window`，而默认参数在函数体的守卫之前求值——三者的注释都
  承诺 SSR 期回落，实际是 `ReferenceError`。改走 `globalThis.window`，签名不变。

- Updated dependencies [b8afdb2]
- Updated dependencies [a19bbaa]
- Updated dependencies [ea78591]
- Updated dependencies [72dc39c]
- Updated dependencies [a7e8755]
- Updated dependencies [e50a7c9]
- Updated dependencies [98d7ffe]
- Updated dependencies [d43624c]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [a41b931]
- Updated dependencies [0a57e2f]
- Updated dependencies [24721f4]
- Updated dependencies [4b949c2]
  - @xihan-ui/sound@1.0.0-alpha.1
  - @xihan-ui/headless@1.0.0-alpha.1
  - @xihan-ui/machine@1.0.0-alpha.1
  - @xihan-ui/behavior@1.0.0-alpha.1
  - @xihan-ui/kernel@1.0.0-alpha.1
  - @xihan-ui/position@1.0.0-alpha.1
  - @xihan-ui/code-highlight@1.0.0-alpha.1
  - @xihan-ui/backgrounds@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

- 84b1aa3: 新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

  旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
  npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
  描边、`stroke-width` 2。

  用法：

  - `@xihan-ui/kernel` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
  - `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
  - `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/web-components` 注册 `<xh-icon>`
  - `@xihan-ui/styles` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

  图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
  解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
  整个失效。

  WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
  作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
  `<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

  可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
  输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
  读屏会念两遍。

- e788896: Select 支持多选，选中值由单值改为集合，公开 API 破坏性变更。

  多选打开方式是 `multiple`：点中条目即在集合里增删该项，列表不收起；单选行为不变，只是选中值
  的容器形状统一成了数组（单选恒为长度 ≤ 1）。

  迁移点：

  - `SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`。原先判空写 `details.value === null`
    的，改判 `details.value.length === 0`；取单选值写 `details.value[0]`。
  - `SelectApi` 的 `value` 与 `valueText` 由单值变数组，两者逐项对应；`setValue` 签名变
    `(next: string | string[]) => void`，裸串按单选简写处理；新增 `multiple`。
    想拿「显示成什么字」不必自己拼，用 `displayText`：有选中取选中项文本（多选按半角逗号加空格连起来），
    否则取 `placeholder`。
  - Vue 默认插槽暴露的 `value` 与 `setValue` 随之变化；`update:value` 的载荷由单值变数组，
    因此 `v-model:value` 绑定的变量类型要一并改。`value` / `default-value` 两个 prop 仍接受裸串与 `null`。
  - WC `value-change` 事件的 `detail` 由 `{ value: string | null }` 变 `{ value: string[] }`；
    新增 `multiple` 属性。`value` 属性只递得进单值，多选集合请写 property。
    表单影子 `hidden-select` 不再写 `value`，选中态一律由 `option` 的 `selected` 表达（多选时开原生
    `multiple`）—— 靠读 `hidden-select.value` 反查选中项的代码要改成读 `selectedOptions`。

### Minor Changes

- c5c5f7f: 两个适配器接上视觉层，各自走独立子入口 `@xihan-ui/vue/backgrounds` 与 `@xihan-ui/web-components/backgrounds`。

  `@xihan-ui/backgrounds` 声明为**可选 peer**：主入口一行都不引它，不用视觉效果的应用不会因为装了适配器
  而多出一个 WebGL 引擎。

  Vue 侧三种用法，从轻到重：`v-background` 指令、`XhBackground` 组件、`useBackground` 组合式函数。
  指令用在组件上时 Vue 会把它落到该组件的单一根元素上，所以给现成组件加背景不必改动组件本身。

  WC 侧是 `<xh-background>`：元素自身就是画布容器，内容照常写在里面，效果铺在内容底下，
  画布 `pointer-events: none` 不挡交互。参数走 `.params` property，点云走 `.setCloud()`。

### Patch Changes

- Updated dependencies [bc65cb7]
- Updated dependencies [84b1aa3]
- Updated dependencies [e788896]
- Updated dependencies [46b82b0]
  - @xihan-ui/kernel@1.0.0-alpha.0
  - @xihan-ui/machine@1.0.0-alpha.0
  - @xihan-ui/behavior@1.0.0-alpha.0
  - @xihan-ui/headless@1.0.0-alpha.0
  - @xihan-ui/position@1.0.0-alpha.0
  - @xihan-ui/code-highlight@1.0.0-alpha.0
  - @xihan-ui/backgrounds@1.0.0-alpha.0
