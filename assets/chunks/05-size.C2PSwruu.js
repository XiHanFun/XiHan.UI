const e=`<!-- 尺寸 | size 换的是圆点直径、条目间距与字号，不传 size 即默认档 -->
<script setup lang="ts">
import {
  XhTimelineConnector,
  XhTimelineContent,
  XhTimelineDescription,
  XhTimelineIndicator,
  XhTimelineItem,
  XhTimelineRoot,
  XhTimelineTitle,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const events = [
  { title: "提交", description: "12 个文件" },
  { title: "合并", description: "两条评审意见" },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 24px">
    <div v-for="s in sizes" :key="s.label" style="inline-size: 200px">
      <div style="margin-block-end: 8px; font-size: 12px">{{ s.label }}</div>
      <XhTimelineRoot :size="s.size">
        <XhTimelineItem v-for="e in events" :key="e.title">
          <XhTimelineIndicator />
          <XhTimelineConnector />
          <XhTimelineContent>
            <XhTimelineTitle>{{ e.title }}</XhTimelineTitle>
            <XhTimelineDescription>{{ e.description }}</XhTimelineDescription>
          </XhTimelineContent>
        </XhTimelineItem>
      </XhTimelineRoot>
    </div>
  </div>
</template>
`;export{e as default};
