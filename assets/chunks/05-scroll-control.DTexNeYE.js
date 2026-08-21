const n=`<!-- 自己画回到底部的入口 | 在不在底、怎么滚回底部两件事外部都拿得到，不用内置那颗浮动按钮也能拼出一条自己的提示栏 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhButton, XhThreadContent, XhThreadRoot, XhThreadViewport } from "@xihan-ui/vue";

const messages = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    text: \`第 \${i + 1} 条 · 往上滚一段，下面那条提示栏就露出来\`,
  })),
);

let nextId = messages.value.length;

function append(): void {
  nextId += 1;
  messages.value.push({ id: nextId, text: \`第 \${nextId} 条 · 新来的\` });
}
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhThreadRoot v-slot="{ atBottom, showScrollButton, scrollToBottom }" style="block-size: 220px">
      <XhThreadViewport>
        <XhThreadContent>
          <p v-for="m in messages" :key="m.id" style="margin: 0">{{ m.text }}</p>
        </XhThreadContent>
      </XhThreadViewport>

      <!-- 提示栏排在视口下面，不在底部时才出现 -->
      <div
        v-if="showScrollButton"
        style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-block: 6px"
      >
        <span style="font-size: 13px">在底：{{ atBottom ? "是" : "否" }}</span>
        <XhButton variant="outline" size="sm" @click="scrollToBottom()">回到最新</XhButton>
      </div>
    </XhThreadRoot>

    <div>
      <XhButton variant="solid" @click="append">追加一条消息</XhButton>
    </div>
  </div>
</template>
`;export{n as default};
