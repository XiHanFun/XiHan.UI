来源：https://ui.docs.xihanfun.com/components/field-array

# FieldArray 字段数组

用于管理可添加、删除和排序的重复字段。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/field-array" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/field-array.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/field-array" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/field-array" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/field-array.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

添加和删除重复字段

```vue
<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const links = ref<string[]>(["https://xihan.fun", ""]);

// 行里的控件是作者自己的，值也由作者自己写回
function setAt(index: number, next: string) {
  links.value = links.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    v-model:value="links"
    :create-item="() => ''"
    style="inline-size: 100%; max-inline-size: 420px"
  >
    <!-- key 用 items 给的 row.key：它跟着这一行走，不是下标 -->
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <XhTextFieldRoot
          placeholder="填一个链接"
          :value="row.value"
          @update:value="(next: string) => setAt(row.index, next)"
        >
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加链接</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-basic">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加链接</button>
  </div>
</xh-field-array>

<template id="field-array-basic-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <xh-text-field placeholder="填一个链接">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
    </div>
    <div data-xh-part="item-action">
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-basic");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("field-array-basic-row");

  let links = ["https://xihan.fun", ""];

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    links.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      root.insertBefore(row, addTrigger);
      // 文本框插进页面、升级之后再给值；给了值即受控，报上来的新值由这里写回。
      // 它的 value-change 会冒泡到字段数组上，这里截住，字段数组只听增删
      const field = row.querySelector("xh-text-field");
      field.value = value;
      field.addEventListener("value-change", (event) => {
        event.stopPropagation();
        field.value = event.detail.value;
        links = links.map((item, i) => (i === index ? event.detail.value : item));
        host.value = links;
      });
    });
  }

  host.createItem = () => "";
  host.value = links;
  // 值给了即受控，增删只发通知，改动由宿主自己写回
  host.addEventListener("value-change", (event) => {
    links = event.detail.value;
    host.value = links;
    render();
  });

  render();
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="field-array"`：**`root`** · `table` · `header` · `column-header` · `item` · `item-label` · `item-content` · `item-cell` · `item-action` · `add-trigger` · `item-delete-trigger` · `item-drag-trigger` · `move-up-trigger` · `move-down-trigger`

## 示例

### 数量限制

设置最少和最多行数

```vue
<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const options = ref<string[]>(["红", "绿"]);

function setAt(index: number, next: string) {
  options.value = options.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    v-model:value="options"
    :min="2"
    :max="4"
    :create-item="() => ''"
    style="inline-size: 100%; max-inline-size: 420px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <XhTextFieldRoot
          placeholder="填一个选项"
          :value="row.value"
          @update:value="(next: string) => setAt(row.index, next)"
        >
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加选项</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-bounds" min="2" max="4">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加选项</button>
  </div>
</xh-field-array>

<template id="field-array-bounds-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <xh-text-field placeholder="填一个选项">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
    </div>
    <div data-xh-part="item-action">
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-bounds");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("field-array-bounds-row");
  let options = ["红", "绿"];

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    options.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      root.insertBefore(row, addTrigger);
      // 文本框插进页面、升级之后再给值；给了值即受控，报上来的新值由这里写回。
      // 它的 value-change 会冒泡到字段数组上，这里截住，字段数组只听增删
      const field = row.querySelector("xh-text-field");
      field.value = value;
      field.addEventListener("value-change", (event) => {
        event.stopPropagation();
        field.value = event.detail.value;
        options = options.map((item, i) => (i === index ? event.detail.value : item));
        host.value = options;
      });
    });
  }

  host.createItem = () => "";
  host.value = options;
  host.addEventListener("value-change", (event) => {
    options = event.detail.value;
    host.value = options;
    render();
  });

  render();
</script>
```

### 排序

按住把手拖动，或上移、下移字段

```vue
<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayItemDragTrigger,
  XhFieldArrayMoveDownTrigger,
  XhFieldArrayMoveUpTrigger,
  XhFieldArrayRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const steps = ref<string[]>(["拉取代码", "安装依赖", "跑构建", "发布"]);

function setAt(index: number, next: string) {
  steps.value = steps.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    v-model:value="steps"
    movable
    :create-item="() => ''"
    style="inline-size: 100%; max-inline-size: 420px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <span style="inline-size: 1.5rem">{{ row.index + 1 }}.</span>
        <XhTextFieldRoot
          placeholder="这一步做什么"
          :value="row.value"
          @update:value="(next: string) => setAt(row.index, next)"
        >
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDragTrigger />
        <XhFieldArrayMoveUpTrigger />
        <XhFieldArrayMoveDownTrigger />
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加一步</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-movable" movable>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加一步</button>
  </div>
</xh-field-array>

<template id="field-array-movable-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <span style="inline-size: 1.5rem"></span>
      <xh-text-field placeholder="这一步做什么">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
    </div>
    <div data-xh-part="item-action">
      <button data-xh-part="item-drag-trigger"></button>
      <button data-xh-part="move-up-trigger"></button>
      <button data-xh-part="move-down-trigger"></button>
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-movable");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("field-array-movable-row");

  let steps = ["拉取代码", "安装依赖", "跑构建", "发布"];

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    steps.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector("span").textContent = `${index + 1}.`;
      root.insertBefore(row, addTrigger);
      // 文本框插进页面、升级之后再给值；给了值即受控，报上来的新值由这里写回。
      // 它的 value-change 会冒泡到字段数组上，这里截住，字段数组只听增删
      const field = row.querySelector("xh-text-field");
      field.value = value;
      field.addEventListener("value-change", (event) => {
        event.stopPropagation();
        field.value = event.detail.value;
        steps = steps.map((item, i) => (i === index ? event.detail.value : item));
        host.value = steps;
      });
    });
  }

  host.createItem = () => "";
  host.value = steps;
  host.addEventListener("value-change", (event) => {
    steps = event.detail.value;
    host.value = steps;
    render();
  });

  render();
</script>
```

### 多字段行

每行包含多个输入框

```vue
<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayMoveDownTrigger,
  XhFieldArrayMoveUpTrigger,
  XhFieldArrayRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Header {
  name: string;
  value: string;
}

const headers = ref<Header[]>([
  { name: "Accept", value: "application/json" },
  { name: "X-Trace", value: "" },
]);

function patch(index: number, key: keyof Header, next: string) {
  headers.value = headers.value.map((row, i) =>
    i === index ? { ...row, [key]: next } : row,
  );
}
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    v-model:value="headers"
    movable
    :create-item="() => ({ name: '', value: '' })"
    style="inline-size: 100%; max-inline-size: 480px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <XhTextFieldRoot
          placeholder="字段名"
          :value="row.value.name"
          @update:value="(next: string) => patch(row.index, 'name', next)"
        >
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
        <XhTextFieldRoot
          placeholder="字段值"
          :value="row.value.value"
          @update:value="(next: string) => patch(row.index, 'value', next)"
        >
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayMoveUpTrigger />
        <XhFieldArrayMoveDownTrigger />
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加请求头</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-object" movable>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <button data-xh-part="add-trigger">+ 添加请求头</button>
  </div>
</xh-field-array>

<template id="field-array-object-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <xh-text-field data-key="name" placeholder="字段名">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
      <xh-text-field data-key="value" placeholder="字段值">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
    </div>
    <div data-xh-part="item-action">
      <button data-xh-part="move-up-trigger"></button>
      <button data-xh-part="move-down-trigger"></button>
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-object");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("field-array-object-row");

  let headers = [
    { name: "Accept", value: "application/json" },
    { name: "X-Trace", value: "" },
  ];

  // 改一个字段就整份重建数组，行号不跟着变
  function patch(index, key, next) {
    headers = headers.map((row, i) => (i === index ? { ...row, [key]: next } : row));
    host.value = headers;
  }

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    headers.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      root.insertBefore(row, addTrigger);
      // 文本框插进页面、升级之后再给值；给了值即受控，报上来的新值由这里写回。
      // 它的 value-change 会冒泡到字段数组上，这里截住，字段数组只听增删
      for (const field of row.querySelectorAll("xh-text-field")) {
        field.value = value[field.dataset.key];
        field.addEventListener("value-change", (event) => {
          event.stopPropagation();
          field.value = event.detail.value;
          patch(index, field.dataset.key, event.detail.value);
        });
      }
    });
  }

  host.createItem = () => ({ name: "", value: "" });
  host.value = headers;
  host.addEventListener("value-change", (event) => {
    headers = event.detail.value;
    host.value = headers;
    render();
  });

  render();
</script>
```

### 插入与任意换位

insert(index) 在指定位置插入一行，后面的行往后挪；move(from, to) 一步挪到任意位置，不必逐格上移

```vue
<script setup lang="ts">
import {
  XhButton,
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const steps = ref<string[]>(["拉取代码", "跑构建", "发布"]);

function setAt(index: number, next: string) {
  steps.value = steps.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items, insert, move }"
    v-model:value="steps"
    movable
    :create-item="() => ''"
    style="inline-size: 100%; max-inline-size: 480px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <span style="inline-size: 1.5rem">{{ row.index + 1 }}.</span>
        <XhTextFieldRoot
          placeholder="这一步做什么"
          :value="row.value"
          @update:value="(next: string) => setAt(row.index, next)"
        >
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhButton size="sm" variant="ghost" @click="insert(row.index + 1)">下方插入</XhButton>
        <XhButton size="sm" variant="ghost" :disabled="row.index === 0" @click="move(row.index, 0)">置顶</XhButton>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加一步</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-insert" movable>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <button data-xh-part="add-trigger">+ 添加一步</button>
  </div>
</xh-field-array>

<template id="field-array-insert-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <span style="inline-size: 1.5rem"></span>
      <xh-text-field placeholder="这一步做什么">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
    </div>
    <div data-xh-part="item-action">
      <xh-button size="sm" variant="ghost" data-action="insert"><button data-xh-part="root">下方插入</button></xh-button>
      <xh-button size="sm" variant="ghost" data-action="top"><button data-xh-part="root">置顶</button></xh-button>
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-insert");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("field-array-insert-row");

  let steps = ["拉取代码", "跑构建", "发布"];

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    steps.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector("span").textContent = `${index + 1}.`;
      // 插入与换位走元素的命令式方法，结果经 value-change 回来
      row.querySelector('[data-action="insert"]').addEventListener("click", () => host.insert(index + 1));
      const top = row.querySelector('[data-action="top"]');
      if (index === 0) top.setAttribute("disabled", "");
      top.addEventListener("click", () => host.move(index, 0));
      root.insertBefore(row, addTrigger);
      // 文本框插进页面、升级之后再给值；给了值即受控，报上来的新值由这里写回。
      // 它的 value-change 会冒泡到字段数组上，这里截住，字段数组只听增删
      const field = row.querySelector("xh-text-field");
      field.value = value;
      field.addEventListener("value-change", (event) => {
        event.stopPropagation();
        field.value = event.detail.value;
        steps = steps.map((item, i) => (i === index ? event.detail.value : item));
        host.value = steps;
      });
    });
  }

  host.createItem = () => "";
  host.value = steps;
  host.addEventListener("value-change", (event) => {
    steps = event.detail.value;
    host.value = steps;
    render();
  });

  render();
</script>
```

### 表格排布

layout="table" 时表头与各行共用一套列宽；columns 定列序与列宽，列头留空即显示这一列的 label

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
  XhFieldArrayAddTrigger,
  XhFieldArrayColumnHeader,
  XhFieldArrayHeader,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemCell,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayItemLabel,
  XhFieldArrayRoot,
  XhFieldArrayTable,
  XhNumberFieldControl,
  XhNumberFieldInput,
  XhNumberFieldRoot,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

interface Expense {
  date: string;
  category: string;
  amount: string;
  note: string;
}

const columns = [
  { id: "date", label: "日期", width: "10rem" },
  { id: "category", label: "类别", width: "8rem" },
  { id: "amount", label: "金额", width: "8rem" },
  { id: "note", label: "备注" },
];

const categories = [
  { value: "travel", label: "差旅" },
  { value: "meal", label: "餐饮" },
  { value: "office", label: "办公" },
];

const expenses: Expense[] = [
  { date: "2026-10-12", category: "travel", amount: "860", note: "往返高铁" },
  { date: "2026-10-13", category: "meal", amount: "128", note: "" },
];
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    layout="table"
    :columns="columns"
    :default-value="expenses"
    :create-item="() => ({ date: '', category: '', amount: '', note: '' })"
    style="inline-size: 100%"
  >
    <XhFieldArrayTable aria-label="费用明细">
      <XhFieldArrayHeader>
        <XhFieldArrayColumnHeader v-for="column in columns" :key="column.id" :value="column.id" />
      </XhFieldArrayHeader>
      <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
        <XhFieldArrayItemLabel>{{ row.index + 1 }}</XhFieldArrayItemLabel>
        <XhFieldArrayItemCell value="date">
          <XhDateFieldRoot :default-value="row.value.date || undefined" locale="zh-CN">
            <XhDateFieldControl :aria-label="`第 ${row.index + 1} 笔日期`">
              <XhDateFieldSegmentGroup>
                <XhDateFieldSegment :index="0" />
                <span>/</span>
                <XhDateFieldSegment :index="1" />
                <span>/</span>
                <XhDateFieldSegment :index="2" />
              </XhDateFieldSegmentGroup>
            </XhDateFieldControl>
          </XhDateFieldRoot>
        </XhFieldArrayItemCell>
        <XhFieldArrayItemCell value="category">
          <XhSelectRoot :default-value="row.value.category ? [row.value.category] : []" placeholder="选择">
            <XhSelectControl>
              <XhSelectTrigger :aria-label="`第 ${row.index + 1} 笔类别`">
                <XhSelectValueText />
                <XhSelectIndicator />
              </XhSelectTrigger>
            </XhSelectControl>
            <XhSelectPositioner>
              <XhSelectContent>
                <XhSelectList>
                  <XhSelectItem v-for="c in categories" :key="c.value" :value="c.value">
                    <XhSelectItemText>{{ c.label }}</XhSelectItemText>
                    <XhSelectItemIndicator />
                  </XhSelectItem>
                </XhSelectList>
              </XhSelectContent>
            </XhSelectPositioner>
          </XhSelectRoot>
        </XhFieldArrayItemCell>
        <XhFieldArrayItemCell value="amount">
          <XhNumberFieldRoot :default-value="row.value.amount" :min="0">
            <XhNumberFieldControl>
              <XhNumberFieldInput :aria-label="`第 ${row.index + 1} 笔金额`" />
            </XhNumberFieldControl>
          </XhNumberFieldRoot>
        </XhFieldArrayItemCell>
        <XhFieldArrayItemCell value="note">
          <XhTextFieldRoot :default-value="row.value.note">
            <XhTextFieldControl>
              <XhTextFieldInput :aria-label="`第 ${row.index + 1} 笔备注`" />
            </XhTextFieldControl>
          </XhTextFieldRoot>
        </XhFieldArrayItemCell>
        <XhFieldArrayItemAction>
          <XhFieldArrayItemDeleteTrigger />
        </XhFieldArrayItemAction>
      </XhFieldArrayItem>
    </XhFieldArrayTable>
    <XhFieldArrayAddTrigger>+ 添加一笔</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-table" layout="table">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="table" aria-label="费用明细">
      <div data-xh-part="header">
        <div data-xh-part="column-header" value="date"></div>
        <div data-xh-part="column-header" value="category"></div>
        <div data-xh-part="column-header" value="amount"></div>
        <div data-xh-part="column-header" value="note"></div>
      </div>
    </div>
    <button data-xh-part="add-trigger">+ 添加一笔</button>
  </div>
</xh-field-array>

<template id="field-array-table-row">
  <div data-xh-part="item">
    <span data-xh-part="item-label"></span>
    <div data-xh-part="item-cell" value="date">
      <xh-date-field locale="zh-CN">
        <div data-xh-part="root">
          <div data-xh-part="control" data-name="日期">
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
    <div data-xh-part="item-cell" value="category">
      <xh-select placeholder="选择">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <button data-xh-part="trigger" data-name="类别">
              <span data-xh-part="value-text"></span>
              <span data-xh-part="indicator"></span>
            </button>
          </div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="list">
                <div data-xh-part="item" value="travel">
                  <span data-xh-part="item-text">差旅</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
                <div data-xh-part="item" value="meal">
                  <span data-xh-part="item-text">餐饮</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
                <div data-xh-part="item" value="office">
                  <span data-xh-part="item-text">办公</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </xh-select>
    </div>
    <div data-xh-part="item-cell" value="amount">
      <xh-number-field min="0">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" data-name="金额" />
          </div>
        </div>
      </xh-number-field>
    </div>
    <div data-xh-part="item-cell" value="note">
      <xh-text-field>
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" data-name="备注" />
          </div>
        </div>
      </xh-text-field>
    </div>
    <div data-xh-part="item-action">
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-table");
  const table = host.querySelector('[data-xh-part="table"]');
  const template = document.getElementById("field-array-table-row");

  const expenses = [
    { date: "2026-10-12", category: "travel", amount: "860", note: "往返高铁" },
    { date: "2026-10-13", category: "meal", amount: "128", note: "" },
  ];

  // 格里的控件不受控，各管各的值；行节点按值的增删补上或撤下
  function createRow(expense) {
    const row = template.content.firstElementChild.cloneNode(true);
    if (expense.date) row.querySelector("xh-date-field").setAttribute("default-value", expense.date);
    if (expense.category) row.querySelector("xh-select").setAttribute("default-value", expense.category);
    row.querySelector("xh-number-field").setAttribute("default-value", expense.amount);
    row.querySelector("xh-text-field").setAttribute("default-value", expense.note);
    return row;
  }

  const rows = () => table.querySelectorAll(':scope > [data-xh-part="item"]');

  // 行号与每格控件的名字跟着行序走
  function renumber() {
    rows().forEach((row, i) => {
      row.querySelector('[data-xh-part="item-label"]').textContent = String(i + 1);
      for (const el of row.querySelectorAll("[data-name]"))
        el.setAttribute("aria-label", `第 ${i + 1} 笔${el.dataset.name}`);
    });
  }

  host.columns = [
    { id: "date", label: "日期", width: "10rem" },
    { id: "category", label: "类别", width: "8rem" },
    { id: "amount", label: "金额", width: "8rem" },
    { id: "note", label: "备注" },
  ];
  host.createItem = () => ({ date: "", category: "", amount: "", note: "" });
  host.defaultValue = expenses;
  for (const expense of expenses) table.append(createRow(expense));
  renumber();

  host.addEventListener("value-change", (event) => {
    // 格里控件的 value-change 也会冒泡上来，只认字段数组自己的
    if (event.target !== host) return;
    const { value, mutation } = event.detail;
    if (mutation?.type === "insert") table.insertBefore(createRow(value[mutation.index]), rows()[mutation.index] ?? null);
    else if (mutation?.type === "remove") rows()[mutation.index]?.remove();
    renumber();
  });
</script>
```

### 不写结构

只给每一行的内容：行号、删除与新增把手由组件铺，每行的内容按行交给组件

```vue
<script setup lang="ts">
import { XhFieldArrayRoot, XhTextFieldRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const links = ref<string[]>(["https://xihan.fun", ""]);

// 行里的控件是作者自己的，值也由作者自己写回
function setAt(index: number, next: string) {
  links.value = links.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-model:value="links"
    :create-item="() => ''"
    style="inline-size: 100%; max-inline-size: 420px"
  >
    <template #item-content="{ item }">
      <XhTextFieldRoot
        placeholder="填一个链接"
        :value="item.value"
        @update:value="(next: string) => setAt(item.index, next)"
      />
    </template>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-generated" style="display: block; inline-size: 100%; max-inline-size: 420px"></xh-field-array>

<script type="module">
  const host = document.getElementById("field-array-generated");
  let links = ["https://xihan.fun", ""];

  // 删掉的行的内容等行离场、回到宿主（宿主的直接子节点）之后再删：淡出的替身要带着它
  function dropOrphans() {
    const slots = new Set(host.items.map((item) => `item-content:${item.key}`));
    for (const node of host.querySelectorAll(':scope > [slot^="item-content:"]')) {
      if (!slots.has(node.getAttribute("slot"))) node.remove();
    }
  }

  // 按 items 补上每行的内容：每行一个 slot="item-content:<行 key>" 的文本框
  function addMissing() {
    for (const item of host.items) {
      const slot = `item-content:${item.key}`;
      if (host.querySelector(`[slot="${slot}"]`)) continue;
      const field = document.createElement("xh-text-field");
      field.setAttribute("slot", slot);
      field.setAttribute("placeholder", "填一个链接");
      field.value = item.value;
      // 文本框的 value-change 会冒泡到字段数组上，这里截住；行号随换序会变，按行 key 现查
      field.addEventListener("value-change", (event) => {
        event.stopPropagation();
        field.value = event.detail.value;
        const index = host.items.findIndex((row) => row.key === item.key);
        links = links.map((value, i) => (i === index ? event.detail.value : value));
        host.value = links;
      });
      host.append(field);
    }
  }

  customElements.whenDefined("xh-field-array").then(() => {
    host.createItem = () => "";
    host.value = links;
    // 值给了即受控：先写回值，再按新的 items 补内容，新行在同一帧就带上文本框；删掉的行下一帧再清
    host.addEventListener("value-change", (event) => {
      links = event.detail.value;
      host.value = links;
      addMissing();
      requestAnimationFrame(dropOrphans);
    });
    addMissing();
  });
</script>
```

## 设计指引

### 何时使用

- 联系方式、规格参数、收件人等数量可变的字段。

### 何时不用

- 行数固定时直接使用普通字段。
- 每项只是短文本时使用[标签输入](./tags-input)。

### 特性

- `min` 与 `max` 限制行数。
- `movable` 启用换序：每行有拖动把手（`item-drag-trigger`）与上移、下移两个把手。按住拖动把手把这一行拖到别处，其余各行实时让位，松手后它从松手处收进新位置，值按 `{ type: 'move', from, to }` 换位。拖动把手只接指针，不占 Tab 位、对读屏隐藏，键盘与读屏用上移、下移；拖动由 [排序](./sortable) 的状态机驱动，与它同一套让位、自动滚动与放下归位。删掉的行在原处淡出时照常拖别的行，淡出的替身不算一项。
- `onValueChange`（事件名 `value-change`）的载荷带上这次是哪一种行变更：`mutation` 为 `{ type: 'insert', index }`、`{ type: 'remove', index }`、`{ type: 'move', from, to }` 或整份写值的 `{ type: 'replace', length }`（类型 `FormArrayMutation`）。值存在外部 store 的宿主据此迁移行级状态（强制设定、选项、校验进度），不必整份替换后丢掉。
- `createItem` 设置新增行的初始值。
- `insert(index, item?)` 在指定位置插入一行，后面的行往后挪；`move(from, to)` 一步挪到任意位置。两者与 `add` 同受 `max`、`movable` 与禁用约束。
- 每行可以包含一个或多个字段。
- `layout="table"` 换成表格排布：`table` 部件是 role=table，表头 `header` 与各行放在它里面，`add-trigger` 仍排在它之后；表头里一列一个 `column-header`，行里一列一个 `item-cell`，都用 `value` 写列 id。`columns` 给出列序、列头文字与列宽（数字按 px，字符串原样，不写按 1fr），表头与各行共用这一套列宽。列上写 `minWidth` 给出下限，这一列不再随容器压窄到它以下；各列下限之和超过容器时，表格本体横向滚动，表头与各行一起滚，行号（`item-label`）钉在起始侧、把手（`item-action`）钉在末端侧，紧挨滚动区的一侧只在确有内容被压住时画分隔线，与表格的冻结列一致。容器很窄时钉住的两侧会占掉滚动区的大半，中间的格子怎么滚都看不全：这时把 `stickyActions` 关掉，把手随行一起滚动、滚到末端才露出来，Tab 到把手时表格本体把它滚进来，行号仍钉住；钉住的把手与表格的冻结列一样带 `data-frozen="end"`，表头带 `data-frozen-actions`。格里的字段族控件铺满这一格，包了一层字段也一样，且不超出这一格：文本框的原生宽不会把它撑出这一列、压到相邻的格上。窄的属性面板里放多列时给文字列写上 `minWidth`。不带键盘模型，Tab 依次经过各格里的控件与把手；横向放不下时表格本体也进 Tab 序列（`tabindex=0`），一行都没有、行里没有能聚焦的控件时键盘照样停得上去，用方向键横向滚动。放进字段时字段的标签接到表格上，不在字段里时在表格上写 `aria-label`。
- 不写结构时按标准结构铺出整套部件（Vue 不写默认插槽、React 不给 children、Web Components 不写部件或只写 `root`），三端出自同一个结构函数：列表排布下每行是行号（`item-label`，第几行）、内容格与把手（开了 `movable` 时先是拖动、上移与下移，再是删除），表格排布下是表格本体里的表头（每列一个列头）与各行、行里每列一格；最后是新增把手，文字取 `translations.addTrigger`。每行的内容归作者：Vue 写 `item-content` 插槽（载荷 `{ item }`），表格排布写 `item-cell` 插槽（载荷 `{ item, column }`）；React 给 `renderItemContent(item)` / `renderItemCell(item, column)`；Web Components 在宿主的直接子节点上写 `slot="item-content:<行 key>"`，表格排布写 `slot="item-cell:<行 key>:<列 id>"`，元素把它挪进对应的格子，换序时内容跟着行走。没给内容的行就空着，不报缺部件。
- Web Components 里行 key 从元素只读的 `items` 读（每项的 `key`，由组件分配、跟着这一行走）。`value-change` 同步派发、早于结构重铺，在它的处理函数里（受控时先写回 `value`）按 `items` 补上新行的内容，新行在同一帧就带上内容。删掉的行的内容先别删：原处淡出的替身克隆的是离场的那一行，内容要还在行里才带得上；行离场后它回到宿主、成为宿主的直接子节点，下一帧再把对不上 `items` 的删掉，不删会留在根的后面。
- 在 Form 中会同步迁移数组子字段的值、规则和错误。
- 行的增删与移动有进退场：首次渲染时已有的行直接呈现，新增的行淡入，删掉的行在原处淡出，上移、下移与增删带来的换位滑到新位置。行照常按 `items` 渲染，删掉即卸载。

### 组合

- 每一行放[表单字段](./field)，行内多个字段用行布局排列；整组挂在[表单](./form)下由它迁移值、规则与错误。
- `movable` 自带拖动、上移、下移三个把手；跳到任意位置用 `move(from, to)` 接作者自己的按钮。

### 最佳实践

- 新增后将焦点移到新行的第一个输入框。
- 删除按钮应说明目标行。
- 到达数量限制时保持操作按钮可见并禁用。

### 反模式

- 删除后无法撤销。
- 只在提交时提示数量限制。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-field-array>` |
| Vue 组件 | `XhFieldArrayAddTrigger` `XhFieldArrayColumnHeader` `XhFieldArrayHeader` `XhFieldArrayItem` `XhFieldArrayItemAction` `XhFieldArrayItemCell` `XhFieldArrayItemContent` `XhFieldArrayItemDeleteTrigger` `XhFieldArrayItemDragTrigger` `XhFieldArrayItemLabel` `XhFieldArrayMoveDownTrigger` `XhFieldArrayMoveUpTrigger` `XhFieldArrayRoot` `XhFieldArrayTable` |
| 组合式函数 | `useFieldArray` |
| 状态机 | `fieldArrayMachine` |
| 皮肤 | `@xihan-ui/styles/field-array.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `unknown[]` |  | 受控数据数组；提供后由宿主决定，状态机不自行修改，只发 onValueChange。 |
| `defaultValue` | `unknown[]` |  | 非受控初始数据数组。 |
| `min` | `number` |  | 最少行数。到达该数值时删除把手不可按下。默认 0。 |
| `max` | `number` |  | 最多行数。到达该数值时新增把手不可按下。默认不限。 |
| `createItem` | `() => unknown` |  | 新增一行时创建一个空项。未提供时插入 null。 |
| `movable` | `boolean` |  | 是否显示换序把手。关闭（默认）时上移、下移与拖动三个把手一律收起。 拖动把手只接指针（键盘与读屏用上移、下移），由适配器接上 sortable 的机器（见 fieldArrayDragProps）。 |
| `stickyActions` | `boolean` |  | 表格排布下行尾把手钉在末端侧（缺省 true）：表格区横向滚动时把手留在原处，其余格子从下面滑过。 关掉时把手随行一起滚动，滚到末端才露出来；钉住的两侧占掉滚动区大半、中间的格子怎么滚都看不全时关掉它。 行号总是钉在起始侧。 |
| `ariaLabel` | `string` |  | 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上（表格本体）；只在表格排布下生效。 放进字段（字段接线）或渲染了 label 部件时名字以它们为准，aria-labelledby 盖过它。 |
| `disabled` | `boolean` |  | 禁用：新增、删除、换序三路都不可按下。 |
| `readOnly` | `boolean` |  | 只读：行数不可修改（新增、删除、换序都不可按下），行内的控件仍由作者自行设置只读。 |
| `invalid` | `boolean` |  | 校验失败标注：写在根与每一行上。 |
| `layout` | `FieldArrayLayout` |  | 排布，缺省 list。table 时 table 部件是 role=table，header 与各行是 role=row，item-label 是 rowheader， item-cell 与 item-action 是 cell；行里的字段一格一个 item-cell，item-content 在这种排布下不用。 不带键盘模型：Tab 依次经过每格里的控件与把手，与普通表单一致。窄屏横向滚动交给外层容器。 |
| `columns` | `FieldArrayColumn[]` |  | 表格排布的各列，只在 table 排布下生效；顺序即列序。 |
| `name` | `FormPath` |  | 整份数组的表单字段名。嵌套在 Form 中时会自动接入其值、规则、错误与校验真源； 每一行经 `item.name` 获得显式数组 FormPath，不拼接字符串下标。 |
| `translations` | `Partial<FieldArrayTranslations>` |  |  |
| `onValueChange` | `(details: FieldArrayValueChangeDetails) => void` |  |  |

### FieldArrayColumn

`columns` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 |  |
| `label` | `string` |  | 列头文字；作者没给 column-header 写内容时显示它。 |
| `width` | `string \| number` |  | 列宽：数字按 px，字符串原样作轨道宽（fr、%、rem…），不写按 1fr。 |
| `minWidth` | `string \| number` |  | 列的最小宽度：数字按 px，字符串原样（rem、%…）。给了之后这一列不再随容器压窄到它以下，轨道写成 minmax(minWidth, width)，width 是一条 minmax 时把下限写进它里面、不写这一项。各列下限之和超过容器时， 表格区横向滚动，表头与各行一起滚，行头与把手钉在两侧。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `FieldArrayValueChangeDetails` | 数据数组变化；detail 为 `{ value: unknown[], mutation? }`，本组的增、删、移与整份写值带上 mutation（insert / remove / move / replace） |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFieldArrayRoot` | `default` | `FieldArrayRootSlotProps` |  |
| `XhFieldArrayRoot` | `item-content` | `FieldArrayItemContentSlotProps` | 不写默认插槽时每一行的作者内容（列表排布），载荷是这一行。 |
| `XhFieldArrayRoot` | `item-cell` | `FieldArrayItemCellSlotProps` | 不写默认插槽时每一格的作者内容（表格排布），载荷是所在的行与列。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhFieldArrayColumnHeader` | `value` | `string` | 是 | 列 id，与 columns 里的 id 对应。 |
| `XhFieldArrayItem` | `index` | `number \| string` | 是 | 下标由作者声明；兼收字符串，与另外两个适配器的属性口径对齐。 |
| `XhFieldArrayItemCell` | `value` | `string` | 是 | 列 id，与 columns 里的 id 对应。 |
| `XhFieldArrayRoot` | `renderItemContent` | `(item: FieldArrayItem) => ReactNode` |  | 不给 children 时每一行的作者内容（列表排布）。 |
| `XhFieldArrayRoot` | `renderItemCell` | `(item: FieldArrayItem, column: FieldArrayColumn) => ReactNode` |  | 不给 children 时每一格的作者内容（表格排布）。 |
| `XhFieldArrayRoot` | `children` | `SlotChildren<FieldArrayRootSlotProps>` |  | 不给时照标准结构铺整套部件。 |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.ADD` · `ITEM.REMOVE` · `ITEM.MOVE` · `FORM.RESET` · `PRESS.START` · `PRESS.END` · `LIST.TRACKED`

**判据**：`canAdd` · `canRemove` · `canMove` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `unknown[]` |  |
| `items` | `FieldArrayItem[]` | 逐行的读侧投影，含渲染用的 key。 |
| `count` | `number` |  |
| `empty` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `movable` | `boolean` |  |
| `stickyActions` | `boolean` | 表格排布下行尾把手钉在末端侧，见 stickyActions。 |
| `dragging` | `boolean` | 正有一行被拖动把手拖着（接了拖动时才可能为真）。 |
| `layout` | `FieldArrayLayout` |  |
| `columns` | `FieldArrayColumn[]` | 表格排布的各列，原样取自 columns；没给时为空数组。 |
| `atMin` | `boolean` | 已到下限：再删除会少于 min。 |
| `atMax` | `boolean` | 已到上限：再新增会多于 max。 |
| `canAdd` | `boolean` |  |
| `translations` | `FieldArrayTranslations` | 解析后的文案：作者给的 translations 盖在当前语言包上。 |
| `setValue` | `(next: unknown[]) => void` | 整份替换，不受 min / max 约束。 |
| `add` | `() => void` | 在末尾追加一行，数据由 createItem 造；受 max 约束。 |
| `insert` | `(index: number, item?: unknown) => void` | 在 index 处插入一行（夹到 0 到行数之间，等于行数即追加），原来在这个位置及之后的行往后挪；受 max 约束。 给了 item 就用它作这一行的数据，缺省（undefined）由 createItem 造。嵌在 Form 里时，后面各行的值、规则与错误随之后移。 |
| `remove` | `(index: number) => void` |  |
| `move` | `(from: number, to: number) => void` |  |
| `moveUp` | `(index: number) => void` |  |
| `moveDown` | `(index: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTableProps` | `() => T['element']` | 表格排布的表格本体：role=table，表头与各行放在它里面，新增把手仍在 root 里、排在它之后。 名字来自外层字段的标签（经字段接线），不在字段里时由作者在它上面写 aria-label。列表排布下不带角色。 |
| `getHeaderProps` | `() => T['element']` | 表头行：role=row，第 1 行。列表排布下收起。 |
| `getColumnHeaderProps` | `(column: FieldArrayColumnProps) => T['element']` | 列头：role=columnheader，value 是列 id。列表排布下收起。 |
| `getItemProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getItemCellProps` | `(cell: FieldArrayItemCellProps) => T['element']` | 行里的一格：role=cell，value 是列 id，落在这一列的轨道上。只在表格排布下使用。 |
| `getItemLabelProps` | `(item: FieldArrayItemProps) => T['element']` | 行前的行号或名目：纯标注，不与行内的控件建立 for 关联。 |
| `getItemContentProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getItemActionProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getAddTriggerProps` | `() => T['button']` |  |
| `getItemDeleteTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |
| `getMoveUpTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |
| `getMoveDownTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |
| `getItemDragTriggerProps` | `(item: FieldArrayItemProps) => T['button']` | 拖动把手：按住拖这一行换位，只接指针，不占 Tab 位、对读屏隐藏（键盘与读屏用上移、下移）。 不换序时与上移、下移一起收起。适配器没接拖动时它只是一颗收起的空把手。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | held on add-trigger / item-delete-trigger / move-up-trigger / move-down-trigger, not aria-disabled | 按住期间该把手投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，删除 / 换序落地后把手随行离场或换位时一并撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `table` | `aria-label` | props.ariaLabel \| undefined |
| `table` | `aria-rowcount` | count + 1 \| undefined |
| `table` | `role` | 'table' \| undefined |
| `header` | `aria-rowindex` | 1 \| undefined |
| `header` | `role` | 'row' \| undefined |
| `column-header` | `role` | 'columnheader' \| undefined |
| `item` | `aria-rowindex` | item.index + 2 \| undefined |
| `item` | `role` | 'row' \| undefined |
| `item-label` | `role` | 'rowheader' \| undefined |
| `item-cell` | `role` | 'cell' \| undefined |
| `item-action` | `role` | 'cell' \| undefined |
| `add-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(item.index + 1, count) |
| `item-drag-trigger` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/field-array.css` 按 `[data-scope="field-array"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-field-array` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-max` | ''（条件成立时才出现） |
| `root` | `data-at-min` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-instant` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-layout` | 'table' \| 'list' |
| `root` | `data-movable` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `table` | `data-at-max-horizontal` | ''（条件成立时才出现） |
| `table` | `data-at-min-horizontal` | ''（条件成立时才出现） |
| `table` | `data-layout` | 'table' \| 'list' |
| `header` | `data-frozen-actions` | ''（条件成立时才出现） |
| `header` | `data-layout` | 'table' \| 'list' |
| `column-header` | `data-layout` | 'table' \| 'list' |
| `column-header` | `data-value` | column.value |
| `item` | `data-animating` | dragged['data-animating'] |
| `item` | `data-at-max` | ''（条件成立时才出现） |
| `item` | `data-at-min` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-dragging` | dragged['data-dragging'] |
| `item` | `data-first` | ''（条件成立时才出现） |
| `item` | `data-index` | String(item.index) |
| `item` | `data-invalid` | ''（条件成立时才出现） |
| `item` | `data-last` | ''（条件成立时才出现） |
| `item` | `data-layout` | 'table' \| 'list' |
| `item` | `data-readonly` | ''（条件成立时才出现） |
| `item-label` | `data-at-max` | ''（条件成立时才出现） |
| `item-label` | `data-at-min` | ''（条件成立时才出现） |
| `item-label` | `data-disabled` | ''（条件成立时才出现） |
| `item-label` | `data-index` | String(item.index) |
| `item-label` | `data-invalid` | ''（条件成立时才出现） |
| `item-label` | `data-layout` | 'table' \| 'list' |
| `item-label` | `data-readonly` | ''（条件成立时才出现） |
| `item-content` | `data-at-max` | ''（条件成立时才出现） |
| `item-content` | `data-at-min` | ''（条件成立时才出现） |
| `item-content` | `data-disabled` | ''（条件成立时才出现） |
| `item-content` | `data-index` | String(item.index) |
| `item-content` | `data-invalid` | ''（条件成立时才出现） |
| `item-content` | `data-layout` | 'table' \| 'list' |
| `item-content` | `data-readonly` | ''（条件成立时才出现） |
| `item-cell` | `data-at-max` | ''（条件成立时才出现） |
| `item-cell` | `data-at-min` | ''（条件成立时才出现） |
| `item-cell` | `data-disabled` | ''（条件成立时才出现） |
| `item-cell` | `data-index` | String(item.index) |
| `item-cell` | `data-invalid` | ''（条件成立时才出现） |
| `item-cell` | `data-layout` | 'table' \| 'list' |
| `item-cell` | `data-readonly` | ''（条件成立时才出现） |
| `item-cell` | `data-value` | cell.value |
| `item-action` | `data-at-max` | ''（条件成立时才出现） |
| `item-action` | `data-at-min` | ''（条件成立时才出现） |
| `item-action` | `data-disabled` | ''（条件成立时才出现） |
| `item-action` | `data-frozen` | 'end' \| undefined |
| `item-action` | `data-index` | String(item.index) |
| `item-action` | `data-invalid` | ''（条件成立时才出现） |
| `item-action` | `data-layout` | 'table' \| 'list' |
| `item-action` | `data-readonly` | ''（条件成立时才出现） |
| `add-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `add-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `add-trigger` | `data-xh-action-control` | '' |
| `add-trigger` | `data-xh-action-display` | 'always' |
| `add-trigger` | `data-xh-action-profile` | 'text' |
| `add-trigger` | `data-xh-action-size` | 'md' |
| `add-trigger` | `data-xh-action-variant` | 'outline' |
| `item-delete-trigger` | `data-at-max` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-at-min` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-index` | String(item.index) |
| `item-delete-trigger` | `data-invalid` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-layout` | 'table' \| 'list' |
| `item-delete-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-readonly` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-xh-action-control` | '' |
| `item-delete-trigger` | `data-xh-action-display` | 'always' |
| `item-delete-trigger` | `data-xh-action-profile` | 'icon' |
| `item-delete-trigger` | `data-xh-action-size` | 'xs' |
| `item-delete-trigger` | `data-xh-action-variant` | 'ghost' |
| `item-drag-trigger` | `data-at-max` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-at-min` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-dragging` | grip['data-dragging'] |
| `item-drag-trigger` | `data-index` | String(item.index) |
| `item-drag-trigger` | `data-invalid` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-layout` | 'table' \| 'list' |
| `item-drag-trigger` | `data-pressed` | grip['data-pressed'] |
| `item-drag-trigger` | `data-readonly` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-xh-action-control` | '' |
| `item-drag-trigger` | `data-xh-action-display` | 'always' |
| `item-drag-trigger` | `data-xh-action-profile` | 'icon' |
| `item-drag-trigger` | `data-xh-action-size` | 'xs' |
| `item-drag-trigger` | `data-xh-action-variant` | 'ghost' |
| `move-up-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `move-up-trigger` | `data-xh-action-control` | '' |
| `move-up-trigger` | `data-xh-action-display` | 'always' |
| `move-up-trigger` | `data-xh-action-profile` | 'icon' |
| `move-up-trigger` | `data-xh-action-size` | 'xs' |
| `move-up-trigger` | `data-xh-action-variant` | 'ghost' |
| `move-down-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `move-down-trigger` | `data-xh-action-control` | '' |
| `move-down-trigger` | `data-xh-action-display` | 'always' |
| `move-down-trigger` | `data-xh-action-profile` | 'icon' |
| `move-down-trigger` | `data-xh-action-size` | 'xs' |
| `move-down-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-field-array-action-gap` | `add-trigger`<br>`item-action` | `gap` | `default` | `--xh-space-1` | field-array 的 add-trigger、item-action 部件 gap 覆盖槽。 |
| `--xh-field-array-add-bg` | `add-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | field-array 的 add-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-field-array-add-bg-active` | `add-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | field-array 的 add-trigger 部件 background-color 覆盖槽。 |
| `--xh-field-array-add-bg-hover` | `add-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | field-array 的 add-trigger 部件 background-color 覆盖槽。 |
| `--xh-field-array-add-border` | `add-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | field-array 的 add-trigger 部件 border 覆盖槽。 |
| `--xh-field-array-add-border-disabled` | `add-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` | field-array 的 add-trigger 部件 border-color 覆盖槽。 |
| `--xh-field-array-add-border-hover` | `add-trigger` | `border-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-border-hover` | field-array 的 add-trigger 部件 border-color 覆盖槽。 |
| `--xh-field-array-add-fg` | `add-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-brand` | field-array 的 add-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-add-font-size` | `add-trigger` | `font-size` | `default` | `--xh-text-label-size` | field-array 的 add-trigger 部件 font-size 覆盖槽。 |
| `--xh-field-array-add-height` | `add-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | field-array 的 add-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-field-array-add-px` | `add-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | field-array 的 add-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-field-array-add-radius` | `add-trigger` | `border-radius` | `default` | `--xh-shape-control` | field-array 的 add-trigger 部件 border-radius 覆盖槽。 |
| `--xh-field-array-cell-control-h` | `item-action`<br>`item-cell`<br>`item-label` | `min-block-size` | `is([data-part='item-cell'], [data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-_field-array-cell-control-h` | field-array 的 item-action、item-cell、item-label 部件 min-block-size 覆盖槽。 |
| `--xh-field-array-cell-px` | `column-header`<br>`item-action`<br>`item-cell`<br>`item-label` | `padding-inline` | `is([data-part='item-cell'], [data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-table-cell-px-md` | field-array 的 column-header、item-action、item-cell、item-label 部件 padding-inline 覆盖槽。 |
| `--xh-field-array-cell-py` | `column-header`<br>`item-action`<br>`item-cell`<br>`item-label` | `padding-block` | `is([data-part='item-cell'], [data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-table-cell-py-md` | field-array 的 column-header、item-action、item-cell、item-label 部件 padding-block 覆盖槽。 |
| `--xh-field-array-column-header-fg` | `column-header` | `color` | `layout=table` | `--xh-fg-default` | field-array 的 column-header 部件 color 覆盖槽。 |
| `--xh-field-array-column-header-font-weight` | `column-header` | `font-weight` | `layout=table` | `--xh-font-weight-medium` | field-array 的 column-header 部件 font-weight 覆盖槽。 |
| `--xh-field-array-content-gap` | `item-content` | `gap` | `default` | `--xh-space-2` | field-array 的 item-content 部件 gap 覆盖槽。 |
| `--xh-field-array-drag-grip-h` | `item-drag-trigger` | `block-size` | `empty` | `--xh-space-3` | field-array 的 item-drag-trigger 部件 block-size 覆盖槽。 |
| `--xh-field-array-drag-grip-w` | `item-drag-trigger` | `inline-size` | `empty` | `--xh-space-1` | field-array 的 item-drag-trigger 部件 inline-size 覆盖槽。 |
| `--xh-field-array-frozen-bg` | `item-action`<br>`item-label` | `background` | `is([data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-field-array-table-bg` | field-array 的 item-action、item-label 部件 background 覆盖槽。 |
| `--xh-field-array-frozen-edge` | `header`<br>`item`<br>`item-action`<br>`item-label`<br>`table` | `border-inline-end-color`<br>`border-inline-start-color` | `at-max-horizontal`<br>`at-min-horizontal`<br>`frozen-actions`<br>`frozen=end`<br>`is([data-part='item'], [data-part='header'])`<br>`layout=table`<br>`not([data-at-max-horizontal])`<br>`not([data-at-min-horizontal])` | `--xh-border-default` | field-array 的 header、item、item-action、item-label、table 部件 border-inline-end-color、border-inline-start-color 覆盖槽。 |
| `--xh-field-array-frozen-header-bg` | `header` | `background` | `layout=table` | `--xh-bg-subtle-opaque` | field-array 的 header 部件 background 覆盖槽。 |
| `--xh-field-array-gap` | `root` | `gap` | `default` | `--xh-space-2` | field-array 的 root 部件 gap 覆盖槽。 |
| `--xh-field-array-header-bg` | `header` | `background` | `layout=table` | `--xh-bg-subtle` | field-array 的 header 部件 background 覆盖槽。 |
| `--xh-field-array-icon-size` | `add-trigger`<br>`item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | field-array 的 add-trigger、item-delete-trigger、item-drag-trigger、move-down-trigger、move-up-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-field-array-item-bg-dragging` | `item` | `background` | `dragging` | `--xh-bg-surface` | field-array 的 item 部件 background 覆盖槽。 |
| `--xh-field-array-item-delete-fg-hover` | `item-delete-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-danger-hover` | field-array 的 item-delete-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-item-gap` | `item` | `gap` | `default` | `--xh-space-2` | field-array 的 item 部件 gap 覆盖槽。 |
| `--xh-field-array-item-label-fg` | `item-label` | `color` | `default` | `--xh-fg-muted` | field-array 的 item-label 部件 color 覆盖槽。 |
| `--xh-field-array-item-label-font-size` | `item-label` | `font-size` | `default` | `--xh-text-secondary-size` | field-array 的 item-label 部件 font-size 覆盖槽。 |
| `--xh-field-array-item-padding` | `item` | `padding` | `default` | `--xh-space-0` | field-array 的 item 部件 padding 覆盖槽。 |
| `--xh-field-array-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-surface` | field-array 的 item 部件 border-radius 覆盖槽。 |
| `--xh-field-array-item-shadow-dragging` | `item` | `box-shadow` | `dragging` | `--xh-elevation-lifted` | field-array 的 item 部件 box-shadow 覆盖槽。 |
| `--xh-field-array-row-divider` | `header`<br>`item` | `border-block-end`<br>`border-block-start` | `layout=table` | `--xh-border-subtle` | field-array 的 header、item 部件 border-block-end、border-block-start 覆盖槽。 |
| `--xh-field-array-sticky-column-layer` | `header`<br>`item-action`<br>`item-label` | `z-index` | `frozen-actions`<br>`frozen=end`<br>`layout=table` | `1` | field-array 的 header、item-action、item-label 部件 z-index 覆盖槽。 |
| `--xh-field-array-table-bg` | `item-action`<br>`item-label`<br>`table` | `background` | `is([data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-bg-surface` | field-array 的 item-action、item-label、table 部件 background 覆盖槽。 |
| `--xh-field-array-table-border` | `table` | `border` | `layout=table` | `--xh-border-default` | field-array 的 table 部件 border 覆盖槽。 |
| `--xh-field-array-table-radius` | `header`<br>`table` | `border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `layout=table` | `--xh-shape-surface` | field-array 的 header、table 部件 border-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-field-array-trigger-bg` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | field-array 的 item-delete-trigger、item-drag-trigger、move-down-trigger、move-up-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-field-array-trigger-bg-active` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | field-array 的 item-delete-trigger、item-drag-trigger、move-down-trigger、move-up-trigger 部件 background-color 覆盖槽。 |
| `--xh-field-array-trigger-bg-hover` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | field-array 的 item-delete-trigger、item-drag-trigger、move-down-trigger、move-up-trigger 部件 background-color 覆盖槽。 |
| `--xh-field-array-trigger-fg` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `color` | `default` | `--xh-fg-muted` | field-array 的 item-delete-trigger、item-drag-trigger、move-down-trigger、move-up-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-trigger-fg-hover` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | field-array 的 item-delete-trigger、item-drag-trigger、move-down-trigger、move-up-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-trigger-font-size` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | field-array 的 item-delete-trigger、item-drag-trigger、move-down-trigger、move-up-trigger 部件 font-size 覆盖槽。 |
| `--xh-field-array-trigger-radius` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `border-radius` | `default` | `--xh-shape-control` | field-array 的 item-delete-trigger、item-drag-trigger、move-down-trigger、move-up-trigger 部件 border-radius 覆盖槽。 |
| `--xh-field-array-trigger-size` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | field-array 的 item-delete-trigger、item-drag-trigger、move-down-trigger、move-up-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换 · 指示与换位 · 出现 · 列表（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-out` · `xh-item-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`border-color` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
