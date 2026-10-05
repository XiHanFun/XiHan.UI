来源：https://ui.docs.xihanfun.com/components/citation

# Citation 引用来源 `alpha`

把回答中的行内引用、可展开的来源预览和文末来源列表连成同一套可访问关系。`@xihan-ui/chat-stream` 的 `SourcePart[]` 与 `sources` 结构兼容，可以直接传入。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/citation" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/citation.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/citation" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/citation" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/citation.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

SourcePart 直接驱动行内引用、来源预览和来源列表

```vue
<script setup lang="ts">
import type { CitationSource } from "@xihan-ui/headless";
import {
  XhCitationList,
  XhCitationPreview,
  XhCitationRoot,
  XhCitationText,
  XhCitationTrigger,
} from "@xihan-ui/vue";

const sources: CitationSource[] = [
  {
    type: "source-url",
    sourceId: "report",
    title: "2026 design systems report",
    url: "https://example.com/report",
    anchors: [{ sourceId: "report", quote: "Shared primitives reduce product inconsistency." }],
  },
  {
    type: "source-document",
    sourceId: "spec",
    title: "Accessibility specification",
    mediaType: "application/pdf",
    anchors: [{ sourceId: "spec", quote: "Relationships must remain available to assistive technology." }],
  },
];
</script>

<template>
  <XhCitationRoot :sources="sources">
    <XhCitationText>
      共享原语可以减少产品之间的不一致
      <XhCitationTrigger source-id="report" citation-id="claim-report">1</XhCitationTrigger>，
      明确的可访问关系让引用在键盘与读屏中仍可追踪
      <XhCitationTrigger source-id="spec" citation-id="claim-spec">2</XhCitationTrigger>。
    </XhCitationText>
    <XhCitationPreview v-for="source in sources" :key="source.sourceId" :source-id="source.sourceId" />
    <XhCitationList />
  </XhCitationRoot>
</template>
```

```html
<xh-citation id="citation-basic">
  <div data-xh-part="root">
    <p data-xh-part="text">
      共享原语可以减少产品之间的不一致
      <button data-xh-part="trigger" value="report" name="claim-report">1</button>，
      明确的可访问关系让引用在键盘与读屏中仍可追踪
      <button data-xh-part="trigger" value="spec" name="claim-spec">2</button>。
    </p>

    <section data-xh-part="preview" value="report">
      <header data-xh-part="preview-header">
        <span>
          <strong data-xh-part="preview-title">2026 design systems report</strong>
          <span data-xh-part="preview-meta">example.com</span>
        </span>
        <button data-xh-part="dismiss-trigger"></button>
      </header>
      <blockquote data-xh-part="quote">Shared primitives reduce product inconsistency.</blockquote>
      <a data-xh-part="preview-link">Open source</a>
    </section>

    <section data-xh-part="preview" value="spec">
      <header data-xh-part="preview-header">
        <span>
          <strong data-xh-part="preview-title">Accessibility specification</strong>
          <span data-xh-part="preview-meta">application/pdf</span>
        </span>
        <button data-xh-part="dismiss-trigger"></button>
      </header>
      <blockquote data-xh-part="quote">Relationships must remain available to assistive technology.</blockquote>
      <button data-xh-part="preview-link">Open document</button>
    </section>

    <ol data-xh-part="list">
      <li data-xh-part="source" value="report">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">1</span>
          <span><span data-xh-part="source-title">2026 design systems report</span><span data-xh-part="source-meta">example.com</span></span>
        </button>
      </li>
      <li data-xh-part="source" value="spec">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">2</span>
          <span><span data-xh-part="source-title">Accessibility specification</span><span data-xh-part="source-meta">application/pdf</span></span>
        </button>
      </li>
    </ol>
  </div>
</xh-citation>

<script type="module">
  const citation = document.getElementById("citation-basic");
  citation.sources = [
    {
      type: "source-url",
      sourceId: "report",
      title: "2026 design systems report",
      url: "https://example.com/report",
      anchors: [{ sourceId: "report", quote: "Shared primitives reduce product inconsistency." }],
    },
    {
      type: "source-document",
      sourceId: "spec",
      title: "Accessibility specification",
      mediaType: "application/pdf",
      anchors: [{ sourceId: "spec", quote: "Relationships must remain available to assistive technology." }],
    },
  ];
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="citation"`：**`root`** · `text` · `trigger` · `positioner` · **`preview`** · `preview-header` · **`preview-title`** · `preview-meta` · `quote` · `preview-link` · `dismiss-trigger` · `prev-trigger` · `next-trigger` · `preview-index` · **`list`** · **`source`** · **`source-link`** · `source-index` · `source-title` · `source-meta`

## 示例

### 受控状态

activeSourceId 与 open 分别写回，来源数据仍是唯一真源

```vue
<script setup lang="ts">
import type { CitationSource } from "@xihan-ui/headless";
import { XhCitationList, XhCitationPreview, XhCitationRoot, XhCitationText, XhCitationTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const sources: CitationSource[] = [
  { type: "source-url", sourceId: "one", title: "Primary research", url: "https://example.com/one", anchors: [{ sourceId: "one", quote: "Primary evidence." }] },
  { type: "source-url", sourceId: "two", title: "Follow-up analysis", url: "https://example.com/two", anchors: [{ sourceId: "two", quote: "Follow-up evidence." }] },
];
const activeSourceId = ref<string | null>("two");
const open = ref(true);
</script>

<template>
  <XhCitationRoot v-model:active-source-id="activeSourceId" v-model:open="open" :sources="sources">
    <XhCitationText>
      这段结论同时参考了主研究<XhCitationTrigger source-id="one">1</XhCitationTrigger>
      与后续分析<XhCitationTrigger source-id="two">2</XhCitationTrigger>。
    </XhCitationText>
    <XhCitationPreview v-for="source in sources" :key="source.sourceId" :source-id="source.sourceId" />
    <XhCitationList />
  </XhCitationRoot>
</template>
```

```html
<xh-citation id="citation-controlled" active-source-id="two" open>
  <div data-xh-part="root">
    <p data-xh-part="text">
      这段结论同时参考了主研究<button data-xh-part="trigger" value="one">1</button>
      与后续分析<button data-xh-part="trigger" value="two">2</button>。
    </p>
    <section data-xh-part="preview" value="one"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Primary research</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Primary evidence.</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <section data-xh-part="preview" value="two"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Follow-up analysis</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Follow-up evidence.</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <ol data-xh-part="list">
      <li data-xh-part="source" value="one"><button data-xh-part="source-link"><span data-xh-part="source-index">1</span><span><span data-xh-part="source-title">Primary research</span><span data-xh-part="source-meta">example.com</span></span></button></li>
      <li data-xh-part="source" value="two"><button data-xh-part="source-link"><span data-xh-part="source-index">2</span><span><span data-xh-part="source-title">Follow-up analysis</span><span data-xh-part="source-meta">example.com</span></span></button></li>
    </ol>
  </div>
</xh-citation>
<script type="module">
  const host = document.getElementById("citation-controlled");
  host.sources = [
    { type: "source-url", sourceId: "one", title: "Primary research", url: "https://example.com/one", anchors: [{ sourceId: "one", quote: "Primary evidence." }] },
    { type: "source-url", sourceId: "two", title: "Follow-up analysis", url: "https://example.com/two", anchors: [{ sourceId: "two", quote: "Follow-up evidence." }] },
  ];
  host.addEventListener("active-source-change", event => { host.activeSourceId = event.detail.sourceId; });
  host.addEventListener("open-change", event => { host.open = event.detail.open; });
</script>
```

### 文档来源

source-open 把文档 SourcePart 与锚点交给宿主打开

```vue
<script setup lang="ts">
import type { CitationSource } from "@xihan-ui/headless";
import { XhCitationList, XhCitationPreview, XhCitationRoot, XhCitationText, XhCitationTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const status = ref("尚未请求打开文档");
const sources: CitationSource[] = [{
  type: "source-document",
  sourceId: "handbook",
  title: "Design handbook.pdf",
  mediaType: "application/pdf",
  anchors: [{ sourceId: "handbook", quote: "Every citation keeps its original locator.", locator: { page: 18 } }],
}];
</script>

<template>
  <XhCitationRoot :sources="sources" default-open @source-open="status = `请求打开 ${$event.sourceId}`">
    <XhCitationText>引用也可以指向宿主托管的文档<XhCitationTrigger source-id="handbook">1</XhCitationTrigger>。</XhCitationText>
    <XhCitationPreview source-id="handbook" />
    <XhCitationList />
  </XhCitationRoot>
  <p aria-live="polite">{{ status }}</p>
</template>
```

```html
<xh-citation id="citation-document" default-open>
  <div data-xh-part="root">
    <p data-xh-part="text">引用也可以指向宿主托管的文档<button data-xh-part="trigger" value="handbook">1</button>。</p>
    <section data-xh-part="preview" value="handbook">
      <header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Design handbook.pdf</strong><span data-xh-part="preview-meta">application/pdf</span></span><button data-xh-part="dismiss-trigger"></button></header>
      <blockquote data-xh-part="quote">Every citation keeps its original locator.</blockquote>
      <button data-xh-part="preview-link">Open document</button>
    </section>
    <ol data-xh-part="list"><li data-xh-part="source" value="handbook"><button data-xh-part="source-link"><span data-xh-part="source-index">1</span><span><span data-xh-part="source-title">Design handbook.pdf</span><span data-xh-part="source-meta">application/pdf</span></span></button></li></ol>
  </div>
</xh-citation>
<p id="citation-document-status" aria-live="polite">尚未请求打开文档</p>
<script type="module">
  const host = document.getElementById("citation-document");
  const status = document.getElementById("citation-document-status");
  host.sources = [{ type: "source-document", sourceId: "handbook", title: "Design handbook.pdf", mediaType: "application/pdf", anchors: [{ sourceId: "handbook", quote: "Every citation keeps its original locator.", locator: { page: 18 } }] }];
  host.addEventListener("source-open", event => { status.textContent = `请求打开 ${event.detail.sourceId}`; });
</script>
```

### 键盘导航

来源列表使用单一 Tab 位，方向键、Home、End 移动，Enter 打开预览

```vue
<script setup lang="ts">
import type { CitationSource } from "@xihan-ui/headless";
import { XhCitationList, XhCitationPreview, XhCitationRoot } from "@xihan-ui/vue";

const sources: CitationSource[] = [
  { type: "source-url", sourceId: "a", title: "Research A", url: "https://example.com/a", anchors: [{ sourceId: "a", quote: "Evidence A" }] },
  { type: "source-url", sourceId: "b", title: "Research B", url: "https://example.com/b", anchors: [{ sourceId: "b", quote: "Evidence B" }] },
  { type: "source-url", sourceId: "c", title: "Research C", url: "https://example.com/c", anchors: [{ sourceId: "c", quote: "Evidence C" }] },
];
</script>

<template>
  <p>聚焦来源后使用 ↑ / ↓、Home、End，并按 Enter 查看。</p>
  <XhCitationRoot :sources="sources" :loop="false" size="sm" :translations="{ sources: '证据来源' }">
    <XhCitationPreview v-for="source in sources" :key="source.sourceId" :source-id="source.sourceId" />
    <XhCitationList />
  </XhCitationRoot>
</template>
```

```html
<p>聚焦来源后使用 ↑ / ↓、Home、End，并按 Enter 查看。</p>
<xh-citation id="citation-keyboard" size="sm">
  <div data-xh-part="root">
    <section data-xh-part="preview" value="a"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Research A</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Evidence A</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <section data-xh-part="preview" value="b"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Research B</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Evidence B</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <section data-xh-part="preview" value="c"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Research C</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Evidence C</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <ol data-xh-part="list">
      <li data-xh-part="source" value="a"><button data-xh-part="source-link"><span data-xh-part="source-index">1</span><span><span data-xh-part="source-title">Research A</span><span data-xh-part="source-meta">example.com</span></span></button></li>
      <li data-xh-part="source" value="b"><button data-xh-part="source-link"><span data-xh-part="source-index">2</span><span><span data-xh-part="source-title">Research B</span><span data-xh-part="source-meta">example.com</span></span></button></li>
      <li data-xh-part="source" value="c"><button data-xh-part="source-link"><span data-xh-part="source-index">3</span><span><span data-xh-part="source-title">Research C</span><span data-xh-part="source-meta">example.com</span></span></button></li>
    </ol>
  </div>
</xh-citation>
<script type="module">
  const host = document.getElementById("citation-keyboard");
  host.loop = false;
  host.sources = [
    { type: "source-url", sourceId: "a", title: "Research A", url: "https://example.com/a", anchors: [{ sourceId: "a", quote: "Evidence A" }] },
    { type: "source-url", sourceId: "b", title: "Research B", url: "https://example.com/b", anchors: [{ sourceId: "b", quote: "Evidence B" }] },
    { type: "source-url", sourceId: "c", title: "Research C", url: "https://example.com/c", anchors: [{ sourceId: "c", quote: "Evidence C" }] },
  ];
  host.translations = { sources: "证据来源" };
</script>
```

### 悬停预览

preview-mode="hover" 把预览放进 positioner，锚定在引用编号旁：指针停留或聚焦即出现、离开即收起，不推动正文；卡片开着时指向另一处引用直接切过去

```vue
<script setup lang="ts">
import type { CitationSource } from "@xihan-ui/headless";
import {
  XhCitationList,
  XhCitationPositioner,
  XhCitationPreview,
  XhCitationRoot,
  XhCitationText,
  XhCitationTrigger,
} from "@xihan-ui/vue";

const sources: CitationSource[] = [
  {
    type: "source-url",
    sourceId: "report",
    title: "2026 design systems report",
    url: "https://example.com/report",
    anchors: [{ sourceId: "report", quote: "Shared primitives reduce product inconsistency." }],
  },
  {
    type: "source-document",
    sourceId: "spec",
    title: "Accessibility specification",
    mediaType: "application/pdf",
    anchors: [{ sourceId: "spec", quote: "Relationships must remain available to assistive technology." }],
  },
];
</script>

<template>
  <XhCitationRoot :sources="sources" preview-mode="hover">
    <XhCitationText>
      共享原语可以减少产品之间的不一致
      <XhCitationTrigger source-id="report" citation-id="hover-report">1</XhCitationTrigger>，
      明确的可访问关系让引用在键盘与读屏中仍可追踪
      <XhCitationTrigger source-id="spec" citation-id="hover-spec">2</XhCitationTrigger>。
    </XhCitationText>
    <XhCitationPositioner>
      <XhCitationPreview v-for="source in sources" :key="source.sourceId" :source-id="source.sourceId" />
    </XhCitationPositioner>
    <XhCitationList />
  </XhCitationRoot>
</template>
```

```html
<xh-citation id="citation-hover" preview-mode="hover">
  <div data-xh-part="root">
    <p data-xh-part="text">
      共享原语可以减少产品之间的不一致
      <button data-xh-part="trigger" value="report" name="hover-report">1</button>，
      明确的可访问关系让引用在键盘与读屏中仍可追踪
      <button data-xh-part="trigger" value="spec" name="hover-spec">2</button>。
    </p>

    <div data-xh-part="positioner">
      <section data-xh-part="preview" value="report">
        <header data-xh-part="preview-header">
          <span>
            <strong data-xh-part="preview-title">2026 design systems report</strong>
            <span data-xh-part="preview-meta">example.com</span>
          </span>
          <button data-xh-part="dismiss-trigger"></button>
        </header>
        <blockquote data-xh-part="quote">Shared primitives reduce product inconsistency.</blockquote>
        <a data-xh-part="preview-link">Open source</a>
      </section>

      <section data-xh-part="preview" value="spec">
        <header data-xh-part="preview-header">
          <span>
            <strong data-xh-part="preview-title">Accessibility specification</strong>
            <span data-xh-part="preview-meta">application/pdf</span>
          </span>
          <button data-xh-part="dismiss-trigger"></button>
        </header>
        <blockquote data-xh-part="quote">Relationships must remain available to assistive technology.</blockquote>
        <button data-xh-part="preview-link">Open document</button>
      </section>
    </div>

    <ol data-xh-part="list">
      <li data-xh-part="source" value="report">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">1</span>
          <span><span data-xh-part="source-title">2026 design systems report</span><span data-xh-part="source-meta">example.com</span></span>
        </button>
      </li>
      <li data-xh-part="source" value="spec">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">2</span>
          <span><span data-xh-part="source-title">Accessibility specification</span><span data-xh-part="source-meta">application/pdf</span></span>
        </button>
      </li>
    </ol>
  </div>
</xh-citation>

<script type="module">
  const citation = document.getElementById("citation-hover");
  citation.sources = [
    {
      type: "source-url",
      sourceId: "report",
      title: "2026 design systems report",
      url: "https://example.com/report",
      anchors: [{ sourceId: "report", quote: "Shared primitives reduce product inconsistency." }],
    },
    {
      type: "source-document",
      sourceId: "spec",
      title: "Accessibility specification",
      mediaType: "application/pdf",
      anchors: [{ sourceId: "spec", quote: "Relationships must remain available to assistive technology." }],
    },
  ];
</script>
```

### 一处多源

一处引用引了几个来源时写 source-ids，预览里用上一个 / 下一个在它们之间轮换，位置写在两颗翻页钮之间

```vue
<script setup lang="ts">
import type { CitationSource } from "@xihan-ui/headless";
import {
  XhCitationList,
  XhCitationPreview,
  XhCitationRoot,
  XhCitationText,
  XhCitationTrigger,
} from "@xihan-ui/vue";

const sources: CitationSource[] = [
  {
    type: "source-url",
    sourceId: "report",
    title: "2026 design systems report",
    url: "https://example.com/report",
    anchors: [{ sourceId: "report", quote: "Shared primitives reduce product inconsistency." }],
  },
  {
    type: "source-url",
    sourceId: "survey",
    title: "Component library survey",
    url: "https://example.com/survey",
    anchors: [{ sourceId: "survey", quote: "Teams with a shared kit ship consistent flows faster." }],
  },
];
</script>

<template>
  <XhCitationRoot :sources="sources">
    <XhCitationText>
      共享原语可以减少产品之间的不一致
      <XhCitationTrigger :source-ids="['report', 'survey']" citation-id="multi-claim">1, 2</XhCitationTrigger>。
    </XhCitationText>
    <XhCitationPreview v-for="source in sources" :key="source.sourceId" :source-id="source.sourceId" />
    <XhCitationList />
  </XhCitationRoot>
</template>
```

```html
<xh-citation id="citation-multi">
  <div data-xh-part="root">
    <p data-xh-part="text">
      共享原语可以减少产品之间的不一致
      <!-- Web Components 里 value 写成空白分隔的几个来源 id -->
      <button data-xh-part="trigger" value="report survey" name="multi-claim">1, 2</button>。
    </p>

    <section data-xh-part="preview" value="report">
      <header data-xh-part="preview-header">
        <span>
          <strong data-xh-part="preview-title">2026 design systems report</strong>
          <span data-xh-part="preview-meta">example.com</span>
        </span>
        <button data-xh-part="prev-trigger"></button>
        <span data-xh-part="preview-index"></span>
        <button data-xh-part="next-trigger"></button>
        <button data-xh-part="dismiss-trigger"></button>
      </header>
      <blockquote data-xh-part="quote">Shared primitives reduce product inconsistency.</blockquote>
      <a data-xh-part="preview-link">Open source</a>
    </section>

    <section data-xh-part="preview" value="survey">
      <header data-xh-part="preview-header">
        <span>
          <strong data-xh-part="preview-title">Component library survey</strong>
          <span data-xh-part="preview-meta">example.com</span>
        </span>
        <button data-xh-part="prev-trigger"></button>
        <span data-xh-part="preview-index"></span>
        <button data-xh-part="next-trigger"></button>
        <button data-xh-part="dismiss-trigger"></button>
      </header>
      <blockquote data-xh-part="quote">Teams with a shared kit ship consistent flows faster.</blockquote>
      <a data-xh-part="preview-link">Open source</a>
    </section>

    <ol data-xh-part="list">
      <li data-xh-part="source" value="report">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">1</span>
          <span><span data-xh-part="source-title">2026 design systems report</span><span data-xh-part="source-meta">example.com</span></span>
        </button>
      </li>
      <li data-xh-part="source" value="survey">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">2</span>
          <span><span data-xh-part="source-title">Component library survey</span><span data-xh-part="source-meta">example.com</span></span>
        </button>
      </li>
    </ol>
  </div>
</xh-citation>

<script type="module">
  const citation = document.getElementById("citation-multi");
  citation.sources = [
    {
      type: "source-url",
      sourceId: "report",
      title: "2026 design systems report",
      url: "https://example.com/report",
      anchors: [{ sourceId: "report", quote: "Shared primitives reduce product inconsistency." }],
    },
    {
      type: "source-url",
      sourceId: "survey",
      title: "Component library survey",
      url: "https://example.com/survey",
      anchors: [{ sourceId: "survey", quote: "Teams with a shared kit ship consistent flows faster." }],
    },
  ];
</script>
```

## 设计指引

### 何时使用

- AI 回答、研究摘要或知识库结果需要标出结论依据，并允许用户核对原文。
- 同一来源既要在正文中以短编号出现，也要在文末列表中保留完整标题与类型。

### 何时不用

- 只是普通脚注、无需展开预览或来源交互：使用语义化链接和有序列表即可。
- 内容是导航目录而非证据来源：使用[锚点导航](./anchor)。

### 特性

- 行内 trigger 用 `aria-controls` / `aria-expanded` 指向唯一 preview region；预览再以 `aria-labelledby` 指回打开入口。
- 来源列表只占一个 Tab 位，支持 ↑ / ↓、Home、End 与 Enter / Space；`Escape` 收起预览并按需归还焦点。
- 预览有两种出现方式，由 `previewMode` 决定：
  - `inline`（缺省）：预览是正文流里的一块面，展开时从 0 长到整块、收起时收回 0，后面的段落随之平移；首帧就开着的预览直接呈现。缺省取它：现有结构不用改，也不依赖悬停，触屏与键盘同样顺手。
  - `hover`：预览放进 `positioner` 部件，锚定在引用编号旁的悬停卡片，搬到 portal 落点、不推动正文。指针停留 `openDelay`（缺省 700ms）出现，离开编号与卡片 `closeDelay`（缺省 300ms）后收起，中途移进卡片即撤销；卡片开着或刚收起不到 `skipDelayDuration`（缺省 300ms）时，指向另一处引用直接接替，与悬停卡片、文字提示同一套节奏。焦点落到引用上当场打开，焦点离开引用与卡片即收起；触屏没有悬停，点按照常开合。Escape 与卡片外的按下都会收起它。
- 一处引用引了几个来源时写 `sourceIds`（Web Components 在 `value` 里写成空白分隔的几个 id），预览里的 `prev-trigger` / `next-trigger` 在这几个来源之间轮换，`preview-index` 显示「2 / 3」；只有一个来源时三者收起。hover 档轮换时卡片就地换内容，不再播一次出现。
- URL 来源保留原生链接导航；文档来源通过 `source-open` 把 `SourcePart` 与当前 anchor 交回宿主。
- `activeSourceId` 与 `open` 可分别受控，受控时只有宿主写回才改变可见状态。
- 正文里的引用常随[流式正文](./markdown-stream)到达：把流式正文放进 `text` 部件，在它的 `citation` 插槽里渲 trigger。首帧一个引用都没有是真实首帧，`text` 与 `trigger` 都不是必需部件。

### 最佳实践

- `sourceId` 在一组来源中保持稳定且唯一；同一来源的多次行内引用用不同 `citationId`。
- `anchors` 中保存足以核验的短引文，完整文档仍由来源链接或宿主查看器承担。
- 不要让引用编号代替正文：读屏名称会组合来源顺序与标题，但正文应在去掉引用后仍然可读。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-citation>` |
| Vue 组件 | `XhCitationList` `XhCitationPositioner` `XhCitationPreview` `XhCitationRoot` `XhCitationSource` `XhCitationSourceIndex` `XhCitationSourceLink` `XhCitationSourceMeta` `XhCitationSourceTitle` `XhCitationText` `XhCitationTrigger` |
| 组合式函数 | `useCitation` |
| 状态机 | `citationMachine` |
| 皮肤 | `@xihan-ui/styles/citation.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `previewMode` | `CitationPreviewMode` |  | 预览怎样出现，缺省 inline。 hover 档要在根里放 positioner 部件，预览放进它里面，定位到当前引用编号旁。 |
| `openDelay` | `number` |  | hover 档：指针停在引用上到卡片出现的等待毫秒，缺省 700。 |
| `closeDelay` | `number` |  | hover 档：指针离开引用与卡片到收起的等待毫秒，缺省 300；也是从编号挪进卡片的通行时间。 |
| `skipDelayDuration` | `number` |  | hover 档：卡片刚收起不到这么久，指向另一处引用即直接出现、不再等 openDelay，缺省 300； 卡片开着时指向另一处引用始终直接切过去。0 表示不接替。 |
| `placement` | `Placement` |  | hover 档：卡片相对引用编号的朝向，缺省 bottom，空间不足时由定位引擎避让。 |
| `offset` | `number` |  | hover 档：卡片与引用编号的间距（px）。 |
| `sources` | `readonly CitationSource[]` |  | @xihan-ui/chat-stream 的 SourcePart[] 可直接传入。 |
| `activeSourceId` | `string \| null` |  |  |
| `defaultActiveSourceId` | `string \| null` |  |  |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `loop` | `boolean` |  |  |
| `dir` | `Direction` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<CitationTranslations>` |  |  |
| `onActiveSourceChange` | `(details: CitationActiveSourceChangeDetails) => void` |  |  |
| `onOpenChange` | `(details: CitationOpenChangeDetails) => void` |  |  |
| `onSourceOpen` | `(details: CitationSourceOpenDetails) => void` |  | 打开原始来源；URL 的默认链接仍会正常导航，同时发出该通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `active-source-change` | `CitationActiveSourceChangeDetails` | 当前来源变化 |
| `open-change` | `CitationOpenChangeDetails` | 预览展开态变化 |
| `source-open` | `CitationSourceOpenDetails` | 用户请求打开原始来源 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhCitationPositioner` | `container` | `PortalContainer` |  | 本实例的 Portal 容器；优先于应用级配置。 |
| `XhCitationPreview` | `sourceId` | `string` | 是 |  |
| `XhCitationPreview` | `anchorIndex` | `number` |  |  |
| `XhCitationRoot` | `children` | `ReactNode` |  |  |
| `XhCitationSource` | `sourceId` | `string` | 是 |  |
| `XhCitationSource` | `disabled` | `boolean` |  |  |
| `XhCitationTrigger` | `sourceId` | `string` |  | 这一处引用的来源；一处引多个来源时改写 sourceIds，两者只写一个。 |
| `XhCitationTrigger` | `sourceIds` | `readonly string[]` |  | 一处引用多个来源，预览里可以在它们之间轮换。 |
| `XhCitationTrigger` | `citationId` | `string` |  |  |
| `XhCitationTrigger` | `anchorIndex` | `number` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `preview` | 'open' \| 'closed' |
| `source` | 'active' \| 'inactive' |
| `source-link` | 'active' \| 'inactive' |

以下名称仅用于内部状态机。

**状态**：`idle` · `opening` · `closing`

**事件**：`CITATION.ACTIVATE` · `TRIGGER.ENTER` · `POINTER.LEAVE` · `FLOATING.ENTER` · `TRIGGER.FOCUS` · `FLOATING.FOCUS` · `HOVER.BLUR` · `after.openDelay` · `after.closeDelay` · `GROUP.STEP` · `DISMISS` · `SOURCE.ACTIVATE` · `SOURCE.OPEN` · `SOURCE.FOCUS` · `LIST.BLUR` · `OPEN.SET` · `PREVIEW.MEASURED` · `PREVIEW.LEFT`

**判据**：`isHoverMode` · `isVisible` · `isWarm` · `isFocusHeld` · `isSameTarget`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `sources` | `readonly CitationSource[]` |  |
| `activeSource` | `CitationSource \| null` |  |
| `activeSourceId` | `string \| null` |  |
| `activeAnchorIndex` | `number \| null` |  |
| `activeGroup` | `readonly string[] \| null` | 当前那处引用引到的全部来源；只有一个或从来源列表打开时为 null。 |
| `previewMode` | `CitationPreviewMode` |  |
| `open` | `boolean` |  |
| `focusedSourceId` | `string \| null` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setActiveSource` | `(sourceId: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTextProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: CitationTriggerProps) => T['button']` |  |
| `getPositionerProps` | `() => T['element']` | hover 档的浮层定位壳；inline 档不参与排版（display: contents）。 |
| `getPreviewProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getPreviewHeaderProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getPreviewTitleProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getPreviewMetaProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getQuoteProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getPreviewLinkProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `sourceMetaText` | `(source: CitationSource \| undefined) => string` | 来源的副文字：网页来源写域名，文档来源写媒体类型，没有媒体类型时取 translations.document。 |
| `previewLinkText` | `(props: CitationPreviewProps) => string` | 预览链接上写的字：网页来源取 previewLinkSource，文档来源取 previewLinkDocument。 |
| `getDismissTriggerProps` | `(props: CitationPreviewProps) => T['button']` |  |
| `getPrevTriggerProps` | `(props: CitationPreviewProps) => T['button']` | 一处多源时换到上一个来源；只有一个来源时带 hidden。 |
| `getNextTriggerProps` | `(props: CitationPreviewProps) => T['button']` | 一处多源时换到下一个来源；只有一个来源时带 hidden。 |
| `getPreviewIndexProps` | `(props: CitationPreviewProps) => T['element']` | 一处多源时的位置，如「2 / 3」；只有一个来源时带 hidden。 |
| `getPreviewPosition` | `(props: CitationPreviewProps) => { index: number, total: number } \| null` | 该预览此刻在一处多源里排第几（1 基）与共几个；不在多源轮换里时为 null。 |
| `getListProps` | `() => T['element']` |  |
| `getSourceProps` | `(props: CitationSourceItemProps) => T['element']` |  |
| `getSourceLinkProps` | `(props: CitationSourceItemProps) => T['button']` |  |
| `getSourceIndexProps` | `(props: CitationSourceItemProps) => T['element']` |  |
| `getSourceTitleProps` | `(props: CitationSourceItemProps) => T['element']` |  |
| `getSourceMetaProps` | `(props: CitationSourceItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus on inline citation, not disabled | 展开或收起该引文对应的来源预览 |
| `ArrowDown` | focus in source list | 焦点移到下一条可用来源，尽头按 loop 回绕 |
| `ArrowUp` | focus in source list | 焦点移到上一条可用来源，尽头按 loop 回绕 |
| `Home` | focus in source list | 焦点移到第一条可用来源 |
| `End` | focus in source list | 焦点移到最后一条可用来源 |
| `Space` / `Enter` | focus on source list item, not disabled | 将该来源设为当前来源并展开预览 |
| `Tab` | previewMode 为 hover，焦点落到行内引用上 | 当场打开该引用的悬停卡片；焦点移进卡片不收起，离开引用与卡片即收起 |
| `Space` / `Enter` | focus on previous / next source button in preview, 一处引用引了多个来源 | 在这几个来源之间换到上一个 / 下一个，尽头按 loop 回绕 |
| `Escape` | source preview open | 收起预览；若焦点位于预览内则归还到打开它的行内引用或来源条目；hover 档由消解层收起卡片 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `preview` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-label` | labels.citations(ids.map(sourceId =&gt; indexOf(sourceId… \| labels.citation(indexOf(ids[0]!) + 1, citationSourceT… |
| `preview` | `aria-label` | labels.preview \| undefined |
| `preview` | `aria-labelledby` | context.get('activeTriggerId') \| undefined |
| `preview` | `role` | 'region' |
| `preview-link` | `aria-label` | labels.openSource(title) |
| `dismiss-trigger` | `aria-label` | labels.closePreview |
| `preview-index` | `aria-hidden` | 'true' |
| `list` | `aria-label` | labels.sources |
| `list` | `role` | 'list' |
| `source` | `role` | 'listitem' |
| `source-link` | `aria-controls` | `preview` 部件的 id |
| `source-link` | `aria-current` | 'true' \| undefined |
| `source-link` | `aria-expanded` | 'true' \| 'false' |
| `source-link` | `aria-label` | labels.source(index + 1, citationSourceTitle(current)) |
| `source-index` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/citation.css` 按 `[data-scope="citation"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-citation` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-preview-mode` | props.previewMode |
| `root` | `data-size` | props.size |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'xs' |
| `trigger` | `data-xh-action-variant` | 'subtle' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 \| undefined |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-preview-mode` | props.previewMode |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `preview` | `data-instant` | ''（条件成立时才出现） |
| `preview` | `data-preview-mode` | props.previewMode |
| `preview` | `data-state` | 'open' \| 'closed' |
| `preview` | `data-xh-material` | 'frosted' \| undefined |
| `preview-link` | `data-xh-action-control` | '' |
| `preview-link` | `data-xh-action-display` | 'always' \| undefined |
| `preview-link` | `data-xh-action-profile` | 'text' \| undefined |
| `preview-link` | `data-xh-action-size` | 'sm' \| undefined |
| `preview-link` | `data-xh-action-variant` | 'ghost' \| undefined |
| `dismiss-trigger` | `data-xh-action-control` | '' |
| `dismiss-trigger` | `data-xh-action-display` | 'always' |
| `dismiss-trigger` | `data-xh-action-profile` | 'icon' |
| `dismiss-trigger` | `data-xh-action-size` | 'xs' |
| `dismiss-trigger` | `data-xh-action-variant` | 'ghost' |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `source` | `data-disabled` | ''（条件成立时才出现） |
| `source` | `data-state` | 'active' \| 'inactive' |
| `source-link` | `data-current` | ''（条件成立时才出现） |
| `source-link` | `data-disabled` | ''（条件成立时才出现） |
| `source-link` | `data-state` | 'active' \| 'inactive' |
| `source-link` | `data-xh-action-control` | '' |
| `source-link` | `data-xh-action-display` | 'always' |
| `source-link` | `data-xh-action-profile` | 'row' |
| `source-link` | `data-xh-action-size` | props.size |
| `source-link` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-citation-card-backdrop` | `preview` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-backdrop` | citation 的 preview 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-citation-card-bg` | `preview` | `background` | `not([data-xh-action-control])`<br>`preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-bg` | citation 的 preview 部件 background 覆盖槽。 |
| `--xh-citation-card-border` | `preview` | `border` | `not([data-xh-action-control])`<br>`preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-border` | citation 的 preview 部件 border 覆盖槽。 |
| `--xh-citation-card-fg` | `preview` | `color` | `not([data-xh-action-control])`<br>`preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-fg` | citation 的 preview 部件 color 覆盖槽。 |
| `--xh-citation-card-max-h` | `preview` | `max-block-size` | `preview-mode=hover` | `--xh-overlay-max-h` | citation 的 preview 部件 max-block-size 覆盖槽。 |
| `--xh-citation-card-max-w` | `preview` | `max-inline-size` | `preview-mode=hover` | `--xh-overlay-max-w` | citation 的 preview 部件 max-inline-size 覆盖槽。 |
| `--xh-citation-card-quote-lines` | `preview`<br>`quote` | `-webkit-line-clamp` | `not([hidden])`<br>`preview-mode=hover` | `6` | citation 的 preview、quote 部件 -webkit-line-clamp 覆盖槽。 |
| `--xh-citation-card-radius` | `preview` | `border-radius` | `preview-mode=hover` | `--xh-shape-overlay` | citation 的 preview 部件 border-radius 覆盖槽。 |
| `--xh-citation-card-shadow` | `preview` | `box-shadow` | `not([data-xh-action-control])`<br>`preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-shadow` | citation 的 preview 部件 box-shadow 覆盖槽。 |
| `--xh-citation-dismiss-trigger-radius` | `dismiss-trigger` | `border-radius` | `default` | `--xh-shape-control` | citation 的 dismiss-trigger 部件 border-radius 覆盖槽。 |
| `--xh-citation-fg` | `root` | `color` | `default` | `--xh-fg-default` | citation 的 root 部件 color 覆盖槽。 |
| `--xh-citation-font-size` | `positioner`<br>`root` | `font-size` | `default`<br>`preview-mode=hover` | `--xh-_citation-font-size` | citation 的 positioner、root 部件 font-size 覆盖槽。 |
| `--xh-citation-gap` | `preview`<br>`root` | `gap`<br>`margin-block-start` | `@keyframes xh-citation-preview-collapse`<br>`@keyframes xh-citation-preview-expand`<br>`default`<br>`not([data-xh-material])`<br>`xh-material` | `--xh-_citation-gap` | citation 的 preview、root 部件 gap、margin-block-start 覆盖槽。 |
| `--xh-citation-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])` | `--xh-_citation-icon-size` | citation 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-citation-index-active-bg` | `source`<br>`source-index` | `background` | `state=active` | `--xh-bg-brand` | citation 的 source、source-index 部件 background 覆盖槽。 |
| `--xh-citation-index-active-fg` | `source`<br>`source-index` | `color` | `state=active` | `--xh-fg-on-brand` | citation 的 source、source-index 部件 color 覆盖槽。 |
| `--xh-citation-index-bg` | `source-index` | `background` | `default` | `--xh-bg-subtle` | citation 的 source-index 部件 background 覆盖槽。 |
| `--xh-citation-index-fg` | `source-index` | `color` | `default` | `--xh-fg-muted` | citation 的 source-index 部件 color 覆盖槽。 |
| `--xh-citation-index-font-size` | `source-index` | `font-size` | `default` | `--xh-text-caption-size` | citation 的 source-index 部件 font-size 覆盖槽。 |
| `--xh-citation-index-radius` | `source-index` | `border-radius` | `default` | `--xh-shape-circle` | citation 的 source-index 部件 border-radius 覆盖槽。 |
| `--xh-citation-index-size` | `source-index` | `block-size`<br>`min-inline-size` | `default` | `--xh-control-box-sm` | citation 的 source-index 部件 block-size、min-inline-size 覆盖槽。 |
| `--xh-citation-layer` | `positioner` | `z-index` | `preview-mode=hover` | `--xh-_layer` | citation 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-citation-link-fg` | `preview-link` | `color` | `default` | `--xh-fg-brand` | citation 的 preview-link 部件 color 覆盖槽。 |
| `--xh-citation-list-gap` | `list` | `gap` | `default` | `--xh-space-1` | citation 的 list 部件 gap 覆盖槽。 |
| `--xh-citation-meta-fg` | `preview-index`<br>`preview-meta`<br>`source-meta` | `color` | `default` | `--xh-fg-muted` | citation 的 preview-index、preview-meta、source-meta 部件 color 覆盖槽。 |
| `--xh-citation-meta-font-size` | `preview-index`<br>`preview-meta`<br>`source-meta` | `font-size` | `default` | `--xh-text-caption-size` | citation 的 preview-index、preview-meta、source-meta 部件 font-size 覆盖槽。 |
| `--xh-citation-pager-radius` | `next-trigger`<br>`prev-trigger` | `border-radius` | `default` | `--xh-shape-control` | citation 的 next-trigger、prev-trigger 部件 border-radius 覆盖槽。 |
| `--xh-citation-preview-bg` | `preview` | `background` | `not([data-xh-material])`<br>`xh-material` | `--xh-bg-surface` | citation 的 preview 部件 background 覆盖槽。 |
| `--xh-citation-preview-border` | `preview` | `border` | `not([data-xh-material])`<br>`xh-material` | `--xh-border-default` | citation 的 preview 部件 border 覆盖槽。 |
| `--xh-citation-preview-fg` | `preview` | `color` | `not([data-xh-material])`<br>`xh-material` | `--xh-fg-default` | citation 的 preview 部件 color 覆盖槽。 |
| `--xh-citation-preview-gap` | `preview` | `gap` | `default` | `--xh-space-3` | citation 的 preview 部件 gap 覆盖槽。 |
| `--xh-citation-preview-header-content-gap` | `preview-header` | `gap` | `first-child` | `--xh-space-0_5` | citation 的 preview-header 部件 gap 覆盖槽。 |
| `--xh-citation-preview-header-gap` | `preview-header` | `gap` | `default` | `--xh-space-3` | citation 的 preview-header 部件 gap 覆盖槽。 |
| `--xh-citation-preview-link-radius` | `preview-link` | `border-radius` | `focus-visible` | `--xh-shape-control` | citation 的 preview-link 部件 border-radius 覆盖槽。 |
| `--xh-citation-preview-px` | `preview` | `padding-inline` | `default` | `--xh-_citation-pad` | citation 的 preview 部件 padding-inline 覆盖槽。 |
| `--xh-citation-preview-py` | `preview` | `padding-block` | `default` | `--xh-_citation-pad` | citation 的 preview 部件 padding-block 覆盖槽。 |
| `--xh-citation-preview-radius` | `preview` | `border-radius` | `not([data-xh-material])`<br>`xh-material` | `--xh-shape-surface` | citation 的 preview 部件 border-radius 覆盖槽。 |
| `--xh-citation-quote-border` | `quote` | `border-inline-start` | `default` | `--xh-fg-brand` | citation 的 quote 部件 border-inline-start 覆盖槽。 |
| `--xh-citation-quote-fg` | `quote` | `color` | `default` | `--xh-fg-muted` | citation 的 quote 部件 color 覆盖槽。 |
| `--xh-citation-quote-font-size` | `quote` | `font-size` | `default` | `--xh-text-secondary-size` | citation 的 quote 部件 font-size 覆盖槽。 |
| `--xh-citation-quote-ps` | `quote` | `padding-inline-start` | `default` | `--xh-space-3` | citation 的 quote 部件 padding-inline-start 覆盖槽。 |
| `--xh-citation-source-fg` | `source-link` | `color` | `default` | `--xh-fg-default` | citation 的 source-link 部件 color 覆盖槽。 |
| `--xh-citation-source-link-content-gap` | `source-link` | `gap` | `last-child` | `--xh-space-0_5` | citation 的 source-link 部件 gap 覆盖槽。 |
| `--xh-citation-source-px` | `source-link` | `padding-inline` | `default` | `--xh-space-3` | citation 的 source-link 部件 padding-inline 覆盖槽。 |
| `--xh-citation-source-py` | `source-link` | `padding-block` | `xh-action-profile=row` | `--xh-space-2` | citation 的 source-link 部件 padding-block 覆盖槽。 |
| `--xh-citation-source-radius` | `source-link` | `border-radius` | `default` | `--xh-shape-control` | citation 的 source-link 部件 border-radius 覆盖槽。 |
| `--xh-citation-source-title-fg` | `source-title` | `color` | `default` | `--xh-fg-default` | citation 的 source-title 部件 color 覆盖槽。 |
| `--xh-citation-text-fg` | `text` | `color` | `default` | `--xh-fg-default` | citation 的 text 部件 color 覆盖槽。 |
| `--xh-citation-title-fg` | `preview-title` | `color` | `default` | `--xh-fg-default` | citation 的 preview-title 部件 color 覆盖槽。 |
| `--xh-citation-title-font-size` | `preview-title` | `font-size` | `default` | `--xh-text-label-size` | citation 的 preview-title 部件 font-size 覆盖槽。 |
| `--xh-citation-title-font-weight` | `preview-title` | `font-weight` | `default` | `--xh-font-weight-semibold` | citation 的 preview-title 部件 font-weight 覆盖槽。 |
| `--xh-citation-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-brand` | citation 的 trigger 部件 color 覆盖槽。 |
| `--xh-citation-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-caption-size` | citation 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-citation-trigger-h` | `trigger` | `block-size`<br>`inline-size`<br>`min-block-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon`<br>`xh-action-profile=row` | `--xh-space-6` | citation 的 trigger 部件 block-size、inline-size、min-block-size、min-inline-size 覆盖槽。 |
| `--xh-citation-trigger-margin` | `trigger` | `margin-inline` | `default` | `--xh-space-0_5` | citation 的 trigger 部件 margin-inline 覆盖槽。 |
| `--xh-citation-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-space-1` | citation 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-citation-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-pill` | citation 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 披露 · 出现（锚定面板）（见[动效规范](../design/motion#角色)）。

关键帧 `xh-citation-preview-collapse` · `xh-citation-preview-expand` 随皮肤自带，不引用别处文件里的名字；共享关键帧 `xh-overlay-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走。
