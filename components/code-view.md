来源：https://ui.docs.xihanfun.com/components/code-view

# CodeView 代码视图

一段代码的逐行呈现：行号、指定行高亮、超长折叠、按语法块折叠、文件名，可选语法着色，支持流式追加时的未闭合状态。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/code-view" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/code-view.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/code-view" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/code-view" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/code-view.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

代码原文由宿主提供，组件切出逐行结构并铺设记号；渲染文件名后它即成为代码块的可访问名

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

## 组件结构

加粗的是必需部件。

`data-scope="code-view"`：**`root`** · `header` · `filename` · `lang-label` · **`pre`** · **`code`** · `line` · `line-number` · `line-content` · `token` · `fold-trigger` · `line-fold-trigger`

## 示例

### 行号与高亮行

行号由皮肤绘制，复制代码不会带上它；高亮行按行号写，与 startLine 对齐

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

clamped 是纯受控的：组件只发意图，是否落实由宿主决定，便于全部展开这类操作统一持有

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

代码仍在写入时默认不着色：不完整代码的词法本就不稳定，每来一个字符整块变色比不着色更差

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

复制交给剪贴板：把它放进头部条，用几个槽把描边按钮压为安静形态，1500 毫秒后自动回落

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

着色是可替换的端口：无法识别的语言退回纯文本，接入自己的实现时组件侧无需修改，传 null 则整个关闭

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

未闭合默认不着色；确需着色时开启 highlight-while-streaming，同一段不完整代码的两种呈现并排对照

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

size 切换字号、行高与内边距三档，行号槽与折叠按钮随之变化

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

### 头部下载

下载交给下载触发器：放进头部条，文件名沿用代码的文件名，写出的是原文

```vue
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import {
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhDownloadTrigger,
  XhIcon,
} from "@xihan-ui/vue";

const filename = "retry.ts";
const sample = `export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
  let last: unknown
  for (let i = 0; i < times; i++) {
    try {
      return await run()
    }
    catch (error) {
      last = error
    }
  }
  throw last
}`;
</script>

<template>
  <XhCodeViewRoot :code="sample" lang="typescript" :filename="filename" complete style="inline-size: 100%;">
    <XhCodeViewHeader>
      <!-- 文件名占满剩余宽度，下载按钮自然被推到头部条末端 -->
      <XhCodeViewFilename />
      <XhDownloadTrigger :data="sample" :file-name="filename" variant="ghost" size="sm">
        <XhIcon :icon="DownloadIcon" /> 下载
      </XhDownloadTrigger>
    </XhCodeViewHeader>
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
```

```html
<xh-code-view id="code-view-download" code-lang="typescript" filename="retry.ts" complete style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="header">
      <!-- 文件名占满剩余宽度，下载按钮自然被推到头部条末端 -->
      <span data-xh-part="filename">retry.ts</span>
      <!-- 嵌套的 xh-* 子树由外层元素跳过，两个宿主各接各的角色节点 -->
      <xh-download-trigger id="code-view-download-trigger" file-name="retry.ts" variant="ghost" size="sm">
        <button data-xh-part="root">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10L12 15L17 10"/><path d="M12 3V15"/></svg>
          下载
        </button>
      </xh-download-trigger>
    </div>
    <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
  </div>
</xh-code-view>

<script type="module">
  // 同一份原文交给两个元素：代码视图铺行，下载触发器写文件
  const sample = `export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
  let last: unknown
  for (let i = 0; i < times; i++) {
    try {
      return await run()
    }
    catch (error) {
      last = error
    }
  }
  throw last
}`;
  document.getElementById("code-view-download").code = sample;
  document.getElementById("code-view-download-trigger").data = sample;
</script>
```

### 按块折叠

block-folding 按缩进找出语法块，块头行首给一颗折叠钮；折叠集合写块头的行号，可受控（folded）也可非受控（default-folded）；一组钮只占一个 Tab 位、上下方向键在组内走

```vue
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const sample = `export function createQueue<T>(limit: number) {
  const pending: T[] = []

  function push(item: T) {
    if (pending.length >= limit) {
      pending.shift()
    }
    pending.push(item)
  }

  function drain(handle: (item: T) => void) {
    while (pending.length > 0) {
      handle(pending.shift()!)
    }
  }

  return { push, drain }
}`;

// 受控写法：v-model:folded 拿到折叠着的块头行号
const folded = ref([11]);
</script>

<template>
  <div style="display: grid; gap: 8px; inline-size: 100%">
    <XhCodeViewRoot
      v-model:folded="folded"
      :code="sample"
      lang="typescript"
      complete
      line-numbers
      block-folding
    >
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
    <span>折叠着的块头：{{ folded.length > 0 ? folded.join("、") : "无" }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 8px; inline-size: 100%">
  <xh-code-view id="code-view-block-folding" code-lang="typescript" complete line-numbers block-folding default-folded="11">
    <div data-xh-part="root">
      <!-- 行与折叠钮都由元素铺 -->
      <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
    </div>
  </xh-code-view>
  <span id="code-view-block-folding-state">折叠着的块头：11</span>
</div>

<script type="module">
  const view = document.getElementById("code-view-block-folding");
  const state = document.getElementById("code-view-block-folding-state");
  view.code = `export function createQueue<T>(limit: number) {
  const pending: T[] = []

  function push(item: T) {
    if (pending.length >= limit) {
      pending.shift()
    }
    pending.push(item)
  }

  function drain(handle: (item: T) => void) {
    while (pending.length > 0) {
      handle(pending.shift()!)
    }
  }

  return { push, drain }
}`;
  // 非受控：元素自己记着折叠集合，变化经 folded-change 报出来
  view.addEventListener("folded-change", (event) => {
    const { folded } = event.detail;
    state.textContent = `折叠着的块头：${folded.length > 0 ? folded.join("、") : "无"}`;
  });
</script>
```

## 设计指引

### 何时使用

- 在 AI 回复、文档、评审意见中展示代码，需要行号或需要指出某几行。
- 代码是流式生成的，需要边接收边渲染，闭合之后再着色。
- 代码较长，默认只显示前若干行。

### 何时不用

- 只是一小段行内标识时，使用[排印](./typography)的 `code` 形态。
- 展示运行日志时，使用[日志](./log)。
- 展示改动前后时，使用[差异视图](./diff-view)。

### 特性

- 逐行切分在连接层完成。一个记号可以横跨多行（未闭合的字符串与块注释），因此行号与高亮行不能由皮肤反推。
- `complete` 标记这段代码是否已经写完。未闭合时默认不着色：半截代码的词法不稳定，逐字符变色比不着色更差。
- `highlighter` 是着色端口，由宿主决定接入哪个着色器；返回 `null` 是合法结果，回到纯文本。适配器默认接 `@xihan-ui/code-highlight`，它是可选 peer：已安装时自动着色，未安装时保持纯文本。适配器显式传 `null` 时不请求默认模块；只有模块缺席才回到纯文本，已安装模块的加载或初始化异常照常抛出。
- 行号由皮肤用 `attr()` 绘制，复制代码不会带上行号，读屏也不会逐行读出数字。
- `clamped` 是纯受控的：折叠状态通常由外部“全部展开 / 全部折叠”统一持有，内建状态会与之冲突。
- `blockFolding` 按缩进折叠语法块：一行之下缩进更深的连续行（夹在中间的空行算在内）是它的块，块头行首出现折叠钮，收起后块头正文后面画一枚省略号。按缩进而不按括号配对，是为了不依赖语言：Python、YAML 这类没有括号的语言一样能折；花括号语言的收尾括号与块头同缩进，折叠后留在外面。缩进不规整的代码（压缩过的、混排制表符的）找不出有意义的块，这时不要开它。
- 折叠集合写块头的行号（随 `startLine`），`folded` 受控、`defaultFolded` 非受控，变化经 `folded-change` 报出；代码变了以后不再是块头的行号自动失效。收起的行不占高度，`pre` 预撑的行数按看得见的算。

### 组合

- 下载使用[下载触发器](./download-trigger)，同样放进 `header`，`data` 给原文、`fileName` 沿用文件名。
- 与[剪贴板](./clipboard)配合提供复制；需要非受控折叠时放入[折叠区域](./collapsible)。把剪贴板的三个部件放进 `header`，再用 `--xh-clipboard-copy-trigger-border: transparent`、`--xh-clipboard-copy-trigger-bg: transparent`、`--xh-clipboard-copy-trigger-h: var(--xh-control-h-sm)` 三个槽把按钮调整为头部内的低强调形态。
- 内建词法只区分注释、字符串、数字、关键字、标点五档。需要区分函数名、类型名、属性名时，自行实现 `highlighter` 端口（同步纯函数，可接 Shiki 等）传入，皮肤按记号种类上色的规则不变。
- 放进 AI 回复正文时由[流式正文](./markdown-stream)交付代码块。

### 最佳实践

- 标出语言，读者与着色器都需要它。
- 高亮行用于指出重点，不一次点亮半屏。
- 折叠阈值取十几行：过少时读者每次都要展开，过多时折叠失去意义。

### 反模式

- 把代码放进普通段落，空白与换行会被折叠。
- 用行号作为跳转锚点，它是绘制上去的，DOM 中不可选中。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-code-view>` |
| Vue 组件 | `XhCodeViewCode` `XhCodeViewFilename` `XhCodeViewFoldTrigger` `XhCodeViewHeader` `XhCodeViewLangLabel` `XhCodeViewPre` `XhCodeViewRoot` |
| 组合式函数 | `useCodeView` |
| 状态机 | `codeViewMachine` |
| 皮肤 | `@xihan-ui/styles/code-view.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | `string` | 是 |  |
| `lang` | `string` |  | 围栏语言标注，空白一律落为 plaintext。 |
| `filename` | `string` |  | 文件名，渲染在 header 中；渲染之后它即为 pre 的可访问名。 |
| `labelled` | `boolean` |  | 作者渲染了 filename 部件时置真，由适配器统计而不是判断 filename 是否有值。 为假时 pre 用 translations.code 兜底：指向未渲染的 id 会使读屏读空。 |
| `complete` | `boolean` |  | 代码是否已闭合，未闭合时按行数预撑高度且默认不着色。 |
| `wrap` | `boolean` |  | 长行自动换行，默认关闭（长行横向滚动）。 |
| `lineNumbers` | `boolean` |  | 渲染行号槽。 |
| `startLine` | `number` |  | 首行的行号，默认 1；摘录与 patch 片段需要使用。 |
| `highlightLines` | `string \| readonly number[]` |  | 要高亮的行号，写为 `'3,7-9'` 或行号数组；非法片段丢弃不报错。 |
| `clamp` | `number` |  | 超过该行数才视为可折叠。 |
| `clamped` | `boolean` |  | 折叠态，纯受控：没有 defaultClamped，需要非受控时套用 collapsible。 |
| `blockFolding` | `boolean` |  | 按缩进找出语法块，块头那一行的行首给一颗折叠钮，默认关闭。 一行之下缩进更深的连续行（夹在中间的空行算在内）是它的块；与语言无关， 花括号语言的收尾括号与块头同缩进，折叠后留在外面。 |
| `folded` | `readonly number[]` |  | 折叠着的块，写块头的行号（受 startLine 影响）；受控。不是块头的行号忽略。 |
| `defaultFolded` | `readonly number[]` |  | 非受控时一开始就折叠着的块，写法同 folded。 |
| `onFoldedChange` | `(details: CodeViewFoldedChangeDetails) => void` |  | 语法块的折叠集合变化。 |
| `highlighter` | `HighlighterPort` |  | 着色实现。未提供时为纯文本，提供后也允许返回 null（语言未识别等），同样回退为纯文本。 未闭合的块默认不着色，见 {@link highlightWhileStreaming}。 |
| `highlightWhileStreaming` | `boolean` |  | 块尚未闭合时也着色，默认 false。 默认关闭是因为未闭合代码的词法本身不稳定：引号、括号随时会配对， 每到一个 token 整块变一次色，比不着色更差。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<CodeViewTranslations>` |  |  |
| `onClampToggle` | `(details: CodeViewClampToggleDetails) => void` |  | 折叠态切换的意图回调；clamped 是纯受控的，是否落定由宿主决定。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `clamp-toggle` | `CustomEvent` | 折叠态切换的意图；detail 为 `{ clamped: boolean }` |
| `folded-change` | `CustomEvent` | 语法块的折叠集合变化；detail 为 `{ folded: number[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCodeViewCode` | `line` | `CodeViewLineSlotProps` |  |
| `XhCodeViewRoot` | `default` | `CodeViewRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhCodeViewCode` | `children` | `SlotChildren<CodeViewLineSlotProps>` |  | 逐行接管该行的正文；未提供时按着色结果铺设。 |
| `XhCodeViewFilename` | `filename` | `string` |  | 未写 children 时显示它；也没给时取 XhCodeViewRoot 上的 filename。 |
| `XhCodeViewRoot` | `children` | `SlotChildren<CodeViewRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `fold-trigger` | 'closed' \| 'open' |
| `line-fold-trigger` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`PRESS.START` · `PRESS.END` · `FOLD.TOGGLE` · `FOLD.FOCUS`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `lang` | `string` |  |
| `filename` | `string \| undefined` | 文件名；filename 部件没写内容时显示它。 |
| `lineCount` | `number` |  |
| `lines` | `readonly CodeLine[]` | 逐行切分后的文本与记号片段。 |
| `lineNumberAt` | `(index: number) => number` | 每行的行号，与 lines 同序。 |
| `lineNumbers` | `boolean` | 是否渲染行号槽；适配器据此决定是否创建该节点。 |
| `foldable` | `boolean` | 折叠可用：提供了正数 clamp 且行数确实超过它。 |
| `clamped` | `boolean` |  |
| `setClamped` | `(next: boolean) => void` | 发出一次折叠意图；与当前态相同时不发。 |
| `foldRegions` | `readonly CodeViewFoldRegion[]` | 按缩进找出的语法块，按块头先后排；blockFolding 关闭时为空。 |
| `folded` | `readonly number[]` | 折叠着的块，写块头的行号，升序；只含当下确实是块头的行号。 |
| `isFoldStart` | `(index: number) => boolean` | 该行是不是某个语法块的块头；适配器据此决定要不要在行首建折叠钮。 |
| `toggleFold` | `(line: number) => void` | 翻转一个语法块的折叠，line 是块头的行号；不是块头时不做事。 |
| `getLineFoldTriggerProps` | `(props: CodeViewLineProps) => T['button']` |  |
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

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 代码块在 Tab 序列中 | &lt;pre&gt; 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管 |
| `Enter` / `Space` | 焦点在折叠按钮上 | 翻面折叠态并发出意图；组件只接 click，按键走原生 button 的默认行为 |
| `Enter` / `Space` | 按住折叠按钮且代码可折叠 | 按住期间 fold-trigger 投影 data-pressed，与指针 :active 同一副按压面（disclosure trigger 只换面不缩放）；抬起、失焦或折叠条收起撤下 |
| `Tab` | 开了按块折叠 | 一组行首折叠钮只占一个 Tab 位：落在上次聚焦的那颗，它被收起或不再是块头时落在第一颗看得见的钮上 |
| `Enter` / `Space` | 焦点在行首折叠钮上 | 折叠或展开这个语法块，走原生 button 的激活 |
| `ArrowDown` / `ArrowUp` | 焦点在行首折叠钮上 | 移到下一颗 / 上一颗看得见的折叠钮，收起在块里的跳过；到头不回绕 |
| `Home` / `End` | 焦点在行首折叠钮上 | 移到第一颗 / 最后一颗看得见的折叠钮 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `lang-label` | `aria-hidden` | 'true' |
| `pre` | `role` | 'group' |
| `line-number` | `aria-hidden` | 'true' |
| `fold-trigger` | `aria-controls` | `pre` 部件的 id |
| `fold-trigger` | `aria-expanded` | 'false' \| 'true' |
| `fold-trigger` | `aria-label` | translations.expand \| translations.collapse |
| `line-fold-trigger` | `aria-expanded` | 'true' \| 'false' |
| `line-fold-trigger` | `aria-label` | undefined \| foldLabel(lineNumberAt(region.start + 1), lineNumberA… |

- `pre` 可聚焦并带可访问名称：渲染了文件名时指向它，否则使用 `translations.code`。
- 折叠按钮带 `aria-expanded` 与 `aria-controls`，指向 `pre`。
- 行首折叠钮合起来只占一个 Tab 位，上下方向键在看得见的钮之间走，Home / End 到首末；名字写这个块收起的是哪几行（`translations.foldBlock`），开合由 `aria-expanded` 表达。
- 语言角标与行号槽都对读屏隐藏，它们是装饰而非内容。

## 样式参考

### 皮肤

`@xihan-ui/styles/code-view.css` 按 `[data-scope="code-view"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-code-view` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-block-folding` | ''（条件成立时才出现） |
| `root` | `data-clamped` | ''（条件成立时才出现） |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-digits` | String(Math.min( String(lineNumberAt(lineCount - 1)).… |
| `root` | `data-foldable` | ''（条件成立时才出现） |
| `root` | `data-lang` | prop('lang')?.trim() \|\| CODE_VIEW_FALLBACK_LANG |
| `root` | `data-line-numbers` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `pre` | `data-complete` | ''（条件成立时才出现） |
| `pre` | `data-wrap` | ''（条件成立时才出现） |
| `code` | `data-lang` | prop('lang')?.trim() \|\| CODE_VIEW_FALLBACK_LANG |
| `code` | `data-wrap` | ''（条件成立时才出现） |
| `line` | `data-folded` | ''（条件成立时才出现） |
| `line` | `data-highlighted` | ''（条件成立时才出现） |
| `line` | `data-line-number` | String(lineNumberAt(index)) |
| `line-number` | `data-folded` | ''（条件成立时才出现） |
| `line-number` | `data-highlighted` | ''（条件成立时才出现） |
| `line-number` | `data-line-number` | String(lineNumberAt(index)) |
| `line-content` | `data-folded` | ''（条件成立时才出现） |
| `line-content` | `data-highlighted` | ''（条件成立时才出现） |
| `line-content` | `data-line-number` | String(lineNumberAt(index)) |
| `token` | `data-kind` | token.kind |
| `fold-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `fold-trigger` | `data-state` | 'closed' \| 'open' |
| `fold-trigger` | `data-xh-action-control` | '' |
| `fold-trigger` | `data-xh-action-display` | 'always' |
| `fold-trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `fold-trigger` | `data-xh-action-size` | props.size |
| `fold-trigger` | `data-xh-action-variant` | 'ghost' |
| `line-fold-trigger` | `data-state` | 'open' \| 'closed' |
| `line-fold-trigger` | `data-xh-action-control` | '' |
| `line-fold-trigger` | `data-xh-action-display` | 'always' |
| `line-fold-trigger` | `data-xh-action-profile` | 'icon' |
| `line-fold-trigger` | `data-xh-action-size` | props.size |
| `line-fold-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-code-view-bg` | `root` | `background` | `default` | `--xh-bg-surface` | code-view 的 root 部件 background 覆盖槽。 |
| `--xh-code-view-border` | `root` | `border` | `default` | `--xh-border-default` | code-view 的 root 部件 border 覆盖槽。 |
| `--xh-code-view-comment-fg` | `token` | `color` | `kind=comment` | `--xh-fg-muted` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-fg` | `root` | `color` | `default` | `--xh-fg-muted` | code-view 的 root 部件 color 覆盖槽。 |
| `--xh-code-view-filename-fg` | `filename` | `color` | `default` | `--xh-fg-default` | code-view 的 filename 部件 color 覆盖槽。 |
| `--xh-code-view-fold-bg-hover` | `fold-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | code-view 的 fold-trigger 部件 background-color 覆盖槽。 |
| `--xh-code-view-fold-col` | `line-content`<br>`line-fold-trigger`<br>`root` | `block-size`<br>`inline-size`<br>`min-block-size`<br>`min-inline-size`<br>`padding-inline-start` | `block-folding`<br>`line-numbers`<br>`not([data-line-numbers])`<br>`xh-action-profile=disclosure-trigger`<br>`xh-action-profile=icon` | `--xh-code-view-line-height` | code-view 的 line-content、line-fold-trigger、root 部件 block-size、inline-size、min-block-size、min-inline-size、padding-inline-start 覆盖槽。 |
| `--xh-code-view-fold-fg` | `fold-trigger` | `color` | `default` | `--xh-fg-muted` | code-view 的 fold-trigger 部件 color 覆盖槽。 |
| `--xh-code-view-fold-py` | `fold-trigger` | `padding-block` | `xh-action-profile=disclosure-trigger` | `--xh-space-2` | code-view 的 fold-trigger 部件 padding-block 覆盖槽。 |
| `--xh-code-view-folded-fg` | `line-content` | `background-color` | `folded` | `--xh-fg-subtle` | code-view 的 line-content 部件 background-color 覆盖槽。 |
| `--xh-code-view-folded-gap` | `line-content` | `margin-inline-start` | `folded` | `--xh-space-1` | code-view 的 line-content 部件 margin-inline-start 覆盖槽。 |
| `--xh-code-view-font` | `code`<br>`filename` | `font-family` | `default` | `--xh-font-family-mono` | code-view 的 code、filename 部件 font-family 覆盖槽。 |
| `--xh-code-view-font-size` | `root` | `font-size` | `default` | `--xh-_code-view-font-size` | code-view 的 root 部件 font-size 覆盖槽。 |
| `--xh-code-view-gutter-border` | `line-number` | `border-inline-end` | `default` | `--xh-border-subtle` | code-view 的 line-number 部件 border-inline-end 覆盖槽。 |
| `--xh-code-view-gutter-gap` | `line-number` | `padding-inline-end` | `default` | `--xh-space-1` | code-view 的 line-number 部件 padding-inline-end 覆盖槽。 |
| `--xh-code-view-header-border` | `fold-trigger`<br>`header` | `border`<br>`border-block-end`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-subtle` | code-view 的 fold-trigger、header 部件 border、border-block-end、border-color 覆盖槽。 |
| `--xh-code-view-header-fg` | `header` | `color` | `default` | `--xh-fg-muted` | code-view 的 header 部件 color 覆盖槽。 |
| `--xh-code-view-header-font-size` | `fold-trigger`<br>`header` | `font-size` | `default` | `--xh-text-secondary-size` | code-view 的 fold-trigger、header 部件 font-size 覆盖槽。 |
| `--xh-code-view-header-gap` | `header` | `gap` | `default` | `--xh-space-2` | code-view 的 header 部件 gap 覆盖槽。 |
| `--xh-code-view-header-h` | `header` | `min-block-size` | `default` | `--xh-control-h-lg` | code-view 的 header 部件 min-block-size 覆盖槽。 |
| `--xh-code-view-header-px` | `header` | `padding-inline` | `default` | `--xh-space-4` | code-view 的 header 部件 padding-inline 覆盖槽。 |
| `--xh-code-view-header-py` | `header` | `padding-block` | `default` | `--xh-space-2` | code-view 的 header 部件 padding-block 覆盖槽。 |
| `--xh-code-view-highlight-bar` | `line` | `box-shadow`<br>`outline`<br>`outline-offset` | `@media print`<br>`highlighted` | `--xh-stroke-thick` | code-view 的 line 部件 box-shadow、outline、outline-offset 覆盖槽。 |
| `--xh-code-view-highlight-bg` | `line` | `background` | `highlighted` | `--xh-bg-subtle` | code-view 的 line 部件 background 覆盖槽。 |
| `--xh-code-view-highlight-fg` | `line` | `box-shadow` | `highlighted` | `--xh-border-strong` | code-view 的 line 部件 box-shadow 覆盖槽。 |
| `--xh-code-view-icon-size` | `line-fold-trigger` | `--xh-icon-size` | `default` | `--xh-glyph-size-sm` | code-view 的 line-fold-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-code-view-keyword-fg` | `token` | `color` | `kind=keyword` | `--xh-syntax-keyword` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-keyword-weight` | `token` | `font-weight` | `kind=keyword` | `--xh-font-weight-semibold` | code-view 的 token 部件 font-weight 覆盖槽。 |
| `--xh-code-view-label-fg` | `lang-label` | `color` | `default` | `--xh-fg-subtle` | code-view 的 lang-label 部件 color 覆盖槽。 |
| `--xh-code-view-label-font-size` | `lang-label` | `font-size` | `default` | `--xh-text-caption-size` | code-view 的 lang-label 部件 font-size 覆盖槽。 |
| `--xh-code-view-line-fold-trigger-fg` | `line-fold-trigger` | `color` | `default` | `--xh-fg-subtle` | code-view 的 line-fold-trigger 部件 color 覆盖槽。 |
| `--xh-code-view-line-fold-trigger-radius` | `line-fold-trigger` | `border-radius` | `default` | `--xh-shape-control` | code-view 的 line-fold-trigger 部件 border-radius 覆盖槽。 |
| `--xh-code-view-line-height` | `line`<br>`line-content`<br>`line-fold-trigger`<br>`pre`<br>`root` | `block-size`<br>`inline-size`<br>`line-height`<br>`min-block-size`<br>`min-inline-size`<br>`padding-inline-start` | `block-folding`<br>`default`<br>`line-numbers`<br>`not([data-line-numbers])`<br>`xh-action-profile=disclosure-trigger`<br>`xh-action-profile=icon` | `--xh-text-code-leading` | code-view 的 line、line-content、line-fold-trigger、pre、root 部件 block-size、inline-size、line-height、min-block-size、min-inline-size、padding-inline-start 覆盖槽。 |
| `--xh-code-view-number-fg` | `line-number` | `color` | `default` | `--xh-fg-subtle` | code-view 的 line-number 部件 color 覆盖槽。 |
| `--xh-code-view-number-font-size` | `line-number` | `font-size` | `default` | `--xh-text-caption-size` | code-view 的 line-number 部件 font-size 覆盖槽。 |
| `--xh-code-view-number-token-fg` | `token` | `color` | `kind=number` | `--xh-syntax-number` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-punctuation-fg` | `token` | `color` | `kind=punctuation` | `--xh-fg-subtle` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-px` | `fold-trigger`<br>`line`<br>`line-content`<br>`line-fold-trigger`<br>`line-number`<br>`root` | `inset-inline-start`<br>`padding-inline`<br>`padding-inline-end`<br>`padding-inline-start` | `block-folding`<br>`default`<br>`line-numbers`<br>`not([data-line-numbers])` | `--xh-space-3` | code-view 的 fold-trigger、line、line-content、line-fold-trigger、line-number、root 部件 inset-inline-start、padding-inline、padding-inline-end、padding-inline-start 覆盖槽。 |
| `--xh-code-view-py` | `pre` | `padding-block` | `default` | `--xh-space-3` | code-view 的 pre 部件 padding-block 覆盖槽。 |
| `--xh-code-view-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | code-view 的 root 部件 border-radius 覆盖槽。 |
| `--xh-code-view-shadow` | `root` | `box-shadow` | `default` | `none` | code-view 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-code-view-string-fg` | `token` | `color` | `kind=string` | `--xh-syntax-string` | code-view 的 token 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 披露（见[动效规范](../design/motion#角色)）。

`background-color` · `box-shadow` · `rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走。
