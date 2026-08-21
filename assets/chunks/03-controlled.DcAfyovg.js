const o=`<!-- 受控 | 传了 open 就由宿主说了算；这里额外关掉点外部关闭，只有按钮与 Escape 能收起 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopoverRoot
      v-model:open="open"
      placement="bottom-start"
      :close-on-interact-outside="false"
    >
      <XhPopoverTrigger>浮层</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>受控浮层</XhPopoverTitle>
          <XhPopoverDescription>
            点页面别处不再关它，Escape 仍然有效。
          </XhPopoverDescription>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>

    <XhButton variant="outline" @click="open = !open">
      {{ open ? "收起" : "展开" }}
    </XhButton>
    <span>当前：{{ open ? "展开" : "收起" }}</span>
  </div>
</template>
`;export{o as default};
