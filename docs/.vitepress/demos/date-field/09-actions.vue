<!-- 外部写值与清空 | 值由宿主持有，按钮直接写值；清空交给组件自带的清空钮，有值才出现；填齐与越界两个判据由组件给出 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhDateFieldClearTrigger,
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

const value = ref<string | null>(null);

// 相对今天偏移若干天的 ISO 串
function shift(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

const today = shift(0);
const nextWeek = shift(7);
</script>

<template>
  <XhDateFieldRoot
    v-slot="{ complete, outOfRange, setValue }"
    v-model:value="value"
    :min="today"
    locale="zh-CN"
  >
    <XhDateFieldLabel>取件日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldSegmentGroup>
      <!-- 一段都没填时清空钮收起；填了任意一段就出现 -->
      <XhDateFieldClearTrigger />
    </XhDateFieldControl>

    <div style="display: flex; gap: 8px">
      <XhButton size="sm" variant="outline" @click="setValue(today)">今天</XhButton>
      <XhButton size="sm" variant="outline" @click="setValue(nextWeek)">
        七天后
      </XhButton>
    </div>

    <span style="font-size: 13px">
      {{ complete ? (outOfRange ? "早于今天，收不了件" : "可取件") : "未填齐" }}
    </span>
  </XhDateFieldRoot>
</template>
