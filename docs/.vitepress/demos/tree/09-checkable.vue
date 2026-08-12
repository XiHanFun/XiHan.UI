<!-- 级联勾选 | selection-mode="multiple" 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；勾选框是行里的一段标记，态从插槽作用域取 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

const collection = [
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
];

const selected = ref<string[]>(["hz"]);

const boxStyle = {
  display: "inline-flex",
  flex: "none",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "1rem",
  blockSize: "1rem",
  border: "1px solid var(--xh-border-strong)",
  borderRadius: "3px",
  fontSize: "0.75rem",
  lineHeight: "1",
};
</script>

<template>
  <div style="display: grid; gap: 8px; justify-items: start">
    <XhTreeRoot
      v-slot="{ isSelected, isIndeterminate }"
      v-model:selected-value="selected"
      :collection="collection"
      :default-expanded-value="['east', 'north']"
      selection-mode="multiple"
      cascade
    >
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="region in collection" :key="region.value" :value="region.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
            <span aria-hidden="true" :style="boxStyle">
              {{ isSelected(region.value) ? "✓" : isIndeterminate(region.value) ? "–" : "" }}
            </span>
            <XhTreeBranchText>{{ region.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="city in region.children" :key="city.value" :value="city.value">
              <span aria-hidden="true" :style="boxStyle">
                {{ isSelected(city.value) ? "✓" : "" }}
              </span>
              <XhTreeItemText>{{ city.label }}</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <p>选中值（默认只收叶）：{{ selected.length ? selected.join("、") : "（无）" }}</p>
  </div>
</template>
