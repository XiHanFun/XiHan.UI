var e=`<!-- 悬停预览 | preview-mode="hover" 把预览放进 positioner，锚定在引用编号旁：指针停留或聚焦即出现、离开即收起，不推动正文；卡片开着时指向另一处引用直接切过去 -->
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
<\/script>

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
`;export{e as default};