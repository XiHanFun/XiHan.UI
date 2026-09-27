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
    sourceId: "design",
    title: "Design systems research",
    url: "https://example.com/design",
    anchors: [{ sourceId: "design", quote: "Shared primitives reduce product inconsistency." }],
  },
];
</script>

<template>
  <XhCitationRoot :sources="sources">
    <XhCitationText>
      统一的行为原语能减少产品差异
      <XhCitationTrigger source-id="design">1</XhCitationTrigger>
    </XhCitationText>
    <XhCitationPreview source-id="design" />
    <XhCitationList />
  </XhCitationRoot>
</template>
