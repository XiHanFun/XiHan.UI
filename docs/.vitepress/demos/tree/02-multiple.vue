<!-- 多选 | selectionMode 默认 single，改成 multiple 后点击与确认键都变成切换，选中集合形状不变仍是数组 -->
<script setup lang="ts">
import { ref } from "vue";
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

const collection = [
  {
    value: "cn",
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
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot
      v-model:selected-value="selected"
      :collection="collection"
      :default-expanded-value="['cn', 'north']"
      selection-mode="multiple"
    >
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch value="cn">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
            <XhTreeBranchText>华东</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="sh">
              <XhTreeItemIndicator>✓</XhTreeItemIndicator>
              <XhTreeItemText>上海</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="hz">
              <XhTreeItemIndicator>✓</XhTreeItemIndicator>
              <XhTreeItemText>杭州</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="nj">
              <XhTreeItemIndicator>✓</XhTreeItemIndicator>
              <XhTreeItemText>南京</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="north">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
            <XhTreeBranchText>华北</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="bj">
              <XhTreeItemIndicator>✓</XhTreeItemIndicator>
              <XhTreeItemText>北京</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="tj">
              <XhTreeItemIndicator>✓</XhTreeItemIndicator>
              <XhTreeItemText>天津</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>选中：{{ selected.length ? selected.join("、") : "（无）" }}</span>
  </div>
</template>
