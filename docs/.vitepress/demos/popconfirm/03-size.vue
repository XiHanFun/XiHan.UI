<!-- 尺寸 | size 换的是面板的内边距与最大宽度，三个档位落在 content 上 -->
<script setup lang="ts">
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
} from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhPopconfirmRoot v-for="size in sizes" :key="size" :size="size">
      <XhPopconfirmTrigger>{{ size }}</XhPopconfirmTrigger>
      <XhPopconfirmPositioner>
        <XhPopconfirmContent>
          <XhPopconfirmTitle>停用这个账号</XhPopconfirmTitle>
          <XhPopconfirmDescription>
            停用后该账号无法登录，已建立的会话会在下次刷新时失效。
          </XhPopconfirmDescription>
          <XhPopconfirmCancelTrigger>取消</XhPopconfirmCancelTrigger>
          <XhPopconfirmConfirmTrigger>停用</XhPopconfirmConfirmTrigger>
        </XhPopconfirmContent>
      </XhPopconfirmPositioner>
    </XhPopconfirmRoot>
  </div>
</template>
