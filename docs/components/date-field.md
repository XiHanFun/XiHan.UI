# 日期输入 <Badge type="info" text="date-field" />

分段的日期输入框：年、月、日各占一段，方向键加减，不弹日历。

## 何时使用

- 用户已经知道确切日期（生日、证件有效期），打字比翻日历快。
- 需要键盘全程可用。

## 何时不用

- 用户需要看着日历挑（选会议时间、看星期几）：用[日期选择器](./date-picker)。
- 只要时间不要日期：用[时间输入](./time-field)。

## 特性

- 段序随 `locale` 变，不是写死的年月日。
- `min` / `max` 收窄各段的加减范围；越界的初值只做标注、不被改写。
- `granularity` 决定精确到日还是到分。
- 段位文本、对外值的写法与段位的拼装都可以换。

## 示例

### 基础用法

三段各是一个可加减的数，整组只占一个 Tab 位，三段填齐才第一次报出值

<XhDemo src="date-field/01-basic" />

### 段序随 locale

同一份标记，locale 换成 en-US 后段序自动排成月日年

<XhDemo src="date-field/02-locale" />

### 可填区间

min / max 收窄各段的加减范围，越界的初值只做标注、不被改写

<XhDemo src="date-field/03-range" />

### 禁用与非法

禁用整组退出 Tab 序、隐藏输入不再提交；invalid 只改观感与 aria，不动值

<XhDemo src="date-field/04-state" />

### 形态

variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变

<XhDemo src="date-field/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴

<XhDemo src="date-field/06-tone" />

### 尺寸

不传 size 即默认档；行高、内边距与字号一起换档，标题也跟着变

<XhDemo src="date-field/07-size" />

### 精确到分

granularity=minute 在年月日后面接出时、分两段，值随之带上 T 与时间位

<XhDemo src="date-field/08-datetime" />

### 外部写值与清空

值由宿主持有，按钮直接写值或清空；填齐与越界两个判据由组件给出，按钮照它们摆

<XhDemo src="date-field/09-actions" />

### 值变化事件

value-change 每次带上整份 ISO 串，段位被清掉时它是 null

<XhDemo src="date-field/10-events" />

### 段位自定义文本

段位插槽给出这一段的类型、取值与焦点状态，离焦后年份只留两位、月份换成中文名

<XhDemo src="date-field/11-segment-format" />

### 对外值换个写法

组件读写的恒是 ISO 串，宿主在读写两头各转一次换成自己的格式，表单也提交这一份

<XhDemo src="date-field/12-value-format" />

### 段位可拼装

segments 决定这份控件由哪几块组成；段位可按段名认领，不必数下标

<XhDemo src="date-field/13-segments" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-field>` |
| Vue 组件 | `XhDateFieldControl` `XhDateFieldHiddenInput` `XhDateFieldLabel` `XhDateFieldRoot` `XhDateFieldSegment` |
| 组合式函数 | `useDateField` |
| 状态机 | `dateFieldMachine` |
| 皮肤 | `@xihan-ui/styles/date-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="date-field"`：**`root`** · `label` · **`control`** · **`segment`** · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| null` |  | 受控值，ISO 串（'2026-07-28' / '2026-07-28T13:45'）；null 表示空。给定即受控。 |
| `defaultValue` | `string \| null` |  | 非受控初值，同样是 ISO 串。 |
| `min` | `string` |  | 下界，ISO 串。参与各段区间的收窄，并决定 outOfRange。 |
| `max` | `string` |  | 上界，ISO 串。 |
| `locale` | `string` |  | BCP 47 语言标记，决定年月日三段的先后。不给按 en-US（月日年）排。 |
| `timeZone` | `string` |  | IANA 时区名，只用来取「今天」：空段上按上下键时从今天的对应位起步。 |
| `granularity` | `DateGranularity` |  | 精度，默认 day（只有年月日三段）。给了 segments 时它不再作数。 |
| `segments` | `DateSegmentSet` |  | 段集：这份控件由哪几块组成，给了就以它为准，granularity 让路。写 `['year', 'quarter']` 得到「2026 Q2」、`['year', 'week']` 得到「2026 33」。归一后为空（如 `[]`）视同没给。 值仍是 ISO 日期（时间）串，故段集里必须有 year，否则段位编辑得动但拼不出值。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。 |
| `placeholder` | `{ readonly [K in DateSegmentType]?: string }` |  | 各段未填时显示的占位串，逐段覆盖内置默认（yyyy / mm / dd / hh / mm / ss）。 |
| `translations` | `DateFieldTranslations` |  | 各段的读屏名字，逐段覆盖内置默认。段是 spinbutton，没有名字读屏只念得出一串数字。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: DateFieldValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `DateFieldValueChangeDetails` | 值变化；detail 为 `{ value: string \| null }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDateFieldRoot` | `default` | `DateFieldRootSlotProps` |  |
| `XhDateFieldSegment` | `default` | `DateFieldSegmentSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.TYPE` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `FORM.RESET`

**判据**：`canEdit`

## connect API

`useDateField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | ISO 串；段位没填齐时是 null。 |
| `valueAsDate` | `Date \| null` | 同一个值的原生 Date；空值或算不出来时为 null。按 timeZone 换算。 |
| `segments` | `DateFieldSegmentState[]` | 逐段投影，文档序即此刻的段序（给了 segments 就是它归一后的顺序，否则由 locale 排）。 |
| `complete` | `boolean` | 段位填齐了（value 非 null）。 |
| `empty` | `boolean` | 一段都没填。 |
| `outOfRange` | `boolean` | 填齐了但落在 min/max 之外。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `focusedSegment` | `DateSegmentType \| null` | 焦点落在哪一段；焦点在组外时为 null。 |
| `locale` | `string` |  |
| `granularity` | `DateGranularity` |  |
| `setValue` | `(next: string \| null) => void` | 直接写整份值；传 null 等于清空。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` | 标题不是原生 label（段位是 div，不可被 label 标注），点它由连接层代为把焦点送进首段。 |
| `getControlProps` | `() => T['element']` | role=group 的分段容器。 |
| `segmentOf` | `(props: DateFieldSegmentProps) => DateFieldSegmentState \| undefined` | 作者的那一句声明落在哪一段上；段集里没有这一块（或下标越界）时缺席。文字由适配器照它渲染。 |
| `getSegmentProps` | `(props: DateFieldSegmentProps) => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，值是 ISO 串。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in a segment, not disabled/readOnly | 本段加一，到区间上界回绕到下界；空段则落到今天的对应位 |
| `ArrowDown` | focus in a segment, not disabled/readOnly | 本段减一，到区间下界回绕到上界；空段则落到今天的对应位 |
| `ArrowRight` | focus in a segment, not disabled | 焦点移到下一段（跳过收起的段）；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in a segment, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in a segment, not disabled | 焦点移到首段 |
| `End` | focus in a segment, not disabled | 焦点移到末段 |
| `Backspace` | focus in a segment, not disabled/readOnly | 清掉本段，焦点不动；整份值随之变成 null |
| `0` / `1` / `2` / `3` / `4` / `5` / `6` / `7` / `8` / `9` | focus in a segment, not disabled/readOnly | 往本段补一位数字；补满（再补一位必溢出或位数用尽）即自动跳下一段。上下午段没有数字位，不收数字 |
| `a` / `p` | focus in 上下午段, not disabled/readOnly | 直接指定上午 / 下午；上下键在两者之间翻面 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'group' |
| `segment` | `aria-disabled` | undefined \| 'true' \| 'false' |
| `segment` | `aria-invalid` | undefined \| 'true' \| 'false' |
| `segment` | `aria-label` | item?.label |
| `segment` | `aria-readonly` | undefined \| 'true' \| 'false' |
| `segment` | `aria-required` | undefined \| 'true' \| 'false' |
| `segment` | `aria-valuemax` | undefined \| String(item.max) |
| `segment` | `aria-valuemin` | undefined \| String(item.min) |
| `segment` | `aria-valuenow` | undefined \| String(item.value) |
| `segment` | `aria-valuetext` | item?.text |
| `segment` | `role` | undefined \| 'spinbutton' |

## 样式

默认皮肤 `@xihan-ui/styles/date-field.css` 按部件选择：`[data-scope="date-field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-complete` | ''（条件成立时才出现） |
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
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-focus` | ''（条件成立时才出现） |
| `segment` | `data-index` | String(index) \| undefined |
| `segment` | `data-invalid` | ''（条件成立时才出现） |
| `segment` | `data-placeholder` | ''（条件成立时才出现） |
| `segment` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-segment` | item?.type |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-date-field-control-bg` · `--xh-date-field-control-bg-disabled` · `--xh-date-field-control-bg-readonly` · `--xh-date-field-control-border` · `--xh-date-field-control-border-focus` · `--xh-date-field-control-border-hover` · `--xh-date-field-control-border-invalid` · `--xh-date-field-control-fg` · `--xh-date-field-control-h` · `--xh-date-field-control-min-w` · `--xh-date-field-control-px` · `--xh-date-field-control-radius` · `--xh-date-field-font-size` · `--xh-date-field-gap` · `--xh-date-field-icon-size` · `--xh-date-field-label-fg` · `--xh-date-field-label-fg-disabled` · `--xh-date-field-label-font-size` · `--xh-date-field-label-font-weight` · `--xh-date-field-placeholder-fg` · `--xh-date-field-segment-bg-focus` · `--xh-date-field-segment-fg-focus` · `--xh-date-field-segment-px` · `--xh-date-field-segment-py` · `--xh-date-field-segment-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；与[日期选择器](./date-picker)共用同一套段位部件。

## 最佳实践

- 给出 `min` / `max`，方向键才有边界。
- 明确对外值的写法（ISO 串还是别的），并与后端对齐。

## 反模式

- 用一个[文本输入](./text-field)收日期再自己解析：各地区的写法互不相同，解析出来的结果不可控。
