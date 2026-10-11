var e=`<!-- 播报方式 | 默认 polite 使 root 成为活区，筛选完成后就地播报；off 使它只是一个普通容器 -->
<script setup lang="ts">
import {
  XhButton,
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const keyword = ref("曦寒");
const hits = ref<string[]>([]);

function search(): void {
  // 演示用：偶数长度的关键词当作有结果
  hits.value = keyword.value.length % 2 === 0 ? ["一条命中的记录"] : [];
}
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhInputGroupRoot>
      <XhTextFieldRoot v-model:value="keyword" type="search">
        <XhTextFieldControl>
          <XhTextFieldInput aria-label="关键词" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
      <XhButton variant="outline" @click="search">搜索</XhButton>
    </XhInputGroupRoot>

    <!-- 结果换成空的那一刻，读屏会在不打断当前朗读的前提下把标题念出来 -->
    <XhEmptyStateRoot v-if="!hits.length" live="polite">
      <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
      <XhEmptyStateTitle>没有匹配「{{ keyword }}」的结果</XhEmptyStateTitle>
      <XhEmptyStateDescription>换个词，或者去掉几个筛选条件。</XhEmptyStateDescription>
    </XhEmptyStateRoot>
    <p v-else style="margin: 0">{{ hits[0] }}</p>
  </div>
</template>
`;export{e as default};