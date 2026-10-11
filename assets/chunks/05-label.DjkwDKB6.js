var e=`<!-- 可及名字 | 默认使用 value 作为 aria-label；内容不适合朗读时用 label 替换为可读文案 -->
<script setup lang="ts">
import { XhMatrixCode, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const text = ref("https://ui.xihanfun.com");
<\/script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhTextFieldRoot v-model:value="text">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="要编码的内容" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <!-- 内容清空时不画码，读屏也读不到这块 -->
    <XhMatrixCode :value="text" :pixel-size="140" label="曦寒 UI 文档站二维码" />
  </div>
</template>
`;export{e as default};