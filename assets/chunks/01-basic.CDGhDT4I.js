const n=`<!-- 基础用法 | 整条在 Tab 序列里只占一个位子，条内改用方向键走；条目是作者自己的按钮，工具条不接管它的点击 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";

// 条目的观感归条目自己，工具条只补焦点环与禁用光标
const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};

const command = ref("（无）");
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhToolbarRoot>
      <XhToolbarItem value="bold" :style="itemStyle" @click="command = '粗体'">
        粗体
      </XhToolbarItem>
      <XhToolbarItem value="italic" :style="itemStyle" @click="command = '斜体'">
        斜体
      </XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="link" :style="itemStyle" @click="command = '插入链接'">
        插入链接
      </XhToolbarItem>
    </XhToolbarRoot>

    <span>最近点击：{{ command }}</span>
  </div>
</template>
`;export{n as default};
