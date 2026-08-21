const e=`<!-- 多选与表单 | multiple 下确认键是切换、浮层不收起；写了 hidden-input 才随表单提交，多个值按逗号拼成一串 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectHiddenInput,
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

const files = [
  {
    value: "src",
    label: "src",
    children: [
      { value: "index", label: "index.ts" },
      { value: "app", label: "app.vue" },
    ],
  },
  { value: "readme", label: "README.md" },
];

const picked = ref<string[]>(["index"]);
<\/script>

<template>
  <XhTreeSelectRoot
    v-model:value="picked"
    :collection="files"
    :default-expanded-value="['src']"
    multiple
    name="docs"
    placeholder="可以多选"
    style="max-inline-size: 320px"
  >
    <XhTreeSelectLabel>提交范围</XhTreeSelectLabel>
    <XhTreeSelectTrigger>
      <XhTreeSelectValueText />
      <XhTreeSelectIndicator>▾</XhTreeSelectIndicator>
    </XhTreeSelectTrigger>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch value="src">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger>▸</XhTreeSelectBranchTrigger>
              <XhTreeSelectBranchText>src</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="index">
                <XhTreeSelectItemIndicator>✓</XhTreeSelectItemIndicator>
                <XhTreeSelectItemText>index.ts</XhTreeSelectItemText>
              </XhTreeSelectItem>
              <XhTreeSelectItem value="app">
                <XhTreeSelectItemIndicator>✓</XhTreeSelectItemIndicator>
                <XhTreeSelectItemText>app.vue</XhTreeSelectItemText>
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
    <XhTreeSelectHiddenInput />
  </XhTreeSelectRoot>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
`;export{e as default};
