const e=`<!-- 只挑文件不挑目录 | 选中值与展开态双受控：目录的值不写回，紧跟着那一次收起意图也一并吞掉，点目录就只剩展开收起 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
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

interface Node {
  value: string;
  label: string;
  children?: Node[];
}

const files: Node[] = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
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
  {
    value: "assets",
    label: "assets",
    children: [{ value: "logo", label: "logo.svg" }],
  },
  { value: "readme", label: "README.md" },
];

// 目录的值集合：判定这次选中该不该写回
const dirs = new Set<string>();
const collectDirs = (nodes: Node[]): void => {
  for (const node of nodes) {
    if (!node.children) continue;
    dirs.add(node.value);
    collectDirs(node.children);
  }
};
collectDirs(files);

const value = ref<string[]>([]);
const open = ref(false);
let swallowClose = false;

function onValueChange(details: { value: string[] }): void {
  if (details.value.some((v) => dirs.has(v))) {
    // 目录不进选中值；单选下紧跟着的那次收起随之作废
    swallowClose = true;
    return;
  }
  value.value = details.value;
}

function onOpenChange(details: { open: boolean }): void {
  if (!details.open && swallowClose) {
    swallowClose = false;
    return;
  }
  open.value = details.open;
}
<\/script>

<template>
  <XhTreeSelectRoot
    :collection="files"
    :value="value"
    :open="open"
    :default-expanded-value="['docs']"
    placeholder="选一个文件"
    style="max-inline-size: 320px"
    @value-change="onValueChange"
    @open-change="onOpenChange"
  >
    <XhTreeSelectLabel>附件</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
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

          <XhTreeSelectBranch value="assets">
            <XhTreeSelectBranchControl>
  <XhTreeSelectBranchTrigger />
  <XhTreeSelectBranchText>assets</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="logo">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>logo.svg</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>

          <XhTreeSelectItem value="readme">
            <XhTreeSelectItemIndicator />
            <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
          </XhTreeSelectItem>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>已选：{{ value.length ? value.join("、") : "（无）" }}</p>
</template>
`;export{e as default};
