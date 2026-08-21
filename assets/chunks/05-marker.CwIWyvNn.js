const n=`<!-- 自定义展开标记 | 折叠区域不带指示器部件，标记由作者按 open 自己画，触发器两端对齐排 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
<\/script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhCollapsibleRoot v-model:open="open">
      <XhCollapsibleTrigger>
        <span>高级筛选</span>
        <!-- 标记跟着 open 换字形，触发器里放什么全归作者 -->
        <span style="font-size: 12px">{{ open ? "收起 ▴" : "展开 ▾" }}</span>
      </XhCollapsibleTrigger>
      <XhCollapsibleContent>
        创建时间、负责人、标签这些不常用的条件收在这里。
      </XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
`;export{n as default};
