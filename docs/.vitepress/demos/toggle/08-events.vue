<!-- 受控状态 | 由外部状态控制按下值 -->
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
import { ref } from "vue";

const pressed = ref(true);
</script>

<template>
  <XhToggle v-model:pressed="pressed">自动保存</XhToggle>
</template>
