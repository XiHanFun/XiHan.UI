来源：https://ui.docs.xihanfun.com/components/tags-input

# 标签输入 `tags-input`

在一个输入框里录入一串标签：回车或分隔符成词，每个词是一枚可删的标签。

## 何时使用

- 关键词、收件人、技能这类数量不定的短词集合。
- 需要粘贴一整串自动拆分。

## 何时不用

- 值来自固定清单：用[选择器](./select)的多选。
- 需要从候选里检索着选：用[组合框](./combobox)的多选。

## 特性

- `delimiter` 与 `addOnPaste` 一起处理粘贴拆分。
- `editable` 让已有标签双击就地改。
- `max` 与 `allowOverflow` 一对：超出上限是拒收还是标红。
- 标签的值可以是对象，不必是字符串。
- `showCount` 显出计数部件，数字取 `count` 与 `max`，顶到上限与越界各换一档颜色。
- `required` 经 `aria-required` 上报必填。

## 示例

### 基础用法

框里打字按 Enter 落一个标签；标签由作者按当前值渲染，每个标签自带 value 标识身份

```vue
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const tags = ref<string[]>(["Vue", "TypeScript"]);
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value }"
    v-model:value="tags"
    placeholder="回车落一个"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>技术栈</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
  </XhTagsInputRoot>
  <p>当前：{{ tags.length ? tags.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tags-input
  id="tags-input-basic"
  value="Vue,TypeScript"
  placeholder="回车落一个"
  style="max-inline-size: 420px"
>
  <div data-xh-part="root">
    <label data-xh-part="label">技术栈</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="Vue">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">Vue</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
      </div>
      <div data-xh-part="item" value="TypeScript">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">TypeScript</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
      </div>
      <input data-xh-part="input" />
    </div>
  </div>
</xh-tags-input>
<p>当前：<span id="tags-input-basic-value">Vue、TypeScript</span></p>

<script type="module">
  const root = document.getElementById("tags-input-basic");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const readout = document.getElementById("tags-input-basic-value");

  // 一个标签一个节点：外壳带 value 标识身份，里面是文本与删除按钮
  function createTag(value) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const preview = document.createElement("div");
    preview.dataset.xhPart = "item-preview";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = value;
    const remove = document.createElement("button");
    remove.dataset.xhPart = "item-delete-trigger";
    preview.append(text, remove);
    item.append(preview);
    return item;
  }

  // 按当前值增删标签节点，已经在的那份原地留着
  function renderTags(values) {
    const alive = new Map();
    for (const el of control.querySelectorAll('[data-xh-part="item"]')) {
      alive.set(el.getAttribute("value"), el);
    }
    for (const [value, el] of alive) {
      if (!values.includes(value)) el.remove();
    }
    for (const value of values) {
      if (!alive.has(value)) control.insertBefore(createTag(value), input);
    }
  }

  root.addEventListener("value-change", (event) => {
    root.value = event.detail.value;
    renderTags(event.detail.value);
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 上限与粘贴拆分

add-on-paste 让粘进来的一串按分隔符拆成多个标签；顶到 max 后再打再粘都进不去

```vue
<script setup lang="ts">
import {
  XhTagsInputClearTrigger,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const tags = ref<string[]>(["Vue"]);
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value, count, atMax }"
    v-model:value="tags"
    :max="4"
    add-on-paste
    delimiter=","
    placeholder="试试粘贴 React,Svelte,Solid"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>技术栈（最多 4 个）</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
      <XhTagsInputClearTrigger />
    </XhTagsInputControl>
    <span>{{ count }} / 4{{ atMax ? " · 已到上限" : "" }}</span>
  </XhTagsInputRoot>
</template>
```

```html
<xh-tags-input
  id="tags-input-max"
  value="Vue"
  max="4"
  add-on-paste
  delimiter=","
  placeholder="试试粘贴 React,Svelte,Solid"
  style="max-inline-size: 420px"
>
  <div data-xh-part="root">
    <label data-xh-part="label">技术栈（最多 4 个）</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="Vue">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">Vue</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
      </div>
      <input data-xh-part="input" />
      <button data-xh-part="clear-trigger"></button>
    </div>
    <span id="tags-input-max-count">1 / 4</span>
  </div>
</xh-tags-input>

<script type="module">
  const root = document.getElementById("tags-input-max");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const count = document.getElementById("tags-input-max-count");

  // 一个标签一个节点：外壳带 value 标识身份，里面是文本与删除按钮
  function createTag(value) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const preview = document.createElement("div");
    preview.dataset.xhPart = "item-preview";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = value;
    const remove = document.createElement("button");
    remove.dataset.xhPart = "item-delete-trigger";
    preview.append(text, remove);
    item.append(preview);
    return item;
  }

  // 按当前值增删标签节点，已经在的那份原地留着
  function renderTags(values) {
    const alive = new Map();
    for (const el of control.querySelectorAll('[data-xh-part="item"]')) {
      alive.set(el.getAttribute("value"), el);
    }
    for (const [value, el] of alive) {
      if (!values.includes(value)) el.remove();
    }
    for (const value of values) {
      if (!alive.has(value)) control.insertBefore(createTag(value), input);
    }
  }

  root.addEventListener("value-change", (event) => {
    const values = event.detail.value;
    root.value = values;
    renderTags(values);
    count.textContent = `${values.length} / 4${values.length >= 4 ? " · 已到上限" : ""}`;
  });
</script>
```

### 就地编辑

editable 打开后双击任一标签改写它：Enter 提交、Escape 撤销，改成空白等于删掉这个标签

```vue
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemInput,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const tags = ref<string[]>(["前端", "组件库", "无障碍"]);
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value }"
    v-model:value="tags"
    editable
    placeholder="回车落一个"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>标签</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
        <!-- 编辑框常挂不卸载，不编辑时由组件收起 -->
        <XhTagsInputItemInput />
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
  </XhTagsInputRoot>
  <p>当前：{{ tags.length ? tags.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tags-input
  id="tags-input-editable"
  value="前端,组件库,无障碍"
  editable
  placeholder="回车落一个"
  style="max-inline-size: 420px"
>
  <div data-xh-part="root">
    <label data-xh-part="label">标签</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="前端">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">前端</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
        <!-- 编辑框常挂不卸载，不编辑时由组件收起 -->
        <input data-xh-part="item-input" />
      </div>
      <div data-xh-part="item" value="组件库">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">组件库</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
        <input data-xh-part="item-input" />
      </div>
      <div data-xh-part="item" value="无障碍">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">无障碍</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
        <input data-xh-part="item-input" />
      </div>
      <input data-xh-part="input" />
    </div>
  </div>
</xh-tags-input>
<p>当前：<span id="tags-input-editable-value">前端、组件库、无障碍</span></p>

<script type="module">
  const root = document.getElementById("tags-input-editable");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const readout = document.getElementById("tags-input-editable-value");

  // 一个标签一个节点：预览与就地编辑框两套都挂上
  function createTag(value) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const preview = document.createElement("div");
    preview.dataset.xhPart = "item-preview";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = value;
    const remove = document.createElement("button");
    remove.dataset.xhPart = "item-delete-trigger";
    preview.append(text, remove);
    const edit = document.createElement("input");
    edit.dataset.xhPart = "item-input";
    item.append(preview, edit);
    return item;
  }

  // 按当前值增删标签节点，已经在的那份原地留着
  function renderTags(values) {
    const alive = new Map();
    for (const el of control.querySelectorAll('[data-xh-part="item"]')) {
      alive.set(el.getAttribute("value"), el);
    }
    for (const [value, el] of alive) {
      if (!values.includes(value)) el.remove();
    }
    for (const value of values) {
      if (!alive.has(value)) control.insertBefore(createTag(value), input);
    }
  }

  root.addEventListener("value-change", (event) => {
    root.value = event.detail.value;
    renderTags(event.detail.value);
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 禁用与只读

disabled 整个控件退出 Tab 序列；read-only 仍可聚焦浏览，但加不进也删不掉

```vue
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
    <XhTagsInputRoot v-slot="{ value }" :default-value="['Vue', 'Vite']" disabled>
      <XhTagsInputLabel>禁用</XhTagsInputLabel>
      <XhTagsInputControl>
        <XhTagsInputItem v-for="t in value" :key="t" :value="t">
          <XhTagsInputItemPreview>
            <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
            <XhTagsInputItemDeleteTrigger />
          </XhTagsInputItemPreview>
        </XhTagsInputItem>
        <XhTagsInputInput />
      </XhTagsInputControl>
    </XhTagsInputRoot>

    <XhTagsInputRoot v-slot="{ value }" :default-value="['Vue', 'Vite']" read-only>
      <XhTagsInputLabel>只读</XhTagsInputLabel>
      <XhTagsInputControl>
        <XhTagsInputItem v-for="t in value" :key="t" :value="t">
          <XhTagsInputItemPreview>
            <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
            <XhTagsInputItemDeleteTrigger />
          </XhTagsInputItemPreview>
        </XhTagsInputItem>
        <XhTagsInputInput />
      </XhTagsInputControl>
    </XhTagsInputRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
  <xh-tags-input default-value="Vue,Vite" disabled>
    <div data-xh-part="root">
      <label data-xh-part="label">禁用</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="Vite">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vite</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input default-value="Vue,Vite" read-only>
    <div data-xh-part="root">
      <label data-xh-part="label">只读</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="Vite">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vite</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>
</div>
```

### 形态

variant 只改控件与胶囊的颜色槽位，落标签与删标签的行为三档一致

```vue
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
    <XhTagsInputRoot
      v-for="v in variants"
      :key="v"
      v-slot="{ value }"
      :variant="v"
      :default-value="['Vue', 'TypeScript']"
      placeholder="回车落一个"
    >
      <XhTagsInputLabel>{{ v }}</XhTagsInputLabel>
      <XhTagsInputControl>
        <XhTagsInputItem v-for="t in value" :key="t" :value="t">
          <XhTagsInputItemPreview>
            <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
            <XhTagsInputItemDeleteTrigger />
          </XhTagsInputItemPreview>
        </XhTagsInputItem>
        <XhTagsInputInput />
      </XhTagsInputControl>
    </XhTagsInputRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
  <xh-tags-input
    variant="outline"
    default-value="Vue,TypeScript"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    variant="subtle"
    default-value="Vue,TypeScript"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    variant="ghost"
    default-value="Vue,TypeScript"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>
</div>
```

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别

```vue
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr))">
    <XhTagsInputRoot
      v-for="t in tones"
      :key="t"
      v-slot="{ value }"
      variant="outline"
      :tone="t"
      :default-value="['标签']"
      placeholder="回车落一个"
    >
      <XhTagsInputLabel>{{ t }}</XhTagsInputLabel>
      <XhTagsInputControl>
        <XhTagsInputItem v-for="v in value" :key="v" :value="v">
          <XhTagsInputItemPreview>
            <XhTagsInputItemText>{{ v }}</XhTagsInputItemText>
            <XhTagsInputItemDeleteTrigger />
          </XhTagsInputItemPreview>
        </XhTagsInputItem>
        <XhTagsInputInput />
      </XhTagsInputControl>
    </XhTagsInputRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr))">
  <xh-tags-input
    variant="outline"
    tone="brand"
    default-value="标签"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">brand</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="标签">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">标签</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    variant="outline"
    tone="neutral"
    default-value="标签"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">neutral</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="标签">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">标签</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    variant="outline"
    tone="success"
    default-value="标签"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">success</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="标签">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">标签</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    variant="outline"
    tone="warning"
    default-value="标签"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">warning</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="标签">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">标签</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    variant="outline"
    tone="danger"
    default-value="标签"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">danger</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="标签">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">标签</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    variant="outline"
    tone="info"
    default-value="标签"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">info</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="标签">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">标签</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>
</div>
```

### 尺寸

控件高度、胶囊与输入文字一起换档，不传 size 即默认档

```vue
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
    <XhTagsInputRoot
      v-for="s in sizes"
      :key="s.label"
      v-slot="{ value }"
      :size="s.size"
      :default-value="['Vue', 'TypeScript']"
      placeholder="回车落一个"
    >
      <XhTagsInputLabel>{{ s.label }}</XhTagsInputLabel>
      <XhTagsInputControl>
        <XhTagsInputItem v-for="t in value" :key="t" :value="t">
          <XhTagsInputItemPreview>
            <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
            <XhTagsInputItemDeleteTrigger />
          </XhTagsInputItemPreview>
        </XhTagsInputItem>
        <XhTagsInputInput />
      </XhTagsInputControl>
    </XhTagsInputRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
  <xh-tags-input
    size="sm"
    default-value="Vue,TypeScript"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">小</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    default-value="Vue,TypeScript"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">默认</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    size="lg"
    default-value="Vue,TypeScript"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">大</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>
</div>
```

### 随表单提交

写了 name 与 hidden-input 才参与提交，整份标签按断词符拼成一串；框里没内容时回车留给表单

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTagsInputControl,
  XhTagsInputHiddenInput,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const tags = ref<string[]>(["Vue", "TypeScript"]);
const submitted = ref("");

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement);
  submitted.value = String(data.get("skills") ?? "");
}
</script>

<template>
  <form
    style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 420px"
    @submit.prevent="onSubmit"
  >
    <XhTagsInputRoot
      v-slot="{ value }"
      v-model:value="tags"
      name="skills"
      delimiter=","
      placeholder="回车落一个"
    >
      <XhTagsInputLabel>技术栈</XhTagsInputLabel>
      <XhTagsInputControl>
        <XhTagsInputItem v-for="t in value" :key="t" :value="t">
          <XhTagsInputItemPreview>
            <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
            <XhTagsInputItemDeleteTrigger />
          </XhTagsInputItemPreview>
        </XhTagsInputItem>
        <XhTagsInputInput />
      </XhTagsInputControl>
      <XhTagsInputHiddenInput />
    </XhTagsInputRoot>
    <XhButton type="submit" variant="outline" style="align-self: start">提交</XhButton>
    <span>表单收到：{{ submitted || "（还没提交）" }}</span>
  </form>
</template>
```

```html
<form
  id="tags-input-form"
  style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 420px"
>
  <xh-tags-input
    id="tags-input-form-tags"
    value="Vue,TypeScript"
    name="skills"
    delimiter=","
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">技术栈</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-tags-input>
  <xh-button type="submit" variant="outline" style="align-self: start">
    <button data-xh-part="root">提交</button>
  </xh-button>
  <span>表单收到：<span id="tags-input-form-result">（还没提交）</span></span>
</form>

<script type="module">
  const form = document.getElementById("tags-input-form");
  const root = document.getElementById("tags-input-form-tags");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const result = document.getElementById("tags-input-form-result");

  // 一个标签一个节点：外壳带 value 标识身份，里面是文本与删除按钮
  function createTag(value) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const preview = document.createElement("div");
    preview.dataset.xhPart = "item-preview";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = value;
    const remove = document.createElement("button");
    remove.dataset.xhPart = "item-delete-trigger";
    preview.append(text, remove);
    item.append(preview);
    return item;
  }

  // 按当前值增删标签节点，已经在的那份原地留着
  function renderTags(values) {
    const alive = new Map();
    for (const el of control.querySelectorAll('[data-xh-part="item"]')) {
      alive.set(el.getAttribute("value"), el);
    }
    for (const [value, el] of alive) {
      if (!values.includes(value)) el.remove();
    }
    for (const value of values) {
      if (!alive.has(value)) control.insertBefore(createTag(value), input);
    }
  }

  root.addEventListener("value-change", (event) => {
    root.value = event.detail.value;
    renderTags(event.detail.value);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    result.textContent = String(new FormData(form).get("skills") ?? "");
  });
</script>
```

### 入库前统一改写

给了 value 就由宿主说了算：组件只发变更意图，写回什么形状在这里定

```vue
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const tags = ref<string[]>(["#vue"]);

// 统一成小写并补上井号，重复的那一份丢掉
function onValueChange(details: { value: string[] }) {
  const next: string[] = [];
  for (const raw of details.value) {
    const tag = raw.trim().toLowerCase();
    const normalized = tag.startsWith("#") ? tag : `#${tag}`;
    if (normalized !== "#" && !next.includes(normalized)) {
      next.push(normalized);
    }
  }
  tags.value = next;
}
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value }"
    :value="tags"
    placeholder="打 Vue 回车，落进去的是 #vue"
    style="max-inline-size: 420px"
    @value-change="onValueChange"
  >
    <XhTagsInputLabel>话题</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
  </XhTagsInputRoot>
  <p>当前：{{ tags.length ? tags.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tags-input
  id="tags-input-normalize"
  value="#vue"
  placeholder="打 Vue 回车，落进去的是 #vue"
  style="max-inline-size: 420px"
>
  <div data-xh-part="root">
    <label data-xh-part="label">话题</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="#vue">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">#vue</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
      </div>
      <input data-xh-part="input" />
    </div>
  </div>
</xh-tags-input>
<p>当前：<span id="tags-input-normalize-value">#vue</span></p>

<script type="module">
  const root = document.getElementById("tags-input-normalize");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const readout = document.getElementById("tags-input-normalize-value");

  // 一个标签一个节点：外壳带 value 标识身份，里面是文本与删除按钮
  function createTag(value) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const preview = document.createElement("div");
    preview.dataset.xhPart = "item-preview";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = value;
    const remove = document.createElement("button");
    remove.dataset.xhPart = "item-delete-trigger";
    preview.append(text, remove);
    item.append(preview);
    return item;
  }

  // 按当前值增删标签节点，已经在的那份原地留着
  function renderTags(values) {
    const alive = new Map();
    for (const el of control.querySelectorAll('[data-xh-part="item"]')) {
      alive.set(el.getAttribute("value"), el);
    }
    for (const [value, el] of alive) {
      if (!values.includes(value)) el.remove();
    }
    for (const value of values) {
      if (!alive.has(value)) control.insertBefore(createTag(value), input);
    }
  }

  // 统一成小写并补上井号，重复的那一份丢掉
  root.addEventListener("value-change", (event) => {
    const next = [];
    for (const raw of event.detail.value) {
      const tag = raw.trim().toLowerCase();
      const normalized = tag.startsWith("#") ? tag : `#${tag}`;
      if (normalized !== "#" && !next.includes(normalized)) {
        next.push(normalized);
      }
    }
    root.value = next;
    renderTags(next);
    readout.textContent = next.join("、") || "（无）";
  });
</script>
```

### 候选词一键添加

根插槽给出 addValue 与 atMax：输入框之外再开一条加标签的路，上限一样管得住

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const suggestions = ["文档", "无障碍", "设计令牌", "组件库"];
const tags = ref<string[]>(["文档"]);
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value, addValue, atMax }"
    v-model:value="tags"
    :max="3"
    placeholder="回车落一个"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>话题（最多 3 个）</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton
        v-for="s in suggestions"
        :key="s"
        size="sm"
        variant="outline"
        :disabled="atMax || value.includes(s)"
        @click="addValue(s)"
      >
        {{ s }}
      </XhButton>
    </div>
  </XhTagsInputRoot>
</template>
```

```html
<xh-tags-input
  id="tags-input-suggest"
  value="文档"
  max="3"
  placeholder="回车落一个"
  style="max-inline-size: 420px"
>
  <div data-xh-part="root">
    <label data-xh-part="label">话题（最多 3 个）</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="文档">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">文档</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
      </div>
      <input data-xh-part="input" />
    </div>
  </div>
</xh-tags-input>

<!-- 输入框之外的那条路：一排候选钮，点一下就落一个标签 -->
<div id="tags-input-suggest-picks" style="display: flex; flex-wrap: wrap; gap: 8px"></div>

<script type="module">
  const host = document.getElementById("tags-input-suggest");
  const shell = host.querySelector('[data-xh-part="root"]');
  const control = host.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const picks = document.getElementById("tags-input-suggest-picks");

  const SUGGESTIONS = ["文档", "无障碍", "设计令牌", "组件库"];
  let values = ["文档"];

  // 一个标签一个节点：外壳带 value 标识身份，里面是文本与删除按钮
  function createTag(value) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const preview = document.createElement("div");
    preview.dataset.xhPart = "item-preview";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = value;
    const remove = document.createElement("button");
    remove.dataset.xhPart = "item-delete-trigger";
    preview.append(text, remove);
    item.append(preview);
    return item;
  }

  // 按当前值增删标签节点，已经在的那份原地留着
  function renderTags(next) {
    const alive = new Map();
    for (const el of control.querySelectorAll('[data-xh-part="item"]')) {
      alive.set(el.getAttribute("value"), el);
    }
    for (const [value, el] of alive) {
      if (!next.includes(value)) el.remove();
    }
    for (const value of next) {
      if (!alive.has(value)) control.insertBefore(createTag(value), input);
    }
  }

  // 禁用写在 xh-button 上而不是里面那颗原生按钮上：原生 disabled 归元素自己打
  const picked = SUGGESTIONS.map((suggestion) => {
    const wrapper = document.createElement("xh-button");
    wrapper.setAttribute("size", "sm");
    wrapper.setAttribute("variant", "outline");
    const button = document.createElement("button");
    button.dataset.xhPart = "root";
    button.textContent = suggestion;
    wrapper.append(button);
    wrapper.addEventListener("click", () => {
      values = [...values, suggestion];
      host.value = values;
      renderTags(values);
      paintPicks();
    });
    picks.append(wrapper);
    return { suggestion, wrapper };
  });

  // 顶到上限这件事由组件报在 root 的 data-at-max 上，候选钮照它一起关掉
  function paintPicks() {
    const atMax = shell.hasAttribute("data-at-max");
    for (const { suggestion, wrapper } of picked) {
      wrapper.disabled = atMax || values.includes(suggestion);
    }
  }

  host.addEventListener("value-change", (event) => {
    values = event.detail.value;
    host.value = values;
    renderTags(values);
    paintPicks();
  });

  // data-at-max 是接线之后才落到 DOM 上的，写完值等它变了再刷一遍
  new MutationObserver(paintPicks).observe(shell, {
    attributes: true,
    attributeFilter: ["data-at-max"],
  });
  paintPicks();
</script>
```

### 外部触发的输入会话

输入部件平时收起，按「添加」才露面并聚焦；打字时给候选，选中即落标签，失焦按 blur-behavior 收尾

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
import { nextTick, ref } from "vue";

const domains = ["@qq.com", "@163.com", "@gmail.com"];

const mails = ref<string[]>(["hi@xihan.dev"]);
const typing = ref(false);
const input = ref<InstanceType<typeof XhTagsInputInput> | null>(null);

// 输入框由外部按钮开合，露面后焦点要自己送进去
function start() {
  typing.value = true;
  nextTick(() => {
    (input.value?.$el as HTMLInputElement | undefined)?.focus();
  });
}

// 候选：拿已经打出来的前缀拼几个完整地址
function options(text: string): string[] {
  const prefix = text.split("@")[0] ?? "";
  return prefix ? domains.map(domain => prefix + domain) : [];
}
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value, inputValue, addValue, setInputValue, atMax }"
    v-model:value="mails"
    :max="4"
    blur-behavior="add"
    placeholder="打前缀选后缀"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>通知邮箱（最多 4 个）</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput v-if="typing" ref="input" @blur="typing = false" />
      <XhButton
        v-else
        size="sm"
        variant="outline"
        :disabled="atMax"
        @click="start"
      >
        ＋ 添加
      </XhButton>
    </XhTagsInputControl>

    <!-- 候选面板是作者自己的节点：按下不放焦点，点完把框里的半截文本清掉 -->
    <div
      v-if="typing && options(inputValue).length"
      style="
        display: flex;
        flex-direction: column;
        margin-block-start: 4px;
        border: 1px solid var(--xh-border-subtle);
        border-radius: var(--xh-radius-md);
        overflow: hidden;
      "
    >
      <button
        v-for="opt in options(inputValue)"
        :key="opt"
        type="button"
        style="
          padding: 6px 10px;
          border: 0;
          background: none;
          color: var(--xh-fg-default);
          font: inherit;
          text-align: start;
          cursor: pointer;
        "
        @mousedown.prevent
        @click="
          addValue(opt);
          setInputValue('');
        "
      >
        {{ opt }}
      </button>
    </div>
  </XhTagsInputRoot>
</template>
```

```html
<xh-tags-input
  id="tags-input-custom"
  value="hi@xihan.dev"
  max="4"
  blur-behavior="add"
  placeholder="打前缀选后缀"
  style="max-inline-size: 420px"
>
  <div data-xh-part="root">
    <label data-xh-part="label">通知邮箱（最多 4 个）</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="hi@xihan.dev">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">hi@xihan.dev</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
      </div>
      <!-- 输入框常驻文档，平时用内联 display 收起 -->
      <input data-xh-part="input" style="display: none" />
      <xh-button id="tags-input-custom-start" size="sm" variant="outline">
        <button data-xh-part="root">＋ 添加</button>
      </xh-button>
    </div>

    <!-- 候选面板是作者自己的节点：按下不放焦点，点完把框里的半截文本清掉 -->
    <div
      id="tags-input-custom-options"
      style="
        display: none;
        flex-direction: column;
        margin-block-start: 4px;
        border: 1px solid var(--xh-border-subtle);
        border-radius: var(--xh-radius-md);
        overflow: hidden;
      "
    ></div>
  </div>
</xh-tags-input>

<script type="module">
  const host = document.getElementById("tags-input-custom");
  const shell = host.querySelector('[data-xh-part="root"]');
  const control = host.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const start = document.getElementById("tags-input-custom-start");
  const panel = document.getElementById("tags-input-custom-options");

  const DOMAINS = ["@qq.com", "@163.com", "@gmail.com"];

  let values = ["hi@xihan.dev"];
  let inputValue = "";
  let typing = false;

  // 输入文本也交给宿主持有：加完标签要把框里的半截文本清掉
  host.inputValue = inputValue;

  // 一个标签一个节点：外壳带 value 标识身份，里面是文本与删除按钮
  function createTag(value) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const preview = document.createElement("div");
    preview.dataset.xhPart = "item-preview";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = value;
    const remove = document.createElement("button");
    remove.dataset.xhPart = "item-delete-trigger";
    preview.append(text, remove);
    item.append(preview);
    return item;
  }

  // 按当前值增删标签节点，已经在的那份原地留着
  function renderTags(next) {
    const alive = new Map();
    for (const el of control.querySelectorAll('[data-xh-part="item"]')) {
      alive.set(el.getAttribute("value"), el);
    }
    for (const [value, el] of alive) {
      if (!next.includes(value)) el.remove();
    }
    for (const value of next) {
      if (!alive.has(value)) control.insertBefore(createTag(value), input);
    }
  }

  // 候选：拿已经打出来的前缀拼几个完整地址
  function options(text) {
    const prefix = text.split("@")[0] ?? "";
    return prefix ? DOMAINS.map((domain) => prefix + domain) : [];
  }

  function pick(value) {
    values = [...values, value];
    host.value = values;
    inputValue = "";
    host.inputValue = inputValue;
    renderTags(values);
    paint();
  }

  function paint() {
    input.style.display = typing ? "" : "none";
    start.style.display = typing ? "none" : "";
    // 禁用写在 xh-button 上而不是里面那颗原生按钮上：原生 disabled 归元素自己打
    start.disabled = shell.hasAttribute("data-at-max");

    const list = typing ? options(inputValue) : [];
    panel.style.display = list.length > 0 ? "flex" : "none";
    panel.replaceChildren(
      ...list.map((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = option;
        button.style.cssText =
          "padding: 6px 10px; border: 0; background: none; color: var(--xh-fg-default); font: inherit; text-align: start; cursor: pointer;";
        // 按下不夺走焦点，输入框才不会在点中候选之前先失焦
        button.addEventListener("mousedown", (event) => event.preventDefault());
        button.addEventListener("click", () => pick(option));
        return button;
      }),
    );
  }

  // 输入框由外面这颗按钮开合，露面之后焦点要自己送进去
  start.addEventListener("click", () => {
    typing = true;
    paint();
    input.focus();
  });

  input.addEventListener("blur", () => {
    typing = false;
    paint();
  });

  host.addEventListener("input-value-change", (event) => {
    inputValue = event.detail.inputValue;
    host.inputValue = inputValue;
    paint();
  });

  host.addEventListener("value-change", (event) => {
    values = event.detail.value;
    host.value = values;
    renderTags(values);
    paint();
  });

  new MutationObserver(paint).observe(shell, {
    attributes: true,
    attributeFilter: ["data-at-max"],
  });
  paint();
</script>
```

### 标签用对象

组件里存的是标识那一份，显示哪一份由作者定：条目文本渲染 label，提交仍按标识拼串

```vue
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputHiddenInput,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Option {
  value: string;
  label: string;
}

// 显示名与标识的对照表由宿主自己拿着，组件只认标识
const options = ref<Option[]>([
  { value: "u-1", label: "张三" },
  { value: "u-2", label: "李四" },
  { value: "u-3", label: "王五" },
]);

const value = ref<string[]>(["u-1"]);
let seq = 0;

function labelOf(id: string): string {
  return options.value.find(option => option.value === id)?.label ?? id;
}

// 组件报回来的是框里打的那串文本：同名的换成它的标识，没见过的现造一条对照
function onValueChange(details: { value: string[] }) {
  const next: string[] = [];
  for (const raw of details.value) {
    const known
      = options.value.find(option => option.value === raw)
        ?? options.value.find(option => option.label === raw);
    if (known) {
      if (!next.includes(known.value)) {
        next.push(known.value);
      }
      continue;
    }
    seq += 1;
    const created = { value: `u-new-${seq}`, label: raw };
    options.value = [...options.value, created];
    next.push(created.value);
  }
  value.value = next;
}
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value: tags }"
    :value="value"
    name="reviewers"
    placeholder="打名字回车"
    style="max-inline-size: 420px"
    @value-change="onValueChange"
  >
    <XhTagsInputLabel>评审人</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in tags" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ labelOf(t) }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
    <XhTagsInputHiddenInput />
  </XhTagsInputRoot>
  <p>提交出去的是标识：{{ value.join(",") || "（无）" }}</p>
  <p>框里看到的是名字：{{ value.map(labelOf).join("、") || "（无）" }}</p>
</template>
```

```html
<xh-tags-input
  id="tags-input-option"
  value="u-1"
  name="reviewers"
  placeholder="打名字回车"
  style="max-inline-size: 420px"
>
  <div data-xh-part="root">
    <label data-xh-part="label">评审人</label>
    <div data-xh-part="control">
      <div data-xh-part="item" value="u-1">
        <div data-xh-part="item-preview">
          <span data-xh-part="item-text">张三</span>
          <button data-xh-part="item-delete-trigger"></button>
        </div>
      </div>
      <input data-xh-part="input" />
    </div>
    <input data-xh-part="hidden-input" />
  </div>
</xh-tags-input>
<p>提交出去的是标识：<span id="tags-input-option-ids">u-1</span></p>
<p>框里看到的是名字：<span id="tags-input-option-labels">张三</span></p>

<script type="module">
  const root = document.getElementById("tags-input-option");
  const control = root.querySelector('[data-xh-part="control"]');
  const input = control.querySelector('[data-xh-part="input"]');
  const idsOut = document.getElementById("tags-input-option-ids");
  const labelsOut = document.getElementById("tags-input-option-labels");

  // 显示名与标识的对照表由宿主自己拿着，组件只认标识
  let options = [
    { value: "u-1", label: "张三" },
    { value: "u-2", label: "李四" },
    { value: "u-3", label: "王五" },
  ];
  let seq = 0;

  function labelOf(id) {
    return options.find((option) => option.value === id)?.label ?? id;
  }

  // 标签节点渲染显示名，节点上的 value 仍是标识
  function createTag(value) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const preview = document.createElement("div");
    preview.dataset.xhPart = "item-preview";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = labelOf(value);
    const remove = document.createElement("button");
    remove.dataset.xhPart = "item-delete-trigger";
    preview.append(text, remove);
    item.append(preview);
    return item;
  }

  // 按当前值增删标签节点，已经在的那份原地留着
  function renderTags(values) {
    const alive = new Map();
    for (const el of control.querySelectorAll('[data-xh-part="item"]')) {
      alive.set(el.getAttribute("value"), el);
    }
    for (const [value, el] of alive) {
      if (!values.includes(value)) el.remove();
    }
    for (const value of values) {
      if (!alive.has(value)) control.insertBefore(createTag(value), input);
    }
  }

  // 组件报回来的是框里打的那串文本：同名的换成它的标识，没见过的现造一条对照
  root.addEventListener("value-change", (event) => {
    const next = [];
    for (const raw of event.detail.value) {
      const known =
        options.find((option) => option.value === raw) ??
        options.find((option) => option.label === raw);
      if (known) {
        if (!next.includes(known.value)) next.push(known.value);
        continue;
      }
      seq += 1;
      const created = { value: `u-new-${seq}`, label: raw };
      options = [...options, created];
      next.push(created.value);
    }
    root.value = next;
    renderTags(next);
    idsOut.textContent = next.join(",") || "（无）";
    labelsOut.textContent = next.map(labelOf).join("、") || "（无）";
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tags-input>` |
| Vue 组件 | `XhTagsInputClearTrigger` `XhTagsInputControl` `XhTagsInputCount` `XhTagsInputHiddenInput` `XhTagsInputInput` `XhTagsInputItem` `XhTagsInputItemDeleteTrigger` `XhTagsInputItemInput` `XhTagsInputItemPreview` `XhTagsInputItemText` `XhTagsInputLabel` `XhTagsInputRoot` |
| 组合式函数 | `useTagsInput` |
| 状态机 | `tagsInputMachine` |
| 皮肤 | `@xihan-ui/styles/tags-input.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tags-input"`：**`root`** · `label` · **`control`** · **`input`** · `item` · `item-preview` · `item-text` · `item-delete-trigger` · `item-input` · `clear-trigger` · `count` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 受控标签集合；给了就由宿主说了算，机器不自改，只发 onValueChange。 |
| `defaultValue` | `string[]` |  | 非受控初始标签集合。 |
| `inputValue` | `string` |  | 受控输入文本；与 value 各自独立受控。 |
| `defaultInputValue` | `string` |  | 非受控初始输入文本。 |
| `max` | `number` |  | 最多几个标签。缺省不限；写 0 表示一个也不许加。 |
| `allowOverflow` | `boolean` |  | 允许越过 max。 关（默认）：顶到上限后这一次输入整体不生效，文本原样留在框里，绝不悄悄吞掉。 开：照加不误，只在 root / control 上打出 data-overflowing 供样式与提示使用。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  | 必填标注：经 aria-required 上报，星号由外面的字段壳画。 |
| `invalid` | `boolean` |  |  |
| `showCount` | `boolean` |  | 显出计数部件：关掉时 count 部件带 hidden 收起。 |
| `name` | `string` |  | 表单字段名；给了 hidden-input 才带 name，此时整份标签按 delimiter 拼成一串提交。 |
| `placeholder` | `string` |  |  |
| `delimiter` | `string` |  | 断词符，默认逗号。打字打出它即断词成标签，粘贴时也按它拆。 显式给空串即关掉断词：此时只有 Enter 能把文本变成标签。 |
| `addOnPaste` | `boolean` |  | 粘贴时接管：按 delimiter 拆成多个标签。默认关（交给浏览器照常粘进框里）。 |
| `editable` | `boolean` |  | 允许双击标签就地改。默认关。 |
| `blurBehavior` | `TagsInputBlurBehavior \| null` |  | 焦点离开整个组件时怎么处置输入框里的残留文本。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定颜色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<TagsInputTranslations>` |  |  |
| `onValueChange` | `(details: TagsInputValueChangeDetails) => void` |  |  |
| `onInputValueChange` | `(details: TagsInputInputValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TagsInputValueChangeDetails` | 标签集合变化；detail 为 `{ value: string[] }` |
| `input-value-change` | `TagsInputInputValueChangeDetails` | 输入文本变化；detail 为 `{ inputValue: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTagsInputCount` | `default` | `TagsInputCountSlotProps` |  |
| `XhTagsInputRoot` | `default` | `TagsInputRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `navigating` · `editing`

**事件**：`VALUE.SET` · `TAG.ADD` · `VALUE.CLEAR` · `INPUT.CHANGE` · `INPUT.COMMIT` · `INPUT.BLUR` · `TAG.HIGHLIGHT` · `TAG.DELETE` · `TAG.EDIT` · `EDIT.CHANGE` · `EDIT.SUBMIT` · `EDIT.CANCEL` · `ITEM.FOCUS_LOST` · `FORM.RESET`

**判据**：`canEdit` · `canEditTag` · `canDeleteWithPrev` · `hasHighlightTarget`

## connect API

`useTagsInput` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` |  |
| `count` | `number` | 标签个数，等于 value.length；作者常拿它做"3 / 5"这类计数提示。 |
| `inputValue` | `string` |  |
| `empty` | `boolean` | 一个标签都没有。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `max` | `number \| undefined` | 标签个数的上限；没设 max 时是 undefined，此时只渲当前个数。 |
| `showCount` | `boolean` | 计数部件此刻是否显出（开了 showCount）。 |
| `atMax` | `boolean` | 已顶到 max：再加进不去（allowOverflow 开时只是提示，不拦）。 |
| `overflow` | `boolean` | 已经越过 max（只有 allowOverflow 开着才可能为真）。 |
| `highlightedValue` | `string \| null` | 光标停着的标签；没在标签间走时为 null。 |
| `editedValue` | `string \| null` | 正被就地改写的标签；不在编辑态时为 null。 |
| `canClear` | `boolean` | 清空按钮此刻是否可用（可编辑，且标签或输入文本至少有一样）。 |
| `setValue` | `(next: string[]) => void` | 整份替换，去重去空白，不受 max 约束。 |
| `addValue` | `(next: string) => void` | 追加一个标签，受 max 与 allowOverflow 约束。 |
| `deleteValue` | `(value: string) => void` |  |
| `clear` | `() => void` |  |
| `setInputValue` | `(next: string) => void` |  |
| `highlight` | `(value: string \| null) => void` | 把光标挪到某个标签上；传 null 即交回输入框。 |
| `edit` | `(value: string) => void` | 进入就地编辑；未开 editable 时被守卫挡下。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getItemProps` | `(item: TagsInputItemProps) => T['element']` |  |
| `getItemPreviewProps` | `(item: TagsInputItemProps) => T['element']` |  |
| `getItemTextProps` | `(item: TagsInputItemProps) => T['element']` |  |
| `getItemDeleteTriggerProps` | `(item: TagsInputItemProps) => T['button']` |  |
| `getItemInputProps` | `(item: TagsInputItemProps) => T['input']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getCountProps` | `() => T['element']` | 计数部件：承载 count / max 两个数字，没开 showCount 时带 hidden 收起。 |
| `getHiddenInputProps` | `() => T['input']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in input, 框里有能成标签的内容, not disabled/readOnly | 把输入框里的文本变成标签（含 delimiter 时一次进多个）；框里只有空白时不接管，Enter 留给表单提交 |
| `delimiter（默认 ,）` | focus in input, not disabled/readOnly | 断词：分隔符之前的每一段各成一个标签，最后一段留在框里接着打 |
| `Backspace` | 输入框为空且没有标签被高亮, 至少有一个标签 | 高亮最后一个标签（这一下不删任何东西） |
| `Backspace` | 输入框为空且已有标签被高亮 | 删掉高亮的标签，光标落到前一个上；删的是第一个就交回输入框 |
| `Delete` | 已有标签被高亮 | 同上，删掉高亮的标签 |
| `ArrowLeft` | focus in input 且光标贴着最左端（无选区）, 至少有一个标签 | 往左走一格；还没走进标签时从最后一个起步，已经在第一个就停住 |
| `ArrowRight` | 已有标签被高亮 | 往右走一格；走出末尾即交回输入框。光标还在框里时不接管 |
| `Home` | 已有标签被高亮 | 跳到第一个标签 |
| `End` | 已有标签被高亮 | 交回输入框 |
| `Escape` | 已有标签被高亮 | 取消高亮，光标交回输入框；没在标签间走时不接管该键 |
| `Enter` | 已有标签被高亮, editable 开着 | 就地编辑这个标签，焦点进编辑框并整段选中 |
| `Enter` | focus in item-input（就地编辑中） | 提交改写；改成空白等于删掉这个标签，改成另一个已有标签则并成一个。焦点交回输入框 |
| `Escape` | focus in item-input（就地编辑中） | 撤销这次改写，标签保持原样，焦点交回输入框 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'group' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `aria-required` | 'true' \| 'false' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(item.value) |
| `item-input` | `aria-label` | label.editTagInput(item.value) |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `count` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/tags-input.css` 按部件选择：`[data-scope="tags-input"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-readonly` | ''（条件成立时才出现） |
| `count` | `data-at-max` | ''（条件成立时才出现） |
| `count` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-tags-input-action-bg` · `--xh-tags-input-action-bg-active` · `--xh-tags-input-action-bg-hover` · `--xh-tags-input-action-fg` · `--xh-tags-input-action-fg-hover` · `--xh-tags-input-action-font-size` · `--xh-tags-input-action-radius` · `--xh-tags-input-action-size` · `--xh-tags-input-control-bg` · `--xh-tags-input-control-bg-disabled` · `--xh-tags-input-control-bg-hover` · `--xh-tags-input-control-bg-readonly` · `--xh-tags-input-control-border` · `--xh-tags-input-control-border-at-max` · `--xh-tags-input-control-border-focus` · `--xh-tags-input-control-border-hover` · `--xh-tags-input-control-border-invalid` · `--xh-tags-input-control-fg` · `--xh-tags-input-control-gap` · `--xh-tags-input-control-h` · `--xh-tags-input-control-min-w` · `--xh-tags-input-control-px` · `--xh-tags-input-control-py` · `--xh-tags-input-control-radius` · `--xh-tags-input-control-shadow` · `--xh-tags-input-count-fg` · `--xh-tags-input-count-fg-at-max` · `--xh-tags-input-count-fg-disabled` · `--xh-tags-input-count-font-size` · `--xh-tags-input-delete-bg` · `--xh-tags-input-delete-bg-active` · `--xh-tags-input-delete-bg-hover` · `--xh-tags-input-delete-fg` · `--xh-tags-input-delete-fg-highlight` · `--xh-tags-input-delete-fg-hover` · `--xh-tags-input-delete-font-size` · `--xh-tags-input-delete-radius` · `--xh-tags-input-delete-size` · `--xh-tags-input-gap` · `--xh-tags-input-icon-size` · `--xh-tags-input-input-autofill-bg` · `--xh-tags-input-input-autofill-fg` · `--xh-tags-input-input-basis` · `--xh-tags-input-input-font-size` · `--xh-tags-input-input-min-w` · `--xh-tags-input-item-bg` · `--xh-tags-input-item-bg-highlight` · `--xh-tags-input-item-fg` · `--xh-tags-input-item-fg-highlight` · `--xh-tags-input-item-font-size` · `--xh-tags-input-item-gap` · `--xh-tags-input-item-input-bg` · `--xh-tags-input-item-input-border` · `--xh-tags-input-item-input-fg` · `--xh-tags-input-item-px` · `--xh-tags-input-item-py` · `--xh-tags-input-item-radius` · `--xh-tags-input-label-fg` · `--xh-tags-input-label-fg-disabled` · `--xh-tags-input-label-font-size` · `--xh-tags-input-label-font-weight` · `--xh-tags-input-placeholder-fg`

## 动效

`background` · `border-color` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；候选词一键添加时旁边摆一排[按钮](./button)。

## 最佳实践

- 入库前统一改写（去空白、转小写），否则同一个词会出现好几份。
- 说明用什么键成词，否则用户会一直打空格。

## 反模式

- 不去重：同一个标签能加很多次。
- 标签不能删。
