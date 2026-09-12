<!-- 平台 | Mac 使用符号，其他平台使用文字 -->
<script setup lang="ts">
import { XhKbdGroup } from "@xihan-ui/vue";

const combo = ["Mod", "S"];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <span style="display: flex; align-items: center; gap: 8px">
      <span>Mac</span>
      <XhKbdGroup :keys="combo" platform="mac" />
    </span>
    <span style="display: flex; align-items: center; gap: 8px">
      <span>Windows</span>
      <XhKbdGroup :keys="combo" platform="other" />
    </span>
  </div>
</template>
