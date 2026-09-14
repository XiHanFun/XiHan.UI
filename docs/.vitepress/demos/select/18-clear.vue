<!-- 清空 | 有值时显示清空按钮 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const teams = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

</script>

<template>
  <XhSelectRoot
    :collection="teams"
    :default-value="['frontend']"
    :translations="{ clearTrigger: '清空所选' }"
    clearable
    label="所属小组"
    placeholder="选一个组"
    style="inline-size: 240px"
  />
</template>
