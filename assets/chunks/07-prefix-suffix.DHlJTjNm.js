const e=`<!-- 前缀与行尾 | 行里放什么由标记说了算：文字前塞图标、文字后塞操作，方向指示也可以挪到行尾去 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchIndicator,
  XhTreeBranchText,
  XhTreeItem,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

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
            <span aria-hidden="true">📁</span>
            <XhTreeBranchText>{{ dir.label }}</XhTreeBranchText>
            <!-- 指示器不带点击语义，展开态转 90° 全靠皮肤读 data-state -->
            <XhTreeBranchIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="file in dir.children" :key="file.value" :value="file.value">
              <span aria-hidden="true">📄</span>
              <XhTreeItemText>{{ file.label }}</XhTreeItemText>
              <!-- 掐断冒泡，否则点按钮连带把这一行也选上 -->
              <button type="button" @click.stop="rename(file.label)">重命名</button>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>{{ log }}</span>
  </div>
</template>
`;export{e as default};
