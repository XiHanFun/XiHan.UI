const e=`<!-- 对外值换个写法 | 组件读写的恒是 ISO 串，宿主在读写两头各转一次换成自己的格式，表单也提交这一份 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

// 宿主与后端约定的写法
const stored = ref("2026/07/28");

// 读时换成 ISO 交给组件，写回时换回宿主的写法
const iso = computed<string | null>({
  get: () => (stored.value ? stored.value.split("/").join("-") : null),
  set: (next) => {
    stored.value = next ? next.split("-").join("/") : "";
  },
});
<\/script>

<template>
  <XhDateFieldRoot v-model:value="iso" locale="zh-CN">
    <XhDateFieldLabel>结算日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
    <!-- 不用内建的隐藏输入，自己写一份提交宿主格式 -->
    <input type="hidden" name="settle" :value="stored" />
  </XhDateFieldRoot>

  <span style="font-size: 13px">
    随表单提交的是：{{ stored || "（未填齐）" }} · 组件里的值是：{{ iso ?? "null" }}
  </span>
</template>
`;export{e as default};
