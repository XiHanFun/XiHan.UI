<!-- 放置位 | placement 是首选位，空间不足时引擎自行避让，实际落点写在 data-placement 上 -->
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

const placements = ["top", "bottom", "left", "right"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhPopconfirmRoot
      v-for="placement in placements"
      :key="placement"
      :placement="placement"
    >
      <XhPopconfirmTrigger>{{ placement }}</XhPopconfirmTrigger>
      <XhPopconfirmPositioner>
        <XhPopconfirmContent>
          <XhPopconfirmDescription>
            要把这条移出列表吗？
          </XhPopconfirmDescription>
          <XhPopconfirmCancelTrigger>再想想</XhPopconfirmCancelTrigger>
          <XhPopconfirmConfirmTrigger>移出</XhPopconfirmConfirmTrigger>
        </XhPopconfirmContent>
      </XhPopconfirmPositioner>
    </XhPopconfirmRoot>
  </div>
</template>
