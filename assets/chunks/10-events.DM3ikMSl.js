const n=`<!-- 值变化事件 | value-change 每次带上整份 ISO 串，段位被清掉时它是 null -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
} from "@xihan-ui/vue";

const log = ref<string[]>([]);

// 只留最近三条，新的排在前面
function onValueChange(details: { value: string | null }) {
  log.value = [details.value ?? "null", ...log.value].slice(0, 3);
}
<\/script>

<template>
  <XhDateFieldRoot
    default-value="2026-07-28"
    locale="zh-CN"
    @value-change="onValueChange"
  >
    <XhDateFieldLabel>改一改再看下面</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegment :index="0" />
      <span>年</span>
      <XhDateFieldSegment :index="1" />
      <span>月</span>
      <XhDateFieldSegment :index="2" />
      <span>日</span>
    </XhDateFieldControl>
  </XhDateFieldRoot>

  <span style="font-size: 13px">
    最近变化：{{ log.length ? log.join(" ← ") : "（还没动过）" }}
  </span>
</template>
`;export{n as default};
