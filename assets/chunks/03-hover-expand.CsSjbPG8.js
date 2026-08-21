const e=`<!-- 悬停展开 | expand-trigger 改成 hover 后，指针划过分支即开子列，只挪展开路径不抢焦点；键盘仍走右方向键 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderIndicator,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/vue";

const menu = [
  {
    value: "frontend",
    label: "前端",
    children: [
      { value: "vue", label: "Vue" },
      { value: "wc", label: "Web Components" },
    ],
  },
  {
    value: "backend",
    label: "后端",
    children: [
      { value: "dotnet", label: ".NET" },
      { value: "node", label: "Node.js" },
    ],
  },
];

const picked = ref<string[][]>([]);
<\/script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    v-model:value="picked"
    :collection="menu"
    expand-trigger="hover"
    placeholder="划过即展开"
  >
    <XhCascaderLabel>方向</XhCascaderLabel>
    <XhCascaderTrigger>
      <XhCascaderValueText />
      <XhCascaderIndicator>▾</XhCascaderIndicator>
    </XhCascaderTrigger>
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem v-for="node in lv.items" :key="node.value" :value="node.value">
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <XhCascaderItemIndicator>✓</XhCascaderItemIndicator>
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>当前路径：{{ picked.length ? picked[0].join(" / ") : "（未选）" }}</p>
</template>
`;export{e as default};
