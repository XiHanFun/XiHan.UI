来源：https://ui.docs.xihanfun.com/components/pagination

# Pagination `分页`

把一份很长的结果切成一页一页，并给出当前位置与去处。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/pagination" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/pagination.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/pagination" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/pagination" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/pagination.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

count 给的是总条数不是总页数；页码序列由 root 的插槽交出来，作者照着渲染 item 与省略号

```vue
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
    v-slot="{ pages, page, totalPages }"
    :count="196"
    :page-size="10"
    style="inline-size: 100%"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
    <span style="flex-basis: 100%">第 {{ page }} / {{ totalPages }} 页</span>
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination
  id="pagination-basic"
  count="196"
  page-size="10"
  style="inline-size: 100%"
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
    <span id="pagination-basic-readout" style="flex-basis: 100%">
      第 1 / 20 页
    </span>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-basic");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');
  const readout = document.getElementById("pagination-basic-readout");

  // 换页就把上一轮的格子摘掉，照元素交出来的 pageItems 重挂：
  // 几号页、哪里出省略号、省略位算哪一侧，全由它说了算，总页数也不必自己除一遍
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
    readout.textContent = `第 ${host.currentPage} / ${host.totalPages} 页`;
  }

  // 非受控：事件发出来时页码已经落进元素，直接重读取数口
  host.addEventListener("page-change", render);
</script>
```

## 示例

### 受控与切片

传了 page 就由宿主说了算；当前页决定从整份数据里切出哪一段

```vue
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const rows = Array.from({ length: 23 }, (_, i) => `第 ${i + 1} 条记录`);
const page = ref(1);
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages, pageRange, count, slice }"
    v-model:page="page"
    :count="rows.length"
    :page-size="5"
    style="inline-size: 100%"
  >
    <ul style="flex-basis: 100%; margin: 0 0 4px; padding-inline-start: 20px">
      <li v-for="row in slice(rows)" :key="row">{{ row }}</li>
    </ul>

    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />
    <span style="flex-basis: 100%">
      第 {{ pageRange.start }}-{{ pageRange.end }} 条，共 {{ count }} 条
    </span>
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination
  id="pagination-controlled"
  count="23"
  page-size="5"
  page="1"
  style="inline-size: 100%"
>
  <nav data-xh-part="root">
    <ul
      id="pagination-controlled-rows"
      style="flex-basis: 100%; margin: 0 0 4px; padding-inline-start: 20px"
    ></ul>

    <button data-xh-part="prev-trigger"></button>
    <button data-xh-part="item" value="1">1</button>
    <button data-xh-part="item" value="2">2</button>
    <button data-xh-part="item" value="3">3</button>
    <button data-xh-part="item" value="4">4</button>
    <button data-xh-part="item" value="5">5</button>
    <button data-xh-part="next-trigger"></button>
    <span id="pagination-controlled-range" style="flex-basis: 100%"></span>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-controlled");
  const list = document.getElementById("pagination-controlled-rows");
  const range = document.getElementById("pagination-controlled-range");
  const rows = Array.from({ length: 23 }, (_, i) => `第 ${i + 1} 条记录`);

  // 切片与条目区间都按当前页从元素上取：偏移量与末页那个不满的右端都不必自己算
  function render() {
    list.replaceChildren(
      ...host.slice(rows).map((row) => {
        const li = document.createElement("li");
        li.textContent = row;
        return li;
      }),
    );
    const { start, end } = host.pageRange;
    range.textContent = `第 ${start}-${end} 条，共 ${host.count} 条`;
  }

  render();
  host.addEventListener("page-change", (event) => {
    // 受控：先把新页码写回 page，切出来的才是这一页
    host.page = event.detail.page;
    render();
  });
</script>
```

### 两侧页数

sibling-count 决定当前页两侧各留几页，序列长度恒定，切页时省略号左右挪、按钮不抖

```vue
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
    :count="500"
    :page-size="10"
    :default-page="12"
    :sibling-count="2"
    style="inline-size: 100%"
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
  id="pagination-siblings"
  count="500"
  page-size="10"
  default-page="12"
  sibling-count="2"
  style="inline-size: 100%"
>
  <nav data-xh-part="root">
    <button data-xh-part="prev-trigger"></button>
    <button data-xh-part="item" value="1">1</button>
    <button data-xh-part="ellipsis-trigger" side="start"></button>
    <button data-xh-part="item" value="10">10</button>
    <button data-xh-part="item" value="11">11</button>
    <button data-xh-part="item" value="12">12</button>
    <button data-xh-part="item" value="13">13</button>
    <button data-xh-part="item" value="14">14</button>
    <button data-xh-part="ellipsis-trigger" side="end"></button>
    <button data-xh-part="item" value="50">50</button>
    <button data-xh-part="next-trigger"></button>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-siblings");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');

  // 序列照 sibling-count 折好了才交出来：每一轮的格子数恒为 siblings * 2 + 5，
  // 省略位在其中左右挪，一行的宽度不变
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

### 读屏文案

translations 换掉 nav 地标名与各按钮的 aria-label，默认是英文

```vue
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const translations = {
  root: "订单列表分页",
  prevTrigger: "上一页",
  nextTrigger: "下一页",
  item: (page: number) => `第 ${page} 页`,
};
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages }"
    :count="80"
    :page-size="10"
    :translations="translations"
    style="inline-size: 100%"
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
  id="pagination-i18n"
  count="80"
  page-size="10"
  style="inline-size: 100%"
>
  <nav data-xh-part="root">
    <button data-xh-part="prev-trigger"></button>
    <button data-xh-part="item" value="1">1</button>
    <button data-xh-part="item" value="2">2</button>
    <button data-xh-part="item" value="3">3</button>
    <button data-xh-part="item" value="4">4</button>
    <button data-xh-part="item" value="5">5</button>
    <button data-xh-part="ellipsis-trigger" side="end"></button>
    <button data-xh-part="item" value="8">8</button>
    <button data-xh-part="next-trigger"></button>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-i18n");

  // 文案是对象、页码那条还是函数，只走 property
  host.translations = {
    root: "订单列表分页",
    prevTrigger: "上一页",
    nextTrigger: "下一页",
    item: (page) => `第 ${page} 页`,
  };

  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');

  // 序列照旧从元素上取；换页重挂的格子由元素接线，aria-label 一并按新文案写上去
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

### 语气

tone 换的是当前页选中态的底色与文字色，这里预置第 3 页为当前页

```vue
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "brand（缺省）" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "danger", label: "danger" },
  { value: "info", label: "info" },
];
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <div
      v-for="t in tones"
      :key="t.value"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 120px; flex: none">{{ t.label }}</span>
      <XhPaginationRoot
        v-slot="{ pages }"
        :count="50"
        :page-size="10"
        :default-page="3"
        :tone="t.value"
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
<div style="inline-size: 100%; display: grid; gap: 12px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">brand（缺省）</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="brand">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">neutral</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="neutral">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">success</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="success">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">warning</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="warning">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">danger</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="danger">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">info</span>
    <xh-pagination count="50" page-size="10" default-page="3" tone="info">
      <nav data-xh-part="root">
        <button data-xh-part="prev-trigger"></button>
        <button data-xh-part="item" value="1">1</button>
        <button data-xh-part="item" value="2">2</button>
        <button data-xh-part="item" value="3">3</button>
        <button data-xh-part="item" value="4">4</button>
        <button data-xh-part="item" value="5">5</button>
        <button data-xh-part="next-trigger"></button>
      </nav>
    </xh-pagination>
  </div>
</div>
```

### 尺寸

size 一档换掉页码格子的高度、内边距与字号，上一页 / 下一页与省略号一并跟着变

```vue
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
];
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 16px">
    <div
      v-for="s in sizes"
      :key="s.label"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 60px; flex: none">{{ s.label }}</span>
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
<div id="pagination-size" style="inline-size: 100%; display: grid; gap: 16px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 60px; flex: none">sm</span>
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
    <span style="inline-size: 60px; flex: none">缺省</span>
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
    <span style="inline-size: 60px; flex: none">lg</span>
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
  // 三档各自一台，页码序列都从各自的元素上取，不共用也不自己算
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

### 极简排布

页码序列不渲染也行，只留上一页 / 下一页与一行位置回显；先后顺序归作者

```vue
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
    style="inline-size: 100%"
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
  style="inline-size: 100%"
>
  <nav data-xh-part="root">
    <button data-xh-part="prev-trigger"></button>
    <!-- 整条序列都不铺，只留当前页那一格当位置回显 -->
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
    // 受控：当前页住在 page 属性里，先写回再读取数口，否则读到的还是上一页那份
    host.page = event.detail.page;
    current.setAttribute("value", String(host.currentPage));
    current.textContent = String(host.currentPage);
    total.textContent = `/ ${host.totalPages}`;
  });
</script>
```

### 快速跳页

输入框按 Enter 调插槽给的 setPage；越界页码由它夹回合法区间

```vue
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const target = ref("");

// 只放正整数进去，其余按无效输入丢掉
function jump(setPage: (page: number) => void): void {
  const next = Number(target.value);
  if (Number.isInteger(next) && next > 0) {
    setPage(next);
  }
  target.value = "";
}
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages, setPage }"
    :count="1000"
    :page-size="10"
    :default-page="5"
    style="inline-size: 100%"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />

    <XhTextFieldRoot v-model:value="target" size="sm" placeholder="页码">
      <XhTextFieldControl style="inline-size: 72px">
        <XhTextFieldInput aria-label="跳至页码" @keydown.enter="jump(setPage)" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination
  id="pagination-jumper"
  count="1000"
  page-size="10"
  page="5"
  style="inline-size: 100%"
>
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

    <xh-text-field
      id="pagination-jumper-field"
      value=""
      size="sm"
      placeholder="页码"
    >
      <div data-xh-part="root">
        <div data-xh-part="control" style="inline-size: 72px">
          <input data-xh-part="input" aria-label="跳至页码" />
        </div>
      </div>
    </xh-text-field>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-jumper");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');
  const field = document.getElementById("pagination-jumper-field");
  const input = field.querySelector('[data-xh-part="input"]');

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

  // 受控：页码写回 page 之后再照新序列重挂
  host.addEventListener("page-change", (event) => {
    host.page = event.detail.page;
    render();
  });

  field.addEventListener("value-change", (event) => {
    field.value = event.detail.value;
  });

  // 只放正整数进去，其余按无效输入丢掉；超出总页数的照给，setPage 会夹回合法区间
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const target = Number(field.value);
    if (Number.isInteger(target) && target > 0) {
      host.setPage(target);
    }
    field.value = "";
  });
</script>
```

### 每页条数

控制器就是库里的下拉：档位从 page-size-options 来、档位文字取 translations.pageSizeOption，换档时页码跟着换算，改档前第一条仍留在页内

```vue
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPageSizeSelect,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";

const translations = { pageSizeOption: (size: number) => `${size} 条 / 页` };
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages, pageRange, count, page }"
    :count="196"
    :default-page-size="10"
    :page-size-options="[10, 20, 50]"
    :default-page="8"
    :translations="translations"
    style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; inline-size: 100%"
  >
    <XhPaginationPageSizeSelect />

    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />

    <span style="flex-basis: 100%">
      第 {{ page }} 页 · 第 {{ pageRange.start }}-{{ pageRange.end }} 条，共 {{ count }} 条
    </span>
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination
  id="pagination-page-size"
  count="196"
  default-page-size="10"
  default-page="8"
  style="inline-size: 100%"
>
  <nav data-xh-part="root">
    <!-- 挂载点写一个空 div 就够：里头那套下拉的角色节点由元素自己建 -->
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
    <span id="pagination-page-size-readout" style="flex-basis: 100%">
      第 8 页 · 第 71-80 条，共 196 条
    </span>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-page-size");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');
  const readout = document.getElementById("pagination-page-size-readout");

  // 档位表只做取值来源，每一档的文字归文案桶
  host.pageSizeOptions = [10, 20, 50];
  host.translations = { pageSizeOption: (size) => `${size} 条 / 页` };

  // 换档之后总页数与页码都变了，两样都从元素上重读；
  // 条目区间也是它给的，末页不满时右端已经收成实际条数
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
    readout.textContent = `第 ${host.currentPage} 页 · 第 ${start}-${end} 条，共 ${host.count} 条`;
  }

  // 两条事件都意味着这一页的内容换了，重读一遍取数口就是同一份新状态
  host.addEventListener("page-change", render);
  host.addEventListener("page-size-change", render);
</script>
```

### 整组禁用

分页自己没有禁用开关：裹一层 disabled 的 fieldset，里面的按钮统一失效并脱出 Tab 序

```vue
<script setup lang="ts">
import {
  XhButton,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(true);

// 禁用期间把页码格子的取色也压成禁用态：上一页 / 下一页由皮肤的 :disabled 规则自己接管
const mutedTokens = {
  "--xh-pagination-item-fg": "var(--xh-fg-disabled)",
  "--xh-pagination-item-bg-hover": "transparent",
  "--xh-pagination-item-bg-selected": "var(--xh-bg-muted)",
  "--xh-pagination-item-border-selected": "var(--xh-bg-muted)",
  "--xh-pagination-item-fg-selected": "var(--xh-fg-disabled)",
};
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton size="sm" variant="outline" @click="loading = !loading">
        {{ loading ? "加载完成" : "重新加载" }}
      </XhButton>
      <span>{{ loading ? "数据加载中，整组分页不可操作" : "可以翻页了" }}</span>
    </div>

    <fieldset
      :disabled="loading"
      :style="[
        { margin: 0, padding: 0, border: 0, minInlineSize: 0 },
        loading ? mutedTokens : {},
      ]"
    >
      <XhPaginationRoot
        v-slot="{ pages }"
        :count="196"
        :page-size="10"
        :default-page="3"
      >
        <XhPaginationPrevTrigger />
        <template v-for="(p, i) in pages" :key="`${p}-${i}`">
          <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
          <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
        </template>
        <XhPaginationNextTrigger />
      </XhPaginationRoot>
    </fieldset>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button size="sm" variant="outline">
      <button data-xh-part="root" id="pagination-disabled-toggle">
        加载完成
      </button>
    </xh-button>
    <span id="pagination-disabled-hint">数据加载中，整组分页不可操作</span>
  </div>

  <!-- 禁用期间把页码格子的取色也压成禁用态：上一页 / 下一页由皮肤的 :disabled 规则自己接管 -->
  <fieldset
    id="pagination-disabled-fieldset"
    disabled
    style="
      margin: 0;
      padding: 0;
      border: 0;
      min-inline-size: 0;
      --xh-pagination-item-fg: var(--xh-fg-disabled);
      --xh-pagination-item-bg-hover: transparent;
      --xh-pagination-item-bg-selected: var(--xh-bg-muted);
      --xh-pagination-item-border-selected: var(--xh-bg-muted);
      --xh-pagination-item-fg-selected: var(--xh-fg-disabled);
    "
  >
    <xh-pagination
      id="pagination-disabled"
      count="196"
      page-size="10"
      default-page="3"
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
  </fieldset>
</div>

<script type="module">
  const host = document.getElementById("pagination-disabled");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');
  const fieldset = document.getElementById("pagination-disabled-fieldset");
  const toggle = document.getElementById("pagination-disabled-toggle");
  const hint = document.getElementById("pagination-disabled-hint");

  // 禁用态的那几个覆盖槽写在 fieldset 的内联样式里，翻假时逐个撤掉
  const mutedTokens = [
    "--xh-pagination-item-fg",
    "--xh-pagination-item-bg-hover",
    "--xh-pagination-item-bg-selected",
    "--xh-pagination-item-border-selected",
    "--xh-pagination-item-fg-selected",
  ];
  const mutedValues = mutedTokens.map((name) =>
    fieldset.style.getPropertyValue(name),
  );

  let loading = true;

  toggle.addEventListener("click", () => {
    loading = !loading;
    fieldset.disabled = loading;
    mutedTokens.forEach((name, i) => {
      if (loading) fieldset.style.setProperty(name, mutedValues[i]);
      else fieldset.style.removeProperty(name);
    });
    toggle.textContent = loading ? "加载完成" : "重新加载";
    hint.textContent = loading ? "数据加载中，整组分页不可操作" : "可以翻页了";
  });

  // 禁用与页码序列是两回事：解禁之后照旧从元素上取序列重挂
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
</script>
```

### 摊开省略号

折进去的那几页悬停即摊开，点一下也摊开——纯悬停会把键盘用户挡在外面，而这几页除了这里没有别的入口；Escape 或点外面收起

```vue
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
    v-slot="{ pageItems, page }"
    :count="2000"
    :page-size="10"
    :default-page="100"
    style="inline-size: 100%"
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

    <span style="flex-basis: 100%">当前第 {{ page }} 页，共 200 页</span>
  </XhPaginationRoot>
</template>
```

```html
<xh-pagination
  id="pagination-expand"
  count="2000"
  page-size="10"
  default-page="100"
  style="inline-size: 100%"
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

    <!-- 同时只开一个省略位，一份定位层就够；面板里的页码由脚本按那一侧折进去的那几页铺 -->
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
    </div>

    <span id="pagination-expand-readout" style="flex-basis: 100%">
      当前第 100 页，共 200 页
    </span>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-expand");
  const root = host.querySelector('[data-xh-part="root"]');
  const next = root.querySelector('[data-xh-part="next-trigger"]');
  const content = root.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("pagination-expand-readout");

  function makeItem(value) {
    const el = document.createElement("button");
    el.dataset.xhPart = "item";
    el.setAttribute("value", String(value));
    el.textContent = String(value);
    return el;
  }

  function render() {
    // 只摘行里的格子：面板里的页码也是 item，不能一起清掉
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
    readout.textContent = `当前第 ${host.currentPage} 页，共 ${host.totalPages} 页`;
  }

  // 指针停上去与按下去都会摊开，面板照那一侧折进去的页码铺：
  // 折的是哪几页由 pageItems 的省略位自带，脚本只负责认出指的是哪一侧
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
    // 换页之后折进去的页码变了，面板下次摊开要重铺
    filled = null;
    render();
  });
</script>
```

## 设计指引

### 何时使用

- 结果集很大且用户需要跳到确定的位置、或需要可分享的页码地址。
- 需要知道一共有多少条。

### 何时不用

- 内容是时间流、用户只关心"再来一些"：用[无限滚动](./infinite-scroll)。
- 结果条数很少：一次全给。

### 特性

- `count` 给的是总条数不是总页数。
- 页码序列由 `root` 的插槽交出来，作者照着渲染条目与省略号；不渲染序列也行，只留上一页 / 下一页。
- `siblingCount` 决定当前页两侧各留几页，序列长度恒定，切页时省略号左右挪、按钮不抖。
- `dir` 只作用于排版："上一页"永远是 `page - 1`，不随书写方向翻转。
- 换 `pageSize` 后总页数重算，越界的当前页被夹回末页。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pagination>` |
| Vue 组件 | `XhPaginationContent` `XhPaginationEllipsisTrigger` `XhPaginationItem` `XhPaginationJumper` `XhPaginationNextTrigger` `XhPaginationPageSizeSelect` `XhPaginationPositioner` `XhPaginationPrevTrigger` `XhPaginationRoot` `XhPaginationSummary` |
| 组合式函数 | `usePagination` |
| 状态机 | `paginationMachine` |
| 皮肤 | `@xihan-ui/styles/pagination.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="pagination"`：**`root`** · `summary` · `jumper` · `prev-trigger` · `next-trigger` · **`item`** · `ellipsis-trigger` · `page-size-select` · `positioner` · `content`

## Props

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

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `page-change` | `PaginationPageChangeDetails` | 页码变化；detail 为 `{ page: number, pageSize: number }` |
| `page-size-change` | `` | 每页条数变化；detail 为 `{ pageSize: number, page: number }`，页码是换算后的 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPaginationContent` | `default` | `{ pages: number[] }` |  |
| `XhPaginationRoot` | `default` | `PaginationRootSlotProps` |  |
| `XhPaginationSummary` | `default` | `{ summaryText: string, start: number, end: number, count: number }` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `ellipsis-trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**事件**：`PAGE.SET` · `PAGE_SIZE.SET` · `PAGE.PREV` · `PAGE.NEXT` · `ELLIPSIS.ENTER` · `ELLIPSIS.LEAVE` · `ELLIPSIS.TOGGLE` · `ELLIPSIS.CLOSE` · `after.openDelay` · `after.closeDelay`

**判据**：`isSameEllipsis`

## connect API

`usePagination` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in item | 跳到该页码（原生按钮激活，平台把按键翻成 click） |
| `Enter` / `Space` | focus in prev-trigger, 非首页 | 回上一页；首页时按钮是原生 disabled，焦点根本落不上去 |
| `Enter` / `Space` | focus in next-trigger, 非末页 | 进下一页；末页时按钮是原生 disabled |
| `Enter` / `Space` | focus in ellipsis-trigger | 摊开被折叠的那几页；再按一次收起。纯悬停会把键盘用户挡在外面，而那几页除了这里没有别的入口 |
| `Escape` | ellipsis-trigger 已摊开 | 收起摊开的页码面板（走消解层，点面板外面同样收起） |
| `Tab` / `Shift+Tab` | focus in root | 逐个走过每个可用按钮——分页不做 roving tabindex，用户要能 Tab 到某一页再确认；禁用的首尾按钮自动脱序 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

## 样式

默认皮肤 `@xihan-ui/styles/pagination.css` 按部件选择：`[data-scope="pagination"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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
## CSS 变量

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

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 与[表格](./table)、[列表](./list)配合；整组禁用时裹一层 `disabled` 的 `fieldset`。
- 每页条数那个控制器就是[下拉选择](./select)：`page-size-select` 是挂载点，里头的角色节点带的是 `data-scope="select"`，吃 select 那份皮肤。档位来自 `pageSizeOptions`，每一档的文字取 `translations.pageSizeOption`，控件的可及名取 `translations.pageSizeSelect`。

## 最佳实践

- 把当前页写进地址，用户刷新或分享才回得到原处。
- 数据在途时不要把分页整个卸载，否则每次翻页布局都跳一下。

## 反模式

- 已知总数却不显示，用户无法判断还要翻多久。
- 把 `count` 当成总页数传进来：序列会短一大截。
