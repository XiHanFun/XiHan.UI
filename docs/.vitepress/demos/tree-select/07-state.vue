<!-- 禁用、只读与校验失败 | disabled 连键盘入口都没有；readOnly 照常展开浏览但值改不动也清不掉；invalid 只报校验态，交互一切照旧 -->
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
  { value: "readme", label: "README.md" },
];

const states = [
  { key: "disabled", label: "禁用", disabled: true, readOnly: false, invalid: false },
  { key: "readonly", label: "只读", disabled: false, readOnly: true, invalid: false },
  { key: "invalid", label: "校验失败", disabled: false, readOnly: false, invalid: true },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
    <XhTreeSelectRoot
      v-for="s in states"
      :key="s.key"
      :collection="files"
      :disabled="s.disabled"
      :read-only="s.readOnly"
      :invalid="s.invalid"
      :default-value="['guide']"
      :default-expanded-value="['docs']"
      placeholder="选一个文件"
      style="inline-size: 220px"
    >
      <XhTreeSelectLabel>{{ s.label }}</XhTreeSelectLabel>
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
            <XhTreeSelectItem value="readme">
              <XhTreeSelectItemIndicator>✓</XhTreeSelectItemIndicator>
              <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
            </XhTreeSelectItem>
          </XhTreeSelectTree>
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </XhTreeSelectRoot>
  </div>
</template>
