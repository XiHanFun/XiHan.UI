var e=`<!-- 拖拽排序 | 按住标签拖到新位置，或焦点在标签上按 Alt + 方向键挪一位 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const views = ref([
  { value: "board", label: "看板" },
  { value: "list", label: "列表" },
  { value: "calendar", label: "日历" },
  { value: "timeline", label: "时间线" },
]);

// 元素只报重排好的新顺序，写回数据源才算挪动
function move(details: { values: string[] }): void {
  views.value = details.values.map(value => views.value.find(view => view.value === value)!);
}
<\/script>

<template>
  <XhTabsRoot default-value="board" :collection="views" reorderable style="inline-size: 420px; max-inline-size: 100%" @tab-move="move">
    <XhTabsList aria-label="视图">
      <XhTabsTrigger v-for="view in views" :key="view.value" :value="view.value">{{ view.label }}</XhTabsTrigger>
      <XhTabsIndicator />
    </XhTabsList>

    <XhTabsContent v-for="view in views" :key="view.value" :value="view.value">按{{ view.label }}查看任务。</XhTabsContent>
  </XhTabsRoot>
</template>
`;export{e as default};