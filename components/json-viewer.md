来源：https://ui.docs.xihanfun.com/components/json-viewer

# JsonViewer `JSON 视图`

把一份 JSON 摊成可展开的树：键名、值与值类型各自成一块，对象与数组可以逐层收起。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/json-viewer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/json-viewer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/json-viewer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/json-viewer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/json-viewer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一份 JSON 摊成可展开的树：键名与值各自成块，六种类型各自上色，默认只展开根行

```vue
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  name: "曦寒视图",
  version: "1.0.0-alpha.2",
  stars: 128,
  active: true,
  homepage: null,
  tags: ["框架无关", "跨端", "无障碍"],
  author: { name: "曦寒", site: "xihanfun.com" },
};
</script>

<template>
  <XhJsonViewerRoot
    :value="payload"
    style="inline-size: 100%; max-inline-size: 420px"
  />
</template>
```

```html
<!-- 属性里写的是一段 JSON 文本；直接喂对象走 property（el.value = {...}） -->
<xh-json-viewer
  value='{"name":"曦寒视图","version":"1.0.0-alpha.2","stars":128,"active":true,"homepage":null,"tags":["框架无关","跨端","无障碍"],"author":{"name":"曦寒","site":"xihanfun.com"}}'
>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px"></div>
</xh-json-viewer>
```

## 示例

### 默认展开层数

defaultExpandedDepth 决定初次摊到第几层：1 只展开根行，3 连孙层一起铺开

```vue
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  server: {
    host: "127.0.0.1",
    port: 5173,
    tls: { enabled: false, cert: null },
  },
  build: { target: "es2022", minify: true },
};
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 100%; max-inline-size: 420px">
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="1" />
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="3" />
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; inline-size: 100%; max-inline-size: 420px">
  <xh-json-viewer id="json-depth-1" default-expanded-depth="1">
    <div data-xh-part="root"></div>
  </xh-json-viewer>

  <xh-json-viewer id="json-depth-3" default-expanded-depth="3">
    <div data-xh-part="root"></div>
  </xh-json-viewer>
</div>

<script type="module">
  // 同一份数据喂给两个视图，差别只在初次摊到第几层
  const payload = {
    server: {
      host: "127.0.0.1",
      port: 5173,
      tls: { enabled: false, cert: null },
    },
    build: { target: "es2022", minify: true },
  };

  for (const id of ["json-depth-1", "json-depth-3"]) {
    document.getElementById(id).value = payload;
  }
</script>
```

### 受控展开

传了 expandedValue 就由宿主说了算，组件只发 expanded-value-change 不落内部值，写回它才动

```vue
<script setup lang="ts">
import { JSON_VIEWER_ROOT_PATH, jsonExpandedPathsToDepth } from "@xihan-ui/headless";
import { XhButton, XhJsonViewerRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const payload = {
  request: { method: "POST", path: "/api/login" },
  response: { code: 200, body: { token: "eyJhbGciOi…", expiresIn: 7200 } },
};

const expanded = ref<string[]>([JSON_VIEWER_ROOT_PATH]);

function onExpandedValueChange(details: { value: string[] }) {
  expanded.value = details.value;
}
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <div style="display: flex; gap: 8px">
      <XhButton size="sm" @click="expanded = jsonExpandedPathsToDepth(payload, 9)">
        全部展开
      </XhButton>
      <XhButton size="sm" @click="expanded = []">全部收起</XhButton>
    </div>

    <XhJsonViewerRoot
      :value="payload"
      :expanded-value="expanded"
      @expanded-value-change="onExpandedValueChange"
    />

    <span>展开了 {{ expanded.length }} 处</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
  <div style="display: flex; gap: 8px">
    <xh-button id="json-controlled-expand" size="sm">
      <button data-xh-part="root">全部展开</button>
    </xh-button>
    <xh-button id="json-controlled-collapse" size="sm">
      <button data-xh-part="root">全部收起</button>
    </xh-button>
  </div>

  <xh-json-viewer id="json-controlled">
    <div data-xh-part="root"></div>
  </xh-json-viewer>

  <span>展开了 <span id="json-controlled-count">1</span> 处</span>
</div>

<script type="module">
  const viewer = document.getElementById("json-controlled");
  const countOut = document.getElementById("json-controlled-count");

  const payload = {
    request: { method: "POST", path: "/api/login" },
    response: { code: 200, body: { token: "eyJhbGciOi…", expiresIn: 7200 } },
  };
  viewer.value = payload;

  // 路径就是展开集合的元素：根是 $，往下每层用 [键的 JSON 串] 接着拼
  const ROOT = "$";
  const ALL = [
    ROOT,
    `${ROOT}["request"]`,
    `${ROOT}["response"]`,
    `${ROOT}["response"]["body"]`,
  ];

  // 展开集合由这段脚本持有：组件只发意图，写回才真的改
  function setExpanded(value) {
    viewer.expandedValue = value;
    countOut.textContent = String(value.length);
  }

  setExpanded([ROOT]);
  viewer.addEventListener("expanded-value-change", (event) =>
    setExpanded(event.detail.value),
  );

  const button = (id) =>
    document.getElementById(id).querySelector('[data-xh-part="root"]');

  button("json-controlled-expand").addEventListener("click", () => setExpanded(ALL));
  button("json-controlled-collapse").addEventListener("click", () => setExpanded([]));
</script>
```

### 大数据

maxItems 把超长数组折成一行占位，maxStringLength 截掉过长的字符串，一份大 JSON 不会把页面压住

```vue
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  total: 240,
  cursor:
    "eyJvZmZzZXQiOjAsImxpbWl0IjoyMCwic29ydCI6ImNyZWF0ZWRfYXQgZGVzYyJ9-very-long-token",
  items: Array.from({ length: 240 }, (_, i) => `第 ${i + 1} 条`),
};
</script>

<template>
  <XhJsonViewerRoot
    :value="payload"
    :default-expanded-depth="2"
    :max-items="5"
    :max-string-length="24"
    style="inline-size: 100%; max-inline-size: 420px"
  />
</template>
```

```html
<xh-json-viewer
  id="json-large"
  default-expanded-depth="2"
  max-items="5"
  max-string-length="24"
>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px"></div>
</xh-json-viewer>

<script type="module">
  // 240 条只摊出 5 条，其余收成一行占位
  document.getElementById("json-large").value = {
    total: 240,
    cursor:
      "eyJvZmZzZXQiOjAsImxpbWl0IjoyMCwic29ydCI6ImNyZWF0ZWRfYXQgZGVzYyJ9-very-long-token",
    items: Array.from({ length: 240 }, (_, i) => `第 ${i + 1} 条`),
  };
</script>
```

### 键排序

sortKeys 让对象键按字典序排，数组顺序不动；接口返回的字段顺序不稳定时用它

```vue
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  zone: "cn-east-1",
  action: "deploy",
  meta: { retries: 2, at: "2026-08-20", by: "ci" },
  steps: ["build", "test", "publish"],
};
</script>

<template>
  <XhJsonViewerRoot
    :value="payload"
    :default-expanded-depth="2"
    sort-keys
    style="inline-size: 100%; max-inline-size: 420px"
  />
</template>
```

```html
<xh-json-viewer id="json-sort-keys" default-expanded-depth="2" sort-keys>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px"></div>
</xh-json-viewer>

<script type="module">
  document.getElementById("json-sort-keys").value = {
    zone: "cn-east-1",
    action: "deploy",
    meta: { retries: 2, at: "2026-08-20", by: "ci" },
    steps: ["build", "test", "publish"],
  };
</script>
```

### 循环引用

值出现在自己的祖先链上就停下并标成 [Circular]，不会无限递归；共享引用不算环，照样摊开

```vue
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const shared = { id: 1 };
const node: Record<string, unknown> = { name: "root", left: shared, right: shared };
// 指回自己：摊到这里就停
node.parent = node;
</script>

<template>
  <XhJsonViewerRoot
    :value="node"
    :default-expanded-depth="2"
    style="inline-size: 100%; max-inline-size: 420px"
  />
</template>
```

```html
<xh-json-viewer id="json-circular" default-expanded-depth="2">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px"></div>
</xh-json-viewer>

<script type="module">
  const shared = { id: 1 };
  const node = { name: "root", left: shared, right: shared };
  // 指回自己：摊到这里就停
  node.parent = node;

  document.getElementById("json-circular").value = node;
</script>
```

### 尺寸

size 三档只换字号与层级缩进，行的结构与配色都不变

```vue
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = { id: 7, label: "曦寒", nested: { ok: true } };
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2" size="sm" />
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2" size="md" />
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2" size="lg" />
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
  <xh-json-viewer id="json-size-sm" default-expanded-depth="2" size="sm">
    <div data-xh-part="root"></div>
  </xh-json-viewer>

  <xh-json-viewer id="json-size-md" default-expanded-depth="2" size="md">
    <div data-xh-part="root"></div>
  </xh-json-viewer>

  <xh-json-viewer id="json-size-lg" default-expanded-depth="2" size="lg">
    <div data-xh-part="root"></div>
  </xh-json-viewer>
</div>

<script type="module">
  const payload = { id: 7, label: "曦寒", nested: { ok: true } };
  for (const id of ["json-size-sm", "json-size-md", "json-size-lg"]) {
    document.getElementById(id).value = payload;
  }
</script>
```

### 原文视图

view="text" 直接出缩进过的 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减

```vue
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const payload = {
  orderNo: "SO-2026-0825-0417",
  amount: 12.5,
  items: [
    { sku: "A-1001", qty: 2 },
    { sku: "B-2003", qty: 1 },
  ],
  remark: "跨境订单，需人工复核收件地址与税号",
};

const view = ref<"tree" | "text">("text");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px; inline-size: 100%; max-inline-size: 420px">
    <label style="display: flex; align-items: center; gap: 6px">
      <input v-model="view" type="checkbox" true-value="text" false-value="tree">
      原文视图
    </label>
    <XhJsonViewerRoot :value="payload" :view="view" :default-expanded-depth="2" />
  </div>
</template>
```

```html
<xh-json-viewer id="json-text" view="text" default-expanded-depth="2">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px"></div>
</xh-json-viewer>

<script type="module">
  document.getElementById("json-text").value = {
    orderNo: "SO-2026-0825-0417",
    amount: 12.5,
    items: [
      { sku: "A-1001", qty: 2 },
      { sku: "B-2003", qty: 1 },
    ],
    remark: "跨境订单，需人工复核收件地址与税号",
  };
</script>
```

### 空态与形态

一行也摊不出来时空态那一格站出来说话；variant="plain" 去掉外框与底色

```vue
<script setup lang="ts">
import { XhButton, XhJsonViewerRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const payload = ref<unknown>(undefined);

function toggle(): void {
  payload.value = payload.value === undefined ? { id: 7, label: "曦寒" } : undefined;
}
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <XhButton size="sm" variant="outline" @click="toggle">
      {{ payload === undefined ? "喂一份数据" : "把数据撤掉" }}
    </XhButton>

    <!-- 不写插槽即铺 translations.empty 那句话 -->
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2">
      <template #empty>这份接口还没有返回内容</template>
    </XhJsonViewerRoot>

    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2" variant="plain" />
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
  <xh-button size="sm" variant="outline">
    <button id="json-empty-toggle" data-xh-part="root">喂一份数据</button>
  </xh-button>

  <xh-json-viewer id="json-empty-a" default-expanded-depth="2">
    <div data-xh-part="root"></div>
  </xh-json-viewer>

  <xh-json-viewer id="json-empty-b" default-expanded-depth="2" variant="plain">
    <div data-xh-part="root"></div>
  </xh-json-viewer>
</div>

<script type="module">
  const viewers = ["json-empty-a", "json-empty-b"].map((id) => document.getElementById(id));
  const toggle = document.getElementById("json-empty-toggle");

  // 文案走 translations，缺省是英文的 No data；它是对象，只走属性
  viewers[0].translations = { empty: "这份接口还没有返回内容" };

  toggle.addEventListener("click", () => {
    const next = viewers[0].value === undefined ? { id: 7, label: "曦寒" } : undefined;
    for (const el of viewers) el.value = next;
    toggle.textContent = next === undefined ? "喂一份数据" : "把数据撤掉";
  });
</script>
```

## 设计指引

### 何时使用

- 调试面板、接口返回体、配置文件的只读呈现。
- 日志详情里那一大坨结构化字段，直接铺开会淹掉正文。

### 何时不用

- 数据是可编辑的：本组件只读，改值要自己接[表单](./form)与[输入框](./text-field)。
- 数据只是一段带语法高亮的源码：用[代码视图](./code-view)。
- 层级数据不是 JSON，键名与类型没有语义：用[树](./tree)——它认的是通用层级数据与选中，本组件认的是 JSON 的类型语义（键名、值形态、逐类型着色、循环引用）。
- 只有几个字段要平铺展示：用[描述列表](./descriptions)。

### 特性

- 行结构由 `value` 摊出来，作者不写任何行标记：Vue 与自定义元素两侧铺出同一棵 DOM，根容器里原有的内容由组件接管。
- 自定义渲染器可调用 `groupJsonViewerNodesByParent(nodes)` 把可见行按父路径分组；返回值保留父路径首次出现顺序、组内输入顺序与节点身份。
- 不给 `value` 就是空视图，一行也不摊；对象内部真有一个值为 `undefined` 的成员时，那一行照常摊出来。
- 展开集合可受控（`expandedValue` / `defaultExpandedValue`），不受控时按 `defaultExpandedDepth` 现算：数据晚于组件挂载才到（自定义元素常是先升级、再由脚本写 `.value`）也照样算得上，第一次展开或收起之后就固定下来，不再跟着数据走。
- `maxStringLength` 截长字符串，`maxItems` 折超长数组，`sortKeys` 让对象键按字典序排。
- 循环引用摊到就停，标成 `[Circular]`，不会无限递归。
- 每一行带 `data-value-type`，六种值形态各自上色。
- 尺寸一轴与其余组件同源；`variant` 决定带不带外框，缺省 `surface`。
- 一行也摊不出来时由 `empty` 那一格说话，文案走 `translations.empty`，作者也可以自己往里写内容。
- **只认 JSON 能表达的形状**，喂进活对象时呈现是有损的：`Date` / `Map` / `Set` 一律按自有可枚举键摊，因此显示成 `{}`；`undefined` 归 `null` 一档、显示成 `undefined`；`bigint` 归 `number`；函数与 symbol 归 `string`，按各自的字符串形式呈现。要如实展示这些值，先自己转成 JSON 能表达的形状。
- 自定义元素侧：`value` 属性收的是一段 JSON 文本（解析不了就当一个字符串值展示），对象与数组直接赋 property（`el.value = { … }`）；`expandedValue` / `defaultExpandedValue` / `translations` **没有对应属性，只能走 property**，写成 `expanded-value='["$"]'` 不会生效。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-json-viewer>` |
| Vue 组件 | `XhJsonViewerRoot` |
| 组合式函数 | `useJsonViewer` |
| 状态机 | `jsonViewerMachine` |
| 皮肤 | `@xihan-ui/styles/json-viewer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="json-viewer"`：**`root`** · `tree` · `item` · `item-key` · `item-value` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `preview` · `text` · `empty`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `unknown` |  | 要展示的值，任意形状。缺省即空视图（一行也不摊）。 |
| `view` | `JsonViewerView` |  | 展示形态，默认 tree。 text 档直接出 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减—— 要的就是与后端下发的那份一字不差。展开集合与键盘导航在这一档上不起作用。 |
| `variant` | `JsonViewerVariant` |  | 外框形态：surface 带描边与底色（缺省），plain 去掉描边与底色，只留内容。 |
| `expandedValue` | `string[]` |  | 展开集合（元素是行路径）。给定即受控：cell 直读 prop，写只发 onExpandedValueChange 不落内部值。 |
| `defaultExpandedValue` | `string[]` |  | 非受控初值；不给就按 defaultExpandedDepth 现算。 |
| `defaultExpandedDepth` | `number` |  | 初始展开到第几层（层级号不超过它的分支全部展开），默认 1，即只展开根行。 |
| `maxStringLength` | `number` |  | 字符串值超过这么多字符就截断并补省略号；不给即不截断。 |
| `maxItems` | `number` |  | 同一层最多摊出这么多成员，其余收成一行占位；不给即全摊。 |
| `sortKeys` | `boolean` |  | 对象键按字典序排列；数组顺序不受影响。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，只对调左右方向键的展开/收起语义；不给即从 DOM 现读。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<JsonViewerTranslations>` |  |  |
| `onExpandedValueChange` | `(details: JsonViewerExpandedValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `expanded-value-change` | `JsonViewerExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhJsonViewerRoot` | `empty` | — |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `VIEWER.BLUR`

## connect API

`useJsonViewer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visibleNodes` | `readonly JsonViewerNode[]` | 当前可见行序列（收起分支的子行不在其中）。 方向键、Home/End 都在它上面走，适配器也按它铺 DOM。 |
| `expandedValue` | `string[]` |  |
| `focusedValue` | `string \| null` | roving tabindex 的锚点行：焦点在树内时就是当前行，焦点离开后仍留着（Tab 回来落回它）； 它已随分支收起而不再可见时为 null。 |
| `isFocusWithin` | `boolean` | 焦点此刻在不在树内。行的高亮标记跟它走，锚点不跟。 |
| `isExpanded` | `(value: string) => boolean` |  |
| `previewText` | `(node: JsonViewerNode) => string` | 分支收起摘要的显示文字（如 `{…} 3`），只给眼睛看；叶子行返回空串。 |
| `valueText` | `(node: JsonViewerNode) => string` | 值的显示文字；截断占位行返回「其余 N 项」那句话。 |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `toggle` | `(value: string) => void` |  |
| `view` | `JsonViewerView` | 当前生效的展示形态。 |
| `isEmpty` | `boolean` | 摊不出任何一行——value 没给或给的是 undefined。空态部件跟着它显隐。 |
| `emptyText` | `string` | 空态的兜底文案，作者没往空态部件里写内容时铺的就是它。 |
| `text` | `string` | 缩进过的 JSON 原文；键序与环路记号与树档一致。text 档之外也取得到，方便作者做「复制原文」。 |
| `getRootProps` | `() => T['element']` |  |
| `getTreeProps` | `() => T['element']` |  |
| `getTextProps` | `() => T['element']` |  |
| `getItemProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getItemKeyProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getItemValueProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchControlProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchIndicatorProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchTextProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getBranchContentProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getPreviewProps` | `(props: JsonViewerNodeProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the tree | 整棵树只占一个 Tab 位：第一次进来落首行，之后回到上次停留的那一行 |
| `ArrowDown` | focus in tree | 焦点移到下一个可见行（loop 默认关，末行不回绕） |
| `ArrowUp` | focus in tree | 焦点移到上一个可见行（loop 默认关，首行不回绕） |
| `Home` | focus in tree | 焦点移到首个可见行 |
| `End` | focus in tree | 焦点移到末个可见行（展开着的子层也算行） |
| `ArrowRight` | focus on branch（dir=rtl 时改由 ArrowLeft 承担） | 收起的对象/数组就地展开；已展开则把焦点移到首个子行；标量行什么都不做且不吞键 |
| `ArrowLeft` | focus in tree（dir=rtl 时改由 ArrowRight 承担） | 展开的对象/数组就地收起；收起的分支与标量行则把焦点移到父行；根行什么都不做 |
| `Enter` / `Space` | focus on branch | 切换该分支的展开态；焦点在标量行上时不吞这两个键 |
| `*` | focus in tree | 展开与焦点行同一父级的全部分支（已展开的不动）；同级没有可展开的分支时不吞这个键 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `tree` | `aria-label` | label.tree |
| `tree` | `role` | 'tree' |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-label` | branchLabel(node) \| undefined |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |
| `preview` | `aria-hidden` | 'true' |
| `text` | `aria-label` | label.text |
| `text` | `role` | 'region' |

- 树是 `role=tree`，每一行是 `role=treeitem`，层级三件套（`aria-level` / `aria-posinset` / `aria-setsize`）取自摊平结果。
- 整棵树只占一个 Tab 位：第一次进来落在首行，之后 Tab 出去再回来落回上次停留的那一行；组内靠上下键走。
- 展开箭头对读屏隐藏——它重复的是分支自己已经报出的 `aria-expanded` 与左右方向键。
- 分支的名字显式给（`aria-label`）：它裹着整棵子层，从内容算名字会把所有子孙的文字一并念出来。
- 收起摘要（`{…} 3`）是排版记号，对读屏隐藏；里面那个成员数折进了分支的可及名字（默认念成 `tags, 3 items`，整句可用 `translations.collapsedBranchLabel` 换）。

## 样式

默认皮肤 `@xihan-ui/styles/json-viewer.css` 按部件选择：`[data-scope="json-viewer"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `root` | `data-view` | props.view |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-json-viewer-bg` | `empty`<br>`text`<br>`tree` | `background` | `default` | `--xh-_json-viewer-bg` | json-viewer 的 empty、text、tree 部件 background 覆盖槽。 |
| `--xh-json-viewer-boolean-fg` | `item-value` | `color` | `value-type=boolean` | `--xh-syntax-keyword` | json-viewer 的 item-value 部件 color 覆盖槽。 |
| `--xh-json-viewer-border` | `empty`<br>`text`<br>`tree` | `border` | `default` | `--xh-_json-viewer-border` | json-viewer 的 empty、text、tree 部件 border 覆盖槽。 |
| `--xh-json-viewer-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` | json-viewer 的 empty 部件 color 覆盖槽。 |
| `--xh-json-viewer-empty-gap` | `empty` | `gap` | `default` | `--xh-space-2` | json-viewer 的 empty 部件 gap 覆盖槽。 |
| `--xh-json-viewer-empty-px` | `empty` | `padding-inline` | `default` | `--xh-space-4` | json-viewer 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-json-viewer-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-6` | json-viewer 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-json-viewer-fg` | `root` | `color` | `default` | `--xh-fg-default` | json-viewer 的 root 部件 color 覆盖槽。 |
| `--xh-json-viewer-font` | `root`<br>`text` | `font-family` | `default` | `--xh-font-family-mono` | json-viewer 的 root、text 部件 font-family 覆盖槽。 |
| `--xh-json-viewer-font-size` | `root` | `font-size` | `default` | `--xh-_json-viewer-font-size` | json-viewer 的 root 部件 font-size 覆盖槽。 |
| `--xh-json-viewer-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | json-viewer 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-json-viewer-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-_json-viewer-indent` | json-viewer 的 branch-content 部件 padding-inline-start 覆盖槽。 |
| `--xh-json-viewer-indicator-fg` | `branch-trigger` | `color` | `default` | `--xh-fg-subtle` | json-viewer 的 branch-trigger 部件 color 覆盖槽。 |
| `--xh-json-viewer-indicator-size` | `branch-trigger` | `inline-size` | `default` | `--xh-control-indicator-size` | json-viewer 的 branch-trigger 部件 inline-size 覆盖槽。 |
| `--xh-json-viewer-key-fg` | `branch-text`<br>`item-key` | `color` | `default` | `--xh-fg-brand-strong` | json-viewer 的 branch-text、item-key 部件 color 覆盖槽。 |
| `--xh-json-viewer-key-font-weight` | `branch-text`<br>`item-key` | `font-weight` | `default` | `--xh-font-weight-medium` | json-viewer 的 branch-text、item-key 部件 font-weight 覆盖槽。 |
| `--xh-json-viewer-max-h` | `text`<br>`tree` | `max-block-size` | `default` | `--xh-viewport-max-h` | json-viewer 的 text、tree 部件 max-block-size 覆盖槽。 |
| `--xh-json-viewer-null-fg` | `item-value` | `color` | `value-type=null` | `--xh-fg-subtle` | json-viewer 的 item-value 部件 color 覆盖槽。 |
| `--xh-json-viewer-number-fg` | `item-value` | `color` | `value-type=number` | `--xh-syntax-number` | json-viewer 的 item-value 部件 color 覆盖槽。 |
| `--xh-json-viewer-preview-fg` | `preview` | `color` | `default` | `--xh-fg-muted` | json-viewer 的 preview 部件 color 覆盖槽。 |
| `--xh-json-viewer-preview-font-size` | `preview` | `font-size` | `default` | `--xh-text-caption-size` | json-viewer 的 preview 部件 font-size 覆盖槽。 |
| `--xh-json-viewer-punctuation-fg` | `branch-text`<br>`item-key`<br>`item-value` | `color` | `default`<br>`value-type=array`<br>`value-type=object` | `--xh-fg-subtle` | json-viewer 的 branch-text、item-key、item-value 部件 color 覆盖槽。 |
| `--xh-json-viewer-px` | `text`<br>`tree` | `padding-inline` | `default` | `--xh-space-2` | json-viewer 的 text、tree 部件 padding-inline 覆盖槽。 |
| `--xh-json-viewer-py` | `text`<br>`tree` | `padding-block` | `default` | `--xh-space-2` | json-viewer 的 text、tree 部件 padding-block 覆盖槽。 |
| `--xh-json-viewer-radius` | `empty`<br>`text`<br>`tree` | `border-radius` | `default` | `--xh-shape-surface` | json-viewer 的 empty、text、tree 部件 border-radius 覆盖槽。 |
| `--xh-json-viewer-row-bg-hover` | `branch-control`<br>`item` | `background` | `highlighted`<br>`is(:hover, [data-highlighted])` | `--xh-bg-subtle` | json-viewer 的 branch-control、item 部件 background 覆盖槽。 |
| `--xh-json-viewer-row-gap` | `branch-control`<br>`item` | `gap` | `default` | `--xh-space-1` | json-viewer 的 branch-control、item 部件 gap 覆盖槽。 |
| `--xh-json-viewer-row-px` | `branch-control`<br>`item` | `padding-inline` | `default` | `--xh-space-1` | json-viewer 的 branch-control、item 部件 padding-inline 覆盖槽。 |
| `--xh-json-viewer-row-py` | `branch-control`<br>`item` | `padding-block` | `default` | `--xh-_json-viewer-row-py` | json-viewer 的 branch-control、item 部件 padding-block 覆盖槽。 |
| `--xh-json-viewer-row-radius` | `branch-control`<br>`item` | `border-radius` | `default` | `--xh-shape-inset` | json-viewer 的 branch-control、item 部件 border-radius 覆盖槽。 |
| `--xh-json-viewer-string-fg` | `item-value` | `color` | `value-type=string` | `--xh-syntax-string` | json-viewer 的 item-value 部件 color 覆盖槽。 |
| `--xh-json-viewer-text-fg` | `text` | `color` | `default` | `--xh-fg-default` | json-viewer 的 text 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

- 左右方向键的展开/收起语义跟着书写方向走：没传 `dir` 时从 DOM 现读，整页 `dir="rtl"` 也认得出来。

## 组合

- 放进[标签页](./tabs)或[抽屉](./drawer)里当调试面板；行数多时套一层[滚动区域](./scroll-area)。
- 配[复制到剪贴板](./clipboard)让人把原始 JSON 拿走。

## 最佳实践

- 大数据一定要给 `maxItems` 与 `maxStringLength`：一次摊开几万行会让页面停住。
- 默认展开层数别给大：`defaultExpandedDepth` 超过 2 就等于把整份数据铺满屏。
- 值里的类型只靠颜色区分是不够的，字符串的引号、`null` 的字面量都要留着。
- 一行被收起时，它内部那个持有焦点的行会随之离开 DOM，焦点掉回 `<body>`。要在收起前把焦点交回分支行本身，键盘用户才不会每收一层就丢一次位置。

## 反模式

- 拿它当日志流：日志是时间序的一串条目，用[日志](./log)。
- 把一份几 MB 的响应体原样丢进去，再让用户自己找。
