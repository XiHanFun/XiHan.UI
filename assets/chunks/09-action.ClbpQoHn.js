const e=`<!-- 浮层里的操作区 | content 里除了树还能放别的：在浮层内点按钮不算点在外面，浮层不会因此收起 -->
<script setup lang="ts">
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
];
<\/script>

<template>
  <!-- 根部件的插槽把操作入口交出来，浮层里的按钮直接调它们 -->
  <XhTreeSelectRoot
    v-slot="{ canClear, clear, setExpandedValue }"
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
          <XhTreeSelectBranch v-for="dir in files" :key="dir.value" :value="dir.value">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger>▸</XhTreeSelectBranchTrigger>
              <XhTreeSelectBranchText>{{ dir.label }}</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="file in dir.children"
                :key="file.value"
                :value="file.value"
              >
                <XhTreeSelectItemIndicator>✓</XhTreeSelectItemIndicator>
                <XhTreeSelectItemText>{{ file.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>

        <div style="display: flex; gap: 8px; padding: 8px 4px 4px">
          <button type="button" @click="setExpandedValue(['docs', 'assets'])">全部展开</button>
          <button type="button" @click="setExpandedValue([])">全部收起</button>
          <button type="button" :disabled="!canClear" @click="clear()">清空</button>
        </div>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
</template>
`;export{e as default};
