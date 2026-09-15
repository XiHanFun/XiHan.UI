<!-- 受控 | 传入 value 后由宿主决定；值可以是 null，表示没有任何一段选中 -->
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const view = ref<string | null>("list");
const views = [
  { value: "list", label: "列表" },
  { value: "board", label: "看板" },
  { value: "calendar", label: "日历" },
];
</script>

<template>
  <XhSegmentedRoot v-model:value="view" :collection="views" aria-label="视图" />
  <span>当前：{{ view ?? "（未选）" }}</span>
  <button type="button" @click="view = null">清空</button>
</template>
