来源：https://ui.docs.xihanfun.com/components/toggle-group

# ToggleGroup `切换按钮组`

一排连在一起的切换按钮，整组共一个值：单选时是分段控件，多选时是一排可同时按下的工具钮。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toggle-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toggle-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toggle-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toggle-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toggle-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

单选分段控件：root 是 radiogroup、条目是 radio；整组只占一个 Tab 位，进组后四个方向键都能走

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中" },
  { value: "right", label: "右对齐" },
];
</script>

<template>
  <!-- 不传 value 即非受控，default-value 只给初值 -->
  <XhToggleGroupRoot :collection="aligns" default-value="left" />
</template>
```

```html
<!-- 不传 value 即非受控，default-value 只给初值 -->
<xh-toggle-group default-value="left">
  <div data-xh-part="root">
    <button data-xh-part="item" value="left">左对齐</button>
    <button data-xh-part="item" value="center">居中</button>
    <button data-xh-part="item" value="right">右对齐</button>
  </div>
</xh-toggle-group>
```

## 示例

### 受控与不可清空

传了 value 就由宿主说了算；单选组再点一次当前项会清空成 null，disallow-empty 把这一手关掉

```vue
<script setup lang="ts">
import { XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const align = ref<string | null>("left");
const density = ref<string | null>("comfortable");
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot v-model:value="align">
      <XhToggleGroupItem value="left">左对齐</XhToggleGroupItem>
      <XhToggleGroupItem value="center">居中</XhToggleGroupItem>
      <XhToggleGroupItem value="right">右对齐</XhToggleGroupItem>
    </XhToggleGroupRoot>
    <span style="font-size: 13px;">当前：{{ align ?? "（无选中）" }}</span>
  </span>

  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot v-model:value="density" disallow-empty>
      <XhToggleGroupItem value="compact">紧凑</XhToggleGroupItem>
      <XhToggleGroupItem value="comfortable">宽松</XhToggleGroupItem>
    </XhToggleGroupRoot>
    <span style="font-size: 13px;">disallow-empty：{{ density }}，点不成空</span>
  </span>
</template>
```

```html
<span style="display: inline-flex; align-items: center; gap: 10px">
  <xh-toggle-group id="toggle-group-align" value="left">
    <div data-xh-part="root">
      <button data-xh-part="item" value="left">左对齐</button>
      <button data-xh-part="item" value="center">居中</button>
      <button data-xh-part="item" value="right">右对齐</button>
    </div>
  </xh-toggle-group>
  <span style="font-size: 13px">
    当前：<span id="toggle-group-align-value">left</span>
  </span>
</span>

<span style="display: inline-flex; align-items: center; gap: 10px">
  <xh-toggle-group id="toggle-group-density" value="comfortable" disallow-empty>
    <div data-xh-part="root">
      <button data-xh-part="item" value="compact">紧凑</button>
      <button data-xh-part="item" value="comfortable">宽松</button>
    </div>
  </xh-toggle-group>
  <span style="font-size: 13px">
    disallow-empty：<span id="toggle-group-density-value">comfortable</span>，点不成空
  </span>
</span>

<script type="module">
  // 值由宿主握着：变更经事件回来，写回去才生效
  function control(hostId, readoutId, blank) {
    const host = document.getElementById(hostId);
    const readout = document.getElementById(readoutId);
    host.addEventListener("value-change", (event) => {
      host.value = event.detail.value;
      readout.textContent = event.detail.value ?? blank;
    });
  }

  control("toggle-group-align", "toggle-group-align-value", "（无选中）");
  control("toggle-group-density", "toggle-group-density-value", "（无选中）");
</script>
```

### 多选

multiple 换的是整套 ARIA：root 退回 group、条目退回原生按钮 + aria-pressed，值也从字符串变成数组

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const marks = ref<string[]>(["bold"]);

const markOptions = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
];

const overlays = [
  { value: "grid", label: "网格" },
  { value: "ruler", label: "标尺" },
  { value: "guide", label: "参考线" },
];
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot v-model:value="marks" :collection="markOptions" multiple />
    <span style="font-size: 13px;">当前：{{ marks.join("、") || "（无选中）" }}</span>
  </span>

  <!-- 竖排只改视觉排布，方向键接受的轴与它无关，四个方向键恒响应 -->
  <XhToggleGroupRoot
    :collection="overlays"
    :default-value="['grid']"
    multiple
    orientation="vertical"
  />
</template>
```

```html
<span style="display: inline-flex; align-items: center; gap: 10px">
  <xh-toggle-group id="toggle-group-marks" multiple>
    <div data-xh-part="root">
      <button data-xh-part="item" value="bold">B</button>
      <button data-xh-part="item" value="italic">I</button>
      <button data-xh-part="item" value="underline">U</button>
    </div>
  </xh-toggle-group>
  <span style="font-size: 13px">
    当前：<span id="toggle-group-marks-value">bold</span>
  </span>
</span>

<!-- 竖排只改视觉排布，方向键接受的轴与它无关，四个方向键恒响应 -->
<xh-toggle-group default-value="grid" multiple orientation="vertical">
  <div data-xh-part="root">
    <button data-xh-part="item" value="grid">网格</button>
    <button data-xh-part="item" value="ruler">标尺</button>
    <button data-xh-part="item" value="guide">参考线</button>
  </div>
</xh-toggle-group>

<script type="module">
  // 多选的受控值是数组，属性装不下，只能走 property
  const marks = document.getElementById("toggle-group-marks");
  const readout = document.getElementById("toggle-group-marks-value");

  marks.value = ["bold"];
  marks.addEventListener("value-change", (event) => {
    marks.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无选中）";
  });
</script>
```

### 禁用

条目一律 aria-disabled 而非原生 disabled：点不动，但焦点落得上去，仍能当方向键的起点

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

// 禁用写在数据里，条目部件不必逐个再声明一遍
const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中", disabled: true },
  { value: "right", label: "右对齐" },
];

const plain = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中" },
  { value: "right", label: "右对齐" },
];
</script>

<template>
  <!-- 只禁其中一项：走方向键时它不被跳过，按 Enter / Space 也不切值 -->
  <XhToggleGroupRoot :collection="aligns" default-value="left" />

  <!-- 整组禁用：选中那一段仍看得出是当前值，只是改不动 -->
  <XhToggleGroupRoot :collection="plain" default-value="center" disabled />
</template>
```

```html
<!-- 只禁其中一项：走方向键时它不被跳过，按 Enter / Space 也不切值 -->
<xh-toggle-group default-value="left">
  <div data-xh-part="root">
    <button data-xh-part="item" value="left">左对齐</button>
    <button data-xh-part="item" value="center" aria-disabled="true">居中</button>
    <button data-xh-part="item" value="right">右对齐</button>
  </div>
</xh-toggle-group>

<!-- 整组禁用：选中那一段仍看得出是当前值，只是改不动 -->
<xh-toggle-group default-value="center" disabled>
  <div data-xh-part="root">
    <button data-xh-part="item" value="left">左对齐</button>
    <button data-xh-part="item" value="center">居中</button>
    <button data-xh-part="item" value="right">右对齐</button>
  </div>
</xh-toggle-group>
```

### 条目增删

条目集合在运行期可增可删，增删后照常接线；删掉的正好是选中项时由宿主把值收拾干净

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

interface ViewOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const options = ref<ViewOption[]>([
  { value: "list", label: "列表" },
  { value: "board", label: "看板" },
  { value: "chart", label: "图表", disabled: true },
]);
const view = ref<string | null>("list");
let seq = 0;

function addOption() {
  seq += 1;
  options.value.push({ value: `custom-${seq}`, label: `视图 ${seq}` });
}

function removeLast() {
  const removed = options.value.pop();
  // 删掉的正是当前值，选中态就没了落点，受控值得跟着清掉
  if (removed && removed.value === view.value)
    view.value = null;
}
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot v-model:value="view" :collection="options" />
    <span style="font-size: 13px;">当前：{{ view ?? "（无选中）" }}</span>
  </span>

  <span style="display: inline-flex; gap: 8px;">
    <button type="button" @click="addOption">加一段</button>
    <button type="button" @click="removeLast">删末段</button>
  </span>
</template>
```

```html
<span style="display: inline-flex; align-items: center; gap: 10px">
  <xh-toggle-group id="toggle-group-dynamic" value="list">
    <div data-xh-part="root">
      <button data-xh-part="item" value="list">列表</button>
      <button data-xh-part="item" value="board">看板</button>
      <button data-xh-part="item" value="chart" aria-disabled="true">图表</button>
    </div>
  </xh-toggle-group>
  <span style="font-size: 13px">
    当前：<span id="toggle-group-dynamic-value">list</span>
  </span>
</span>

<span style="display: inline-flex; gap: 8px">
  <button type="button" id="toggle-group-dynamic-add">加一段</button>
  <button type="button" id="toggle-group-dynamic-remove">删末段</button>
</span>

<script type="module">
  // 加一段就往 root 里追一个条目，删末段就摘掉最后那个
  const host = document.getElementById("toggle-group-dynamic");
  const root = host.querySelector('[data-xh-part="root"]');
  const readout = document.getElementById("toggle-group-dynamic-value");
  let view = "list";
  let seq = 0;

  host.addEventListener("value-change", (event) => {
    view = event.detail.value;
    host.value = view;
    readout.textContent = view ?? "（无选中）";
  });

  document
    .getElementById("toggle-group-dynamic-add")
    .addEventListener("click", () => {
      seq += 1;
      const item = document.createElement("button");
      item.dataset.xhPart = "item";
      item.setAttribute("value", `custom-${seq}`);
      item.textContent = `视图 ${seq}`;
      root.append(item);
    });

  document
    .getElementById("toggle-group-dynamic-remove")
    .addEventListener("click", () => {
      const last = root.lastElementChild;
      if (!last) {
        return;
      }
      const removed = last.getAttribute("value");
      last.remove();
      // 删掉的正是当前值，选中态就没了落点，受控值得跟着清掉
      if (removed === view) {
        view = null;
        host.value = null;
        readout.textContent = "（无选中）";
      }
    });
</script>
```

### 拦下一次切换

受控时 value-change 是唯一出口：宿主不写回，值就原样不动，条件不满足的那一段永远切不过去

```vue
<script setup lang="ts">
import { XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const stage = ref<string | null>("draft");
const saved = ref(false);
const blocked = ref("");

// 单选模式下裸值就是字符串或 null
function onValueChange(details: { value: string | null }) {
  if (details.value === "publish" && !saved.value) {
    blocked.value = "还有未保存的改动，先保存再发布";
    return;
  }
  blocked.value = "";
  stage.value = details.value;
}
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot :value="stage" disallow-empty @value-change="onValueChange">
      <XhToggleGroupItem value="draft">草稿</XhToggleGroupItem>
      <XhToggleGroupItem value="review">送审</XhToggleGroupItem>
      <XhToggleGroupItem value="publish">发布</XhToggleGroupItem>
    </XhToggleGroupRoot>
    <span style="font-size: 13px;">当前：{{ stage }}</span>
  </span>

  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <button type="button" :disabled="saved" @click="saved = true">
      {{ saved ? "已保存" : "保存改动" }}
    </button>
    <span v-if="blocked" style="font-size: 13px;">{{ blocked }}</span>
  </span>
</template>
```

```html
<span style="display: inline-flex; align-items: center; gap: 10px">
  <xh-toggle-group id="toggle-group-guard" value="draft" disallow-empty>
    <div data-xh-part="root">
      <button data-xh-part="item" value="draft">草稿</button>
      <button data-xh-part="item" value="review">送审</button>
      <button data-xh-part="item" value="publish">发布</button>
    </div>
  </xh-toggle-group>
  <span style="font-size: 13px">
    当前：<span id="toggle-group-guard-value">draft</span>
  </span>
</span>

<span style="display: inline-flex; align-items: center; gap: 10px">
  <button type="button" id="toggle-group-guard-save">保存改动</button>
  <span id="toggle-group-guard-blocked" style="font-size: 13px"></span>
</span>

<script type="module">
  // 单选模式下裸值就是字符串或 null
  const host = document.getElementById("toggle-group-guard");
  const readout = document.getElementById("toggle-group-guard-value");
  const blocked = document.getElementById("toggle-group-guard-blocked");
  const save = document.getElementById("toggle-group-guard-save");
  let saved = false;

  host.addEventListener("value-change", (event) => {
    if (event.detail.value === "publish" && !saved) {
      blocked.textContent = "还有未保存的改动，先保存再发布";
      return;
    }
    blocked.textContent = "";
    host.value = event.detail.value;
    readout.textContent = event.detail.value;
  });

  save.addEventListener("click", () => {
    saved = true;
    save.disabled = true;
    save.textContent = "已保存";
  });
</script>
```

### 整组换一档尺寸

高度、内边距与字号各是一个组件令牌，写在 root 上由整组条目继承，不必逐个条目改

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

// 三个槽位一起换档，取的是控件尺寸家族里的同一档，跟同页别的控件对得上
const sm = [
  "--xh-toggle-group-item-h: var(--xh-control-h-sm)",
  "--xh-toggle-group-item-px: var(--xh-control-px-sm)",
  "--xh-toggle-group-item-font-size: var(--xh-font-size-sm)",
].join("; ");

const lg = [
  "--xh-toggle-group-item-h: var(--xh-control-h-lg)",
  "--xh-toggle-group-item-px: var(--xh-control-px-lg)",
  "--xh-toggle-group-item-font-size: var(--xh-font-size-lg)",
].join("; ");

const spans = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
</script>

<template>
  <XhToggleGroupRoot :collection="spans" default-value="day" :style="sm" />

  <!-- 不写就是缺省档 -->
  <XhToggleGroupRoot :collection="spans" default-value="week" />

  <XhToggleGroupRoot :collection="spans" default-value="month" :style="lg" />
</template>
```

```html
<!-- 三个槽位一起换档，取的是控件尺寸家族里的同一档，跟同页别的控件对得上 -->
<xh-toggle-group default-value="day">
  <div
    data-xh-part="root"
    style="
      --xh-toggle-group-item-h: var(--xh-control-h-sm);
      --xh-toggle-group-item-px: var(--xh-control-px-sm);
      --xh-toggle-group-item-font-size: var(--xh-font-size-sm);
    "
  >
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>

<!-- 不写就是缺省档 -->
<xh-toggle-group default-value="week">
  <div data-xh-part="root">
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>

<xh-toggle-group default-value="month">
  <div
    data-xh-part="root"
    style="
      --xh-toggle-group-item-h: var(--xh-control-h-lg);
      --xh-toggle-group-item-px: var(--xh-control-px-lg);
      --xh-toggle-group-item-font-size: var(--xh-font-size-lg);
    "
  >
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>
```

### 形态、语气与尺寸

三轴打在 root 上沿继承流下发给每一段，条目自己不写任何一档

```vue
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const spans = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
    <XhToggleGroupRoot :collection="spans" default-value="day" variant="solid" />
    <XhToggleGroupRoot :collection="spans" default-value="day" variant="outline" />
    <XhToggleGroupRoot :collection="spans" default-value="day" variant="ghost" />

    <XhToggleGroupRoot :collection="spans" default-value="week" tone="neutral" />
    <XhToggleGroupRoot :collection="spans" default-value="week" tone="success" />

    <XhToggleGroupRoot :collection="spans" default-value="month" size="sm" />
    <XhToggleGroupRoot :collection="spans" default-value="month" size="lg" />
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
  <xh-toggle-group default-value="day" variant="solid">
    <div data-xh-part="root">
      <button data-xh-part="item" value="day">日</button>
      <button data-xh-part="item" value="week">周</button>
      <button data-xh-part="item" value="month">月</button>
    </div>
  </xh-toggle-group>
  <xh-toggle-group default-value="day" variant="outline">
    <div data-xh-part="root">
      <button data-xh-part="item" value="day">日</button>
      <button data-xh-part="item" value="week">周</button>
      <button data-xh-part="item" value="month">月</button>
    </div>
  </xh-toggle-group>
  <xh-toggle-group default-value="day" variant="ghost">
    <div data-xh-part="root">
      <button data-xh-part="item" value="day">日</button>
      <button data-xh-part="item" value="week">周</button>
      <button data-xh-part="item" value="month">月</button>
    </div>
  </xh-toggle-group>

  <xh-toggle-group default-value="week" tone="neutral">
    <div data-xh-part="root">
      <button data-xh-part="item" value="day">日</button>
      <button data-xh-part="item" value="week">周</button>
      <button data-xh-part="item" value="month">月</button>
    </div>
  </xh-toggle-group>
  <xh-toggle-group default-value="week" tone="success">
    <div data-xh-part="root">
      <button data-xh-part="item" value="day">日</button>
      <button data-xh-part="item" value="week">周</button>
      <button data-xh-part="item" value="month">月</button>
    </div>
  </xh-toggle-group>

  <xh-toggle-group default-value="month" size="sm">
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
</div>
```

## 设计指引

### 何时使用

- 在少数几个互斥项之间切换视图（日 / 周 / 月，列表 / 网格）。
- 一排可同时开关的格式工具（加粗 / 斜体 / 下划线），此时开 `multiple`。

### 何时不用

- 选项超过五六个，或需要搜索：用[选择器](./select)。
- 选项要随表单提交并需要 label 关联：用[单选组](./radio-group)。
- 各段是动作不是选项：用[按钮组](./button-group)。

### 特性

- `multiple` 换的是整套 ARIA：单选时 `root` 是 `radiogroup`、条目是 `radio`；多选时 `root` 退回 `group`、条目退回按钮加 `aria-pressed`，值也从字符串变成数组。
- roving tabindex：整组只占一个 Tab 位，进组后四个方向键都能走，与视觉排布无关。
- `disallowEmpty` 决定能不能点成空值。
- 条目一律 `aria-disabled` 而非原生 `disabled`：点不动但焦点落得上去，仍能当方向键的起点。
- 给了 `collection` 就由它做显示文本与禁用的事实源，条目部件只需报 `value`。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle-group>` |
| Vue 组件 | `XhToggleGroupHiddenInput` `XhToggleGroupItem` `XhToggleGroupRoot` `XhToggleGroupSeparator` |
| 组合式函数 | `useToggleGroup` |
| 状态机 | `toggleGroupMachine` |
| 皮肤 | `@xihan-ui/styles/toggle-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toggle-group"`：**`root`** · **`item`** · `separator` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ToggleGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `ToggleGroupValue` |  | 选中值。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `ToggleGroupValue` |  |  |
| `multiple` | `boolean` |  | 允许多项同时选中；false 时选中一项即挤掉其余。 |
| `disabled` | `boolean` |  | 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 |
| `disallowEmpty` | `boolean` |  | 不许把值清空：单选模式下点当前选中项不再取消它，多选模式下摘不掉最后一个。 默认 false（可以点成无选中）。 |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定段的底色与描边怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `fullWidth` | `boolean` |  | 撑满行宽：整组占满可用宽度，每段等分剩余空间。 |
| `name` | `string` |  | 表单字段名。给定后隐藏输入才带 name 并参与提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只改写左右方向键的语义，上下键与之无关。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `rovingFocus` | `boolean` |  | roving tabindex，默认开启：整组只占一个 Tab 位，组内靠方向键走。 关掉后每个条目自成一个 Tab 停靠点，方向键不再接管。 |
| `onValueChange` | `(details: ToggleGroupValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ToggleGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| string[] \| null }`（形态跟着 multiple 走） |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item` | 'on' \| 'off' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET`

## connect API

`useToggleGroup` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 当前选中集合，恒为数组（单选时长度 ≤ 1）。 |
| `collection` | `readonly ToggleGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: ToggleGroupValue) => void` | 传单值 / 数组 / null 皆可，内部按 multiple 归一。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ToggleGroupItemProps) => T['button']` |  |
| `getSeparatorProps` | `() => T['element']` | 段与段之间的装饰竖线，纯视觉、读屏不念。 |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：整组只有一份，提交的就是当前选中值。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | rovingFocus 开启（默认） | 整组只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投 |
| `ArrowRight` / `ArrowDown` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕），不改选中；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到上一个可停留条目，不改选中；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到首个可停留条目 |
| `End` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, 条目未禁用 | 切换该条目；条目是原生 button，这两个键由平台翻成 click |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-orientation` | undefined \| props.orientation |
| `root` | `role` | 'group' \| 'radiogroup' |
| `item` | `aria-checked` | undefined \| 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-pressed` | 'true' \| 'false' \| undefined |
| `item` | `role` | undefined \| 'radio' |
| `separator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/toggle-group.css` 按部件选择：`[data-scope="toggle-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-state` | 'on' \| 'off' |
| `separator` | `data-disabled` | ''（条件成立时才出现） |
| `separator` | `data-orientation` | 'vertical' \| 'horizontal' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toggle-group-item-bg` | `item` | `background` | `default` | `--xh-_toggle-group-item-bg` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-active` | `item` | `background` | `active`<br>`disabled`<br>`not([data-disabled])` | `--xh-_toggle-group-item-bg-active` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-disabled` | `item` | `background` | `disabled` | `--xh-bg-muted` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-hover` | `item` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-_toggle-group-item-bg-hover` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-on` | `item` | `background` | `state=on` | `--xh-_toggle-group-item-bg-on` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-on-active` | `item` | `background` | `active`<br>`disabled`<br>`not([data-disabled])`<br>`state=on` | `--xh-_toggle-group-item-bg-on-active` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-on-disabled` | `item` | `background` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-bg-on` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-on-hover` | `item` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`state=on` | `--xh-_toggle-group-item-bg-on-hover` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-border` | `item` | `border` | `default` | `--xh-_toggle-group-item-border` | toggle-group 的 item 部件 border 覆盖槽。 |
| `--xh-toggle-group-item-border-disabled` | `item` | `border` | `disabled` | `--xh-border-subtle` | toggle-group 的 item 部件 border 覆盖槽。 |
| `--xh-toggle-group-item-border-on` | `item` | `border` | `state=on` | `--xh-_toggle-group-item-border-on` | toggle-group 的 item 部件 border 覆盖槽。 |
| `--xh-toggle-group-item-border-on-disabled` | `item` | `border` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-border-on` | toggle-group 的 item 部件 border 覆盖槽。 |
| `--xh-toggle-group-item-fg` | `item` | `color` | `default` | `--xh-_toggle-group-item-fg` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-fg-on` | `item` | `color` | `state=on` | `--xh-_toggle-group-item-fg-on` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-fg-on-disabled` | `item` | `color` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-fg-on` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_toggle-group-font-size` | toggle-group 的 item 部件 font-size 覆盖槽。 |
| `--xh-toggle-group-item-font-weight` | `item` | `font-weight` | `default` | `--xh-text-label-weight` | toggle-group 的 item 部件 font-weight 覆盖槽。 |
| `--xh-toggle-group-item-gap` | `item` | `gap` | `default` | `--xh-_toggle-group-gap` | toggle-group 的 item 部件 gap 覆盖槽。 |
| `--xh-toggle-group-item-h` | `item` | `block-size` | `default` | `--xh-_toggle-group-h` | toggle-group 的 item 部件 block-size 覆盖槽。 |
| `--xh-toggle-group-item-px` | `item` | `padding-inline` | `default` | `--xh-_toggle-group-px` | toggle-group 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-toggle-group-item-radius` | `item`<br>`root` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `first-child`<br>`first-of-type`<br>`last-child`<br>`last-of-type`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-shape-control` | toggle-group 的 item、root 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-toggle-group-item-shadow` | `item` | `box-shadow` | `state=on` | `--xh-_toggle-group-highlight` | toggle-group 的 item 部件 box-shadow 覆盖槽。 |
| `--xh-toggle-group-separator-color` | `separator` | `background` | `default` | `--xh-border-default` | toggle-group 的 separator 部件 background 覆盖槽。 |
| `--xh-toggle-group-separator-color-disabled` | `separator` | `background` | `disabled` | `--xh-border-subtle` | toggle-group 的 separator 部件 background 覆盖槽。 |
| `--xh-toggle-group-separator-gap` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1` | toggle-group 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-toggle-group-separator-inset` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1` | toggle-group 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-toggle-group-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | toggle-group 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-toggle-group-separator-thickness` | `separator` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thin` | toggle-group 的 separator 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[工具栏](./toolbar)嵌套：工具栏管跨组导航，本组管组内。

## 最佳实践

- 段数固定在二到五段，段宽尽量等长，切换时整条不该变宽。
- 单选组默认允许点空；表单里当必填项用时把 `disallowEmpty` 打开。

## 反模式

- 拿它当[标签页](./tabs)用：标签页有面板关联（`aria-controls`）与相应的读屏语义，切换按钮组没有。
- 关掉 `rovingFocus` 却不另给导航方式：每段自成一个 Tab 停靠点，键盘用户要按很多次才能走完。
