# TimeZoneSelect 时区选择器

从 IANA 时区中检索并选择一个值。组件显示规范化时区名与参考时刻下的 UTC 偏移，输入、候选列表、浮层和键盘交互完整复用 Combobox。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/time-zone-select" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/time-zone-select.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/time-zone-select" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/time-zone-select" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/time-zone-select.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

按地区、城市或 UTC 偏移检索 IANA 时区

<XhDemo src="time-zone-select/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="time-zone-select"`：**`root`**

## 示例

### 参考时刻

用排期当天而不是今天计算 DST 偏移

<XhDemo src="time-zone-select/02-reference-time" />

### 表单提交

保存 IANA 时区名，而不是当前 UTC 偏移

<XhDemo src="time-zone-select/03-form" />

### 状态与文案

禁用、校验失败和本地化文案沿用字段与 Combobox 契约

<XhDemo src="time-zone-select/04-states" />

## 设计指引

### 何时使用

- 创建跨地区会议、任务或发布时间，需要保存 IANA 时区而不是一次性的固定偏移。
- 候选数较多，需要按地区、城市或 `UTC+08:00` 快速检索。

### 何时不用

- 只显示已经确定的时区：直接用文本或[时间戳](./timestamp)。
- 用户选择的是具体日期时间：把本组件与日期、时间字段组合，并用 Core 的 `ZonedDateTime` 建模。

### 特性

- 缺省候选来自 `Intl.supportedValuesOf('timeZone')`，显式包含 UTC；也可传入受控候选集合。
- `referenceTime` 决定每个时区显示的 DST 偏移，适合按实际排期时刻展示。
- 值始终是 IANA 时区字符串；清空时为 `null`，不把 `UTC+08:00` 当时区保存。
- 输入、方向键、高亮、选中、浮层定位、表单与无障碍关系都由 Combobox 统一承担。

### 最佳实践

- 全球化排期把 `ZonedDateTime` 或“当地日期时间 + IANA 时区”作为领域值；不要只存当前偏移。
- 排期在未来时传该排期的 `referenceTime`，否则 DST 地区显示的是“现在”的偏移。
- 多历法会改变字段与格式语义，应单独设计，不作为时区选择的隐式选项。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-zone-select>` |
| Vue 组件 | `XhTimeZoneSelect` |
| 组合式函数 | `useTimeZoneSelect` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/time-zone-select.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `defaultValue` | `string \| null` |  |  |
| `dir` | `Direction` |  |  |
| `disabled` | `boolean` |  |  |
| `form` | `string` |  |  |
| `invalid` | `boolean` |  |  |
| `loading` | `boolean` |  |  |
| `locale` | `string` |  | 排序与大小写折叠使用的地区。 |
| `loop` | `boolean` |  |  |
| `name` | `string` |  |  |
| `offset` | `number` |  |  |
| `onInputValueChange` | `(details: TimeZoneSelectInputValueChangeDetails) => void` |  |  |
| `onValueChange` | `(details: TimeZoneSelectValueChangeDetails) => void` |  |  |
| `placement` | `Placement` |  |  |
| `readOnly` | `boolean` |  |  |
| `referenceTime` | `Date \| number` |  | 用哪个时刻计算候选的 UTC 偏移，缺省为创建选项时的 Date.now()。 |
| `size` | `Size` |  |  |
| `timeZones` | `readonly string[]` |  | 候选时区；缺省读取运行环境的 Intl.supportedValuesOf('timeZone')。 |
| `tone` | `Tone` |  |  |
| `translations` | `Partial<TimeZoneSelectTranslations>` |  |  |
| `value` | `string \| null` |  | 受控 IANA 时区；null 表示未选择。 |
| `variant` | `ControlVariant` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TimeZoneSelectValueChangeDetails` | 时区变化；detail 为 `{ value: string \| null }` |
| `input-value-change` | `TimeZoneSelectInputValueChangeDetails` | 检索文本变化；detail 与 Combobox 相同 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `options` | `readonly TimeZoneSelectOption[]` |  |
| `filter` | `(query: string) => TimeZoneSelectOption[]` |  |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/time-zone-select.css` 使用 `[data-scope="time-zone-select"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
