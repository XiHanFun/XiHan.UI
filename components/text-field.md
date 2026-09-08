来源：https://ui.docs.xihanfun.com/components/text-field

# 文本输入 `text-field`

单行或多行的自由文本输入。

## 何时使用

- 姓名、标题、描述、搜索词这类没有固定候选的文本。

## 何时不用

- 值来自一份已知清单：用[选择器](./select)或[组合框](./combobox)。
- 输入的是数字并需要加减：用[数字输入](./number-field)。
- 输入的是日期或时间：用[日期输入](./date-field)、[时间输入](./time-field)。

## 特性

- `type` 覆盖 `text` / `password` / `email` / `tel` / `url` / `search`。
- `clearable` 给出清空按钮，`maxLength` 给出字数上限。
- 多行时可自动长高。
- `prefix` / `suffix` 在框内摆货币符、单位或图标，两段对读屏隐藏。
- `showCount` 显出字数部件，数字取 `count` 与 `maxLength`，顶到上限时换色。
- 输入组、限制可输入字符由作者组合，组件不预设。

## 示例

### 基础用法

root 持有状态，label 与 control 里的 input 各自向它取属性；不传 value 即为非受控，组件自己维护值

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot placeholder="请输入昵称">
    <XhTextFieldLabel>昵称</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot default-value="曦寒">
    <XhTextFieldLabel>带初值</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field placeholder="请输入昵称">
  <div data-xh-part="root">
    <label data-xh-part="label">昵称</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<xh-text-field default-value="曦寒">
  <div data-xh-part="root">
    <label data-xh-part="label">带初值</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>
```

### 受控

传了 value 就由宿主说了算，组件自己不再改状态；变化经 value-change 报出来，写不写回由宿主定

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const nickname = ref("曦寒");
</script>

<template>
  <XhTextFieldRoot v-model:value="nickname" placeholder="请输入昵称">
    <XhTextFieldLabel>昵称</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
  <span>当前：{{ nickname || "（空）" }}</span>
  <button type="button" @click="nickname = '曦寒'">重置</button>
</template>
```

```html
<xh-text-field id="text-field-controlled" value="曦寒" placeholder="请输入昵称">
  <div data-xh-part="root">
    <label data-xh-part="label">昵称</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>
<span>当前：<span id="text-field-controlled-value">曦寒</span></span>
<button type="button" id="text-field-controlled-reset">重置</button>

<script type="module">
  // 值由外面这份状态持有，组件报上来才写回去
  const field = document.getElementById("text-field-controlled");
  const readout = document.getElementById("text-field-controlled-value");
  const reset = document.getElementById("text-field-controlled-reset");

  function apply(next) {
    field.value = next;
    readout.textContent = next || "（空）";
  }

  field.addEventListener("value-change", (event) => apply(event.detail.value));
  reset.addEventListener("click", () => apply("曦寒"));
</script>
```

### 可清空与字数上限

Control 把输入框与清空按钮圈进同一个框，clearable 让清空按钮可用并把 Escape 接管过来，maxLength 同时落成原生 maxlength 与机器侧截断

```vue
<script setup lang="ts">
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot
    v-slot="{ value, atLimit }"
    default-value="曦寒"
    placeholder="最多 10 个字符"
    :max-length="10"
    clearable
  >
    <XhTextFieldLabel>昵称</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
    <span>{{ value.length }} / 10{{ atLimit ? "（已到上限）" : "" }}</span>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field
  id="text-field-clearable"
  default-value="曦寒"
  placeholder="最多 10 个字符"
  max-length="10"
  clearable
>
  <div data-xh-part="root">
    <label data-xh-part="label">昵称</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" />
      <button data-xh-part="clear-trigger"></button>
    </div>
    <span id="text-field-clearable-count">2 / 10</span>
  </div>
</xh-text-field>

<script type="module">
  // 字数跟着值走，顶到上限补一句提示
  const field = document.getElementById("text-field-clearable");
  const count = document.getElementById("text-field-clearable-count");
  field.addEventListener("value-change", (event) => {
    const length = event.detail.value.length;
    count.textContent = `${length} / 10${length >= 10 ? "（已到上限）" : ""}`;
  });
</script>
```

### 禁用与校验态

disabled 与 readOnly 都改不动值，invalid 只把 aria-invalid 标出来、不拦输入

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot default-value="改不动" disabled>
    <XhTextFieldLabel>禁用</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 160px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot default-value="只能看" read-only>
    <XhTextFieldLabel>只读</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 160px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot default-value="格式不对" invalid>
    <XhTextFieldLabel>校验失败</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 160px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field default-value="改不动" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<xh-text-field default-value="只能看" read-only>
  <div data-xh-part="root">
    <label data-xh-part="label">只读</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<xh-text-field default-value="格式不对" invalid>
  <div data-xh-part="root">
    <label data-xh-part="label">校验失败</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>
```

### 形态

variant 决定底与描边怎么画：描边、淡色填底、无框；输入框没有实心档

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <!-- 无框档平时只看得见字，把指针移上去或聚焦才浮出边界 -->
  <XhTextFieldRoot
    v-for="v in variants"
    :key="v"
    :variant="v"
    placeholder="请输入内容"
  >
    <XhTextFieldLabel>{{ v }}</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 180px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field variant="outline" placeholder="请输入内容">
  <div data-xh-part="root">
    <label data-xh-part="label">outline</label>
    <div data-xh-part="control" style="inline-size: 180px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="subtle" placeholder="请输入内容">
  <div data-xh-part="root">
    <label data-xh-part="label">subtle</label>
    <div data-xh-part="control" style="inline-size: 180px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<!-- 无框档平时只看得见字，把指针移上去或聚焦才浮出边界 -->
<xh-text-field variant="ghost" placeholder="请输入内容">
  <div data-xh-part="root">
    <label data-xh-part="label">ghost</label>
    <div data-xh-part="control" style="inline-size: 180px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>
```

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，语气的底色差别不必聚焦就看得见

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <!-- 正文颜色不归语气管，语气只落在底色、悬停描边与聚焦环上 -->
  <XhTextFieldRoot
    v-for="t in tones"
    :key="t"
    variant="subtle"
    :tone="t"
    placeholder="点进来看聚焦环"
  >
    <XhTextFieldLabel>{{ t }}</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 160px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
```

```html
<!-- 正文颜色不归语气管，语气只落在底色、悬停描边与聚焦环上 -->
<xh-text-field variant="subtle" tone="brand" placeholder="点进来看聚焦环">
  <div data-xh-part="root">
    <label data-xh-part="label">brand</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="subtle" tone="neutral" placeholder="点进来看聚焦环">
  <div data-xh-part="root">
    <label data-xh-part="label">neutral</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="subtle" tone="success" placeholder="点进来看聚焦环">
  <div data-xh-part="root">
    <label data-xh-part="label">success</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="subtle" tone="warning" placeholder="点进来看聚焦环">
  <div data-xh-part="root">
    <label data-xh-part="label">warning</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="subtle" tone="danger" placeholder="点进来看聚焦环">
  <div data-xh-part="root">
    <label data-xh-part="label">danger</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="subtle" tone="info" placeholder="点进来看聚焦环">
  <div data-xh-part="root">
    <label data-xh-part="label">info</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>
```

### 尺寸

size 只改高度、内边距与字号，标签与清空按钮一起跟着换档；不写就是缺省档

```vue
<script setup lang="ts">
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 固定 outline 形态，只看档位的差别 -->
  <XhTextFieldRoot variant="outline" size="sm" default-value="小" clearable>
    <XhTextFieldLabel>sm</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot variant="outline" default-value="缺省" clearable>
    <XhTextFieldLabel>缺省</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot variant="outline" size="lg" default-value="大" clearable>
    <XhTextFieldLabel>lg</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
```

```html
<!-- 固定 outline 形态，只看档位的差别 -->
<xh-text-field variant="outline" size="sm" default-value="小" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">sm</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" />
      <button data-xh-part="clear-trigger"></button>
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="outline" default-value="缺省" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">缺省</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" />
      <button data-xh-part="clear-trigger"></button>
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="outline" size="lg" default-value="大" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">lg</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" />
      <button data-xh-part="clear-trigger"></button>
    </div>
  </div>
</xh-text-field>
```

### 程序化改值

setValue 直接写值，只受禁用、只读与字数上限约束；clear 走清空意图，canClear 不成立时按兵不动

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot
    v-slot="{ value, empty, canClear, setValue, clear }"
    placeholder="等着被写入"
    :max-length="12"
    clearable
  >
    <XhTextFieldLabel>收货人</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
    </XhTextFieldControl>
    <div style="display: flex; gap: 8px">
      <button type="button" @click="setValue('曦寒')">写入</button>
      <button type="button" @click="setValue(`${value}·`)">追加一个点</button>
      <button type="button" :disabled="!canClear" @click="clear()">清空</button>
    </div>
    <span>{{ empty ? "（空）" : `${value.length} / 12` }}</span>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field id="text-field-programmatic" placeholder="等着被写入" max-length="12" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">收货人</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>
<div style="display: flex; gap: 8px">
  <button type="button" id="text-field-programmatic-write">写入</button>
  <button type="button" id="text-field-programmatic-append">追加一个点</button>
  <button type="button" id="text-field-programmatic-clear">清空</button>
</div>
<span id="text-field-programmatic-readout">（空）</span>

<script type="module">
  const field = document.getElementById("text-field-programmatic");
  const clear = document.getElementById("text-field-programmatic-clear");
  const readout = document.getElementById("text-field-programmatic-readout");

  // 值的真本住在组件里，这里只跟着 value-change 抄一份，用来拼「追加」的下一个值
  let value = "";

  function sync() {
    readout.textContent = value === "" ? "（空）" : `${value.length} / 12`;
    // 清得了清不了由组件说了算，外面这颗钮跟着它禁用
    clear.disabled = !field.canClear;
  }

  field.addEventListener("value-change", (event) => {
    value = event.detail.value;
    sync();
  });

  // 超出 12 个字的那截由组件截掉，截完的那份才落进值
  document
    .getElementById("text-field-programmatic-write")
    .addEventListener("click", () => field.setValue("曦寒"));
  document
    .getElementById("text-field-programmatic-append")
    .addEventListener("click", () => field.setValue(`${value}·`));
  clear.addEventListener("click", () => field.clear());

  sync();
</script>
```

### 原生属性

写在 input 部件上的属性直接落到真正的输入框，自动填充与移动端键盘类型由它们决定

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot placeholder="you@example.com">
    <XhTextFieldLabel>邮箱</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 220px">
      <XhTextFieldInput
        autocomplete="email"
        inputmode="email"
        spellcheck="false"
      />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="11 位手机号" :max-length="11">
    <XhTextFieldLabel>手机号</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 220px">
      <XhTextFieldInput
        autocomplete="tel"
        inputmode="numeric"
        enterkeyhint="done"
      />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field placeholder="you@example.com">
  <div data-xh-part="root">
    <label data-xh-part="label">邮箱</label>
    <div data-xh-part="control" style="inline-size: 220px">
      <input
        data-xh-part="input"
        autocomplete="email"
        inputmode="email"
        spellcheck="false"
      />
    </div>
  </div>
</xh-text-field>

<xh-text-field placeholder="11 位手机号" max-length="11">
  <div data-xh-part="root">
    <label data-xh-part="label">手机号</label>
    <div data-xh-part="control" style="inline-size: 220px">
      <input
        data-xh-part="input"
        autocomplete="tel"
        inputmode="numeric"
        enterkeyhint="done"
      />
    </div>
  </div>
</xh-text-field>
```

### 事件

值的变化走组件的 value-change，聚焦失焦这类原生事件直接写在 input 部件上

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const log = ref<string[]>([]);

// 新的排在最前，只留最近三条
function push(text: string) {
  log.value = [text, ...log.value].slice(0, 3);
}

function onValueChange(details: { value: string }) {
  push(`value-change：${details.value || "（空）"}`);
}
</script>

<template>
  <XhTextFieldRoot placeholder="随便敲几个字" clearable @value-change="onValueChange">
    <XhTextFieldLabel>留言</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 220px">
      <XhTextFieldInput @focus="push('focus')" @blur="push('blur')" />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <ol v-if="log.length" style="margin: 0; padding-inline-start: 20px">
    <li v-for="(item, i) in log" :key="i">{{ item }}</li>
  </ol>
  <span v-else>还没有事件</span>
</template>
```

```html
<xh-text-field id="text-field-events" placeholder="随便敲几个字" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">留言</label>
    <div data-xh-part="control" style="inline-size: 220px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<ol id="text-field-events-log" style="margin: 0; padding-inline-start: 20px"></ol>
<span id="text-field-events-empty">还没有事件</span>

<script type="module">
  const field = document.getElementById("text-field-events");
  const input = field.querySelector('[data-xh-part="input"]');
  const list = document.getElementById("text-field-events-log");
  const empty = document.getElementById("text-field-events-empty");
  let log = [];

  // 新的排在最前，只留最近三条
  function push(text) {
    log = [text, ...log].slice(0, 3);
    list.replaceChildren(
      ...log.map((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        return li;
      }),
    );
    empty.hidden = true;
  }

  field.addEventListener("value-change", (event) => {
    push("value-change：" + (event.detail.value || "（空）"));
  });
  input.addEventListener("focus", () => push("focus"));
  input.addEventListener("blur", () => push("blur"));
</script>
```

### 框内前后缀

前后缀与输入框同在 control 这一个框里排成一行，共用它的描边与底色

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

// 不参与分宽，也不吃指针事件：点在前后缀上仍然落到输入框里
const affix = "flex: none; color: var(--xh-fg-muted); pointer-events: none";
</script>

<template>
  <XhTextFieldRoot placeholder="0.00">
    <XhTextFieldLabel>金额</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <span :style="affix">¥</span>
      <XhTextFieldInput inputmode="decimal" />
      <span :style="affix">元</span>
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="170">
    <XhTextFieldLabel>身高</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 160px">
      <XhTextFieldInput inputmode="numeric" />
      <span :style="affix">cm</span>
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field placeholder="0.00">
  <div data-xh-part="root">
    <label data-xh-part="label">金额</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <!-- 不参与分宽，也不吃指针事件：点在前后缀上仍然落到输入框里 -->
      <span style="flex: none; color: var(--xh-fg-muted); pointer-events: none">¥</span>
      <input data-xh-part="input" inputmode="decimal" />
      <span style="flex: none; color: var(--xh-fg-muted); pointer-events: none">元</span>
    </div>
  </div>
</xh-text-field>

<xh-text-field placeholder="170">
  <div data-xh-part="root">
    <label data-xh-part="label">身高</label>
    <div data-xh-part="control" style="inline-size: 160px">
      <input data-xh-part="input" inputmode="numeric" />
      <span style="flex: none; color: var(--xh-fg-muted); pointer-events: none">cm</span>
    </div>
  </div>
</xh-text-field>
```

### 密码与明暗切换

写在 input 部件上的 type 盖过默认的 text，明暗由宿主的一个布尔翻转

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const visible = ref(false);
</script>

<template>
  <XhTextFieldRoot placeholder="请输入密码" :max-length="20">
    <XhTextFieldLabel>密码</XhTextFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhTextFieldControl style="inline-size: 200px">
        <XhTextFieldInput
          :type="visible ? 'text' : 'password'"
          autocomplete="current-password"
        />
      </XhTextFieldControl>
      <button type="button" :aria-pressed="visible" @click="visible = !visible">
        {{ visible ? "隐藏" : "显示" }}
      </button>
    </div>
  </XhTextFieldRoot>
</template>
```

```html
<!-- 输入类型写在宿主的 type 上：组件把它打到输入框身上，盖过默认的 text -->
<xh-text-field id="text-field-password" type="password" placeholder="请输入密码" max-length="20">
  <div data-xh-part="root">
    <label data-xh-part="label">密码</label>
    <div style="display: flex; gap: 4px">
      <div data-xh-part="control" style="inline-size: 200px">
        <input data-xh-part="input" autocomplete="current-password" />
      </div>
      <button type="button" id="text-field-password-toggle" aria-pressed="false">显示</button>
    </div>
  </div>
</xh-text-field>

<script type="module">
  // 明暗只是宿主这边的一个布尔，翻它就换输入类型
  const field = document.getElementById("text-field-password");
  const toggle = document.getElementById("text-field-password-toggle");

  let visible = false;

  toggle.addEventListener("click", () => {
    visible = !visible;
    field.type = visible ? "text" : "password";
    toggle.setAttribute("aria-pressed", String(visible));
    toggle.textContent = visible ? "隐藏" : "显示";
  });
</script>
```

### 限制可输入的字符

beforeinput 直接写在 input 部件上，非法字符进不了框，值与框里的内容始终一致

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

// 这次要插入的文本：键入与输入法走 data，粘贴与拖入走 dataTransfer
function incoming(event: Event): string {
  const e = event as InputEvent;
  return e.data ?? e.dataTransfer?.getData("text/plain") ?? "";
}

function onlyDigits(event: Event) {
  const text = incoming(event);
  if (text !== "" && /\D/.test(text)) {
    event.preventDefault();
  }
}

function noSpace(event: Event) {
  if (/\s/.test(incoming(event))) {
    event.preventDefault();
  }
}
</script>

<template>
  <XhTextFieldRoot placeholder="只收数字" :max-length="11">
    <XhTextFieldLabel>手机号</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput inputmode="numeric" @beforeinput="onlyDigits" />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="空格进不来">
    <XhTextFieldLabel>账号</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput @beforeinput="noSpace" />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field id="text-field-filter-digits" placeholder="只收数字" max-length="11">
  <div data-xh-part="root">
    <label data-xh-part="label">手机号</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" inputmode="numeric" />
    </div>
  </div>
</xh-text-field>

<xh-text-field id="text-field-filter-space" placeholder="空格进不来">
  <div data-xh-part="root">
    <label data-xh-part="label">账号</label>
    <div data-xh-part="control" style="inline-size: 200px">
      <input data-xh-part="input" />
    </div>
  </div>
</xh-text-field>

<script type="module">
  // 这次要插入的文本：键入与输入法走 data，粘贴与拖入走 dataTransfer
  function incoming(event) {
    return event.data ?? event.dataTransfer?.getData("text/plain") ?? "";
  }

  const digits = document
    .getElementById("text-field-filter-digits")
    .querySelector('[data-xh-part="input"]');
  digits.addEventListener("beforeinput", (event) => {
    const text = incoming(event);
    if (text !== "" && /\D/.test(text)) {
      event.preventDefault();
    }
  });

  const account = document
    .getElementById("text-field-filter-space")
    .querySelector('[data-xh-part="input"]');
  account.addEventListener("beforeinput", (event) => {
    if (/\s/.test(incoming(event))) {
      event.preventDefault();
    }
  });
</script>
```

### 聚焦与选区

input 部件就是一个原生 input，拿到它的节点就能聚焦、全选、把光标挪到末尾

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const input = ref<HTMLInputElement | null>(null);

// 组件只渲染一个 input，实例上的 $el 就是它
function bindInput(instance: unknown): void {
  input.value = (instance as { $el: HTMLInputElement } | null)?.$el ?? null;
}

function selectAll(): void {
  input.value?.focus();
  input.value?.select();
}

function caretToEnd(): void {
  const el = input.value;
  if (!el)
    return;
  el.focus();
  el.setSelectionRange(el.value.length, el.value.length);
}
</script>

<template>
  <XhTextFieldRoot default-value="曦寒组件库">
    <XhTextFieldLabel>标题</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 220px">
      <XhTextFieldInput :ref="bindInput" />
    </XhTextFieldControl>
    <div style="display: flex; gap: 8px">
      <button type="button" @click="input?.focus()">聚焦</button>
      <button type="button" @click="selectAll">全选</button>
      <button type="button" @click="caretToEnd">光标移到末尾</button>
      <button type="button" @click="input?.blur()">失焦</button>
    </div>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field id="text-field-focus" default-value="曦寒组件库">
  <div data-xh-part="root">
    <label data-xh-part="label">标题</label>
    <div data-xh-part="control" style="inline-size: 220px">
      <input data-xh-part="input" />
    </div>
    <div style="display: flex; gap: 8px">
      <button type="button" id="text-field-focus-focus">聚焦</button>
      <button type="button" id="text-field-focus-select">全选</button>
      <button type="button" id="text-field-focus-caret">光标移到末尾</button>
      <button type="button" id="text-field-focus-blur">失焦</button>
    </div>
  </div>
</xh-text-field>

<script type="module">
  const field = document.getElementById("text-field-focus");
  const input = field.querySelector('[data-xh-part="input"]');

  document.getElementById("text-field-focus-focus").addEventListener("click", () => {
    input.focus();
  });
  document.getElementById("text-field-focus-select").addEventListener("click", () => {
    input.focus();
    input.select();
  });
  document.getElementById("text-field-focus-caret").addEventListener("click", () => {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
  document.getElementById("text-field-focus-blur").addEventListener("click", () => {
    input.blur();
  });
</script>
```

### 输入组

圆角槽换成只留外侧的一组值，中缝用负外边距叠掉一条描边，相邻控件拼成一体

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

const radius = "var(--xh-shape-control)";

// 控件盒只留左侧圆角，右边一格外扣 1px 与按钮共用一条描边
const searchControl = `inline-size: 220px; margin-inline-end: -1px; --xh-text-field-control-radius: ${radius} 0 0 ${radius}`;
const searchButton = `--xh-button-radius: 0 ${radius} ${radius} 0`;

// 前后两块固定文本与控件盒同高同描边，圆角各留一侧
const addonBase
  = "display: inline-flex; align-items: center; block-size: var(--xh-control-h-md); padding-inline: 12px; border: 1px solid var(--xh-border-default); background: var(--xh-bg-subtle); color: var(--xh-fg-muted); font-size: var(--xh-text-body-size)";
const addonStart = `${addonBase}; border-radius: ${radius} 0 0 ${radius}`;
const addonEnd = `${addonBase}; border-radius: 0 ${radius} ${radius} 0`;
const middleControl = "inline-size: 160px; margin-inline: -1px; --xh-text-field-control-radius: 0";
</script>

<template>
  <XhTextFieldRoot placeholder="搜索文档" clearable>
    <XhTextFieldLabel>站内搜索</XhTextFieldLabel>
    <div style="display: flex">
      <XhTextFieldControl :style="searchControl">
        <XhTextFieldInput />
      </XhTextFieldControl>
      <XhButton :style="searchButton">搜索</XhButton>
    </div>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="xihanfun">
    <XhTextFieldLabel>域名</XhTextFieldLabel>
    <div style="display: flex">
      <span :style="addonStart">https://</span>
      <XhTextFieldControl :style="middleControl">
        <XhTextFieldInput />
      </XhTextFieldControl>
      <span :style="addonEnd">.com</span>
    </div>
  </XhTextFieldRoot>
</template>
```

```html
<xh-text-field placeholder="搜索文档" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">站内搜索</label>
    <div style="display: flex">
      <!-- 控件盒只留左侧圆角，右边一格外扣 1px 与按钮共用一条描边 -->
      <div
        data-xh-part="control"
        style="
          inline-size: 220px;
          margin-inline-end: -1px;
          --xh-text-field-control-radius: var(--xh-shape-control) 0 0 var(--xh-shape-control);
        "
      >
        <input data-xh-part="input" />
      </div>
      <xh-button style="--xh-button-radius: 0 var(--xh-shape-control) var(--xh-shape-control) 0">
        <button data-xh-part="root">搜索</button>
      </xh-button>
    </div>
  </div>
</xh-text-field>

<xh-text-field placeholder="xihanfun">
  <div data-xh-part="root">
    <label data-xh-part="label">域名</label>
    <div style="display: flex">
      <!-- 前后两块固定文本与控件盒同高同描边，圆角各留一侧 -->
      <span
        style="
          display: inline-flex;
          align-items: center;
          block-size: var(--xh-control-h-md);
          padding-inline: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: var(--xh-shape-control) 0 0 var(--xh-shape-control);
          background: var(--xh-bg-subtle);
          color: var(--xh-fg-muted);
          font-size: var(--xh-text-body-size);
        "
        >https://</span
      >
      <div
        data-xh-part="control"
        style="inline-size: 160px; margin-inline: -1px; --xh-text-field-control-radius: 0"
      >
        <input data-xh-part="input" />
      </div>
      <span
        style="
          display: inline-flex;
          align-items: center;
          block-size: var(--xh-control-h-md);
          padding-inline: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 0 var(--xh-shape-control) var(--xh-shape-control) 0;
          background: var(--xh-bg-subtle);
          color: var(--xh-fg-muted);
          font-size: var(--xh-text-body-size);
        "
        >.com</span
      >
    </div>
  </div>
</xh-text-field>
```

### 多行与自动长高

input 部件写成 textarea 即多行宿主；autoSize 让高度跟内容走，对象形态钉行数上下限（顶到 maxRows 后内部滚动）

```vue
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const note = ref("");
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 320px">
    <XhTextFieldRoot v-slot="{ value, atLimit }" v-model:value="note" :auto-size="{ minRows: 2, maxRows: 6 }" :max-length="120" placeholder="说点什么">
      <XhTextFieldLabel>备注（2-6 行自动长高）</XhTextFieldLabel>
      <XhTextFieldControl>
        <XhTextFieldInput as="textarea" />
      </XhTextFieldControl>
      <p style="margin: 4px 0 0; font-size: 12px" :style="{ color: atLimit ? 'var(--xh-fg-danger)' : 'var(--xh-fg-subtle)' }">
        {{ value.length }} / 120
      </p>
    </XhTextFieldRoot>

    <XhTextFieldRoot auto-size placeholder="不设行数界限，完全跟内容走">
      <XhTextFieldLabel>随写随长</XhTextFieldLabel>
      <XhTextFieldControl>
        <XhTextFieldInput as="textarea" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; inline-size: 320px">
  <xh-text-field id="text-field-multiline" max-length="120" placeholder="说点什么">
    <div data-xh-part="root">
      <label data-xh-part="label">备注（2-6 行自动长高）</label>
      <div data-xh-part="control">
        <textarea data-xh-part="input"></textarea>
      </div>
      <p
        id="text-field-multiline-count"
        style="margin: 4px 0 0; font-size: 12px; color: var(--xh-fg-subtle)"
      >
        0 / 120
      </p>
    </div>
  </xh-text-field>

  <xh-text-field auto-size placeholder="不设行数界限，完全跟内容走">
    <div data-xh-part="root">
      <label data-xh-part="label">随写随长</label>
      <div data-xh-part="control">
        <textarea data-xh-part="input"></textarea>
      </div>
    </div>
  </xh-text-field>
</div>

<script type="module">
  // 行数上下限是对象，只能经 property 交给元素
  const field = document.getElementById("text-field-multiline");
  field.autoSize = { minRows: 2, maxRows: 6 };

  // 字数跟着值走，顶到上限换成危险色
  const count = document.getElementById("text-field-multiline-count");
  field.addEventListener("value-change", (event) => {
    const length = event.detail.value.length;
    count.textContent = `${length} / 120`;
    count.style.color = length >= 120 ? "var(--xh-fg-danger)" : "var(--xh-fg-subtle)";
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-text-field>` |
| Vue 组件 | `XhTextFieldClearTrigger` `XhTextFieldControl` `XhTextFieldCount` `XhTextFieldInput` `XhTextFieldLabel` `XhTextFieldPrefix` `XhTextFieldRoot` `XhTextFieldSuffix` |
| 组合式函数 | `useTextField` |
| 状态机 | `textFieldMachine` |
| 皮肤 | `@xihan-ui/styles/text-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="text-field"`：**`root`** · `label` · `control` · `prefix` · **`input`** · `suffix` · `clear-trigger` · `count`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值；给了就由宿主说了算，机器不自改。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `type` | `TextFieldType` |  | 单行宿主的输入类型，缺省 text；as 为 textarea 时不发这条属性。 |
| `placeholder` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了才参与提交。 |
| `maxLength` | `number` |  | 字符数上限。同时落成原生 maxlength 与机器侧的截断，两道都要。 |
| `clearable` | `boolean` |  | 开启清空能力：有值时显出清空按钮、Escape 接管。关掉时按钮带 hidden 收起。 |
| `showCount` | `boolean` |  | 显出字数部件：关掉时 count 部件带 hidden 收起。 |
| `autoSize` | `boolean \| TextFieldAutoSize` |  | 多行宿主的自动高度：跟内容长高；对象形态钉行数上下限，顶到 maxRows 后内部滚动。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框的底与描边怎么画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框与清空按钮的几何档位。 |
| `translations` | `Partial<TextFieldTranslations>` |  | 读屏文案；缺省英文。 |
| `onValueChange` | `(details: TextFieldValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TextFieldValueChangeDetails` | 值变化；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTextFieldCount` | `default` | `TextFieldCountSlotProps` |  |
| `XhTextFieldRoot` | `default` | `TextFieldRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET`

**判据**：`canEdit` · `canClear`

## connect API

`useTextField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `empty` | `boolean` | 值为空串。作者据此显示占位说明一类的东西。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `clearable` | `boolean` |  |
| `atLimit` | `boolean` | 已顶到 maxLength：再敲也进不去，作者据此把字数提示标红。 |
| `count` | `number` | 当前字数，即 value 的长度。作者拿它渲染 count 部件里的数字。 |
| `maxLength` | `number \| undefined` | 字数上限的原样透传；没设上限时是 undefined，此时只渲当前字数。 |
| `showCount` | `boolean` | 字数部件此刻是否显出（开了 showCount）。 |
| `canClear` | `boolean` | 清空按钮此刻是否可用（开了 clearable、可编辑、且有值）。 |
| `setValue` | `(next: string) => void` | 直接写值，只受 disabled/readOnly 与 maxLength 约束，与 clearable 无关。 |
| `clear` | `() => void` | 走清空意图，受 canClear 约束；无条件清空请用 setValue('')。 |
| `autoSize` | `boolean \| TextFieldAutoSize` | 自动高度配置的原样透传；适配器在程序化写值后据此补量一次。 |
| `getRootProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 视觉盒；写了它就由它画描边与聚焦环，不写时输入框自己当盒。 |
| `getLabelProps` | `() => T['label']` |  |
| `getInputProps` | `(props?: TextFieldInputProps) => T['input']` | 传 as: 'textarea' 即多行宿主：撤掉 type、接上自动高度。 |
| `getPrefixProps` | `() => T['element']` | 输入框前的装饰段（货币符、单位、图标）；对读屏隐藏，不参与名字链。 |
| `getSuffixProps` | `() => T['element']` | 输入框后的装饰段；对读屏隐藏，不参与名字链。 |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getCountProps` | `() => T['element']` | 字数部件：承载 count / maxLength 两个数字，没开 showCount 时带 hidden 收起。 |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Escape` | focus in input, clearable 且值非空, not disabled/readOnly | 清空值；三个条件缺一即不接管该键，交回给外层与浏览器 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `prefix` | `aria-hidden` | 'true' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `suffix` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `count` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/text-field.css` 按部件选择：`[data-scope="text-field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-max` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-at-max` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `prefix` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-at-max` | ''（条件成立时才出现） |
| `input` | `data-auto-resize` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-empty` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-multiline` | ''（条件成立时才出现） |
| `suffix` | `data-disabled` | ''（条件成立时才出现） |
| `count` | `data-at-max` | ''（条件成立时才出现） |
| `count` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-text-field-action-bg` · `--xh-text-field-action-bg-active` · `--xh-text-field-action-bg-hover` · `--xh-text-field-action-fg` · `--xh-text-field-action-fg-hover` · `--xh-text-field-action-font-size` · `--xh-text-field-action-radius` · `--xh-text-field-action-size` · `--xh-text-field-affix-fg` · `--xh-text-field-affix-fg-disabled` · `--xh-text-field-affix-font-size` · `--xh-text-field-control-bg` · `--xh-text-field-control-bg-disabled` · `--xh-text-field-control-bg-hover` · `--xh-text-field-control-bg-readonly` · `--xh-text-field-control-border` · `--xh-text-field-control-border-at-max` · `--xh-text-field-control-border-focus` · `--xh-text-field-control-border-hover` · `--xh-text-field-control-border-invalid` · `--xh-text-field-control-fg` · `--xh-text-field-control-gap` · `--xh-text-field-control-h` · `--xh-text-field-control-min-w` · `--xh-text-field-control-px` · `--xh-text-field-control-radius` · `--xh-text-field-control-shadow` · `--xh-text-field-count-fg` · `--xh-text-field-count-fg-at-max` · `--xh-text-field-count-fg-disabled` · `--xh-text-field-count-font-size` · `--xh-text-field-gap` · `--xh-text-field-icon-size` · `--xh-text-field-input-autofill-bg` · `--xh-text-field-input-autofill-fg` · `--xh-text-field-input-fg` · `--xh-text-field-input-font-size` · `--xh-text-field-label-fg` · `--xh-text-field-label-fg-disabled` · `--xh-text-field-label-font-size` · `--xh-text-field-label-font-weight` · `--xh-text-field-placeholder-fg` · `--xh-text-field-textarea-py`

## 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)拿标签与错误文本；与[按钮](./button)拼成输入组。

## 最佳实践

- `type` 要写对：移动端的软键盘按它切换，写错会让用户多按很多次。
- 密码框的明暗切换按钮要有可及名字，并在切换后更新它。

## 反模式

- 用它收集固定格式的分段值（日期、验证码）：用[日期输入](./date-field)、[分格输入](./pin-input)。
- 输入时就报格式错误。
