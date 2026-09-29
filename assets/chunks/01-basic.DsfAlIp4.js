const i=`<!-- 单选与行内操作 | 点击行只改变选择，行内按钮执行自己的动作 -->
<script setup lang="ts">
import type { GridListNode } from "@xihan-ui/headless";
import {
  XhGridListLabel,
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowAction,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowDescription,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const projects: GridListNode[] = [
  { value: "docs", label: "文档站", description: "组件文档与示例" },
  { value: "console", label: "管理后台", description: "运营与权限配置" },
  { value: "mobile", label: "移动端", description: "现场工作台" },
];
const selected = ref<string[]>(["docs"]);
const message = ref("尚未执行行内操作");
<\/script>

<template>
  <div data-demo-stack>
    <XhGridListRoot v-model:value="selected" :collection="projects">
      <XhGridListLabel>项目</XhGridListLabel>
      <XhGridListRow v-for="project in projects" :key="project.value" :value="project.value">
        <XhGridListRowSelectionIndicator />
        <XhGridListRowContent>
          <XhGridListRowText>{{ project.label }}</XhGridListRowText>
          <XhGridListRowDescription>{{ project.description }}</XhGridListRowDescription>
        </XhGridListRowContent>
        <XhGridListRowActions>
          <XhGridListRowAction @click="message = \`编辑 \${project.label}\`">编辑</XhGridListRowAction>
        </XhGridListRowActions>
      </XhGridListRow>
    </XhGridListRoot>
    <span data-label>已选：{{ selected.join("、") }}；{{ message }}</span>
  </div>
</template>
`;export{i as default};
