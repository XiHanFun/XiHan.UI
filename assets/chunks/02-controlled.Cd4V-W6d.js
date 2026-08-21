const e=`<!-- 受控 | 传了 value 就由宿主说了算；值可以是 null，表示一段都没选中 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSegmentedRoot } from "@xihan-ui/vue";

const view = ref<string | null>("list");
const views = [
  { value: "list", label: "列表" },
  { value: "board", label: "看板" },
  { value: "calendar", label: "日历" },
];
<\/script>

<template>
  <XhSegmentedRoot v-model:value="view" :collection="views" aria-label="视图" />
  <span>当前：{{ view ?? "（未选）" }}</span>
  <button type="button" @click="view = null">清空</button>
</template>
`;export{e as default};
