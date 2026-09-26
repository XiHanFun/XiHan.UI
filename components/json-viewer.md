来源：https://ui.docs.xihanfun.com/components/json-viewer

# JsonViewer JSON 视图

把一份 JSON 展开为可折叠的树：键名、值与值类型各自成块，对象与数组可以逐层收起。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/json-viewer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/json-viewer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/json-viewer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/json-viewer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/json-viewer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一份 JSON 展开为可折叠的树：键名与值各自成块，六种类型各自上色，默认只展开根行

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

## 组件结构

加粗的是必需部件。

`data-scope="json-viewer"`：**`root`** · `tree` · `item` · `item-key` · `item-value` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `preview` · `text` · `empty`

## 示例

### 默认展开层数

defaultExpandedDepth 决定初次展开到第几层：1 只展开根行，3 连孙层一起铺开

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

传入 expandedValue 后由宿主决定，组件只发 expanded-value-change 不落内部值，写回后才变化

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

maxItems 把超长数组折为一行占位，maxStringLength 截断过长的字符串，一份大 JSON 不会拖慢页面

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

sortKeys 使对象键按字典序排列，数组顺序不变；接口返回的字段顺序不稳定时使用它

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

值出现在自己的祖先链上即停止并标为 [Circular]，不会无限递归；共享引用不算环，照常展开

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

size 三档只改变字号与层级缩进，行的结构与配色都不变

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

view="text" 直接输出缩进后的 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减

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

一行都无法展开时显示空态格；variant="ghost" 去掉外框与底色

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

    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2" variant="ghost" />
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

  <xh-json-viewer id="json-empty-b" default-expanded-depth="2" variant="ghost">
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
- 日志详情中的大段结构化字段，直接铺开会淹没正文。

### 何时不用

- 数据可编辑时，本组件只读；修改值需要自行接入[表单](./form)与[文本字段](./text-field)。
- 数据只是一段带语法高亮的源码时，使用[代码视图](./code-view)。
- 层级数据不是 JSON、键名与类型没有语义时，使用[树](./tree)；它处理通用层级数据与选中，本组件处理 JSON 的类型语义（键名、值形态、按类型着色、循环引用）。
- 只有几个字段需要平铺展示时，使用[描述列表](./descriptions)。

### 特性

- 行结构由 `value` 展开，作者不写任何行标记：Vue 与自定义元素两侧铺出同一棵 DOM，根容器内原有内容由组件接管。
- 自定义渲染器可调用 `groupJsonViewerNodesByParent(nodes)` 把可见行按父路径分组；返回值保留父路径首次出现顺序、组内输入顺序与节点身份。
- 未提供 `value` 时是空视图，不展开任何行；对象内确实存在值为 `undefined` 的成员时，该行照常展开。
- 展开集合可受控（`expandedValue` / `defaultExpandedValue`），非受控时按 `defaultExpandedDepth` 计算：数据晚于组件挂载到达（自定义元素常先升级、再由脚本写 `.value`）也能计算，第一次展开或收起之后固定，不再跟随数据。
- `maxStringLength` 截断长字符串，`maxItems` 折叠超长数组，`sortKeys` 让对象键按字典序排列。
- 循环引用展开到即停，标记为 `[Circular]`，不会无限递归。
- 每一行带 `data-value-type`，六种值形态各自着色。
- 尺寸轴与其他组件同源；`variant` 决定外框形态，默认 `outline`；`subtle` 换成淡底无描边，`ghost` 去掉外框与底色只保留内容。
- 没有任何行可展开时由 `empty` 部件说明，文案使用 `translations.empty`，作者也可以自行写入内容。
- 只支持 JSON 能表达的形状，传入活对象时呈现有损：`Date` / `Map` / `Set` 一律按自有可枚举键展开，因此显示为 `{}`；`undefined` 归入 `null` 一档、显示为 `undefined`；`bigint` 归入 `number`；函数与 symbol 归入 `string`，按各自的字符串形式呈现。需要如实展示这些值时先转换为 JSON 能表达的形状。
- 自定义元素侧：`value` 属性接受一段 JSON 文本（无法解析时按字符串值展示），对象与数组直接赋 property（`el.value = { … }`）；`expandedValue` / `defaultExpandedValue` / `translations` 没有对应属性，只能通过 property 设置，写成 `expanded-value='["$"]'` 不会生效。

### 组合

- 放入[标签页](./tabs)或[抽屉](./drawer)作为调试面板；行数多时套一层[滚动区域](./scroll-area)。
- 配合[剪贴板](./clipboard)提供原始 JSON 的复制。

### 最佳实践

- 大数据必须提供 `maxItems` 与 `maxStringLength`：一次展开几万行会让页面停滞。
- 默认展开层数不宜过大：`defaultExpandedDepth` 超过 2 会把整份数据铺满屏幕。
- 值的类型只靠颜色区分不够，字符串的引号、`null` 的字面量都要保留。
- 一行被收起时，其内部持有焦点的行会离开 DOM，焦点回到 `<body>`。应在收起前把焦点交回分支行本身，键盘用户才不会每收一层就丢失位置。

### 反模式

- 将它用作日志流：日志是时间序的条目，使用[日志](./log)。
- 把几 MB 的响应体原样传入，让用户自行查找。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-json-viewer>` |
| Vue 组件 | `XhJsonViewerRoot` |
| 组合式函数 | `useJsonViewer` |
| 状态机 | `jsonViewerMachine` |
| 皮肤 | `@xihan-ui/styles/json-viewer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `unknown` |  | 要展示的值，任意形状。未提供时为空视图（不展开任何行）。 |
| `view` | `JsonViewerView` |  | 展示形态，默认 tree。 text 档直接输出 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减： 目的是与后端下发的内容完全一致。展开集合与键盘导航在该档上不生效。 |
| `variant` | `ControlVariant` |  | 外框形态：outline 带描边与底色（默认），subtle 淡底无描边，ghost 去掉描边与底色只保留内容。 |
| `expandedValue` | `string[]` |  | 展开集合（元素是行路径）。提供即受控：cell 直读 prop，写入只发 onExpandedValueChange 不落内部值。 |
| `defaultExpandedValue` | `string[]` |  | 非受控初值；未提供时按 defaultExpandedDepth 计算。 |
| `defaultExpandedDepth` | `number` |  | 初始展开到第几层（层级号不超过它的分支全部展开），默认 1，即只展开根行。 |
| `maxStringLength` | `number` |  | 字符串值超过该字符数即截断并补省略号；未提供时不截断。 |
| `maxItems` | `number` |  | 同一层最多展开该数量的成员，其余收为一行占位；未提供时全部展开。 |
| `sortKeys` | `boolean` |  | 对象键按字典序排列；数组顺序不受影响。 |
| `loop` | `boolean` |  | 上下键到达首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，只对调左右方向键的展开 / 收起语义；未提供时从 DOM 读取。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<JsonViewerTranslations>` |  |  |
| `onExpandedValueChange` | `(details: JsonViewerExpandedValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `expanded-value-change` | `JsonViewerExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhJsonViewerRoot` | `empty` | — |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhJsonViewerRoot` | `empty` | `ReactNode` |  | 空态格子的内容；未写时铺设 translations 中的兜底文案。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `branch` | 'open' \| 'closed' |
| `branch-control` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-text` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `preview` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `VIEWER.BLUR` · `PRESS.START` · `PRESS.END`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visibleNodes` | `readonly JsonViewerNode[]` | 当前可见行序列（收起分支的子行不在其中）。 方向键、Home/End 都在它上面移动，适配器也按它铺设 DOM。 |
| `expandedValue` | `string[]` |  |
| `focusedValue` | `string \| null` | roving tabindex 的锚点行：焦点在树内时即当前行，焦点离开后仍保留（Tab 回来时落回它）； 它已随分支收起而不再可见时为 null。 |
| `isFocusWithin` | `boolean` | 焦点当前是否在树内。行的高亮标记随它变化，锚点不随之变化。 |
| `isExpanded` | `(value: string) => boolean` |  |
| `previewText` | `(node: JsonViewerNode) => string` | 分支收起摘要的显示文字（如 `{…} 3`），只用于视觉；叶子行返回空串。 |
| `valueText` | `(node: JsonViewerNode) => string` | 值的显示文字；截断占位行返回其余 N 项的文案。 |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `toggle` | `(value: string) => void` |  |
| `view` | `JsonViewerView` | 当前生效的展示形态。 |
| `isEmpty` | `boolean` | 无法展开任何一行：value 未提供或为 undefined。空态部件随它显隐。 |
| `emptyText` | `string` | 空态的兜底文案，作者未向空态部件写入内容时铺设它。 |
| `text` | `string` | 缩进后的 JSON 原文；键序与环路记号与树档一致。text 档之外也可获取，便于作者实现复制原文。 |
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

## 无障碍

### 键盘

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
| `Enter` / `Space` | held on branch | 按住期间该分支行（branch-control）投影 data-pressed，与指针 :active 同一副按压面（行只换面不缩放）；抬起或失焦撤下。展开态的切换照旧由这一次按键承担 |
| `*` | focus in tree | 展开与焦点行同一父级的全部分支（已展开的不动）；同级没有可展开的分支时不吞这个键 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `tree` | `aria-label` | label.tree |
| `tree` | `role` | 'tree' |
| `item` | `aria-level` | node?.level |
| `item` | `aria-posinset` | node?.posInSet |
| `item` | `aria-setsize` | node?.setSize |
| `item` | `role` | 'treeitem' |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-label` | branchLabel(node) \| undefined |
| `branch` | `aria-level` | node?.level |
| `branch` | `aria-posinset` | node?.posInSet |
| `branch` | `aria-setsize` | node?.setSize |
| `branch` | `role` | 'treeitem' |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |
| `preview` | `aria-hidden` | 'true' |
| `text` | `aria-label` | label.text |
| `text` | `role` | 'region' |

- 树是 `role=tree`，每一行是 `role=treeitem`，层级三项（`aria-level` / `aria-posinset` / `aria-setsize`）取自展开结果。
- 整棵树只占一个 Tab 位：首次进入落在首行，之后 Tab 离开再返回时落回上次停留的行；组内靠上下键移动。
- 展开箭头对读屏隐藏，它重复的是分支自身已报出的 `aria-expanded` 与左右方向键。
- 分支的名称显式提供（`aria-label`）：它包裹整棵子层，从内容计算名称会把所有子孙的文字一并读出。
- 收起摘要（`{…} 3`）是排版记号，对读屏隐藏；其中的成员数并入分支的可访问名称（默认读为 `tags, 3 items`，整句可用 `translations.collapsedBranchLabel` 替换）。

## 样式参考

### 皮肤

`@xihan-ui/styles/json-viewer.css` 使用 `[data-scope="json-viewer"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `root` | `data-view` | props.view |
| `item` | `data-circular` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-truncated` | ''（条件成立时才出现） |
| `item` | `data-value-type` | node?.type |
| `item-key` | `data-circular` | ''（条件成立时才出现） |
| `item-key` | `data-highlighted` | ''（条件成立时才出现） |
| `item-key` | `data-truncated` | ''（条件成立时才出现） |
| `item-key` | `data-value-type` | node?.type |
| `item-value` | `data-circular` | ''（条件成立时才出现） |
| `item-value` | `data-highlighted` | ''（条件成立时才出现） |
| `item-value` | `data-truncated` | ''（条件成立时才出现） |
| `item-value` | `data-value-type` | node?.type |
| `branch` | `data-circular` | ''（条件成立时才出现） |
| `branch` | `data-highlighted` | ''（条件成立时才出现） |
| `branch` | `data-state` | 'open' \| 'closed' |
| `branch` | `data-truncated` | ''（条件成立时才出现） |
| `branch` | `data-value-type` | node?.type |
| `branch-control` | `data-circular` | ''（条件成立时才出现） |
| `branch-control` | `data-highlighted` | ''（条件成立时才出现） |
| `branch-control` | `data-pressed` | ''（条件成立时才出现） |
| `branch-control` | `data-state` | 'open' \| 'closed' |
| `branch-control` | `data-truncated` | ''（条件成立时才出现） |
| `branch-control` | `data-value-type` | node?.type |
| `branch-trigger` | `data-circular` | ''（条件成立时才出现） |
| `branch-trigger` | `data-highlighted` | ''（条件成立时才出现） |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-truncated` | ''（条件成立时才出现） |
| `branch-trigger` | `data-value-type` | node?.type |
| `branch-indicator` | `data-circular` | ''（条件成立时才出现） |
| `branch-indicator` | `data-highlighted` | ''（条件成立时才出现） |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-indicator` | `data-truncated` | ''（条件成立时才出现） |
| `branch-indicator` | `data-value-type` | node?.type |
| `branch-text` | `data-circular` | ''（条件成立时才出现） |
| `branch-text` | `data-highlighted` | ''（条件成立时才出现） |
| `branch-text` | `data-state` | 'open' \| 'closed' |
| `branch-text` | `data-truncated` | ''（条件成立时才出现） |
| `branch-text` | `data-value-type` | node?.type |
| `branch-content` | `data-circular` | ''（条件成立时才出现） |
| `branch-content` | `data-highlighted` | ''（条件成立时才出现） |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `branch-content` | `data-truncated` | ''（条件成立时才出现） |
| `branch-content` | `data-value-type` | node?.type |
| `preview` | `data-circular` | ''（条件成立时才出现） |
| `preview` | `data-highlighted` | ''（条件成立时才出现） |
| `preview` | `data-state` | 'open' \| 'closed' |
| `preview` | `data-truncated` | ''（条件成立时才出现） |
| `preview` | `data-value-type` | node?.type |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-json-viewer-bg` | `empty`<br>`root`<br>`text`<br>`tree` | `background` | `default`<br>`is([data-scope='json-viewer'][data-part='tree'], [data-scope='json-viewer'][data-part='text'], [data-scope='json-viewer'][data-part='empty'])`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | json-viewer 的 empty、root、text、tree 部件 background 覆盖槽。 |
| `--xh-json-viewer-boolean-fg` | `item-value` | `color` | `value-type=boolean` | `--xh-syntax-keyword` | json-viewer 的 item-value 部件 color 覆盖槽。 |
| `--xh-json-viewer-border` | `empty`<br>`text`<br>`tree` | `border` | `default` | `--xh-border-default` | json-viewer 的 empty、text、tree 部件 border 覆盖槽。 |
| `--xh-json-viewer-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` | json-viewer 的 empty 部件 color 覆盖槽。 |
| `--xh-json-viewer-empty-gap` | `empty` | `gap` | `default` | `--xh-space-2` | json-viewer 的 empty 部件 gap 覆盖槽。 |
| `--xh-json-viewer-empty-px` | `empty` | `padding-inline` | `default` | `--xh-space-4` | json-viewer 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-json-viewer-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-6` | json-viewer 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-json-viewer-fg` | `root` | `color` | `default` | `--xh-fg-default` | json-viewer 的 root 部件 color 覆盖槽。 |
| `--xh-json-viewer-font` | `root`<br>`text` | `font-family` | `default` | `--xh-font-family-mono` | json-viewer 的 root、text 部件 font-family 覆盖槽。 |
| `--xh-json-viewer-font-size` | `root` | `font-size` | `default` | `--xh-_json-viewer-font-size` | json-viewer 的 root 部件 font-size 覆盖槽。 |
| `--xh-json-viewer-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | json-viewer 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-json-viewer-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-_json-viewer-indent` | json-viewer 的 branch-content 部件 padding-inline-start 覆盖槽。 |
| `--xh-json-viewer-indicator-fg` | `branch-trigger` | `color` | `default` | `--xh-fg-subtle` | json-viewer 的 branch-trigger 部件 color 覆盖槽。 |
| `--xh-json-viewer-indicator-size` | `branch-trigger` | `--xh-icon-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | json-viewer 的 branch-trigger 部件 --xh-icon-size、inline-size 覆盖槽。 |
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
| `--xh-json-viewer-row-bg-active` | `branch-control` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`pressed` | `--xh-bg-subtle-hover` | json-viewer 的 branch-control 部件 background 覆盖槽。 |
| `--xh-json-viewer-row-bg-hover` | `branch-control`<br>`item` | `background` | `highlighted`<br>`is(:hover, [data-highlighted])` | `--xh-bg-subtle` | json-viewer 的 branch-control、item 部件 background 覆盖槽。 |
| `--xh-json-viewer-row-gap` | `branch-control`<br>`item` | `gap` | `default` | `--xh-space-1` | json-viewer 的 branch-control、item 部件 gap 覆盖槽。 |
| `--xh-json-viewer-row-px` | `branch-control`<br>`item` | `padding-inline` | `default` | `--xh-space-1` | json-viewer 的 branch-control、item 部件 padding-inline 覆盖槽。 |
| `--xh-json-viewer-row-py` | `branch-control`<br>`item` | `padding-block` | `default` | `--xh-_json-viewer-row-py` | json-viewer 的 branch-control、item 部件 padding-block 覆盖槽。 |
| `--xh-json-viewer-row-radius` | `branch-control`<br>`item` | `border-radius` | `default` | `--xh-shape-inset` | json-viewer 的 branch-control、item 部件 border-radius 覆盖槽。 |
| `--xh-json-viewer-shadow` | `empty`<br>`text`<br>`tree` | `box-shadow` | `default` | `none` | json-viewer 的 empty、text、tree 部件 box-shadow 覆盖槽。 |
| `--xh-json-viewer-string-fg` | `item-value` | `color` | `value-type=string` | `--xh-syntax-string` | json-viewer 的 item-value 部件 color 覆盖槽。 |
| `--xh-json-viewer-text-fg` | `text` | `color` | `default` | `--xh-fg-default` | json-viewer 的 text 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 切换（见[动效规范](../design/motion#角色)）。

`background-color` · `rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

- 左右方向键的展开 / 收起语义跟随书写方向：未传 `dir` 时从 DOM 读取，整页 `dir="rtl"` 也能识别。
