<!-- 关键词过滤 | filter-text 给检索词：树按它裁到只剩命中的那几枝，祖先保留并自动展开；搜索里的展开单独记，清空检索词即回到原来的展开态 -->
<script setup lang="ts">
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeEmpty,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";
import { ref } from "vue";

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
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTextFieldRoot v-model:value="keyword" type="search" placeholder="输入城市名" clearable>
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="城市关键词" />
        <XhTextFieldClearTrigger />
      </XhTextFieldControl>
    </XhTextFieldRoot>

    <!-- 标记照整棵树写：不在搜索结果里的节点由组件收起 -->
    <XhTreeRoot :collection="source" :default-expanded-value="['east']" :filter-text="keyword">
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="region in source" :key="region.value" :value="region.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>{{ region.label }}</XhTreeBranchText>
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="city in region.children" :key="city.value" :value="city.value">
              <XhTreeItemText>{{ city.label }}</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
      <!-- 空态占位：一枝都没命中时由组件露出来 -->
      <XhTreeEmpty>没有匹配「{{ keyword }}」的城市</XhTreeEmpty>
    </XhTreeRoot>
  </div>
</template>
