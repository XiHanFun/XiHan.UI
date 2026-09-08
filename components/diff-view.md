来源：https://ui.docs.xihanfun.com/components/diff-view

# 差异视图 `diff-view`

一份改动的逐行呈现：并排或单栏、双侧行号、变更类型的读屏文字，以及远离变更处的折叠。

## 何时使用

- 展示 AI 提议的代码改动，或两版文本的对比。
- 手里有一份统一格式的补丁，或者有新旧两版全文。

## 何时不用

- 只展示一段代码：用[代码视图](./code-view)。
- 展示的是「AI 提议的数据编辑逐条取舍」：那是一张带多选的[表格](./table)。

## 特性

- **两个入口归一到同一个模型**：`computeTextDiff(before, after)` 拿两版全文算，
  `parseUnifiedPatch(patch)` 解析补丁；组件只认模型。
- **着色在建模时一次算好**，不在连接层跑：`computeTextDiff` 手里有完整文本，
  整体切一次再按行取，跨行的块注释与多行字符串才不会着错色。
  `parseUnifiedPatch` 拿不到完整文件，因此**一律不填着色**——宁可不着色也不错着色。
- **词级差异**：配对的一条删除行与一条新增行之间再比一次词，只有真正动过的那几段上底色，
  整行改写与超长行不比（比出来满行都在闪，等于没有重点）。两个入口都产出，`wordDiff: false` 关掉。
- `contextLines` 把 hunk 内远离变更的连续上下文折成一格，点开即展开。
  展开集合可受控，好让「全部展开」这类操作统一持有。
- `wrap` 让长行原地折行，卡片不再横向滚动；窄栏与并排视图下尤其有用。
- 头部自带增删统计位 `summary`，增删各一个，数字取自模型、着色跟着变更类型走。
- `maxLines` 是必须有的上限：AI 会吐超大文件，新旧两侧各自超出即从尾部砍掉。
  砍掉几行由模型带出来，`truncation` 提示条把这个数说给读的人。
- 行号与列号一律从模型算，**绝不从 DOM 反推**。

## 示例

### 单栏差异

两个入口归一到同一个模型：这里用新旧两版全文算，着色在建模时一次算好

```vue
<script setup lang="ts">
import { createHighlighter } from "@xihan-ui/code-highlight";
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewViewport } from "@xihan-ui/vue";
import { computed } from "vue";

const before = `export function clamp(n: number, min: number) {
  return Math.max(n, min)
}`;

const after = `export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}`;

// 着色在建模时一次算好：这里手里有完整文本，跨行的记号才切得准
const model = computed(() =>
  computeTextDiff(before, after, { lang: "typescript", highlighter: createHighlighter() }),
);
</script>

<template>
  <XhDiffViewRoot :model="model">
    <XhDiffViewHeader>src/clamp.ts</XhDiffViewHeader>
    <XhDiffViewViewport>
      <XhDiffViewBody />
    </XhDiffViewViewport>
  </XhDiffViewRoot>
</template>
```

```html
<xh-diff-view id="diff-view-unified">
  <div data-xh-part="root">
    <div data-xh-part="header">src/clamp.ts</div>
    <div data-xh-part="viewport">
      <div data-xh-part="body"></div>
    </div>
  </div>
</xh-diff-view>

<script type="module">
  // 真实应用里这份模型来自 computeTextDiff 或 parseUnifiedPatch；
  // 这份示例是裸 HTML、没有打包器，所以把模型直接写在这里
  const view = document.getElementById("diff-view-unified");
  view.model = {
    hunks: [
      {
        header: "@@ -1,3 +1,3 @@",
        oldStart: 1,
        oldLines: 3,
        newStart: 1,
        newLines: 3,
        lines: [
          { change: "removed", oldNumber: 1, text: "export function clamp(n: number, min: number) {" },
          { change: "added", newNumber: 1, text: "export function clamp(n: number, min: number, max: number) {" },
          { change: "removed", oldNumber: 2, text: "  return Math.max(n, min)" },
          { change: "added", newNumber: 2, text: "  return Math.min(Math.max(n, min), max)" },
          { change: "context", oldNumber: 3, newNumber: 3, text: "}" },
        ],
      },
    ],
  };
</script>
```

### 并排与折叠

并排两列都发格子，空的那一侧照发；远离变更的连续上下文折成一格，点开即展开

```vue
<script setup lang="ts">
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewSummary, XhDiffViewViewport } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const before = Array.from({ length: 24 }, (_, i) => `const step${i} = pipeline.at(${i})`).join("\n");
const after = before
  .replace("const step1 = pipeline.at(1)", "const step1 = pipeline.head()")
  .replace("const step22 = pipeline.at(22)", "const step22 = pipeline.tail()");

// contextLines 给大一点，让模型里保住整段上下文，折叠交给组件
const model = computed(() => computeTextDiff(before, after, { contextLines: 24 }));
const expanded = ref<string[]>([]);
</script>

<template>
  <XhDiffViewRoot v-model:expanded-value="expanded" :model="model" view="split" :context-lines="3">
    <XhDiffViewHeader>
      <span>src/pipeline.ts</span>
      <XhDiffViewSummary change="added" />
      <XhDiffViewSummary change="removed" />
    </XhDiffViewHeader>
    <XhDiffViewViewport>
      <XhDiffViewBody />
    </XhDiffViewViewport>
  </XhDiffViewRoot>
</template>
```

```html
<xh-diff-view id="diff-view-split" view="split" context-lines="3">
  <div data-xh-part="root">
    <div data-xh-part="header">
      <span>src/pipeline.ts</span>
      <span data-xh-part="summary" data-change="added"></span>
      <span data-xh-part="summary" data-change="removed"></span>
    </div>
    <div data-xh-part="viewport">
      <div data-xh-part="body"></div>
    </div>
  </div>
</xh-diff-view>

<script type="module">
  // 真实应用里这份模型来自 computeTextDiff；展开集合非受控，元素自己记
  const view = document.getElementById("diff-view-split");
  view.model = {
    "hunks": [
      {
        "header": "@@ -1,24 +1,24 @@",
        "oldStart": 1,
        "oldLines": 24,
        "newStart": 1,
        "newLines": 24,
        "lines": [
          {
            "change": "context",
            "oldNumber": 1,
            "newNumber": 1,
            "text": "const step0 = pipeline.at(0)"
          },
          {
            "change": "removed",
            "oldNumber": 2,
            "text": "const step1 = pipeline.at(1)"
          },
          {
            "change": "added",
            "newNumber": 2,
            "text": "const step1 = pipeline.head()"
          },
          {
            "change": "context",
            "oldNumber": 3,
            "newNumber": 3,
            "text": "const step2 = pipeline.at(2)"
          },
          {
            "change": "context",
            "oldNumber": 4,
            "newNumber": 4,
            "text": "const step3 = pipeline.at(3)"
          },
          {
            "change": "context",
            "oldNumber": 5,
            "newNumber": 5,
            "text": "const step4 = pipeline.at(4)"
          },
          {
            "change": "context",
            "oldNumber": 6,
            "newNumber": 6,
            "text": "const step5 = pipeline.at(5)"
          },
          {
            "change": "context",
            "oldNumber": 7,
            "newNumber": 7,
            "text": "const step6 = pipeline.at(6)"
          },
          {
            "change": "context",
            "oldNumber": 8,
            "newNumber": 8,
            "text": "const step7 = pipeline.at(7)"
          },
          {
            "change": "context",
            "oldNumber": 9,
            "newNumber": 9,
            "text": "const step8 = pipeline.at(8)"
          },
          {
            "change": "context",
            "oldNumber": 10,
            "newNumber": 10,
            "text": "const step9 = pipeline.at(9)"
          },
          {
            "change": "context",
            "oldNumber": 11,
            "newNumber": 11,
            "text": "const step10 = pipeline.at(10)"
          },
          {
            "change": "context",
            "oldNumber": 12,
            "newNumber": 12,
            "text": "const step11 = pipeline.at(11)"
          },
          {
            "change": "context",
            "oldNumber": 13,
            "newNumber": 13,
            "text": "const step12 = pipeline.at(12)"
          },
          {
            "change": "context",
            "oldNumber": 14,
            "newNumber": 14,
            "text": "const step13 = pipeline.at(13)"
          },
          {
            "change": "context",
            "oldNumber": 15,
            "newNumber": 15,
            "text": "const step14 = pipeline.at(14)"
          },
          {
            "change": "context",
            "oldNumber": 16,
            "newNumber": 16,
            "text": "const step15 = pipeline.at(15)"
          },
          {
            "change": "context",
            "oldNumber": 17,
            "newNumber": 17,
            "text": "const step16 = pipeline.at(16)"
          },
          {
            "change": "context",
            "oldNumber": 18,
            "newNumber": 18,
            "text": "const step17 = pipeline.at(17)"
          },
          {
            "change": "context",
            "oldNumber": 19,
            "newNumber": 19,
            "text": "const step18 = pipeline.at(18)"
          },
          {
            "change": "context",
            "oldNumber": 20,
            "newNumber": 20,
            "text": "const step19 = pipeline.at(19)"
          },
          {
            "change": "context",
            "oldNumber": 21,
            "newNumber": 21,
            "text": "const step20 = pipeline.at(20)"
          },
          {
            "change": "context",
            "oldNumber": 22,
            "newNumber": 22,
            "text": "const step21 = pipeline.at(21)"
          },
          {
            "change": "removed",
            "oldNumber": 23,
            "text": "const step22 = pipeline.at(22)"
          },
          {
            "change": "added",
            "newNumber": 23,
            "text": "const step22 = pipeline.tail()"
          },
          {
            "change": "context",
            "oldNumber": 24,
            "newNumber": 24,
            "text": "const step23 = pipeline.at(23)"
          }
        ]
      }
    ]
  };
</script>
```

### 长行换行与词级差异

开 wrap 让长行原地折行；配对的删改行之间再比一次词，只有真正动过的那几段上底色

```vue
<script setup lang="ts">
import { createHighlighter } from "@xihan-ui/code-highlight";
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewSummary, XhDiffViewViewport } from "@xihan-ui/vue";
import { computed } from "vue";

const before = `const endpoint = "https://api.example.com/v1/workspaces/{id}/documents?include=revisions&limit=50"
const timeout = 3000
export const client = createClient({ endpoint, timeout })`;

const after = `const endpoint = "https://api.example.com/v2/workspaces/{id}/documents?include=revisions,authors&limit=100"
const timeout = 8000
export const client = createClient({ endpoint, timeout })`;

// 词级差异默认就算，wordDiff: false 可以关掉
const model = computed(() =>
  computeTextDiff(before, after, { lang: "typescript", highlighter: createHighlighter() }),
);
</script>

<template>
  <XhDiffViewRoot :model="model" wrap>
    <XhDiffViewHeader>
      <span>src/client.ts</span>
      <XhDiffViewSummary change="added" />
      <XhDiffViewSummary change="removed" />
    </XhDiffViewHeader>
    <XhDiffViewViewport>
      <XhDiffViewBody />
    </XhDiffViewViewport>
  </XhDiffViewRoot>
</template>
```

```html
<xh-diff-view id="diff-view-wrap" wrap>
  <div data-xh-part="root">
    <div data-xh-part="header">
      <span>src/client.ts</span>
      <span data-xh-part="summary" data-change="added"></span>
      <span data-xh-part="summary" data-change="removed"></span>
    </div>
    <div data-xh-part="viewport">
      <div data-xh-part="body"></div>
    </div>
  </div>
</xh-diff-view>

<script type="module">
  // 真实应用里这份模型来自 computeTextDiff，词级片段也由它算好；
  // 这份示例是裸 HTML、没有打包器，所以把模型直接写在这里
  const view = document.getElementById("diff-view-wrap");
  view.model = {
    hunks: [
      {
        header: "@@ -1,3 +1,3 @@",
        oldStart: 1,
        oldLines: 3,
        newStart: 1,
        newLines: 3,
        lines: [
          {
            change: "removed",
            oldNumber: 1,
            text: 'const endpoint = "https://api.example.com/v1/workspaces/{id}/documents?include=revisions&limit=50"',
            segments: [
              { text: 'const endpoint = "https://api.example.com/', changed: false },
              { text: "v1", changed: true },
              { text: "/workspaces/{id}/documents?include=revisions&limit=", changed: false },
              { text: "50", changed: true },
              { text: '"', changed: false },
            ],
          },
          {
            change: "added",
            newNumber: 1,
            text: 'const endpoint = "https://api.example.com/v2/workspaces/{id}/documents?include=revisions,authors&limit=100"',
            segments: [
              { text: 'const endpoint = "https://api.example.com/', changed: false },
              { text: "v2", changed: true },
              { text: "/workspaces/{id}/documents?include=revisions", changed: false },
              { text: ",authors", changed: true },
              { text: "&limit=", changed: false },
              { text: "100", changed: true },
              { text: '"', changed: false },
            ],
          },
          {
            change: "removed",
            oldNumber: 2,
            text: "const timeout = 3000",
            segments: [
              { text: "const timeout = ", changed: false },
              { text: "3000", changed: true },
            ],
          },
          {
            change: "added",
            newNumber: 2,
            text: "const timeout = 8000",
            segments: [
              { text: "const timeout = ", changed: false },
              { text: "8000", changed: true },
            ],
          },
          {
            change: "context",
            oldNumber: 3,
            newNumber: 3,
            text: "export const client = createClient({ endpoint, timeout })",
          },
        ],
      },
    ],
  };
</script>
```

### 超长差异的截断提示

超过 maxLines 的部分被砍掉，提示条把砍了多少行说给读的人

```vue
<script setup lang="ts">
import { computeTextDiff } from "@xihan-ui/headless";
import {
  XhDiffViewBody,
  XhDiffViewHeader,
  XhDiffViewRoot,
  XhDiffViewTruncation,
  XhDiffViewViewport,
} from "@xihan-ui/vue";
import { computed } from "vue";

const before = Array.from({ length: 30 }, (_, i) => `const item${i} = ${i}`).join("\n");
const after = before.replace("const item2 = 2", "const item2 = 200");

// 上限压到 6 行，两侧各砍掉 24 行
const model = computed(() => computeTextDiff(before, after, { maxLines: 6 }));
</script>

<template>
  <XhDiffViewRoot :model="model" :context-lines="2">
    <XhDiffViewHeader>src/items.ts</XhDiffViewHeader>
    <XhDiffViewViewport>
      <XhDiffViewBody />
    </XhDiffViewViewport>
    <!-- 断掉的差异看着仍像一份完整差异，没有这一条读的人会以为自己看完了 -->
    <XhDiffViewTruncation />
  </XhDiffViewRoot>
</template>
```

```html
<xh-diff-view id="diff-view-truncated" context-lines="2">
  <div data-xh-part="root">
    <div data-xh-part="header">src/items.ts</div>
    <div data-xh-part="viewport">
      <div data-xh-part="body"></div>
    </div>
    <!-- 断掉的差异看着仍像一份完整差异，没有这一条读的人会以为自己看完了 -->
    <div data-xh-part="truncation"></div>
  </div>
</xh-diff-view>

<script type="module">
  // 真实应用里这份模型来自 computeTextDiff（它会自己算出被砍掉多少行）；
  // 这份示例是裸 HTML、没有打包器，所以把模型直接写在这里
  const view = document.getElementById("diff-view-truncated");
  view.model = {
    truncated: true,
    truncatedLines: 48,
    hunks: [
      {
        header: "@@ -1,6 +1,6 @@",
        oldStart: 1,
        oldLines: 6,
        newStart: 1,
        newLines: 6,
        lines: [
          { change: "context", oldNumber: 1, newNumber: 1, text: "const item0 = 0" },
          { change: "context", oldNumber: 2, newNumber: 2, text: "const item1 = 1" },
          { change: "removed", oldNumber: 3, text: "const item2 = 2" },
          { change: "added", newNumber: 3, text: "const item2 = 200" },
          { change: "context", oldNumber: 4, newNumber: 4, text: "const item3 = 3" },
          { change: "context", oldNumber: 5, newNumber: 5, text: "const item4 = 4" },
        ],
      },
    ],
  };
</script>
```

### 尺寸

size 换字号、行高与行号槽的宽度，三档并列对照

```vue
<script setup lang="ts">
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewViewport } from "@xihan-ui/vue";
import { computed } from "vue";

const before = `export function clamp(n: number, min: number) {
  return Math.max(n, min)
}`;

const after = `export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}`;

const model = computed(() => computeTextDiff(before, after));
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhDiffViewRoot v-for="size in ['sm', 'md', 'lg']" :key="size" :model="model" :size="size">
      <XhDiffViewHeader>src/clamp.ts · {{ size }}</XhDiffViewHeader>
      <XhDiffViewViewport>
        <XhDiffViewBody />
      </XhDiffViewViewport>
    </XhDiffViewRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-diff-view class="diff-view-size" size="sm">
    <div data-xh-part="root">
      <div data-xh-part="header">src/clamp.ts · sm</div>
      <div data-xh-part="viewport">
        <div data-xh-part="body"></div>
      </div>
    </div>
  </xh-diff-view>

  <xh-diff-view class="diff-view-size">
    <div data-xh-part="root">
      <div data-xh-part="header">src/clamp.ts · md</div>
      <div data-xh-part="viewport">
        <div data-xh-part="body"></div>
      </div>
    </div>
  </xh-diff-view>

  <xh-diff-view class="diff-view-size" size="lg">
    <div data-xh-part="root">
      <div data-xh-part="header">src/clamp.ts · lg</div>
      <div data-xh-part="viewport">
        <div data-xh-part="body"></div>
      </div>
    </div>
  </xh-diff-view>
</div>

<script type="module">
  // 真实应用里这份模型来自 computeTextDiff 或 parseUnifiedPatch；
  // 这份示例是裸 HTML、没有打包器，所以把模型直接写在这里
  const model = {
    hunks: [
      {
        header: "@@ -1,3 +1,3 @@",
        oldStart: 1,
        oldLines: 3,
        newStart: 1,
        newLines: 3,
        lines: [
          { change: "removed", oldNumber: 1, text: "export function clamp(n: number, min: number) {" },
          { change: "added", newNumber: 1, text: "export function clamp(n: number, min: number, max: number) {" },
          { change: "removed", oldNumber: 2, text: "  return Math.max(n, min)" },
          { change: "added", newNumber: 2, text: "  return Math.min(Math.max(n, min), max)" },
          { change: "context", oldNumber: 3, newNumber: 3, text: "}" },
        ],
      },
    ],
  };
  for (const view of document.querySelectorAll(".diff-view-size")) view.model = model;
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-diff-view>` |
| Vue 组件 | `XhDiffViewBody` `XhDiffViewEmpty` `XhDiffViewHeader` `XhDiffViewRoot` `XhDiffViewSummary` `XhDiffViewTruncation` `XhDiffViewViewport` |
| 组合式函数 | `useDiffView` |
| 状态机 | `diffViewMachine` |
| 皮肤 | `@xihan-ui/styles/diff-view.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="diff-view"`：**`root`** · `header` · `summary` · **`viewport`** · **`body`** · `row` · `line-number` · `line-content` · `change-label` · `inline-change` · `token` · `gap` · `gap-cell` · `gap-trigger` · `empty` · `truncation`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | `DiffModel` |  | 差异模型，唯一入口。补丁与新旧两版文本都先归一到它。 |
| `view` | `DiffViewMode` |  |  |
| `contextLines` | `number` |  | 变更两侧各露几行上下文，其余折起来；不给或非有限值即不折叠。 |
| `expandedValue` | `readonly string[]` |  | 展开的折叠格 id 集合，给了即受控。 |
| `defaultExpandedValue` | `readonly string[]` |  |  |
| `wrap` | `boolean` |  | 长行原地折行，不再横向滚动；默认关。 |
| `size` | `Size` |  |  |
| `translations` | `Partial<DiffViewTranslations>` |  |  |
| `onExpandedValueChange` | `(details: DiffViewExpandedValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `expanded-value-change` | `DiffViewExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDiffViewRoot` | `default` | `DiffViewRootSlotProps` |  |
| `XhDiffViewSummary` | `default` | `{ count: number }` |  |
| `XhDiffViewTruncation` | `default` | `{ count: number }` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`GAP.EXPAND` · `GAP.COLLAPSE` · `CONTROLLED.EXPANDED.SET`

**判据**：`isExpandedControlled`

## connect API

`useDiffView` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `view` | `DiffViewMode` |  |
| `rows` | `readonly DiffViewRow[]` | 折叠后的可见行序，含折起来的那些格。 |
| `expandedValue` | `string[]` |  |
| `stats` | `{ added: number, removed: number }` | 增删各多少行。 |
| `truncated` | `boolean` | 模型被上限截断过。 |
| `truncatedLines` | `number` | 被上限砍掉、压根没进这份模型的源文本行数；没截断就是 0。 |
| `truncationText` | `string` | 截断提示条的文字，已把行数代进去；没截断时是空串。 |
| `isEmpty` | `boolean` | 一条变更都没有。 |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `toggleGap` | `(id: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getSummaryProps` | `(props: { change: DiffChange }) => T['element']` | 头部右侧的增删统计位，增删各一个。 |
| `getViewportProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getRowProps` | `(props: DiffViewRowProps) => T['element']` |  |
| `getLineNumberProps` | `(props: DiffViewCellProps) => T['element']` |  |
| `getLineContentProps` | `(props: DiffViewCellProps) => T['element']` |  |
| `getChangeLabelProps` | `(props: { change: DiffChange }) => T['element']` |  |
| `getInlineChangeProps` | `(props: DiffViewInlineChangeProps) => T['element']` |  |
| `getTokenProps` | `(token: CodeToken) => T['element']` |  |
| `getGapProps` | `(props: DiffViewGapProps) => T['element']` |  |
| `getGapCellProps` | `() => T['element']` |  |
| `getGapTriggerProps` | `(props: DiffViewGapProps) => T['button']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getTruncationProps` | `() => T['element']` | 截断提示条；没截断时带 hidden。 |
| `changeLabel` | `(change: DiffChange) => string` | 变更类型对应的读屏文字，写进视觉隐藏的那一格。 |
| `cellText` | `(props: DiffViewCellProps) => string \| undefined` | 这一行在这一侧的文本；split 下空侧为 undefined。 |
| `cellNumber` | `(props: DiffViewCellProps) => number \| undefined` | 这一行在这一侧的行号；没有就是 undefined。 |
| `cellTokens` | `(props: DiffViewCellProps) => readonly CodeToken[]` | 这一行在这一侧的着色片段；不着色或空侧时为空数组。 |
| `cellSegments` | `(props: DiffViewCellProps) => readonly DiffViewSegment[]` | 这一行在这一侧的词级片段，着色记号已按片段边界切好。 没算词级差异时为空数组，此时照 cellTokens / cellText 铺。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 差异视图在 Tab 序列中 | 滚动容器自身可聚焦，随后方向键的横纵滚动交给浏览器，组件不接管 |
| `Enter` / `Space` | 焦点在展开按钮上 | 展开该处折起来的上下文行；组件只接 click，按键走原生 button 的默认行为 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `body` | `aria-colcount` | 2 \| 1 |
| `body` | `aria-label` | undefined \| translations?.diff |
| `body` | `aria-labelledby` | `header` 部件的 id \| undefined |
| `body` | `aria-rowcount` | rows.length |
| `body` | `role` | 'table' |
| `row` | `aria-rowindex` | rowIndex |
| `row` | `role` | 'row' |
| `line-number` | `aria-hidden` | 'true' |
| `line-content` | `aria-colindex` | 2 \| 1 |
| `line-content` | `role` | 'cell' |
| `gap` | `role` | 'row' |
| `gap-cell` | `aria-colindex` | 1 |
| `gap-cell` | `role` | 'cell' |
| `gap-trigger` | `aria-expanded` | 'true' \| 'false' |
| `gap-trigger` | `aria-label` | expandGapLabel(hiddenCountOf(gapId)) |

- 表格语义：`role=table` 配 `role=row` 与 `role=cell`，带 `aria-rowcount` / `aria-rowindex` /
  `aria-colcount` / `aria-colindex`。列数只数**真正暴露的内容列**——行号不算列。
- 每一行都带一段视觉隐藏的变更类型文字：**变更不能只靠颜色传达**。
- 变更行还有一条非颜色线索：新增画实心色条，删除画同宽的斜纹条，灰度与高对比度下也分得开。
- 行号对读屏隐藏，由皮肤用 `attr()` 画出来，因此复制差异不会带上行号。
- **刻意不采表格那套行级 roving**：只读差异不是网格，给每份差异一个吞方向键的焦点组
  会把页面滚动抢走，而读屏本来就有表格浏览模式。这是显式裁决，不是遗漏。

## 样式

默认皮肤 `@xihan-ui/styles/diff-view.css` 按部件选择：`[data-scope="diff-view"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-truncated` | ''（条件成立时才出现） |
| `root` | `data-view` | props.view |
| `root` | `data-wrap` | ''（条件成立时才出现） |
| `summary` | `data-change` | change |
| `row` | `data-change` | lineAt(rowIndex)?.change |
| `row` | `data-revealed` | ''（条件成立时才出现） |
| `line-number` | `data-change` | lineAt(rowIndex)?.change |
| `line-number` | `data-line-number` | cellNumber({ rowIndex, side })?.toString() |
| `line-number` | `data-side` | side |
| `line-content` | `data-change` | lineAt(rowIndex)?.change |
| `line-content` | `data-empty` | ''（条件成立时才出现） |
| `line-content` | `data-side` | side |
| `change-label` | `data-change` | change |
| `inline-change` | `data-change` | lineAt(rowIndex)?.change \| undefined |
| `token` | `data-kind` | token.kind |
| `gap` | `data-expanded` | ''（条件成立时才出现） |
| `gap` | `data-value` | hunkIndex:0 |
| `gap-trigger` | `data-value` | hunkIndex:0 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-diff-view-added-bg` · `--xh-diff-view-added-fg` · `--xh-diff-view-bg` · `--xh-diff-view-border` · `--xh-diff-view-change-bar` · `--xh-diff-view-comment-fg` · `--xh-diff-view-empty-bg` · `--xh-diff-view-empty-fg` · `--xh-diff-view-font` · `--xh-diff-view-font-size` · `--xh-diff-view-gap-bg` · `--xh-diff-view-gap-bg-hover` · `--xh-diff-view-gap-fg` · `--xh-diff-view-gutter` · `--xh-diff-view-header-fg` · `--xh-diff-view-header-font-size` · `--xh-diff-view-header-gap` · `--xh-diff-view-icon-size` · `--xh-diff-view-inline-change-radius` · `--xh-diff-view-keyword-fg` · `--xh-diff-view-keyword-weight` · `--xh-diff-view-line-height` · `--xh-diff-view-max-h` · `--xh-diff-view-number-fg` · `--xh-diff-view-number-token-fg` · `--xh-diff-view-punctuation-fg` · `--xh-diff-view-px` · `--xh-diff-view-py` · `--xh-diff-view-radius` · `--xh-diff-view-removed-bg` · `--xh-diff-view-removed-fg` · `--xh-diff-view-shadow` · `--xh-diff-view-string-fg` · `--xh-diff-view-truncation-bg` · `--xh-diff-view-truncation-border` · `--xh-diff-view-truncation-fg` · `--xh-diff-view-truncation-gap`

## 动效

关键帧 `xh-diff-view-reveal` 随皮肤自带，不引用别处文件里的名字；`background` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 单栏与并排的切换用[开关组](./toggle-group)；增删统计已有成品位，不必再自己拼
  （只要数字不要版式时仍可用 `diffStats(model)`）。
- 装进[工具调用](./tool-call)的详情区，展示这次调用改了什么。
- 要做「AI 提议的编辑逐条取舍 + 应用」：用[表格](./table)的选择机制承载行级取舍，
  单元格里放[复选框](./checkbox)，页脚的计数与「应用」用[按钮](./button)。
  差异视图本身只读，不接这套交互。

## 最佳实践

- 并排视图给足宽度：两列各自还要横向滚动，窄栏下单栏更好读，或者开 `wrap` 让长行折下来。
- 折叠阈值取三到五行：再少就一直在点展开，再多就等于没折。

## 反模式

- 截断了却不渲 `truncation`：断掉的差异看着仍像一份完整差异，评审的人会以为自己看完了。
- 拿补丁算出来的差异去着色：那份文本是残缺的，跨行的记号一定切错。
- 用颜色作为变更类型的唯一线索：色觉障碍与高对比度模式下它就消失了。
