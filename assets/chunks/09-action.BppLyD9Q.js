var e=`<!-- 浮层中的操作区 | footer 写在 content 中、tree 的兄弟：它不进入 role=tree 的拥有关系，方向键也无法到达；在浮层内点击按钮不算点击外部，浮层不会因此收起 -->
<script setup lang="ts">
import {
  XhButton,
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectFooter,
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
  >
    <XhTreeSelectLabel>文档</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch v-for="dir in files" :key="dir.value" :value="dir.value">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>{{ dir.label }}</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="file in dir.children"
                :key="file.value"
                :value="file.value"
              >
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>{{ file.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>

        <XhTreeSelectFooter>
          <XhButton variant="ghost" size="sm" @click="setExpandedValue(['docs', 'assets'])">全部展开</XhButton>
          <XhButton variant="ghost" size="sm" @click="setExpandedValue([])">全部收起</XhButton>
          <XhButton variant="ghost" size="sm" :disabled="!canClear" @click="clear()">清空</XhButton>
        </XhTreeSelectFooter>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
</template>
`;export{e as default};