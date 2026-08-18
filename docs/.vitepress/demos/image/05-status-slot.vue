<!-- 按状态分流的回退内容 | 状态一落位就报出来：加载中给占位、失败给提示与重试入口，两套内容共用同一个回退部件 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

const good
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%203%202%22%3E%3Crect%20width=%223%22%20height=%222%22%20fill=%22%23334155%22/%3E%3Ccircle%20cx=%222.2%22%20cy=%220.6%22%20r=%220.3%22%20fill=%22%23fde68a%22/%3E%3Cpath%20d=%22M0%202%201.2%200.8%202%201.5%202.6%201%203%201.4V2z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";

// 一开始给个取不到的地址，重试时换成能取到的
const src = ref("https://example.invalid/photo.png");
</script>

<template>
  <XhImageRoot
    :src="src"
    alt="风景照"
    style="--xh-image-w: 200px; --xh-image-ratio: 3 / 2;"
  >
    <template #default="{ status }">
      <XhImageImage />
      <XhImageFallback>
        <!-- 失败与加载中是两回事，文案与可操作性都该不一样 -->
        <span v-if="status === 'error'" style="display: inline-flex; gap: 8px; align-items: center;">
          取不到这张图
          <button type="button" @click="src = good">重试</button>
        </span>
        <span v-else>正在加载…</span>
      </XhImageFallback>
    </template>
  </XhImageRoot>
</template>
