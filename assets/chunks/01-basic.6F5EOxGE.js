const n=`<!-- 基础用法 | 与 Tooltip 的分界在于卡片本体可交互：指针停在卡片上不收起，里面的链接与按钮都点得到 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";

const following = ref(false);
<\/script>

<template>
  <div>
    最近这批组件由
    <XhHoverCardRoot placement="bottom-start">
      <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <strong>XiHan.UI</strong>
          <span>框架无关的设计系统运行时，Vue 与 Web Components 共用同一套无头内核。</span>
          <XhButton size="sm" variant="outline" @click="following = !following">
            {{ following ? "已关注" : "关注" }}
          </XhButton>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>
    推上来。
  </div>
</template>
`;export{n as default};
