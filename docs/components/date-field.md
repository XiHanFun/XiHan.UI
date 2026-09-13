# DateField 日期输入

用于按年、月、日分段输入日期，不打开日历。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/date-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/date-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/date-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/date-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/date-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

输入日期

<XhDemo src="date-field/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="date-field"`：**`root`** · `label` · **`control`** · `segment-group` · **`segment`** · `clear-trigger` · `hidden-input`

## 示例

### 地区格式

根据 locale 调整日期顺序

<XhDemo src="date-field/02-locale" />

### 日期范围

限制可输入日期

<XhDemo src="date-field/03-range" />

### 状态

禁用、只读与校验失败

<XhDemo src="date-field/04-state" />

### 变体

设置输入框外观

<XhDemo src="date-field/05-variant" />

### 日期与时间

输入精确到分钟的日期

<XhDemo src="date-field/08-datetime" />

## 设计指引

### 何时使用

- 用户已知确切日期，例如生日或证件有效期。
- 需要使用键盘快速逐段输入。

### 何时不用

- 需要查看月份或星期信息：使用[日期选择器](./date-picker)。
- 只要时间不要日期：用[时间输入](./time-field)。

### 特性

- `locale` 决定日期段的顺序和分隔方式。
- `min` 与 `max` 限制可输入范围。
- `granularity` 支持日期或精确到分钟的日期时间。
- 支持受控值、原生表单提交和三种视觉变体。

### 最佳实践

- 使用清晰的字段标签。
- 有业务范围限制时设置 `min` 与 `max`。
- 对外统一使用 ISO 日期字符串。

### 反模式

- 使用普通文本输入接收日期并自行解析。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-field>` |
| Vue 组件 | `XhDateFieldClearTrigger` `XhDateFieldControl` `XhDateFieldHiddenInput` `XhDateFieldLabel` `XhDateFieldRoot` `XhDateFieldSegment` `XhDateFieldSegmentGroup` |
| 组合式函数 | `useDateField` |
| 状态机 | `dateFieldMachine` |
| 皮肤 | `@xihan-ui/styles/date-field.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| null` |  | 受控值，ISO 串（'2026-07-28' / '2026-07-28T13:45'）；null 表示空。给定即受控。 |
| `defaultValue` | `string \| null` |  | 非受控初值，同样是 ISO 串。 |
| `min` | `string` |  | 下界，ISO 串。参与各段区间的收窄，并决定 outOfRange。 |
| `max` | `string` |  | 上界，ISO 串。 |
| `locale` | `string` |  | BCP 47 语言标记，决定年月日三段的先后。不给按宿主语言，宿主也没有时按 en-US（月日年）排。 |
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

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `DateFieldValueChangeDetails` | 值变化；detail 为 `{ value: string \| null }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDateFieldRoot` | `default` | `DateFieldRootSlotProps` |  |
| `XhDateFieldSegment` | `default` | `DateFieldSegmentSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.TYPE` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `FORM.RESET`

**判据**：`canEdit`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

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
| `clear` | `() => void` | 清空全部段位；disabled / readOnly 下不动。 |
| `canClear` | `boolean` | 清空钮此刻是否可用：有段填了值、且可编辑。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` | 标题不是原生 label（段位是 div，不可被 label 标注），点它由连接层代为把焦点送进首段。 |
| `getControlProps` | `() => T['element']` | role=group 的分段容器。 |
| `getSegmentGroupProps` | `() => T['element']` | 段位与分隔符的外壳：占满盒里剩下的宽度，把清空钮顶到框内末端。 |
| `segmentOf` | `(props: DateFieldSegmentProps) => DateFieldSegmentState \| undefined` | 作者的那一句声明落在哪一段上；段集里没有这一块（或下标越界）时缺席。文字由适配器照它渲染。 |
| `getSegmentProps` | `(props: DateFieldSegmentProps) => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空钮：不占 Tab 位，没值或不可编辑时收起；点完焦点回到首段。 |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，值是 ISO 串。 |

## 无障碍

### 键盘

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

### ARIA

以下属性由 `connect` 生成。

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
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |

## 样式参考

### 皮肤

`@xihan-ui/styles/date-field.css` 使用 `[data-scope="date-field"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-focus` | ''（条件成立时才出现） |
| `segment` | `data-index` | String(index) \| undefined |
| `segment` | `data-invalid` | ''（条件成立时才出现） |
| `segment` | `data-placeholder` | ''（条件成立时才出现） |
| `segment` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-segment` | item?.type |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-date-field-action-bg` | `clear-trigger` | `background` | `default` | `transparent` | date-field 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-date-field-action-bg-active` | `clear-trigger` | `background` | `active` | `--xh-bg-subtle-active` | date-field 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-date-field-action-bg-hover` | `clear-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | date-field 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-date-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | date-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-date-field-action-fg-hover` | `clear-trigger` | `color` | `hover` | `--xh-fg-default` | date-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-date-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | date-field 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-date-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | date-field 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-date-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | date-field 的 clear-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-date-field-control-bg` | `control` | `background` | `default` | `--xh-_date-field-control-bg` | date-field 的 control 部件 background 覆盖槽。 |
| `--xh-date-field-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | date-field 的 control 部件 background 覆盖槽。 |
| `--xh-date-field-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_date-field-control-bg-hover` | date-field 的 control 部件 background 覆盖槽。 |
| `--xh-date-field-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | date-field 的 control 部件 background 覆盖槽。 |
| `--xh-date-field-control-border` | `control` | `border` | `default` | `--xh-_date-field-control-border` | date-field 的 control 部件 border 覆盖槽。 |
| `--xh-date-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | date-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_date-field-control-border-hover` | date-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-field-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | date-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-field-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | date-field 的 control 部件 color 覆盖槽。 |
| `--xh-date-field-control-gap` | `control` | `gap` | `default` | `--xh-_date-field-gap` | date-field 的 control 部件 gap 覆盖槽。 |
| `--xh-date-field-control-h` | `control` | `block-size` | `default` | `--xh-_date-field-control-h` | date-field 的 control 部件 block-size 覆盖槽。 |
| `--xh-date-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | date-field 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-date-field-control-px` | `control` | `padding-inline` | `default` | `--xh-_date-field-control-px` | date-field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-date-field-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | date-field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-date-field-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_date-field-control-shadow` | date-field 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-date-field-font-size` | `control` | `font-size` | `default` | `--xh-_date-field-font-size` | date-field 的 control 部件 font-size 覆盖槽。 |
| `--xh-date-field-gap` | `root` | `gap` | `default` | `--xh-space-1` | date-field 的 root 部件 gap 覆盖槽。 |
| `--xh-date-field-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | date-field 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-date-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | date-field 的 label 部件 color 覆盖槽。 |
| `--xh-date-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | date-field 的 label 部件 color 覆盖槽。 |
| `--xh-date-field-label-font-size` | `label` | `font-size` | `default` | `--xh-_date-field-label-font-size` | date-field 的 label 部件 font-size 覆盖槽。 |
| `--xh-date-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | date-field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-date-field-placeholder-fg` | `segment` | `color` | `placeholder` | `--xh-fg-subtle` | date-field 的 segment 部件 color 覆盖槽。 |
| `--xh-date-field-segment-bg-focus` | `segment` | `background` | `focus`<br>`focus-visible` | `--xh-_date-field-segment-bg` | date-field 的 segment 部件 background 覆盖槽。 |
| `--xh-date-field-segment-fg-focus` | `segment` | `color` | `focus`<br>`focus-visible`<br>`placeholder` | `--xh-_date-field-segment-fg` | date-field 的 segment 部件 color 覆盖槽。 |
| `--xh-date-field-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-1` | date-field 的 segment 部件 padding-inline 覆盖槽。 |
| `--xh-date-field-segment-py` | `segment` | `padding-block` | `default` | `--xh-space-0` | date-field 的 segment 部件 padding-block 覆盖槽。 |
| `--xh-date-field-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` | date-field 的 segment 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
