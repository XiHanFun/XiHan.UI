const t=`<!-- 只渐变一段 | 组件是行内的，可以只包住整句话里的几个字，字号字重由外面的文字决定 -->
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";
<\/script>

<template>
  <p style="font-size: 28px; font-weight: 700; line-height: 1.6">
    快速、轻量、高效、用心的
    <XhGradientText direction="to-bottom-right" from="#7c3aed" to="#06b6d4">
      设计系统运行时
    </XhGradientText>
  </p>
</template>
`;export{t as default};
