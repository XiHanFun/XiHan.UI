const t=`<!-- 基础用法 | root 的高度由外部给定，滚动才发生在 viewport 里面；root / viewport / content 三层缺一不可 -->
<script setup lang="ts">
import { XhThreadContent, XhThreadRoot, XhThreadViewport } from "@xihan-ui/vue";

const messages = [
  { id: 1, role: "用户", text: "这个对话区是怎么分层的？" },
  { id: 2, role: "助手", text: "root 定框，viewport 负责滚动，content 包住全部消息。" },
  { id: 3, role: "用户", text: "为什么一定要给高度？" },
  { id: 4, role: "助手", text: "不给一个确定的框，内容永远不溢出，滚动与粘底都无从谈起。" },
  { id: 5, role: "用户", text: "消息本身归谁管？" },
  { id: 6, role: "助手", text: "归你。组件不碰数据，content 里放什么都行。" },
];
<\/script>

<template>
  <div style="width: 100%">
    <!-- 高度写在 root 上：viewport 撑满剩余空间，溢出部分自己滚 -->
    <XhThreadRoot style="block-size: 220px">
      <XhThreadViewport>
        <XhThreadContent>
          <p v-for="m in messages" :key="m.id" style="margin: 0">
            <strong>{{ m.role }}：</strong>{{ m.text }}
          </p>
        </XhThreadContent>
      </XhThreadViewport>
    </XhThreadRoot>
  </div>
</template>
`;export{t as default};
