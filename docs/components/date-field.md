# 日期输入 <Badge type="info" text="date-field" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-field>` |
| Vue 组件 | `XhDateFieldControl` `XhDateFieldHiddenInput` `XhDateFieldLabel` `XhDateFieldRoot` `XhDateFieldSegment` |
| 组合式函数 | `useDateField` |
| 状态机 | `dateFieldMachine` |
| 皮肤 | `@xihan-ui/styled/date-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="date-field"`：**`root`** · `label` · **`control`** · **`segment`** · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string | null` |  | 受控值，ISO 串（'2026-07-28' / '2026-07-28T13:45'）；null 表示空。给定即受控。 |
| `defaultValue` | `string | null` |  | 非受控初值，同样是 ISO 串。 |
| `min` | `string` |  | 下界，ISO 串。参与各段区间的收窄，并决定 outOfRange。 |
| `max` | `string` |  | 上界，ISO 串。 |
| `locale` | `string` |  | BCP 47 语言标记，决定年月日三段的先后。不给按 en-US（月日年）排。 |
| `timeZone` | `string` |  | IANA 时区名，只用来取「今天」：空段上按上下键时从今天的对应位起步。 |
| `granularity` | `DateGranularity` |  | 精度，默认 day（只有年月日三段）。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。 |
| `placeholder` | `{ readonly [K in DateSegmentType]?: string }` |  | 各段未填时显示的占位串，逐段覆盖内置默认（yyyy / mm / dd / hh / mm / ss）。 |
| `translations` | `{ readonly [K in DateSegmentType]?: string }` |  | 各段的读屏名字，逐段覆盖内置默认。段是 spinbutton，没有名字读屏只念得出一串数字。 |
| `onValueChange` | `(details: DateFieldValueChangeDetails) => void` |  |  |

## 状态机

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.TYPE` · `SEGMENT.CLEAR` · `SEGMENT.FOCUS` · `SEGMENT.BLUR`

**判据**：`canEdit`

## connect API

`useDateField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string | null` | ISO 串；段位没填齐时是 null。 |
| `valueAsDate` | `Date | null` | 同一个值的原生 Date；空值或算不出来时为 null。按 timeZone 换算。 |
| `segments` | `DateFieldSegmentState[]` | 逐段投影，文档序即 locale 决定的段序。 |
| `complete` | `boolean` | 段位填齐了（value 非 null）。 |
| `empty` | `boolean` | 一段都没填。 |
| `outOfRange` | `boolean` | 填齐了但落在 min/max 之外。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `focusedSegment` | `DateSegmentType | null` | 焦点落在哪一段；焦点在组外时为 null。 |
| `locale` | `string` |  |
| `granularity` | `DateGranularity` |  |
| `setValue` | `(next: string | null) => void` | 直接写整份值；传 null 等于清空。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` | 标题不是原生 label（段位是 div，不可被 label 标注），点它由连接层代为把焦点送进首段。 |
| `getControlProps` | `() => T['element']` | role=group 的分段容器。 |
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
| `0` / `1` / `2` / `3` / `4` / `5` / `6` / `7` / `8` / `9` | focus in a segment, not disabled/readOnly | 往本段补一位数字；补满（再补一位必溢出或位数用尽）即自动跳下一段 |
