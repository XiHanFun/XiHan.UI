<!-- 段位自定义文本 | 段位插槽给出这一段的类型、取值与焦点状态，离焦后年份只留两位、月份换成中文名 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
} from "@xihan-ui/vue";

const value = ref<string | null>("2026-07-28");

const MONTH_NAMES = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

// 插槽交出来的这一段
interface Segment {
  type: string;
  value: number | null;
  text: string;
  empty: boolean;
  focused: boolean;
}

// 空段与正在编辑的段照原样显示，其余按自己的写法渲染
function display(segment: Segment) {
  if (segment.empty || segment.focused) return segment.text;
  if (segment.type === "year") return segment.text.slice(-2);
  if (segment.type === "month") return MONTH_NAMES[(segment.value ?? 1) - 1];
  return segment.text;
}
</script>

<template>
  <XhDateFieldRoot v-model:value="value" locale="zh-CN">
    <XhDateFieldLabel>发布日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegment v-slot="{ segment }" :index="0">
        {{ display(segment) }}
      </XhDateFieldSegment>
      <span>年</span>
      <XhDateFieldSegment v-slot="{ segment }" :index="1">
        {{ display(segment) }}
      </XhDateFieldSegment>
      <XhDateFieldSegment v-slot="{ segment }" :index="2">
        {{ display(segment) }}
      </XhDateFieldSegment>
      <span>日</span>
    </XhDateFieldControl>
  </XhDateFieldRoot>

  <span style="font-size: 13px">值仍是 ISO 串：{{ value ?? "（未填齐）" }}</span>
</template>
