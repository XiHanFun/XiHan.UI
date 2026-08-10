<!-- 横向列表 | horizontal 把主轴换成行内轴：位移改写进行首侧，条目宽度由作者写，gap 由内核直接算进位移 -->
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
</script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="500"
    :estimate-size="120"
    :gap="8"
    horizontal
    style="block-size: 96px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            inline-size: 120px;
            block-size: 68px;
            border: 1px solid var(--xh-border-subtle);
            border-radius: 8px;
          "
        >
          第 {{ item.index + 1 }} 张
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
