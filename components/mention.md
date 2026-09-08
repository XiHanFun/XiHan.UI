来源：https://ui.docs.xihanfun.com/components/mention

# 提及 `mention`

在正文里打一个前缀字符就弹出候选，选中后把引用插进文本。

## 何时使用

- 评论、聊天、任务描述里 @ 某个人或 # 某个条目。
- 需要多种前缀各带一份候选。

## 何时不用

- 整个输入框的值就是选中项：用[组合框](./combobox)。
- 只是补全普通词汇：用[组合框](./combobox)或原生自动补全。

## 特性

- 多种前缀各自映射一份候选。
- `onQueryChange` 给出当前查询串，异步候选据此拉取。
- 正文可受控，选中时另有回调。
- `label` 部件给输入框一个点得动的标题；给了 `translations.input` 时仍走 `aria-label`。
- 给了 `collection` 却一条都不剩时显出 `empty` 部件。
- 候选还在取时改由 `loading` 部件顶上来，空态让位；候选面板同时报 `aria-busy`。
- `name` 让整段正文随表单提交，表单重置回落到 `defaultValue`。

## 示例

### 基础用法

在正文里敲 @ 才开候选，选中的那条被插到光标处，前后文一字不动

```vue
<script setup lang="ts">
import { XhMentionRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
  { value: "ghost", label: "幽灵（已离职）", disabled: true },
];

const text = ref("");
const query = ref<string | null>(null);

// 过滤是调用方的活儿：组件只把 @ 到光标之间那段交出来
const filtered = computed(() => {
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? people
    : people.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :collection="filtered"
    placeholder="写点什么，输入 @ 提及同事"
    :translations="{ input: '正文', content: '提及谁' }"
    @query-change="query = $event.query"
  />
  <p>正文：{{ text || "（空）" }}</p>
</template>
```

```html
<xh-mention id="mention-basic" placeholder="写点什么，输入 @ 提及同事">
  <div data-xh-part="root">
    <textarea data-xh-part="input"></textarea>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-mention>
<p>正文：<span id="mention-basic-value">（空）</span></p>

<script type="module">
  const people = [
    { value: "lilei", label: "李雷" },
    { value: "hanmeimei", label: "韩梅梅" },
    { value: "poly", label: "Poly" },
    { value: "ghost", label: "幽灵（已离职）", disabled: true },
  ];

  const mention = document.getElementById("mention-basic");
  const content = mention.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("mention-basic-value");

  // 可及名字是对象，只能经 property 交给元素
  mention.translations = { input: "正文", content: "提及谁" };

  function itemNode(person) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", person.value);
    if (person.disabled) item.setAttribute("aria-disabled", "true");
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = person.label;
    item.append(text);
    return item;
  }

  // 过滤是调用方的活儿：组件只把 @ 到光标之间那段交出来
  function render(query) {
    const q = query.trim().toLowerCase();
    const matched =
      q === ""
        ? people
        : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
    content.replaceChildren(...matched.map(itemNode));
  }

  render("");
  mention.addEventListener("query-change", (event) => render(event.detail.query ?? ""));
  mention.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });
</script>
```

### 多种前缀

@ 提人、# 打标签共用一个输入框，query-change 会报回是哪个前缀触发的

```vue
<script setup lang="ts">
import { XhMentionRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

const topics = [
  { value: "bug", label: "缺陷" },
  { value: "release", label: "发版" },
  { value: "design", label: "设计评审" },
];

const text = ref("");
const query = ref<string | null>(null);
const prefix = ref<string | null>(null);

// 按前缀选数据源，再按查询串筛一遍
const filtered = computed(() => {
  const pool = prefix.value === "#" ? topics : people;
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? pool
    : pool.filter(item => item.value.includes(q) || item.label.toLowerCase().includes(q));
});

function onQuery(details: { query: string | null; prefix: string | null }): void {
  query.value = details.query;
  prefix.value = details.prefix;
}
</script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :trigger-prefix="['@', '#']"
    :collection="filtered"
    placeholder="@ 提及同事，# 打标签"
    :translations="{ input: '正文', content: '候选' }"
    @query-change="onQuery"
  />
  <p>当前前缀：{{ prefix ?? "（无触发）" }}</p>
</template>
```

```html
<xh-mention id="mention-multi-prefix" placeholder="@ 提及同事，# 打标签">
  <div data-xh-part="root">
    <textarea data-xh-part="input"></textarea>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-mention>
<p>当前前缀：<span id="mention-multi-prefix-active">（无触发）</span></p>

<script type="module">
  const people = [
    { value: "lilei", label: "李雷" },
    { value: "hanmeimei", label: "韩梅梅" },
    { value: "poly", label: "Poly" },
  ];

  const topics = [
    { value: "bug", label: "缺陷" },
    { value: "release", label: "发版" },
    { value: "design", label: "设计评审" },
  ];

  const mention = document.getElementById("mention-multi-prefix");
  const content = mention.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("mention-multi-prefix-active");

  // 前缀数组与可及名字都进不了属性，经 property 交给元素
  mention.triggerPrefix = ["@", "#"];
  mention.translations = { input: "正文", content: "候选" };

  function itemNode(node) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", node.value);
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = node.label;
    item.append(text);
    return item;
  }

  // 按前缀选数据源，再按查询串筛一遍
  function render(query, prefix) {
    const pool = prefix === "#" ? topics : people;
    const q = (query ?? "").trim().toLowerCase();
    const matched =
      q === ""
        ? pool
        : pool.filter((item) => item.value.includes(q) || item.label.toLowerCase().includes(q));
    content.replaceChildren(...matched.map(itemNode));
  }

  render("", "@");
  mention.addEventListener("query-change", (event) => {
    render(event.detail.query, event.detail.prefix);
    readout.textContent = event.detail.prefix ?? "（无触发）";
  });
</script>
```

### 候选里的自定义内容

手写各部件即可在候选行里放头像与职位；插回正文的那段字取自 item-text

```vue
<script setup lang="ts">
import {
  XhAvatarFallback,
  XhAvatarRoot,
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionPositioner,
  XhMentionRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const people = [
  { value: "lilei", label: "李雷", role: "前端", initials: "李" },
  { value: "hanmeimei", label: "韩梅梅", role: "设计", initials: "韩" },
  { value: "poly", label: "Poly", role: "后端", initials: "P" },
];

const text = ref("");
const query = ref<string | null>(null);
const filtered = computed(() => {
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? people
    : people.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :translations="{ content: '提及谁' }"
    @query-change="query = $event.query"
  >
    <XhMentionInput aria-label="正文" placeholder="输入 @ 提及同事" />
    <XhMentionPositioner>
      <XhMentionContent>
        <XhMentionItem v-for="p in filtered" :key="p.value" :value="p.value">
          <XhAvatarRoot size="sm">
            <XhAvatarFallback>{{ p.initials }}</XhAvatarFallback>
          </XhAvatarRoot>
          <!-- 只有 item-text 里的字会被插进正文，职位不会跟着进去 -->
          <XhMentionItemText>{{ p.label }}</XhMentionItemText>
          <span style="color: var(--xh-fg-subtle); font-size: var(--xh-font-size-xs)">
            {{ p.role }}
          </span>
        </XhMentionItem>
      </XhMentionContent>
    </XhMentionPositioner>
  </XhMentionRoot>
  <p>正文：{{ text || "（空）" }}</p>
</template>
```

```html
<xh-mention id="mention-custom-item">
  <div data-xh-part="root">
    <textarea data-xh-part="input" aria-label="正文" placeholder="输入 @ 提及同事"></textarea>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-mention>
<p>正文：<span id="mention-custom-item-value">（空）</span></p>

<script type="module">
  const people = [
    { value: "lilei", label: "李雷", role: "前端", initials: "李" },
    { value: "hanmeimei", label: "韩梅梅", role: "设计", initials: "韩" },
    { value: "poly", label: "Poly", role: "后端", initials: "P" },
  ];

  const mention = document.getElementById("mention-custom-item");
  const content = mention.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("mention-custom-item-value");

  mention.translations = { content: "提及谁" };

  // 只有 item-text 里的字会被插进正文，头像与职位不会跟着进去
  function itemNode(person) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", person.value);
    item.innerHTML = `
      <xh-avatar size="sm">
        <span data-xh-part="root">
          <span data-xh-part="fallback">${person.initials}</span>
        </span>
      </xh-avatar>
      <span data-xh-part="item-text">${person.label}</span>
      <span style="color: var(--xh-fg-subtle); font-size: var(--xh-font-size-xs)">
        ${person.role}
      </span>
    `;
    return item;
  }

  function render(query) {
    const q = (query ?? "").trim().toLowerCase();
    const matched =
      q === ""
        ? people
        : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
    content.replaceChildren(...matched.map(itemNode));
  }

  render("");
  mention.addEventListener("query-change", (event) => render(event.detail.query));
  mention.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });
</script>
```

### 受控正文与选中回调

正文由宿主持有，select 事件报回插进去的是哪一条，用来攒收件人名单

```vue
<script setup lang="ts">
import { XhMentionRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

const text = ref("周会纪要：");
const query = ref<string | null>(null);
const mentioned = ref<string[]>([]);

const filtered = computed(() => {
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? people
    : people.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));
});

// 名单按值去重；正文里被删掉的提及不在这里回收，需要的话按正文重新扫一遍
function onSelect(details: { value: string }): void {
  if (!mentioned.value.includes(details.value))
    mentioned.value = [...mentioned.value, details.value];
}

function reset(): void {
  text.value = "";
  mentioned.value = [];
}
</script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :collection="filtered"
    tone="brand"
    placeholder="输入 @ 提及同事"
    :translations="{ input: '会议纪要', content: '提及谁' }"
    @query-change="query = $event.query"
    @select="onSelect"
  />
  <p>已提及：{{ mentioned.join("、") || "（无）" }}</p>
  <button type="button" @click="reset">清空</button>
</template>
```

```html
<xh-mention id="mention-controlled" value="周会纪要：" tone="brand" placeholder="输入 @ 提及同事">
  <div data-xh-part="root">
    <textarea data-xh-part="input"></textarea>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-mention>
<p>已提及：<span id="mention-controlled-list">（无）</span></p>
<button type="button" id="mention-controlled-reset">清空</button>

<script type="module">
  const people = [
    { value: "lilei", label: "李雷" },
    { value: "hanmeimei", label: "韩梅梅" },
    { value: "poly", label: "Poly" },
  ];

  const mention = document.getElementById("mention-controlled");
  const content = mention.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("mention-controlled-list");
  const reset = document.getElementById("mention-controlled-reset");
  let mentioned = [];

  mention.translations = { input: "会议纪要", content: "提及谁" };

  function itemNode(person) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", person.value);
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = person.label;
    item.append(text);
    return item;
  }

  function render(query) {
    const q = (query ?? "").trim().toLowerCase();
    const matched =
      q === ""
        ? people
        : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
    content.replaceChildren(...matched.map(itemNode));
  }

  function showMentioned() {
    readout.textContent = mentioned.join("、") || "（无）";
  }

  render("");
  mention.addEventListener("query-change", (event) => render(event.detail.query));
  // 正文由外面这份状态持有，组件报上来才写回去
  mention.addEventListener("value-change", (event) => {
    mention.value = event.detail.value;
  });
  // 名单按值去重；正文里被删掉的提及不在这里回收，需要的话按正文重新扫一遍
  mention.addEventListener("select", (event) => {
    if (!mentioned.includes(event.detail.value)) {
      mentioned = [...mentioned, event.detail.value];
      showMentioned();
    }
  });
  reset.addEventListener("click", () => {
    mention.value = "";
    mentioned = [];
    showMentioned();
  });
</script>
```

### 异步候选

查询串每变一次就重新去远端查一遍，等结果的这段时间浮层里空着

```vue
<script setup lang="ts">
import { XhMentionRoot } from "@xihan-ui/vue";
import { ref } from "vue";

interface Person {
  value: string;
  label: string;
}

const pool: Person[] = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
  { value: "linfeng", label: "林枫" },
];

const text = ref("");
const options = ref<Person[]>([]);
const loading = ref(false);
let timer = 0;

// 每次查询串变化都重开一轮查询，上一轮未落地的先撤掉
function onQuery(details: { query: string | null }): void {
  window.clearTimeout(timer);
  if (details.query === null) {
    options.value = [];
    loading.value = false;
    return;
  }
  const q = details.query.trim().toLowerCase();
  options.value = [];
  loading.value = true;
  timer = window.setTimeout(() => {
    options.value = pool.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));
    loading.value = false;
  }, 500);
}
</script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :collection="options"
    placeholder="输入 @ 再打两个字试试"
    :translations="{ input: '正文', content: '提及谁' }"
    @query-change="onQuery"
  />
  <p>{{ loading ? "查询中…" : `候选 ${options.length} 条` }}</p>
</template>
```

```html
<xh-mention id="mention-async" placeholder="输入 @ 再打两个字试试">
  <div data-xh-part="root">
    <textarea data-xh-part="input"></textarea>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-mention>
<p id="mention-async-status">候选 0 条</p>

<script type="module">
  const pool = [
    { value: "lilei", label: "李雷" },
    { value: "hanmeimei", label: "韩梅梅" },
    { value: "poly", label: "Poly" },
    { value: "linfeng", label: "林枫" },
  ];

  const mention = document.getElementById("mention-async");
  const content = mention.querySelector('[data-xh-part="content"]');
  const status = document.getElementById("mention-async-status");
  let timer = 0;

  mention.translations = { input: "正文", content: "提及谁" };

  function itemNode(person) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", person.value);
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = person.label;
    item.append(text);
    return item;
  }

  function show(options, loading) {
    content.replaceChildren(...options.map(itemNode));
    status.textContent = loading ? "查询中…" : `候选 ${options.length} 条`;
  }

  // 每次查询串变化都重开一轮查询，上一轮未落地的先撤掉
  mention.addEventListener("query-change", (event) => {
    clearTimeout(timer);
    if (event.detail.query === null) {
      show([], false);
      return;
    }
    const q = event.detail.query.trim().toLowerCase();
    show([], true);
    timer = setTimeout(() => {
      show(
        pool.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q)),
        false,
      );
    }, 500);
  });
</script>
```

### 形态

variant 换正文框的描边与底色，候选面板不受影响

```vue
<script setup lang="ts">
import { XhMentionRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

const query = ref<string | null>(null);
const filtered = computed(() => {
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? people
    : people.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhMentionRoot
      v-for="variant in ['outline', 'subtle', 'ghost']"
      :key="variant"
      :variant="variant"
      :collection="filtered"
      :placeholder="`${variant} 档，输入 @ 提及同事`"
      :translations="{ input: '正文', content: '提及谁' }"
      @query-change="query = $event.query"
    />
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-mention class="mention-variant" variant="outline" placeholder="outline 档，输入 @ 提及同事">
    <div data-xh-part="root">
      <textarea data-xh-part="input"></textarea>
      <div data-xh-part="positioner">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-mention>

  <xh-mention class="mention-variant" variant="subtle" placeholder="subtle 档，输入 @ 提及同事">
    <div data-xh-part="root">
      <textarea data-xh-part="input"></textarea>
      <div data-xh-part="positioner">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-mention>

  <xh-mention class="mention-variant" variant="ghost" placeholder="ghost 档，输入 @ 提及同事">
    <div data-xh-part="root">
      <textarea data-xh-part="input"></textarea>
      <div data-xh-part="positioner">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-mention>
</div>

<script type="module">
  const people = [
    { value: "lilei", label: "李雷" },
    { value: "hanmeimei", label: "韩梅梅" },
    { value: "poly", label: "Poly" },
  ];

  function itemNode(person) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", person.value);
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = person.label;
    item.append(text);
    return item;
  }

  // 三档各自一份候选：过滤是调用方的活儿，组件只把 @ 到光标之间那段交出来
  for (const mention of document.querySelectorAll(".mention-variant")) {
    const content = mention.querySelector('[data-xh-part="content"]');
    mention.translations = { input: "正文", content: "提及谁" };
    const render = (query) => {
      const q = query.trim().toLowerCase();
      const matched =
        q === ""
          ? people
          : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
      content.replaceChildren(...matched.map(itemNode));
    };
    render("");
    mention.addEventListener("query-change", (event) => render(event.detail.query ?? ""));
  }
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-mention>` |
| Vue 组件 | `XhMentionContent` `XhMentionEmpty` `XhMentionInput` `XhMentionItem` `XhMentionItemText` `XhMentionLabel` `XhMentionLoading` `XhMentionPositioner` `XhMentionRoot` |
| 组合式函数 | `useMention` |
| 状态机 | `mentionMachine` |
| 皮肤 | `@xihan-ui/styles/mention.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="mention"`：**`root`** · `label` · **`input`** · `positioner` · **`content`** · `empty` · `loading` · `item` · `item-text`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `triggerPrefix` | `string \| string[]` |  | 开候选的前缀字符，缺省 '@'。给数组即多种前缀并存，宿主按 onQueryChange 报回的 prefix 分流。 前缀必须紧跟在行首或空白之后，邮箱地址里的 @ 因此不会误触发。 |
| `collection` | `MentionNode[]` |  | 候选数据，显示文本与禁用的事实源。过滤仍归调用方：交进来的就是此刻该显示的那几条。 组件不管怎么筛，它只负责把查询串交出去。 |
| `value` | `string` |  | 整段正文。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：输入框用原生 disabled，候选一概不开。 |
| `readOnly` | `boolean` |  | 只读：正文仍可聚焦与复制，改不动，候选也不开。 |
| `invalid` | `boolean` |  | 校验失败标注：描边与聚焦环换成失败色，同时经 aria-invalid 上报。 |
| `loading` | `boolean` |  | 候选还在取：候选面板报 aria-busy，在途占位顶上来、空态占位让位。 |
| `placeholder` | `string` |  | 输入框占位文字。不给就整条不输出，作者写在 input 部件上的那份因此留得住。 |
| `name` | `string` |  | 表单字段名；给了输入框才带 name，整段正文随表单一并提交。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `translations` | `MentionTranslations` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与高亮用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框内边距与字号档位。 |
| `onValueChange` | `(details: MentionValueChangeDetails) => void` |  | 正文变化回调；受控时是唯一出口。 |
| `onQueryChange` | `(details: MentionQueryChangeDetails) => void` |  | 查询串变化回调：调用方据此重新过滤候选。收起时报 null。 |
| `onSelect` | `(details: MentionSelectDetails) => void` |  | 候选被插进正文时回调，带上是哪一条。 |
| `onOpenChange` | `(details: MentionOpenChangeDetails) => void` |  | 浮层开合回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `MentionValueChangeDetails` | 正文变化；detail 为 `{ value: string }` |
| `query-change` | `MentionQueryChangeDetails` | 查询串变化；detail 为 `{ query, prefix }`，作者据此过滤候选；收起时报 null |
| `select` | `MentionSelectDetails` | 候选被插进正文；detail 为 `{ value, label, prefix }` |
| `open-change` | `MentionOpenChangeDetails` | 浮层开合；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMentionRoot` | `default` | `MentionRootSlotProps` |  |
| `XhMentionRoot` | `item` | `MentionNodeMeta` | 铺开 collection 时每条候选的文本插槽。 |
| `XhMentionRoot` | `empty` | — | 铺开 collection 时空态里那句话；不写走内建英文。 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `CARET.SYNC` · `VALUE.SET` · `ITEM.HIGHLIGHT` · `ITEM.SELECT` · `ITEMS.SYNC` · `FORM.RESET`

## connect API

`useMention` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly MentionNodeMeta[]` | collection 推出的候选元信息，按数据顺序排列；没给 collection 即空数组。 |
| `value` | `string` | 整段正文。 |
| `query` | `string \| null` | 当前查询串；没有触发时为 null。 |
| `activePrefix` | `string \| null` | 触发本次查询的前缀；没有触发时为 null。 |
| `highlightedValue` | `string \| null` | 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 |
| `disabled` | `boolean` |  |
| `empty` | `boolean` | 没有候选可显：给了 collection 且一条都不剩。作者据此显出空态部件。 |
| `isHighlighted` | `(value: string) => boolean` |  |
| `setValue` | `(next: string) => void` | 整段改写正文，浮层随之收起。 |
| `close` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` | 标题；`for` 恒写向 input，故须是原生 `&lt;label&gt;`。 |
| `getInputProps` | `(props?: MentionInputProps) => T['textarea']` | 不传参即多行 textarea。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 一条候选都没有时显出的空态；有候选时带 hidden 收起。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 同样是 content 的兄弟，不进 role=listbox。 |
| `getItemProps` | `(props: MentionItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: MentionItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `前缀字符` | 光标前是行首或空白 | 开候选浮层，并把前缀到光标之间那段作为查询串交给宿主 |
| `可打印字符` | open | 查询串跟着变长，过滤由调用方按 onQueryChange 自己做 |
| `ArrowDown` | open | 高亮移到下一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `ArrowUp` | open | 高亮移到上一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `Enter` | open, 有高亮且未禁用 | 把候选文本插到光标处替换查询串，光标落到插入内容之后，浮层收起；这次回车不换行 |
| `Enter` | open, 无可提交候选 | 照常换行，只把浮层收起来 |
| `Escape` | open | 收起浮层且正文不变；光标不离开这个触发点就不再自动展开 |
| `Tab` / `Shift+Tab` | open | 收起浮层且不拦按键，焦点按 Tab 序列自然离开 |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | 任意时候 | 一律不接管：光标照常移动，触发按新的光标位置重算，挪出查询串即收起 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-activedescendant` | `item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | `content` 部件的 id |
| `input` | `aria-expanded` | undefined \| 'true' \| 'false' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.translations.input |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `role` | undefined \| 'combobox' |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-label` | props.translations.content |
| `content` | `role` | 'listbox' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |

## 样式

默认皮肤 `@xihan-ui/styles/mention.css` 按部件选择：`[data-scope="mention"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-readonly` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-mention-content-bg` · `--xh-mention-content-border` · `--xh-mention-content-fg` · `--xh-mention-content-gap` · `--xh-mention-content-max-h` · `--xh-mention-content-max-w` · `--xh-mention-content-min-w` · `--xh-mention-content-px` · `--xh-mention-content-py` · `--xh-mention-content-radius` · `--xh-mention-content-shadow` · `--xh-mention-empty-bg` · `--xh-mention-empty-border` · `--xh-mention-empty-fg` · `--xh-mention-empty-font-size` · `--xh-mention-empty-px` · `--xh-mention-empty-py` · `--xh-mention-empty-radius` · `--xh-mention-empty-shadow` · `--xh-mention-input-autofill-bg` · `--xh-mention-input-autofill-fg` · `--xh-mention-input-bg` · `--xh-mention-input-bg-disabled` · `--xh-mention-input-bg-hover` · `--xh-mention-input-bg-readonly` · `--xh-mention-input-border` · `--xh-mention-input-border-focus` · `--xh-mention-input-border-hover` · `--xh-mention-input-border-invalid` · `--xh-mention-input-fg` · `--xh-mention-input-font-size` · `--xh-mention-input-h` · `--xh-mention-input-min-w` · `--xh-mention-input-px` · `--xh-mention-input-py` · `--xh-mention-input-radius` · `--xh-mention-input-shadow` · `--xh-mention-item-bg-hover` · `--xh-mention-item-fg` · `--xh-mention-item-font-size` · `--xh-mention-item-gap` · `--xh-mention-item-leading` · `--xh-mention-item-px` · `--xh-mention-item-py` · `--xh-mention-item-radius` · `--xh-mention-label-fg` · `--xh-mention-label-fg-disabled` · `--xh-mention-label-font-size` · `--xh-mention-label-font-weight` · `--xh-mention-label-gap` · `--xh-mention-layer` · `--xh-mention-loading-bg` · `--xh-mention-loading-border` · `--xh-mention-loading-fg` · `--xh-mention-loading-font-size` · `--xh-mention-loading-px` · `--xh-mention-loading-py` · `--xh-mention-loading-radius` · `--xh-mention-loading-shadow` · `--xh-mention-placeholder-fg`

## 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 输入宿主可以是[文本输入](./text-field)的多行形态，或 AI 场景里的[提示输入框](./prompt-input)。

## 最佳实践

- 候选按最近使用排序：@ 的对象高度重复。
- 插入后的引用要能整体删除，别让用户一个字一个字退。

## 反模式

- 候选异步且没有在途反馈：用户以为没人可 @。
- 前缀字符在正文里本来就常用（比如 `#` 在代码里），却不给退出方式。
