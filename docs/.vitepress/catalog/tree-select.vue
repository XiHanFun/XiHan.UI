<script setup lang="ts">
import { XhTreeSelectControl, XhTreeSelectIndicator, XhTreeSelectLabel, XhTreeSelectRoot, XhTreeSelectTrigger, XhTreeSelectValueText } from "@xihan-ui/vue";

const files = [
  { value: "docs", label: "docs", children: [{ value: "guide", label: "guide.md" }, { value: "api", label: "api.md" }] },
  { value: "readme", label: "README.md" },
];
</script>

<template>
  <XhTreeSelectRoot :collection="files" :default-value="['guide']" placeholder="选一个文件" style="inline-size: 220px">
    <XhTreeSelectLabel>文档</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
  </XhTreeSelectRoot>
</template>
