来源：https://ui.docs.xihanfun.com/components/field-array

# 字段数组 `field-array`

一组行数可变的录入行：可以加一行、删一行、换顺序。

## 何时使用

- 联系方式、规格参数、收件人这类"数量由用户决定"的重复字段。

## 何时不用

- 行数固定：直接写几行。
- 每一行是一个短词：用[标签输入](./tags-input)。

## 特性

- `min` / `max` 约束行数，到下限时删除按钮不可用。
- `movable` 给出上移下移。
- `createItem` 决定新增一行时的初值。
- 一行里可以放多个字段。
- `name` 给整份数组一个字段名，每行经 `item.name` 拿到 `名字[下标]` 写到自己的控件上。
- `readOnly` 让行数改不动，`invalid` 把校验状态传到每一行。
- `item-label` 承载行前的行号或名目。

## 示例

### 基础用法

加一行、删一行归组件管；行里放什么控件归作者，写在 item-content 里

```vue
<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
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
    v-slot="{ items, count }"
    v-model:value="links"
    :create-item="() => ''"
    style="max-inline-size: 420px"
  >
    <!-- key 用 items 给的 row.key：它跟着这一行走，不是下标 -->
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input
          style="inline-size: 100%"
          placeholder="填一个链接"
          :value="row.value"
          @input="setAt(row.index, ($event.target as HTMLInputElement).value)"
        >
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加链接</XhFieldArrayAddTrigger>
    <p>共 {{ count }} 条</p>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-basic">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加链接</button>
    <p id="field-array-basic-count">共 0 条</p>
  </div>
</xh-field-array>

<!-- 一行的骨架，脚本按当前值克隆出行来 -->
<template id="field-array-basic-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <input style="inline-size: 100%" placeholder="填一个链接" />
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
  const count = document.getElementById("field-array-basic-count");

  let links = ["https://xihan.fun", ""];

  // 行由作者按当前值铺：清掉旧行，再逐条克隆骨架插到新增把手前面
  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    links.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      const input = row.querySelector("input");
      input.value = value;
      // 行里的控件是作者自己的，值也由作者自己写回
      input.addEventListener("input", () => {
        links = links.map((item, i) => (i === index ? input.value : item));
        host.value = links;
      });
      root.insertBefore(row, addTrigger);
    });
    count.textContent = `共 ${links.length} 条`;
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

### 行数上下限

到 min 删除把手按不动、到 max 新增把手按不动；两者都转 aria-disabled，焦点留得住

```vue
<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const options = ref<string[]>(["红", "绿"]);

function setAt(index: number, next: string) {
  options.value = options.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items, count, atMin, atMax }"
    v-model:value="options"
    :min="2"
    :max="4"
    :create-item="() => ''"
    style="max-inline-size: 420px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input
          style="inline-size: 100%"
          placeholder="填一个选项"
          :value="row.value"
          @input="setAt(row.index, ($event.target as HTMLInputElement).value)"
        >
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加选项</XhFieldArrayAddTrigger>
    <p>
      {{ count }} / 4
      <span v-if="atMin"> · 至少留 2 个</span>
      <span v-if="atMax"> · 已到上限</span>
    </p>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-bounds" min="2" max="4">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加选项</button>
    <p id="field-array-bounds-note">2 / 4</p>
  </div>
</xh-field-array>

<template id="field-array-bounds-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <input style="inline-size: 100%" placeholder="填一个选项" />
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
  const note = document.getElementById("field-array-bounds-note");

  const MIN = 2;
  const MAX = 4;
  let options = ["红", "绿"];

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    options.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      const input = row.querySelector("input");
      input.value = value;
      input.addEventListener("input", () => {
        options = options.map((item, i) => (i === index ? input.value : item));
        host.value = options;
      });
      root.insertBefore(row, addTrigger);
    });
    // 上下限的判断与组件同一条规则：到底了就是到底了
    const bounds
      = (options.length <= MIN ? " · 至少留 2 个" : "")
      + (options.length >= MAX ? " · 已到上限" : "");
    note.textContent = `${options.length} / ${MAX}${bounds}`;
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

### 换序

movable 开了才出上下把手；挪完焦点跟着这一行走，键盘可以连按一路挪到底

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
    style="max-inline-size: 420px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <span style="inline-size: 1.5rem">{{ row.index + 1 }}.</span>
        <input
          style="inline-size: 100%"
          placeholder="这一步做什么"
          :value="row.value"
          @input="setAt(row.index, ($event.target as HTMLInputElement).value)"
        >
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayMoveUpTrigger />
        <XhFieldArrayMoveDownTrigger />
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加一步</XhFieldArrayAddTrigger>
    <p>顺序：{{ steps.join(" → ") }}</p>
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-movable" movable>
  <div data-xh-part="root" style="max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加一步</button>
    <p id="field-array-movable-order">顺序：</p>
  </div>
</xh-field-array>

<template id="field-array-movable-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <span style="inline-size: 1.5rem"></span>
      <input style="inline-size: 100%" placeholder="这一步做什么" />
    </div>
    <div data-xh-part="item-action">
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
  const order = document.getElementById("field-array-movable-order");

  let steps = ["拉取代码", "安装依赖", "跑构建", "发布"];

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    steps.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector("span").textContent = `${index + 1}.`;
      const input = row.querySelector("input");
      input.value = value;
      input.addEventListener("input", () => {
        steps = steps.map((item, i) => (i === index ? input.value : item));
        host.value = steps;
      });
      root.insertBefore(row, addTrigger);
    });
    order.textContent = `顺序：${steps.join(" → ")}`;
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

### 一行多个字段

行数据是对象，createItem 造一个空项；改字段时整份重建数组，行号不跟着变

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
    style="max-inline-size: 480px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input
          style="inline-size: 40%"
          placeholder="字段名"
          :value="row.value.name"
          @input="patch(row.index, 'name', ($event.target as HTMLInputElement).value)"
        >
        <input
          style="inline-size: 60%"
          placeholder="字段值"
          :value="row.value.value"
          @input="patch(row.index, 'value', ($event.target as HTMLInputElement).value)"
        >
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayMoveUpTrigger />
        <XhFieldArrayMoveDownTrigger />
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加请求头</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
  <pre>{{ JSON.stringify(headers, null, 2) }}</pre>
</template>
```

```html
<xh-field-array id="field-array-object" movable>
  <div data-xh-part="root" style="max-inline-size: 480px">
    <button data-xh-part="add-trigger">+ 添加请求头</button>
  </div>
</xh-field-array>

<pre id="field-array-object-dump"></pre>

<template id="field-array-object-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <input data-key="name" style="inline-size: 40%" placeholder="字段名" />
      <input data-key="value" style="inline-size: 60%" placeholder="字段值" />
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
  const dump = document.getElementById("field-array-object-dump");

  let headers = [
    { name: "Accept", value: "application/json" },
    { name: "X-Trace", value: "" },
  ];

  // 改一个字段就整份重建数组，行号不跟着变
  function patch(index, key, next) {
    headers = headers.map((row, i) => (i === index ? { ...row, [key]: next } : row));
    host.value = headers;
    dump.textContent = JSON.stringify(headers, null, 2);
  }

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    headers.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      for (const input of row.querySelectorAll("input")) {
        input.value = value[input.dataset.key];
        input.addEventListener("input", () => patch(index, input.dataset.key, input.value));
      }
      root.insertBefore(row, addTrigger);
    });
    dump.textContent = JSON.stringify(headers, null, 2);
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

### 禁用与程序化操作

禁用时三类把手全按不动；从外面加一条走同一条闸门，整份替换值则不受闸门约束

```vue
<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const locked = ref(false);
const tasks = ref<string[]>(["写方案", "评审", "上线"]);
</script>

<template>
  <label>
    <input v-model="locked" type="checkbox">
    锁定这份清单
  </label>

  <XhFieldArrayRoot
    v-slot="{ items, setValue, add }"
    v-model:value="tasks"
    :disabled="locked"
    :create-item="() => '新任务'"
    style="max-inline-size: 420px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>{{ row.value }}</XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加任务</XhFieldArrayAddTrigger>

    <!-- add 与把手走同一条闸门，锁定时同样按不动；setValue 是整份替换，不受闸门约束 -->
    <p>
      <button type="button" @click="add()">从外面加一条</button>
      <button type="button" @click="setValue(['写方案', '评审', '上线'])">恢复默认</button>
    </p>
  </XhFieldArrayRoot>
</template>
```

```html
<label>
  <input id="field-array-lock" type="checkbox" />
  锁定这份清单
</label>

<xh-field-array id="field-array-api">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加任务</button>
    <p>
      <button type="button" id="field-array-api-add">从外面加一条</button>
      <button type="button" id="field-array-api-restore">恢复默认</button>
    </p>
  </div>
</xh-field-array>

<template id="field-array-api-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content"></div>
    <div data-xh-part="item-action">
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-api");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("field-array-api-row");

  const DEFAULTS = ["写方案", "评审", "上线"];
  let tasks = [...DEFAULTS];

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    for (const value of tasks) {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector('[data-xh-part="item-content"]').textContent = value;
      root.insertBefore(row, addTrigger);
    }
  }

  host.createItem = () => "新任务";
  host.value = tasks;
  host.addEventListener("value-change", (event) => {
    tasks = event.detail.value;
    host.value = tasks;
    render();
  });

  document.getElementById("field-array-lock").addEventListener("change", (event) => {
    host.disabled = event.target.checked;
  });

  // 转交给已接线的新增把手，锁定时同样按不动
  document.getElementById("field-array-api-add").addEventListener("click", () => {
    addTrigger.click();
  });

  // 整份替换值不经把手，锁定时照样生效
  document.getElementById("field-array-api-restore").addEventListener("click", () => {
    tasks = [...DEFAULTS];
    host.value = tasks;
    render();
  });

  render();
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-field-array>` |
| Vue 组件 | `XhFieldArrayAddTrigger` `XhFieldArrayItem` `XhFieldArrayItemAction` `XhFieldArrayItemContent` `XhFieldArrayItemDeleteTrigger` `XhFieldArrayItemLabel` `XhFieldArrayMoveDownTrigger` `XhFieldArrayMoveUpTrigger` `XhFieldArrayRoot` |
| 组合式函数 | `useFieldArray` |
| 状态机 | `fieldArrayMachine` |
| 皮肤 | `@xihan-ui/styles/field-array.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="field-array"`：**`root`** · `item` · `item-label` · `item-content` · `item-action` · `add-trigger` · `item-delete-trigger` · `move-up-trigger` · `move-down-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `unknown[]` |  | 受控数据数组；给了就由宿主说了算，机器不自改，只发 onValueChange。 |
| `defaultValue` | `unknown[]` |  | 非受控初始数据数组。 |
| `min` | `number` |  | 最少几行。到了这个数，删除把手就按不动了。缺省 0。 |
| `max` | `number` |  | 最多几行。到了这个数，新增把手就按不动了。缺省不限。 |
| `createItem` | `() => unknown` |  | 新增一行时造一个空项。不给就插一个 null。 |
| `movable` | `boolean` |  | 出不出换序把手。关（默认）时两个换序把手一律收起。 |
| `disabled` | `boolean` |  | 禁用：新增、删除、换序三路都按不动。 |
| `readOnly` | `boolean` |  | 只读：行数改不动（新增、删除、换序都按不动），行里的控件仍由作者自己置只读。 |
| `invalid` | `boolean` |  | 校验失败标注：落到根与每一行上。 |
| `name` | `string` |  | 整份数组的表单字段名。给了之后每一行经 `item.name` 拿到 `名字[下标]`， 作者把它写到行里自己的控件上，整份数组才提交得出去。 |
| `translations` | `Partial<FieldArrayTranslations>` |  |  |
| `onValueChange` | `(details: FieldArrayValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `FieldArrayValueChangeDetails` | 数据数组变化；detail 为 `{ value: unknown[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFieldArrayRoot` | `default` | `FieldArrayRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.ADD` · `ITEM.REMOVE` · `ITEM.MOVE` · `FORM.RESET`

**判据**：`canAdd` · `canRemove` · `canMove`

## connect API

`useFieldArray` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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
| `atMin` | `boolean` | 已到下限：再删就少于 min 了。 |
| `atMax` | `boolean` | 已到上限：再加就多于 max 了。 |
| `canAdd` | `boolean` |  |
| `setValue` | `(next: unknown[]) => void` | 整份替换，不受 min / max 约束。 |
| `add` | `() => void` |  |
| `remove` | `(index: number) => void` |  |
| `move` | `(from: number, to: number) => void` |  |
| `moveUp` | `(index: number) => void` |  |
| `moveDown` | `(index: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getItemLabelProps` | `(item: FieldArrayItemProps) => T['element']` | 行前那一小段行号或名目；纯标注，不与行里的控件建立 for 关联。 |
| `getItemContentProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getItemActionProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getAddTriggerProps` | `() => T['button']` |  |
| `getItemDeleteTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |
| `getMoveUpTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |
| `getMoveDownTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `add-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(item.index + 1, count) |

## 样式

默认皮肤 `@xihan-ui/styles/field-array.css` 按部件选择：`[data-scope="field-array"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-max` | ''（条件成立时才出现） |
| `root` | `data-at-min` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-movable` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-first` | ''（条件成立时才出现） |
| `item` | `data-last` | ''（条件成立时才出现） |
| `add-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-field-array-action-gap` · `--xh-field-array-add-bg` · `--xh-field-array-add-bg-active` · `--xh-field-array-add-bg-hover` · `--xh-field-array-add-border` · `--xh-field-array-add-border-disabled` · `--xh-field-array-add-border-hover` · `--xh-field-array-add-fg` · `--xh-field-array-add-font-size` · `--xh-field-array-add-height` · `--xh-field-array-add-px` · `--xh-field-array-add-radius` · `--xh-field-array-content-gap` · `--xh-field-array-gap` · `--xh-field-array-icon-size` · `--xh-field-array-item-delete-fg-hover` · `--xh-field-array-item-gap` · `--xh-field-array-item-label-fg` · `--xh-field-array-item-label-font-size` · `--xh-field-array-item-padding` · `--xh-field-array-item-radius` · `--xh-field-array-trigger-bg` · `--xh-field-array-trigger-bg-active` · `--xh-field-array-trigger-bg-hover` · `--xh-field-array-trigger-fg` · `--xh-field-array-trigger-fg-hover` · `--xh-field-array-trigger-font-size` · `--xh-field-array-trigger-radius` · `--xh-field-array-trigger-size`

## 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 每行里放[表单字段](./field)与各类录入组件；整体放进[表单](./form)。

## 最佳实践

- 新增一行后把焦点移到这一行的第一个输入框。
- 删除按钮要说明删的是哪一行（`aria-label` 带上行号或内容）。

## 反模式

- 删除不给撤销，误删只能重填。
- 行数上限只在提交时才提示。
