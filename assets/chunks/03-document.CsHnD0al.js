const t=`<!-- 文档来源 | source-open 把文档 SourcePart 与锚点交给宿主打开 -->
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
<\/script>

<template>
  <XhCitationRoot :sources="sources" default-open @source-open="status = \`请求打开 \${$event.sourceId}\`">
    <XhCitationText>引用也可以指向宿主托管的文档<XhCitationTrigger source-id="handbook">1</XhCitationTrigger>。</XhCitationText>
    <XhCitationPreview source-id="handbook" />
    <XhCitationList />
  </XhCitationRoot>
  <p aria-live="polite">{{ status }}</p>
</template>
`;export{t as default};
