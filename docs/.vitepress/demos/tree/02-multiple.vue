<!-- 多选 | multiple 关闭时是单选，开启后点击与确认键都变为切换，选中集合形状不变仍是数组 -->
<script setup lang="ts">
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
import { ref } from "vue";

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
      v-model:selection="selected"
      :collection="collection"
      :default-expanded-value="['cn', 'north']"
      multiple
    >
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch value="cn">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>华东</XhTreeBranchText>
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="sh">
              <XhTreeItemText>上海</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
            <XhTreeItem value="hz">
              <XhTreeItemText>杭州</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
            <XhTreeItem value="nj">
              <XhTreeItemText>南京</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="north">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>华北</XhTreeBranchText>
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="bj">
              <XhTreeItemText>北京</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
            <XhTreeItem value="tj">
              <XhTreeItemText>天津</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>选中：{{ selected.length ? selected.join("、") : "（无）" }}</span>
  </div>
</template>
