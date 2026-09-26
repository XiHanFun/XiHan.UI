来源：https://ui.docs.xihanfun.com/components/message-feed

# MessageFeed 消息流 `alpha`

一段会话的消息序列：粘底跟随、条目集合语义、键盘遍历与一个统一的播报区。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/message-feed" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/message-feed.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/message-feed" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/message-feed" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/message-feed.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

消息内容全部由作者编写；组件管理的是集合语义、粘底与播报区

```vue
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";

const messages = [
  { id: "m1", role: "user" as const, who: "我", text: "这个组件负责什么？" },
  { id: "m2", role: "assistant" as const, who: "助手", text: "集合语义、粘底跟随，以及一个统一的播报区。" },
  { id: "m3", role: "user" as const, who: "我", text: "气泡样式呢？" },
  { id: "m4", role: "assistant" as const, who: "助手", text: "气泡、头像、时间都由你自己写，按条目上的 data-role 出样式。" },
];
</script>

<template>
  <!-- 键盘：Tab 进来落在第一条，PageDown / PageUp 在消息之间走，Ctrl+End 一步走到流外 -->
  <XhMessageFeedRoot :count="messages.length" style="block-size: 260px;">
    <XhMessageFeedViewport>
      <XhMessageFeedList>
        <XhMessageFeedItem
          v-for="(message, index) in messages"
          :key="message.id"
          :item-id="message.id"
          :item-index="index"
          :item-role="message.role"
        >
          <XhMessageFeedItemLabel>{{ message.who }}</XhMessageFeedItemLabel>
          <div>{{ message.text }}</div>
        </XhMessageFeedItem>
      </XhMessageFeedList>
    </XhMessageFeedViewport>
    <XhMessageFeedScrollToEndTrigger />
  </XhMessageFeedRoot>
</template>
```

```html
<!-- 键盘：Tab 进来落在第一条，PageDown / PageUp 在消息之间走，Ctrl+End 一步走到流外 -->
<xh-message-feed count="4" style="block-size: 260px">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <div data-xh-part="list">
        <article data-xh-part="item" item-id="m1" item-index="0" item-role="user">
          <span data-xh-part="item-label">我</span>
          <div>这个组件负责什么？</div>
        </article>
        <article data-xh-part="item" item-id="m2" item-index="1" item-role="assistant">
          <span data-xh-part="item-label">助手</span>
          <div>集合语义、粘底跟随，以及一个统一的播报区。</div>
        </article>
        <article data-xh-part="item" item-id="m3" item-index="2" item-role="user">
          <span data-xh-part="item-label">我</span>
          <div>气泡样式呢？</div>
        </article>
        <article data-xh-part="item" item-id="m4" item-index="3" item-role="assistant">
          <span data-xh-part="item-label">助手</span>
          <div>气泡、头像、时间都由你自己写，按条目上的 data-role 出样式。</div>
        </article>
      </div>
    </div>
    <button data-xh-part="scroll-to-end-trigger"></button>
  </div>
</xh-message-feed>
```

## 组件结构

加粗的是必需部件。

`data-scope="message-feed"`：**`root`** · **`viewport`** · **`list`** · `item` · `item-label` · `pending-indicator` · `scroll-to-end-trigger` · `live-region`

## 示例

### 粘底跟随与播报

新消息增长时自动到底部，向上翻即解除；一轮结束后在播报区朗读一句

```vue
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedLiveRegion,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

const messages = ref([{ id: "m0", text: "第 1 条：往上翻一下，粘附会解除，右下角出现回到底部。" }]);
const announcement = ref("");
const sticking = ref(true);

let timer = 0;
function tick() {
  const n = messages.value.length + 1;
  messages.value = [...messages.value, { id: `m${n}`, text: `第 ${n} 条：内容还在长。` }];
  announcement.value = `已收到 ${n} 条消息`;
  if (n < 12)
    timer = window.setTimeout(tick, 1200);
}
// 挂载后才起：<script setup> 顶层在服务端渲染时也执行，那里没有 window
onMounted(() => {
  timer = window.setTimeout(tick, 1200);
});

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <XhMessageFeedRoot
    :count="messages.length"
    status="streaming"
    style="block-size: 220px;"
    @stick-change="sticking = $event.sticking"
  >
    <XhMessageFeedViewport>
      <XhMessageFeedList>
        <XhMessageFeedItem
          v-for="(message, index) in messages"
          :key="message.id"
          :item-id="message.id"
          :item-index="index"
          item-role="assistant"
        >
          {{ message.text }}
        </XhMessageFeedItem>
      </XhMessageFeedList>
    </XhMessageFeedViewport>
    <XhMessageFeedScrollToEndTrigger />
    <!-- 一份会话只该有这一个活区：每条消息各开一个会互相打断 -->
    <XhMessageFeedLiveRegion>{{ announcement }}</XhMessageFeedLiveRegion>
  </XhMessageFeedRoot>
</template>
```

```html
<xh-message-feed id="message-feed-sticky" count="1" status="streaming" style="block-size: 220px">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <div data-xh-part="list">
        <article data-xh-part="item" item-id="m1" item-index="0" item-role="assistant">
          第 1 条：往上翻一下，粘附会解除，右下角出现回到底部。
        </article>
      </div>
    </div>
    <button data-xh-part="scroll-to-end-trigger"></button>
    <!-- 一份会话只该有这一个活区：每条消息各开一个会互相打断 -->
    <div data-xh-part="live-region"></div>
  </div>
</xh-message-feed>

<script type="module">
  // 消息由宿主追加，元素不替作者生成节点
  const feed = document.getElementById("message-feed-sticky");
  const list = feed.querySelector('[data-xh-part="list"]');
  const live = feed.querySelector('[data-xh-part="live-region"]');

  let n = 1;
  const tick = () => {
    // 元素被移出文档就收手，别让定时器在卸载后继续跑
    if (!feed.isConnected) return;
    n += 1;
    const item = document.createElement("article");
    item.setAttribute("data-xh-part", "item");
    item.setAttribute("item-id", `m${n}`);
    item.setAttribute("item-index", String(n - 1));
    item.setAttribute("item-role", "assistant");
    item.textContent = `第 ${n} 条：内容还在长。`;
    list.appendChild(item);
    feed.setAttribute("count", String(n));
    live.textContent = `已收到 ${n} 条消息`;
    if (n < 12) setTimeout(tick, 1200);
  };
  setTimeout(tick, 1200);
</script>
```

### 按角色分侧

条目上带 data-role，左右分侧与气泡在使用者一侧编写，组件不预设这层外观

```vue
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";

const messages = [
  { id: "m1", role: "user" as const, who: "我", text: "帮我把上面那段改成三句话。" },
  { id: "m2", role: "assistant" as const, who: "助手", text: "好的，三句话的版本如下，保留了原来的结论顺序。" },
  { id: "m3", role: "user" as const, who: "我", text: "第二句再短一点。" },
  { id: "m4", role: "assistant" as const, who: "助手", text: "已经把第二句压到十二个字，其余不动。" },
];

// 用户侧靠右成气泡，助手侧整行铺开
const bubble = {
  alignSelf: "flex-end",
  maxInlineSize: "75%",
  padding: "var(--xh-space-2) var(--xh-space-3)",
  background: "var(--xh-bg-subtle)",
  borderRadius: "var(--xh-shape-surface)",
};
</script>

<template>
  <XhMessageFeedRoot :count="messages.length" style="block-size: 260px;">
    <XhMessageFeedViewport>
      <XhMessageFeedList>
        <XhMessageFeedItem
          v-for="(message, index) in messages"
          :key="message.id"
          :item-id="message.id"
          :item-index="index"
          :item-role="message.role"
          :style="message.role === 'user' ? bubble : undefined"
        >
          <XhMessageFeedItemLabel>{{ message.who }}</XhMessageFeedItemLabel>
          <div>{{ message.text }}</div>
        </XhMessageFeedItem>
      </XhMessageFeedList>
    </XhMessageFeedViewport>
    <XhMessageFeedScrollToEndTrigger />
  </XhMessageFeedRoot>
</template>
```

```html
<style>
  /* 用户侧靠右成气泡，助手侧整行铺开 */
  #message-feed-roles [data-xh-part="item"][data-role="user"] {
    align-self: flex-end;
    max-inline-size: 75%;
    padding: var(--xh-space-2) var(--xh-space-3);
    background: var(--xh-bg-subtle);
    border-radius: var(--xh-shape-surface);
  }
</style>

<xh-message-feed id="message-feed-roles" count="4" style="block-size: 260px">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <div data-xh-part="list">
        <article data-xh-part="item" item-id="m1" item-index="0" item-role="user">
          <span data-xh-part="item-label">我</span>
          <div>帮我把上面那段改成三句话。</div>
        </article>
        <article data-xh-part="item" item-id="m2" item-index="1" item-role="assistant">
          <span data-xh-part="item-label">助手</span>
          <div>好的，三句话的版本如下，保留了原来的结论顺序。</div>
        </article>
        <article data-xh-part="item" item-id="m3" item-index="2" item-role="user">
          <span data-xh-part="item-label">我</span>
          <div>第二句再短一点。</div>
        </article>
        <article data-xh-part="item" item-id="m4" item-index="3" item-role="assistant">
          <span data-xh-part="item-label">助手</span>
          <div>已经把第二句压到十二个字，其余不动。</div>
        </article>
      </div>
    </div>
    <button data-xh-part="scroll-to-end-trigger"></button>
  </div>
</xh-message-feed>
```

### 运行态与播报

status 由宿主持有，组件只把它透出为 root 上的 data-state；已发送、等首个片段时列表之后的呼吸点亮起，首个片段一到就收；播报只发生在 live-region 中，一轮结束后才写入一句

```vue
<script setup lang="ts">
import {
  XhButton,
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedLiveRegion,
  XhMessageFeedPendingIndicator,
  XhMessageFeedRoot,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

type Status = "idle" | "submitted" | "streaming" | "error";

const first = { id: "m1", role: "user" as const, who: "我", text: "帮我写一段开场白。" };
const messages = ref([first]);
const status = ref<Status>("idle");
// 播报只写整段最终文本：中途逐字写等于让读屏把同一段话越念越长
const announcement = ref("");

let timer = 0;

function run(): void {
  window.clearTimeout(timer);
  messages.value = [first];
  announcement.value = "";
  status.value = "submitted";

  timer = window.setTimeout(() => {
    status.value = "streaming";
    messages.value = [
      first,
      { id: "m2", role: "assistant" as const, who: "助手", text: "好的，正在往下写…" },
    ];

    timer = window.setTimeout(() => {
      const text = "好的，这是一段开场白：欢迎来到曦寒设计系统。";
      messages.value = [first, { id: "m2", role: "assistant" as const, who: "助手", text }];
      status.value = "idle";
      // 一轮结束时一次性写进播报区
      announcement.value = text;
    }, 1200);
  }, 600);
}

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhMessageFeedRoot :count="messages.length" :status="status" style="block-size: 200px;">
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          <XhMessageFeedItem
            v-for="(message, index) in messages"
            :key="message.id"
            :item-id="message.id"
            :item-index="index"
            :item-role="message.role"
            :item-streaming="status === 'streaming' && index === messages.length - 1"
          >
            <XhMessageFeedItemLabel>{{ message.who }}</XhMessageFeedItemLabel>
            <div>{{ message.text }}</div>
          </XhMessageFeedItem>
        </XhMessageFeedList>
        <XhMessageFeedPendingIndicator />
      </XhMessageFeedViewport>
      <XhMessageFeedLiveRegion>{{ announcement }}</XhMessageFeedLiveRegion>
    </XhMessageFeedRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="solid" @click="run">跑一轮</XhButton>
      <XhButton variant="outline" @click="status = 'error'">置为 error</XhButton>
      <span>status：{{ status }}</span>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <xh-message-feed id="message-feed-status" count="1" status="idle" style="block-size: 200px">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="list" id="message-feed-status-list">
          <article data-xh-part="item" item-id="m1" item-index="0" item-role="user">
            <span data-xh-part="item-label">我</span>
            <div>帮我写一段开场白。</div>
          </article>
        </div>
        <span data-xh-part="pending-indicator"></span>
      </div>
      <div data-xh-part="live-region" id="message-feed-status-live"></div>
    </div>
  </xh-message-feed>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="message-feed-status-run" variant="solid">
      <button data-xh-part="root">跑一轮</button>
    </xh-button>
    <xh-button id="message-feed-status-fail" variant="outline">
      <button data-xh-part="root">置为 error</button>
    </xh-button>
    <span>status：<span id="message-feed-status-readout">idle</span></span>
  </div>
</div>

<script type="module">
  const feed = document.getElementById("message-feed-status");
  const list = document.getElementById("message-feed-status-list");
  const live = document.getElementById("message-feed-status-live");
  const readout = document.getElementById("message-feed-status-readout");
  let timer = 0;

  // 运行态的真源在宿主，组件只负责把它铺成 data-state
  function setStatus(status) {
    feed.setAttribute("status", status);
    readout.textContent = status;
  }

  // 补一条助手消息，返回正文节点以便后续改写
  function appendReply(text) {
    const item = document.createElement("article");
    item.setAttribute("data-xh-part", "item");
    item.setAttribute("item-id", "m2");
    item.setAttribute("item-index", "1");
    item.setAttribute("item-role", "assistant");
    item.innerHTML = '<span data-xh-part="item-label"></span><div></div>';
    item.querySelector('[data-xh-part="item-label"]').textContent = "助手";
    const body = item.querySelector("div");
    body.textContent = text;
    list.append(item);
    feed.setAttribute("count", "2");
    return item;
  }

  document.getElementById("message-feed-status-run").addEventListener("click", () => {
    window.clearTimeout(timer);
    list.querySelector('[item-id="m2"]')?.remove();
    feed.setAttribute("count", "1");
    live.textContent = "";
    setStatus("submitted");

    timer = window.setTimeout(() => {
      setStatus("streaming");
      const item = appendReply("好的，正在往下写…");
      item.toggleAttribute("item-streaming", true);

      timer = window.setTimeout(() => {
        const text = "好的，这是一段开场白：欢迎来到曦寒设计系统。";
        item.querySelector("div").textContent = text;
        item.toggleAttribute("item-streaming", false);
        setStatus("idle");
        // 播报只写整段最终文本：中途逐字写等于让读屏把同一段话越念越长
        live.textContent = text;
      }, 1200);
    }, 600);
  });

  document.getElementById("message-feed-status-fail").addEventListener("click", () => {
    setStatus("error");
  });
</script>
```

### 触底加载更多

stick-change 报告到达底部，宿主据此获取下一页；先向上翻一段再滚回底部，取回的消息接在后面

```vue
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const maxPage = 3;
const messages = ref(
  Array.from({ length: 8 }, (_, i) => ({
    id: `m${i + 1}`,
    text: `第 ${i + 1} 条 · 先往上翻一段，再滚回底部`,
  })),
);
const page = ref(1);
const loading = ref(false);

// 到了底、手上没在取、还有下一页，三条都满足才发起这一次加载
function onStickChange(details: { atBottom: boolean; sticking: boolean }): void {
  if (!details.atBottom || loading.value || page.value >= maxPage)
    return;
  loading.value = true;
  window.setTimeout(() => {
    page.value += 1;
    const base = messages.value.length;
    for (let i = 1; i <= 4; i += 1) {
      messages.value.push({
        id: `m${base + i}`,
        text: `第 ${base + i} 条 · 第 ${page.value} 页取回来的`,
      });
    }
    loading.value = false;
  }, 600);
}
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 提示行不是消息，摆在列表外面：条目必须是 list 的直接子节点 -->
    <XhMessageFeedRoot
      :count="messages.length"
      style="block-size: 220px;"
      @stick-change="onStickChange"
    >
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          <XhMessageFeedItem
            v-for="(message, index) in messages"
            :key="message.id"
            :item-id="message.id"
            :item-index="index"
            item-role="assistant"
          >
            {{ message.text }}
          </XhMessageFeedItem>
        </XhMessageFeedList>
      </XhMessageFeedViewport>
      <XhMessageFeedScrollToEndTrigger />
    </XhMessageFeedRoot>

    <span>
      已加载 {{ messages.length }} 条 · 第 {{ page }} / {{ maxPage }} 页
      <template v-if="loading">· 正在取下一页…</template>
      <template v-else-if="page >= maxPage">· 没有更多了</template>
    </span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <!-- 提示行不是消息，摆在列表外面：条目必须是 list 的直接子节点 -->
  <xh-message-feed id="message-feed-load-more" count="8" style="block-size: 220px">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="list" id="message-feed-load-more-list">
          <article data-xh-part="item" item-id="m1" item-index="0" item-role="assistant">第 1 条 · 先往上翻一段，再滚回底部</article>
          <article data-xh-part="item" item-id="m2" item-index="1" item-role="assistant">第 2 条 · 先往上翻一段，再滚回底部</article>
          <article data-xh-part="item" item-id="m3" item-index="2" item-role="assistant">第 3 条 · 先往上翻一段，再滚回底部</article>
          <article data-xh-part="item" item-id="m4" item-index="3" item-role="assistant">第 4 条 · 先往上翻一段，再滚回底部</article>
          <article data-xh-part="item" item-id="m5" item-index="4" item-role="assistant">第 5 条 · 先往上翻一段，再滚回底部</article>
          <article data-xh-part="item" item-id="m6" item-index="5" item-role="assistant">第 6 条 · 先往上翻一段，再滚回底部</article>
          <article data-xh-part="item" item-id="m7" item-index="6" item-role="assistant">第 7 条 · 先往上翻一段，再滚回底部</article>
          <article data-xh-part="item" item-id="m8" item-index="7" item-role="assistant">第 8 条 · 先往上翻一段，再滚回底部</article>
        </div>
      </div>
      <button data-xh-part="scroll-to-end-trigger"></button>
    </div>
  </xh-message-feed>

  <span id="message-feed-load-more-readout">已加载 8 条 · 第 1 / 3 页</span>
</div>

<script type="module">
  const feed = document.getElementById("message-feed-load-more");
  const list = document.getElementById("message-feed-load-more-list");
  const readout = document.getElementById("message-feed-load-more-readout");
  const maxPage = 3;
  let count = 8;
  let page = 1;
  let loading = false;

  function render() {
    const tail = loading ? " · 正在取下一页…" : page >= maxPage ? " · 没有更多了" : "";
    readout.textContent = `已加载 ${count} 条 · 第 ${page} / ${maxPage} 页${tail}`;
  }

  // 到了底、手上没在取、还有下一页，三条都满足才发起这一次加载
  feed.addEventListener("stick-change", (event) => {
    if (!event.detail.atBottom || loading || page >= maxPage) return;
    loading = true;
    render();
    window.setTimeout(() => {
      page += 1;
      for (let i = 1; i <= 4; i += 1) {
        const item = document.createElement("article");
        item.setAttribute("data-xh-part", "item");
        item.setAttribute("item-id", `m${count + i}`);
        item.setAttribute("item-index", String(count + i - 1));
        item.setAttribute("item-role", "assistant");
        item.textContent = `第 ${count + i} 条 · 第 ${page} 页取回来的`;
        list.append(item);
      }
      count += 4;
      feed.setAttribute("count", String(count));
      loading = false;
      render();
    }, 600);
  });
</script>
```

### 向上加载更早的消息

直接监听视口的滚动事件：滚到接近顶部时获取上一页，取回的消息插在最前面，正在阅读的位置不会被顶走

```vue
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

function makeRange(from: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `m${from + i}`,
    text: `第 ${from + i} 条 · 会话记录`,
  }));
}

// 编号越小越早，取历史就是往前减
const earliest = ref(33);
const messages = ref(makeRange(earliest.value, 8));
const loading = ref(false);
const hasMore = ref(true);

// 离顶部不到 48px 就取上一页；条目是 list 的直接子节点，内容增高时滚动位置按锚点补偿
function onScroll(event: Event): void {
  const el = event.currentTarget as HTMLElement;
  if (el.scrollTop > 48 || loading.value || !hasMore.value)
    return;
  loading.value = true;
  window.setTimeout(() => {
    const size = Math.min(6, earliest.value - 1);
    earliest.value -= size;
    messages.value.unshift(...makeRange(earliest.value, size));
    hasMore.value = earliest.value > 1;
    loading.value = false;
  }, 500);
}
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhMessageFeedRoot :count="messages.length" style="block-size: 220px;">
      <XhMessageFeedViewport @scroll="onScroll">
        <XhMessageFeedList>
          <XhMessageFeedItem
            v-for="(message, index) in messages"
            :key="message.id"
            :item-id="message.id"
            :item-index="index"
            item-role="assistant"
          >
            {{ message.text }}
          </XhMessageFeedItem>
        </XhMessageFeedList>
      </XhMessageFeedViewport>
      <XhMessageFeedScrollToEndTrigger />
    </XhMessageFeedRoot>

    <span>
      已加载 {{ messages.length }} 条 · 最早到第 {{ earliest }} 条
      <template v-if="loading">· 正在取更早的…</template>
      <template v-else-if="!hasMore">· 已经是最早的了</template>
    </span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <xh-message-feed id="message-feed-earlier" count="8" style="block-size: 220px">
    <div data-xh-part="root">
      <div data-xh-part="viewport" id="message-feed-earlier-viewport">
        <div data-xh-part="list" id="message-feed-earlier-list">
          <article data-xh-part="item" item-id="m33" item-index="0" item-role="assistant">第 33 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m34" item-index="1" item-role="assistant">第 34 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m35" item-index="2" item-role="assistant">第 35 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m36" item-index="3" item-role="assistant">第 36 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m37" item-index="4" item-role="assistant">第 37 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m38" item-index="5" item-role="assistant">第 38 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m39" item-index="6" item-role="assistant">第 39 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m40" item-index="7" item-role="assistant">第 40 条 · 会话记录</article>
        </div>
      </div>
      <button data-xh-part="scroll-to-end-trigger"></button>
    </div>
  </xh-message-feed>

  <span id="message-feed-earlier-readout">已加载 8 条 · 最早到第 33 条</span>
</div>

<script type="module">
  const feed = document.getElementById("message-feed-earlier");
  const viewport = document.getElementById("message-feed-earlier-viewport");
  const list = document.getElementById("message-feed-earlier-list");
  const readout = document.getElementById("message-feed-earlier-readout");
  // 编号越小越早，取历史就是往前减
  let earliest = 33;
  let loading = false;
  let hasMore = true;

  function render() {
    const tail = loading ? " · 正在取更早的…" : hasMore ? "" : " · 已经是最早的了";
    readout.textContent = `已加载 ${list.children.length} 条 · 最早到第 ${earliest} 条${tail}`;
  }

  // 插在最前面之后，下标整体后移一截，逐个改回来
  function renumber() {
    for (let i = 0; i < list.children.length; i += 1)
      list.children[i].setAttribute("item-index", String(i));
    feed.setAttribute("count", String(list.children.length));
  }

  // 离顶部不到 48px 就取上一页；条目是 list 的直接子节点，内容增高时滚动位置按锚点补偿
  viewport.addEventListener("scroll", () => {
    if (viewport.scrollTop > 48 || loading || !hasMore) return;
    loading = true;
    render();
    window.setTimeout(() => {
      const size = Math.min(6, earliest - 1);
      earliest -= size;
      const batch = document.createDocumentFragment();
      for (let i = 0; i < size; i += 1) {
        const item = document.createElement("article");
        item.setAttribute("data-xh-part", "item");
        item.setAttribute("item-id", `m${earliest + i}`);
        item.setAttribute("item-role", "assistant");
        item.textContent = `第 ${earliest + i} 条 · 会话记录`;
        batch.append(item);
      }
      list.prepend(batch);
      renumber();
      hasMore = earliest > 1;
      loading = false;
      render();
    }, 500);
  });
</script>
```

### 跳到指定的一条

消息 id 就是锚点：Vue 侧使用 root 插槽提供的 scrollToItem / focusItem，自定义元素侧按同一个 id 取节点自行滚动

```vue
<script setup lang="ts">
import {
  XhButton,
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const messages = Array.from({ length: 16 }, (_, i) => ({
  id: `m${i + 1}`,
  text: `第 ${i + 1} 条 · 会话记录`,
}));
const jumped = ref("（还没跳过）");

// 两个入口都收消息 id，与写在条目上的那个是同一个
function go(jump: (id: string) => void, id: string, label: string): void {
  jump(id);
  jumped.value = label;
}
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhMessageFeedRoot
      v-slot="{ scrollToItem, focusItem }"
      :count="messages.length"
      style="block-size: 220px;"
    >
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          <XhMessageFeedItem
            v-for="(message, index) in messages"
            :key="message.id"
            :item-id="message.id"
            :item-index="index"
            item-role="assistant"
          >
            {{ message.text }}
          </XhMessageFeedItem>
        </XhMessageFeedList>
      </XhMessageFeedViewport>

      <!-- 按钮栏排在视口下面，是 root 的直接子节点 -->
      <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-block-start: 8px">
        <!-- 只滚不动焦点：读者的键盘锚点留在原处 -->
        <XhButton
          variant="outline"
          size="sm"
          @click="go(scrollToItem, 'm1', '滚到了第 1 条')"
        >
          滚到第 1 条
        </XhButton>
        <XhButton
          variant="outline"
          size="sm"
          @click="go(scrollToItem, 'm8', '滚到了第 8 条')"
        >
          滚到第 8 条
        </XhButton>
        <!-- 连焦点一起挪过去：那一条随即成为 Tab 序列里的那个停靠位 -->
        <XhButton
          variant="ghost"
          size="sm"
          @click="go(focusItem, 'm16', '焦点落到了第 16 条')"
        >
          把焦点落到第 16 条
        </XhButton>
      </div>
    </XhMessageFeedRoot>

    <span>{{ jumped }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <xh-message-feed id="message-feed-scroll-to" count="16" style="block-size: 220px">
    <div data-xh-part="root">
      <div data-xh-part="viewport" id="message-feed-scroll-to-viewport">
        <div data-xh-part="list">
          <article data-xh-part="item" item-id="m1" item-index="0" item-role="assistant">第 1 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m2" item-index="1" item-role="assistant">第 2 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m3" item-index="2" item-role="assistant">第 3 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m4" item-index="3" item-role="assistant">第 4 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m5" item-index="4" item-role="assistant">第 5 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m6" item-index="5" item-role="assistant">第 6 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m7" item-index="6" item-role="assistant">第 7 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m8" item-index="7" item-role="assistant">第 8 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m9" item-index="8" item-role="assistant">第 9 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m10" item-index="9" item-role="assistant">第 10 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m11" item-index="10" item-role="assistant">第 11 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m12" item-index="11" item-role="assistant">第 12 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m13" item-index="12" item-role="assistant">第 13 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m14" item-index="13" item-role="assistant">第 14 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m15" item-index="14" item-role="assistant">第 15 条 · 会话记录</article>
          <article data-xh-part="item" item-id="m16" item-index="15" item-role="assistant">第 16 条 · 会话记录</article>
        </div>
      </div>

      <!-- 按钮栏排在视口下面，是 root 的直接子节点 -->
      <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-block-start: 8px">
        <xh-button id="message-feed-scroll-to-1" variant="outline" size="sm">
          <button data-xh-part="root">滚到第 1 条</button>
        </xh-button>
        <xh-button id="message-feed-scroll-to-8" variant="outline" size="sm">
          <button data-xh-part="root">滚到第 8 条</button>
        </xh-button>
        <xh-button id="message-feed-scroll-to-16" variant="ghost" size="sm">
          <button data-xh-part="root">把焦点落到第 16 条</button>
        </xh-button>
      </div>
    </div>
  </xh-message-feed>

  <span id="message-feed-scroll-to-readout">（还没跳过）</span>
</div>

<script type="module">
  const feed = document.getElementById("message-feed-scroll-to");
  const viewport = document.getElementById("message-feed-scroll-to-viewport");
  const readout = document.getElementById("message-feed-scroll-to-readout");

  // 元素只暴露 scrollToBottom，别的位置按 item-id 取节点自己算：
  // 两个 offsetTop 同参照系，相减就是这一条在滚动内容里的位置
  function scrollToItem(id, label) {
    const item = feed.querySelector(`[item-id="${id}"]`);
    if (!item) return;
    viewport.scrollTo({ top: item.offsetTop - viewport.offsetTop, behavior: "smooth" });
    readout.textContent = label;
  }

  document
    .getElementById("message-feed-scroll-to-1")
    .addEventListener("click", () => scrollToItem("m1", "滚到了第 1 条"));
  document
    .getElementById("message-feed-scroll-to-8")
    .addEventListener("click", () => scrollToItem("m8", "滚到了第 8 条"));
  // 连焦点一起挪过去：条目自己带着 roving tabindex，focus() 就够了
  document.getElementById("message-feed-scroll-to-16").addEventListener("click", () => {
    feed.querySelector('[item-id="m16"]')?.focus();
    readout.textContent = "焦点落到了第 16 条";
  });
</script>
```

## 设计指引

### 何时使用

- AI 对话或聊天界面的消息列表。
- 内容从底部持续生长，需要始终跟随到底，但用户向上翻时不被拉回。

### 何时不用

- 内容不分条、只是持续追加的输出（运行日志、命令回显）时，使用[日志](./log)。两者的粘底、回到底部与播报区是同一套，差别只在是否需要条目集合语义与逐条遍历。
- 只是一列静态卡片时，使用[列表](./list)。
- 消息数以万计时，本组件不与[虚拟滚动](./virtualizer)组合，键盘遍历要求条目都在活动 DOM 中；长会话请配合[无限滚动](./infinite-scroll)分批加载并自行截断历史。

### 特性

- 粘底跟随：内容增高时自动到底，用户上滚即解除，滚回底部阈值内自动恢复。向上插入历史消息时补偿滚动位置，视口不跳动。
- “回到底部”只判断是否在底部，不判断粘附意图：粘附中但内容尚未追上时按钮不显示。
- 整份消息列表只占一个 Tab 停靠位：`PageDown` / `PageUp` 在消息之间移动，`Ctrl+End` / `Ctrl+Home` 一步移到消息流之外（会话界面中通常是输入框）。
- 消息内容全部由作者编写：气泡、头像、时间、动作条都不是本组件的部件。
- 新生成的消息与出现的“回到底部”各带一段淡入位移；减弱动效由令牌层收敛，不需要另行关闭。
- 已发送、等首个片段（`status` 为 `submitted`）时，放在列表之后的 `pending-indicator` 显示为一颗呼吸的圆点，首个片段到来即收起；它只给视觉看，进度由宿主写进播报区。减弱动效下圆点静止。
- “回到底部”留空时皮肤绘制向下的字形，放入节点即替换为自定义图形。
- 应用设为 `data-material="liquid"` 时，“回到底部”换成液态面：按下层换色调，按住时液面随手指形变。

### 组合

- 正文使用[流式正文](./markdown-stream)，代码使用[代码视图](./code-view)。
- 每条消息的动作条使用[工具栏](./toolbar)，复制使用[剪贴板](./clipboard)。
- 加载更早的消息使用[无限滚动](./infinite-scroll)，必须把消息流的滚动容器交给它，否则它的提前量只对窗口视口生效。
- 空会话使用[空状态](./empty-state)，并显式把它的 `live` 设为 `off`：它默认会成为活动区域，放在消息流中会与播报区冲突。
- 需要左右分侧或气泡时，条目上带 `data-role`（`user` / `assistant` / `system`），在自己的样式表中按它编写 `align-self`、底色、内衬与最大行宽，组件不预设这层外观。
- 仍在流式写入的条目带 `data-streaming`，这是留给使用者的钩子：正文经[流式正文](./markdown-stream)渲染时，光标就是“仍在写入”的标记；正文不经它渲染时，可按该属性自行添加非遮蔽式的标记，例如前导色条或标签态。

### 最佳实践

- 条目必须是内容层的直接子节点：向上插入历史消息时的滚动补偿只在直接子节点中选锚点，套一层壳或使用 `display: contents` 都会让补偿静默失效。
- 一轮流式结束时把整段最终文本写入播报区，不每个 token 写一次。

### 反模式

- 给每条消息各写 `tabindex="0"`：两百条消息就是两百个 Tab 停靠位。
- 在消息流内再套一层滚动容器：粘底逻辑只识别本组件的视口，套一层后失效。
- 按 `data-streaming` 把整条消息压暗或虚化：一轮流式可能持续数分钟，被遮盖的正是读者正在逐字阅读的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-message-feed>` |
| Vue 组件 | `XhMessageFeedItem` `XhMessageFeedItemLabel` `XhMessageFeedList` `XhMessageFeedLiveRegion` `XhMessageFeedPendingIndicator` `XhMessageFeedRoot` `XhMessageFeedScrollToEndTrigger` `XhMessageFeedViewport` |
| 组合式函数 | `useMessageFeed` |
| 状态机 | `messageFeedMachine` |
| 皮肤 | `@xihan-ui/styles/message-feed.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 消息总数，由宿主声明，不从 DOM 统计；aria-setsize 取它。 |
| `status` | `MessageFeedStatus` |  | 本轮的运行态，只写 data-state，状态机不读取它。 |
| `threshold` | `number` |  | 距底部多少 px 视为在底部，默认使用贴底原语的默认值。 |
| `loop` | `boolean` |  | 到达首尾是否回绕，默认 false：会话是线性的。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<MessageFeedTranslations>` |  |  |
| `onStickChange` | `(details: MessageFeedStickChangeDetails) => void` |  |  |
| `onItemFocus` | `(details: MessageFeedItemFocusDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `stick-change` | `MessageFeedStickChangeDetails` | 贴底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }` |
| `item-focus` | `MessageFeedItemFocusDetails` | 锚点变化；detail 为 `{ id: string \| null }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMessageFeedRoot` | `default` | `MessageFeedRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhMessageFeedItem` | `itemId` | `string` | 是 | 该条消息的身份，写为 data-value；导航与锚点都以它为准。 |
| `XhMessageFeedItem` | `itemIndex` | `number \| string` | 是 | 0 基下标，写为 aria-posinset = index + 1。 |
| `XhMessageFeedItem` | `itemRole` | `MessageFeedItemRole` |  | 该条消息的发言者。 |
| `XhMessageFeedItem` | `itemStreaming` | `boolean` |  | 该条仍在流式写入。 |
| `XhMessageFeedRoot` | `children` | `SlotChildren<MessageFeedRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | props.status |
| `pending-indicator` | props.status |
| `scroll-to-end-trigger` | 'hidden' \| 'visible' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`STICK.CHANGE` · `SCROLL_TO_BOTTOM` · `ITEM.FOCUS` · `FEED.BLUR` · `PRESS.START` · `PRESS.END` · `ARRIVALS.TRACKED` · `TRIGGER.RENDERED`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `MessageFeedStatus` |  |
| `atBottom` | `boolean` |  |
| `sticking` | `boolean` |  |
| `focusedId` | `string \| null` | roving tabindex 的锚点。 |
| `showScrollToEndTrigger` | `boolean` | 是否显示回到底部按钮：只判断是否在底部，不判断贴附意图。 |
| `scrollToBottom` | `() => void` |  |
| `scrollToItem` | `(id: string) => void` | 把某条消息滚进可视区；该条不在 DOM 中时不做任何事。 |
| `focusItem` | `(id: string) => void` | 把焦点落到某条消息上；该条不在 DOM 中时不做任何事。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: MessageFeedItemProps) => T['element']` |  |
| `getItemLabelProps` | `(props: Pick<MessageFeedItemProps, 'id'>) => T['element']` |  |
| `getScrollToEndTriggerProps` | `() => T['button']` |  |
| `getPendingIndicatorProps` | `() => T['element']` | 已发送、等首个片段时的呼吸点：status 为 submitted 时出现，对读屏隐藏。 |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `PageDown` | 焦点在消息流内 | 焦点移到下一条消息；到末条时按 loop 决定回绕还是不动 |
| `PageUp` | 焦点在消息流内 | 焦点移到上一条消息；到首条时按 loop 决定回绕还是不动 |
| `Control+End` | 焦点在消息流内 | 焦点移到消息流之后的第一个可聚焦元素，会话界面里通常是输入框 |
| `Control+Home` | 焦点在消息流内 | 焦点移到消息流之前的最后一个可聚焦元素 |
| `Tab` | 焦点在消息流内外之间移动 | 整份消息列表只占一个 Tab 停靠位：没有锚点时由根容器认领并把焦点转投给第一条，有锚点时那一条认领、根容器让位 |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | 焦点落在某条消息上 | 组件不接管，浏览器滚动最近的可滚动祖先 |
| `Enter` / `Space` | 焦点在回到底部按钮上 | 滚回底部并恢复粘附（原生按钮激活） |
| `Enter` / `Space` | 按住回到底部按钮且视口不在底部 | 按住期间 scroll-to-end-trigger 投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或回到底部（按钮收起）撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-label` | translations?.feed |
| `list` | `role` | 'feed' |
| `item` | `aria-label` | undefined \| itemLabel(item.index + 1, count ?? -1, item.role) |
| `item` | `aria-labelledby` | scope.partId('message-feed', `item-label:${item.id}`) \| undefined |
| `item` | `aria-posinset` | item.index + 1 |
| `item` | `aria-setsize` | props.count |
| `item` | `role` | 'article' |
| `pending-indicator` | `aria-hidden` | 'true' |
| `scroll-to-end-trigger` | `aria-label` | translations?.scrollToBottom |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |

- `role=feed` 配 `role=article`，带 `aria-posinset` / `aria-setsize`；总数由 `count` 声明，不从 DOM 计数，虚拟化或分页时 DOM 中的条数不等于会话长度。
- 集合语义落在内容层而不是最外层：`role=feed` 只识别 `role=article` 的子节点，而播报区与回到底部按钮都是最外层的子节点。最外层只作为 Tab 停靠点与键盘宿主。
- 播报使用独立的原子区域：一份会话只应有一个活动区域，每条消息各开一个会互相打断。
- 消息流本身不发 `aria-busy`：它会压制同一棵子树内播报区的播报。
- 等首个片段的呼吸点对读屏隐藏，不单靠动画表达状态。

## 样式参考

### 皮肤

`@xihan-ui/styles/message-feed.css` 使用 `[data-scope="message-feed"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | props.status |
| `list` | `data-instant` | ''（条件成立时才出现） |
| `item` | `data-role` | item.role |
| `item` | `data-streaming` | ''（条件成立时才出现） |
| `pending-indicator` | `data-state` | props.status |
| `scroll-to-end-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `scroll-to-end-trigger` | `data-state` | 'hidden' \| 'visible' |
| `scroll-to-end-trigger` | `data-xh-action-control` | '' |
| `scroll-to-end-trigger` | `data-xh-action-display` | 'always' |
| `scroll-to-end-trigger` | `data-xh-action-profile` | 'floating' |
| `scroll-to-end-trigger` | `data-xh-action-size` | 'xs' |
| `scroll-to-end-trigger` | `data-xh-action-variant` | 'ghost' |
| `scroll-to-end-trigger` | `data-xh-liquid` | '' |
| `scroll-to-end-trigger` | `data-xh-material` | 'frosted' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-message-feed-gap` | `list` | `gap` | `default` | `--xh-_message-feed-gap` | message-feed 的 list 部件 gap 覆盖槽。 |
| `--xh-message-feed-icon-size` | `scroll-to-end-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | message-feed 的 scroll-to-end-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-message-feed-item-gap` | `item` | `gap` | `default` | `--xh-space-1` | message-feed 的 item 部件 gap 覆盖槽。 |
| `--xh-message-feed-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-surface` | message-feed 的 item 部件 border-radius 覆盖槽。 |
| `--xh-message-feed-label-fg` | `item-label` | `color` | `default` | `--xh-fg-muted` | message-feed 的 item-label 部件 color 覆盖槽。 |
| `--xh-message-feed-label-font-size` | `item-label` | `font-size` | `default` | `--xh-text-caption-size` | message-feed 的 item-label 部件 font-size 覆盖槽。 |
| `--xh-message-feed-p` | `list`<br>`pending-indicator` | `margin-block-end`<br>`margin-inline-start`<br>`padding` | `default` | `--xh-_message-feed-p` | message-feed 的 list、pending-indicator 部件 margin-block-end、margin-inline-start、padding 覆盖槽。 |
| `--xh-message-feed-pending-indicator-color` | `pending-indicator` | `background` | `default` | `--xh-fg-muted` | message-feed 的 pending-indicator 部件 background 覆盖槽。 |
| `--xh-message-feed-pending-indicator-radius` | `pending-indicator` | `border-radius` | `default` | `--xh-shape-circle` | message-feed 的 pending-indicator 部件 border-radius 覆盖槽。 |
| `--xh-message-feed-pending-indicator-size` | `pending-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-space-2` | message-feed 的 pending-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-bg` | `scroll-to-end-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_material-bg`<br>`--xh-_material-bg-focus` | message-feed 的 scroll-to-end-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-bg-hover` | `scroll-to-end-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_material-bg-hover` | message-feed 的 scroll-to-end-trigger 部件 background-color 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-border` | `scroll-to-end-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-border` | message-feed 的 scroll-to-end-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-fg` | `scroll-to-end-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-fg` | message-feed 的 scroll-to-end-trigger 部件 color 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-inset` | `scroll-to-end-trigger` | `inset-block-end`<br>`inset-inline-end` | `default` | `--xh-space-4` | message-feed 的 scroll-to-end-trigger 部件 inset-block-end、inset-inline-end 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-radius` | `scroll-to-end-trigger` | `border-radius` | `default` | `--xh-shape-circle` | message-feed 的 scroll-to-end-trigger 部件 border-radius 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-shadow` | `scroll-to-end-trigger` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-shadow` | message-feed 的 scroll-to-end-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-size` | `scroll-to-end-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_action-profile-visual-size` | message-feed 的 scroll-to-end-trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现（锚定面板） · 出现（无锚定弹出） · 列表 · 循环（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-breathe` · `xh-breathe-halo` · `xh-item-in` · `xh-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
