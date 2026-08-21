const e=`<!-- 事件 | checked-change 带一份 { checked }，非受控时内部翻转也照发一次 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhCheckbox } from "@xihan-ui/vue";

const log = ref<string[]>([]);

// 只留最近五条
function onCheckedChange(details: { checked: boolean }) {
  log.value = [details.checked ? "勾上" : "取消", ...log.value].slice(0, 5);
}
<\/script>

<template>
  <XhCheckbox @checked-change="onCheckedChange" />
  <span>最近：{{ log.join(" ← ") || "（还没动过）" }}</span>
</template>
`;export{e as default};
