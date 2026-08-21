const r=`<!-- 延时 | openDelay 默认 700ms，closeDelay 默认 300ms——那段收起等待正是留给指针从触发器走到卡片上的通行时间 -->
<script setup lang="ts">
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhHoverCardRoot placement="bottom-start">
      <XhHoverCardTrigger>默认（700 / 300）</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <span>停够 700ms 才展开，指针移开 300ms 才收起。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>

    <XhHoverCardRoot placement="bottom-start" :open-delay="0" :close-delay="800">
      <XhHoverCardTrigger>快开慢收（0 / 800）</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <span>指针一进就展开，移开后还留 800ms 给你走回来。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>
  </div>
</template>
`;export{r as default};
