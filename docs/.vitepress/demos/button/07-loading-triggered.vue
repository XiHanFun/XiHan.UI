<!-- 异步操作 | 点击后显示加载状态 -->
<script setup lang="ts">
import { LoaderIcon } from "@xihan-ui/icons";
import { XhButton, XhButtonIndicator, XhButtonLabel, XhIcon } from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);

async function save() {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1200));
  loading.value = false;
}
</script>

<template>
  <XhButton :loading="loading" @click="save">
    <XhButtonIndicator><XhIcon :icon="LoaderIcon" /></XhButtonIndicator>
    <XhButtonLabel>保存</XhButtonLabel>
  </XhButton>
</template>
