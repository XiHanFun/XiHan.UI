来源：https://ui.docs.xihanfun.com/components/log

# Log 日志

等宽排版的滚动区域，一行一条，可以自动跟随到底部。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/log" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/log.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/log" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/log" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/log.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

root / viewport / content / line 四层；一行写什么由作者决定，组件只提供身份与等宽排版

```vue
<script setup lang="ts">
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const lines = [
  "12:00:01  boot     读取配置 config/app.yaml",
  "12:00:01  boot     监听 0.0.0.0:8080",
  "12:00:02  db       连接池就绪，最小 4 最大 32",
  "12:00:02  cache    命中率统计已开启",
  "12:00:03  http     GET  /health            200   3ms",
  "12:00:04  http     POST /api/orders        201  118ms",
  "12:00:05  http     GET  /api/orders/8812   200   21ms",
  "12:00:06  job      对账任务排入队列 batch-2026-08-10",
  "12:00:07  http     GET  /api/orders/8813   404    9ms",
  "12:00:08  job      对账任务完成，处理 1,204 笔",
];
</script>

<template>
  <XhLogRoot :rows="8" style="inline-size: 100%">
    <XhLogViewport>
      <XhLogContent>
        <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
      </XhLogContent>
    </XhLogViewport>
  </XhLogRoot>
</template>
```

```html
<xh-log rows="8" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <div data-xh-part="content">
        <div data-xh-part="line">12:00:01  boot     读取配置 config/app.yaml</div>
        <div data-xh-part="line">12:00:01  boot     监听 0.0.0.0:8080</div>
        <div data-xh-part="line">12:00:02  db       连接池就绪，最小 4 最大 32</div>
        <div data-xh-part="line">12:00:02  cache    命中率统计已开启</div>
        <div data-xh-part="line">12:00:03  http     GET  /health            200   3ms</div>
        <div data-xh-part="line">12:00:04  http     POST /api/orders        201  118ms</div>
        <div data-xh-part="line">12:00:05  http     GET  /api/orders/8812   200   21ms</div>
        <div data-xh-part="line">12:00:06  job      对账任务排入队列 batch-2026-08-10</div>
        <div data-xh-part="line">12:00:07  http     GET  /api/orders/8813   404    9ms</div>
        <div data-xh-part="line">12:00:08  job      对账任务完成，处理 1,204 笔</div>
      </div>
    </div>
  </div>
</xh-log>
```

## 组件结构

加粗的是必需部件。

`data-scope="log"`：**`root`** · **`viewport`** · **`content`** · `line` · `scroll-to-end-trigger` · `live-region`

## 示例

### 按行数定高

rows 决定可见几行，一行的高度归皮肤，修改 --xh-log-line-height 两者一起变化

```vue
<script setup lang="ts">
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const lines = Array.from(
  { length: 24 },
  (_, i) => `12:0${Math.floor(i / 10)}:${String(i % 10).padStart(2, "0")}  http  GET /api/items/${1000 + i}  200`,
);
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhLogRoot :rows="4">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
        </XhLogContent>
      </XhLogViewport>
    </XhLogRoot>

    <XhLogRoot :rows="10">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
        </XhLogContent>
      </XhLogViewport>
    </XhLogRoot>

    <!-- 同样 4 行，行高调宽一档，视口跟着一起长高 -->
    <XhLogRoot :rows="4" style="--xh-log-line-height: 1.75rem">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
        </XhLogContent>
      </XhLogViewport>
    </XhLogRoot>
  </div>
</template>
```

```html
<div id="log-rows" style="width: 100%; display: grid; gap: 12px">
  <xh-log rows="4">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-log>

  <xh-log rows="10">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-log>

  <!-- 同样 4 行，行高调宽一档，视口跟着一起长高 -->
  <xh-log rows="4" style="--xh-log-line-height: 1.75rem">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-log>
</div>

<script type="module">
  // 三份日志摆同一批行，行由脚本逐条写进内容层
  const stage = document.getElementById("log-rows");
  const lines = Array.from(
    { length: 24 },
    (_, i) =>
      `12:0${Math.floor(i / 10)}:${String(i % 10).padStart(2, "0")}  http  GET /api/items/${1000 + i}  200`,
  );

  for (const content of stage.querySelectorAll('[data-xh-part="content"]')) {
    for (const text of lines) {
      const line = document.createElement("div");
      line.dataset.xhPart = "line";
      line.textContent = text;
      content.append(line);
    }
  }
</script>
```

### 自动跟随到底部

新行进入时视口自动跟随；向上滚动一段即停止跟随，组件报告的 atBottom 与 scrollToBottom 足以自行绘制一条回到最新

```vue
<script setup lang="ts">
import { XhButton, XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";
import { onUnmounted, ref } from "vue";

const lines = ref(
  Array.from({ length: 10 }, (_, i) => `12:00:0${i}  boot  第 ${i + 1} 行 · 往上滚一段试试`),
);

let seq = lines.value.length;
let timer: number | undefined;
const streaming = ref(false);

function append(): void {
  seq += 1;
  lines.value.push(`12:0${Math.floor(seq / 60)}:${String(seq % 60).padStart(2, "0")}  http  第 ${seq} 行 · 新来的`);
}

function toggle(): void {
  streaming.value = !streaming.value;
  if (streaming.value)
    timer = window.setInterval(append, 400);
  else
    window.clearInterval(timer);
}

// 离开页面时把定时器收掉
onUnmounted(() => window.clearInterval(timer));
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhLogRoot v-slot="{ atBottom, sticking, scrollToBottom }" :rows="8">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
        </XhLogContent>
      </XhLogViewport>

      <!-- 不在底部时才露出来，排在视口下面 -->
      <div
        v-if="!atBottom"
        style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 12px"
      >
        <span style="font-size: 13px">已暂停跟随 · 跟随意图：{{ sticking ? "开" : "关" }}</span>
        <XhButton variant="outline" size="sm" @click="scrollToBottom()">回到最新</XhButton>
      </div>
    </XhLogRoot>

    <div style="display: flex; gap: 8px">
      <XhButton variant="solid" @click="toggle">{{ streaming ? "停止输出" : "开始输出" }}</XhButton>
      <XhButton variant="outline" @click="append">追加一行</XhButton>
    </div>
  </div>
</template>
```

```html
<div id="log-follow" style="width: 100%; display: grid; gap: 12px">
  <xh-log id="log-follow-view" rows="8">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="content" id="log-follow-content">
          <div data-xh-part="line">12:00:00  boot  第 1 行 · 往上滚一段试试</div>
          <div data-xh-part="line">12:00:01  boot  第 2 行 · 往上滚一段试试</div>
          <div data-xh-part="line">12:00:02  boot  第 3 行 · 往上滚一段试试</div>
          <div data-xh-part="line">12:00:03  boot  第 4 行 · 往上滚一段试试</div>
          <div data-xh-part="line">12:00:04  boot  第 5 行 · 往上滚一段试试</div>
          <div data-xh-part="line">12:00:05  boot  第 6 行 · 往上滚一段试试</div>
          <div data-xh-part="line">12:00:06  boot  第 7 行 · 往上滚一段试试</div>
          <div data-xh-part="line">12:00:07  boot  第 8 行 · 往上滚一段试试</div>
          <div data-xh-part="line">12:00:08  boot  第 9 行 · 往上滚一段试试</div>
          <div data-xh-part="line">12:00:09  boot  第 10 行 · 往上滚一段试试</div>
        </div>
      </div>

      <!-- 不在底部时才露出来，排在视口下面 -->
      <div
        id="log-follow-bar"
        style="
          display: none;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 12px;
        "
      >
        <span id="log-follow-hint" style="font-size: 13px"></span>
        <xh-button variant="outline" size="sm">
          <button data-xh-part="root" id="log-follow-back">回到最新</button>
        </xh-button>
      </div>
    </div>
  </xh-log>

  <div style="display: flex; gap: 8px">
    <xh-button variant="solid">
      <button data-xh-part="root" id="log-follow-stream">开始输出</button>
    </xh-button>
    <xh-button variant="outline">
      <button data-xh-part="root" id="log-follow-append">追加一行</button>
    </xh-button>
  </div>
</div>

<script type="module">
  const stage = document.getElementById("log-follow");
  const view = stage.querySelector("#log-follow-view");
  const content = stage.querySelector("#log-follow-content");
  const bar = stage.querySelector("#log-follow-bar");
  const hint = stage.querySelector("#log-follow-hint");
  const stream = stage.querySelector("#log-follow-stream");

  let seq = content.children.length;
  let timer;
  let streaming = false;

  function append() {
    // 示例被换走后停掉定时器
    if (!content.isConnected) {
      window.clearInterval(timer);
      return;
    }
    seq += 1;
    const line = document.createElement("div");
    line.dataset.xhPart = "line";
    line.textContent = `12:0${Math.floor(seq / 60)}:${String(seq % 60).padStart(2, "0")}  http  第 ${seq} 行 · 新来的`;
    content.append(line);
  }

  stage.querySelector("#log-follow-append").addEventListener("click", append);

  stream.addEventListener("click", () => {
    streaming = !streaming;
    stream.textContent = streaming ? "停止输出" : "开始输出";
    if (streaming) timer = window.setInterval(append, 400);
    else window.clearInterval(timer);
  });

  stage
    .querySelector("#log-follow-back")
    .addEventListener("click", () => view.scrollToBottom());

  // 离开底部才露出那一条，跟随意图一并写出来
  view.addEventListener("stick-change", (event) => {
    const { atBottom, sticking } = event.detail;
    bar.style.display = atBottom ? "none" : "flex";
    hint.textContent = `已暂停跟随 · 跟随意图：${sticking ? "开" : "关"}`;
  });
</script>
```

### 取行中

loading 使日志区报告 aria-busy 并把指针换为忙碌态；正在拉取那一行由作者自行渲染

```vue
<script setup lang="ts">
import { XhButton, XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";
import { ref } from "vue";

const lines = ref([
  "12:00:01  boot   服务已启动",
  "12:00:02  db     连接池就绪",
  "12:00:03  http   GET /health  200",
]);

const loading = ref(false);

// 取回来的一批行追加在后面，取的过程里 loading 立着
function fetchMore(): void {
  if (loading.value)
    return;
  loading.value = true;
  window.setTimeout(() => {
    const base = lines.value.length;
    for (let i = 1; i <= 5; i += 1)
      lines.value.push(`12:00:0${base + i}  http   GET /api/items/${1000 + base + i}  200`);
    loading.value = false;
  }, 1200);
}
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhLogRoot :rows="7" :loading="loading">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
          <XhLogLine v-if="loading" style="color: var(--xh-fg-muted)">正在拉取下一批…</XhLogLine>
        </XhLogContent>
      </XhLogViewport>
    </XhLogRoot>

    <div>
      <XhButton variant="solid" :disabled="loading" @click="fetchMore">再取 5 行</XhButton>
    </div>
  </div>
</template>
```

```html
<div id="log-loading" style="width: 100%; display: grid; gap: 12px">
  <xh-log id="log-loading-view" rows="7">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="content" id="log-loading-content">
          <div data-xh-part="line">12:00:01  boot   服务已启动</div>
          <div data-xh-part="line">12:00:02  db     连接池就绪</div>
          <div data-xh-part="line">12:00:03  http   GET /health  200</div>
        </div>
      </div>
    </div>
  </xh-log>

  <div>
    <xh-button id="log-loading-fetch" variant="solid">
      <button data-xh-part="root">再取 5 行</button>
    </xh-button>
  </div>
</div>

<script type="module">
  const stage = document.getElementById("log-loading");
  const view = stage.querySelector("#log-loading-view");
  const content = stage.querySelector("#log-loading-content");
  const fetchMore = stage.querySelector("#log-loading-fetch");

  // 「正在拉取」那一行由作者自己建，取完就撤掉
  const pending = document.createElement("div");
  pending.dataset.xhPart = "line";
  pending.style.color = "var(--xh-fg-muted)";
  pending.textContent = "正在拉取下一批…";

  let loading = false;

  function setLoading(next) {
    loading = next;
    view.loading = next;
    fetchMore.disabled = next;
    if (next) content.append(pending);
    else pending.remove();
  }

  fetchMore.querySelector("button").addEventListener("click", () => {
    if (loading) return;
    setLoading(true);
    window.setTimeout(() => {
      const base = content.children.length - 1;
      for (let i = 1; i <= 5; i += 1) {
        const line = document.createElement("div");
        line.dataset.xhPart = "line";
        line.textContent = `12:00:0${base + i}  http   GET /api/items/${1000 + base + i}  200`;
        content.insertBefore(line, pending);
      }
      setLoading(false);
    }, 1200);
  });
</script>
```

### 级别

行上写 level，四档 debug / info / warn / error 由皮肤染色；时间戳与行内标记仍归作者

```vue
<script setup lang="ts">
import type { LogLevel } from "@xihan-ui/headless";
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const raw: { time: string; level: LogLevel; text: string }[] = [
  { time: "12:00:01", level: "debug", text: "读取配置 config/app.yaml" },
  { time: "12:00:02", level: "info", text: "数据库连接池就绪" },
  { time: "12:00:04", level: "info", text: "POST /api/orders  201  118ms" },
  { time: "12:00:05", level: "warn", text: "慢查询 1,240ms  select * from orders" },
  { time: "12:00:06", level: "error", text: "支付网关超时，第 1 次重试" },
  { time: "12:00:08", level: "info", text: "支付网关恢复，订单 8812 已确认" },
];

// 级别也写成定宽文字标签：颜色之外还有一层不靠色觉的通道。
// 段与段的间隔补进字符串，模板里不留会被折叠的空白
const entries = raw.map(entry => ({
  text: entry.text,
  time: `${entry.time}  `,
  level: entry.level,
  label: `[${entry.level.toUpperCase()}]`.padEnd(9, " "),
}));
</script>

<template>
  <XhLogRoot :rows="6" style="inline-size: 100%">
    <XhLogViewport>
      <XhLogContent>
        <XhLogLine v-for="(entry, i) in entries" :key="i" :level="entry.level">
          <span style="color: var(--xh-fg-subtle)">{{ entry.time }}</span>
          <span>{{ entry.label }}</span>
          <span>{{ entry.text }}</span>
        </XhLogLine>
      </XhLogContent>
    </XhLogViewport>
  </XhLogRoot>
</template>
```

```html
<xh-log rows="6" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <div data-xh-part="content">
        <!-- 行内容整段写在一行里：line 是 white-space: pre，源码换行会被当成真的换行 -->
        <div data-xh-part="line" level="debug"><span style="color: var(--xh-fg-subtle)">12:00:01  </span><span>[DEBUG]  </span><span>读取配置 config/app.yaml</span></div>
        <div data-xh-part="line" level="info"><span style="color: var(--xh-fg-subtle)">12:00:02  </span><span>[INFO]   </span><span>数据库连接池就绪</span></div>
        <div data-xh-part="line" level="info"><span style="color: var(--xh-fg-subtle)">12:00:04  </span><span>[INFO]   </span><span>POST /api/orders  201  118ms</span></div>
        <div data-xh-part="line" level="warn"><span style="color: var(--xh-fg-subtle)">12:00:05  </span><span>[WARN]   </span><span>慢查询 1,240ms  select * from orders</span></div>
        <div data-xh-part="line" level="error"><span style="color: var(--xh-fg-subtle)">12:00:06  </span><span>[ERROR]  </span><span>支付网关超时，第 1 次重试</span></div>
        <div data-xh-part="line" level="info"><span style="color: var(--xh-fg-subtle)">12:00:08  </span><span>[INFO]   </span><span>支付网关恢复，订单 8812 已确认</span></div>
      </div>
    </div>
  </div>
</xh-log>
```

### 换为自绘滚动条

视口提供一个 id，用滚动条的 controls 挂载；滚动条浮在内容之上，不占宽度也不留空道

```vue
<script setup lang="ts">
import {
  XhLogContent,
  XhLogLine,
  XhLogRoot,
  XhLogViewport,
  XhScrollbarRoot,
  XhScrollbarThumb,
  XhScrollbarTrack,
} from "@xihan-ui/vue";

const lines = Array.from(
  { length: 40 },
  (_, i) => `12:0${Math.floor(i / 10)}:${String(i % 60).padStart(2, "0")}  http     GET  /api/orders/${8800 + i}   200   ${10 + i}ms`,
);
</script>

<template>
  <XhLogRoot :rows="8" style="inline-size: 100%">
    <XhLogViewport id="log-scrollbar-viewport">
      <XhLogContent>
        <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
      </XhLogContent>
    </XhLogViewport>
    <!-- 滚动条不必是滚动容器的后代，这里与视口平级摆在日志根里 -->
    <XhScrollbarRoot controls="log-scrollbar-viewport">
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </XhLogRoot>
</template>
```

```html
<xh-log rows="8" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="viewport" id="log-wc-scrollbar-viewport">
      <div data-xh-part="content">
        <div data-xh-part="line">12:00:00  http     GET  /api/orders/8800   200   10ms</div>
        <div data-xh-part="line">12:00:01  http     GET  /api/orders/8801   200   11ms</div>
        <div data-xh-part="line">12:00:02  http     GET  /api/orders/8802   200   12ms</div>
        <div data-xh-part="line">12:00:03  http     GET  /api/orders/8803   200   13ms</div>
        <div data-xh-part="line">12:00:04  http     GET  /api/orders/8804   200   14ms</div>
        <div data-xh-part="line">12:00:05  http     GET  /api/orders/8805   200   15ms</div>
        <div data-xh-part="line">12:00:06  http     GET  /api/orders/8806   200   16ms</div>
        <div data-xh-part="line">12:00:07  http     GET  /api/orders/8807   200   17ms</div>
        <div data-xh-part="line">12:00:08  http     GET  /api/orders/8808   200   18ms</div>
        <div data-xh-part="line">12:00:09  http     GET  /api/orders/8809   200   19ms</div>
        <div data-xh-part="line">12:01:10  http     GET  /api/orders/8810   200   20ms</div>
        <div data-xh-part="line">12:01:11  http     GET  /api/orders/8811   200   21ms</div>
        <div data-xh-part="line">12:01:12  http     GET  /api/orders/8812   200   22ms</div>
        <div data-xh-part="line">12:01:13  http     GET  /api/orders/8813   200   23ms</div>
        <div data-xh-part="line">12:01:14  http     GET  /api/orders/8814   200   24ms</div>
        <div data-xh-part="line">12:01:15  http     GET  /api/orders/8815   200   25ms</div>
        <div data-xh-part="line">12:01:16  http     GET  /api/orders/8816   200   26ms</div>
        <div data-xh-part="line">12:01:17  http     GET  /api/orders/8817   200   27ms</div>
        <div data-xh-part="line">12:01:18  http     GET  /api/orders/8818   200   28ms</div>
        <div data-xh-part="line">12:01:19  http     GET  /api/orders/8819   200   29ms</div>
        <div data-xh-part="line">12:02:20  http     GET  /api/orders/8820   200   30ms</div>
        <div data-xh-part="line">12:02:21  http     GET  /api/orders/8821   200   31ms</div>
        <div data-xh-part="line">12:02:22  http     GET  /api/orders/8822   200   32ms</div>
        <div data-xh-part="line">12:02:23  http     GET  /api/orders/8823   200   33ms</div>
      </div>
    </div>
    <!-- 嵌套的 xh-* 子树不参与外层的角色节点发现，这一条只归自己的元素管 -->
    <xh-scrollbar controls="log-wc-scrollbar-viewport">
      <div data-xh-part="root">
        <div data-xh-part="track">
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-scrollbar>
  </div>
</xh-log>
```

### 回到底部与播报

向上翻一段，右下角的按钮自动显示，按下后归位并重新粘附；输出结束后在播报区朗读一句结论

```vue
<script setup lang="ts">
import {
  XhLogContent,
  XhLogLine,
  XhLogLiveRegion,
  XhLogRoot,
  XhLogScrollToEndTrigger,
  XhLogViewport,
} from "@xihan-ui/vue";
import { onMounted, onUnmounted, ref } from "vue";

const lines = ref(
  Array.from(
    { length: 10 },
    (_, i) => `12:00:0${i}  build  编译 packages/module-${i + 1} · 往上翻一段试试`,
  ),
);
const announcement = ref("");

let timer: number | undefined;

function tick(): void {
  const seq = lines.value.length + 1;
  lines.value = [...lines.value, `12:0${Math.floor(seq / 60)}:${String(seq % 60).padStart(2, "0")}  build  编译 packages/module-${seq}`];
  if (seq < 24) {
    timer = window.setTimeout(tick, 700);
    return;
  }
  // 一段输出收尾时才念一句，逐行播报会把读屏淹掉
  announcement.value = `构建完成，共 ${seq} 行输出，0 个错误`;
}

// 挂载后才起：<script setup> 顶层在服务端渲染时也执行，那里没有 window
onMounted(() => {
  timer = window.setTimeout(tick, 700);
});

// 离开页面时把定时器收掉
onUnmounted(() => window.clearTimeout(timer));
</script>

<template>
  <XhLogRoot :rows="8" style="inline-size: 100%">
    <XhLogViewport>
      <XhLogContent>
        <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
      </XhLogContent>
    </XhLogViewport>

    <!-- 留空就由皮肤画一枚向下的字形，往里塞节点即换成自己的图形 -->
    <XhLogScrollToEndTrigger />

    <!-- 视觉隐藏的播报区：念哪一句、什么时候念都归宿主定 -->
    <XhLogLiveRegion>{{ announcement }}</XhLogLiveRegion>
  </XhLogRoot>
</template>
```

```html
<xh-log id="log-scroll-button" rows="8" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <div data-xh-part="content">
        <div data-xh-part="line">12:00:00  build  编译 packages/module-1 · 往上翻一段试试</div>
        <div data-xh-part="line">12:00:01  build  编译 packages/module-2 · 往上翻一段试试</div>
        <div data-xh-part="line">12:00:02  build  编译 packages/module-3 · 往上翻一段试试</div>
        <div data-xh-part="line">12:00:03  build  编译 packages/module-4 · 往上翻一段试试</div>
        <div data-xh-part="line">12:00:04  build  编译 packages/module-5 · 往上翻一段试试</div>
        <div data-xh-part="line">12:00:05  build  编译 packages/module-6 · 往上翻一段试试</div>
        <div data-xh-part="line">12:00:06  build  编译 packages/module-7 · 往上翻一段试试</div>
        <div data-xh-part="line">12:00:07  build  编译 packages/module-8 · 往上翻一段试试</div>
        <div data-xh-part="line">12:00:08  build  编译 packages/module-9 · 往上翻一段试试</div>
        <div data-xh-part="line">12:00:09  build  编译 packages/module-10 · 往上翻一段试试</div>
      </div>
    </div>

    <!-- 留空就由皮肤画一枚向下的字形，往里塞节点即换成自己的图形 -->
    <button data-xh-part="scroll-to-end-trigger"></button>

    <!-- 视觉隐藏的播报区：念哪一句、什么时候念都归宿主定 -->
    <div data-xh-part="live-region"></div>
  </div>
</xh-log>

<script type="module">
  const view = document.getElementById("log-scroll-button");
  const content = view.querySelector('[data-xh-part="content"]');
  const live = view.querySelector('[data-xh-part="live-region"]');

  function tick() {
    // 示例被换走后停手，别让定时器在卸载后继续跑
    if (!content.isConnected) return;
    const seq = content.children.length + 1;
    const line = document.createElement("div");
    line.dataset.xhPart = "line";
    line.textContent = `12:0${Math.floor(seq / 60)}:${String(seq % 60).padStart(2, "0")}  build  编译 packages/module-${seq}`;
    content.append(line);
    if (seq < 24) {
      setTimeout(tick, 700);
      return;
    }
    // 一段输出收尾时才念一句，逐行播报会把读屏淹掉
    live.textContent = `构建完成，共 ${seq} 行输出，0 个错误`;
  }

  setTimeout(tick, 700);
</script>
```

## 设计指引

### 何时使用

- 构建输出、运行日志、命令行回显。
- 任何从底部持续增长、需要始终跟随到底的内容：内容不需要区分条目身份，整段追加即可。

### 何时不用

- 内容是会话、条目有身份且需要逐条遍历时，使用[消息流](./message-feed)。
- 展示结构化记录、需要筛选排序时，使用[表格](./table)。
- 展示一段代码时，使用[代码视图](./code-view)。

### 特性

- 结构四层：`root` · `viewport` · `content` · `line`；每行内容由作者决定，组件只提供身份与等宽排版。另有两个可选部件：`scroll-to-end-trigger` 与 `live-region`。
- `rows` 按行数定高。
- 自动跟随到底部；用户向上翻时停止跟随，回到底部后恢复。
- 内置“回到底部”：离开底部时出现，按下后归位并重新粘附。留空时皮肤绘制向下的字形，放入节点即替换为自定义图形。
- 视口自身可聚焦，整块日志占一个 Tab 停靠位，方向键与翻页键交给浏览器滚动。

### 组合

- 行内可以用[文本高亮](./highlight)标出关键词。
- 给视口一个 id，把[滚动条](./scrollbar)的 `controls` 指向它，滚动条与视口平级放在 `root` 内：它浮在内容之上，不占宽度。未挂自绘滚动条时视口自行预留一条通道，原生滚动条出现与消失不会推动文字。

### 最佳实践

- 用户向上翻时不强行拉回底部。
- 行数很大时截断或虚拟化，不把十万行全部挂载。

### 反模式

- 每到一行就整块重渲。
- 不提供复制或下载全部日志的入口。
- 把每一行都写进播报区，读屏会被逐行打断。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-log>` |
| Vue 组件 | `XhLogContent` `XhLogLine` `XhLogLiveRegion` `XhLogRoot` `XhLogScrollToEndTrigger` `XhLogViewport` |
| 组合式函数 | `useLog` |
| 状态机 | `logMachine` |
| 皮肤 | `@xihan-ui/styles/log.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `threshold` | `number` |  | 距底部多少 px 视为在底部，默认使用贴底原语的默认值。 |
| `onStickChange` | `(details: LogStickChangeDetails) => void` |  | 贴底状态变化时通知宿主。 |
| `loading` | `boolean` |  | 行仍在传输中：日志区报告 aria-busy，根写 data-loading。 |
| `rows` | `number` |  | 视口按多少行定高；未提供时高度由皮肤决定。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。影响行文字号与内衬，行高不随档位变化。 |
| `translations` | `Partial<LogTranslations>` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `stick-change` | `LogStickChangeDetails` | 贴底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhLogRoot` | `default` | `LogRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `scroll-to-end-trigger` | 'visible' \| 'hidden' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`STICK.CHANGE` · `SCROLL_TO_BOTTOM` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `rows` | `number \| undefined` | 取整后的行数；rows 缺席或不是正数时为 undefined。 |
| `loading` | `boolean` |  |
| `atBottom` | `boolean` | 当前滚动位置是否落在底部阈值内。 |
| `sticking` | `boolean` | 新行到达时是否自动跟随到底部。 |
| `showScrollToEndTrigger` | `boolean` | 是否显示回到底部按钮，不在底部时为 true。 |
| `scrollToBottom` | `() => void` | 滚动到底部并恢复贴附。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getLineProps` | `(props?: LogLineProps) => T['element']` |  |
| `getScrollToEndTriggerProps` | `() => T['button']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 焦点进入日志区 | 日志区自身可聚焦，方向键/PageUp/PageDown/Home/End 交给浏览器滚动，组件不接管 |
| `Space` / `Enter` | 焦点在"回到底部"按钮上 | 滚回底部并重新粘附 |
| `Space` / `Enter` | 按住"回到底部"按钮且视口不在底部 | 按住期间 scroll-to-end-trigger 投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或回到底部（按钮收起）撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `viewport` | `aria-busy` | 'true' \| undefined |
| `viewport` | `aria-label` | label.log |
| `viewport` | `aria-live` | 'off' |
| `viewport` | `role` | 'log' |
| `scroll-to-end-trigger` | `aria-label` | label.scrollToBottom |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

- 视口是 `role=log`，但其隐含的 `aria-live` 被显式关闭：逐行读出连续输出会成为读屏噪声。
- 播报使用独立的 `live-region`：宿主决定读哪一句、何时读，例如一段输出结束后读出结论与错误条数。不要把每一行原样写入，否则等于重新打开逐行播报。
- 成批取行期间视口报告 `aria-busy`；播报区是视口的兄弟节点，不受其影响。

## 样式参考

### 皮肤

`@xihan-ui/styles/log.css` 使用 `[data-scope="log"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-bottom` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-sticking` | ''（条件成立时才出现） |
| `line` | `data-level` | line?.level |
| `scroll-to-end-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `scroll-to-end-trigger` | `data-state` | 'visible' \| 'hidden' |
| `scroll-to-end-trigger` | `data-xh-action-control` | '' |
| `scroll-to-end-trigger` | `data-xh-action-display` | 'always' |
| `scroll-to-end-trigger` | `data-xh-action-profile` | 'floating' |
| `scroll-to-end-trigger` | `data-xh-action-size` | 'xs' |
| `scroll-to-end-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-log-bg` | `root` | `background` | `default` | `--xh-bg-surface` | log 的 root 部件 background 覆盖槽。 |
| `--xh-log-border` | `root` | `border` | `default` | `--xh-border-default` | log 的 root 部件 border 覆盖槽。 |
| `--xh-log-content-px` | `content` | `padding-inline` | `default` | `--xh-_log-content-px` | log 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-log-fg` | `root` | `color` | `default` | `--xh-fg-default` | log 的 root 部件 color 覆盖槽。 |
| `--xh-log-font` | `content` | `font-family` | `default` | `--xh-font-family-mono` | log 的 content 部件 font-family 覆盖槽。 |
| `--xh-log-font-size` | `content` | `font-size` | `default` | `--xh-_log-font-size` | log 的 content 部件 font-size 覆盖槽。 |
| `--xh-log-icon-size` | `scroll-to-end-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | log 的 scroll-to-end-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-log-level-debug-fg` | `line` | `color` | `level=debug` | `--xh-fg-subtle` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-level-error-fg` | `line` | `color` | `level=error` | `--xh-fg-danger` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-level-info-fg` | `line` | `color` | `level=info` | `--xh-fg-default` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-level-warn-fg` | `line` | `color` | `level=warn` | `--xh-fg-warning` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-line-height` | `line`<br>`root`<br>`viewport` | `block-size`<br>`line-height` | `default` | `1.25rem` | log 的 line、root、viewport 部件 block-size、line-height 覆盖槽。 |
| `--xh-log-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | log 的 root 部件 border-radius 覆盖槽。 |
| `--xh-log-rows` | `viewport` | `block-size` | `default` | `16` | log 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-bg` | `scroll-to-end-trigger` | `background-color` | `default` | `--xh-material-frosted-bg` | log 的 scroll-to-end-trigger 部件 background-color 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-bg-hover` | `scroll-to-end-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | log 的 scroll-to-end-trigger 部件 background-color 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-border` | `scroll-to-end-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-material-frosted-border` | log 的 scroll-to-end-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-fg` | `scroll-to-end-trigger` | `color` | `default` | `--xh-material-frosted-fg` | log 的 scroll-to-end-trigger 部件 color 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-inset` | `scroll-to-end-trigger` | `inset-block-end`<br>`inset-inline-end` | `default` | `--xh-space-3` | log 的 scroll-to-end-trigger 部件 inset-block-end、inset-inline-end 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-radius` | `scroll-to-end-trigger` | `border-radius` | `default` | `--xh-shape-circle` | log 的 scroll-to-end-trigger 部件 border-radius 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-shadow` | `scroll-to-end-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-material-frosted-shadow` | log 的 scroll-to-end-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-size` | `scroll-to-end-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_action-profile-visual-size` | log 的 scroll-to-end-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-log-shadow` | `root` | `box-shadow` | `default` | `none` | log 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-log-tab-size` | `line` | `tab-size` | `default` | `4` | log 的 line 部件 tab-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-log-button-in` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
