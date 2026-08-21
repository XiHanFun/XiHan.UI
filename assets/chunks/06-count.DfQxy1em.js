const o=`<!-- 字数与上限 | 原生属性直接落到输入框上（maxlength 定上限），字数由宿主拿当前值现算 -->
<script setup lang="ts">
import { XhComposerInput, XhComposerRoot, XhComposerSubmitTrigger } from "@xihan-ui/vue";

const max = 40;
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhComposerRoot v-slot="{ value }">
      <XhComposerInput :maxlength="max" placeholder="最多 40 个字" rows="1" />
      <span style="font-size: 13px; white-space: nowrap">{{ value.length }} / {{ max }}</span>
      <XhComposerSubmitTrigger>发送</XhComposerSubmitTrigger>
    </XhComposerRoot>
  </div>
</template>
`;export{o as default};
