来源：https://ui.docs.xihanfun.com/components/code-view

# CodeView `代码视图`

一段代码的逐行呈现：行号、指定行高亮、超长折叠、文件名，可选语法着色，支持流式追加时的未闭合状态。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/code-view" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/code-view.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/code-view" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/code-view" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/code-view.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

代码原文由宿主给，组件切出逐行结构并铺记号；渲了文件名它就成为代码块的可访问名

```vue
<script setup lang="ts">
import {
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewLangLabel,
  XhCodeViewPre,
  XhCodeViewRoot,
} from "@xihan-ui/vue";

const sample = `export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`;
</script>

<template>
  <!-- complete 表示这段代码已经写完，可以放心着色 -->
  <XhCodeViewRoot
    :code="sample"
    lang="typescript"
    filename="ticker.ts"
    complete
    style="inline-size: 100%;"
  >
    <XhCodeViewHeader>
      <XhCodeViewFilename />
      <XhCodeViewLangLabel />
    </XhCodeViewHeader>
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
```

```html
<!-- complete 表示这段代码已经写完，可以放心着色 -->
<xh-code-view
  code="export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}"
  code-lang="typescript"
  filename="ticker.ts"
  complete
  style="inline-size: 100%"
>
  <div data-xh-part="root">
    <div data-xh-part="header">
      <span data-xh-part="filename">ticker.ts</span>
      <span data-xh-part="lang-label">typescript</span>
    </div>
    <!-- 行由元素铺；这里写的原文是 JS 到达之前的样子 -->
    <pre data-xh-part="pre"><code data-xh-part="code">export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}</code></pre>
  </div>
</xh-code-view>
```

## 示例

### 行号与高亮行

行号由皮肤画上去，复制代码不会带上它；高亮行按行号写，与 startLine 对齐

```vue
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";

const sample = `function resolve(input: string) {
  const trimmed = input.trim()
  if (trimmed === '') {
    return null
  }
  return trimmed.toLowerCase()
}`;
</script>

<template>
  <!-- 这段是从第 42 行摘出来的，高亮那三行是要读者看的地方 -->
  <XhCodeViewRoot
    :code="sample"
    lang="typescript"
    complete
    line-numbers
    :start-line="42"
    highlight-lines="44-46"
    style="inline-size: 100%;"
  >
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
```

```html
<!-- 这段是从第 42 行摘出来的，高亮那三行是要读者看的地方 -->
<xh-code-view
  code="function resolve(input: string) {
  const trimmed = input.trim()
  if (trimmed === '') {
    return null
  }
  return trimmed.toLowerCase()
}"
  code-lang="typescript"
  complete
  line-numbers
  start-line="42"
  highlight-lines="44-46"
  style="inline-size: 100%"
>
  <div data-xh-part="root">
    <pre data-xh-part="pre"><code data-xh-part="code">function resolve(input: string) {
  const trimmed = input.trim()
  if (trimmed === '') {
    return null
  }
  return trimmed.toLowerCase()
}</code></pre>
  </div>
</xh-code-view>
```

### 折叠超长代码

clamped 是纯受控的：组件只发意图，落不落由宿主决定，好让「全部展开」这类操作统一持有

```vue
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewFoldTrigger, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const clamped = ref(true);

const sample = Array.from(
  { length: 24 },
  (_, i) => `const step${i + 1} = pipeline.at(${i})`,
).join("\n");
</script>

<template>
  <XhCodeViewRoot
    v-model:clamped="clamped"
    :code="sample"
    lang="typescript"
    complete
    line-numbers
    :clamp="8"
    style="inline-size: 100%;"
  >
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
    <!-- 按钮的文案与 aria-expanded 由组件按折叠态翻面 -->
    <XhCodeViewFoldTrigger>
      {{ clamped ? `展开全部 24 行` : "收起" }}
    </XhCodeViewFoldTrigger>
  </XhCodeViewRoot>
</template>
```

```html
<xh-code-view
  id="code-view-fold"
  code="const step1 = pipeline.at(0)
const step2 = pipeline.at(1)
const step3 = pipeline.at(2)
const step4 = pipeline.at(3)
const step5 = pipeline.at(4)
const step6 = pipeline.at(5)
const step7 = pipeline.at(6)
const step8 = pipeline.at(7)
const step9 = pipeline.at(8)
const step10 = pipeline.at(9)
const step11 = pipeline.at(10)
const step12 = pipeline.at(11)
const step13 = pipeline.at(12)
const step14 = pipeline.at(13)
const step15 = pipeline.at(14)
const step16 = pipeline.at(15)
const step17 = pipeline.at(16)
const step18 = pipeline.at(17)
const step19 = pipeline.at(18)
const step20 = pipeline.at(19)
const step21 = pipeline.at(20)
const step22 = pipeline.at(21)
const step23 = pipeline.at(22)
const step24 = pipeline.at(23)"
  code-lang="typescript"
  complete
  line-numbers
  clamp="8"
  clamped
  style="inline-size: 100%"
>
  <div data-xh-part="root">
    <pre data-xh-part="pre"><code data-xh-part="code">const step1 = pipeline.at(0)
const step2 = pipeline.at(1)
const step3 = pipeline.at(2)
const step4 = pipeline.at(3)
const step5 = pipeline.at(4)
const step6 = pipeline.at(5)
const step7 = pipeline.at(6)
const step8 = pipeline.at(7)
const step9 = pipeline.at(8)
const step10 = pipeline.at(9)
const step11 = pipeline.at(10)
const step12 = pipeline.at(11)
const step13 = pipeline.at(12)
const step14 = pipeline.at(13)
const step15 = pipeline.at(14)
const step16 = pipeline.at(15)
const step17 = pipeline.at(16)
const step18 = pipeline.at(17)
const step19 = pipeline.at(18)
const step20 = pipeline.at(19)
const step21 = pipeline.at(20)
const step22 = pipeline.at(21)
const step23 = pipeline.at(22)
const step24 = pipeline.at(23)</code></pre>
    <!-- 按钮的文案与 aria-expanded 由元素按折叠态翻面 -->
    <button data-xh-part="fold-trigger">展开全部 24 行</button>
  </div>
</xh-code-view>

<script type="module">
  // 折叠态纯受控：元素只发意图，宿主自己写回属性
  const view = document.getElementById("code-view-fold");
  const trigger = view.querySelector('[data-xh-part="fold-trigger"]');
  view.addEventListener("clamp-toggle", (event) => {
    view.toggleAttribute("clamped", event.detail.clamped);
    trigger.textContent = event.detail.clamped ? "展开全部 24 行" : "收起";
  });
</script>
```

### 流式追加

代码还在写的时候默认不着色：半截代码的词法本来就不稳，每来一个字符整块变色比不着色更糟

```vue
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

const full = `async function load(id: string) {
  const res = await fetch(\`/api/items/\${id}\`)
  return res.json()
}`;

const code = ref("");
const complete = ref(false);

let timer = 0;
function tick() {
  if (code.value.length >= full.length) {
    complete.value = true;
    return;
  }
  code.value = full.slice(0, code.value.length + 2);
  timer = window.setTimeout(tick, 60);
}
// 挂载后才开始追加：<script setup> 顶层在服务端渲染时也执行，那里没有 window
onMounted(tick);

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <!-- complete 翻真的那一刻着色才上；高度一直按当前行数撑着，不会一跳一跳 -->
  <XhCodeViewRoot
    :code="code"
    :complete="complete"
    lang="typescript"
    style="inline-size: 100%;"
  >
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
```

```html
<xh-code-view id="code-view-streaming" code-lang="typescript" style="inline-size: 100%">
  <div data-xh-part="root">
    <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
  </div>
</xh-code-view>

<script type="module">
  // complete 翻真的那一刻着色才上；高度一直按当前行数撑着，不会一跳一跳
  const view = document.getElementById("code-view-streaming");
  const full = [
    "async function load(id: string) {",
    "  const res = await fetch(`/api/items/${id}`)",
    "  return res.json()",
    "}",
  ].join("\n");

  let at = 0;
  const tick = () => {
    if (!view.isConnected) return;
    at = Math.min(at + 2, full.length);
    view.setAttribute("code", full.slice(0, at));
    if (at >= full.length) {
      view.setAttribute("complete", "");
      return;
    }
    setTimeout(tick, 60);
  };
  tick();
</script>
```

### 头部内建复制

复制交给剪贴板：把它放进头部条，用几个槽把描边按钮压成安静形态，1500 毫秒后自己回落

```vue
<script setup lang="ts">
import { CheckIcon, CopyIcon } from "@xihan-ui/icons";
import {
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardRoot,
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhIcon,
} from "@xihan-ui/vue";

const sample = `export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`;
</script>

<template>
  <XhCodeViewRoot
    :code="sample"
    lang="typescript"
    filename="store.ts"
    complete
    style="inline-size: 100%;"
  >
    <XhCodeViewHeader>
      <!-- 文件名占满剩余宽度，复制按钮自然被推到头部条末端 -->
      <XhCodeViewFilename />
      <!-- 无边无底、矮一档、字号取脚注档：静息与悬停都不画描边，只换底色 -->
      <XhClipboardRoot
        :value="sample"
        :timeout="1500"
        style="
          --xh-clipboard-copy-trigger-border: transparent;
          --xh-clipboard-copy-trigger-border-hover: transparent;
          --xh-clipboard-copy-trigger-bg: transparent;
          --xh-clipboard-copy-trigger-h: var(--xh-control-h-sm);
          --xh-clipboard-copy-trigger-px: var(--xh-control-px-sm);
          --xh-clipboard-copy-trigger-font-size: var(--xh-text-caption-size);
        "
      >
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator><XhIcon :icon="CopyIcon" /> 复制</XhClipboardIndicator>
          <XhClipboardIndicator copied><XhIcon :icon="CheckIcon" /> 已复制</XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardRoot>
    </XhCodeViewHeader>
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
```

```html
<xh-code-view
  code="export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}"
  code-lang="typescript"
  filename="store.ts"
  complete
  style="inline-size: 100%"
>
  <div data-xh-part="root">
    <div data-xh-part="header">
      <!-- 文件名占满剩余宽度，复制按钮自然被推到头部条末端 -->
      <span data-xh-part="filename">store.ts</span>
      <!-- 嵌套的 xh-* 子树由外层元素跳过，两个宿主各接各的角色节点 -->
      <xh-clipboard
        value="export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}"
        timeout="1500"
        style="
          --xh-clipboard-copy-trigger-border: transparent;
          --xh-clipboard-copy-trigger-border-hover: transparent;
          --xh-clipboard-copy-trigger-bg: transparent;
          --xh-clipboard-copy-trigger-h: var(--xh-control-h-sm);
          --xh-clipboard-copy-trigger-px: var(--xh-control-px-sm);
          --xh-clipboard-copy-trigger-font-size: var(--xh-text-caption-size);
        "
      >
        <div data-xh-part="root">
          <!-- 无边无底、矮一档、字号取脚注档：静息与悬停都不画描边，只换底色 -->
          <button data-xh-part="copy-trigger">
            <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M15 6V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1"/></svg> 复制</span>
            <span data-xh-part="indicator" copied><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg> 已复制</span>
          </button>
        </div>
      </xh-clipboard>
    </div>
    <!-- 行由元素铺；这里写的原文是 JS 到达之前的样子 -->
    <pre data-xh-part="pre"><code data-xh-part="code">export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () =&gt; state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}</code></pre>
  </div>
</xh-code-view>
```

### 着色端口

着色是可换的端口：认不出的语言退回纯文本，接自己的实现组件侧一行不用改，传 null 则整个关掉

```vue
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";

const manifest = `# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`;

// 端口只有一个方法：给代码与语言，返回记号序列；返回 null 表示这一次不着色
const yamlComments = {
  highlight(code: string, lang: string) {
    if (lang !== "yaml")
      return null;
    return code
      .split(/(#[^\n]*)/)
      .filter(text => text !== "")
      .map(text => ({
        text,
        kind: text.startsWith("#") ? ("comment" as const) : ("plain" as const),
      }));
  },
};
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 自带的着色实现不认识 yaml，退回纯文本；不着色是合法结果 -->
    <XhCodeViewRoot :code="manifest" lang="yaml" complete style="inline-size: 100%;">
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>

    <!-- 换成自己的实现：只把注释挑出来 -->
    <XhCodeViewRoot
      :code="manifest"
      lang="yaml"
      complete
      :highlighter="yamlComments"
      style="inline-size: 100%;"
    >
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>

    <!-- 显式 null：一个记号都不产，每行就一个文本节点 -->
    <XhCodeViewRoot
      :code="manifest"
      lang="yaml"
      complete
      :highlighter="null"
      style="inline-size: 100%;"
    >
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <!-- 自带的着色实现不认识 yaml，退回纯文本；不着色是合法结果 -->
  <xh-code-view
    code="# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production"
    code-lang="yaml"
    complete
    style="inline-size: 100%"
  >
    <div data-xh-part="root">
      <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
    </div>
  </xh-code-view>

  <!-- 换成自己的实现：只把注释挑出来 -->
  <xh-code-view
    id="code-view-highlighter-custom"
    code="# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production"
    code-lang="yaml"
    complete
    style="inline-size: 100%"
  >
    <div data-xh-part="root">
      <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
    </div>
  </xh-code-view>

  <!-- 显式 null：一个记号都不产，每行就一个文本节点 -->
  <xh-code-view
    id="code-view-highlighter-off"
    code="# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production"
    code-lang="yaml"
    complete
    style="inline-size: 100%"
  >
    <div data-xh-part="root">
      <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
    </div>
  </xh-code-view>
</div>

<script type="module">
  // 对象值走不了 HTML 属性，着色端口只能用 property 赋值
  const yamlComments = {
    highlight(code, lang) {
      if (lang !== "yaml") return null;
      return code
        .split(/(#[^\n]*)/)
        .filter((text) => text !== "")
        .map((text) => ({ text, kind: text.startsWith("#") ? "comment" : "plain" }));
    },
  };

  // 它不是响应式字段，元素已经渲过一轮之后赋值要自己要求一次重渲
  const custom = document.getElementById("code-view-highlighter-custom");
  custom.highlighter = yamlComments;
  custom.requestUpdate();

  const off = document.getElementById("code-view-highlighter-off");
  off.highlighter = null;
  off.requestUpdate();
</script>
```

### 流式期间也着色

未闭合默认不着色；真要看着色就打开 highlight-while-streaming，同一段半截代码的两种呈现摆在一起

```vue
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";

// 吐到一半的样子：最后一行断在半个表达式上，围栏也还没闭合
const partial = `const stream = await client.chat({
  model: 'demo',
  messages,
  onToken(token) {
    buffer +=`;
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 语言标注也没吐出来：空白、半截、不认识的一律落到 plaintext -->
    <XhCodeViewRoot :code="partial" :complete="false" style="inline-size: 100%;">
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>

    <!-- 打开开关：半截代码也按当前词法着色，每来一个字符可能重新分色 -->
    <XhCodeViewRoot
      :code="partial"
      lang="typescript"
      :complete="false"
      highlight-while-streaming
      style="inline-size: 100%;"
    >
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <!-- 语言标注也没吐出来：空白、半截、不认识的一律落到 plaintext -->
  <xh-code-view
    code="const stream = await client.chat({
  model: 'demo',
  messages,
  onToken(token) {
    buffer +="
    complete="false"
    style="inline-size: 100%"
  >
    <div data-xh-part="root">
      <pre data-xh-part="pre"><code data-xh-part="code">const stream = await client.chat({
  model: 'demo',
  messages,
  onToken(token) {
    buffer +=</code></pre>
    </div>
  </xh-code-view>

  <!-- 打开开关：半截代码也按当前词法着色，每来一个字符可能重新分色 -->
  <xh-code-view
    code="const stream = await client.chat({
  model: 'demo',
  messages,
  onToken(token) {
    buffer +="
    code-lang="typescript"
    complete="false"
    highlight-while-streaming
    style="inline-size: 100%"
  >
    <div data-xh-part="root">
      <pre data-xh-part="pre"><code data-xh-part="code">const stream = await client.chat({
  model: 'demo',
  messages,
  onToken(token) {
    buffer +=</code></pre>
    </div>
  </xh-code-view>
</div>
```

### 尺寸

size 换字号、行高与内边距三档，行号槽与折叠钮跟着一起走

```vue
<script setup lang="ts">
import {
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewPre,
  XhCodeViewRoot,
} from "@xihan-ui/vue";

const sample = `export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}`;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhCodeViewRoot
      v-for="size in ['sm', 'md', 'lg']"
      :key="size"
      :size="size"
      :code="sample"
      lang="typescript"
      :filename="`clamp.${size}.ts`"
      complete
      style="inline-size: 100%"
    >
      <XhCodeViewHeader>
        <XhCodeViewFilename />
      </XhCodeViewHeader>
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-code-view
    code="export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}"
    code-lang="typescript"
    filename="clamp.sm.ts"
    size="sm"
    complete
    style="inline-size: 100%"
  >
    <div data-xh-part="root">
      <div data-xh-part="header">
        <span data-xh-part="filename">clamp.sm.ts</span>
      </div>
      <pre data-xh-part="pre"><code data-xh-part="code">export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}</code></pre>
    </div>
  </xh-code-view>

  <xh-code-view
    code="export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}"
    code-lang="typescript"
    filename="clamp.md.ts"
    complete
    style="inline-size: 100%"
  >
    <div data-xh-part="root">
      <div data-xh-part="header">
        <span data-xh-part="filename">clamp.md.ts</span>
      </div>
      <pre data-xh-part="pre"><code data-xh-part="code">export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}</code></pre>
    </div>
  </xh-code-view>

  <xh-code-view
    code="export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}"
    code-lang="typescript"
    filename="clamp.lg.ts"
    size="lg"
    complete
    style="inline-size: 100%"
  >
    <div data-xh-part="root">
      <div data-xh-part="header">
        <span data-xh-part="filename">clamp.lg.ts</span>
      </div>
      <pre data-xh-part="pre"><code data-xh-part="code">export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}</code></pre>
    </div>
  </xh-code-view>
</div>
```

## 设计指引

### 何时使用

- AI 回复、文档、评审意见里展示一段代码，需要行号或要点出某几行。
- 代码是流式生成的，需要边来边渲，闭合之后再着色。
- 一段代码很长，默认只想露出前若干行。

### 何时不用

- 只是一小段行内标识：用[排印](./typography)的 `code` 形态。
- 展示的是运行日志：用[日志](./log)。
- 要展示改动前后：用[差异视图](./diff-view)。

### 特性

- 逐行切分在连接层完成。一个记号可以横跨多行（未闭合的字符串与块注释就是这样），
  所以行号与高亮行不是皮肤能反推出来的东西。
- `complete` 标出这段代码是否已经写完。未闭合时默认不着色——半截代码的词法本来就不稳，
  每来一个字符整块变一次色比不着色更糟。
- `highlighter` 是一个着色端口，接哪个着色器由宿主决定；它返回 `null` 是合法结果，退回纯文本。
  适配器默认接 `@xihan-ui/code-highlight`，那是可选 peer：装了它自动着色，没装就一路纯文本。
  适配器显式传 `null` 时不会请求默认模块；只有明确的模块缺席会回到纯文本，已安装模块的加载或初始化异常照常抛出。
- 行号由皮肤用 `attr()` 画出来，因此**复制代码不会带上行号**，读屏也不会逐行念数字。
- `clamped` 是纯受控的：折叠态通常由外部「全部展开 / 全部折叠」统一持有，内建一份只会跟它打架。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-code-view>` |
| Vue 组件 | `XhCodeViewCode` `XhCodeViewFilename` `XhCodeViewFoldTrigger` `XhCodeViewHeader` `XhCodeViewLangLabel` `XhCodeViewPre` `XhCodeViewRoot` |
| 组合式函数 | `useCodeView` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/code-view.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="code-view"`：**`root`** · `header` · `filename` · `lang-label` · **`pre`** · **`code`** · `line` · `line-number` · `line-content` · `token` · `fold-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `clamp` | `number` |  | 超过这么多行才算可折叠。 |
| `clamped` | `boolean` |  | 折叠态，纯受控——没有 defaultClamped，要非受控就套 collapsible。 |
| `code` | `string` | 是 |  |
| `complete` | `boolean` |  | 代码是否已闭合，未闭合时按行数预撑高度且默认不着色。 |
| `filename` | `string` |  | 文件名，渲染在 header 里；渲染出来之后它就是 pre 的可访问名。 |
| `highlighter` | `HighlighterPort` |  | 着色实现。不给就是纯文本，给了也允许它返回 null（语言不认识之类），同样退回纯文本。 未闭合的块默认不着色，见 {@link highlightWhileStreaming}。 |
| `highlightLines` | `string \| readonly number[]` |  | 要高亮的行号，写成 `'3,7-9'` 或行号数组；非法片段丢弃不报错。 |
| `highlightWhileStreaming` | `boolean` |  | 块还没闭合时也着色，默认 false。 默认关是因为半截代码的词法本来就不稳——引号、括号随时会配上， 每来一个 token 整块变一次色，看着比不着色更糟。 |
| `labelled` | `boolean` |  | 作者渲染了 filename 部件时置真，由适配器统计而不是看 filename 有没有值。 为假时 pre 用 translations.code 兜底——指向一个没渲出来的 id 会让读屏读空。 |
| `lang` | `string` |  | 围栏语言标注，空白一律落 plaintext。 |
| `lineNumbers` | `boolean` |  | 渲染行号槽。 |
| `onClampToggle` | `(details: CodeViewClampToggleDetails) => void` |  | 折叠态翻面的意图回调；clamped 是纯受控的，落不落由宿主决定。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `startLine` | `number` |  | 首行的行号，默认 1；摘录与 patch 片段要用。 |
| `translations` | `Partial<CodeViewTranslations>` |  |  |
| `wrap` | `boolean` |  | 长行自动换行，默认关（长行横向滚动）。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `clamp-toggle` | `CustomEvent` | 折叠态翻面的意图；detail 为 `{ clamped: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCodeViewCode` | `line` | `CodeViewLineSlotProps` |  |
| `XhCodeViewRoot` | `default` | `CodeViewRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `fold-trigger` | 'closed' \| 'open' |

## connect API

`useCodeView` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `lang` | `string` |  |
| `lineCount` | `number` |  |
| `lines` | `readonly CodeLine[]` | 逐行切好的文本与记号片段。 |
| `lineNumberAt` | `(index: number) => number` | 每行的行号，与 lines 同序。 |
| `lineNumbers` | `boolean` | 是否渲染行号槽；适配器据此决定要不要建那个节点。 |
| `foldable` | `boolean` | 折叠可用：给了正数 clamp 且行数确实超过它。 |
| `clamped` | `boolean` |  |
| `setClamped` | `(next: boolean) => void` | 发一次折叠意图；与当前态相同时不发。 |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getFilenameProps` | `() => T['element']` |  |
| `getLangLabelProps` | `() => T['element']` |  |
| `getPreProps` | `() => T['element']` |  |
| `getCodeProps` | `() => T['element']` |  |
| `getLineProps` | `(props: CodeViewLineProps) => T['element']` |  |
| `getLineNumberProps` | `(props: CodeViewLineProps) => T['element']` |  |
| `getLineContentProps` | `(props: CodeViewLineProps) => T['element']` |  |
| `getTokenProps` | `(token: CodeToken) => T['element']` |  |
| `getFoldTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 代码块在 Tab 序列中 | &lt;pre&gt; 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管 |
| `Enter` / `Space` | 焦点在折叠按钮上 | 翻面折叠态并发出意图；组件只接 click，按键走原生 button 的默认行为 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `lang-label` | `aria-hidden` | 'true' |
| `pre` | `role` | 'group' |
| `line-number` | `aria-hidden` | 'true' |
| `fold-trigger` | `aria-controls` | `pre` 部件的 id |
| `fold-trigger` | `aria-expanded` | 'false' \| 'true' |
| `fold-trigger` | `aria-label` | props.translations?.expand \| props.translations?.collapse |

- `pre` 可聚焦并带可访问名：渲了文件名就指向它，没渲就用 `translations.code` 兜底。
- 折叠按钮带 `aria-expanded` 与 `aria-controls`，指向 `pre`。
- 语言角标与行号槽都对读屏隐藏，它们是装饰不是内容。

## 样式

默认皮肤 `@xihan-ui/styles/code-view.css` 按部件选择：`[data-scope="code-view"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-clamped` | ''（条件成立时才出现） |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-digits` | String(Math.min( String(lineNumberAt(lineCount - 1)).… |
| `root` | `data-foldable` | ''（条件成立时才出现） |
| `root` | `data-lang` | props.lang?.trim() \|\| CODE_VIEW_FALLBACK_LANG |
| `root` | `data-line-numbers` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `pre` | `data-complete` | ''（条件成立时才出现） |
| `pre` | `data-wrap` | ''（条件成立时才出现） |
| `code` | `data-lang` | props.lang?.trim() \|\| CODE_VIEW_FALLBACK_LANG |
| `code` | `data-wrap` | ''（条件成立时才出现） |
| `token` | `data-kind` | token.kind |
| `fold-trigger` | `data-state` | 'closed' \| 'open' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-code-view-bg` | `root` | `background` | `default` | `--xh-bg-surface` | code-view 的 root 部件 background 覆盖槽。 |
| `--xh-code-view-border` | `root` | `border` | `default` | `--xh-border-default` | code-view 的 root 部件 border 覆盖槽。 |
| `--xh-code-view-comment-fg` | `token` | `color` | `kind=comment` | `--xh-fg-muted` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-fg` | `root` | `color` | `default` | `--xh-fg-muted` | code-view 的 root 部件 color 覆盖槽。 |
| `--xh-code-view-filename-fg` | `filename` | `color` | `default` | `--xh-fg-default` | code-view 的 filename 部件 color 覆盖槽。 |
| `--xh-code-view-fold-bg-hover` | `fold-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | code-view 的 fold-trigger 部件 background 覆盖槽。 |
| `--xh-code-view-fold-fg` | `fold-trigger` | `color` | `default` | `--xh-fg-muted` | code-view 的 fold-trigger 部件 color 覆盖槽。 |
| `--xh-code-view-fold-py` | `fold-trigger` | `padding-block` | `default` | `--xh-space-2` | code-view 的 fold-trigger 部件 padding-block 覆盖槽。 |
| `--xh-code-view-font` | `code`<br>`filename` | `font-family` | `default` | `--xh-font-family-mono` | code-view 的 code、filename 部件 font-family 覆盖槽。 |
| `--xh-code-view-font-size` | `root` | `font-size` | `default` | `--xh-_code-view-font-size` | code-view 的 root 部件 font-size 覆盖槽。 |
| `--xh-code-view-gutter-border` | `line-number` | `border-inline-end` | `default` | `--xh-border-default` | code-view 的 line-number 部件 border-inline-end 覆盖槽。 |
| `--xh-code-view-gutter-gap` | `line-number` | `padding-inline-end` | `default` | `--xh-space-1` | code-view 的 line-number 部件 padding-inline-end 覆盖槽。 |
| `--xh-code-view-header-border` | `fold-trigger`<br>`header` | `border-block-end`<br>`border-block-start` | `default` | `--xh-border-subtle` | code-view 的 fold-trigger、header 部件 border-block-end、border-block-start 覆盖槽。 |
| `--xh-code-view-header-fg` | `header` | `color` | `default` | `--xh-fg-muted` | code-view 的 header 部件 color 覆盖槽。 |
| `--xh-code-view-header-font-size` | `fold-trigger`<br>`header` | `font-size` | `default` | `--xh-text-secondary-size` | code-view 的 fold-trigger、header 部件 font-size 覆盖槽。 |
| `--xh-code-view-header-gap` | `header` | `gap` | `default` | `--xh-space-2` | code-view 的 header 部件 gap 覆盖槽。 |
| `--xh-code-view-header-h` | `header` | `min-block-size` | `default` | `--xh-control-h-lg` | code-view 的 header 部件 min-block-size 覆盖槽。 |
| `--xh-code-view-header-px` | `header` | `padding-inline` | `default` | `--xh-space-4` | code-view 的 header 部件 padding-inline 覆盖槽。 |
| `--xh-code-view-header-py` | `header` | `padding-block` | `default` | `--xh-space-2` | code-view 的 header 部件 padding-block 覆盖槽。 |
| `--xh-code-view-highlight-bar` | `line` | `box-shadow`<br>`outline`<br>`outline-offset` | `@media print`<br>`highlighted` | `--xh-stroke-thick` | code-view 的 line 部件 box-shadow、outline、outline-offset 覆盖槽。 |
| `--xh-code-view-highlight-bg` | `line` | `background` | `highlighted` | `--xh-bg-brand-subtle` | code-view 的 line 部件 background 覆盖槽。 |
| `--xh-code-view-highlight-fg` | `line` | `box-shadow` | `highlighted` | `--xh-bg-brand` | code-view 的 line 部件 box-shadow 覆盖槽。 |
| `--xh-code-view-keyword-fg` | `token` | `color` | `kind=keyword` | `--xh-syntax-keyword` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-keyword-weight` | `token` | `font-weight` | `kind=keyword` | `--xh-font-weight-semibold` | code-view 的 token 部件 font-weight 覆盖槽。 |
| `--xh-code-view-label-fg` | `lang-label` | `color` | `default` | `--xh-fg-subtle` | code-view 的 lang-label 部件 color 覆盖槽。 |
| `--xh-code-view-label-font-size` | `lang-label` | `font-size` | `default` | `--xh-text-caption-size` | code-view 的 lang-label 部件 font-size 覆盖槽。 |
| `--xh-code-view-line-height` | `line`<br>`pre` | `line-height`<br>`min-block-size` | `default` | `--xh-text-code-leading` | code-view 的 line、pre 部件 line-height、min-block-size 覆盖槽。 |
| `--xh-code-view-number-fg` | `line-number` | `color` | `default` | `--xh-fg-subtle` | code-view 的 line-number 部件 color 覆盖槽。 |
| `--xh-code-view-number-font-size` | `line-number` | `font-size` | `default` | `--xh-text-caption-size` | code-view 的 line-number 部件 font-size 覆盖槽。 |
| `--xh-code-view-number-token-fg` | `token` | `color` | `kind=number` | `--xh-syntax-number` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-punctuation-fg` | `token` | `color` | `kind=punctuation` | `--xh-fg-subtle` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-px` | `fold-trigger`<br>`line`<br>`line-content`<br>`line-number`<br>`root` | `padding-inline`<br>`padding-inline-end`<br>`padding-inline-start` | `default`<br>`line-numbers`<br>`not([data-line-numbers])` | `--xh-space-3` | code-view 的 fold-trigger、line、line-content、line-number、root 部件 padding-inline、padding-inline-end、padding-inline-start 覆盖槽。 |
| `--xh-code-view-py` | `pre` | `padding-block` | `default` | `--xh-space-3` | code-view 的 pre 部件 padding-block 覆盖槽。 |
| `--xh-code-view-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | code-view 的 root 部件 border-radius 覆盖槽。 |
| `--xh-code-view-shadow` | `root` | `box-shadow` | `default` | `--xh-elevation-raised` | code-view 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-code-view-string-fg` | `token` | `color` | `kind=string` | `--xh-syntax-string` | code-view 的 token 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[剪贴板](./clipboard)配合提供复制；要非受控的折叠就套[折叠面板](./collapsible)。
  把剪贴板三件放进 `header`，再用 `--xh-clipboard-copy-trigger-border: transparent`、
  `--xh-clipboard-copy-trigger-bg: transparent`、`--xh-clipboard-copy-trigger-h: var(--xh-control-h-sm)`
  三个槽把按钮压成头部里的安静形态。
- 内建词法只分注释、字符串、数字、关键字、标点五档。要区分函数名、类型名、属性名这类精度，
  就自己实现 `highlighter` 端口（同步纯函数，接 Shiki 之类）传进来，皮肤按记号种类上色的那套照旧生效。
- 放进 AI 回复正文时由[流式正文](./markdown-stream)把代码块交过来。

## 最佳实践

- 标出语言：读者与着色器都需要它。
- 高亮行用来点出「看这里」，不要一次点亮半屏。
- 折叠阈值取十几行：再少读者每次都要展开，再多就失去了折叠的意义。

## 反模式

- 把代码放进普通段落里：空白与换行会被折叠掉。
- 用行号当锚点做跳转：它是画上去的，DOM 里选不中。
