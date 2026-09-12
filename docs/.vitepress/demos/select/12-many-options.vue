<!-- 大量选项 | 列表内部滚动并支持连打检索 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const options = Array.from(letters, letter => ({ value: letter, label: `${letter} 区` }));
</script>

<template>
  <XhSelectRoot
    :collection="options"
    label="仓位"
    placeholder="敲 M 试试"
  />
</template>
