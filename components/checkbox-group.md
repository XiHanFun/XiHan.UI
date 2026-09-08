来源：https://ui.docs.xihanfun.com/components/checkbox-group

# 复选框组 `checkbox-group`

一组多选项共一个值数组，附带全选与半选。

## 何时使用

- 从若干项里选任意多项，且要随表单提交。

## 何时不用

- 选项很多、需要搜索：用[选择器](./select)的多选或[穿梭框](./transfer)。
- 选项互斥：用[单选组](./radio-group)。

## 特性

- `collection` 是文本与禁用的事实源；也可以逐项自己写。
- 全选触发器自动算半选态。
- `orientation` 换排布；也可以直接把条目放进[栅格](./grid)。
- 值可以是数字主键，不必强转字符串。

## 示例

### 基础用法

值是字符串数组，各选各的，再点一次即取消；组内有几项就有几个 Tab 停靠点

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const toppings = ref<string[]>(["cheese"]);
const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
  { value: "corn", label: "玉米" },
];
</script>

<template>
  <!-- 交出 collection 即可，组标题与每个条目的方框、文本由组件按数据铺开 -->
  <XhCheckboxGroupRoot v-model:value="toppings" :collection="items" label="配料" name="topping" />
  <span>当前：{{ toppings.join("、") || "（无）" }}</span>
</template>
```

```html
<xh-checkbox-group id="checkbox-group-basic" default-value="cheese" name="topping">
  <div data-xh-part="root">
    <span data-xh-part="label">配料</span>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <div data-xh-part="item" value="bacon">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">培根</span>
    </div>
    <div data-xh-part="item" value="corn">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">玉米</span>
    </div>
  </div>
</xh-checkbox-group>
<span>当前：<span id="checkbox-group-basic-value">cheese</span></span>

<script type="module">
  // 选中值回显在后面那行文字里
  const group = document.getElementById("checkbox-group-basic");
  const readout = document.getElementById("checkbox-group-basic-value");
  group.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 全选与半选

select-all-trigger 是第三态复选框，只有把全部条目的值交给 itemValues 才分得清 checked 与 indeterminate

```vue
<script setup lang="ts">
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupSelectAllTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
  { value: "corn", label: "玉米" },
  { value: "truffle", label: "松露（禁用）", disabled: true },
];
const itemValues = items.map(t => t.value);
const toppings = ref<string[]>(["cheese"]);
</script>

<template>
  <XhCheckboxGroupRoot
    v-slot="{ checkedState }"
    v-model:value="toppings"
    :item-values="itemValues"
  >
    <XhCheckboxGroupLabel>配料</XhCheckboxGroupLabel>
    <!-- 方框与勾号／横杠由皮肤画，这里只写文案 -->
    <XhCheckboxGroupSelectAllTrigger>
      <span>全选（{{ checkedState }}）</span>
    </XhCheckboxGroupSelectAllTrigger>
    <XhCheckboxGroupItem
      v-for="t in items"
      :key="t.value"
      :value="t.value"
      :disabled="t.disabled"
    >
      <XhCheckboxGroupIndicator />
      <XhCheckboxGroupItemText>{{ t.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>
  <span>当前：{{ toppings.join("、") || "（无）" }}</span>
</template>
```

```html
<xh-checkbox-group
  id="checkbox-group-select-all"
  default-value="cheese"
  item-values="cheese,bacon,corn,truffle"
>
  <div data-xh-part="root">
    <span data-xh-part="label">配料</span>
    <!-- 方框与勾号／横杠由皮肤画，这里只写文案 -->
    <div data-xh-part="select-all-trigger">
      <span>全选（<span id="checkbox-group-select-all-state">some</span>）</span>
    </div>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <div data-xh-part="item" value="bacon">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">培根</span>
    </div>
    <div data-xh-part="item" value="corn">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">玉米</span>
    </div>
    <div data-xh-part="item" value="truffle" aria-disabled="true">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">松露（禁用）</span>
    </div>
  </div>
</xh-checkbox-group>
<span>当前：<span id="checkbox-group-select-all-value">cheese</span></span>

<script type="module">
  // 全选格的三态写在它的 data-state 上，等这一轮接线落定再读
  const group = document.getElementById("checkbox-group-select-all");
  const trigger = group.querySelector('[data-xh-part="select-all-trigger"]');
  const state = document.getElementById("checkbox-group-select-all-state");
  const readout = document.getElementById("checkbox-group-select-all-value");
  group.addEventListener("value-change", async (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
    await group.updateComplete;
    state.textContent = trigger.dataset.state;
  });
</script>
```

### 横向排布

orientation 只出 data-orientation 交给皮肤排版，role=group 不接受 aria-orientation

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const channels = ref<string[]>(["email"]);
const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
];
</script>

<template>
  <XhCheckboxGroupRoot
    v-model:value="channels"
    :collection="items"
    label="通知渠道"
    orientation="horizontal"
  />
</template>
```

```html
<xh-checkbox-group default-value="email" orientation="horizontal">
  <div data-xh-part="root">
    <span data-xh-part="label">通知渠道</span>
    <div data-xh-part="item" value="email">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">邮件</span>
    </div>
    <div data-xh-part="item" value="sms">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">短信</span>
    </div>
    <div data-xh-part="item" value="push">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">推送</span>
    </div>
  </div>
</xh-checkbox-group>
```

### 禁用与只读

整组禁用连隐藏输入一起退出提交，只读则仍能聚焦与朗读、只是改不动

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

// 单项禁用写在数据里，条目部件上不必再声明一遍
const partly = [
  { value: "cheese", label: "芝士" },
  { value: "truffle", label: "松露", disabled: true },
];
</script>

<template>
  <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="整组禁用" disabled />

  <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="整组只读" read-only />

  <XhCheckboxGroupRoot :default-value="['cheese']" :collection="partly" label="单项禁用" />
</template>
```

```html
<xh-checkbox-group default-value="cheese" disabled>
  <div data-xh-part="root">
    <span data-xh-part="label">整组禁用</span>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <div data-xh-part="item" value="bacon">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">培根</span>
    </div>
  </div>
</xh-checkbox-group>

<xh-checkbox-group default-value="cheese" read-only>
  <div data-xh-part="root">
    <span data-xh-part="label">整组只读</span>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <div data-xh-part="item" value="bacon">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">培根</span>
    </div>
  </div>
</xh-checkbox-group>

<xh-checkbox-group default-value="cheese">
  <div data-xh-part="root">
    <span data-xh-part="label">单项禁用</span>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <!-- 单项禁用写在条目节点上 -->
    <div data-xh-part="item" value="truffle" aria-disabled="true">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">松露</span>
    </div>
  </div>
</xh-checkbox-group>
```

### 栅格排布

组容器的行列只是缺省排布，行内把 display 改成 grid 就能摆成多列

```vue
<script setup lang="ts">
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref<string[]>(["beijing", "chengdu"]);
const cities = [
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "guangzhou", label: "广州" },
  { value: "shenzhen", label: "深圳" },
  { value: "chengdu", label: "成都" },
  { value: "hangzhou", label: "杭州" },
];
</script>

<template>
  <XhCheckboxGroupRoot
    v-model:value="picked"
    style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 16px"
  >
    <XhCheckboxGroupLabel style="grid-column: 1 / -1">开通城市</XhCheckboxGroupLabel>
    <XhCheckboxGroupItem v-for="c in cities" :key="c.value" :value="c.value">
      <XhCheckboxGroupIndicator />
      <XhCheckboxGroupItemText>{{ c.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>
</template>
```

```html
<xh-checkbox-group default-value="beijing,chengdu">
  <div
    data-xh-part="root"
    style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 16px"
  >
    <span data-xh-part="label" style="grid-column: 1 / -1">开通城市</span>
    <div data-xh-part="item" value="beijing">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">北京</span>
    </div>
    <div data-xh-part="item" value="shanghai">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">上海</span>
    </div>
    <div data-xh-part="item" value="guangzhou">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">广州</span>
    </div>
    <div data-xh-part="item" value="shenzhen">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">深圳</span>
    </div>
    <div data-xh-part="item" value="chengdu">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">成都</span>
    </div>
    <div data-xh-part="item" value="hangzhou">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">杭州</span>
    </div>
  </div>
</xh-checkbox-group>
```

### 受控与拦截

传了 value 就由宿主说了算，value-change 只报意图；这里最多留两项

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref<string[]>(["email"]);
const rejected = ref(false);
const channels = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
  { value: "webhook", label: "回调" },
];

// 超过两项就不写回，界面停在原值
function onValueChange(details: { value: string[] }) {
  rejected.value = details.value.length > 2;
  if (!rejected.value)
    picked.value = details.value;
}
</script>

<template>
  <XhCheckboxGroupRoot
    :value="picked"
    :collection="channels"
    label="通知渠道（最多两项）"
    orientation="horizontal"
    @value-change="onValueChange"
  />
  <p>已选：{{ picked.join("、") || "（无）" }}{{ rejected ? " · 上一次超额，未写回" : "" }}</p>
</template>
```

```html
<xh-checkbox-group id="checkbox-group-event" value="email" orientation="horizontal">
  <div data-xh-part="root">
    <span data-xh-part="label">通知渠道（最多两项）</span>
    <div data-xh-part="item" value="email">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">邮件</span>
    </div>
    <div data-xh-part="item" value="sms">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">短信</span>
    </div>
    <div data-xh-part="item" value="push">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">推送</span>
    </div>
    <div data-xh-part="item" value="webhook">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">回调</span>
    </div>
  </div>
</xh-checkbox-group>
<p>已选：<span id="checkbox-group-event-value">email</span></p>

<script type="module">
  // 超过两项就不写回，界面停在原值
  const group = document.getElementById("checkbox-group-event");
  const readout = document.getElementById("checkbox-group-event-value");
  let picked = ["email"];
  group.addEventListener("value-change", (event) => {
    const rejected = event.detail.value.length > 2;
    if (!rejected) picked = event.detail.value;
    group.value = [...picked];
    readout.textContent =
      (picked.join("、") || "（无）") + (rejected ? " · 上一次超额，未写回" : "");
  });
</script>
```

### 整组换档

方框边长、字号、间距与选中色都是组件令牌，写在组容器上整组一起生效

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

// 一档尺寸就是一组令牌：方框边长、勾的字号、条目字号、条目内间距与条目间距
const compact
  = "--xh-checkbox-group-indicator-size: 13px; --xh-checkbox-group-indicator-font-size: 10px; --xh-checkbox-group-item-font-size: 13px; --xh-checkbox-group-item-gap: 6px; --xh-checkbox-group-gap: 8px";
const roomy
  = "--xh-checkbox-group-indicator-size: 20px; --xh-checkbox-group-indicator-font-size: 15px; --xh-checkbox-group-item-font-size: 17px; --xh-checkbox-group-item-gap: 10px; --xh-checkbox-group-gap: 14px";
// 选中态的底与描边各是一个令牌，两个一起换才不会只填色不换边
const green
  = "--xh-checkbox-group-indicator-bg-checked: #16a34a; --xh-checkbox-group-indicator-border-checked: #16a34a";
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
    <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" :style="compact" label="紧凑" />

    <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="缺省" />

    <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" :style="roomy" label="宽松" />

    <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" :style="green" label="换选中色" />
  </div>
</template>
```

```html
<div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
  <xh-checkbox-group default-value="cheese">
    <!-- 一档尺寸就是一组令牌：方框边长、勾的字号、条目字号、条目内间距与条目间距 -->
    <div
      data-xh-part="root"
      style="
        --xh-checkbox-group-indicator-size: 13px;
        --xh-checkbox-group-indicator-font-size: 10px;
        --xh-checkbox-group-item-font-size: 13px;
        --xh-checkbox-group-item-gap: 6px;
        --xh-checkbox-group-gap: 8px;
      "
    >
      <span data-xh-part="label">紧凑</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">缺省</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group default-value="cheese">
    <div
      data-xh-part="root"
      style="
        --xh-checkbox-group-indicator-size: 20px;
        --xh-checkbox-group-indicator-font-size: 15px;
        --xh-checkbox-group-item-font-size: 17px;
        --xh-checkbox-group-item-gap: 10px;
        --xh-checkbox-group-gap: 14px;
      "
    >
      <span data-xh-part="label">宽松</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group default-value="cheese">
    <!-- 选中态的底与描边各是一个令牌，两个一起换才不会只填色不换边 -->
    <div
      data-xh-part="root"
      style="
        --xh-checkbox-group-indicator-bg-checked: #16a34a;
        --xh-checkbox-group-indicator-border-checked: #16a34a;
      "
    >
      <span data-xh-part="label">换选中色</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>
</div>
```

### 数字主键

条目身份存在 DOM 属性上，值一律是字符串；数字主键在进出两侧各转一次

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const roles = [
  { id: 101, name: "管理员" },
  { id: 102, name: "审核员" },
  { id: 103, name: "访客" },
];

// 条目数据交给组件前先把主键转成字符串
const options = roles.map(r => ({ value: String(r.id), label: r.name }));

// 业务侧存数字，组件侧收字符串，转换收在一个可写 computed 里
const roleIds = ref<number[]>([101]);
const picked = computed({
  get: () => roleIds.value.map(String),
  set: next => (roleIds.value = next.map(Number)),
});
</script>

<template>
  <XhCheckboxGroupRoot
    v-model:value="picked"
    :collection="options"
    label="角色"
    orientation="horizontal"
    name="role"
  />
  <span>提交给后端：{{ roleIds.join("、") || "（无）" }}</span>
</template>
```

```html
<xh-checkbox-group id="checkbox-group-numeric" value="101" orientation="horizontal" name="role">
  <div data-xh-part="root">
    <span data-xh-part="label">角色</span>
    <div data-xh-part="item" value="101">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">管理员</span>
    </div>
    <div data-xh-part="item" value="102">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">审核员</span>
    </div>
    <div data-xh-part="item" value="103">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">访客</span>
    </div>
  </div>
</xh-checkbox-group>
<span>提交给后端：<span id="checkbox-group-numeric-value">101</span></span>

<script type="module">
  // 业务侧存数字，组件侧收字符串，转换收在这一处
  const group = document.getElementById("checkbox-group-numeric");
  const readout = document.getElementById("checkbox-group-numeric-value");
  let roleIds = [101];
  group.addEventListener("value-change", (event) => {
    roleIds = event.detail.value.map(Number);
    group.value = roleIds.map(String);
    readout.textContent = roleIds.join("、") || "（无）";
  });
</script>
```

### 语气与尺寸

tone 换勾选方框的色族，size 换方框边长与文字档；两轴打在组容器上，条目自己不写

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

const rows = [
  { tone: "success", size: "md", label: "success" },
  { tone: "warning", size: "md", label: "warning" },
  { tone: "danger", size: "md", label: "danger" },
  { tone: "brand", size: "sm", label: "sm" },
  { tone: "brand", size: "lg", label: "lg" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
    <XhCheckboxGroupRoot
      v-for="row in rows"
      :key="row.label"
      :collection="items"
      :default-value="['cheese']"
      :tone="row.tone"
      :size="row.size"
      :label="row.label"
    />
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
  <xh-checkbox-group tone="success" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group tone="warning" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group tone="danger" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group size="sm" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">sm</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group size="lg" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">lg</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>
</div>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox-group>` |
| Vue 组件 | `XhCheckboxGroupIndicator` `XhCheckboxGroupItem` `XhCheckboxGroupItemText` `XhCheckboxGroupLabel` `XhCheckboxGroupRoot` `XhCheckboxGroupSelectAllTrigger` |
| 组合式函数 | `useCheckboxGroup` |
| 状态机 | `checkboxGroupMachine` |
| 皮肤 | `@xihan-ui/styles/checkbox-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="checkbox-group"`：**`root`** · `label` · **`item`** · `indicator` · `item-text` · `hidden-input` · `select-all-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `CheckboxGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string[]` |  | 选中值集合。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `itemValues` | `string[]` |  | 组内全部条目的值，按书写顺序声明；不给时 checkedState 退化成 unchecked / indeterminate 两态。 |
| `disabled` | `boolean` |  | 整组禁用：每一项都跟着禁用，且隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦与朗读，但用户改不动。 |
| `invalid` | `boolean` |  | 校验失败标注，落到每个条目的 aria-invalid 上。 |
| `name` | `string` |  | 表单字段名；给定后每个条目的隐藏输入才带 name，同名多值一并提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 vertical。只出 data-orientation，不出 aria-orientation。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选方框用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定方框与文字的几何档位。 |
| `onValueChange` | `(details: CheckboxGroupValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CheckboxGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCheckboxGroupRoot` | `default` | `CheckboxGroupRootSlotProps` |  |
| `XhCheckboxGroupRoot` | `label` | — |  |
| `XhCheckboxGroupRoot` | `item` | `CheckboxGroupNodeMeta` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `select-all-trigger` | resolveCheckedState(value, prop('itemValues') ?? []) |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.TOGGLE` · `ALL.TOGGLE` · `FORM.RESET`

**判据**：`editable`

## connect API

`useCheckboxGroup` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` |  |
| `collection` | `readonly CheckboxGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `checkedState` | `CheckboxGroupCheckedState` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `isChecked` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` | 整体替换选中集合。程序化入口，不受 readOnly 拦截。 |
| `toggleValue` | `(value: string) => void` | 翻转某个值；整组禁用或只读时无效。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getHiddenInputProps` | `(props: CheckboxGroupItemProps) => T['input']` | 条目的表单影子：一份视觉隐藏的原生 checkbox，由条目内部渲染。 |
| `getSelectAllTriggerProps` | `() => T['element']` | 全选/半选的父复选框。必须写在 root 之内，它靠祖先链找到本组。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus enters or leaves the group | 组内有几个条目就有几个 Tab 停靠点（禁用条目也留一个），容器自己不占位；单选组的"整组一个停靠点"在这里不成立 |
| `Space` | focus on item, group editable and item not disabled | 翻转该条目的选中态；改不动时放行按键给页面滚动 |
| `Space` | focus on select-all-trigger, group editable | 可用条目未全选则一并勾上，已全选则一并取消；禁用条目不受影响 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-invalid` | 'true' \| 'false' |
| `item` | `aria-readonly` | 'true' \| 'false' |
| `item` | `role` | 'checkbox' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-disabled` | 'false' \| 'true' |
| `select-all-trigger` | `aria-labelledby` | `label` 部件的 id `select-all-trigger` 部件的 id |
| `select-all-trigger` | `aria-readonly` | 'true' \| 'false' |
| `select-all-trigger` | `role` | 'checkbox' |

## 样式

默认皮肤 `@xihan-ui/styles/checkbox-group.css` 按部件选择：`[data-scope="checkbox-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-readonly` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-state` | resolveCheckedState(value, prop('itemValues') ?? []) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-checkbox-group-gap` · `--xh-checkbox-group-icon-size` · `--xh-checkbox-group-indicator-bg` · `--xh-checkbox-group-indicator-bg-checked` · `--xh-checkbox-group-indicator-border` · `--xh-checkbox-group-indicator-border-checked` · `--xh-checkbox-group-indicator-border-hover` · `--xh-checkbox-group-indicator-border-invalid` · `--xh-checkbox-group-indicator-fg` · `--xh-checkbox-group-indicator-font-size` · `--xh-checkbox-group-indicator-radius` · `--xh-checkbox-group-indicator-size` · `--xh-checkbox-group-item-fg` · `--xh-checkbox-group-item-fg-disabled` · `--xh-checkbox-group-item-font-size` · `--xh-checkbox-group-item-gap` · `--xh-checkbox-group-item-radius` · `--xh-checkbox-group-label-fg` · `--xh-checkbox-group-label-fg-disabled` · `--xh-checkbox-group-label-font-size` · `--xh-checkbox-group-label-font-weight` · `--xh-checkbox-group-select-all-trigger-fg` · `--xh-checkbox-group-select-all-trigger-fg-disabled` · `--xh-checkbox-group-select-all-trigger-font-size` · `--xh-checkbox-group-select-all-trigger-font-weight` · `--xh-checkbox-group-select-all-trigger-gap` · `--xh-checkbox-group-select-all-trigger-radius`

## 动效

`background` · `border-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)。

## 最佳实践

- 超过约十项就换成带搜索的控件。
- 选项顺序稳定，别按选中状态重排——用户会跟丢。

## 反模式

- 用它表达一组互斥的筛选条件。
- 全选框放在列表最下面。
