来源：https://ui.docs.xihanfun.com/components/toggle-group

# ToggleGroup 切换按钮组

将多个切换按钮组合为单选或多选控件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toggle-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toggle-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toggle-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toggle-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toggle-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

同时切换多个文本格式

```vue
<script setup lang="ts">
import { BoldIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhToggleGroupRoot :default-value="['bold']" multiple>
    <XhToggleGroupItem value="bold" aria-label="粗体"><XhIcon :icon="BoldIcon" /></XhToggleGroupItem>
    <XhToggleGroupItem value="italic" aria-label="斜体"><XhIcon :icon="ItalicIcon" /></XhToggleGroupItem>
    <XhToggleGroupItem value="underline" aria-label="下划线"><XhIcon :icon="UnderlineIcon" /></XhToggleGroupItem>
    <XhToggleGroupItem value="strike" aria-label="删除线"><XhIcon :icon="StrikethroughIcon" /></XhToggleGroupItem>
  </XhToggleGroupRoot>
</template>
```

```html
<xh-toggle-group default-value="bold" multiple>
  <div data-xh-part="root">
    <button data-xh-part="item" value="bold" aria-label="粗体"><strong>B</strong></button>
    <button data-xh-part="item" value="italic" aria-label="斜体"><em>I</em></button>
    <button data-xh-part="item" value="underline" aria-label="下划线"><u>U</u></button>
    <button data-xh-part="item" value="strike" aria-label="删除线"><s>S</s></button>
  </div>
</xh-toggle-group>
```

## 组件结构

加粗的是必需部件。

`data-scope="toggle-group"`：**`root`** · **`item`** · `hidden-input`

## 示例

### 受控状态

由外部状态控制选中值

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>("week");
const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
</script>

<template>
  <XhToggleGroupRoot v-model:value="value" :collection="options" disallow-empty />
</template>
```

```html
<xh-toggle-group id="toggle-group-controlled" value="week" disallow-empty>
  <div data-xh-part="root">
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>

<script type="module">
  const group = document.getElementById("toggle-group-controlled");
  group.addEventListener("value-change", (event) => {
    group.value = event.detail.value;
  });
</script>
```

### 多选

同时选择多个格式

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const formats = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
];
</script>

<template>
  <XhToggleGroupRoot :collection="formats" :default-value="['bold']" multiple />
</template>
```

```html
<xh-toggle-group multiple default-value="bold">
  <div data-xh-part="root">
    <button data-xh-part="item" value="bold">B</button>
    <button data-xh-part="item" value="italic">I</button>
    <button data-xh-part="item" value="underline">U</button>
  </div>
</xh-toggle-group>
```

### 禁用

禁用单个选项

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中", disabled: true },
  { value: "right", label: "右对齐" },
];
</script>

<template>
  <XhToggleGroupRoot :collection="aligns" default-value="center" />
</template>
```

```html
<xh-toggle-group default-value="center">
  <div data-xh-part="root">
    <button data-xh-part="item" value="left">左对齐</button>
    <button data-xh-part="item" value="center" aria-disabled="true">居中</button>
    <button data-xh-part="item" value="right">右对齐</button>
  </div>
</xh-toggle-group>
```

### 方向

水平或垂直排列

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
</script>

<template>
  <XhToggleGroupRoot :collection="options" default-value="day" />
  <XhToggleGroupRoot :collection="options" default-value="day" orientation="vertical" />
</template>
```

```html
<xh-toggle-group default-value="day">
  <div data-xh-part="root">
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>
<xh-toggle-group default-value="day" orientation="vertical">
  <div data-xh-part="root">
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>
```

### 宽度充满

选项等分可用宽度

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "list", label: "列表" },
  { value: "grid", label: "网格" },
  { value: "board", label: "看板" },
];
</script>

<template>
  <div style="inline-size: min(100%, 360px)">
    <XhToggleGroupRoot :collection="options" default-value="list" full-width />
  </div>
</template>
```

```html
<div style="inline-size: min(100%, 360px)">
  <xh-toggle-group default-value="list" full-width>
    <div data-xh-part="root">
      <button data-xh-part="item" value="list">列表</button>
      <button data-xh-part="item" value="grid">网格</button>
      <button data-xh-part="item" value="board">看板</button>
    </div>
  </xh-toggle-group>
</div>
```

### 尺寸

提供三种尺寸

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
</script>

<template>
  <XhToggleGroupRoot :collection="options" default-value="day" size="sm" />
  <XhToggleGroupRoot :collection="options" default-value="week" />
  <XhToggleGroupRoot :collection="options" default-value="month" size="lg" />
</template>
```

```html
<xh-toggle-group default-value="day" size="sm">
  <div data-xh-part="root">
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>
<xh-toggle-group default-value="week">
  <div data-xh-part="root">
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>
<xh-toggle-group default-value="month" size="lg">
  <div data-xh-part="root">
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>
```

### 变体

设置整组外观

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
const variants = ["solid", "subtle", "outline", "ghost"] as const;
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToggleGroupRoot
      v-for="variant in variants"
      :key="variant"
      :collection="options"
      default-value="week"
      :variant="variant"
    />
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
  <xh-toggle-group default-value="week" variant="solid">
    <div data-xh-part="root">
      <button data-xh-part="item" value="day">日</button>
      <button data-xh-part="item" value="week">周</button>
      <button data-xh-part="item" value="month">月</button>
    </div>
  </xh-toggle-group>
  <xh-toggle-group default-value="week" variant="subtle">
    <div data-xh-part="root">
      <button data-xh-part="item" value="day">日</button>
      <button data-xh-part="item" value="week">周</button>
      <button data-xh-part="item" value="month">月</button>
    </div>
  </xh-toggle-group>
  <xh-toggle-group default-value="week" variant="outline">
    <div data-xh-part="root">
      <button data-xh-part="item" value="day">日</button>
      <button data-xh-part="item" value="week">周</button>
      <button data-xh-part="item" value="month">月</button>
    </div>
  </xh-toggle-group>
  <xh-toggle-group default-value="week" variant="ghost">
    <div data-xh-part="root">
      <button data-xh-part="item" value="day">日</button>
      <button data-xh-part="item" value="week">周</button>
      <button data-xh-part="item" value="month">月</button>
    </div>
  </xh-toggle-group>
</div>
```

### 无分隔线

省略分隔线部件

```vue
<script setup lang="ts">
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhToggleGroupRoot :default-value="['bold']" :separators="false" multiple>
    <XhToggleGroupItem value="bold" aria-label="粗体"><XhIcon :icon="BoldIcon" /></XhToggleGroupItem>
    <XhToggleGroupItem value="italic" aria-label="斜体"><XhIcon :icon="ItalicIcon" /></XhToggleGroupItem>
    <XhToggleGroupItem value="underline" aria-label="下划线"><XhIcon :icon="UnderlineIcon" /></XhToggleGroupItem>
  </XhToggleGroupRoot>
</template>
```

```html
<xh-toggle-group default-value="bold" separators="false" multiple>
  <div data-xh-part="root">
    <button data-xh-part="item" value="bold" aria-label="粗体"><strong>B</strong></button>
    <button data-xh-part="item" value="italic" aria-label="斜体"><em>I</em></button>
    <button data-xh-part="item" value="underline" aria-label="下划线"><u>U</u></button>
  </div>
</xh-toggle-group>
```

## 设计指引

### 何时使用

- 在少量选项之间切换视图或显示方式。
- 同时启用多个格式或工具状态。

### 何时不用

- 选项较多或需要搜索时，使用[选择器](./select)。
- 选项需要完整表单标签时，使用[单选组](./radio-group)。
- 各项只执行操作时，使用[按钮组](./button-group)。

### 特性

- 支持单选和多选模式。
- 支持受控和非受控状态。
- 支持水平、垂直、全宽和三种尺寸。
- 默认在相邻条目之间显示分隔线，可通过 `separators=false` 关闭。
- 使用 roving tabindex 管理组内键盘导航。
- `disallowEmpty` 可阻止清空最后一个选中项。
- `collection` 可统一提供标签和禁用状态。

### 组合

- 每一项就是一个[切换按钮](./toggle)；放入[工具栏](./toolbar)与其他按钮组成一排。
- 需要面板关联时使用[标签页](./tabs)；需要分段控件形态时使用[分段控制器](./segmented)。

### 最佳实践

- 每组使用二到五个简短选项。
- 同组条目应保持相近宽度。
- 必须保留一个选中项时启用 `disallowEmpty`。

### 反模式

- 不要用切换按钮组代替带面板关联的标签页。
- 关闭 roving focus 时，应提供其他组内导航方式。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle-group>` |
| Vue 组件 | `XhToggleGroupHiddenInput` `XhToggleGroupItem` `XhToggleGroupRoot` |
| 组合式函数 | `useToggleGroup` |
| 状态机 | `toggleGroupMachine` |
| 皮肤 | `@xihan-ui/styles/toggle-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ToggleGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用都写在条目部件上的方式。 |
| `value` | `ToggleGroupValue` |  | 选中值。提供即受控：内部不再自行修改，只发 onValueChange。 |
| `defaultValue` | `ToggleGroupValue` |  |  |
| `multiple` | `boolean` |  | 允许多项同时选中；false 时选中一项即替换其余。 |
| `disabled` | `boolean` |  | 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 |
| `disallowEmpty` | `boolean` |  | 不允许清空值：单选模式下点击当前选中项不再取消它，多选模式下不可移除最后一个。 默认 false（可以点击为无选中）。 |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost，决定段的底色与描边使用方式。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `fullWidth` | `boolean` |  | 撑满行宽：整组占满可用宽度，每段等分剩余空间。 |
| `separators` | `boolean` |  | 是否自动在相邻条目之间插入分隔线，默认 true。 |
| `name` | `string` |  | 表单字段名。提供后隐藏输入才带 name 并参与提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只改写左右方向键的语义，上下键与之无关。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `rovingFocus` | `boolean` |  | roving tabindex，默认开启：整组只占一个 Tab 位，组内依靠方向键移动。 关闭后每个条目自成一个 Tab 停靠点，方向键不再接管。 |
| `onValueChange` | `(details: ToggleGroupValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |

### ToggleGroupNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 展示文本；默认回退为 value。 |
| `disabled` | `boolean` |  | 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ToggleGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| string[] \| null }`（形态随 multiple 决定） |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhToggleGroupItem` | `value` | `string` | 是 |  |
| `XhToggleGroupItem` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhToggleGroupRoot` | `renderItem` | `(node: ToggleGroupNodeMeta) => ReactNode` |  | 每个条目的自定义内容；未提供时使用 collection 中的 label。 |
| `XhToggleGroupRoot` | `children` | `ReactNode` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'on' \| 'off' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 当前选中集合，恒为数组（单选时长度 ≤ 1）。 |
| `collection` | `readonly ToggleGroupNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `orientation` | `Orientation` |  |
| `separators` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: ToggleGroupValue) => void` | 传单值 / 数组 / null 均可，内部按 multiple 归一。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ToggleGroupItemProps) => T['button']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：整组只有一份，提交的即当前选中值。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | rovingFocus 开启（默认） | 整组只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投 |
| `ArrowRight` / `ArrowDown` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕），不改选中；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到上一个可停留条目，不改选中；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到首个可停留条目 |
| `End` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, 条目未禁用 | 切换该条目；条目是原生 button，这两个键由平台翻成 click |
| `Enter` / `Space` | held on item, 条目未禁用且组未禁用 | 按住期间该条目投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中整组转入禁用也撤下。开关态与按压互相独立，切换照旧由平台把这一次按键翻成 click |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-orientation` | undefined \| props.orientation |
| `root` | `role` | 'group' \| 'radiogroup' |
| `item` | `aria-checked` | undefined \| 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-pressed` | 'true' \| 'false' \| undefined |
| `item` | `role` | undefined \| 'radio' |

## 样式参考

### 皮肤

`@xihan-ui/styles/toggle-group.css` 使用 `[data-scope="toggle-group"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-state` | 'on' \| 'off' |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'text' |
| `item` | `data-xh-action-size` | props.size |
| `item` | `data-xh-action-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toggle-group-item-bg` | `item` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_toggle-group-item-bg` | toggle-group 的 item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toggle-group-item-bg-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_toggle-group-item-bg-active` | toggle-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-toggle-group-item-bg-disabled` | `item` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-bg-muted` | toggle-group 的 item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toggle-group-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_toggle-group-item-bg-hover` | toggle-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-toggle-group-item-bg-on` | `item` | `--xh-ink-surface`<br>`background-color` | `focus-visible`<br>`state=on`<br>`xh-ink-surface` | `--xh-_toggle-group-item-bg-on` | toggle-group 的 item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toggle-group-item-bg-on-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-_toggle-group-item-bg-on-active` | toggle-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-toggle-group-item-bg-on-disabled` | `item` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`state=on`<br>`xh-ink-surface` | `--xh-_toggle-group-item-bg-on` | toggle-group 的 item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toggle-group-item-bg-on-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=on` | `--xh-_toggle-group-item-bg-on-hover` | toggle-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-toggle-group-item-border` | `item` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_toggle-group-item-border` | toggle-group 的 item 部件 border、border-color 覆盖槽。 |
| `--xh-toggle-group-item-border-disabled` | `item` | `border-color` | `disabled` | `--xh-border-subtle` | toggle-group 的 item 部件 border-color 覆盖槽。 |
| `--xh-toggle-group-item-border-on` | `item` | `border`<br>`border-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-_toggle-group-item-border-on` | toggle-group 的 item 部件 border、border-color 覆盖槽。 |
| `--xh-toggle-group-item-border-on-disabled` | `item` | `border-color` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-border-on` | toggle-group 的 item 部件 border-color 覆盖槽。 |
| `--xh-toggle-group-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_toggle-group-item-fg` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-fg-on` | `item` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-_toggle-group-item-fg-on` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-fg-on-disabled` | `item` | `color` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-fg-on` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_toggle-group-font-size` | toggle-group 的 item 部件 font-size 覆盖槽。 |
| `--xh-toggle-group-item-font-weight` | `item` | `font-weight` | `default` | `--xh-text-label-weight` | toggle-group 的 item 部件 font-weight 覆盖槽。 |
| `--xh-toggle-group-item-gap` | `item` | `gap` | `default` | `--xh-_toggle-group-gap` | toggle-group 的 item 部件 gap 覆盖槽。 |
| `--xh-toggle-group-item-h` | `item` | `block-size` | `default` | `--xh-_toggle-group-h` | toggle-group 的 item 部件 block-size 覆盖槽。 |
| `--xh-toggle-group-item-px` | `item` | `padding-inline` | `default` | `--xh-_toggle-group-px` | toggle-group 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-toggle-group-item-radius` | `item`<br>`root` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `first-child`<br>`first-of-type`<br>`last-child`<br>`last-of-type`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=outline` | `--xh-shape-control` | toggle-group 的 item、root 部件 border-end-end-radius、border-end-start-radius、border-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-toggle-group-item-shadow` | `item` | `box-shadow` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-_toggle-group-item-highlight-on` | toggle-group 的 item 部件 box-shadow 覆盖槽。 |
| `--xh-toggle-group-outline-color` | `root` | `border` | `variant=outline` | `--xh-_tone-border-control` | toggle-group 的 root 部件 border 覆盖槽。 |
| `--xh-toggle-group-separator-color` | `root` | `background` | `xh-toggle-group-separator` | `--xh-fg-default` | toggle-group 的 root 部件 background 覆盖槽。 |
| `--xh-toggle-group-separator-color-disabled` | `root` | `background` | `disabled`<br>`xh-toggle-group-separator` | `--xh-border-subtle` | toggle-group 的 root 部件 background 覆盖槽。 |
| `--xh-toggle-group-separator-opacity` | `root` | `opacity` | `xh-toggle-group-separator` | `--xh-control-separator-opacity` | toggle-group 的 root 部件 opacity 覆盖槽。 |
| `--xh-toggle-group-separator-opacity-disabled` | `root` | `opacity` | `disabled`<br>`xh-toggle-group-separator` | `--xh-control-separator-disabled-opacity` | toggle-group 的 root 部件 opacity 覆盖槽。 |
| `--xh-toggle-group-separator-radius` | `root` | `border-radius` | `xh-toggle-group-separator` | `--xh-shape-pill` | toggle-group 的 root 部件 border-radius 覆盖槽。 |
| `--xh-toggle-group-separator-size` | `root` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-toggle-group-separator` | `--xh-_group-separator-size` | toggle-group 的 root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-toggle-group-separator-thickness` | `root` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-toggle-group-separator` | `--xh-stroke-thin` | toggle-group 的 root 部件 block-size、inline-size、margin-block-start、margin-inline-start 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
