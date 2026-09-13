来源：https://ui.docs.xihanfun.com/components/pagination

# Pagination 分页 `alpha`

用于在分页结果之间导航。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/pagination" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/pagination.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/pagination" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/pagination" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/pagination.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在页码之间导航

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages }"
    :count="196"
    :page-size="10"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination
  id="pagination-basic"
  count="196"
  page-size="10"
>
  <nav data-xh-part="root">
    <button data-xh-part="prev-trigger"></button>
    <button data-xh-part="item" value="1">1</button>
    <button data-xh-part="item" value="2">2</button>
    <button data-xh-part="item" value="3">3</button>
    <button data-xh-part="item" value="4">4</button>
    <button data-xh-part="item" value="5">5</button>
    <button data-xh-part="ellipsis-trigger" side="end"></button>
    <button data-xh-part="item" value="20">20</button>
    <button data-xh-part="next-trigger"></button>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-basic");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');

  function render() {
    for (const node of root.querySelectorAll(
      '[data-xh-part="item"], [data-xh-part="ellipsis-trigger"]',
    ))
      node.remove();
    for (const item of host.pageItems) {
      const el = document.createElement("button");
      if (item.type === "ellipsis") {
        el.dataset.xhPart = "ellipsis-trigger";
        el.setAttribute("side", item.side);
      } else {
        el.dataset.xhPart = "item";
        el.setAttribute("value", String(item.value));
        el.textContent = String(item.value);
      }
      root.insertBefore(el, next);
    }
  }

  host.addEventListener("page-change", render);
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="pagination"`：**`root`** · `summary` · `jumper` · `prev-trigger` · `next-trigger` · **`item`** · `ellipsis-trigger` · `page-size-select` · `positioner` · `content`

## 示例

### 尺寸

适配不同的界面密度

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "中" },
  { value: "lg", label: "大" },
];
</script>

<template>
  <div style="inline-size: min(720px, 100%); display: grid; gap: 16px">
    <div
      v-for="s in sizes"
      :key="s.label"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 40px; flex: none; color: var(--xh-fg-muted)">{{ s.label }}</span>
      <XhPaginationRoot
        v-slot="{ pages }"
        :count="200"
        :page-size="10"
        :default-page="4"
        :size="s.value"
      >
        <XhPaginationPrevTrigger />
        <template v-for="(p, i) in pages" :key="`${p}-${i}`">
          <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
          <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
        </template>
        <XhPaginationNextTrigger />
      </XhPaginationRoot>
    </div>
  </div>
</template>
```

```html
<div id="pagination-size" style="inline-size: min(720px, 100%); display: grid; gap: 16px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; color: var(--xh-fg-muted)">小</span>
    <xh-pagination count="200" page-size="10" default-page="4" size="sm">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="ellipsis-trigger" side="end"></button>
        <button data-xh-part="item" value="20">20</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; color: var(--xh-fg-muted)">中</span>
    <xh-pagination count="200" page-size="10" default-page="4">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="ellipsis-trigger" side="end"></button>
        <button data-xh-part="item" value="20">20</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; color: var(--xh-fg-muted)">大</span>
    <xh-pagination count="200" page-size="10" default-page="4" size="lg">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="ellipsis-trigger" side="end"></button>
        <button data-xh-part="item" value="20">20</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>
</div>

<script type="module">
  for (const host of document.querySelectorAll(
    "#pagination-size xh-pagination",
  )) {
    const root = host.querySelector('[data-xh-part="root"]');
    const next = root.querySelector('[data-xh-part="next-trigger"]');

    host.addEventListener("page-change", () => {
      for (const node of root.querySelectorAll(
        '[data-xh-part="item"], [data-xh-part="ellipsis-trigger"]',
      ))
        node.remove();
      for (const item of host.pageItems) {
        const el = document.createElement("button");
        if (item.type === "ellipsis") {
          el.dataset.xhPart = "ellipsis-trigger";
          el.setAttribute("side", item.side);
        } else {
          el.dataset.xhPart = "item";
          el.setAttribute("value", String(item.value));
          el.textContent = String(item.value);
        }
        root.insertBefore(el, next);
      }
    });
  }
</script>
```

### 简洁模式

只显示上一页、当前页与下一页

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const page = ref(2);
</script>

<template>
  <XhPaginationRoot
    v-slot="{ page: current, totalPages }"
    v-model:page="page"
    :count="1000"
    :page-size="10"
  >
    <XhPaginationPrevTrigger />
    <span>{{ current }} / {{ totalPages }}</span>
    <XhPaginationNextTrigger />
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination
  id="pagination-simple"
  count="1000"
  page-size="10"
  page="2"
>
  <nav data-xh-part="root">
    <button data-xh-part="prev-trigger"></button>
    <button id="pagination-simple-current" data-xh-part="item" value="2">
      2
    </button>
    <span id="pagination-simple-total">/ 100</span>
    <button data-xh-part="next-trigger"></button>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-simple");
  const current = document.getElementById("pagination-simple-current");
  const total = document.getElementById("pagination-simple-total");

  host.addEventListener("page-change", (event) => {
    host.page = event.detail.page;
    current.setAttribute("value", String(host.currentPage));
    current.textContent = String(host.currentPage);
    total.textContent = `/ ${host.totalPages}`;
  });
</script>
```

### 快速跳页

输入页码后按 Enter 跳转

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationJumper,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPaginationRoot v-slot="{ pages }" :count="1000" :page-size="10" :default-page="5">
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
    <XhPaginationJumper placeholder="页码" />
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination id="pagination-jumper" count="1000" page-size="10" default-page="5">
  <nav data-xh-part="root">
    <button data-xh-part="prev-trigger"></button>
    <button data-xh-part="item" value="1">1</button>
    <button data-xh-part="ellipsis-trigger" side="start"></button>
    <button data-xh-part="item" value="4">4</button>
    <button data-xh-part="item" value="5">5</button>
    <button data-xh-part="item" value="6">6</button>
    <button data-xh-part="ellipsis-trigger" side="end"></button>
    <button data-xh-part="item" value="100">100</button>
    <button data-xh-part="next-trigger"></button>
    <input data-xh-part="jumper" placeholder="页码" />
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-jumper");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');

  function render() {
    for (const node of root.querySelectorAll(
      '[data-xh-part="item"], [data-xh-part="ellipsis-trigger"]',
    ))
      node.remove();
    for (const item of host.pageItems) {
      const el = document.createElement("button");
      if (item.type === "ellipsis") {
        el.dataset.xhPart = "ellipsis-trigger";
        el.setAttribute("side", item.side);
      } else {
        el.dataset.xhPart = "item";
        el.setAttribute("value", String(item.value));
        el.textContent = String(item.value);
      }
      root.insertBefore(el, next);
    }
  }

  host.addEventListener("page-change", render);
</script>
```

### 每页条数

调整每页展示数量

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPageSizeSelect,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhPaginationSummary,
} from "@xihan-ui/vue";

const translations = {
  pageSizeOption: (size: number) => `${size} 条 / 页`,
  summary: (start: number, end: number, total: number) => `第 ${start}-${end} 条，共 ${total} 条`,
};
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages }"
    :count="196"
    :default-page-size="10"
    :page-size-options="[10, 20, 50]"
    :default-page="8"
    :translations="translations"
  >
    <XhPaginationSummary />
    <XhPaginationPageSizeSelect />

    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination
  id="pagination-page-size"
  count="196"
  default-page-size="10"
  default-page="8"
>
  <nav data-xh-part="root">
    <span id="pagination-page-size-summary" data-xh-part="summary">
      第 71-80 条，共 196 条
    </span>
    <div data-xh-part="page-size-select"></div>

    <button data-xh-part="prev-trigger"></button>
    <button data-xh-part="item" value="1">1</button>
    <button data-xh-part="ellipsis-trigger" side="start"></button>
    <button data-xh-part="item" value="7">7</button>
    <button data-xh-part="item" value="8">8</button>
    <button data-xh-part="item" value="9">9</button>
    <button data-xh-part="ellipsis-trigger" side="end"></button>
    <button data-xh-part="item" value="20">20</button>
    <button data-xh-part="next-trigger"></button>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-page-size");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');
  const summary = document.getElementById("pagination-page-size-summary");

  host.pageSizeOptions = [10, 20, 50];
  host.translations = {
    pageSizeOption: (size) => `${size} 条 / 页`,
    summary: (start, end, total) => `第 ${start}-${end} 条，共 ${total} 条`,
  };

  function render() {
    for (const node of root.querySelectorAll(
      '[data-xh-part="item"], [data-xh-part="ellipsis-trigger"]',
    ))
      node.remove();
    for (const item of host.pageItems) {
      const el = document.createElement("button");
      if (item.type === "ellipsis") {
        el.dataset.xhPart = "ellipsis-trigger";
        el.setAttribute("side", item.side);
      } else {
        el.dataset.xhPart = "item";
        el.setAttribute("value", String(item.value));
        el.textContent = String(item.value);
      }
      root.insertBefore(el, next);
    }
    const { start, end } = host.pageRange;
    summary.textContent = `第 ${start}-${end} 条，共 ${host.count} 条`;
  }

  host.addEventListener("page-change", render);
  host.addEventListener("page-size-change", render);
</script>
```

### 展开省略位

查看被折叠的页码

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhPaginationContent,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPositioner,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pageItems }"
    :count="2000"
    :page-size="10"
    :default-page="100"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(item, i) in pageItems" :key="`${item.type}-${i}`">
      <XhPaginationEllipsisTrigger v-if="item.type === 'ellipsis'" :side="item.side" />
      <XhPaginationItem v-else :value="item.value">{{ item.value }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />

    <XhPaginationPositioner>
      <XhPaginationContent v-slot="{ pages }">
        <XhPaginationItem v-for="p in pages" :key="p" :value="p">{{ p }}</XhPaginationItem>
      </XhPaginationContent>
    </XhPaginationPositioner>
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination
  id="pagination-expand"
  count="2000"
  page-size="10"
  default-page="100"
>
  <nav data-xh-part="root">
    <button data-xh-part="prev-trigger"></button>
    <button data-xh-part="item" value="1">1</button>
    <button data-xh-part="ellipsis-trigger" side="start"></button>
    <button data-xh-part="item" value="99">99</button>
    <button data-xh-part="item" value="100">100</button>
    <button data-xh-part="item" value="101">101</button>
    <button data-xh-part="ellipsis-trigger" side="end"></button>
    <button data-xh-part="item" value="200">200</button>
    <button data-xh-part="next-trigger"></button>

    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-expand");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');
  const content = root.querySelector('[data-xh-part="content"]');

  function makeItem(value) {
    const el = document.createElement("button");
    el.dataset.xhPart = "item";
    el.setAttribute("value", String(value));
    el.textContent = String(value);
    return el;
  }

  function render() {
    for (const node of [...root.children]) {
      const part = node.dataset.xhPart;
      if (part === "item" || part === "ellipsis-trigger") node.remove();
    }
    for (const item of host.pageItems) {
      if (item.type === "ellipsis") {
        const el = document.createElement("button");
        el.dataset.xhPart = "ellipsis-trigger";
        el.setAttribute("side", item.side);
        root.insertBefore(el, next);
      } else {
        root.insertBefore(makeItem(item.value), next);
      }
    }
  }

  let filled = null;

  function fill(el) {
    const side = el.getAttribute("side");
    if (filled === side) return;
    filled = side;
    const folded = host.pageItems.find(
      (item) => item.type === "ellipsis" && item.side === side,
    );
    content.replaceChildren(...(folded?.pages ?? []).map(makeItem));
  }

  for (const type of ["pointerover", "click"]) {
    root.addEventListener(type, (event) => {
      const el = event.target.closest('[data-xh-part="ellipsis-trigger"]');
      if (el) fill(el);
    });
  }

  host.addEventListener("page-change", () => {
    filled = null;
    render();
  });
</script>
```

## 设计指引

### 何时使用

- 结果总数已知，需要跳转到指定页。
- 用户需要确认当前位置与剩余页数。

### 何时不用

- 连续加载的内容流，使用[无限滚动](./infinite-scroll)。
- 数据量较少，无需分页。

### 特性

- `count` 表示总条数，`pageSize` 表示每页条数。
- `siblingCount` 控制当前页两侧展示的页码数量。
- 支持上一页、下一页、跳页、每页数量与可展开省略位。
- 更改 `pageSize` 后自动重算总页数并校正当前页。

### 组合

- `summary` 显示当前结果范围。
- `jumper` 用于输入页码并按 Enter 跳转。
- `page-size-select` 提供每页数量选择。

### 最佳实践

- 将当前页同步到地址，便于刷新和分享。
- 数据加载期间保留分页器，避免布局跳动。

### 反模式

- 不要将 `count` 当作总页数。
- 不要在结果很少时使用分页。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pagination>` |
| Vue 组件 | `XhPaginationContent` `XhPaginationEllipsisTrigger` `XhPaginationItem` `XhPaginationJumper` `XhPaginationNextTrigger` `XhPaginationPageSizeSelect` `XhPaginationPositioner` `XhPaginationPrevTrigger` `XhPaginationRoot` `XhPaginationSummary` |
| 组合式函数 | `usePagination` |
| 状态机 | `paginationMachine` |
| 皮肤 | `@xihan-ui/styles/pagination.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 总条数（不是总页数）。总页数由它与 pageSize 算出。 |
| `pageSize` | `number` |  | 每页条数，默认 10；小于 1 的值一律按 1 处理。给定即受控，语义同 page。 |
| `defaultPageSize` | `number` |  | 非受控初始每页条数，默认 10。 |
| `pageSizeOptions` | `number[]` |  | 可选的每页条数档位，默认 [10, 20, 50, 100]。只做取值来源，不决定长相。 |
| `page` | `number` |  | 当前页。给定即受控：内部不再自改，只发 onPageChange。 |
| `defaultPage` | `number` |  | 非受控初始页，默认 1。 |
| `siblingCount` | `number` |  | 当前页两侧各显示几页，默认 1。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；上一页/下一页的语义不随之翻转，"上一页"永远是 page - 1。 |
| `translations` | `Partial<PaginationTranslations>` |  |  |
| `placement` | `Placement` |  | 省略位展开后的落点，默认 bottom-start（列表类浮层）。 |
| `offset` | `number` |  | 浮层与省略位之间的间距（px），默认 8。 |
| `openDelay` | `number` |  | 指针停在省略位多久才展开（ms），默认 200。 |
| `closeDelay` | `number` |  | 指针离开后多久收起（ms），默认 300：留出斜着划进浮层的时间。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onPageChange` | `(details: PaginationPageChangeDetails) => void` |  | 页码变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onPageSizeChange` | `(details: PaginationPageSizeChangeDetails) => void` |  | 每页条数变化意图回调，语义同上；一并给出换算后的页码。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `page-change` | `PaginationPageChangeDetails` | 页码变化；detail 为 `{ page: number, pageSize: number }` |
| `page-size-change` | `` | 每页条数变化；detail 为 `{ pageSize: number, page: number }`，页码是换算后的 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPaginationContent` | `default` | `{ pages: number[] }` |  |
| `XhPaginationRoot` | `default` | `PaginationRootSlotProps` |  |
| `XhPaginationSummary` | `default` | `{ summaryText: string, start: number, end: number, count: number }` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `ellipsis-trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**事件**：`PAGE.SET` · `PAGE_SIZE.SET` · `PAGE.PREV` · `PAGE.NEXT` · `ELLIPSIS.ENTER` · `ELLIPSIS.LEAVE` · `ELLIPSIS.TOGGLE` · `ELLIPSIS.CLOSE` · `after.openDelay` · `after.closeDelay`

**判据**：`isSameEllipsis`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `page` | `number` | 当前页，恒在 [1, max(totalPages, 1)] 内。 |
| `pageSize` | `number` |  |
| `pageSizeOptions` | `number[]` | 可选的每页条数档位，缺省 [10, 20, 50, 100]；已按升序去重并夹到至少 1。 |
| `count` | `number` |  |
| `totalPages` | `number` |  |
| `pages` | `PaginationPage[]` | 页码序列，作者照着渲染 item 与 ellipsis-trigger。 |
| `pageItems` | `PaginationPageItem[]` | 同一串序列，但省略位带着被折叠的那几页——摊开省略号要靠它。 |
| `openEllipsis` | `PaginationEllipsisSide \| null` | 此刻摊开的是哪一侧的省略位；没摊开为 null。 |
| `pageRange` | `PaginationEntryRange` | 当前页对应的条目区间，1 基闭区间；无数据时是 { start: 0, end: 0 }。 |
| `summaryText` | `string` | 信息区文本，由 translations.summary 与 pageRange / count 算出。 |
| `previousPage` | `number \| null` | 上一页页码；已在首页（或无数据）时为 null。 |
| `nextPage` | `number \| null` |  |
| `setPage` | `(page: number) => void` | 页码会被夹进合法区间，越界入参不会写出越界的页。 |
| `goToPrevPage` | `() => void` |  |
| `goToNextPage` | `() => void` |  |
| `setPageSize` | `(pageSize: number) => void` | 换每页条数：页码跟着换算，让改档前第一条仍留在页内。 |
| `slice` | `<V>(data: readonly V[]) => V[]` | 按当前页从整份数据里切出这一页。 |
| `getRootProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` | 信息区容器；文本作者自己放，缺省用 api.summaryText。 |
| `getJumperProps` | `() => T['input']` | 跳页输入框：敲页码按回车即跳，越界值由 setPage 夹回合法区间。 |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getItemProps` | `(props: PaginationItemProps) => T['button']` |  |
| `getEllipsisTriggerProps` | `(props: PaginationEllipsisTriggerProps) => T['button']` | 省略位：可展开的按钮，摊开后列出被折叠的页码。 |
| `getPageSizeSelectProps` | `() => T['element']` | 每页条数控制器的挂载点：只管排布的一格，控件本体是内嵌下拉的角色节点。 |
| `pageSizeSelect` | `SelectApi<T>` | 每页条数那个下拉，整份 select 的 api。档位由 collection 给出（文字取 translations.pageSizeOption），选中值即当前每页条数；作者照它渲染 select 的角色节点。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `closeEllipsis` | `() => void` | 收起摊开的省略位。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in item | 跳到该页码（原生按钮激活，平台把按键翻成 click） |
| `Enter` / `Space` | focus in prev-trigger, 非首页 | 回上一页；首页时按钮是原生 disabled，焦点根本落不上去 |
| `Enter` / `Space` | focus in next-trigger, 非末页 | 进下一页；末页时按钮是原生 disabled |
| `Enter` / `Space` | focus in ellipsis-trigger | 摊开被折叠的那几页；再按一次收起。纯悬停会把键盘用户挡在外面，而那几页除了这里没有别的入口 |
| `Escape` | ellipsis-trigger 已摊开 | 收起摊开的页码面板（走消解层，点面板外面同样收起） |
| `Tab` / `Shift+Tab` | focus in root | 逐个走过每个可用按钮——分页不做 roving tabindex，用户要能 Tab 到某一页再确认；禁用的首尾按钮自动脱序 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | label.root |
| `jumper` | `aria-label` | label.jumper |
| `prev-trigger` | `aria-label` | label.prevTrigger |
| `next-trigger` | `aria-label` | label.nextTrigger |
| `item` | `aria-current` | 'page' \| undefined |
| `item` | `aria-label` | label.item(item.page) |
| `ellipsis-trigger` | `aria-controls` | `content` 部件的 id \| undefined |
| `ellipsis-trigger` | `aria-expanded` | 'true' \| 'false' |
| `ellipsis-trigger` | `aria-haspopup` | 'true' |
| `ellipsis-trigger` | `aria-label` | label.ellipsis( (items.find(item =&gt; item.type === 'el… |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | label.ellipsis(folded.length) |
| `content` | `role` | 'group' |

## 样式参考

### 皮肤

`@xihan-ui/styles/pagination.css` 使用 `[data-scope="pagination"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `summary` | `data-empty` | ''（条件成立时才出现） |
| `jumper` | `data-empty` | ''（条件成立时才出现） |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-current` | ''（条件成立时才出现） |
| `ellipsis-trigger` | `data-side` | props.side |
| `ellipsis-trigger` | `data-state` | 'open' \| 'closed' |
| `page-size-select` | `data-empty` | ''（条件成立时才出现） |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-pagination-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | pagination 的 content 部件 background 覆盖槽。 |
| `--xh-pagination-content-border` | `content` | `border` | `default` | `--xh-border-default` | pagination 的 content 部件 border 覆盖槽。 |
| `--xh-pagination-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | pagination 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-pagination-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | pagination 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-pagination-content-p` | `content` | `padding` | `default` | `--xh-space-1` | pagination 的 content 部件 padding 覆盖槽。 |
| `--xh-pagination-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | pagination 的 content 部件 border-radius 覆盖槽。 |
| `--xh-pagination-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` | pagination 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-pagination-ellipsis-trigger-fg` | `ellipsis-trigger` | `color` | `default` | `--xh-fg-subtle` | pagination 的 ellipsis-trigger 部件 color 覆盖槽。 |
| `--xh-pagination-font-size` | `ellipsis-trigger`<br>`item`<br>`jumper`<br>`next-trigger`<br>`prev-trigger`<br>`summary` | `font-size` | `default` | `--xh-_pagination-font-size` | pagination 的 ellipsis-trigger、item、jumper、next-trigger、prev-trigger、summary 部件 font-size 覆盖槽。 |
| `--xh-pagination-gap` | `content`<br>`root` | `gap` | `default` | `--xh-space-1` | pagination 的 content、root 部件 gap 覆盖槽。 |
| `--xh-pagination-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])` | `--xh-glyph-size-text` | pagination 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-pagination-item-bg` | `ellipsis-trigger`<br>`item`<br>`next-trigger`<br>`prev-trigger` | `background` | `default` | `transparent` | pagination 的 ellipsis-trigger、item、next-trigger、prev-trigger 部件 background 覆盖槽。 |
| `--xh-pagination-item-bg-active` | `ellipsis-trigger`<br>`item`<br>`next-trigger`<br>`prev-trigger` | `background` | `active`<br>`current`<br>`not(:disabled)`<br>`not([data-current])` | `--xh-bg-subtle-active` | pagination 的 ellipsis-trigger、item、next-trigger、prev-trigger 部件 background 覆盖槽。 |
| `--xh-pagination-item-bg-hover` | `ellipsis-trigger`<br>`item`<br>`next-trigger`<br>`prev-trigger` | `background` | `current`<br>`hover`<br>`not(:disabled)`<br>`not([data-current])` | `--xh-bg-subtle-hover` | pagination 的 ellipsis-trigger、item、next-trigger、prev-trigger 部件 background 覆盖槽。 |
| `--xh-pagination-item-bg-selected` | `item` | `background` | `current` | `--xh-_pagination-selected-bg` | pagination 的 item 部件 background 覆盖槽。 |
| `--xh-pagination-item-bg-selected-active` | `item` | `background` | `active`<br>`current` | `--xh-_pagination-selected-bg-active` | pagination 的 item 部件 background 覆盖槽。 |
| `--xh-pagination-item-bg-selected-hover` | `item` | `background` | `current`<br>`hover` | `--xh-_pagination-selected-bg-hover` | pagination 的 item 部件 background 覆盖槽。 |
| `--xh-pagination-item-border-selected` | `item` | `border-color` | `current` | `--xh-_pagination-selected-bg` | pagination 的 item 部件 border-color 覆盖槽。 |
| `--xh-pagination-item-border-selected-active` | `item` | `border-color` | `active`<br>`current` | `--xh-_pagination-selected-bg-active` | pagination 的 item 部件 border-color 覆盖槽。 |
| `--xh-pagination-item-border-selected-hover` | `item` | `border-color` | `current`<br>`hover` | `--xh-_pagination-selected-bg-hover` | pagination 的 item 部件 border-color 覆盖槽。 |
| `--xh-pagination-item-fg` | `ellipsis-trigger`<br>`item`<br>`jumper`<br>`next-trigger`<br>`prev-trigger` | `color` | `default` | `--xh-fg-default` | pagination 的 ellipsis-trigger、item、jumper、next-trigger、prev-trigger 部件 color 覆盖槽。 |
| `--xh-pagination-item-fg-selected` | `item` | `color` | `current` | `--xh-_pagination-selected-fg` | pagination 的 item 部件 color 覆盖槽。 |
| `--xh-pagination-item-font-weight` | `ellipsis-trigger`<br>`item`<br>`next-trigger`<br>`prev-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | pagination 的 ellipsis-trigger、item、next-trigger、prev-trigger 部件 font-weight 覆盖槽。 |
| `--xh-pagination-item-h` | `ellipsis-trigger`<br>`item`<br>`jumper`<br>`next-trigger`<br>`prev-trigger`<br>`summary` | `block-size` | `default` | `--xh-_pagination-item-size` | pagination 的 ellipsis-trigger、item、jumper、next-trigger、prev-trigger、summary 部件 block-size 覆盖槽。 |
| `--xh-pagination-item-min-size` | `ellipsis-trigger`<br>`item`<br>`next-trigger`<br>`prev-trigger` | `min-inline-size` | `default` | `--xh-_pagination-item-size` | pagination 的 ellipsis-trigger、item、next-trigger、prev-trigger 部件 min-inline-size 覆盖槽。 |
| `--xh-pagination-item-px` | `ellipsis-trigger`<br>`item`<br>`jumper`<br>`next-trigger`<br>`prev-trigger` | `padding-inline` | `default` | `--xh-_pagination-item-px` | pagination 的 ellipsis-trigger、item、jumper、next-trigger、prev-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-pagination-item-radius` | `ellipsis-trigger`<br>`item`<br>`jumper`<br>`next-trigger`<br>`prev-trigger` | `border-radius` | `default` | `--xh-shape-control` | pagination 的 ellipsis-trigger、item、jumper、next-trigger、prev-trigger 部件 border-radius 覆盖槽。 |
| `--xh-pagination-item-shadow` | `item` | `box-shadow` | `current` | `--xh-_pagination-highlight` | pagination 的 item 部件 box-shadow 覆盖槽。 |
| `--xh-pagination-jumper-bg` | `jumper` | `background` | `default` | `--xh-bg-surface` | pagination 的 jumper 部件 background 覆盖槽。 |
| `--xh-pagination-jumper-bg-hover` | `jumper` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | pagination 的 jumper 部件 background 覆盖槽。 |
| `--xh-pagination-jumper-border` | `jumper` | `border` | `default` | `--xh-border-default` | pagination 的 jumper 部件 border 覆盖槽。 |
| `--xh-pagination-jumper-border-hover` | `jumper` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-border-strong` | pagination 的 jumper 部件 border-color 覆盖槽。 |
| `--xh-pagination-jumper-w` | `jumper` | `inline-size` | `default` | `--xh-space-8` | pagination 的 jumper 部件 inline-size 覆盖槽。 |
| `--xh-pagination-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | pagination 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-pagination-summary-fg` | `summary` | `color` | `default` | `--xh-fg-muted` | pagination 的 summary 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
