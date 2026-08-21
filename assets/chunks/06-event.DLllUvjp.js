const e=`<!-- 事件 | checked-change 带一份 { checked }，非受控时内部转移也照发一次 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSwitch } from "@xihan-ui/vue";

const times = ref(0);
const last = ref("（还没动过）");

function onCheckedChange(details: { checked: boolean }) {
  times.value += 1;
  last.value = details.checked ? "开" : "关";
}
<\/script>

<template>
  <XhSwitch @checked-change="onCheckedChange" />
  <span>翻转 {{ times }} 次 · 最近落到 {{ last }}</span>
</template>
`;export{e as default};
