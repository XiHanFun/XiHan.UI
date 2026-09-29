const n=`<!-- 加载更多 | 列表末尾放一个按钮追加下一批：取数时按钮转圈、不能重复点，取完了换成提示 -->
<script setup lang="ts">
import { LoaderIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhButtonIndicator,
  XhButtonLabel,
  XhIcon,
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

// 模拟分批取数：每次 4 条，共 11 条
const TOTAL = 11;
const BATCH = 4;
interface Row {
  id: number;
  name: string;
  desc: string;
}
function rowsFrom(from: number): Row[] {
  return Array.from({ length: Math.min(BATCH, TOTAL - from) }, (_, i) => ({
    id: from + i,
    name: \`通知 \${from + i + 1}\`,
    desc: \`系统消息 · \${from + i + 1} 小时前\`,
  }));
}
function fetchBatch(from: number): Promise<Row[]> {
  return new Promise(resolve => setTimeout(resolve, 800, rowsFrom(from)));
}

// 第一批随页面一起到
const rows = ref<Row[]>(rowsFrom(0));
const loading = ref(false);
const done = computed(() => rows.value.length >= TOTAL);

async function loadMore() {
  loading.value = true;
  rows.value = [...rows.value, ...await fetchBatch(rows.value.length)];
  loading.value = false;
}
<\/script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); justify-items: center; max-inline-size: 360px">
    <XhListRoot split style="inline-size: 100%">
      <XhListItem v-for="row in rows" :key="row.id">
        <XhListItemContent>
          <XhListItemTitle>{{ row.name }}</XhListItemTitle>
          <XhListItemDescription>{{ row.desc }}</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
    </XhListRoot>
    <XhButton variant="subtle" :loading="loading" :disabled="done" @click="loadMore">
      <XhButtonIndicator><XhIcon :icon="LoaderIcon" /></XhButtonIndicator>
      <XhButtonLabel>{{ done ? "没有更多了" : "加载更多" }}</XhButtonLabel>
    </XhButton>
  </div>
</template>
`;export{n as default};
