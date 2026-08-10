<!-- 关键词过滤 | collection 换一份树就换一棵：标记跟着数据用 v-for 渲，过滤剩下的分支顺手全展开 -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

interface City {
  value: string;
  label: string;
}

interface Region {
  value: string;
  label: string;
  children: City[];
}

const source: Region[] = [
  {
    value: "east",
    label: "华东",
    children: [
      { value: "sh", label: "上海" },
      { value: "hz", label: "杭州" },
      { value: "nj", label: "南京" },
    ],
  },
  {
    value: "north",
    label: "华北",
    children: [
      { value: "bj", label: "北京" },
      { value: "tj", label: "天津" },
    ],
  },
  {
    value: "south",
    label: "华南",
    children: [
      { value: "gz", label: "广州" },
      { value: "sz", label: "深圳" },
    ],
  },
];

const keyword = ref("");

// 分支名命中就整枝留下，否则只留命中的子节点；一个子节点都不剩的分支整枝去掉
const collection = computed<Region[]>(() => {
  const key = keyword.value.trim();
  if (!key) return source;
  return source
    .map((region) => ({
      ...region,
      children: region.label.includes(key)
        ? region.children
        : region.children.filter((city) => city.label.includes(key)),
    }))
    .filter((region) => region.children.length > 0);
});

const expanded = ref<string[]>(["east"]);

watch(keyword, () => {
  expanded.value = collection.value.map((region) => region.value);
});
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <input v-model="keyword" type="search" aria-label="城市关键词" placeholder="输入城市名" />

    <XhTreeRoot v-model:expanded-value="expanded" :collection="collection">
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="region in collection" :key="region.value" :value="region.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
            <XhTreeBranchText>{{ region.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="city in region.children" :key="city.value" :value="city.value">
              <XhTreeItemIndicator>✓</XhTreeItemIndicator>
              <XhTreeItemText>{{ city.label }}</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>

    <span v-if="!collection.length">没有匹配「{{ keyword }}」的城市</span>
  </div>
</template>
