const n=`<!-- 语气 | 在 content 上写 data-tone，确认按钮跟着换色；语气是共享的一层，不是本组件的 prop -->
<script setup lang="ts">
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTrigger,
} from "@xihan-ui/vue";

const tones = ["brand", "danger", "warning"] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhPopconfirmRoot v-for="tone in tones" :key="tone" size="sm">
      <XhPopconfirmTrigger>{{ tone }}</XhPopconfirmTrigger>
      <XhPopconfirmPositioner>
        <XhPopconfirmContent :data-tone="tone">
          <XhPopconfirmDescription>确定要执行这一步吗？</XhPopconfirmDescription>
          <XhPopconfirmCancelTrigger>取消</XhPopconfirmCancelTrigger>
          <XhPopconfirmConfirmTrigger>确定</XhPopconfirmConfirmTrigger>
        </XhPopconfirmContent>
      </XhPopconfirmPositioner>
    </XhPopconfirmRoot>
  </div>
</template>
`;export{n as default};
