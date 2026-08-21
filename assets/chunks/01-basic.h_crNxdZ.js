const e=`<!-- 基础用法 | 收起时整个控件只占触发器一个 Tab 位，展开那一刻焦点真的进树、落在已选中的那行上 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";

// 层级、显示文本与节点禁用都查这份树数据，标记只管长相
const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
  {
    value: "assets",
    label: "assets",
    children: [{ value: "logo", label: "logo.svg" }],
  },
  { value: "readme", label: "README.md" },
];

const doc = ref<string[]>([]);
<\/script>

<template>
  <XhTreeSelectRoot
    v-model:value="doc"
    :collection="files"
    :default-expanded-value="['docs']"
    placeholder="选一个文件"
    style="max-inline-size: 320px"
  >
    <XhTreeSelectLabel>文档</XhTreeSelectLabel>
    <XhTreeSelectTrigger>
      <XhTreeSelectValueText />
      <XhTreeSelectIndicator>▾</XhTreeSelectIndicator>
    </XhTreeSelectTrigger>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch value="docs">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger>▸</XhTreeSelectBranchTrigger>
              <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="guide">
                <XhTreeSelectItemIndicator>✓</XhTreeSelectItemIndicator>
                <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
              </XhTreeSelectItem>
              <XhTreeSelectItem value="api">
                <XhTreeSelectItemIndicator>✓</XhTreeSelectItemIndicator>
                <XhTreeSelectItemText>api.md</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
          <XhTreeSelectBranch value="assets">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger>▸</XhTreeSelectBranchTrigger>
              <XhTreeSelectBranchText>assets</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="logo">
                <XhTreeSelectItemIndicator>✓</XhTreeSelectItemIndicator>
                <XhTreeSelectItemText>logo.svg</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
          <XhTreeSelectItem value="readme">
            <XhTreeSelectItemIndicator>✓</XhTreeSelectItemIndicator>
            <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
          </XhTreeSelectItem>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>已选：{{ doc.length ? doc.join("、") : "（无）" }}</p>
</template>
`;export{e as default};
