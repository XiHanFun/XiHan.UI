<!-- 选中与展开双受控 | 两份集合都由宿主持有：组件只发事件，宿主写回它才动，回显的就是写回的那两份 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectClearTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
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

// draft.md 是禁用叶子：方向键与连打检索跳过它，确认键也不认它
const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "draft", label: "draft.md（禁用）", disabled: true },
      {
        value: "i18n",
        label: "i18n",
        children: [
          { value: "zh", label: "zh-CN.md" },
          { value: "en", label: "en-US.md" },
        ],
      },
    ],
  },
];

const value = ref<string[]>(["guide"]);
const expanded = ref<string[]>(["docs"]);
</script>

<template>
  <XhTreeSelectRoot
    v-model:value="value"
    v-model:expanded-value="expanded"
    :collection="files"
    placeholder="选一个文件"
    style="max-inline-size: 320px"
  >
    <XhTreeSelectLabel>文档</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
      <XhTreeSelectClearTrigger />
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch value="docs">
            <XhTreeSelectBranchControl>
  <XhTreeSelectBranchTrigger />
  <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="guide">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
              </XhTreeSelectItem>
              <XhTreeSelectItem value="draft">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>draft.md（禁用）</XhTreeSelectItemText>
              </XhTreeSelectItem>
              <XhTreeSelectBranch value="i18n">
                <XhTreeSelectBranchControl>
  <XhTreeSelectBranchTrigger />
  <XhTreeSelectBranchText>i18n</XhTreeSelectBranchText>
                </XhTreeSelectBranchControl>
                <XhTreeSelectBranchContent>
                  <XhTreeSelectItem value="zh">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>zh-CN.md</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                  <XhTreeSelectItem value="en">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>en-US.md</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                </XhTreeSelectBranchContent>
              </XhTreeSelectBranch>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>已选：{{ value.join("、") || "（无）" }} · 展开：{{ expanded.join("、") || "（无）" }}</p>
</template>
