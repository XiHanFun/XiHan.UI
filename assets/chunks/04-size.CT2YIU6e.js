const n=`<!-- 尺寸 | 三档换的是卡片的内边距与字号，不写 size 即缺省档；把指针停在触发器上看差别 -->
<script setup lang="ts">
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "大" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhHoverCardRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.value"
      placement="bottom-start"
      :open-delay="0"
    >
      <XhHoverCardTrigger>{{ s.label }}</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <strong>{{ s.label }}档</strong>
          <span>size = {{ s.value ?? "未指定" }}。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>
  </div>
</template>
`;export{n as default};
