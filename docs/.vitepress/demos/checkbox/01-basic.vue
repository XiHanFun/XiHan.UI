<!-- 基础用法 | 不传 checked 即为非受控 -->
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
</script>

<template>
  <XhCheckbox />
  <XhCheckbox default-checked />
  <XhCheckbox disabled />
</template>
