来源：https://ui.docs.xihanfun.com/components/prompt-input

# 提示输入框 `prompt-input`

会话界面的输入框：值、输入法、能不能提交，以及发送与停止共用的那一颗按钮。

## 何时使用

- AI 对话、聊天或任何「输入一段话然后提交」的界面。
- 生成期间要能一键停止。

## 何时不用

- 只是表单里的一个多行文本域：用[文本框](./text-field)配[字段](./field)。
- 要 @提及或斜杠命令：整个用[提及](./mention)当输入器，见下方的组合。

## 特性

- 发送与停止**原位共用一个节点**：正在按它的用户不会按空。生成期间按钮恒可用，
  此刻它的语义是停止。
- `submitKey` 一个 prop 表达三档：`enter` 档 Enter 提交、Shift+Enter 换行、Mod+Enter 也提交；
  `mod-enter` 档 Enter 换行，只有 Mod+Enter 提交；`none` 档两种按法都换行，
  键盘一个提交出口都不留，只剩发送按钮与程序化的 `submit()`。
- 输入法组合期间的 Enter 一律放行，那一下是在确认候选词。
- 同一个输入框上叠了别的处理器且它已经处理过这一下时，组件让位。
- 自动长高是两行 CSS，不进状态机；引擎不支持时退化成 `rows` 定的固定行数。
- 两种排布同一份皮肤：直接把输入框与按钮放进 root 就是单行；套一层输入行，root 翻成竖排，
  输入行上下两侧就能再放附件条与动作行。
- 发送按钮留空时皮肤画兜底字形：发送身份一枚上箭头，停止身份一枚圆角方块；
  塞进自己的图标或文案即盖掉它。

## 示例

### 基础用法

Enter 提交、Shift+Enter 换行；输入法组合中的 Enter 一律放行，那一下是在确认候选词

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

### 与消息流合成一个对话

发送键原位变停止；提交后粘底跟到最新一条，生成期间还能接着改下一句

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
      <XhMessageFeedScrollToEndTrigger>↓</XhMessageFeedScrollToEndTrigger>
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
      <button data-xh-part="scroll-to-end-trigger">↓</button>
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

写一层输入行，root 就翻成竖排：输入行在上、动作行在下；按钮留空时皮肤按身份画上箭头或停止方块

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

enter 档回车就发、mod-enter 档只有 Ctrl/Cmd+Enter 发、none 档两种按法都换行，提交只剩发送按钮

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

disabled 罩住整框并走原生 disabled；输入为空或只有空白时发送按钮转灰，但位置留着不收起

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

### 框里的附加节点

root 里除三件外还能放自己的按钮与计数；值的读写归宿主，原生属性照旧直接落到输入框上

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

### 随内容长高

输入框的高度跟着内容走，rows 定的是起始行数；不手动拖拽，也不写死高度

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

输入部件就是一个原生 textarea，拿到它的节点就能聚焦、全选、失焦；发完一条把焦点送回去，接着敲下一条

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

判定谁算出错是宿主的事：属性直接落到真元素上，整框换色靠覆盖公开变量，原因由活区播报

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

### 语气

tone 换聚焦描边与发送钮用哪族颜色，输入与提交那条链不受影响

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-prompt-input>` |
| Vue 组件 | `XhPromptInputControl` `XhPromptInputInput` `XhPromptInputRoot` `XhPromptInputSubmitTrigger` |
| 组合式函数 | `usePromptInput` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/prompt-input.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="prompt-input"`：**`root`** · `control` · **`input`** · **`submit-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `loading` | `boolean` |  | 正在生成：按钮换成停止身份，所有提交路径被挡下。 用一个布尔而不是四档运行态字符串——组件只需要二值判断， 「这一轮走到哪一步」是宿主的事，透传成 data 属性属于作者的容器。 |
| `submitKey` | `PromptInputSubmitKey` |  | 按哪一档提交，默认 enter。 |
| `allowEmptySubmit` | `boolean` |  | 允许空值提交，默认 false；有附件时由作者置真。这是唯一为附件留的钩子。 |
| `clearOnSubmit` | `boolean` |  | 提交后清空，默认 true。 |
| `variant` | `ControlVariant` |  |  |
| `tone` | `Tone` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<PromptInputTranslations>` |  |  |
| `onValueChange` | `(details: PromptInputValueChangeDetails) => void` |  |  |
| `onSubmit` | `(details: PromptInputSubmitDetails) => void` |  |  |
| `onStop` | `() => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `PromptInputValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `submit` | `PromptInputSubmitDetails` | 提交；detail 为 `{ value: string }`，清空发生在派发之后。 与原生表单提交同名，故不冒泡，请直接在 `&lt;xh-prompt-input&gt;` 元素上监听 |
| `stop` | `` | 生成期间按下停止；无 detail |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPromptInputRoot` | `default` | `PromptInputRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `input` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`VALUE.SET` · `COMPOSITION.START` · `COMPOSITION.END` · `KEY.SUBMIT` · `SUBMIT` · `STOP` · `CONTROLLED.DISABLE` · `CONTROLLED.ENABLE` · `CONTROLLED.VALUE.EMPTY` · `CONTROLLED.VALUE.FILLED`

**判据**：`canSubmit` · `isLoading` · `isValueEmpty` · `isNextValueEmpty`

## connect API

`usePromptInput` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `isComposing` | `boolean` |  |
| `canSubmit` | `boolean` | 能不能提交。比机器守卫多一条「非禁用」，供按钮置灰用。 |
| `loading` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setValue` | `(next: string) => void` |  |
| `submit` | `() => void` |  |
| `stop` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 可选的输入行容器：渲了它，输入框与按钮并排收在这一行里，root 翻成竖排。 |
| `getInputProps` | `() => T['textarea']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |

## 键盘

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
| `Escape` | 任何时候 | 不接管：留给叠在输入框上的浮层与页面 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-label` | translations?.input |
| `submit-trigger` | `aria-label` | translations?.stop \| translations?.send |

- 输入框的可访问名**只在给了 `translations.input` 时才发**：无条件发会盖掉作者自己的
  `<label for>` 与 `aria-label`。
- 按钮的可访问名随身份翻面，读屏念到的与屏幕上看到的是同一件事。

## 样式

默认皮肤 `@xihan-ui/styles/prompt-input.css` 按部件选择：`[data-scope="prompt-input"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `input` | `data-state` | state.get() |
| `submit-trigger` | `data-mode` | 'stop' \| 'send' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-prompt-input-bg` · `--xh-prompt-input-bg-disabled` · `--xh-prompt-input-bg-hover` · `--xh-prompt-input-border` · `--xh-prompt-input-border-focus` · `--xh-prompt-input-border-hover` · `--xh-prompt-input-gap` · `--xh-prompt-input-icon-size` · `--xh-prompt-input-input-autofill-bg` · `--xh-prompt-input-input-autofill-fg` · `--xh-prompt-input-input-fg` · `--xh-prompt-input-input-font-size` · `--xh-prompt-input-max-h` · `--xh-prompt-input-p` · `--xh-prompt-input-placeholder-fg` · `--xh-prompt-input-radius` · `--xh-prompt-input-row-gap` · `--xh-prompt-input-send-bg` · `--xh-prompt-input-send-bg-active` · `--xh-prompt-input-send-bg-hover` · `--xh-prompt-input-send-bg-off` · `--xh-prompt-input-send-fg` · `--xh-prompt-input-shadow` · `--xh-prompt-input-stop-bg` · `--xh-prompt-input-stop-bg-active` · `--xh-prompt-input-stop-bg-hover` · `--xh-prompt-input-stop-fg` · `--xh-prompt-input-stop-mark-radius` · `--xh-prompt-input-stop-mark-size` · `--xh-prompt-input-submit-font-size` · `--xh-prompt-input-submit-font-weight` · `--xh-prompt-input-submit-px` · `--xh-prompt-input-submit-radius` · `--xh-prompt-input-submit-shadow`

## 动效

`background` · `border-color` · `border-radius` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 附件用[文件上传](./file-upload)：它已覆盖 accept、大小校验、拖拽投放与逐条删除；
  有附件而正文为空时把 `allowEmptySubmit` 置真。附件条摆在输入行上方，动作行摆在下方，
  两者都是 root 的直接子节点，与输入行并列。
- 粘贴上传由作者在输入框上自己挂 `onPaste`，处理器会与组件的链式组合。
- 模型选择器用[选择器](./select)或[组合框](./combobox)，工具开关用[开关组](./toggle-group)，
  它们连同自己的容器一起摆进输入行下方的那一段。
- 与[消息流](./message-feed)合起来就是一个最小对话界面。

## 最佳实践

- 受控用法下提交后由宿主清空；`clearOnSubmit` 关掉时组件不动值。
- 生成期间把 `loading` 置真而不是把整个输入框禁用：用户还要能改下一句。
- 要药丸形状不必换形态轴：在任意祖先上写一行 `--xh-prompt-input-radius: var(--xh-shape-pill)`，
  按钮那一颗另有 `--xh-prompt-input-submit-radius`。形态轴只管底与描边怎么画。

## 反模式

- 另起一颗停止按钮摆在旁边：两颗按钮的位置会互相挤，且按下去的那一刻它正好换了位置。
- 用 `disabled` 表达「正在生成」：那会连输入一起挡住，也把停止的出口一起关掉。
