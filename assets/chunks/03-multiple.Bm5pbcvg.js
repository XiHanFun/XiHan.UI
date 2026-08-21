const n=`<!-- 多选 | multiple 换的是整套 ARIA：root 退回 group、条目退回原生按钮 + aria-pressed，值也从字符串变成数组 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const marks = ref<string[]>(["bold"]);

const markOptions = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
];

const overlays = [
  { value: "grid", label: "网格" },
  { value: "ruler", label: "标尺" },
  { value: "guide", label: "参考线" },
];
<\/script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot v-model:value="marks" :collection="markOptions" multiple />
    <span style="font-size: 13px;">当前：{{ marks.join("、") || "（无选中）" }}</span>
  </span>

  <!-- 竖排只改视觉排布，方向键接受的轴与它无关，四个方向键恒响应 -->
  <XhToggleGroupRoot
    :collection="overlays"
    :default-value="['grid']"
    multiple
    orientation="vertical"
  />
</template>
`;export{n as default};
