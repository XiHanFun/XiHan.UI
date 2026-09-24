const e=`<!-- 前缀与行尾 | 行中放置什么由标记决定：文字前放图标、文字后放操作，展开箭头也可以移到行尾 -->
<script setup lang="ts">
import { FileIcon, FolderIcon } from "@xihan-ui/icons";
import {
  XhIcon,
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
    value: "src",
    label: "src",
    children: [
      { value: "index", label: "index.ts" },
      { value: "app", label: "app.vue" },
    ],
  },
  {
    value: "docs",
    label: "docs",
    children: [{ value: "guide", label: "guide.md" }],
  },
];

const log = ref("（还没动过）");

function rename(label: string): void {
  log.value = \`重命名 \${label}\`;
}
<\/script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot :collection="collection" :default-expanded-value="['src']">
      <XhTreeLabel>工作区</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="dir in collection" :key="dir.value" :value="dir.value">
          <XhTreeBranchControl>
            <XhIcon :icon="FolderIcon" />
            <XhTreeBranchText>{{ dir.label }}</XhTreeBranchText>
            <XhTreeBranchTrigger />
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="file in dir.children" :key="file.value" :value="file.value">
              <XhIcon :icon="FileIcon" />
              <XhTreeItemText>{{ file.label }}</XhTreeItemText>
              <!-- 掐断冒泡，否则点按钮连带把这一行也选上 -->
              <button type="button" @click.stop="rename(file.label)">重命名</button>
              <XhTreeItemIndicator />
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>{{ log }}</span>
  </div>
</template>
`;export{e as default};
