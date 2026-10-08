var e=`<!-- 行内引用与公式 | 正文里的 [@来源] 与 $…$ 在 html 里是占位节点，citation / math 插槽把引用角标与公式渲进去；角标就是引用来源组件的 trigger -->
<script setup lang="ts">
import type { CitationSource, MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import {
  XhCitationList,
  XhCitationPreview,
  XhCitationRoot,
  XhCitationText,
  XhCitationTrigger,
  XhMarkdownStreamContent,
  XhMarkdownStreamRoot,
} from "@xihan-ui/vue";
import { shallowRef } from "vue";

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

const article = \`共享原语可以减少产品之间的不一致[@report]，可访问关系要对辅助技术保持可见[@spec]。

面积按 $A = \\\\pi r^2$ 计算。
\`;

const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>(
  renderer.render(article, { ended: true }) as readonly MarkdownBlock[],
);

// 角标显示来源在列表里的序号
const ordinal = (sourceId: string): number => sources.findIndex(source => source.sourceId === sourceId) + 1;
<\/script>

<template>
  <XhCitationRoot :sources="sources">
    <XhCitationText>
      <XhMarkdownStreamRoot :blocks="blocks">
        <XhMarkdownStreamContent>
          <template #citation="{ sourceIds, block, index }">
            <XhCitationTrigger :source-id="sourceIds[0]!" :citation-id="\`\${block.key}-\${index}\`">
              {{ ordinal(sourceIds[0]!) }}
            </XhCitationTrigger>
          </template>
          <!-- 公式交给宿主选的引擎；这里只把 TeX 原文放进 code 里示意挂点 -->
          <template #math="{ source }">
            <code>{{ source }}</code>
          </template>
        </XhMarkdownStreamContent>
      </XhMarkdownStreamRoot>
    </XhCitationText>
    <XhCitationPreview v-for="source in sources" :key="source.sourceId" :source-id="source.sourceId" />
    <XhCitationList />
  </XhCitationRoot>
</template>
`;export{e as default};