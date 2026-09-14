<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const items = [
  { value: "install", label: "怎么安装", content: "装 @xihan-ui/vue 与 @xihan-ui/styles 两个包。" },
  { value: "theme", label: "怎么换皮肤", content: "覆写同名令牌即可。" },
];
</script>

<template>
  <XhAccordionRoot :collection="items" :default-value="['install']" style="inline-size: 240px; font-size: 13px" />
</template>
