const e=`<!-- 换色 | 颜色不是 props，写两个 CSS 变量即可：条必须比底色深且对比充足，反相码无法扫描 -->
<script setup lang="ts">
import { XhBarCode } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode value="COLOR" :height="48" />
      <span style="font-size: 12px">缺省</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <!-- 只换条色，人读文字跟着走 -->
      <XhBarCode value="COLOR" :height="48" style="--xh-bar-code-fg: #1d4ed8" />
      <span style="font-size: 12px">深蓝条</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode value="COLOR" :height="48" style="--xh-bar-code-bg: #fff7ed; --xh-bar-code-fg: #431407" />
      <span style="font-size: 12px">暖底深棕</span>
    </div>
  </div>
</template>
`;export{e as default};
