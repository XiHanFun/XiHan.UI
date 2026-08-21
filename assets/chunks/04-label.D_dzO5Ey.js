const e=`<!-- 可及名字 | 缺省拿 value 当 aria-label；内容不是给人念的时候用 label 换一句人话 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhQrCode } from "@xihan-ui/vue";

const text = ref("https://ui.xihanfun.com");
<\/script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <input
      v-model="text"
      type="text"
      aria-label="要编码的内容"
      style="inline-size: 320px; max-inline-size: 100%"
    />
    <!-- 内容清空时不画码，读屏也读不到这块 -->
    <XhQrCode :value="text" :pixel-size="140" label="曦寒 UI 文档站二维码" />
  </div>
</template>
`;export{e as default};
