来源：https://ui.docs.xihanfun.com/components/radio-group

# RadioGroup `单选组`

一组互斥选项共一个值，所有选项同时可见。单个单选钮是这里的 `item` 部件，不另立组件——它脱离组既没有互斥对象，也无法取消选中。

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

## 示例

### 受控

传了 value 就由宿主说了算；值可以是 null，表示一项都没选中

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

单项禁用后点不动，方向键也跳过它；整组禁用则每一项都跟着禁用

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

### 语气

tone 决定选中圆点用哪族颜色，六种语气各一组

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

size 改条目间距与字号，不写即缺省中档

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

自家字段叫什么由数据定，映射成条目的值、文本与禁用即可

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

- 二到五个互斥选项，且各选项的文字值得同时摊开让用户比较。

### 何时不用

- 选项超过五六个：用[选择器](./select)。
- 选项是并列的视图切换：用[切换按钮组](./toggle-group)或[标签页](./tabs)。
- 可以多选：用[复选框组](./checkbox-group)。

### 特性

- 整组只占一个 Tab 位，组内靠方向键走——这是原生单选组的行为。
- `hidden-input` 承担表单参与。
- `collection` 可数据驱动，也可以逐项写。
- 与[复选框](./checkbox)的不对称是有意的：一个复选框自己就成立（勾选同意条款），一个单选钮自己不成立，所以复选框另有独立组件、单选钮没有。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-radio-group>` |
| Vue 组件 | `XhRadioGroupItem` `XhRadioGroupItemText` `XhRadioGroupLabel` `XhRadioGroupRoot` |
| 组合式函数 | `useRadioGroup` |
| 状态机 | `radioGroupMachine` |
| 皮肤 | `@xihan-ui/styles/radio-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="radio-group"`：`root` · `label` · **`item`** · `item-text` · `indicator` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `RadioGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| null` |  |  |
| `defaultValue` | `string \| null` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  | 只读：选不动，但仍可聚焦、方向键照常移焦点，对比度不降。 |
| `invalid` | `boolean` |  | 校验失败：只改呈现，不挡交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起用，只发无障碍属性，不自行拦提交。 |
| `orientation` | `Orientation` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 'ltr'。 |
| `name` | `string` |  | 表单字段名。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: RadioGroupValueChangeDetails) => void` |  | value 变化回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `RadioGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET`

## connect API

`useRadioGroup` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `collection` | `readonly RadioGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `setValue` | `(next: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getHiddenInputProps` | `(props: RadioGroupItemProps) => T['input']` | 条目对应的隐藏原生 radio 输入，用于表单提交。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点条目（即选中项）；落到容器上时由容器转投锚点条目，锚点缺席或被禁用才落首个可停留项 |
| `ArrowDown` / `ArrowRight` | focus in group, group not disabled | 焦点移到下一个可停留条目并选中，末项回绕到首项；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowUp` / `ArrowLeft` | focus in group, group not disabled | 焦点移到上一个可停留条目并选中，首项回绕到末项；dir=rtl 时改由 ArrowRight 承担 |
| `Space` | focus on item, item not disabled | 选中当前条目 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

## 样式

默认皮肤 `@xihan-ui/styles/radio-group.css` 按部件选择：`[data-scope="radio-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-radio-group-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | radio-group 的 root 部件 gap 覆盖槽。 |
| `--xh-radio-group-indicator-bg` | `indicator` | `background` | `default` | `--xh-bg-canvas` | radio-group 的 indicator 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-border` | `indicator` | `border` | `default` | `--xh-border-control` | radio-group 的 indicator 部件 border 覆盖槽。 |
| `--xh-radio-group-indicator-border-checked` | `indicator` | `border-color` | `state=checked` | `--xh-_radio-group-accent` | radio-group 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-border-invalid` | `indicator` | `border-color` | `invalid`<br>`state=checked` | `--xh-border-invalid` | radio-group 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-dot` | `indicator` | `background` | `default` | `--xh-_radio-group-accent` | radio-group 的 indicator 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | radio-group 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-radio-group-indicator-size` | `indicator` | `block-size`<br>`inline-size` | `default` | `--xh-_radio-group-indicator` | radio-group 的 indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-radio-group-item-fg` | `item` | `color` | `default` | `--xh-fg-default` | radio-group 的 item 部件 color 覆盖槽。 |
| `--xh-radio-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` | radio-group 的 item 部件 color 覆盖槽。 |
| `--xh-radio-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_radio-group-font-size` | radio-group 的 item 部件 font-size 覆盖槽。 |
| `--xh-radio-group-item-gap` | `item` | `gap` | `default` | `--xh-_radio-group-item-gap` | radio-group 的 item 部件 gap 覆盖槽。 |
| `--xh-radio-group-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | radio-group 的 item 部件 border-radius 覆盖槽。 |
| `--xh-radio-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | radio-group 的 label 部件 color 覆盖槽。 |
| `--xh-radio-group-label-font-size` | `label` | `font-size` | `default` | `--xh-_radio-group-font-size` | radio-group 的 label 部件 font-size 覆盖槽。 |
| `--xh-radio-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | radio-group 的 label 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 外面套[表单字段](./field)；每项下面的补充说明放进选项内容里。

## 最佳实践

- 给出默认选中项，除非"未选"本身有意义。
- 选项文字写完整，别靠共同前缀省略。

## 反模式

- 单选组只有一个选项：用户选不了别的，等于什么都没问。
- 选项能被取消选中：单选组一旦选中就不该回到空值，需要空值就加一项"不指定"。
