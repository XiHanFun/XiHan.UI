const e=`<!-- 键盘导航 | 来源列表使用单一 Tab 位，方向键、Home、End 移动，Enter 打开预览 -->
<script setup lang="ts">
import type { CitationSource } from "@xihan-ui/headless";
import { XhCitationList, XhCitationPreview, XhCitationRoot } from "@xihan-ui/vue";

const sources: CitationSource[] = [
  { type: "source-url", sourceId: "a", title: "Research A", url: "https://example.com/a", anchors: [{ sourceId: "a", quote: "Evidence A" }] },
  { type: "source-url", sourceId: "b", title: "Research B", url: "https://example.com/b", anchors: [{ sourceId: "b", quote: "Evidence B" }] },
  { type: "source-url", sourceId: "c", title: "Research C", url: "https://example.com/c", anchors: [{ sourceId: "c", quote: "Evidence C" }] },
];
<\/script>

<template>
  <p>聚焦来源后使用 ↑ / ↓、Home、End，并按 Enter 查看。</p>
  <XhCitationRoot :sources="sources" :loop="false" size="sm" :translations="{ sources: '证据来源' }">
    <XhCitationPreview v-for="source in sources" :key="source.sourceId" :source-id="source.sourceId" />
    <XhCitationList />
  </XhCitationRoot>
</template>
`;export{e as default};
