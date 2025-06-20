<template>
  <div class="app">
    <header class="header">
      <h1>XiHan UI</h1>
    </header>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from "vue";
  import { generateFingerprint, generateStableFingerprint } from "@xihan-ui/utils";

  // 在组件挂载时获取指纹
  onMounted(async () => {
    // const fingerprint = await generateFingerprint();
    // console.log("指纹：", fingerprint);
    // const stableFingerprint = await generateStableFingerprint();
    // console.log("稳定设备指纹：", stableFingerprint);
  });
</script>
