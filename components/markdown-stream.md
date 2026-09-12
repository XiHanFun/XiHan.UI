来源：https://ui.docs.xihanfun.com/components/markdown-stream

# MarkdownStream `流式正文`

把已经渲好的 Markdown 块列表投影成带稳定 key 的正文结构，按块的种类分流。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/markdown-stream" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/markdown-stream.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/markdown-stream" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/markdown-stream" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/markdown-stream.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

块列表由宿主用流式渲染器得到，组件只按 key 铺开、按种类分流

```vue
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/vue";
import { shallowRef } from "vue";

const article = `## 结论

先给**结论**：这段正文是一次性渲好的。

- 块列表由渲染器产出
- 每块带一个稳定的 key
`;

// 渲染器是有状态的，谁持有谁负责：一个实例只喂同一条消息的全文
const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>(
  renderer.render(article, { ended: true }) as readonly MarkdownBlock[],
);
</script>

<template>
  <XhMarkdownStreamRoot :blocks="blocks" style="inline-size: 100%;">
    <XhMarkdownStreamContent />
  </XhMarkdownStreamRoot>
</template>
```

```html
<xh-markdown-stream id="markdown-stream-basic" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="content"></div>
  </div>
</xh-markdown-stream>

<script type="module">
  // 真实应用里这份数组来自 @xihan-ui/markdown 的 createStreamRenderer().render(全文)；
  // 这份示例是裸 HTML，没有打包器，所以把渲染器的产出直接写在这里
  const stream = document.getElementById("markdown-stream-basic");
  stream.blocks = [
    { key: "0:a", kind: "markdown", html: "<h2>结论</h2>", complete: true },
    {
      key: "1:b",
      kind: "markdown",
      html: "<p>先给<strong>结论</strong>：这段正文是一次性渲好的。</p>",
      complete: true,
    },
    {
      key: "2:c",
      kind: "markdown",
      html: "<ul>\n<li>块列表由渲染器产出</li>\n<li>每块带一个稳定的 key</li>\n</ul>",
      complete: true,
    },
  ];
</script>
```

## 示例

### 流式增长

只有生长中的那一块每帧重渲，定型的块 key 不变、节点原地留着，选区与滚动位置才保得住

```vue
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamLiveRegion, XhMarkdownStreamRoot } from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, shallowRef } from "vue";

const article = `## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`;

const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>([]);
const streaming = shallowRef(true);

let at = 0;
let timer = 0;
function tick() {
  at = Math.min(at + 3, article.length);
  const ended = at >= article.length;
  blocks.value = renderer.render(article.slice(0, at), { ended }) as readonly MarkdownBlock[];
  streaming.value = !ended;
  if (!ended)
    timer = window.setTimeout(tick, 70);
}
// 挂载后才开始追加：<script setup> 顶层在服务端渲染时也执行，那里没有 window
onMounted(tick);

onBeforeUnmount(() => {
  window.clearTimeout(timer);
  renderer.dispose();
});
</script>

<template>
  <!-- announce 开着，写完那一刻在播报区念一句；还在写的时候不念 -->
  <XhMarkdownStreamRoot
    :blocks="blocks"
    :streaming="streaming"
    announce="polite"
    style="inline-size: 100%;"
  >
    <XhMarkdownStreamContent />
    <XhMarkdownStreamLiveRegion />
  </XhMarkdownStreamRoot>
</template>
```

```html
<xh-markdown-stream id="markdown-stream-streaming" streaming announce="polite" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="content"></div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-markdown-stream>

<script type="module">
  // 真实应用里这份数组来自 @xihan-ui/markdown 的渲染器；这里手写两块来演示 key 的作用：
  // 第一块 key 不变、节点原地留着，末块 key 恒为 live、每帧重渲
  const stream = document.getElementById("markdown-stream-streaming");
  const full = "每来一批字符只重渲最后一块。";

  let at = 0;
  const tick = () => {
    if (!stream.isConnected) return;
    at = Math.min(at + 3, full.length);
    const ended = at >= full.length;
    stream.blocks = [
      { key: "0:a", kind: "markdown", html: "<h2>增量渲染</h2>", complete: true },
      {
        key: ended ? "1:b" : "live",
        kind: "markdown",
        html: `<p>${full.slice(0, at)}</p>`,
        complete: ended,
      },
    ];
    stream.toggleAttribute("streaming", !ended);
    if (!ended) setTimeout(tick, 70);
  };
  tick();
</script>
```

### 代码块交给代码视图

markdown 块铺 html，代码块拿 source 交出去——照 html 渲会让同一段代码出现两次

```vue
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import {
  XhCodeViewCode,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhMarkdownStreamContent,
  XhMarkdownStreamRoot,
} from "@xihan-ui/vue";
import { shallowRef } from "vue";

const article = `先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`;

const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>(
  renderer.render(article, { ended: true }) as readonly MarkdownBlock[],
);
</script>

<template>
  <XhMarkdownStreamRoot :blocks="blocks" style="inline-size: 100%;">
    <XhMarkdownStreamContent>
      <!-- 只接管代码块，其余块留给组件按 html 铺 -->
      <template #block="{ block }">
        <XhCodeViewRoot
          v-if="block.kind === 'code'"
          :code="block.source ?? ''"
          :lang="block.lang"
          :complete="block.complete"
          line-numbers
        >
          <XhCodeViewPre>
            <XhCodeViewCode />
          </XhCodeViewPre>
        </XhCodeViewRoot>
        <div v-else v-html="block.html" />
      </template>
    </XhMarkdownStreamContent>
  </XhMarkdownStreamRoot>
</template>
```

```html
<xh-markdown-stream id="markdown-stream-code" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="content"></div>
  </div>
</xh-markdown-stream>

<script type="module">
  // 元素只把代码块的原文当正文铺出来；要交给 <xh-code-view> 就自己看住那个块节点。
  // 判据用 data-kind，它是元素打在块上的
  const stream = document.getElementById("markdown-stream-code");
  const code = [
    "export function clamp(n: number, min: number, max: number) {",
    "  return Math.min(Math.max(n, min), max)",
    "}",
  ].join("\n");

  stream.blocks = [
    { key: "0:a", kind: "markdown", html: "<p>先看这段实现：</p>", complete: true },
    { key: "1:b", kind: "code", html: "", complete: true, lang: "typescript", source: code },
    { key: "2:c", kind: "markdown", html: "<p>两端都夹住，越界的输入不会漏过去。</p>", complete: true },
  ];

  // 元素铺完块之后把代码那一格换成 <xh-code-view>
  requestAnimationFrame(() => {
    const slot = stream.querySelector('[data-xh-part="block"][data-kind="code"]');
    if (!slot) return;
    slot.textContent = "";
    const view = document.createElement("xh-code-view");
    view.setAttribute("code", code);
    view.setAttribute("code-lang", "typescript");
    view.setAttribute("complete", "");
    view.setAttribute("line-numbers", "");
    view.innerHTML =
      '<div data-xh-part="root"><pre data-xh-part="pre"><code data-xh-part="code"></code></pre></div>';
    slot.appendChild(view);
  });
</script>
```

### 流式光标

一块都还没来的时候光标就已经在了，caret 设成 false 可以整个关掉

```vue
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/vue";

// 生长中的那一块 key 恒为 live，光标画在它末尾
const growing: readonly MarkdownBlock[] = [
  { key: "live", kind: "markdown", html: "<p>正在写的这一句。</p>", complete: false },
];

const cases: { label: string; blocks: readonly MarkdownBlock[]; caret: boolean }[] = [
  { label: "等第一个字：块列表还是空的", blocks: [], caret: true },
  { label: "正在出字：光标停在生长块末尾", blocks: growing, caret: true },
  { label: "caret 设成 false：一竖都不画", blocks: growing, caret: false },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div v-for="item in cases" :key="item.label">
      <p>{{ item.label }}</p>
      <XhMarkdownStreamRoot :blocks="item.blocks" :caret="item.caret" streaming>
        <XhMarkdownStreamContent />
      </XhMarkdownStreamRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 16px">
  <div>
    <p>等第一个字：块列表还是空的</p>
    <xh-markdown-stream id="markdown-stream-caret-waiting" streaming>
      <div data-xh-part="root">
        <div data-xh-part="content"></div>
      </div>
    </xh-markdown-stream>
  </div>
  <div>
    <p>正在出字：光标停在生长块末尾</p>
    <xh-markdown-stream id="markdown-stream-caret-growing" streaming>
      <div data-xh-part="root">
        <div data-xh-part="content"></div>
      </div>
    </xh-markdown-stream>
  </div>
  <div>
    <p>caret 设成 false：一竖都不画</p>
    <xh-markdown-stream id="markdown-stream-caret-off" streaming caret="false">
      <div data-xh-part="root">
        <div data-xh-part="content"></div>
      </div>
    </xh-markdown-stream>
  </div>
</div>

<script type="module">
  // 生长中的那一块 key 恒为 live，光标画在它末尾
  const growing = [
    { key: "live", kind: "markdown", html: "<p>正在写的这一句。</p>", complete: false },
  ];

  document.getElementById("markdown-stream-caret-waiting").blocks = [];
  document.getElementById("markdown-stream-caret-growing").blocks = growing;
  document.getElementById("markdown-stream-caret-off").blocks = growing;
</script>
```

### 尺寸

size 换正文字号与块间距，三档共用同一份块列表

```vue
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/vue";
import { shallowRef } from "vue";

const article = `## 结论

先给**结论**：这段正文是一次性渲好的。
`;

const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>(
  renderer.render(article, { ended: true }) as readonly MarkdownBlock[],
);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhMarkdownStreamRoot
      v-for="size in ['sm', 'md', 'lg']"
      :key="size"
      :blocks="blocks"
      :size="size"
      style="inline-size: 100%"
    >
      <XhMarkdownStreamContent />
    </XhMarkdownStreamRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-markdown-stream class="markdown-stream-size" size="sm" style="inline-size: 100%">
    <div data-xh-part="root">
      <div data-xh-part="content"></div>
    </div>
  </xh-markdown-stream>

  <xh-markdown-stream class="markdown-stream-size" style="inline-size: 100%">
    <div data-xh-part="root">
      <div data-xh-part="content"></div>
    </div>
  </xh-markdown-stream>

  <xh-markdown-stream class="markdown-stream-size" size="lg" style="inline-size: 100%">
    <div data-xh-part="root">
      <div data-xh-part="content"></div>
    </div>
  </xh-markdown-stream>
</div>

<script type="module">
  // 真实应用里这份数组来自 @xihan-ui/markdown 的 createStreamRenderer().render(全文)；
  // 这份示例是裸 HTML，没有打包器，所以把渲染器的产出直接写在这里
  const blocks = [
    { key: "0:a", kind: "markdown", html: "<h2>结论</h2>", complete: true },
    {
      key: "1:b",
      kind: "markdown",
      html: "<p>先给<strong>结论</strong>：这段正文是一次性渲好的。</p>",
      complete: true,
    },
  ];
  for (const stream of document.querySelectorAll(".markdown-stream-size")) stream.blocks = blocks;
</script>
```

## 设计指引

### 何时使用

- 展示 AI 回复的正文，且正文是边生成边显示的。
- 正文里混着代码块与公式，需要各自交给专门的组件渲染。

### 何时不用

- 正文是一次性拿到的静态文档：直接渲染就好，不必经过流式内核。
- 只是一段纯文本：用[排印](./typography)。

### 特性

- **组件不解析 Markdown，也不持有渲染器。** 块列表由宿主调 `@xihan-ui/markdown` 的
  `createStreamRenderer().render(全文)` 得到后传进来；渲染器是有状态的，谁持有谁负责。
- 块的 `key` 是稳定的：生长中的那一块 key 恒定，定型的块 key 不再变化。
  框架据此复用同一份 DOM 只改文本，用户每收到一个字都被重建节点的话，选区与滚动位置全丢。
- **`html` 只对 markdown 块有效。** 代码块拿 `source` 交给[代码视图](./code-view)，
  公式块拿 `source` 交给宿主自选的公式引擎；不接管的降级结果是把原文当正文显示。
- 流式光标是皮肤的 `::after`，不做成组件。它画在带 `data-caret` 的那一格上：
  正文在长的时候是生长的那一块，一块都还没来的时候是外壳，所以请求刚发出去、
  一个字都没到的那一段，页面上也有东西。`caret` 设成 `false` 时两处都不发这个属性。
- 光标在等第一个字的时候闪，出字之后停在实心：正文自己在动，再闪一下只是噪声。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-markdown-stream>` |
| Vue 组件 | `XhMarkdownStreamContent` `XhMarkdownStreamLiveRegion` `XhMarkdownStreamRoot` |
| 组合式函数 | `useMarkdownStream` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/markdown-stream.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="markdown-stream"`：**`root`** · **`content`** · `block` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `announce` | `'off' \| 'polite' \| 'assertive'` |  | 播报档位，默认 off——会话级播报区在消息流那一层，别在每条回复里各开一个。 |
| `blocks` | `readonly MarkdownBlock[]` | 是 | 已渲染好的块列表。 |
| `caret` | `boolean` |  | 画不画流式光标，默认画。设成 false 时 data-caret 一处都不发。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `streaming` | `boolean` |  | 这一段正文是否仍在增长，只落 data-streaming。 |
| `translations` | `Partial<MarkdownStreamTranslations>` |  |  |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMarkdownStreamContent` | `block` | `MarkdownStreamBlockSlotProps` |  |
| `XhMarkdownStreamRoot` | `default` | `MarkdownStreamRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'streaming' \| 'complete' |

## connect API

`useMarkdownStream` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `blocks` | `readonly MarkdownBlock[]` |  |
| `streaming` | `boolean` |  |
| `announcement` | `string \| undefined` | 播报文本；announce 为 off、或正文还在增长时为 undefined。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getBlockProps` | `(props: { block: MarkdownBlock }) => T['element']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
|  | 任何时候 | 组件不接管任何按键；块内的链接、代码块各自的停靠点由它们自己提供 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'assertive' \| 'polite' |
| `live-region` | `role` | 'alert' \| 'status' |

- 正文不套 role，也不做成活区——每来一个 token 播报一次会把读屏刷爆。
- 要在一段回复写完时播报一句，把 `announce` 设成 `polite` 并渲出播报区。
  一个会话里只该有一个活区，多开会互相打断。

## 样式

默认皮肤 `@xihan-ui/styles/markdown-stream.css` 按部件选择：`[data-scope="markdown-stream"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-caret` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'streaming' \| 'complete' |
| `block` | `data-caret` | ''（条件成立时才出现） |
| `block` | `data-complete` | ''（条件成立时才出现） |
| `block` | `data-kind` | block.kind |
| `block` | `data-lang` | block.lang |
| `block` | `data-live` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-markdown-stream-caret-bg` | `block`<br>`root` | `background` | `caret` | `--xh-fg-default` | markdown-stream 的 block、root 部件 background 覆盖槽。 |
| `--xh-markdown-stream-caret-duration` | `root` | `animation` | `caret` | `--xh-caret-duration` | markdown-stream 的 root 部件 animation 覆盖槽。 |
| `--xh-markdown-stream-caret-enter-duration` | `block` | `animation` | `caret` | `--xh-motion-duration-enter` | markdown-stream 的 block 部件 animation 覆盖槽。 |
| `--xh-markdown-stream-caret-gap` | `block`<br>`root` | `margin-inline-start` | `caret` | `0.1em` | markdown-stream 的 block、root 部件 margin-inline-start 覆盖槽。 |
| `--xh-markdown-stream-caret-h` | `block`<br>`root` | `block-size` | `caret` | `1.05em` | markdown-stream 的 block、root 部件 block-size 覆盖槽。 |
| `--xh-markdown-stream-caret-radius` | `block`<br>`root` | `border-radius` | `caret` | `--xh-shape-inset` | markdown-stream 的 block、root 部件 border-radius 覆盖槽。 |
| `--xh-markdown-stream-caret-shift` | `block`<br>`root` | `translate` | `caret` | `-0.5px` | markdown-stream 的 block、root 部件 translate 覆盖槽。 |
| `--xh-markdown-stream-caret-w` | `block`<br>`root` | `inline-size` | `caret` | `--xh-stroke-thick` | markdown-stream 的 block、root 部件 inline-size 覆盖槽。 |
| `--xh-markdown-stream-fg` | `root` | `color` | `default` | `--xh-fg-default` | markdown-stream 的 root 部件 color 覆盖槽。 |
| `--xh-markdown-stream-font-size` | `root` | `font-size` | `default` | `--xh-_markdown-stream-font-size` | markdown-stream 的 root 部件 font-size 覆盖槽。 |
| `--xh-markdown-stream-gap` | `content` | `gap` | `default` | `--xh-_markdown-stream-gap` | markdown-stream 的 content 部件 gap 覆盖槽。 |
| `--xh-markdown-stream-leading` | `root` | `line-height` | `default` | `--xh-text-prose-leading` | markdown-stream 的 root 部件 line-height 覆盖槽。 |
| `--xh-markdown-stream-mono` | `block` | `font-family` | `kind=code`<br>`kind=math` | `--xh-font-family-mono` | markdown-stream 的 block 部件 font-family 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-markdown-stream-caret` · `xh-markdown-stream-caret-in` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 代码块交给[代码视图](./code-view)，整段正文放进[消息流](./message-feed)的一条消息里。
- 逐字吐字的节奏由使用者驱动：`@xihan-ui/chat-stream` 的 `visibleLength` 是纯函数，
  时间原点与 rAF 循环由持有它的那一方写。
- 正文里要嵌行内来源角标、脚注这类节点：用 `block` 插槽接管那一块自己渲。
  组件不往已消毒的 html 里插节点，这条插槽就是留给这类需求的位置。

## 最佳实践

- 块列表整份传进来，别在外面切片：稳定 key 靠的就是整份列表的下标与内容。
- 代码块交出去时把 `complete` 一起带上，代码组件据此决定要不要着色。

## 反模式

- 每帧新建一个渲染器：缓存作废，长回复到后面会肉眼可见地卡。
- 把代码块的 `html` 与交给代码组件的那份同时渲出来：同一段代码会出现两次。
