来源：https://ui.docs.xihanfun.com/components/radio-group

# RadioGroup 单选组

一组互斥选项共用一个值，所有选项同时可见。单个单选按钮是这里的 `item` 部件，不另立组件：它脱离组既没有互斥对象，也无法取消选中。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/radio-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/radio-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/radio-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/radio-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/radio-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

组内只有一个 Tab 停靠点，进组后四个方向键都能切换

```vue
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "standard", label: "标准版" },
  { value: "pro", label: "专业版" },
];
</script>

<template>
  <XhRadioGroupRoot
    :collection="plans"
    default-value="standard"
    label="套餐"
    name="plan"
  />
</template>
```

```html
<xh-radio-group default-value="standard" name="plan">
  <div data-xh-part="root">
    <span data-xh-part="label">套餐</span>
    <div data-xh-part="item" value="free">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">免费版</span>
    </div>
    <div data-xh-part="item" value="standard">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">标准版</span>
    </div>
    <div data-xh-part="item" value="pro">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">专业版</span>
    </div>
  </div>
</xh-radio-group>
```

## 组件结构

加粗的是必需部件。

`data-scope="radio-group"`：`root` · `label` · **`item`** · `item-text` · `indicator` · `hidden-input`

## 示例

### 受控

传入 value 后由宿主决定；值可以是 null，表示没有任何一项选中

```vue
<script setup lang="ts">
import {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const plan = ref<string | null>("free");
</script>

<template>
  <XhRadioGroupRoot v-model:value="plan">
    <XhRadioGroupLabel>套餐</XhRadioGroupLabel>
    <XhRadioGroupItem value="free">
      <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
    </XhRadioGroupItem>
    <XhRadioGroupItem value="standard">
      <XhRadioGroupItemText>标准版</XhRadioGroupItemText>
    </XhRadioGroupItem>
  </XhRadioGroupRoot>
  <span>当前：{{ plan ?? "（未选）" }}</span>
  <button type="button" @click="plan = null">清空</button>
</template>
```

```html
<xh-radio-group id="radio-controlled" value="free">
  <div data-xh-part="root">
    <span data-xh-part="label">套餐</span>
    <div data-xh-part="item" value="free">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">免费版</span>
    </div>
    <div data-xh-part="item" value="standard">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">标准版</span>
    </div>
  </div>
</xh-radio-group>
<span id="radio-controlled-readout">当前：free</span>
<button id="radio-controlled-clear" type="button">清空</button>

<script type="module">
  // 选中值由宿主写回元素，清空按钮把它置为 null
  const group = document.getElementById("radio-controlled");
  const readout = document.getElementById("radio-controlled-readout");
  const clear = document.getElementById("radio-controlled-clear");

  function render() {
    readout.textContent = `当前：${group.value ?? "（未选）"}`;
  }

  group.addEventListener("value-change", (event) => {
    group.value = event.detail.value;
    render();
  });
  clear.addEventListener("click", () => {
    group.value = null;
    render();
  });
</script>
```

### 横向排布

orientation 只影响排版与 aria-orientation，方向键四个方向照样都能切换

```vue
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "小" },
  { value: "md", label: "中" },
  { value: "lg", label: "大" },
];
</script>

<template>
  <XhRadioGroupRoot
    :collection="sizes"
    default-value="md"
    label="尺寸"
    orientation="horizontal"
  />
</template>
```

```html
<xh-radio-group default-value="md" orientation="horizontal">
  <div data-xh-part="root">
    <span data-xh-part="label">尺寸</span>
    <div data-xh-part="item" value="sm">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">小</span>
    </div>
    <div data-xh-part="item" value="md">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">中</span>
    </div>
    <div data-xh-part="item" value="lg">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">大</span>
    </div>
  </div>
</xh-radio-group>
```

### 禁用

单项禁用后不可点击，方向键也跳过它；整组禁用则每一项都随之禁用

```vue
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版", disabled: true },
];
const openPlans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版" },
];
</script>

<template>
  <XhRadioGroupRoot :collection="plans" default-value="free" label="单项禁用" />

  <XhRadioGroupRoot
    :collection="openPlans"
    default-value="free"
    disabled
    label="整组禁用"
  />
</template>
```

```html
<xh-radio-group default-value="free">
  <div data-xh-part="root">
    <span data-xh-part="label">单项禁用</span>
    <div data-xh-part="item" value="free">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">免费版</span>
    </div>
    <div data-xh-part="item" value="pro" aria-disabled="true">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">专业版</span>
    </div>
  </div>
</xh-radio-group>

<xh-radio-group default-value="free" disabled>
  <div data-xh-part="root">
    <span data-xh-part="label">整组禁用</span>
    <div data-xh-part="item" value="free">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">免费版</span>
    </div>
    <div data-xh-part="item" value="pro">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">专业版</span>
    </div>
  </div>
</xh-radio-group>
```

### 颜色

tone 决定选中圆点使用哪族颜色，六种语气各一组

```vue
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const answers = [
  { value: "yes", label: "选中" },
  { value: "no", label: "未选" },
];
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRadioGroupRoot
      v-for="t in tones"
      :key="t"
      :collection="answers"
      :label="t"
      :tone="t"
      default-value="yes"
    />
  </div>
</template>
```

```html
<div style="display: flex; gap: 32px; flex-wrap: wrap">
  <xh-radio-group tone="brand" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">brand</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="neutral" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">neutral</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="success" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="warning" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="danger" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="info" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">info</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
</div>
```

### 尺寸

size 改变条目间距与字号，不写即默认中档

```vue
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "standard", label: "标准版" },
];
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
    <XhRadioGroupRoot
      :collection="plans"
      default-value="standard"
      label="sm"
      size="sm"
    />

    <XhRadioGroupRoot :collection="plans" default-value="standard" label="缺省" />

    <XhRadioGroupRoot
      :collection="plans"
      default-value="standard"
      label="lg"
      size="lg"
    />
  </div>
</template>
```

```html
<div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
  <xh-radio-group default-value="standard" size="sm">
    <div data-xh-part="root">
      <span data-xh-part="label">sm</span>
      <div data-xh-part="item" value="free">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">免费版</span>
      </div>
      <div data-xh-part="item" value="standard">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">标准版</span>
      </div>
    </div>
  </xh-radio-group>

  <xh-radio-group default-value="standard">
    <div data-xh-part="root">
      <span data-xh-part="label">缺省</span>
      <div data-xh-part="item" value="free">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">免费版</span>
      </div>
      <div data-xh-part="item" value="standard">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">标准版</span>
      </div>
    </div>
  </xh-radio-group>

  <xh-radio-group default-value="standard" size="lg">
    <div data-xh-part="root">
      <span data-xh-part="label">lg</span>
      <div data-xh-part="item" value="free">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">免费版</span>
      </div>
      <div data-xh-part="item" value="standard">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">标准版</span>
      </div>
    </div>
  </xh-radio-group>
</div>
```

### 数据驱动

数据字段的命名由数据决定，映射为条目的值、文本与禁用即可

```vue
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const level = ref<string | null>("p1");
const levels = [
  { code: "p0", text: "紧急", locked: false },
  { code: "p1", text: "高", locked: false },
  { code: "p2", text: "普通", locked: false },
  { code: "p3", text: "低", locked: true },
];
const collection = computed(() =>
  levels.map(lv => ({ value: lv.code, label: lv.text, disabled: lv.locked })),
);
</script>

<template>
  <XhRadioGroupRoot
    v-model:value="level"
    :collection="collection"
    label="优先级"
    name="level"
    orientation="horizontal"
  />
  <span>当前：{{ level ?? "（未选）" }}</span>
</template>
```

```html
<!-- 数据里的 code 落成条目的 value，text 落成 item-text，locked 落成 aria-disabled -->
<xh-radio-group id="radio-options" value="p1" name="level" orientation="horizontal">
  <div data-xh-part="root">
    <span data-xh-part="label">优先级</span>
    <div data-xh-part="item" value="p0">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">紧急</span>
    </div>
    <div data-xh-part="item" value="p1">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">高</span>
    </div>
    <div data-xh-part="item" value="p2">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">普通</span>
    </div>
    <div data-xh-part="item" value="p3" aria-disabled="true">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">低</span>
    </div>
  </div>
</xh-radio-group>
<span id="radio-options-readout">当前：p1</span>

<script type="module">
  // 选中值由宿主写回元素，下面那行文字跟着走
  const group = document.getElementById("radio-options");
  const readout = document.getElementById("radio-options-readout");
  group.addEventListener("value-change", (event) => {
    group.value = event.detail.value;
    readout.textContent = `当前：${group.value ?? "（未选）"}`;
  });
</script>
```

## 设计指引

### 何时使用

- 二到五个互斥选项，且各选项的文字值得同时展开供用户比较。

### 何时不用

- 选项超过五六个时，使用[选择器](./select)。
- 选项是并列的视图切换时，使用[切换按钮组](./toggle-group)或[标签页](./tabs)。
- 可以多选时，使用[复选框组](./checkbox-group)。

### 特性

- 整组只占一个 Tab 位，组内靠方向键移动，与原生单选组一致。
- `hidden-input` 承担表单参与。
- `collection` 可数据驱动，也可以逐项编写。
- 圆圈是字段家族的控制盒：不填底、描边与无影，选中后以语气色圆点填充；整行接 Action Control row 档，悬停 / 按下换面不缩放，圆圈随行换到承载面阶梯的下一档。
- 与[复选框](./checkbox)的不对称是有意的：一个复选框自身即成立（勾选同意条款），一个单选按钮自身不成立，因此复选框有独立组件、单选按钮没有。

### 组合

- 外层放[表单字段](./field)；每项的补充说明放进选项内容。

### 最佳实践

- 提供默认选中项，除非“未选”本身有意义。
- 选项文字写完整，不依赖共同前缀省略。

### 反模式

- 单选组只有一个选项，用户无从选择。
- 选项可以被取消选中：单选组一旦选中就不应回到空值，需要空值时增加一项“不指定”。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-radio-group>` |
| Vue 组件 | `XhRadioGroupItem` `XhRadioGroupItemText` `XhRadioGroupLabel` `XhRadioGroupRoot` |
| 组合式函数 | `useRadioGroup` |
| 状态机 | `radioGroupMachine` |
| 皮肤 | `@xihan-ui/styles/radio-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `RadioGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用都写在条目部件上的方式。 |
| `value` | `string \| null` |  |  |
| `defaultValue` | `string \| null` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  | 只读：不可选择，但仍可聚焦、方向键照常移动焦点，对比度不降低。 |
| `invalid` | `boolean` |  | 校验失败：只改变呈现，不阻止交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 |
| `orientation` | `Orientation` |  |  |
| `dir` | `Direction` |  | 文字方向，默认 'ltr'。 |
| `name` | `string` |  | 表单字段名。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: RadioGroupValueChangeDetails) => void` |  | value 变化回调。 |

### RadioGroupNode

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
| `value-change` | `RadioGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhRadioGroupItem` | `value` | `string` | 是 |  |
| `XhRadioGroupItem` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhRadioGroupRoot` | `label` | `ReactNode` |  | 标题文字。提供后不必再写 label 部件。 |
| `XhRadioGroupRoot` | `renderItem` | `(node: RadioGroupNodeMeta) => ReactNode` |  | 每个条目的自定义内容；未提供时使用 collection 中的 label。 |
| `XhRadioGroupRoot` | `children` | `ReactNode` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `indicator` | 'checked' \| 'unchecked' |
| `hidden-input` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `collection` | `readonly RadioGroupNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `setValue` | `(next: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getHiddenInputProps` | `(props: RadioGroupItemProps) => T['input']` | 条目对应的隐藏原生 radio 输入，用于表单提交。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点条目（即选中项）；落到容器上时由容器转投锚点条目，锚点缺席或被禁用才落首个可停留项 |
| `ArrowDown` / `ArrowRight` | focus in group, group not disabled | 焦点移到下一个可停留条目并选中，末项回绕到首项；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowUp` / `ArrowLeft` | focus in group, group not disabled | 焦点移到上一个可停留条目并选中，首项回绕到末项；dir=rtl 时改由 ArrowRight 承担 |
| `Space` | focus on item, item not disabled | 选中当前条目 |
| `Space` | held on item, 条目未禁用且组未禁用、非只读 | 按住期间该条目投影 data-pressed，与指针 :active 同一副按压面（行与圆圈一起换面）；抬起或失焦撤下，按住途中整组转入禁用或只读也撤下。role=radio 只有 Space 是激活键，Enter 不进按压面；选中与按压互相独立 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `aria-orientation` | props.orientation |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'radiogroup' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'radio' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/radio-group.css` 使用 `[data-scope="radio-group"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-invalid` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'row' |
| `item` | `data-xh-action-size` | 'xs' |
| `item` | `data-xh-action-variant` | 'ghost' |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-invalid` | ''（条件成立时才出现） |
| `item-text` | `data-readonly` | ''（条件成立时才出现） |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-invalid` | ''（条件成立时才出现） |
| `indicator` | `data-readonly` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'checked' \| 'unchecked' |
| `hidden-input` | `data-disabled` | ''（条件成立时才出现） |
| `hidden-input` | `data-invalid` | ''（条件成立时才出现） |
| `hidden-input` | `data-readonly` | ''（条件成立时才出现） |
| `hidden-input` | `data-state` | 'checked' \| 'unchecked' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-radio-group-gap` | `root` | `gap` | `default` | `--xh-space-2` | radio-group 的 root 部件 gap 覆盖槽。 |
| `--xh-radio-group-indicator-bg` | `indicator` | `background` | `default` | `transparent` | radio-group 的 indicator 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-bg-disabled` | `indicator`<br>`item` | `background` | `disabled` | `--xh-bg-subtle` | radio-group 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-bg-pressed` | `indicator`<br>`item` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `--xh-_radio-group-host-bg-pressed` | radio-group 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-border` | `indicator` | `border` | `default` | `--xh-border-control` | radio-group 的 indicator 部件 border 覆盖槽。 |
| `--xh-radio-group-indicator-border-checked` | `indicator` | `border-color` | `state=checked` | `--xh-_radio-group-accent` | radio-group 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-border-disabled` | `indicator`<br>`item` | `border-color` | `disabled` | `--xh-border-default` | radio-group 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-border-hover` | `indicator`<br>`item` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`readonly`<br>`state=checked` | `--xh-border-control-hover` | radio-group 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-border-invalid` | `indicator` | `border-color` | `invalid`<br>`state=checked` | `--xh-border-invalid` | radio-group 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-dot` | `indicator` | `background` | `default` | `--xh-_radio-group-accent` | radio-group 的 indicator 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-dot-disabled` | `indicator`<br>`item` | `background` | `disabled` | `--xh-fg-disabled` | radio-group 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-dot-pressed` | `indicator`<br>`item` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked` | `--xh-_tone-active` | radio-group 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-circle` | radio-group 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-radio-group-indicator-size` | `indicator` | `block-size`<br>`inline-size` | `default` | `--xh-_radio-group-indicator` | radio-group 的 indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-radio-group-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | radio-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-radio-group-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | radio-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-radio-group-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | radio-group 的 item 部件 color 覆盖槽。 |
| `--xh-radio-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` | radio-group 的 item 部件 color 覆盖槽。 |
| `--xh-radio-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_radio-group-font-size` | radio-group 的 item 部件 font-size 覆盖槽。 |
| `--xh-radio-group-item-gap` | `item` | `gap` | `default` | `--xh-_radio-group-item-gap` | radio-group 的 item 部件 gap 覆盖槽。 |
| `--xh-radio-group-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | radio-group 的 item 部件 border-radius 覆盖槽。 |
| `--xh-radio-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | radio-group 的 label 部件 color 覆盖槽。 |
| `--xh-radio-group-label-fg-disabled` | `label`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` | radio-group 的 label、root 部件 color 覆盖槽。 |
| `--xh-radio-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | radio-group 的 label 部件 font-size 覆盖槽。 |
| `--xh-radio-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | radio-group 的 label 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换（见[动效规范](../design/motion#角色)）。

`background-color` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
