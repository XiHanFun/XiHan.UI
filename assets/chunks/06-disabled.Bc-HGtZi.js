const r=`<!-- 禁用 | disabled 只关闭卡片本身，触发器照常可点击、可聚焦，也照常不进入展开等待 -->
<script setup lang="ts">
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const clicks = ref(0);
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhHoverCardRoot disabled placement="bottom-start" :open-delay="0">
      <XhHoverCardTrigger @click="clicks++">@xihan（卡片已关）</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <span>这张卡片不会出现。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>
    <span>已点 {{ clicks }} 次</span>
  </div>
</template>
`;export{r as default};
