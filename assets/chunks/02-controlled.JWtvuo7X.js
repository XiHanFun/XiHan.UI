var e=`<!-- 受控状态 | activeSourceId 与 open 分别写回，来源数据仍是唯一真源 -->
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
<\/script>

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
`;export{e as default};