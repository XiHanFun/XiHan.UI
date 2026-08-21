const e=`<!-- 排成一组 | 多个独立的 toggle 各管各的按下态；要互斥或单一 Tab 位请改用切换按钮组 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhToggle } from "@xihan-ui/vue";

const marks = ref({ bold: false, italic: false, underline: true });
<\/script>

<template>
  <XhToggle v-model:pressed="marks.bold">B</XhToggle>
  <XhToggle v-model:pressed="marks.italic">I</XhToggle>
  <XhToggle v-model:pressed="marks.underline">U</XhToggle>
  <span>{{ Object.entries(marks).filter(([, on]) => on).map(([k]) => k).join(" ") || "无" }}</span>
</template>
`;export{e as default};
