来源：https://ui.docs.xihanfun.com/components/infinite-scroll

# 无限滚动 `infinite-scroll`

取下一页的通用触发器，滚动只是默认的触发方式。

## 何时使用

- 时间流、消息列表这类用户只关心"再来一些"的内容。

## 何时不用

- 用户需要跳到确定位置或分享某一页：用[分页](./pagination)。
- 页面有页脚需要够得着：无限滚动会让页脚永远追不上。

## 特性

- `distance` 是提前量：距底部还有这么远就触发，用户感觉不到等待。
- `loading` 与 `disabled` 由组件交给宿主，加载提示与结束语都由宿主自己摆。
- 取完之后关掉即可，不会再触发。
- `load-more-trigger` 是同一条通路的另一个入口：一颗真按钮，取数中与关掉两段自动停用。

## 示例

### 基础用法

哨兵滚进可视区就派 load，取完把 loading 写回 false

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

### 提前量

distance 把可视区沿块轴向外扩，哨兵还没露头就先取下一页

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

### 取到没有了

最后一页取完把 disabled 打开，哨兵不再被观察，load 也不再派

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

phase / loading / disabled 由组件交给宿主，加载提示与结束语都由宿主自己摆

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

与哨兵同一条通路：读屏在虚拟光标模式下不产生滚动事件，这颗按钮是它的键盘等价入口

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
      <div style="display: flex; justify-content: center; padding: 8px 12px">
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
    display: flex;
    justify-content: center;
    padding: 8px 12px;
  }
</style>

<div
  id="infinite-scroll-more-shell"
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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-infinite-scroll>` |
| Vue 组件 | `XhInfiniteScrollLoadMoreTrigger` `XhInfiniteScrollRoot` `XhInfiniteScrollSentinel` |
| 组合式函数 | `useInfiniteScroll` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/infinite-scroll.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="infinite-scroll"`：**`root`** · **`sentinel`** · `load-more-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `distance` | `number` |  | 提前量（px）：哨兵离可视区还有这么远就算进入，默认 0（真正露头才算）。扩的是 getTargetEl 给出的那块可视区。 |
| `disabled` | `boolean` |  | 关掉：不再观察，也不再触发。列表已经没有下一页时用它。 |
| `loading` | `boolean` |  | 正在取数：其间不观察、不重复触发。取完由宿主写回 false。 |
| `onLoad` | `() => void` |  | 该取下一页了。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `load` | `` | 该取下一页了 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhInfiniteScrollRoot` | `default` | `InfiniteScrollRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`SENTINEL.ENTER` · `LOAD` · `MODE.SYNC`

**判据**：`isPaused` · `isLoading`

## connect API

`useInfiniteScroll` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `InfiniteScrollPhase` |  |
| `loading` | `boolean` | 正在取数。 |
| `disabled` | `boolean` | 已关掉，不再观察。 |
| `getRootProps` | `() => T['element']` |  |
| `getSentinelProps` | `() => T['element']` |  |
| `getLoadMoreTriggerProps` | `() => T['button']` | 取下一页的按钮。文案由作者写在按钮里，组件不代填。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `sentinel` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/infinite-scroll.css` 按部件选择：`[data-scope="infinite-scroll"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-infinite-scroll-load-more-bg` · `--xh-infinite-scroll-load-more-bg-active` · `--xh-infinite-scroll-load-more-bg-hover` · `--xh-infinite-scroll-load-more-border` · `--xh-infinite-scroll-load-more-border-hover` · `--xh-infinite-scroll-load-more-fg` · `--xh-infinite-scroll-load-more-font-size` · `--xh-infinite-scroll-load-more-gap` · `--xh-infinite-scroll-load-more-h` · `--xh-infinite-scroll-load-more-px` · `--xh-infinite-scroll-load-more-radius` · `--xh-infinite-scroll-sentinel-size`

## 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[列表](./list)、[骨架屏](./skeleton)配合。
- 与[虚拟滚动](./virtualizer)合成一条边滚边取的长列表：`target` 指向虚拟滚动的视口，哨兵摆在内容层之后；示例在虚拟滚动那一页。

## 最佳实践

- 明确的结束提示："没有更多了"比无声停止好。
- 加载失败要能重试，别静默停在那里。
- 摆一颗 `load-more-trigger`：读屏在虚拟光标模式下不产生滚动事件，只靠哨兵那条路取不到第二页。
- 按钮的文案写在按钮里，组件不代填名字——读屏念的与眼睛看的才是同一句。

## 反模式

- 页面底部有重要内容（页脚、版权、联系方式）却用无限滚动。
- 不给结束提示，用户一直往下滚。
- 与[虚拟滚动](./virtualizer)合用时把哨兵摆进条目之间：窗口外的条目不渲染，哨兵也就永远进不了可视区。
- 与[虚拟滚动](./virtualizer)合用时不给 `target`：提前量按整页可视区算，而真正在滚的是虚拟滚动的视口那一层。
