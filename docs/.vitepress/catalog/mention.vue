<script setup lang="ts">
import { XhMentionRoot } from "@xihan-ui/vue";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
];
</script>

<template>
  <XhMentionRoot
    :collection="people"
    default-value="这个问题交给 @李雷 跟进"
    :translations="{ input: '正文', content: '提及谁' }"
    style="inline-size: 230px"
  />
</template>
