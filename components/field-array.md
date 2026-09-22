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
    style="max-inline-size: 420px"
  >
    <!-- key 用 items 给的 row.key：它跟着这一行走，不是下标 -->
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input
          class="xh-demo-control"
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
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-basic">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加链接</button>
  </div>
</xh-field-array>

<template id="field-array-basic-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <input class="xh-demo-control" style="inline-size: 100%" placeholder="填一个链接" />
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
      const input = row.querySelector("input");
      input.value = value;
      // 行里的控件是作者自己的，值也由作者自己写回
      input.addEventListener("input", () => {
        links = links.map((item, i) => (i === index ? input.value : item));
        host.value = links;
      });
      root.insertBefore(row, addTrigger);
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

`data-scope="field-array"`：**`root`** · `item` · `item-label` · `item-content` · `item-action` · `add-trigger` · `item-delete-trigger` · `move-up-trigger` · `move-down-trigger`

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
    style="max-inline-size: 420px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input
          class="xh-demo-control"
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
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-bounds" min="2" max="4">
  <div data-xh-part="root" style="max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加选项</button>
  </div>
</xh-field-array>

<template id="field-array-bounds-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <input class="xh-demo-control" style="inline-size: 100%" placeholder="填一个选项" />
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
      const input = row.querySelector("input");
      input.value = value;
      input.addEventListener("input", () => {
        options = options.map((item, i) => (i === index ? input.value : item));
        host.value = options;
      });
      root.insertBefore(row, addTrigger);
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

上移或下移字段

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
          class="xh-demo-control"
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
  </XhFieldArrayRoot>
</template>
```

```html
<xh-field-array id="field-array-movable" movable>
  <div data-xh-part="root" style="max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加一步</button>
  </div>
</xh-field-array>

<template id="field-array-movable-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <span style="inline-size: 1.5rem"></span>
      <input class="xh-demo-control" style="inline-size: 100%" placeholder="这一步做什么" />
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
          class="xh-demo-control"
          style="inline-size: 40%"
          placeholder="字段名"
          :value="row.value.name"
          @input="patch(row.index, 'name', ($event.target as HTMLInputElement).value)"
        >
        <input
          class="xh-demo-control"
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
</template>
```

```html
<xh-field-array id="field-array-object" movable>
  <div data-xh-part="root" style="max-inline-size: 480px">
    <button data-xh-part="add-trigger">+ 添加请求头</button>
  </div>
</xh-field-array>

<template id="field-array-object-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <input data-key="name" class="xh-demo-control" style="inline-size: 40%" placeholder="字段名" />
      <input data-key="value" class="xh-demo-control" style="inline-size: 60%" placeholder="字段值" />
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
      for (const input of row.querySelectorAll("input")) {
        input.value = value[input.dataset.key];
        input.addEventListener("input", () => patch(index, input.dataset.key, input.value));
      }
      root.insertBefore(row, addTrigger);
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

## 设计指引

### 何时使用

- 联系方式、规格参数、收件人等数量可变的字段。

### 何时不用

- 行数固定时直接使用普通字段。
- 每项只是短文本时使用[标签输入](./tags-input)。

### 特性

- `min` 与 `max` 限制行数。
- `movable` 启用上移和下移操作。
- `createItem` 设置新增行的初始值。
- 每行可以包含一个或多个字段。
- 在 Form 中会同步迁移数组子字段的值、规则和错误。

### 组合

- 每一行放[表单字段](./field)，行内多个字段用行布局排列；整组挂在[表单](./form)下由它迁移值、规则与错误。
- 行序也可以交给[排序](./sortable)拖拽调整；`movable` 只提供上移、下移两个按钮。

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
| Vue 组件 | `XhFieldArrayAddTrigger` `XhFieldArrayItem` `XhFieldArrayItemAction` `XhFieldArrayItemContent` `XhFieldArrayItemDeleteTrigger` `XhFieldArrayItemLabel` `XhFieldArrayMoveDownTrigger` `XhFieldArrayMoveUpTrigger` `XhFieldArrayRoot` |
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
| `movable` | `boolean` |  | 是否显示换序把手。关闭（默认）时两个换序把手一律收起。 |
| `disabled` | `boolean` |  | 禁用：新增、删除、换序三路都不可按下。 |
| `readOnly` | `boolean` |  | 只读：行数不可修改（新增、删除、换序都不可按下），行内的控件仍由作者自行设置只读。 |
| `invalid` | `boolean` |  | 校验失败标注：写在根与每一行上。 |
| `name` | `FormPath` |  | 整份数组的表单字段名。嵌套在 Form 中时会自动接入其值、规则、错误与校验真源； 每一行经 `item.name` 获得显式数组 FormPath，不拼接字符串下标。 |
| `translations` | `Partial<FieldArrayTranslations>` |  |  |
| `onValueChange` | `(details: FieldArrayValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `FieldArrayValueChangeDetails` | 数据数组变化；detail 为 `{ value: unknown[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFieldArrayRoot` | `default` | `FieldArrayRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.ADD` · `ITEM.REMOVE` · `ITEM.MOVE` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

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
| `atMin` | `boolean` | 已到下限：再删除会少于 min。 |
| `atMax` | `boolean` | 已到上限：再新增会多于 max。 |
| `canAdd` | `boolean` |  |
| `setValue` | `(next: unknown[]) => void` | 整份替换，不受 min / max 约束。 |
| `add` | `() => void` |  |
| `remove` | `(index: number) => void` |  |
| `move` | `(from: number, to: number) => void` |  |
| `moveUp` | `(index: number) => void` |  |
| `moveDown` | `(index: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getItemLabelProps` | `(item: FieldArrayItemProps) => T['element']` | 行前的行号或名目：纯标注，不与行内的控件建立 for 关联。 |
| `getItemContentProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getItemActionProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getAddTriggerProps` | `() => T['button']` |  |
| `getItemDeleteTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |
| `getMoveUpTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |
| `getMoveDownTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |

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
| `add-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(item.index + 1, count) |

## 样式参考

### 皮肤

`@xihan-ui/styles/field-array.css` 使用 `[data-scope="field-array"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-max` | ''（条件成立时才出现） |
| `root` | `data-at-min` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-movable` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-at-max` | ''（条件成立时才出现） |
| `item` | `data-at-min` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-first` | ''（条件成立时才出现） |
| `item` | `data-index` | String(item.index) |
| `item` | `data-invalid` | ''（条件成立时才出现） |
| `item` | `data-last` | ''（条件成立时才出现） |
| `item` | `data-readonly` | ''（条件成立时才出现） |
| `item-label` | `data-at-max` | ''（条件成立时才出现） |
| `item-label` | `data-at-min` | ''（条件成立时才出现） |
| `item-label` | `data-disabled` | ''（条件成立时才出现） |
| `item-label` | `data-index` | String(item.index) |
| `item-label` | `data-invalid` | ''（条件成立时才出现） |
| `item-label` | `data-readonly` | ''（条件成立时才出现） |
| `item-content` | `data-at-max` | ''（条件成立时才出现） |
| `item-content` | `data-at-min` | ''（条件成立时才出现） |
| `item-content` | `data-disabled` | ''（条件成立时才出现） |
| `item-content` | `data-index` | String(item.index) |
| `item-content` | `data-invalid` | ''（条件成立时才出现） |
| `item-content` | `data-readonly` | ''（条件成立时才出现） |
| `item-action` | `data-at-max` | ''（条件成立时才出现） |
| `item-action` | `data-at-min` | ''（条件成立时才出现） |
| `item-action` | `data-disabled` | ''（条件成立时才出现） |
| `item-action` | `data-index` | String(item.index) |
| `item-action` | `data-invalid` | ''（条件成立时才出现） |
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
| `item-delete-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-readonly` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-xh-action-control` | '' |
| `item-delete-trigger` | `data-xh-action-display` | 'always' |
| `item-delete-trigger` | `data-xh-action-profile` | 'icon' |
| `item-delete-trigger` | `data-xh-action-size` | 'xs' |
| `item-delete-trigger` | `data-xh-action-variant` | 'ghost' |
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
| `--xh-field-array-add-bg` | `add-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | field-array 的 add-trigger 部件 background-color 覆盖槽。 |
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
| `--xh-field-array-content-gap` | `item-content` | `gap` | `default` | `--xh-space-2` | field-array 的 item-content 部件 gap 覆盖槽。 |
| `--xh-field-array-gap` | `root` | `gap` | `default` | `--xh-space-2` | field-array 的 root 部件 gap 覆盖槽。 |
| `--xh-field-array-icon-size` | `add-trigger`<br>`item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | field-array 的 add-trigger、item-delete-trigger、move-down-trigger、move-up-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-field-array-item-delete-fg-hover` | `item-delete-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-danger-hover` | field-array 的 item-delete-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-item-gap` | `item` | `gap` | `default` | `--xh-space-2` | field-array 的 item 部件 gap 覆盖槽。 |
| `--xh-field-array-item-label-fg` | `item-label` | `color` | `default` | `--xh-fg-muted` | field-array 的 item-label 部件 color 覆盖槽。 |
| `--xh-field-array-item-label-font-size` | `item-label` | `font-size` | `default` | `--xh-text-secondary-size` | field-array 的 item-label 部件 font-size 覆盖槽。 |
| `--xh-field-array-item-padding` | `item` | `padding` | `default` | `--xh-space-0` | field-array 的 item 部件 padding 覆盖槽。 |
| `--xh-field-array-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-surface` | field-array 的 item 部件 border-radius 覆盖槽。 |
| `--xh-field-array-trigger-bg` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 background-color 覆盖槽。 |
| `--xh-field-array-trigger-bg-active` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 background-color 覆盖槽。 |
| `--xh-field-array-trigger-bg-hover` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 background-color 覆盖槽。 |
| `--xh-field-array-trigger-fg` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `color` | `default` | `--xh-fg-muted` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-trigger-fg-hover` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-trigger-font-size` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 font-size 覆盖槽。 |
| `--xh-field-array-trigger-radius` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `border-radius` | `default` | `--xh-shape-control` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 border-radius 覆盖槽。 |
| `--xh-field-array-trigger-size` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
