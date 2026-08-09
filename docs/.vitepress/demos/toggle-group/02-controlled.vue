<!-- 受控与不可清空 | 传了 value 就由宿主说了算；单选组再点一次当前项会清空成 null，disallow-empty 把这一手关掉 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";

const align = ref<string | null>("left");
const density = ref<string | null>("comfortable");
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot v-model:value="align">
      <XhToggleGroupItem value="left">左对齐</XhToggleGroupItem>
      <XhToggleGroupItem value="center">居中</XhToggleGroupItem>
      <XhToggleGroupItem value="right">右对齐</XhToggleGroupItem>
    </XhToggleGroupRoot>
    <span style="font-size: 13px;">当前：{{ align ?? "（无选中）" }}</span>
  </span>

  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot v-model:value="density" disallow-empty>
      <XhToggleGroupItem value="compact">紧凑</XhToggleGroupItem>
      <XhToggleGroupItem value="comfortable">宽松</XhToggleGroupItem>
    </XhToggleGroupRoot>
    <span style="font-size: 13px;">disallow-empty：{{ density }}，点不成空</span>
  </span>
</template>
