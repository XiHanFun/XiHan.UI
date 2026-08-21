const n=`<!-- 方向 | 竖向分隔线需要父容器有确定高度 -->
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="width: 100%">
    <p>上一段</p>
    <XhSeparator />
    <p>下一段</p>
  </div>
  <div style="display: flex; align-items: center; gap: 12px; height: 24px">
    <span>左</span>
    <XhSeparator orientation="vertical" />
    <span>右</span>
  </div>
</template>
`;export{n as default};
