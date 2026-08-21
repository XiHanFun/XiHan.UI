const n=`<!-- 动态增删 | 项增删后重新量高、重新落格；新项排在末尾，摘掉一项后其余项会补位 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhMasonry } from "@xihan-ui/vue";

const cardStyle =
  "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

let seq = 4;
const cards = ref([
  { id: 1, height: 90 },
  { id: 2, height: 140 },
  { id: 3, height: 60 },
]);

function add() {
  // 先取号再算高度：对象字面量按书写顺序求值，写成 id: seq++ 会让 height 读到自增后的号
  const id = seq++;
  // 高度在 60–160 之间挑一个，好看出落格是按高度定的
  cards.value.push({ id, height: 60 + ((id * 37) % 100) });
}

function removeLast() {
  cards.value.pop();
}
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 8px">
      <button
        type="button"
        style="padding: 4px 10px; border-radius: var(--xh-radius-sm); border: 1px solid var(--xh-border-default); background: transparent; color: var(--xh-fg-default)"
        @click="add"
      >
        添加一项
      </button>
      <button
        type="button"
        style="padding: 4px 10px; border-radius: var(--xh-radius-sm); border: 1px solid var(--xh-border-default); background: transparent; color: var(--xh-fg-default)"
        @click="removeLast"
      >
        摘掉末项
      </button>
    </div>

    <XhMasonry :columns="3" gap="md">
      <div
        v-for="c in cards"
        :key="c.id"
        :style="\`\${cardStyle}; block-size: \${c.height}px\`"
      >
        {{ c.id }}
      </div>
    </XhMasonry>
  </div>
</template>
`;export{n as default};
