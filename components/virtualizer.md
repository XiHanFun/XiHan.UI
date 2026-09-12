来源：https://ui.docs.xihanfun.com/components/virtualizer

# Virtualizer `虚拟滚动`

只渲染窗口内的条目，列表再长也只画那几十个。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/virtualizer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/virtualizer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/virtualizer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/virtualizer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/virtualizer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一万条只渲可视区那几条，root 要有确定高度，条目的主轴尺寸由作者按 estimateSize 自己写

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
  host.addEventListener("change", (event) => {
    render(event.detail.virtualItems);
    range.textContent = `${event.detail.startIndex} – ${event.detail.endIndex}`;
  });
</script>
```

## 示例

### 动态高度

条目开了 measure 就把真实尺寸回喂给内核，estimateSize 只是首帧的起点，滚过一遍就收敛

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
  host.addEventListener("change", (event) => {
    render(event.detail.virtualItems, event.detail.totalSize);
  });
</script>
```

### 滚到指定条目

scrollToIndex 按 align 落位：start 贴上沿、center 居中、end 贴下沿，越界下标由内核夹住

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
  host.addEventListener("change", (event) => {
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

horizontal 把主轴换成行内轴：位移改写进行首侧，条目宽度由作者写，gap 由内核直接算进位移

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
  host.addEventListener("change", (event) => render(event.detail.virtualItems));
</script>
```

### 挂自绘滚动条

滚动容器是视口，给它一个 id 交给滚动条即可；虚拟滚动只管渲哪几条，滚动条只管画滚动位置

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
  host.addEventListener("change", (event) => render(event.detail.virtualItems));
</script>
```

### 与无限滚动合成一条长列表

哨兵摆在内容层之后而不是条目之间：窗口外的条目根本没渲染，摆进去的哨兵永远进不了可视区

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
  host.addEventListener("change", (event) => render(event.detail.virtualItems));

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

## 设计指引

### 何时使用

- 条目上千甚至上万。
- 首屏卡顿的根源是 DOM 节点太多。

### 何时不用

- 条目只有几十上百条：虚拟化带来的复杂度不值得。
- 需要浏览器的页内查找命中所有条目：没渲染的条目搜不到。

### 特性

- 支持动态高度（量出来而不是猜）、横向列表与多列。
- `overscan` 决定窗口外多渲几个，滚动时不露白。
- 可以滚到指定条目。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-virtualizer>` |
| Vue 组件 | `XhVirtualizerContent` `XhVirtualizerItem` `XhVirtualizerRoot` `XhVirtualizerViewport` |
| 组合式函数 | `useVirtualizer` |
| 状态机 | `virtualizerMachine` |
| 皮肤 | `@xihan-ui/styles/virtualizer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="virtualizer"`：**`root`** · **`viewport`** · **`content`** · `item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 总条数，默认 0。 |
| `estimateSize` | `number \| ((index: number) => number)` |  | 每条的估算主轴尺寸（px）。等高列表可以直接给一个数字。 不给按 0 算：所有条目都会落进窗口，先渲出来再靠 measureElement 回喂真实尺寸。 |
| `overscan` | `number` |  | 可视区前后各多渲几条，默认 5。 |
| `horizontal` | `boolean` |  | 横向列表（主轴是行内轴），默认 false。 |
| `gap` | `number` |  | 相邻两条之间的主轴间距（px），默认 0。位移由内核直接算进去，不靠外边距。 |
| `getItemKey` | `(index: number) => string \| number` |  | 条目身份。默认即下标；列表会增删时给稳定 key，测量缓存才跟得住条目。 |
| `onChange` | `(details: VirtualizerChangeDetails) => void` |  | 该渲什么变了。只在快照真的变了时回调，滚动但可见区间没变不会触发。 |
| `scrollMargin` | `number` |  | 列表起点距滚动容器起点的距离（px），默认 0。 列表上方还有别的内容（页头、筛选栏）时给它，否则区间会整体偏掉那一截。 |
| `paddingStart` | `number` |  | 列表前后的内边距（px），默认 0。计进总长，第一条从 paddingStart 处起算。 |
| `paddingEnd` | `number` |  |  |
| `lanes` | `number` |  | 多列网格的列数，默认 1（单列）。条目按下标轮流落到各道上。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `change` | `VirtualizerChangeDetails` | 该渲什么变了；detail 为 `{ virtualItems, totalSize, startIndex, endIndex }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhVirtualizerRoot` | `default` | `VirtualizerRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `scrolling`

**事件**：`SCROLL.START` · `SCROLL.END` · `MEASURE`

## connect API

`useVirtualizer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `virtualItems` | `readonly VirtualizerItemState[]` | 此刻该渲染哪些下标，以及它们的位移与尺寸。 |
| `totalSize` | `number` | 整份列表的主轴总长（px）。 |
| `startIndex` | `number \| null` | 可视区首条下标（不含过扫描）；一条都排不下时为 null。 |
| `endIndex` | `number \| null` | 可视区末条下标（不含过扫描）；一条都排不下时为 null。 |
| `horizontal` | `boolean` |  |
| `lanes` | `number` |  |
| `scrolling` | `boolean` | 手正在滚。 |
| `scrollToIndex` | `(index: number, options?: VirtualizerScrollToOptions) => void` | 滚到第几条。越界下标由内核夹住。 |
| `measureElement` | `(element: HTMLElement \| null) => void` | 把条目节点的真实尺寸回喂给内核（动态高度用）。传 null 无副作用。 |
| `measure` | `() => void` | 丢掉全部实测尺寸重新按估算值排。视口换了一种排版时用得上。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: VirtualizerItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/virtualizer.css` 按部件选择：`[data-scope="virtualizer"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | 'horizontal' \| 'vertical' |
| `root` | `data-scrolling` | ''（条件成立时才出现） |
| `viewport` | `data-orientation` | 'horizontal' \| 'vertical' |
| `content` | `data-orientation` | 'horizontal' \| 'vertical' |
| `item` | `data-index` | props.index |
| `item` | `data-lane` | item.lane \| undefined |
| `item` | `data-orientation` | 'horizontal' \| 'vertical' |

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[列表](./list)、[表格](./table)、[选择器](./select)的长选项列表、[穿梭框](./transfer)配合。
- 与[无限滚动](./infinite-scroll)合成一条边滚边取的长列表：哨兵摆在内容层之后，取数目标指向视口那一层。

## 最佳实践

- 条目高度差异大时用动态高度模式，别用估值硬撑。
- 提供"滚到某条"的入口，否则用户永远找不回刚才看的位置。

## 反模式

- 在虚拟列表里放高度会突变的内容（图片没预留宽高比），滚动时位置乱跳。
- 依赖 Ctrl + F 查找。
- 把[无限滚动](./infinite-scroll)的哨兵摆进条目之间：窗口外的条目不渲染，哨兵跟着一起不渲染，第二页永远取不到。
