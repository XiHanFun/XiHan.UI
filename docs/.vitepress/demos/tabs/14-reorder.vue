<!-- 拖拽换位 | 整个标签都是拖动源：按住往旁边拖，落点画成一条线、被拖的标签原地不动；也可以聚焦标签带后按 Alt + 左右键挪一位（竖排是 Alt + 上下键），到首末就不动。库不拥有标签序，只报一次重排好的新顺序连同读屏播报，照它写回数组归使用者 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTabsContent,
  XhTabsList,
  XhTabsLiveRegion,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

/** 库报的换位：把 value 从第 from 位挪到第 to 位，values 是重排好的整份标签序。 */
interface TabMove {
  value: string;
  from: number;
  to: number;
  values: string[];
}

// 标签序的主人是这份数组，库按它算位置，也按它取标签文字
const tabs = ref([
  { value: "outline", label: "大纲" },
  { value: "draft", label: "草稿" },
  { value: "review", label: "评审" },
  { value: "publish", label: "发布" },
]);

const active = ref<string | null>("outline");
const log = ref("按住标签拖到别处，或聚焦标签带后按 Alt + 左右键");

// values 已经重排好，照它取一遍就是新数组；选中的是哪一页不受换位影响
function onTabMove(move: TabMove): void {
  const byValue = new Map(tabs.value.map((tab) => [tab.value, tab]));
  tabs.value = move.values.flatMap((value) => byValue.get(value) ?? []);
  log.value = `${byValue.get(move.value)?.label ?? move.value} 挪到了第 ${move.to + 1} 位`;
}
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhTabsRoot
      v-model:value="active"
      :collection="tabs"
      variant="card"
      reorderable
      @tab-move="onTabMove"
    >
      <XhTabsList>
        <XhTabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
        {{ tab.label }} 的内容
      </XhTabsContent>

      <!-- 播报区视觉隐藏，必须在拖动开始之前就在 DOM 上 -->
      <XhTabsLiveRegion />
    </XhTabsRoot>
    <span>{{ log }}</span>
  </div>
</template>
