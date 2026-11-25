<!-- 加载 | 点击后进入 loading：保留按钮标签，完成前阻止重复操作 -->
<script setup lang="ts">
import { XhButton, XhButtonIndicator, XhButtonLabel } from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);

async function save() {
  loading.value = true;
  await new Promise(resolve => setTimeout(resolve, 1200));
  loading.value = false;
}
</script>

<template>
  <XhButton :loading="loading" @click="save">
    <XhButtonIndicator />
    <XhButtonLabel>保存</XhButtonLabel>
  </XhButton>
</template>
