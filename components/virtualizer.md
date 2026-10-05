来源：https://ui.docs.xihanfun.com/components/virtualizer

# Virtualizer 虚拟滚动

只渲染窗口内的条目，列表再长也只绘制可见的几十条。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/virtualizer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/virtualizer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/virtualizer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/virtualizer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/virtualizer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一万条只渲染可视区内的几条，root 要有确定高度，条目的主轴尺寸由作者按 estimateSize 自行编写

```vue
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
</script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems, startIndex, endIndex }"
    :count="10000"
    :estimate-size="36"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="
            display: flex;
            align-items: center;
            height: 36px;
            padding-inline: 12px;
            border-block-end: 1px solid var(--xh-border-subtle);
          "
        >
          第 {{ item.index + 1 }} 条 · 可视区 {{ startIndex }} – {{ endIndex }}
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
```

```html
<div style="display: grid; gap: 8px; inline-size: 100%; max-inline-size: 420px">
  <xh-virtualizer id="virtualizer-basic" count="10000" estimate-size="36">
    <div data-xh-part="root" style="block-size: 260px">
      <div data-xh-part="viewport">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-virtualizer>
  <span>可视区：<span id="virtualizer-basic-range">—</span></span>
</div>

<script type="module">
  // 条目节点由作者渲：该渲的建出来，走掉的摘掉
  const host = document.getElementById("virtualizer-basic");
  const content = host.querySelector('[data-xh-part="content"]');
  const range = document.getElementById("virtualizer-basic-range");
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText =
        "display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
      el.textContent = `第 ${item.index + 1} 条`;
      nodes.set(item.index, el);
      content.append(el);
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  // 首批在监听挂上之前就算好了，直接从元素上取
  render(host.virtualItems);
  host.addEventListener("range-change", (event) => {
    render(event.detail.virtualItems);
    range.textContent = `${event.detail.startIndex} – ${event.detail.endIndex}`;
  });
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="virtualizer"`：**`root`** · **`viewport`** · **`content`** · `item`

## 示例

### 动态高度

条目开启 measure 后把真实尺寸回传给内核，estimateSize 只是首帧的起点，滚动一遍后即收敛

```vue
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

// 每条的文字长度不同，渲出来的高度自然也不同
const rows = Array.from({ length: 500 }, (_, i) => ({
  index: i,
  text: `第 ${i + 1} 条 —— ${"这一段是用来把行撑高的占位文字。".repeat((i % 4) + 1)}`,
}));
</script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems, totalSize }"
    :count="rows.length"
    :estimate-size="64"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <!-- 不给主轴尺寸：给了就把测量钉死在估算值上，measure 再也收敛不了 -->
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          measure
          style="
            padding: 8px 12px;
            border-block-end: 1px solid var(--xh-border-subtle);
            line-height: 20px;
          "
        >
          {{ rows[item.index].text }}
          <small>（实测 {{ Math.round(item.size) }}px · 总长 {{ Math.round(totalSize) }}px）</small>
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
```

```html
<xh-virtualizer id="virtualizer-dynamic" count="500" estimate-size="64">
  <div
    data-xh-part="root"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
  >
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  // 每条的文字长度不同，渲出来的高度自然也不同
  const rows = Array.from(
    { length: 500 },
    (_, i) =>
      `第 ${i + 1} 条 —— ${"这一段是用来把行撑高的占位文字。".repeat((i % 4) + 1)}`,
  );

  const host = document.getElementById("virtualizer-dynamic");
  const content = host.querySelector('[data-xh-part="content"]');
  const nodes = new Map();

  function render(items, totalSize) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      let el = nodes.get(item.index);
      if (!el) {
        el = document.createElement("div");
        el.dataset.xhPart = "item";
        el.setAttribute("value", String(item.index));
        // 开了 measure 才把实测尺寸回喂给内核
        el.setAttribute("measure", "");
        // 不给主轴尺寸：给了就把测量钉死在估算值上，measure 再也收敛不了
        el.style.cssText =
          "padding: 8px 12px; border-block-end: 1px solid var(--xh-border-subtle); line-height: 20px";
        el.append(rows[item.index], " ", document.createElement("small"));
        nodes.set(item.index, el);
        content.append(el);
      }
      el.lastElementChild.textContent = `（实测 ${Math.round(item.size)}px · 总长 ${Math.round(totalSize)}px）`;
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  // 首批在监听挂上之前就算好了，直接从元素上取
  render(host.virtualItems, host.totalSize);
  host.addEventListener("range-change", (event) => {
    render(event.detail.virtualItems, event.detail.totalSize);
  });
</script>
```

### 滚动到指定条目

scrollToIndex 按 align 落位：start 贴上沿、center 居中、end 贴下沿，越界下标由内核夹取

```vue
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 操作入口从根部件的插槽里取，滚动的活儿交给内核 -->
  <XhVirtualizerRoot
    v-slot="{ virtualItems, startIndex, scrollToIndex }"
    :count="2000"
    :estimate-size="32"
    style="inline-size: 100%; max-inline-size: 420px"
  >
    <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-block-end: 8px">
      <button type="button" @click="scrollToIndex(0)">回到第 1 条</button>
      <button type="button" @click="scrollToIndex(500, { align: 'center' })">
        第 501 条居中
      </button>
      <button type="button" @click="scrollToIndex(9999, { align: 'end' })">末条贴底</button>
      <span>可视区首条：{{ startIndex ?? "—" }}</span>
    </div>

    <!-- 视口自带确定高度，root 就不必再定高 -->
    <XhVirtualizerViewport style="block-size: 220px">
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="
            display: flex;
            align-items: center;
            height: 32px;
            padding-inline: 12px;
            border-block-end: 1px solid var(--xh-border-subtle);
          "
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
```

```html
<xh-virtualizer id="virtualizer-goto" count="2000" estimate-size="32">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px">
    <!-- 操作入口在外面，滚动的活儿交给内核 -->
    <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-block-end: 8px">
      <button type="button" id="virtualizer-goto-first">回到第 1 条</button>
      <button type="button" id="virtualizer-goto-middle">第 501 条居中</button>
      <button type="button" id="virtualizer-goto-last">末条贴底</button>
      <span>可视区首条：<span id="virtualizer-goto-start">—</span></span>
    </div>

    <!-- 视口自带确定高度，root 就不必再定高 -->
    <div data-xh-part="viewport" style="block-size: 220px">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  const host = document.getElementById("virtualizer-goto");
  const content = host.querySelector('[data-xh-part="content"]');
  const start = document.getElementById("virtualizer-goto-start");
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText =
        "display: flex; align-items: center; height: 32px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
      el.textContent = `第 ${item.index + 1} 条`;
      nodes.set(item.index, el);
      content.append(el);
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  render(host.virtualItems);
  host.addEventListener("range-change", (event) => {
    render(event.detail.virtualItems);
    start.textContent = event.detail.startIndex ?? "—";
  });

  document
    .getElementById("virtualizer-goto-first")
    .addEventListener("click", () => host.scrollToIndex(0));
  document
    .getElementById("virtualizer-goto-middle")
    .addEventListener("click", () => host.scrollToIndex(500, { align: "center" }));
  document
    .getElementById("virtualizer-goto-last")
    .addEventListener("click", () => host.scrollToIndex(9999, { align: "end" }));
</script>
```

### 横向列表

horizontal 把主轴换为行内轴：位移改写进行首侧，条目宽度由作者编写，gap 由内核直接计入位移

```vue
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
</script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="500"
    :estimate-size="120"
    :gap="8"
    horizontal
    style="block-size: 96px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            inline-size: 120px;
            block-size: 68px;
            border: 1px solid var(--xh-border-subtle);
            border-radius: 8px;
          "
        >
          第 {{ item.index + 1 }} 张
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
```

```html
<xh-virtualizer
  id="virtualizer-horizontal"
  count="500"
  estimate-size="120"
  gap="8"
  horizontal
>
  <div
    data-xh-part="root"
    style="block-size: 96px; inline-size: 100%; max-inline-size: 420px"
  >
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  // 条目节点由作者渲：该渲的建出来，走掉的摘掉
  const host = document.getElementById("virtualizer-horizontal");
  const content = host.querySelector('[data-xh-part="content"]');
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText =
        "display: flex; align-items: center; justify-content: center; inline-size: 120px; block-size: 68px; border: 1px solid var(--xh-border-subtle); border-radius: 8px";
      el.textContent = `第 ${item.index + 1} 张`;
      nodes.set(item.index, el);
      content.append(el);
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  // 首批在监听挂上之前就算好了，直接从元素上取
  render(host.virtualItems);
  host.addEventListener("range-change", (event) => render(event.detail.virtualItems));
</script>
```

### 挂载自绘滚动条

滚动容器是视口，提供一个 id 交给滚动条即可；虚拟滚动只管理渲染哪几条，滚动条只负责绘制滚动位置

```vue
<script setup lang="ts">
import {
  XhScrollbarRoot,
  XhScrollbarThumb,
  XhScrollbarTrack,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
</script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="10000"
    :estimate-size="36"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
  >
    <!-- 视口给个 id，滚动条按 controls 找到它；挂上后原生滚动条自动藏起来 -->
    <XhVirtualizerViewport id="virtualizer-scrollbar-viewport">
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="
            display: flex;
            align-items: center;
            height: 36px;
            padding-inline: 12px;
            border-block-end: 1px solid var(--xh-border-subtle);
          "
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
    <XhScrollbarRoot controls="virtualizer-scrollbar-viewport" type="always">
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </XhVirtualizerRoot>
</template>
```

```html
<xh-virtualizer id="virtualizer-scrollbar" count="10000" estimate-size="36">
  <div data-xh-part="root" style="block-size: 260px; inline-size: 100%; max-inline-size: 420px">
    <!-- 视口给个 id，滚动条按 controls 找到它；挂上后原生滚动条自动藏起来 -->
    <div data-xh-part="viewport" id="virtualizer-scrollbar-viewport">
      <div data-xh-part="content"></div>
    </div>
    <xh-scrollbar controls="virtualizer-scrollbar-viewport" type="always">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-scrollbar>
  </div>
</xh-virtualizer>

<script type="module">
  // 条目节点由作者渲：该渲的建出来，走掉的摘掉
  const host = document.getElementById("virtualizer-scrollbar");
  const content = host.querySelector('[data-xh-part="content"]');
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText =
        "display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
      el.textContent = `第 ${item.index + 1} 条`;
      nodes.set(item.index, el);
      content.append(el);
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  render(host.virtualItems);
  host.addEventListener("range-change", (event) => render(event.detail.virtualItems));
</script>
```

### 与无限滚动组成一条长列表

哨兵放置在内容层之后而不是条目之间：窗口外的条目根本没有渲染，放在其中的哨兵永远无法进入可视区

```vue
<script setup lang="ts">
import {
  XhInfiniteScrollLoadMoreTrigger,
  XhInfiniteScrollRoot,
  XhInfiniteScrollSentinel,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

const PAGE = 100;
const TOTAL = 400;

const loaded = ref(PAGE);
const loading = ref(false);
const done = ref(false);

// 滚动的是视口那一层，提前量按它算；哨兵在同一层里才量得到自己进没进可视区
const viewport = ref<HTMLElement | null>(null);
function bindViewport(el: unknown): void {
  viewport.value = (el as { $el?: HTMLElement } | null)?.$el ?? null;
}

let timer = 0;
function onLoad(): void {
  if (loading.value || done.value)
    return;
  loading.value = true;
  timer = window.setTimeout(() => {
    loaded.value = Math.min(loaded.value + PAGE, TOTAL);
    done.value = loaded.value >= TOTAL;
    loading.value = false;
  }, 600);
}

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="loaded"
    :estimate-size="36"
    class="composed"
  >
    <XhVirtualizerViewport :ref="bindViewport">
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          class="composed__row"
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>

      <!-- 内容层撑的是已取到的这几页的总长，哨兵紧跟其后，正好落在列表末尾 -->
      <XhInfiniteScrollRoot
        :target="viewport"
        :loading="loading"
        :disabled="done"
        class="composed__more"
        @load="onLoad"
      >
        <span v-if="loading">正在取下一页…</span>
        <span v-else-if="done">没有更多了，共 {{ TOTAL }} 条</span>
        <!-- 读屏在虚拟光标模式下不产生滚动事件，这颗按钮是哨兵那条路的键盘等价通路 -->
        <XhInfiniteScrollLoadMoreTrigger v-else>取下一页</XhInfiniteScrollLoadMoreTrigger>
        <XhInfiniteScrollSentinel />
      </XhInfiniteScrollRoot>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>

<style scoped>
.composed {
  block-size: 260px;
  inline-size: 100%;
  max-inline-size: 420px;
}

.composed__row {
  display: flex;
  align-items: center;
  block-size: 36px;
  padding-inline: var(--xh-space-3);
  border-block-end: var(--xh-stroke-thin) solid var(--xh-border-subtle);
}

.composed__more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--xh-space-2);
  padding: var(--xh-space-3);
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-sm);
}
</style>
```

```html
<style>
  #virtualizer-composed-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--xh-space-2);
    padding: var(--xh-space-3);
    color: var(--xh-fg-muted);
    font-size: var(--xh-font-size-sm);
  }
</style>

<xh-virtualizer id="virtualizer-composed" count="100" estimate-size="36">
  <div data-xh-part="root" style="block-size: 260px; inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>

      <!-- 内容层撑的是已取到的这几页的总长，哨兵紧跟其后，正好落在列表末尾 -->
      <xh-infinite-scroll id="virtualizer-composed-scroll" style="display: contents">
        <div data-xh-part="root" id="virtualizer-composed-more">
          <span id="virtualizer-composed-status" hidden></span>
          <!-- 读屏在虚拟光标模式下不产生滚动事件，这颗按钮是哨兵那条路的键盘等价通路 -->
          <button data-xh-part="load-more-trigger">取下一页</button>
          <div data-xh-part="sentinel"></div>
        </div>
      </xh-infinite-scroll>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  const PAGE = 100;
  const TOTAL = 400;

  const host = document.getElementById("virtualizer-composed");
  const scroll = document.getElementById("virtualizer-composed-scroll");
  const content = host.querySelector('[data-xh-part="content"]');
  const viewport = host.querySelector('[data-xh-part="viewport"]');
  const trigger = scroll.querySelector('[data-xh-part="load-more-trigger"]');
  const status = document.getElementById("virtualizer-composed-status");

  // 滚动的是视口那一层，提前量按它算；哨兵在同一层里才量得到自己进没进可视区
  scroll.target = viewport;

  let loaded = PAGE;
  let done = false;
  const nodes = new Map();

  // 条目节点由作者渲：该渲的建出来，走掉的摘掉
  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText
        = "display: flex; align-items: center; height: 36px; padding-inline: var(--xh-space-3); border-block-end: 1px solid var(--xh-border-subtle)";
      el.textContent = `第 ${item.index + 1} 条`;
      nodes.set(item.index, el);
      content.append(el);
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  function say(text) {
    status.hidden = text === "";
    status.textContent = text;
    trigger.hidden = text !== "";
  }

  // 首批在监听挂上之前就算好了，直接从元素上取
  render(host.virtualItems);
  host.addEventListener("range-change", (event) => render(event.detail.virtualItems));

  // 取下一页；这里用定时器代替真实请求
  scroll.addEventListener("load", () => {
    if (done) return;
    scroll.loading = true;
    say("正在取下一页…");
    setTimeout(() => {
      loaded = Math.min(loaded + PAGE, TOTAL);
      done = loaded >= TOTAL;
      host.count = loaded;
      scroll.loading = false;
      scroll.disabled = done;
      say(done ? `没有更多了，共 ${TOTAL} 条` : "");
    }, 600);
  });
</script>
```

### 随整页滚动

scrollContainer 设为 window：列表铺在页面里，不另开滚动框，列表上方的内容不必再算 scrollMargin

```vue
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- root 不定高：视口随内容撑开，滚的是整页 -->
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="200"
    :estimate-size="36"
    scroll-container="window"
    style="inline-size: 100%; max-inline-size: 420px"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)"
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
```

```html
<!-- root 不定高：视口随内容撑开，滚的是整页 -->
<xh-virtualizer id="virtualizer-window" count="200" estimate-size="36" scroll-container="window">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  const host = document.getElementById("virtualizer-window");
  const content = host.querySelector('[data-xh-part="content"]');
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText = "display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
      el.textContent = `第 ${item.index + 1} 条`;
      nodes.set(item.index, el);
      content.append(el);
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  render(host.virtualItems);
  host.addEventListener("range-change", event => render(event.detail.virtualItems));
</script>
```

### 聊天流

anchor 设为 end：从最新一条看起，贴底时新消息继续贴底；往前翻出历史时，给了 getItemKey 视口不跳

```vue
<script setup lang="ts">
import {
  XhButton,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Message {
  id: number;
  text: string;
}

let oldest = 0;
let newest = 0;
const messages = ref<Message[]>(Array.from({ length: 30 }, () => ({ id: newest, text: `消息 ${newest++}` })));

// 历史往前插：身份是消息 id，原来视口里第一条留在原处
function loadOlder(): void {
  const older = Array.from({ length: 20 }, () => {
    oldest -= 1;
    return { id: oldest, text: `历史 ${-oldest}` };
  }).reverse();
  messages.value = [...older, ...messages.value];
}

function send(): void {
  messages.value = [...messages.value, { id: newest, text: `消息 ${newest++}` }];
}
</script>

<template>
  <div style="display: grid; gap: 8px; inline-size: 100%; max-inline-size: 420px">
    <div style="display: flex; gap: 8px">
      <XhButton size="sm" variant="outline" @click="loadOlder">加载更早</XhButton>
      <XhButton size="sm" @click="send">发送一条</XhButton>
    </div>
    <XhVirtualizerRoot
      v-slot="{ virtualItems }"
      :count="messages.length"
      :estimate-size="36"
      :get-item-key="(index: number) => messages[index]!.id"
      anchor="end"
      style="block-size: 240px"
    >
      <XhVirtualizerViewport>
        <XhVirtualizerContent>
          <XhVirtualizerItem
            v-for="item in virtualItems"
            :key="item.key"
            :value="item.index"
            style="display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)"
          >
            {{ messages[item.index]!.text }}
          </XhVirtualizerItem>
        </XhVirtualizerContent>
      </XhVirtualizerViewport>
    </XhVirtualizerRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 8px; inline-size: 100%; max-inline-size: 420px">
  <div style="display: flex; gap: 8px">
    <xh-button id="virtualizer-chat-older" size="sm" variant="outline">
      <button data-xh-part="root" type="button">加载更早</button>
    </xh-button>
    <xh-button id="virtualizer-chat-send" size="sm">
      <button data-xh-part="root" type="button">发送一条</button>
    </xh-button>
  </div>
  <xh-virtualizer id="virtualizer-chat" estimate-size="36" anchor="end">
    <div data-xh-part="root" style="block-size: 240px">
      <div data-xh-part="viewport">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-virtualizer>
</div>

<script type="module">
  const host = document.getElementById("virtualizer-chat");
  const content = host.querySelector('[data-xh-part="content"]');
  let oldest = 0;
  let newest = 30;
  let messages = Array.from({ length: 30 }, (_, id) => ({ id, text: `消息 ${id}` }));
  // 节点按消息 id 复用：下标会随往前插入整体后移，身份不会
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      const message = messages[item.index];
      live.add(message.id);
      let el = nodes.get(message.id);
      if (!el) {
        el = document.createElement("div");
        el.dataset.xhPart = "item";
        el.style.cssText = "display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
        el.textContent = message.text;
        nodes.set(message.id, el);
        content.append(el);
      }
      el.setAttribute("value", String(item.index));
    }
    for (const [id, el] of nodes) {
      if (live.has(id)) continue;
      el.remove();
      nodes.delete(id);
    }
  }

  function sync() {
    host.getItemKey = index => messages[index].id;
    host.count = messages.length;
  }

  sync();
  host.addEventListener("range-change", event => render(event.detail.virtualItems));
  document.getElementById("virtualizer-chat-older").addEventListener("click", () => {
    const older = Array.from({ length: 20 }, () => {
      oldest -= 1;
      return { id: oldest, text: `历史 ${-oldest}` };
    }).reverse();
    messages = [...older, ...messages];
    sync();
  });
  document.getElementById("virtualizer-chat-send").addEventListener("click", () => {
    messages = [...messages, { id: newest, text: `消息 ${newest++}` }];
    sync();
  });
</script>
```

### 分组标题

stickyIndices 登记标题的下标：滚过它之后它钉在起点，下一组的标题滚上来时接替

```vue
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

const groups = ["A", "B", "C", "D", "E", "F"];
const rows = groups.flatMap(letter => [
  { header: true, text: letter },
  ...Array.from({ length: 12 }, (_, i) => ({ header: false, text: `${letter}${i + 1} 联系人` })),
]);
const stickyIndices = rows.flatMap((row, index) => (row.header ? [index] : []));
</script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="rows.length"
    :estimate-size="36"
    :sticky-indices="stickyIndices"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <!-- 钉住的条目自带实底（--xh-virtualizer-sticky-bg），滚过去的条目从它下面穿过 -->
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          :style="
            rows[item.index]!.header
              ? 'display: flex; align-items: center; height: 36px; padding-inline: 12px; font-weight: 600; color: var(--xh-fg-muted)'
              : 'display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)'
          "
        >
          {{ rows[item.index]!.text }}
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
```

```html
<!-- 钉住的条目自带实底（--xh-virtualizer-sticky-bg），滚过去的条目从它下面穿过 -->
<xh-virtualizer id="virtualizer-sticky" estimate-size="36">
  <div data-xh-part="root" style="block-size: 260px; inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content"></div>
    </div>
  </div>
</xh-virtualizer>

<script type="module">
  const groups = ["A", "B", "C", "D", "E", "F"];
  const rows = groups.flatMap(letter => [
    { header: true, text: letter },
    ...Array.from({ length: 12 }, (_, i) => ({ header: false, text: `${letter}${i + 1} 联系人` })),
  ]);
  const stickyIndices = rows.flatMap((row, index) => (row.header ? [index] : []));

  const host = document.getElementById("virtualizer-sticky");
  const content = host.querySelector('[data-xh-part="content"]');
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      live.add(item.index);
      if (nodes.has(item.index)) continue;
      const row = rows[item.index];
      const el = document.createElement("div");
      el.dataset.xhPart = "item";
      el.setAttribute("value", String(item.index));
      el.style.cssText = row.header
        ? "display: flex; align-items: center; height: 36px; padding-inline: 12px; font-weight: 600; color: var(--xh-fg-muted)"
        : "display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
      el.textContent = row.text;
      nodes.set(item.index, el);
      content.append(el);
    }
    for (const [index, el] of nodes) {
      if (live.has(index)) continue;
      el.remove();
      nodes.delete(index);
    }
  }

  host.stickyIndices = stickyIndices;
  host.count = rows.length;
  host.addEventListener("range-change", event => render(event.detail.virtualItems));
</script>
```

## 设计指引

### 何时使用

- 条目上千甚至上万。
- 首屏卡顿的根源是 DOM 节点太多。

### 何时不用

- 条目只有几十上百条时，虚拟化带来的复杂度不值得。
- 需要浏览器的页内查找命中所有条目时，未渲染的条目无法被搜索。

### 特性

- 支持动态高度（测量而非估算）、横向列表与多列。
- `overscan` 决定窗口外多渲染的条数，滚动时不露白。
- 可以滚到指定条目。
- 滚动容器由 `scrollContainer` 决定：缺省 `viewport` 是视口自己滚；`window` 是列表铺在页面里、随整页滚动，视口不再是滚动框也不占 Tab 位，列表在页面里的起点由内核现量（每次滚动都重量，页头折叠、上方内容加载完都跟得上），不必再算 `scrollMargin`。
- 条目增删时视口不跳：缺省（`anchor` 为 `start`）把视口里第一条按身份放回原处，往前插入条目（向上翻出历史）时它仍停在原来的位置。身份来自 `getItemKey`，没给时身份就是下标，往前插入只保住下标、内容会整体后移。
- `anchor` 为 `end` 时从最新一条看起：滚到底后内容再长（追加条目、条目长高）也继续贴底；用户往上翻离开底部就不再拽回，翻回底部重新贴底。列表不足一屏时条目贴着底部排。适合聊天与日志。
- `stickyIndices` 登记要钉在视口起点的条目（分组标题）：滚过它之后它一直钉着，直到下一个登记过的条目接替；它的条目外壳带 `data-fixed`，按 `position: sticky` 留在文档流里，自带实底 `--xh-virtualizer-sticky-bg`。钉住的标题读屏照常读到，不另建一份。

### 组合

- `collectionVirtualizer` 是正式集合接线口：[树](./tree)、[列表框](./listbox)、[选择器](./select)、[组合框](./combobox)、[穿梭框](./transfer)与[表格](./table)把完整 collection 交给各自状态机，只用 `virtualItems` 裁剪 DOM。表格按可见数据行计数，每个虚拟条目装一行数据行。[日志](./log)接上它之后，粘底改跟 Virtualizer 的视口与内容层（`getViewportElement` / `getContentElement`）走。
- 集合接线时 `count` 必须等于当前语义序列长度；不一致会明确抛错，避免方向键与可见窗口指向两份数据。
- 集合自身已有焦点模型，把 `viewportTabIndex` 设为 `-1`，不要让虚拟视口额外占一个 Tab 位。
- 与[无限滚动](./infinite-scroll)组合为边滚边取的长列表：哨兵放在内容层之后，取数目标指向视口层。

### 最佳实践

- 条目高度差异大时使用动态高度模式，不依赖估值。
- 条目会增删的列表（消息、动态流）一律给 `getItemKey`：实测尺寸、视口钉住与节点复用都按它认条目。
- 提供滚动到指定条目的入口，否则用户无法找回之前的位置。
- Web Components 跨嵌套宿主组合时，语义条目根用 `data-xh-part-owner` 声明归属；Virtualizer 外壳仍归 `virtualizer`，两台宿主不会争写同一节点。

### 反模式

- 在虚拟列表内放高度会突变的内容（图片未预留宽高比），滚动时位置跳动。
- 依赖 Ctrl + F 查找。
- 把[无限滚动](./infinite-scroll)的哨兵放进条目之间：窗口外的条目不渲染，哨兵也不渲染，第二页无法获取。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-virtualizer>` |
| Vue 组件 | `XhVirtualizerContent` `XhVirtualizerItem` `XhVirtualizerRoot` `XhVirtualizerViewport` |
| 组合式函数 | `useVirtualizer` |
| 状态机 | `virtualizerMachine` |
| 皮肤 | `@xihan-ui/styles/virtualizer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 总条数，默认 0。 |
| `estimateSize` | `number \| ((index: number) => number)` |  | 每条的估算主轴尺寸（px）。等高列表可以直接提供一个数字。 未提供时按 0 计算：所有条目都会落进窗口，先渲染出来再依靠 measureElement 回填真实尺寸。 |
| `overscan` | `number` |  | 可视区前后各多渲染的条数，默认 5。 |
| `horizontal` | `boolean` |  | 横向列表（主轴是行内轴），默认 false。 |
| `gap` | `number` |  | 相邻两条之间的主轴间距（px），默认 0。位移由内核直接计算，不依靠外边距。 |
| `getItemKey` | `(index: number) => string \| number` |  | 条目身份。默认即下标；列表会增删时提供稳定 key，测量缓存才能跟随条目。 |
| `onRangeChange` | `(details: VirtualizerRangeChangeDetails) => void` |  | 应渲染的区间变化。只在快照实际变化时回调，滚动但可见区间未变不会触发。 |
| `scrollMargin` | `number` |  | 列表起点距滚动容器起点的距离（px），默认 0。 列表上方还有其他内容（页头、筛选栏）时提供它，否则区间会整体偏移该段距离。 |
| `paddingStart` | `number` |  | 列表前后的内边距（px），默认 0。计入总长，第一条从 paddingStart 处起算。 |
| `paddingEnd` | `number` |  |  |
| `lanes` | `number` |  | 多列网格的列数，默认 1（单列）。条目按下标轮流落到各列上。 |
| `viewportTabIndex` | `number` |  | viewport 的 Tab 位；独立列表默认 0，组合进有自身焦点模型的集合时设为 -1。window 形态下视口不滚动，不占 Tab 位。 |
| `scrollContainer` | `VirtualizerScrollContainer` |  | 滚动容器：viewport（缺省）是视口节点自己滚；window 是列表铺在页面里、随整页滚动， 列表在页面里的起点由内核现量，不必再给 scrollMargin。 |
| `anchor` | `VirtualizerAnchor` |  | 条目增删时钉住哪一头。start（缺省）把视口里第一条按身份放回原处：往前插入条目（向上翻出历史）视口不跳， 需要 getItemKey 给出稳定身份。end 另外从底部看起、已经滚到底时内容再长也继续贴底（聊天流）， 列表不足一屏时条目贴着底部排。 |
| `stickyIndices` | `number[]` |  | 钉在视口起点的条目下标（分组标题）：滚过它之后它一直钉着，直到下一个钉住的条目接替。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `range-change` | `VirtualizerRangeChangeDetails` | 应渲染的区间变化；detail 为 `{ virtualItems, totalSize, startIndex, endIndex }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhVirtualizerRoot` | `default` | `VirtualizerRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhVirtualizerItem` | `value` | `number \| string` | 是 | 该节点的下标。 |
| `XhVirtualizerItem` | `measure` | `boolean` |  | 是否把真实尺寸回传给内核；未开启时条目尺寸按 estimateSize 计算。 |
| `XhVirtualizerRoot` | `children` | `SlotChildren<VirtualizerRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `scrolling`

**事件**：`SCROLL.START` · `SCROLL.END` · `MEASURE`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `virtualItems` | `readonly VirtualizerItemState[]` | 当前应渲染的下标，以及它们的位移与尺寸。 |
| `totalSize` | `number` | 整份列表的主轴总长（px）。 |
| `startIndex` | `number \| null` | 可视区首条下标（不含过扫描）；没有任何条目可容纳时为 null。 |
| `endIndex` | `number \| null` | 可视区末条下标（不含过扫描）；没有任何条目可容纳时为 null。 |
| `horizontal` | `boolean` |  |
| `lanes` | `number` |  |
| `scrolling` | `boolean` | 正在滚动。 |
| `collectionVirtualizer` | `CollectionVirtualizer` | 交给集合组件的正式虚拟化桥。 |
| `scrollToIndex` | `(index: number, options?: VirtualizerScrollToOptions) => void` | 滚动到某一条。越界下标由内核夹取。 |
| `measureElement` | `(element: HTMLElement \| null) => void` | 把条目节点的真实尺寸回填给内核（动态高度使用）。传 null 无副作用。 |
| `measure` | `() => void` | 丢弃全部实测尺寸重新按估算值排列。视口更换排版时使用。 |
| `registerItemElement` | `(index: number, element: HTMLElement \| null) => void` | 适配器在条目 ref 挂载 / 卸载时登记；业务作者通常不直接调用。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: VirtualizerItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/virtualizer.css` 按 `[data-scope="virtualizer"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-virtualizer` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | 'horizontal' \| 'vertical' |
| `root` | `data-scrolling` | ''（条件成立时才出现） |
| `viewport` | `data-anchor` | 'end' \| undefined |
| `viewport` | `data-orientation` | 'horizontal' \| 'vertical' |
| `viewport` | `data-scroll-container` | 'window' \| undefined |
| `content` | `data-orientation` | 'horizontal' \| 'vertical' |
| `item` | `data-fixed` | ''（条件成立时才出现） |
| `item` | `data-index` | props.index |
| `item` | `data-lane` | item.lane \| undefined |
| `item` | `data-orientation` | 'horizontal' \| 'vertical' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-virtualizer-sticky-bg` | `item` | `background` | `fixed` | `--xh-bg-surface` | virtualizer 的 item 部件 background 覆盖槽。 |
| `--xh-virtualizer-sticky-layer` | `item` | `z-index` | `fixed` | `--xh-layer-sticky` | virtualizer 的 item 部件 z-index 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
