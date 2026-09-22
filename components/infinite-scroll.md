来源：https://ui.docs.xihanfun.com/components/infinite-scroll

# InfiniteScroll 无限滚动

获取下一页的通用触发器，滚动只是默认的触发方式。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/infinite-scroll" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/infinite-scroll.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/infinite-scroll" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/infinite-scroll" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/infinite-scroll.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

哨兵滚进可视区即派发 load，取数完成后把 loading 写回 false

```vue
<script setup lang="ts">
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const items = ref(Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 条`));
const loading = ref(false);

// 取下一页；这里用定时器代替真实请求
function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 8; i += 1) items.value.push(`第 ${base + i} 条`);
    loading.value = false;
  }, 500);
}
</script>

<template>
  <div
    ref="scrollEl"
    data-xh-scroll
    style="
      block-size: 240px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- target 指向真正在滚的那层；不给就以窗口视口为准 -->
    <XhInfiniteScrollRoot :target="scrollEl" :loading="loading" @load="onLoad">
      <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>
      <p v-if="loading" style="margin: 0; padding: 8px 12px; color: var(--xh-fg-muted)">
        正在取下一页…
      </p>
      <!-- 哨兵摆在列表最后一条之后 -->
      <XhInfiniteScrollSentinel />
    </XhInfiniteScrollRoot>
  </div>
</template>
```

```html
<style>
  #infinite-scroll-basic-shell [data-row] {
    padding: 8px 12px;
  }
  #infinite-scroll-basic-shell [data-hint] {
    margin: 0;
    padding: 8px 12px;
    color: var(--xh-fg-muted);
  }
</style>

<div
  id="infinite-scroll-basic-shell"
  data-xh-scroll
  style="
    block-size: 240px;
    overflow: auto;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <!-- 宿主设 display: contents，列表外壳落在 root 上 -->
  <xh-infinite-scroll id="infinite-scroll-basic" style="display: contents">
    <div data-xh-part="root">
      <div data-list>
        <div data-row>第 1 条</div>
        <div data-row>第 2 条</div>
        <div data-row>第 3 条</div>
        <div data-row>第 4 条</div>
        <div data-row>第 5 条</div>
        <div data-row>第 6 条</div>
        <div data-row>第 7 条</div>
        <div data-row>第 8 条</div>
        <div data-row>第 9 条</div>
        <div data-row>第 10 条</div>
        <div data-row>第 11 条</div>
        <div data-row>第 12 条</div>
      </div>
      <p data-hint hidden>正在取下一页…</p>
      <!-- 哨兵摆在列表最后一条之后 -->
      <div data-xh-part="sentinel"></div>
    </div>
  </xh-infinite-scroll>
</div>

<script type="module">
  const host = document.getElementById("infinite-scroll-basic");
  const shell = document.getElementById("infinite-scroll-basic-shell");
  const list = host.querySelector("[data-list]");
  const hint = host.querySelector("[data-hint]");

  // target 指向真正在滚的那层；不给就以窗口视口为准。它是 DOM 句柄，只走属性
  host.target = shell;

  function append(count) {
    const base = list.childElementCount;
    for (let i = 1; i <= count; i += 1) {
      const row = document.createElement("div");
      row.setAttribute("data-row", "");
      row.textContent = `第 ${base + i} 条`;
      list.append(row);
    }
  }

  // 取下一页；这里用定时器代替真实请求
  host.addEventListener("load", () => {
    host.loading = true;
    hint.hidden = false;
    setTimeout(() => {
      append(8);
      host.loading = false;
      hint.hidden = true;
    }, 500);
  });
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="infinite-scroll"`：**`root`** · **`sentinel`** · `load-more-trigger`

## 示例

### 提前量

distance 把可视区沿块轴向外扩展，哨兵尚未出现就先取下一页

```vue
<script setup lang="ts">
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const distance = ref(200);
const items = ref(Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 条`));
const loading = ref(false);
const rounds = ref(0);

function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 8; i += 1) items.value.push(`第 ${base + i} 条`);
    rounds.value += 1;
    loading.value = false;
  }, 400);
}
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <label style="display: flex; align-items: center; gap: 8px">
      提前
      <input v-model.number="distance" type="range" min="0" max="400" step="50">
      {{ distance }}px 触发 · 已取 {{ rounds }} 页
    </label>

    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        block-size: 220px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <!-- 提前量扩的是 target 那块可视区，容器滚动必须把容器交出来 -->
      <XhInfiniteScrollRoot
        :target="scrollEl"
        :distance="distance"
        :loading="loading"
        @load="onLoad"
      >
        <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>
        <XhInfiniteScrollSentinel />
      </XhInfiniteScrollRoot>
    </div>
  </div>
</template>
```

```html
<style>
  #infinite-scroll-distance [data-row] {
    padding: 8px 12px;
  }
</style>

<div id="infinite-scroll-distance" style="display: grid; gap: 12px; inline-size: 100%">
  <label style="display: flex; align-items: center; gap: 8px">
    提前
    <input data-range type="range" min="0" max="400" step="50" value="200" />
    <span data-readout>200px 触发 · 已取 0 页</span>
  </label>

  <div
    data-shell
    data-xh-scroll
    style="
      block-size: 220px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 宿主设 display: contents，列表外壳落在 root 上 -->
    <xh-infinite-scroll data-host distance="200" style="display: contents">
      <div data-xh-part="root">
        <div data-list>
          <div data-row>第 1 条</div>
          <div data-row>第 2 条</div>
          <div data-row>第 3 条</div>
          <div data-row>第 4 条</div>
          <div data-row>第 5 条</div>
          <div data-row>第 6 条</div>
          <div data-row>第 7 条</div>
          <div data-row>第 8 条</div>
          <div data-row>第 9 条</div>
          <div data-row>第 10 条</div>
          <div data-row>第 11 条</div>
          <div data-row>第 12 条</div>
        </div>
        <!-- 哨兵摆在列表最后一条之后 -->
        <div data-xh-part="sentinel"></div>
      </div>
    </xh-infinite-scroll>
  </div>
</div>

<script type="module">
  const scope = document.getElementById("infinite-scroll-distance");
  const host = scope.querySelector("[data-host]");
  const shell = scope.querySelector("[data-shell]");
  const list = scope.querySelector("[data-list]");
  const range = scope.querySelector("[data-range]");
  const readout = scope.querySelector("[data-readout]");

  let rounds = 0;

  // 提前量扩的是 target 那块可视区，容器滚动必须把容器交出来。
  // 它是 DOM 句柄，只走属性
  host.target = shell;

  function render() {
    readout.textContent = `${host.distance}px 触发 · 已取 ${rounds} 页`;
  }

  range.addEventListener("input", () => {
    host.distance = Number(range.value);
    render();
  });

  host.addEventListener("load", () => {
    host.loading = true;
    setTimeout(() => {
      const base = list.childElementCount;
      for (let i = 1; i <= 8; i += 1) {
        const row = document.createElement("div");
        row.setAttribute("data-row", "");
        row.textContent = `第 ${base + i} 条`;
        list.append(row);
      }
      rounds += 1;
      host.loading = false;
      render();
    }, 400);
  });
</script>
```

### 没有更多数据

最后一页取完后开启 disabled，哨兵不再被观察，load 也不再派发

```vue
<script setup lang="ts">
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const maxPage = 3;
const page = ref(1);
const items = ref(Array.from({ length: 10 }, (_, i) => `第 ${i + 1} 条`));
const loading = ref(false);

function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 6; i += 1) items.value.push(`第 ${base + i} 条`);
    page.value += 1;
    loading.value = false;
  }, 400);
}
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        block-size: 220px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <XhInfiniteScrollRoot
        :target="scrollEl"
        :loading="loading"
        :disabled="page >= maxPage"
        @load="onLoad"
      >
        <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>
        <p v-if="loading" style="margin: 0; padding: 8px 12px; color: var(--xh-fg-muted)">
          正在取下一页…
        </p>
        <p v-else-if="page >= maxPage" style="margin: 0; padding: 8px 12px; color: var(--xh-fg-muted)">
          没有更多了
        </p>
        <XhInfiniteScrollSentinel />
      </XhInfiniteScrollRoot>
    </div>

    <span>第 {{ page }} / {{ maxPage }} 页 · 共 {{ items.length }} 条</span>
  </div>
</template>
```

```html
<style>
  #infinite-scroll-disabled [data-row] {
    padding: 8px 12px;
  }
  #infinite-scroll-disabled [data-hint] {
    margin: 0;
    padding: 8px 12px;
    color: var(--xh-fg-muted);
  }
</style>

<div id="infinite-scroll-disabled" style="display: grid; gap: 12px; inline-size: 100%">
  <div
    data-shell
    data-xh-scroll
    style="
      block-size: 220px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 宿主设 display: contents，列表外壳落在 root 上 -->
    <xh-infinite-scroll data-host style="display: contents">
      <div data-xh-part="root">
        <div data-list>
          <div data-row>第 1 条</div>
          <div data-row>第 2 条</div>
          <div data-row>第 3 条</div>
          <div data-row>第 4 条</div>
          <div data-row>第 5 条</div>
          <div data-row>第 6 条</div>
          <div data-row>第 7 条</div>
          <div data-row>第 8 条</div>
          <div data-row>第 9 条</div>
          <div data-row>第 10 条</div>
        </div>
        <p data-loading-hint hidden>正在取下一页…</p>
        <p data-done-hint hidden>没有更多了</p>
        <div data-xh-part="sentinel"></div>
      </div>
    </xh-infinite-scroll>
  </div>

  <span data-readout>第 1 / 3 页 · 共 10 条</span>
</div>

<script type="module">
  const scope = document.getElementById("infinite-scroll-disabled");
  const host = scope.querySelector("[data-host]");
  const shell = scope.querySelector("[data-shell]");
  const list = scope.querySelector("[data-list]");
  const loadingHint = scope.querySelector("[data-loading-hint]");
  const doneHint = scope.querySelector("[data-done-hint]");
  const readout = scope.querySelector("[data-readout]");

  const maxPage = 3;
  let page = 1;

  host.target = shell;

  function append(count) {
    const base = list.childElementCount;
    for (let i = 1; i <= count; i += 1) {
      const row = document.createElement("div");
      row.setAttribute("data-row", "");
      row.textContent = `第 ${base + i} 条`;
      list.append(row);
    }
  }

  function render() {
    host.disabled = page >= maxPage;
    doneHint.hidden = page < maxPage;
    readout.textContent = `第 ${page} / ${maxPage} 页 · 共 ${list.childElementCount} 条`;
  }

  host.addEventListener("load", () => {
    host.loading = true;
    loadingHint.hidden = false;
    setTimeout(() => {
      append(6);
      page += 1;
      host.loading = false;
      loadingHint.hidden = true;
      render();
    }, 400);
  });

  render();
</script>
```

### 状态透出

phase / loading / disabled 由组件交给宿主，加载提示与结束语都由宿主自行放置

```vue
<script setup lang="ts">
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const items = ref(Array.from({ length: 10 }, (_, i) => `第 ${i + 1} 条`));
const loading = ref(false);
const done = ref(false);

function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 6; i += 1) items.value.push(`第 ${base + i} 条`);
    done.value = items.value.length >= 28;
    loading.value = false;
  }, 400);
}
</script>

<template>
  <div
    ref="scrollEl"
    data-xh-scroll
    style="
      block-size: 240px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <XhInfiniteScrollRoot
      v-slot="{ phase, loading: busy, disabled }"
      :target="scrollEl"
      :loading="loading"
      :disabled="done"
      @load="onLoad"
    >
      <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>

      <p style="margin: 0; padding: 8px 12px; color: var(--xh-fg-muted)">
        <template v-if="busy">正在取下一页…</template>
        <template v-else-if="disabled">没有更多了</template>
        <template v-else>继续往下滚（当前 {{ phase }}）</template>
      </p>

      <XhInfiniteScrollSentinel />
    </XhInfiniteScrollRoot>
  </div>
</template>
```

```html
<style>
  #infinite-scroll-slot-state-shell [data-row] {
    padding: 8px 12px;
  }
  #infinite-scroll-slot-state-shell [data-hint] {
    margin: 0;
    padding: 8px 12px;
    color: var(--xh-fg-muted);
  }
</style>

<div
  id="infinite-scroll-slot-state-shell"
  data-xh-scroll
  style="
    block-size: 240px;
    overflow: auto;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <!-- 宿主设 display: contents，列表外壳落在 root 上 -->
  <xh-infinite-scroll id="infinite-scroll-slot-state" style="display: contents">
    <div data-xh-part="root">
      <div data-list>
        <div data-row>第 1 条</div>
        <div data-row>第 2 条</div>
        <div data-row>第 3 条</div>
        <div data-row>第 4 条</div>
        <div data-row>第 5 条</div>
        <div data-row>第 6 条</div>
        <div data-row>第 7 条</div>
        <div data-row>第 8 条</div>
        <div data-row>第 9 条</div>
        <div data-row>第 10 条</div>
      </div>
      <p data-hint></p>
      <div data-xh-part="sentinel"></div>
    </div>
  </xh-infinite-scroll>
</div>

<script type="module">
  const host = document.getElementById("infinite-scroll-slot-state");
  const shell = document.getElementById("infinite-scroll-slot-state-shell");
  const root = host.querySelector('[data-xh-part="root"]');
  const list = host.querySelector("[data-list]");
  const hint = host.querySelector("[data-hint]");

  host.target = shell;

  function append(count) {
    const base = list.childElementCount;
    for (let i = 1; i <= count; i += 1) {
      const row = document.createElement("div");
      row.setAttribute("data-row", "");
      row.textContent = `第 ${base + i} 条`;
      list.append(row);
    }
  }

  // 三段状态由 root 的 data-loading / data-disabled 表达：都没有是在等、loading 正在取、disabled 已关掉
  function renderHint() {
    const phase = root.hasAttribute("data-disabled") ? "paused" : root.hasAttribute("data-loading") ? "loading" : "idle";
    if (phase === "loading") hint.textContent = "正在取下一页…";
    else if (phase === "paused") hint.textContent = "没有更多了";
    else hint.textContent = `继续往下滚（当前 ${phase}）`;
  }

  new MutationObserver(renderHint).observe(root, {
    attributes: true,
    attributeFilter: ["data-loading", "data-disabled"],
  });
  renderHint();

  host.addEventListener("load", () => {
    host.loading = true;
    setTimeout(() => {
      append(6);
      host.loading = false;
      host.disabled = list.childElementCount >= 28;
    }, 400);
  });
</script>
```

### 取下一页的按钮

与哨兵同一条通路：读屏在虚拟光标模式下不产生滚动事件，该按钮是它的键盘等价入口

```vue
<script setup lang="ts">
import {
  XhInfiniteScrollLoadMoreTrigger,
  XhInfiniteScrollRoot,
  XhInfiniteScrollSentinel,
} from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const items = ref(Array.from({ length: 10 }, (_, i) => `第 ${i + 1} 条`));
const loading = ref(false);

// 取下一页；这里用定时器代替真实请求
function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 6; i += 1) items.value.push(`第 ${base + i} 条`);
    loading.value = false;
  }, 500);
}
</script>

<template>
  <div
    ref="scrollEl"
    data-xh-scroll
    style="
      block-size: 240px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <XhInfiniteScrollRoot :target="scrollEl" :loading="loading" @load="onLoad">
      <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>
      <XhInfiniteScrollSentinel />
      <!-- 文案写在按钮里：组件不代填名字，读屏念的与眼睛看的是同一句 -->
      <div style="padding: 8px 12px">
        <XhInfiniteScrollLoadMoreTrigger>
          {{ loading ? "正在取下一页…" : "加载更多" }}
        </XhInfiniteScrollLoadMoreTrigger>
      </div>
    </XhInfiniteScrollRoot>
  </div>
</template>
```

```html
<style>
  #infinite-scroll-more-shell [data-row] {
    padding: 8px 12px;
  }
  #infinite-scroll-more-shell [data-footer] {
    padding: 8px 12px;
  }
</style>

<div
  id="infinite-scroll-more-shell"
  data-xh-scroll
  style="
    block-size: 240px;
    overflow: auto;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <!-- 宿主设 display: contents，列表外壳落在 root 上 -->
  <xh-infinite-scroll id="infinite-scroll-more" style="display: contents">
    <div data-xh-part="root">
      <div data-list>
        <div data-row>第 1 条</div>
        <div data-row>第 2 条</div>
        <div data-row>第 3 条</div>
        <div data-row>第 4 条</div>
        <div data-row>第 5 条</div>
        <div data-row>第 6 条</div>
        <div data-row>第 7 条</div>
        <div data-row>第 8 条</div>
        <div data-row>第 9 条</div>
        <div data-row>第 10 条</div>
      </div>
      <div data-xh-part="sentinel"></div>
      <!-- 文案写在按钮里：组件不代填名字，读屏念的与眼睛看的是同一句 -->
      <div data-footer>
        <button data-xh-part="load-more-trigger">加载更多</button>
      </div>
    </div>
  </xh-infinite-scroll>
</div>

<script type="module">
  const host = document.getElementById("infinite-scroll-more");
  const shell = document.getElementById("infinite-scroll-more-shell");
  const list = host.querySelector("[data-list]");
  const trigger = host.querySelector('[data-xh-part="load-more-trigger"]');

  // target 指向真正在滚的那层；它是 DOM 句柄，只走属性
  host.target = shell;

  function append(count) {
    const base = list.childElementCount;
    for (let i = 1; i <= count; i += 1) {
      const row = document.createElement("div");
      row.setAttribute("data-row", "");
      row.textContent = `第 ${base + i} 条`;
      list.append(row);
    }
  }

  // 取下一页；这里用定时器代替真实请求
  host.addEventListener("load", () => {
    host.loading = true;
    trigger.textContent = "正在取下一页…";
    setTimeout(() => {
      append(6);
      host.loading = false;
      trigger.textContent = "加载更多";
    }, 500);
  });
</script>
```

## 设计指引

### 何时使用

- 时间流、消息列表等用户只需要继续加载的内容。

### 何时不用

- 用户需要跳到确定位置或分享某一页时，使用[分页](./pagination)。
- 页面有页脚需要可达时，无限滚动会使页脚无法到达。

### 特性

- `distance` 是提前量：距底部该距离时触发，用户感觉不到等待。
- `loading` 与 `disabled` 由组件交给宿主，加载提示与结束语由宿主放置。
- 加载完成后关闭即可，不会再触发。
- `load-more-trigger` 是同一通路的另一个入口：一个真实按钮，取数中与关闭时自动停用。它是铺满一行的独立动作条目：宽度由容器给、高度随内容，中性描边与透明底，按下只换面不缩放。

### 组合

- 与[列表](./list)、[骨架屏](./skeleton)配合。
- 与[虚拟滚动](./virtualizer)组合为边滚边取的长列表：`target` 指向虚拟滚动的视口，哨兵放在内容层之后；示例见虚拟滚动页面。

### 最佳实践

- 提供明确的结束提示：“没有更多了”优于无声停止。
- 加载失败时可以重试，不静默停止。
- 放置一个 `load-more-trigger`：读屏在虚拟光标模式下不产生滚动事件，只靠哨兵无法获取第二页。
- 按钮的文案写在按钮内，组件不代填名称，读屏读出的与视觉一致。

### 反模式

- 页面底部有重要内容（页脚、版权、联系方式）却用无限滚动。
- 不提供结束提示，用户持续向下滚动。
- 与[虚拟滚动](./virtualizer)合用时把哨兵放在条目之间：窗口外的条目不渲染，哨兵永远无法进入可视区。
- 与[虚拟滚动](./virtualizer)合用时不提供 `target`：提前量按整页可视区计算，而实际滚动的是虚拟滚动的视口。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-infinite-scroll>` |
| Vue 组件 | `XhInfiniteScrollLoadMoreTrigger` `XhInfiniteScrollRoot` `XhInfiniteScrollSentinel` |
| 组合式函数 | `useInfiniteScroll` |
| 状态机 | `infiniteScrollMachine` |
| 皮肤 | `@xihan-ui/styles/infinite-scroll.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `distance` | `number` |  | 提前量（px）：哨兵距可视区该距离即视为进入，默认 0（实际出现才计）。扩展的是 getTargetEl 给出的可视区。 |
| `disabled` | `boolean` |  | 关闭：不再观察，也不再触发。列表已没有下一页时使用。 |
| `loading` | `boolean` |  | 正在取数：期间不观察、不重复触发。取完由宿主写回 false。 |
| `onLoad` | `() => void` |  | 应取下一页。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `load` | `` | 应取下一页 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhInfiniteScrollRoot` | `default` | `InfiniteScrollRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `loading` · `paused`

**事件**：`SENTINEL.ENTER` · `LOAD` · `MODE.SYNC` · `PRESS.START` · `PRESS.END`

**判据**：`isPaused` · `isLoading` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `InfiniteScrollPhase` |  |
| `loading` | `boolean` | 正在取数。 |
| `disabled` | `boolean` | 已关闭，不再观察。 |
| `getRootProps` | `() => T['element']` |  |
| `getSentinelProps` | `() => T['element']` |  |
| `getLoadMoreTriggerProps` | `() => T['button']` | 取下一页的按钮。文案由作者写在按钮中，组件不代填。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | held in load-more-trigger, 未关闭且未在取数 | 按住期间 load-more-trigger 投影 data-pressed，与指针 :active 同一副按压面（row 档只换面不缩放）；抬起、失焦或进入取数 / 关闭撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `sentinel` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/infinite-scroll.css` 使用 `[data-scope="infinite-scroll"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-xh-action-control` | '' |
| `load-more-trigger` | `data-xh-action-display` | 'always' |
| `load-more-trigger` | `data-xh-action-profile` | 'row' |
| `load-more-trigger` | `data-xh-action-size` | 'md' |
| `load-more-trigger` | `data-xh-action-variant` | 'outline' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-infinite-scroll-load-more-bg` | `load-more-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | infinite-scroll 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-bg-active` | `load-more-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | infinite-scroll 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-bg-hover` | `load-more-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | infinite-scroll 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-border` | `load-more-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | infinite-scroll 的 load-more-trigger 部件 border 覆盖槽。 |
| `--xh-infinite-scroll-load-more-border-hover` | `load-more-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` | infinite-scroll 的 load-more-trigger 部件 border-color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-fg` | `load-more-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | infinite-scroll 的 load-more-trigger 部件 color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-text-body-size` | infinite-scroll 的 load-more-trigger 部件 font-size 覆盖槽。 |
| `--xh-infinite-scroll-load-more-gap` | `load-more-trigger` | `gap` | `default` | `--xh-_action-profile-gap` | infinite-scroll 的 load-more-trigger 部件 gap 覆盖槽。 |
| `--xh-infinite-scroll-load-more-h` | `load-more-trigger` | `block-size`<br>`min-block-size` | `default`<br>`xh-action-profile=row` | `--xh-_action-profile-visual-size` | infinite-scroll 的 load-more-trigger 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-infinite-scroll-load-more-icon-size` | `load-more-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | infinite-scroll 的 load-more-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-infinite-scroll-load-more-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | infinite-scroll 的 load-more-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-infinite-scroll-load-more-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` | infinite-scroll 的 load-more-trigger 部件 border-radius 覆盖槽。 |
| `--xh-infinite-scroll-sentinel-size` | `sentinel` | `block-size` | `default` | `--xh-stroke-thin` | infinite-scroll 的 sentinel 部件 block-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
