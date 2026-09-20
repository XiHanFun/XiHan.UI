来源：https://ui.docs.xihanfun.com/components/date-field

# DateField 日期字段 `alpha`

按年、月、日逐段输入日期，适合已经知道目标日期、无需浏览日历的场景。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/date-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/date-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/date-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/date-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/date-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

输入日期

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldClearTrigger,
  XhDateFieldHiddenInput,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDateFieldRoot
    locale="zh-CN"
    name="deadline"
    style="--xh-date-field-control-min-w: calc(var(--xh-control-min-w) + var(--xh-control-h-md) + var(--xh-space-6))"
  >
    <XhDateFieldLabel>截止日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment :index="0" />
        <span>/</span>
        <XhDateFieldSegment :index="1" />
        <span>/</span>
        <XhDateFieldSegment :index="2" />
      </XhDateFieldSegmentGroup>
      <XhDateFieldClearTrigger />
    </XhDateFieldControl>
    <XhDateFieldHiddenInput />
  </XhDateFieldRoot>
</template>
```

```html
<xh-date-field locale="zh-CN" name="deadline">
    <div
      data-xh-part="root"
      style="--xh-date-field-control-min-w: calc(var(--xh-control-min-w) + var(--xh-control-h-md) + var(--xh-space-6))"
    >
    <label data-xh-part="label">截止日期</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" index="0"></span>
        <span>/</span>
        <span data-xh-part="segment" index="1"></span>
        <span>/</span>
        <span data-xh-part="segment" index="2"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <input data-xh-part="hidden-input" />
  </div>
</xh-date-field>
```

## 组件结构

加粗的是必需部件。

`data-scope="date-field"`：**`root`** · `label` · **`control`** · `segment-group` · **`segment`** · `clear-trigger` · `hidden-input`

## 示例

### 地区格式

根据 locale 调整日期顺序

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN">
      <XhDateFieldLabel>中文格式</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot default-value="2026-07-28" locale="en-US">
      <XhDateFieldLabel>美国格式</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>/</span>
          <XhDateFieldSegment :index="1" />
          <span>/</span>
          <XhDateFieldSegment :index="2" />
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <xh-date-field locale="zh-CN" default-value="2026-07-28">
    <div data-xh-part="root">
      <label data-xh-part="label">中文格式</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field locale="en-US" default-value="2026-07-28">
    <div data-xh-part="root">
      <label data-xh-part="label">美国格式</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>/</span>
          <span data-xh-part="segment" index="1"></span>
          <span>/</span>
          <span data-xh-part="segment" index="2"></span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
```

### 日期范围

限制可输入日期

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot
      default-value="2026-07-28"
      locale="zh-CN"
      min="2020-01-01"
      max="2030-12-31"
    >
      <XhDateFieldLabel>有效日期（2020—2030）</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot default-value="2019-05-01" locale="zh-CN" min="2020-01-01">
      <XhDateFieldLabel>早于最小日期</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <xh-date-field default-value="2026-07-28" locale="zh-CN" min="2020-01-01" max="2030-12-31">
    <div data-xh-part="root">
      <label data-xh-part="label">有效日期（2020—2030）</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field default-value="2019-05-01" locale="zh-CN" min="2020-01-01">
    <div data-xh-part="root">
      <label data-xh-part="label">早于最小日期</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
```

### 状态

禁用、只读与校验失败

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" disabled>
      <XhDateFieldLabel>禁用</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" read-only>
      <XhDateFieldLabel>只读</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" invalid>
      <XhDateFieldLabel>校验失败</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <xh-date-field default-value="2026-07-28" locale="zh-CN" disabled>
    <div data-xh-part="root">
      <label data-xh-part="label">禁用</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field default-value="2026-07-28" locale="zh-CN" read-only>
    <div data-xh-part="root">
      <label data-xh-part="label">只读</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field default-value="2026-07-28" locale="zh-CN" invalid>
    <div data-xh-part="root">
      <label data-xh-part="label">校验失败</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
```

### 变体

设置输入框外观

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhDateFieldRoot
      v-for="v in variants"
      :key="v"
      :variant="v"
      default-value="2026-07-28"
      locale="zh-CN"
    >
      <XhDateFieldLabel>{{ v }}</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; justify-items: start">
  <xh-date-field variant="outline" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="subtle" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="ghost" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
```

### 日期与时间

输入精确到分钟的日期

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDateFieldRoot default-value="2026-07-28T13:45" locale="zh-CN" granularity="minute">
    <XhDateFieldLabel>发布时间</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
        <span>&nbsp;</span>
        <XhDateFieldSegment :index="3" />
        <span>:</span>
        <XhDateFieldSegment :index="4" />
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
  </XhDateFieldRoot>
</template>
```

```html
<xh-date-field locale="zh-CN" granularity="minute" default-value="2026-07-28T13:45">
  <div data-xh-part="root">
    <label data-xh-part="label">发布时间</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" index="0"></span>
        <span>年</span>
        <span data-xh-part="segment" index="1"></span>
        <span>月</span>
        <span data-xh-part="segment" index="2"></span>
        <span>日</span>
        <span>&nbsp;</span>
        <span data-xh-part="segment" index="3"></span>
        <span>:</span>
        <span data-xh-part="segment" index="4"></span>
      </div>
    </div>
  </div>
</xh-date-field>
```

## 设计指引

### 何时使用

- 用户已知确切日期，例如生日或证件有效期。
- 需要使用键盘快速逐段输入。

### 何时不用

- 需要查看月份或星期信息时，使用[日期选择器](./date-picker)。
- 只需要时间不需要日期时，使用[时间字段](./time-field)。

### 特性

- `locale` 决定日期段的顺序和分隔方式。
- `min` 与 `max` 限制可输入范围。
- `granularity` 支持日期或精确到分钟的日期时间。
- `year + week` 段集使用 ISO 周历，固定周一到周日，不随显示语言改变。
- 标准组合包含标签、输入框、日期段和隐藏表单输入；支持受控值与原生表单提交。
- 聚焦只强调正在编辑的日期段，错误段使用独立的危险色反馈。
- 清空按钮默认收起，输入任一段后出现；点按后回到第一段，聚焦边界平滑过渡。

### 组合

- [日期选择器](./date-picker)与[日期范围选择器](./date-range-picker)的输入区就是这一套逐段输入，只是多了日历浮层。
- 日期与时间分开录入时与[时间字段](./time-field)并排；只用一个字段时通过 `granularity` 精确到分钟。
- 在[表单](./form)中以 ISO 日期字符串参与校验与提交。

### 最佳实践

- 使用清晰的字段标签。
- 给参与表单提交的字段设置 `name`，并渲染隐藏输入部件。
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
| `value` | `string \| null` |  | 受控值，ISO 串（'2026-07-28' / '2026-07-28T13:45'）；null 表示空。提供即受控。 |
| `defaultValue` | `string \| null` |  | 非受控初值，同样是 ISO 串。 |
| `min` | `string` |  | 下界，ISO 串。参与各段区间的收窄，并决定 outOfRange。 |
| `max` | `string` |  | 上界，ISO 串。 |
| `locale` | `string` |  | BCP 47 语言标记，决定年月日三段的先后。未提供时按宿主语言，宿主也没有时按 en-US（月日年）排列。 |
| `timeZone` | `string` |  | IANA 时区名，只用于取今天：空段上按上下键时从今天的对应位起步。 |
| `granularity` | `DateGranularity` |  | 精度，默认 day（只有年月日三段）。提供 segments 时它不再生效。 |
| `segments` | `DateSegmentSet` |  | 段集：该控件由哪几段组成，提供后以它为准，granularity 让位。写 `['year', 'quarter']` 得到「2026 Q2」、`['year', 'week']` 得到「2026 33」。归一后为空（如 `[]`）视同未提供。 值仍是 ISO 日期（时间）串，因此段集中必须有 year，否则段位可编辑但无法拼出值。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；提供后隐藏输入才带 name，ISO 串随表单一并提交。 |
| `placeholder` | `{ readonly [K in DateSegmentType]?: string }` |  | 各段未填时显示的占位串，逐段覆盖内置默认（yyyy / mm / dd / hh / mm / ss）。 |
| `translations` | `DateFieldTranslations` |  | 各段的读屏名字，逐段覆盖内置默认。段是 spinbutton，没有名字时读屏只能朗读一串数字。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调使用哪族颜色。 |
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

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.TYPE` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canEdit` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | ISO 串；段位未填齐时为 null。 |
| `valueAsDate` | `Date \| null` | 同一个值的原生 Date；空值或无法计算时为 null。按 timeZone 换算。 |
| `segments` | `DateFieldSegmentState[]` | 逐段投影，文档序即当前的段序（提供 segments 时是其归一后的顺序，否则由 locale 排列）。 |
| `complete` | `boolean` | 段位已填齐（value 非 null）。 |
| `empty` | `boolean` | 没有任何段已填。 |
| `outOfRange` | `boolean` | 已填齐但落在 min / max 之外。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `focusedSegment` | `DateSegmentType \| null` | 焦点所在的段；焦点在组外时为 null。 |
| `locale` | `string` |  |
| `granularity` | `DateGranularity` |  |
| `setValue` | `(next: string \| null) => void` | 直接写整份值；传 null 等于清空。 |
| `clear` | `() => void` | 清空全部段位；disabled / readOnly 下不生效。 |
| `canClear` | `boolean` | 清空按钮当前是否可用：有段已填值、且可编辑。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` | 标题不是原生 label（段位是 div，不可被 label 标注），点击它由连接层代为把焦点送进首段。 |
| `getControlProps` | `() => T['element']` | role=group 的分段容器。 |
| `getSegmentGroupProps` | `() => T['element']` | 段位与分隔符的外壳：占满盒内剩余宽度，把清空按钮推到框内末端。 |
| `segmentOf` | `(props: DateFieldSegmentProps) => DateFieldSegmentState \| undefined` | 作者的声明落在哪一段上；段集中没有该段（或下标越界）时缺席。文字由适配器按它渲染。 |
| `getSegmentProps` | `(props: DateFieldSegmentProps) => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空按钮：不占 Tab 位，无值或不可编辑时收起；点击后焦点回到首段。 |
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
| `Enter` / `Space` | held in clear-trigger, 填了哪怕一段, not disabled/readOnly | 按住期间清空按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，段位清空后按钮藏起一并撤下。清空按钮不占 Tab 位，键盘这一路只在焦点落到它身上时有面 |
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

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

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
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
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
| `clear-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-date-field-action-bg` | `clear-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | date-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-date-field-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | date-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-date-field-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | date-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-date-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | date-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-date-field-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | date-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-date-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | date-field 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-date-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` | date-field 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-date-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | date-field 的 clear-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-date-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | date-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-date-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | date-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-date-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | date-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-date-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | date-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-date-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | date-field 的 control 部件 border 覆盖槽。 |
| `--xh-date-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | date-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | date-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | date-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | date-field 的 control 部件 color 覆盖槽。 |
| `--xh-date-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_date-field-gap` | date-field 的 control 部件 gap 覆盖槽。 |
| `--xh-date-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_date-field-control-h` | date-field 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-date-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | date-field 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-date-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_date-field-control-px` | date-field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-date-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | date-field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-date-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | date-field 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-date-field-font-size` | `control` | `font-size` | `default` | `--xh-_date-field-font-size` | date-field 的 control 部件 font-size 覆盖槽。 |
| `--xh-date-field-gap` | `root` | `gap` | `default` | `--xh-space-1` | date-field 的 root 部件 gap 覆盖槽。 |
| `--xh-date-field-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | date-field 的 control、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-date-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | date-field 的 label 部件 color 覆盖槽。 |
| `--xh-date-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | date-field 的 label 部件 color 覆盖槽。 |
| `--xh-date-field-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | date-field 的 label 部件 font-size 覆盖槽。 |
| `--xh-date-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | date-field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-date-field-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` | date-field 的 segment-group 部件 color 覆盖槽。 |
| `--xh-date-field-placeholder-fg` | `segment` | `color` | `placeholder` | `--xh-fg-subtle` | date-field 的 segment 部件 color 覆盖槽。 |
| `--xh-date-field-segment-bg-focus` | `segment` | `background` | `focus`<br>`focus-visible` | `--xh-_date-field-segment-bg` | date-field 的 segment 部件 background 覆盖槽。 |
| `--xh-date-field-segment-bg-invalid-focus` | `segment` | `background` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-bg-subtle` | date-field 的 segment 部件 background 覆盖槽。 |
| `--xh-date-field-segment-fg-focus` | `segment` | `color` | `focus`<br>`focus-visible`<br>`placeholder` | `--xh-_date-field-segment-fg` | date-field 的 segment 部件 color 覆盖槽。 |
| `--xh-date-field-segment-fg-invalid` | `segment` | `color` | `invalid` | `--xh-fg-danger` | date-field 的 segment 部件 color 覆盖槽。 |
| `--xh-date-field-segment-fg-invalid-focus` | `segment` | `color` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-fg-danger` | date-field 的 segment 部件 color 覆盖槽。 |
| `--xh-date-field-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-0_5` | date-field 的 segment 部件 padding-inline 覆盖槽。 |
| `--xh-date-field-segment-py` | `segment` | `padding-block` | `default` | `--xh-space-0` | date-field 的 segment 部件 padding-block 覆盖槽。 |
| `--xh-date-field-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` | date-field 的 segment 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
