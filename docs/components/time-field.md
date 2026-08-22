# 时间输入 <Badge type="info" text="time-field" />

分段的时间输入框：时、分、秒各占一段，方向键加减。

## 何时使用

- 用户知道确切时间，打字比翻列表快。
- 需要 12 小时制并带上下午段位。

## 何时不用

- 需要从固定的整点或半点里挑：用[时间选择器](./time-picker)。
- 需要日期：用[日期输入](./date-field)。

## 特性

- `hourCycle` 切 12 / 24 小时制，12 小时制时自动多一个上下午段位。
- `granularity` 决定精确到分还是到秒。
- `min` / `max` 越界时只标注不改写。
- 框内自带清空钮（`clear-trigger`）：有值才显形，点完焦点回到第一段。

## 示例

### 基础用法

默认 24 小时制，上下键在段区间里回绕，缺一段整份值就退回空串

<XhDemo src="time-field/01-basic" />

### 12 小时制

hour-cycle=12 多出一个上午/下午段，值本身仍是 24 小时的串

<XhDemo src="time-field/02-hour-cycle" />

### 精度到秒

granularity=second 让秒段显出来并参与值，空段按上下键从该段边界起步

<XhDemo src="time-field/03-granularity" />

### 禁用与越界

禁用整组退出 Tab 序；越界只做标注，08:00 原样留着不被改写

<XhDemo src="time-field/04-state" />

### 形态

variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变

<XhDemo src="time-field/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴

<XhDemo src="time-field/06-tone" />

### 尺寸

不传 size 即默认档；行高、内边距与字号一起换档，标题也跟着变

<XhDemo src="time-field/07-size" />

### 外部写值与清空

值由宿主持有，按钮直接写值；框内自带清空钮，有值才显形，点完焦点回到第一段

<XhDemo src="time-field/08-actions" />

### 可选值白名单

值交给宿主持有，写回来的时间被吸附到清单里的一格，上下键与数字键因此都落在清单上

<XhDemo src="time-field/09-whitelist" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-field>` |
| Vue 组件 | `XhTimeFieldClearTrigger` `XhTimeFieldControl` `XhTimeFieldHiddenInput` `XhTimeFieldLabel` `XhTimeFieldRoot` `XhTimeFieldSegment` `XhTimeFieldSegmentGroup` |
| 组合式函数 | `useTimeField` |
| 状态机 | `timeFieldMachine` |
| 皮肤 | `@xihan-ui/styles/time-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="time-field"`：**`root`** · `label` · **`control`** · `segment-group` · **`segment`** · `clear-trigger` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值，ISO 时间串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `min` | `string` |  | 下界（含）。只用来标注越界，不改写用户填进去的东西。 |
| `max` | `string` |  | 上界（含）。同上。 |
| `locale` | `string` |  | BCP 47 语言标记。决定上午/下午的文字，以及未显式给 hourCycle 时的小时制。 |
| `hourCycle` | `TimeHourCycle` |  | 小时制。不给则按 locale 推断，locale 也没有时用 24。 |
| `granularity` | `TimeGranularity` |  | 值精确到哪一段，默认 minute。 |
| `disabled` | `boolean` |  | 禁用：段整体退出 Tab 序列、键盘一概不响应，隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、可用左右键在段间走，但改不动值。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `required` | `boolean` |  | 必填标注（落到每段的 aria-required 上）。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，值随表单一并提交。 |
| `placeholder` | `string` |  | 空段的占位字符（单字符），按段宽重复，默认 '-'。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<TimeFieldTranslations>` |  | 段位读屏名的覆盖；不给就用内置英文语义名。 |
| `onValueChange` | `(details: TimeFieldValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TimeFieldValueChangeDetails` | 值变化；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTimeFieldRoot` | `default` | `TimeFieldRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `FORM.RESET`

**判据**：`canEdit`

## connect API

`useTimeField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | ISO 时间串；任一必填段为空时是空串。 |
| `empty` | `boolean` | 值为空串（还没填全）。作者据此点亮提交按钮或显示提示。 |
| `outOfRange` | `boolean` | 已填全但落在 min/max 之外。只是标注，不改写值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 有值且可编辑（既不 disabled 也不 readOnly）；清空按钮据此显隐。 |
| `hourCycle` | `TimeHourCycle` | 实际生效的小时制（prop 没给时由 locale 推出来的那个）。 |
| `granularity` | `TimeGranularity` |  |
| `segments` | `TimeSegmentType[]` | 此刻参与显示的段，文档序。未列入的段由 connect 打上 hidden 收起。 |
| `focusedSegment` | `TimeSegmentType \| null` | 焦点所在段；焦点在组外时为 null。 |
| `getSegmentText` | `(props: TimeFieldSegmentProps) => string` | 某一段该显示的文字（空段是占位串）。两个适配器都拿它填文本，保证同构。 |
| `setValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentGroupProps` | `() => T['element']` | 段位与分隔符的外壳：占满盒里剩下的宽度，把清空钮顶到框内末端。 |
| `getSegmentProps` | `(props: TimeFieldSegmentProps) => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空按钮：有值才显形，不占 Tab 位，点完焦点回到第一段。 |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in a segment, not disabled/readOnly | 本段加一格，到头回绕；空段落到该段下界 |
| `ArrowDown` | focus in a segment, not disabled/readOnly | 本段减一格，到头回绕；空段落到该段上界 |
| `ArrowRight` | focus in a segment, not disabled | 焦点移到下一段；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in a segment, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in a segment, not disabled | 焦点移到首段 |
| `End` | focus in a segment, not disabled | 焦点移到末段 |
| `0-9` | focus in a 数字段, not disabled/readOnly | 把数字并进本段；本段再吃不下第二位时自动跳到下一段 |
| `Backspace` / `Delete` | focus in a segment, not disabled/readOnly | 清掉本段；小时被清时上下午段仍保留原来的上午/下午 |
| `a` / `p` | focus in 上下午段, 12 小时制, not disabled/readOnly | a 取上午、p 取下午（不区分大小写） |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'group' |
| `segment` | `aria-disabled` | 'true' \| 'false' |
| `segment` | `aria-invalid` | 'true' \| 'false' |
| `segment` | `aria-label` | prop('translations')?.[segment] |
| `segment` | `aria-readonly` | 'true' \| 'false' |
| `segment` | `aria-required` | 'true' \| 'false' |
| `segment` | `aria-valuemax` | range.max |
| `segment` | `aria-valuemin` | range.min |
| `segment` | `aria-valuenow` | segmentNumber(draft, segment, hourCycle) |
| `segment` | `aria-valuetext` | timeSegmentText(draft, segment, { hourCycle, locale, … |
| `segment` | `role` | 'spinbutton' |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |

## 样式

默认皮肤 `@xihan-ui/styles/time-field.css` 按部件选择：`[data-scope="time-field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-out-of-range` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-focus` | ''（条件成立时才出现） |
| `segment` | `data-invalid` | ''（条件成立时才出现） |
| `segment` | `data-placeholder` | ''（条件成立时才出现） |
| `segment` | `data-readonly` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-time-field-action-bg` · `--xh-time-field-action-bg-active` · `--xh-time-field-action-bg-hover` · `--xh-time-field-action-fg` · `--xh-time-field-action-fg-hover` · `--xh-time-field-action-font-size` · `--xh-time-field-action-radius` · `--xh-time-field-action-size` · `--xh-time-field-control-bg` · `--xh-time-field-control-bg-disabled` · `--xh-time-field-control-bg-readonly` · `--xh-time-field-control-border` · `--xh-time-field-control-border-focus` · `--xh-time-field-control-border-hover` · `--xh-time-field-control-border-invalid` · `--xh-time-field-control-fg` · `--xh-time-field-control-gap` · `--xh-time-field-control-h` · `--xh-time-field-control-min-w` · `--xh-time-field-control-px` · `--xh-time-field-control-radius` · `--xh-time-field-font-size` · `--xh-time-field-gap` · `--xh-time-field-icon-size` · `--xh-time-field-label-fg` · `--xh-time-field-label-fg-disabled` · `--xh-time-field-label-font-size` · `--xh-time-field-label-font-weight` · `--xh-time-field-placeholder-fg` · `--xh-time-field-segment-bg-focus` · `--xh-time-field-segment-bg-hover` · `--xh-time-field-segment-fg-focus` · `--xh-time-field-segment-px` · `--xh-time-field-segment-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；与[日期输入](./date-field)并排组成日期时间。

## 最佳实践

- 明确时区归属：组件处理的是墙上时间，时区换算是宿主的事。
- 12 小时制下上下午段位不能省，否则用户输入的时间有二义。

## 反模式

- 用文本输入收时间再解析。
