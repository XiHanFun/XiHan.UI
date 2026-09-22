来源：https://ui.docs.xihanfun.com/components/prompt-input

# PromptInput 提示输入框 `alpha`

会话界面的输入框：值、输入法、能否提交，以及发送与停止共用的按钮。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/prompt-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/prompt-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/prompt-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/prompt-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/prompt-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

Enter 提交、Shift+Enter 换行；输入法组合中的 Enter 一律放行，该按键是在确认候选词

```vue
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const sent = ref<string[]>([]);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <XhPromptInputRoot
      :translations="{ input: '给助手写点什么' }"
      @submit="sent.push($event.value)"
    >
      <XhPromptInputInput rows="1" placeholder="给助手写点什么…" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
    <p v-if="sent.length" style="margin: 0;">已发出：{{ sent.join(" / ") }}</p>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-prompt-input id="prompt-input-basic">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="给助手写点什么…"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
  <p id="prompt-input-basic-sent" style="margin: 0"></p>
</div>

<script type="module">
  // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
  const input = document.getElementById("prompt-input-basic");
  const sent = [];
  const line = document.getElementById("prompt-input-basic-sent");
  input.translations = { input: "给助手写点什么" };
  input.addEventListener("submit", (event) => {
    sent.push(event.detail.value);
    line.textContent = `已发出：${sent.join(" / ")}`;
  });
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="prompt-input"`：**`root`** · `control` · **`input`** · **`submit-trigger`**

## 示例

### 与消息流组成一个对话

发送键原位变为停止；提交后粘底跟随到最新一条，生成期间仍可继续编辑下一句

```vue
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

interface Message {
  id: string;
  role: "user" | "assistant";
  who: string;
  text: string;
}

const messages = ref<Message[]>([
  { id: "m0", role: "assistant", who: "助手", text: "问点什么试试。" },
]);
const loading = ref(false);

let timer = 0;
let seq = 0;

function reply(question: string) {
  const id = `a${(seq += 1)}`;
  messages.value = [...messages.value, { id, role: "assistant", who: "助手", text: "" }];
  const full = `收到「${question}」，这是一段边写边显示的回复。`;
  let at = 0;
  const tick = () => {
    at = Math.min(at + 2, full.length);
    messages.value = messages.value.map(m => (m.id === id ? { ...m, text: full.slice(0, at) } : m));
    if (at < full.length) {
      timer = window.setTimeout(tick, 60);
      return;
    }
    loading.value = false;
  };
  tick();
}

function onSubmit({ value }: { value: string }) {
  messages.value = [
    ...messages.value,
    { id: `u${(seq += 1)}`, role: "user", who: "我", text: value },
  ];
  loading.value = true;
  reply(value);
}

function onStop() {
  window.clearTimeout(timer);
  loading.value = false;
}

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; block-size: 320px;">
    <XhMessageFeedRoot :count="messages.length" :status="loading ? 'streaming' : 'idle'" style="flex: 1; min-block-size: 0;">
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          <XhMessageFeedItem
            v-for="(message, index) in messages"
            :key="message.id"
            :item-id="message.id"
            :item-index="index"
            :item-role="message.role"
            :item-streaming="loading && index === messages.length - 1"
          >
            <XhMessageFeedItemLabel>{{ message.who }}</XhMessageFeedItemLabel>
            <div>{{ message.text }}</div>
          </XhMessageFeedItem>
        </XhMessageFeedList>
      </XhMessageFeedViewport>
      <XhMessageFeedScrollToEndTrigger />
    </XhMessageFeedRoot>

    <!-- loading 期间按钮换成停止，输入框仍可编辑：用户还要能改下一句 -->
    <XhPromptInputRoot
      :loading="loading"
      :translations="{ input: '给助手写点什么' }"
      @submit="onSubmit"
      @stop="onStop"
    >
      <XhPromptInputInput rows="1" placeholder="给助手写点什么…" />
      <XhPromptInputSubmitTrigger>{{ loading ? "停止" : "发送" }}</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; block-size: 320px">
  <xh-message-feed id="chat-feed" count="1" style="flex: 1; min-block-size: 0">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="list">
          <article data-xh-part="item" item-id="m0" item-index="0" item-role="assistant">
            <span data-xh-part="item-label">助手</span>
            <div>问点什么试试。</div>
          </article>
        </div>
      </div>
      <button data-xh-part="scroll-to-end-trigger"></button>
    </div>
  </xh-message-feed>

  <!-- loading 期间按钮换成停止，输入框仍可编辑：用户还要能改下一句 -->
  <xh-prompt-input id="chat-input">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="给助手写点什么…"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
</div>

<script type="module">
  const feed = document.getElementById("chat-feed");
  const input = document.getElementById("chat-input");
  const list = feed.querySelector('[data-xh-part="list"]');
  const button = input.querySelector('[data-xh-part="submit-trigger"]');
  input.translations = { input: "给助手写点什么" };

  let seq = 0;
  let timer = 0;
  let count = 1;

  const append = (id, role, who, text) => {
    const item = document.createElement("article");
    item.setAttribute("data-xh-part", "item");
    item.setAttribute("item-id", id);
    item.setAttribute("item-index", String(count));
    item.setAttribute("item-role", role);
    item.innerHTML = `<span data-xh-part="item-label"></span><div></div>`;
    item.querySelector('[data-xh-part="item-label"]').textContent = who;
    item.querySelector("div").textContent = text;
    list.appendChild(item);
    count += 1;
    feed.setAttribute("count", String(count));
    return item;
  };

  const setBusy = (loading) => {
    input.toggleAttribute("loading", loading);
    button.textContent = loading ? "停止" : "发送";
  };

  input.addEventListener("submit", (event) => {
    const question = event.detail.value;
    append(`u${(seq += 1)}`, "user", "我", question);
    const bubble = append(`a${(seq += 1)}`, "assistant", "助手", "");
    const body = bubble.querySelector("div");
    setBusy(true);

    const full = `收到「${question}」，这是一段边写边显示的回复。`;
    let at = 0;
    const tick = () => {
      if (!feed.isConnected) return;
      at = Math.min(at + 2, full.length);
      body.textContent = full.slice(0, at);
      bubble.toggleAttribute("item-streaming", at < full.length);
      if (at < full.length) {
        timer = setTimeout(tick, 60);
        return;
      }
      setBusy(false);
    };
    tick();
  });

  input.addEventListener("stop", () => {
    clearTimeout(timer);
    setBusy(false);
  });
</script>
```

### 竖排布局与兜底字形

写一层输入行，root 即切换为竖排：输入行在上、动作行在下；按钮留空时皮肤按身份绘制箭头或停止方块

```vue
<script setup lang="ts">
import { XhPromptInputControl, XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const submitKey = ref<"enter" | "mod-enter" | "none">("enter");
const loading = ref(false);
const sent = ref<string[]>([]);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <XhPromptInputRoot
      v-slot="{ value }"
      :loading="loading"
      :submit-key="submitKey"
      :translations="{ input: '给助手写点什么' }"
      @submit="sent.push($event.value)"
      @stop="loading = false"
    >
      <XhPromptInputControl>
        <XhPromptInputInput rows="1" placeholder="给助手写点什么…" />
        <XhPromptInputSubmitTrigger />
      </XhPromptInputControl>
      <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
        <label style="display: inline-flex; align-items: center; gap: 4px;">
          <input v-model="loading" type="checkbox">
          生成中
        </label>
        <select v-model="submitKey" aria-label="按哪一档提交">
          <option value="enter">Enter 提交</option>
          <option value="mod-enter">Ctrl/Cmd+Enter 提交</option>
          <option value="none">只用按钮提交</option>
        </select>
        <span style="margin-inline-start: auto;">{{ value.length }} 字</span>
      </div>
    </XhPromptInputRoot>
    <p v-if="sent.length" style="margin: 0;">已发出：{{ sent.join(" / ") }}</p>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-prompt-input id="prompt-input-layout">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <textarea data-xh-part="input" rows="1" placeholder="给助手写点什么…"></textarea>
        <button data-xh-part="submit-trigger"></button>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; font-size: 12px">
        <label style="display: inline-flex; align-items: center; gap: 4px">
          <input id="prompt-input-layout-loading" type="checkbox" />
          生成中
        </label>
        <select id="prompt-input-layout-key" aria-label="按哪一档提交">
          <option value="enter">Enter 提交</option>
          <option value="mod-enter">Ctrl/Cmd+Enter 提交</option>
          <option value="none">只用按钮提交</option>
        </select>
        <span id="prompt-input-layout-count" style="margin-inline-start: auto">0 字</span>
      </div>
    </div>
  </xh-prompt-input>
  <p id="prompt-input-layout-sent" style="margin: 0"></p>
</div>

<script type="module">
  const input = document.getElementById("prompt-input-layout");
  const loading = document.getElementById("prompt-input-layout-loading");
  const key = document.getElementById("prompt-input-layout-key");
  const count = document.getElementById("prompt-input-layout-count");
  const line = document.getElementById("prompt-input-layout-sent");
  const sent = [];
  input.translations = { input: "给助手写点什么" };

  input.addEventListener("value-change", (event) => {
    count.textContent = `${event.detail.value.length} 字`;
  });

  // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
  input.addEventListener("submit", (event) => {
    sent.push(event.detail.value);
    line.textContent = `已发出：${sent.join(" / ")}`;
  });

  input.addEventListener("stop", () => {
    loading.checked = false;
    input.removeAttribute("loading");
  });

  loading.addEventListener("change", () => input.toggleAttribute("loading", loading.checked));
  key.addEventListener("change", () => input.setAttribute("submit-key", key.value));
</script>
```

### 三档提交按键

enter 档回车即发送、mod-enter 档只有 Ctrl/Cmd+Enter 发送、none 档两种按法都换行，提交只剩发送按钮

```vue
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const log = ref("（还没发过）");
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 默认档：Enter 提交、Shift+Enter 换行，Mod+Enter 也提交 -->
    <XhPromptInputRoot
      :translations="{ input: 'Enter 提交' }"
      @submit="log = `enter 档发出：${$event.value}`"
    >
      <XhPromptInputInput rows="1" placeholder="Enter 就发出去" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- Enter 留给换行，提交收到组合键上：长文起草时不会敲一半被发出去 -->
    <XhPromptInputRoot
      submit-key="mod-enter"
      :translations="{ input: 'Ctrl 或 Cmd 加 Enter 提交' }"
      @submit="log = `mod-enter 档发出：${$event.value}`"
    >
      <XhPromptInputInput rows="2" placeholder="Enter 换行，Ctrl/Cmd+Enter 才发" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- 键盘一个提交出口都不留：Enter 与 Mod+Enter 都原样交回浏览器插换行 -->
    <XhPromptInputRoot
      submit-key="none"
      :translations="{ input: '只用发送按钮提交' }"
      @submit="log = `none 档发出：${$event.value}`"
    >
      <XhPromptInputInput rows="2" placeholder="键盘怎么按都只换行" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <span>{{ log }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <!-- 默认档：Enter 提交、Shift+Enter 换行，Mod+Enter 也提交 -->
  <xh-prompt-input id="prompt-input-key-enter">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="Enter 就发出去"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <!-- Enter 留给换行，提交收到组合键上：长文起草时不会敲一半被发出去 -->
  <xh-prompt-input id="prompt-input-key-mod" submit-key="mod-enter">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="2" placeholder="Enter 换行，Ctrl/Cmd+Enter 才发"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <!-- 键盘一个提交出口都不留：Enter 与 Mod+Enter 都原样交回浏览器插换行 -->
  <xh-prompt-input id="prompt-input-key-none" submit-key="none">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="2" placeholder="键盘怎么按都只换行"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <span id="prompt-input-key-log">（还没发过）</span>
</div>

<script type="module">
  const log = document.getElementById("prompt-input-key-log");
  const labels = {
    "prompt-input-key-enter": ["Enter 提交", "enter"],
    "prompt-input-key-mod": ["Ctrl 或 Cmd 加 Enter 提交", "mod-enter"],
    "prompt-input-key-none": ["只用发送按钮提交", "none"],
  };

  for (const [id, [name, arch]] of Object.entries(labels)) {
    const input = document.getElementById(id);
    input.translations = { input: name };
    // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
    input.addEventListener("submit", (event) => {
      log.textContent = `${arch} 档发出：${event.detail.value}`;
    });
  }
</script>
```

### 禁用与空值

disabled 覆盖整框并使用原生 disabled；输入为空或只有空白时发送按钮转灰，但位置保留不收起

```vue
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 整框禁用：输入框带原生 disabled，提交与停止一并吃掉 -->
    <XhPromptInputRoot
      disabled
      default-value="这一台是禁用的"
      :translations="{ input: '已禁用的输入框' }"
    >
      <XhPromptInputInput rows="1" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- 空值：按钮转灰，敲进第一个非空白字符就亮 -->
    <XhPromptInputRoot :translations="{ input: '给助手写点什么' }">
      <XhPromptInputInput rows="1" placeholder="空着时发送按钮是灰的" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- 有附件时正文可以为空：allowEmptySubmit 一置真，空值也发得出去 -->
    <XhPromptInputRoot allow-empty-submit :translations="{ input: '带附件的输入框' }">
      <XhPromptInputInput rows="1" placeholder="空着也能发（当作已经挂了附件）" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <!-- 整框禁用：输入框带原生 disabled，提交与停止一并吃掉 -->
  <xh-prompt-input id="prompt-input-disabled-off" disabled default-value="这一台是禁用的">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <!-- 空值：按钮转灰，敲进第一个非空白字符就亮 -->
  <xh-prompt-input id="prompt-input-disabled-empty">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="空着时发送按钮是灰的"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <!-- 有附件时正文可以为空：allow-empty-submit 一置真，空值也发得出去 -->
  <xh-prompt-input id="prompt-input-disabled-allow-empty" allow-empty-submit>
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="空着也能发（当作已经挂了附件）"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
</div>

<script type="module">
  const names = {
    "prompt-input-disabled-off": "已禁用的输入框",
    "prompt-input-disabled-empty": "给助手写点什么",
    "prompt-input-disabled-allow-empty": "带附件的输入框",
  };
  for (const [id, name] of Object.entries(names))
    document.getElementById(id).translations = { input: name };
</script>
```

### 框内的附加节点

root 中除三件部件外还可放置自己的按钮与计数；值的读写归宿主，原生属性照常直接落到输入框上

```vue
<script setup lang="ts">
import {
  XhButton,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const max = 40;
const log = ref("（还没发过）");
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhPromptInputRoot
      v-slot="{ value, setValue }"
      default-value="输入框两侧各放了一颗自己的按钮"
      :translations="{ input: '给助手写点什么' }"
      @submit="log = `提交：${$event.value}`"
    >
      <XhButton variant="ghost" size="sm">附件</XhButton>
      <!-- maxlength 是原生属性，直接落到 textarea 上 -->
      <XhPromptInputInput :maxlength="max" rows="1" placeholder="最多 40 个字" />
      <span style="font-size: 13px; white-space: nowrap">{{ value.length }} / {{ max }}</span>
      <!-- 有内容才给清空，清空后按钮自己转灰 -->
      <XhButton variant="ghost" size="sm" :disabled="value === ''" @click="setValue('')">
        清空
      </XhButton>
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
    <span>{{ log }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <xh-prompt-input id="prompt-input-extras">
    <div data-xh-part="root">
      <xh-button variant="ghost" size="sm">
        <button data-xh-part="root">附件</button>
      </xh-button>
      <!-- maxlength 是原生属性，直接写在 textarea 上 -->
      <textarea
        data-xh-part="input"
        maxlength="40"
        rows="1"
        placeholder="最多 40 个字"
      ></textarea>
      <span style="font-size: 13px; white-space: nowrap">
        <span id="prompt-input-extras-count">0</span> / 40
      </span>
      <!-- 有内容才给清空，清空后按钮自己转灰 -->
      <xh-button id="prompt-input-extras-clear" variant="ghost" size="sm">
        <button data-xh-part="root">清空</button>
      </xh-button>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
  <span id="prompt-input-extras-log">（还没发过）</span>
</div>

<script type="module">
  // 值受控：每次变化写回宿主，清空按钮只是写一个空串
  const input = document.getElementById("prompt-input-extras");
  const clear = document.getElementById("prompt-input-extras-clear");
  const count = document.getElementById("prompt-input-extras-count");
  const log = document.getElementById("prompt-input-extras-log");
  input.translations = { input: "给助手写点什么" };

  function setValue(next) {
    input.value = next;
    count.textContent = next.length;
    clear.toggleAttribute("disabled", next === "");
  }

  input.addEventListener("value-change", (event) => setValue(event.detail.value));
  clear.addEventListener("click", () => setValue(""));
  // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
  input.addEventListener("submit", (event) => {
    log.textContent = `提交：${event.detail.value}`;
  });

  setValue("输入框两侧各放了一颗自己的按钮");
</script>
```

### 随内容增高

输入框的高度跟随内容，rows 决定起始行数；不手动拖拽，也不写死高度

```vue
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";

const draft = "第一行\n第二行\n第三行\n再多敲几行，框会继续往下长";
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 起始一行：敲到第二行时框自己变高 -->
    <XhPromptInputRoot :translations="{ input: '给助手写点什么' }">
      <XhPromptInputInput rows="1" placeholder="按 Shift+Enter 换行试试" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- 初值就是好几行，挂载时框已经是撑开的 -->
    <XhPromptInputRoot :default-value="draft" :translations="{ input: '已经有草稿的输入框' }">
      <XhPromptInputInput rows="1" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <!-- 起始一行：敲到第二行时框自己变高 -->
  <xh-prompt-input id="prompt-input-autosize-one">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="按 Shift+Enter 换行试试"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <!-- 初值就是好几行，挂载时框已经是撑开的 -->
  <xh-prompt-input
    id="prompt-input-autosize-draft"
    default-value="第一行&#10;第二行&#10;第三行&#10;再多敲几行，框会继续往下长"
  >
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
</div>

<script type="module">
  document.getElementById("prompt-input-autosize-one").translations = { input: "给助手写点什么" };
  document.getElementById("prompt-input-autosize-draft").translations = {
    input: "已经有草稿的输入框",
  };
</script>
```

### 聚焦与选中

输入部件就是一个原生 textarea，取得它的节点即可聚焦、全选、失焦；发送后把焦点送回，继续输入下一条

```vue
<script setup lang="ts">
import {
  XhButton,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const log = ref("（还没发过）");
const input = ref<HTMLTextAreaElement | null>(null);

// 组件只渲染一个 textarea，实例上的 $el 就是它
function bindInput(instance: unknown): void {
  input.value = (instance as { $el: HTMLTextAreaElement } | null)?.$el ?? null;
}

function onSubmit(details: { value: string }): void {
  log.value = `提交：${details.value}`;
  // 点发送按钮会把焦点留在按钮上，这里送回输入框
  input.value?.focus();
}
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhPromptInputRoot :translations="{ input: '给助手写点什么' }" @submit="onSubmit">
      <XhPromptInputInput :ref="bindInput" rows="1" placeholder="发一条，焦点会自己回来" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <div style="display: flex; gap: 8px">
      <XhButton variant="outline" size="sm" @click="input?.focus()">聚焦</XhButton>
      <XhButton variant="outline" size="sm" @click="input?.select()">全选</XhButton>
      <XhButton variant="ghost" size="sm" @click="input?.blur()">失焦</XhButton>
    </div>
    <span>{{ log }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <xh-prompt-input id="prompt-input-focus">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="发一条，焦点会自己回来"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <div style="display: flex; gap: 8px">
    <xh-button id="prompt-input-focus-focus" variant="outline" size="sm">
      <button data-xh-part="root">聚焦</button>
    </xh-button>
    <xh-button id="prompt-input-focus-select" variant="outline" size="sm">
      <button data-xh-part="root">全选</button>
    </xh-button>
    <xh-button id="prompt-input-focus-blur" variant="ghost" size="sm">
      <button data-xh-part="root">失焦</button>
    </xh-button>
  </div>
  <span id="prompt-input-focus-log">（还没发过）</span>
</div>

<script type="module">
  const host = document.getElementById("prompt-input-focus");
  const input = host.querySelector('[data-xh-part="input"]');
  const log = document.getElementById("prompt-input-focus-log");
  host.translations = { input: "给助手写点什么" };

  // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
  host.addEventListener("submit", (event) => {
    log.textContent = `提交：${event.detail.value}`;
    // 点发送按钮会把焦点留在按钮上，这里送回输入框
    input.focus();
  });

  document.getElementById("prompt-input-focus-focus").addEventListener("click", () => input.focus());
  document
    .getElementById("prompt-input-focus-select")
    .addEventListener("click", () => input.select());
  document.getElementById("prompt-input-focus-blur").addEventListener("click", () => input.blur());
</script>
```

### 发送失败的错误态

判定是否出错由宿主决定：属性直接落到真实元素上，整框换色依靠覆盖公开变量，原因由活区播报

```vue
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
import { ref, useId } from "vue";

const reasonId = useId();
const failed = ref(false);
const log = ref("（还没发过）");
let attempt = 0;

// 边框换成危险档，覆盖的是公开变量
const invalidStyle = { "--xh-prompt-input-border": "var(--xh-color-danger-500)" };

function onSubmit(details: { value: string }): void {
  attempt += 1;
  // 头一条故意发不出去，再发一条就成
  failed.value = attempt % 2 === 1;
  log.value = failed.value ? `没发出去：${details.value}` : `提交：${details.value}`;
}
</script>

<template>
  <div style="display: grid; gap: 8px">
    <XhPromptInputRoot
      :data-invalid="failed || undefined"
      :style="failed ? invalidStyle : undefined"
      :translations="{ input: '给助手写点什么' }"
      @submit="onSubmit"
    >
      <XhPromptInputInput
        :aria-invalid="failed ? 'true' : 'false'"
        :aria-describedby="failed ? reasonId : undefined"
        rows="1"
        placeholder="发一条试试"
      />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- 节点常挂、靠 hidden 显隐：翻出来的那一刻读屏把原因念出来 -->
    <p
      :id="reasonId"
      role="alert"
      :hidden="!failed"
      style="margin: 0; font-size: 13px; color: var(--xh-fg-danger)"
    >
      网络不通，这条没能发出去，再发一次
    </p>
    <span>{{ log }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 8px">
  <xh-prompt-input id="prompt-input-invalid">
    <div data-xh-part="root">
      <textarea
        data-xh-part="input"
        aria-invalid="false"
        rows="1"
        placeholder="发一条试试"
      ></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <!-- 节点常挂、靠 hidden 显隐：翻出来的那一刻读屏把原因念出来 -->
  <p
    id="prompt-input-invalid-reason"
    role="alert"
    hidden
    style="margin: 0; font-size: 13px; color: var(--xh-fg-danger)"
  >
    网络不通，这条没能发出去，再发一次
  </p>
  <span id="prompt-input-invalid-log">（还没发过）</span>
</div>

<script type="module">
  const host = document.getElementById("prompt-input-invalid");
  const root = host.querySelector('[data-xh-part="root"]');
  const input = host.querySelector('[data-xh-part="input"]');
  const reason = document.getElementById("prompt-input-invalid-reason");
  const log = document.getElementById("prompt-input-invalid-log");
  host.translations = { input: "给助手写点什么" };
  let attempt = 0;

  // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
  host.addEventListener("submit", (event) => {
    attempt += 1;
    // 头一条故意发不出去，再发一条就成
    const failed = attempt % 2 === 1;
    root.toggleAttribute("data-invalid", failed);
    // 边框换成危险档，覆盖的是公开变量
    root.style.setProperty("--xh-prompt-input-border", failed ? "var(--xh-color-danger-500)" : "");
    input.setAttribute("aria-invalid", failed ? "true" : "false");
    if (failed) input.setAttribute("aria-describedby", reason.id);
    else input.removeAttribute("aria-describedby");
    reason.hidden = !failed;
    log.textContent = failed ? `没发出去：${event.detail.value}` : `提交：${event.detail.value}`;
  });
</script>
```

### 颜色

tone 切换聚焦描边与发送按钮使用哪族颜色，输入与提交链路不受影响

```vue
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhPromptInputRoot
      v-for="tone in tones"
      :key="tone"
      :tone="tone"
      :translations="{ input: '给助手写点什么' }"
    >
      <XhPromptInputInput rows="1" :placeholder="`${tone} 档`" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-prompt-input class="prompt-input-tone" tone="brand">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="brand 档"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
  <xh-prompt-input class="prompt-input-tone" tone="neutral">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="neutral 档"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
  <xh-prompt-input class="prompt-input-tone" tone="success">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="success 档"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
  <xh-prompt-input class="prompt-input-tone" tone="warning">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="warning 档"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
  <xh-prompt-input class="prompt-input-tone" tone="danger">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="danger 档"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
  <xh-prompt-input class="prompt-input-tone" tone="info">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="info 档"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>
</div>

<script type="module">
  // 文案是对象，只走 property
  for (const input of document.querySelectorAll(".prompt-input-tone"))
    input.translations = { input: "给助手写点什么" };
</script>
```

## 设计指引

### 何时使用

- AI 对话、聊天或任何输入一段话后提交的界面。
- 生成期间需要一键停止。

### 何时不用

- 只是表单中的多行文本域时，使用[文本字段](./text-field)配[表单字段](./field)。
- 需要 @提及或斜杠命令时，整体使用[提及](./mention)作为输入器，见下方的组合。

### 特性

- 发送与停止原位共用一个节点：正在按它的用户不会按空。生成期间按钮始终可用，此时它的语义是停止。
- `submitKey` 一个 prop 表达三档：`enter` 档 Enter 提交、Shift+Enter 换行、Mod+Enter 也提交；`mod-enter` 档 Enter 换行，只有 Mod+Enter 提交；`none` 档两种按法都换行，不保留任何键盘提交出口，只剩发送按钮与程序化的 `submit()`。
- 输入法组合期间的 Enter 一律放行，该按键用于确认候选词。
- 同一个输入框上叠加了其他处理器且它已处理该按键时，组件让位。
- 自动长高是两行 CSS，不进入状态机；引擎不支持时退化为 `rows` 决定的固定行数。
- 两种排布同一份皮肤：直接把输入框与按钮放进 root 是单行；套一层输入行后 root 变为竖排，输入行上下两侧可以再放附件条与动作行。
- 默认形态是 outline：不填底、`--xh-border-control` 描边、无影，不画顶光与背景模糊；输入段透明，底由外框承担。发送按钮与 Button 缺省同为品牌实心，生成中降为中性淡底的停止身份。
- 发送按钮留空时皮肤绘制兜底字形：发送身份为上箭头，停止身份为圆角方块；放入自定义图标或文案即覆盖。

### 组合

- 附件使用[文件上传](./file-upload)：它已覆盖 accept、大小校验、拖拽投放与逐条删除；有附件而正文为空时把 `allowEmptySubmit` 置真。附件条放在输入行上方，动作行放在下方，两者都是 root 的直接子节点，与输入行并列。
- 粘贴上传由作者在输入框上自行挂 `onPaste`，处理器会与组件的处理器链式组合。
- 模型选择器使用[选择器](./select)或[组合框](./combobox)，工具开关使用[切换按钮组](./toggle-group)，它们连同自己的容器一起放进输入行下方。
- 与[消息流](./message-feed)组合即是最小对话界面。

### 最佳实践

- 受控用法下提交后由宿主清空；`clearOnSubmit` 关闭时组件不改动值。
- 生成期间把 `loading` 置真而不是禁用整个输入框，用户仍需要编辑下一句。
- 需要胶囊形状时不必更换形态轴：在任意祖先上写 `--xh-prompt-input-radius: var(--xh-shape-pill)`，按钮另有 `--xh-prompt-input-submit-radius`。形态轴只决定底与描边的画法。

### 反模式

- 另起一个停止按钮放在旁边：两个按钮的位置会互相挤压，按下的瞬间位置也会变化。
- 用 `disabled` 表达正在生成：会连输入一起挡住，也关闭了停止的出口。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-prompt-input>` |
| Vue 组件 | `XhPromptInputControl` `XhPromptInputInput` `XhPromptInputRoot` `XhPromptInputSubmitTrigger` |
| 组合式函数 | `usePromptInput` |
| 状态机 | `promptInputMachine` |
| 皮肤 | `@xihan-ui/styles/prompt-input.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `loading` | `boolean` |  | 正在生成：按钮换为停止身份，所有提交路径被拦截。 使用一个布尔而不是四档运行态字符串：组件只需要二值判断， 本轮进行到哪一步是宿主的事，透传为 data 属性属于作者的容器。 |
| `submitKey` | `PromptInputSubmitKey` |  | 按哪一档提交，默认 enter。 |
| `allowEmptySubmit` | `boolean` |  | 允许空值提交，默认 false；有附件时由作者置真。这是唯一为附件保留的钩子。 |
| `clearOnSubmit` | `boolean` |  | 提交后清空，默认 true。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 |
| `tone` | `Tone` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<PromptInputTranslations>` |  |  |
| `onValueChange` | `(details: PromptInputValueChangeDetails) => void` |  |  |
| `onSubmit` | `(details: PromptInputSubmitDetails) => void` |  |  |
| `onStop` | `() => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `PromptInputValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `submit` | `PromptInputSubmitDetails` | 提交；detail 为 `{ value: string }`，清空发生在派发之后。 与原生表单提交同名，故不冒泡，请直接在 `&lt;xh-prompt-input&gt;` 元素上监听 |
| `stop` | `` | 生成期间按下停止；无 detail |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPromptInputRoot` | `default` | `PromptInputRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `input` | 'empty' \| 'editing' \| 'disabled' |

以下名称仅用于内部状态机。

**状态**：`empty` · `editing` · `disabled`

**事件**：`VALUE.SET` · `COMPOSITION.START` · `COMPOSITION.END` · `KEY.SUBMIT` · `SUBMIT` · `STOP` · `CONTROLLED.DISABLE` · `CONTROLLED.ENABLE` · `CONTROLLED.VALUE.EMPTY` · `PRESS.START` · `PRESS.END` · `CONTROLLED.VALUE.FILLED`

**判据**：`canSubmit` · `isLoading` · `isValueEmpty` · `isNextValueEmpty` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `isComposing` | `boolean` |  |
| `canSubmit` | `boolean` | 是否可以提交。比状态机守卫多一条非禁用，供按钮置灰使用。 |
| `loading` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setValue` | `(next: string) => void` |  |
| `submit` | `() => void` |  |
| `stop` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 可选的输入行容器：渲染它后，输入框与按钮并排收在这一行中，root 改为纵向排列。 |
| `getInputProps` | `() => T['textarea']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | 焦点在输入框、submitKey 为 enter、非组合态、可提交，且这一下还没被别的处理器处理过 | 提交，并按 clearOnSubmit 决定清不清空 |
| `Shift+Enter` | 焦点在输入框 | 不归组件管：原样放行，浏览器插入换行 |
| `Control+Enter` / `Meta+Enter` | 焦点在输入框、submitKey 为 enter 或 mod-enter、非组合态、可提交 | 提交，并按 clearOnSubmit 决定清不清空 |
| `Enter` / `Control+Enter` / `Meta+Enter` | 焦点在输入框、submitKey 为 none | 都不提交也不拦截：原样放行，浏览器插入换行；提交只剩按钮与程序化两条路 |
| `Enter` | 输入法组合中 | 不提交也不拦截：这一下是在确认候选词 |
| `Enter` | 同一个输入框上叠了别的处理器且它已经处理过这一下 | 让位，本组件什么都不做 |
| `Enter` / `Space` | 焦点在发送按钮上 | 按当前身份触发提交或停止（原生按钮激活） |
| `Enter` / `Space` | held on submit-trigger, not disabled（发送身份要可提交，停止身份恒可用） | 按住期间按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，身份随 loading 切换或提交后清空使按钮转禁用时一并撤下 |
| `Escape` | 任何时候 | 不接管：留给叠在输入框上的浮层与页面 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-label` | translations?.input |
| `submit-trigger` | `aria-label` | translations?.stop \| translations?.send |

- 输入框的可访问名称只在提供 `translations.input` 时才发出：无条件发出会覆盖作者自己的 `<label for>` 与 `aria-label`。
- 按钮的可访问名称随身份切换，读屏读到的与屏幕上看到的一致。
- 焦点由整框的 `:focus-within` 环表达；高对比、减少透明度、强制色与打印时外壳保持实体描边面。

## 样式参考

### 皮肤

`@xihan-ui/styles/prompt-input.css` 使用 `[data-scope="prompt-input"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-field-chrome` | '' |
| `root` | `data-xh-field-size` | props.size |
| `input` | `data-state` | 'empty' \| 'editing' \| 'disabled' |
| `input` | `data-xh-field-input` | '' |
| `submit-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `submit-trigger` | `data-mode` | 'stop' \| 'send' |
| `submit-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `submit-trigger` | `data-xh-action-control` | '' |
| `submit-trigger` | `data-xh-action-display` | 'always' |
| `submit-trigger` | `data-xh-action-profile` | 'text' |
| `submit-trigger` | `data-xh-action-size` | props.size |
| `submit-trigger` | `data-xh-action-variant` | 'subtle' \| 'solid' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-prompt-input-bg` | `root` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | prompt-input 的 root 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-bg-disabled` | `root` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | prompt-input 的 root 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | prompt-input 的 root 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-border` | `root` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | prompt-input 的 root 部件 border 覆盖槽。 |
| `--xh-prompt-input-border-focus` | `root` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | prompt-input 的 root 部件 border-color 覆盖槽。 |
| `--xh-prompt-input-border-hover` | `root` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | prompt-input 的 root 部件 border-color 覆盖槽。 |
| `--xh-prompt-input-gap` | `root` | `gap` | `xh-field-chrome` | `--xh-_prompt-input-gap` | prompt-input 的 root 部件 gap 覆盖槽。 |
| `--xh-prompt-input-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=md`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | prompt-input 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-prompt-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` | prompt-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-prompt-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` | prompt-input 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-prompt-input-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` | prompt-input 的 input 部件 color 覆盖槽。 |
| `--xh-prompt-input-input-font-size` | `input` | `font-size`<br>`padding-block` | `default`<br>`xh-field-input` | `--xh-_prompt-input-font-size` | prompt-input 的 input 部件 font-size、padding-block 覆盖槽。 |
| `--xh-prompt-input-input-radius` | `input` | `border-radius` | `default` | `--xh-shape-inset` | prompt-input 的 input 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-max-h` | `input` | `max-block-size` | `default` | `--xh-leading-normal` | prompt-input 的 input 部件 max-block-size 覆盖槽。 |
| `--xh-prompt-input-p` | `root` | `--xh-prompt-input-computed-px`<br>`padding`<br>`padding-inline` | `default`<br>`xh-field-chrome` | `--xh-_prompt-input-px` | prompt-input 的 root 部件 --xh-prompt-input-computed-px、padding、padding-inline 覆盖槽。 |
| `--xh-prompt-input-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | prompt-input 的 input 部件 color 覆盖槽。 |
| `--xh-prompt-input-radius` | `root` | `border-radius` | `xh-field-chrome` | `--xh-shape-surface` | prompt-input 的 root 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-row-gap` | `control` | `gap` | `default` | `--xh-_prompt-input-gap` | prompt-input 的 control 部件 gap 覆盖槽。 |
| `--xh-prompt-input-send-bg` | `submit-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-send-bg-active` | `submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-send-bg-hover` | `submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-send-bg-off` | `submit-trigger` | `background-color` | `disabled` | `--xh-bg-muted` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-send-fg` | `submit-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | prompt-input 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-prompt-input-shadow` | `root` | `box-shadow` | `xh-field-chrome` | `none` | prompt-input 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-prompt-input-stop-bg` | `submit-trigger` | `background-color` | `mode=stop` | `--xh-_action-variant-bg-rest` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-stop-bg-active` | `submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`mode=stop`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-stop-bg-hover` | `submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`mode=stop`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-stop-fg` | `submit-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`mode=stop`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | prompt-input 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-prompt-input-stop-mark-radius` | `submit-trigger` | `border-radius` | `empty`<br>`mode=stop` | `--xh-shape-inset` | prompt-input 的 submit-trigger 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-stop-mark-size` | `submit-trigger` | `block-size`<br>`inline-size` | `empty`<br>`mode=stop` | `--xh-icon-size` | prompt-input 的 submit-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-prompt-input-submit-font-size` | `submit-trigger` | `font-size` | `default` | `--xh-text-label-size` | prompt-input 的 submit-trigger 部件 font-size 覆盖槽。 |
| `--xh-prompt-input-submit-font-weight` | `submit-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | prompt-input 的 submit-trigger 部件 font-weight 覆盖槽。 |
| `--xh-prompt-input-submit-px` | `submit-trigger` | `padding-inline` | `default` | `--xh-_prompt-input-submit-px` | prompt-input 的 submit-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-prompt-input-submit-radius` | `submit-trigger` | `border-radius` | `default` | `--xh-shape-control` | prompt-input 的 submit-trigger 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-submit-shadow` | `submit-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_highlight-tone` | prompt-input 的 submit-trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`border-radius` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
