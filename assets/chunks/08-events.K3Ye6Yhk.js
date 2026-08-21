const e=`<!-- 变化回调 | pressed-change 每次带着 details 报一次按下意图；不做受控绑定时它就是拿到新值的唯一出口 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhToggle } from "@xihan-ui/vue";

const trail = ref<string[]>([]);

function onPressedChange(details: { pressed: boolean }) {
  // 只留最近三次
  trail.value = [details.pressed ? "开" : "关", ...trail.value].slice(0, 3);
}
<\/script>

<template>
  <XhToggle variant="outline" @pressed-change="onPressedChange">静音</XhToggle>
  <span style="font-size: 13px;">
    最近三次：{{ trail.join(" · ") || "（还没动过）" }}
  </span>
</template>
`;export{e as default};
