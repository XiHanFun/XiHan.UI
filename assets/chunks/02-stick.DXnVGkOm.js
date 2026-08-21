const n=`<!-- 粘底与回到底部 | 内容长高时自动跟到底；往上滚一下当场撒手，回到底部按钮随即露出，滚回阈值内又自动粘上 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhThreadContent,
  XhThreadRoot,
  XhThreadScrollButton,
  XhThreadViewport,
} from "@xihan-ui/vue";

const messages = ref([
  { id: 1, role: "用户", text: "粘底是按什么判的？" },
  { id: 2, role: "助手", text: "按滚动位置离底还差多少像素，差值落在阈值内就算在底。" },
  { id: 3, role: "用户", text: "我自己往上滚一段呢？" },
  { id: 4, role: "助手", text: "当场撒手，此后再长多少都不跟，右下角给你一条回去的路。" },
  { id: 5, role: "用户", text: "滚回去要不要再点一下按钮？" },
  { id: 6, role: "助手", text: "不用，滚进阈值内的那一下自动重新粘上。" },
]);

let nextId = messages.value.length;
const atBottom = ref(true);
const sticking = ref(true);

function append(): void {
  nextId += 1;
  messages.value.push({
    id: nextId,
    role: "助手",
    text: \`第 \${nextId} 条 · 粘着就跟到底，撒手了就停在原处等你回来。\`,
  });
}

function onStickChange(details: { atBottom: boolean; sticking: boolean }): void {
  atBottom.value = details.atBottom;
  sticking.value = details.sticking;
}
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <!-- threshold 是距底多少像素算在底，默认 64 -->
    <XhThreadRoot
      style="block-size: 220px"
      :threshold="64"
      @stick-change="onStickChange"
    >
      <XhThreadViewport>
        <XhThreadContent>
          <p v-for="m in messages" :key="m.id" style="margin: 0">
            <strong>{{ m.role }}：</strong>{{ m.text }}
          </p>
        </XhThreadContent>
      </XhThreadViewport>
      <XhThreadScrollButton>↓ 回到底部</XhThreadScrollButton>
    </XhThreadRoot>

    <div>
      <XhButton variant="solid" @click="append">追加一条消息</XhButton>
      <span style="margin-inline-start: 12px">
        在底：{{ atBottom ? "是" : "否" }} · 粘附：{{ sticking ? "是" : "否" }}
      </span>
    </div>
  </div>
</template>
`;export{n as default};
