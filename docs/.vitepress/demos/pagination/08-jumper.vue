<!-- 快速跳页 | 输入框按 Enter 调插槽给的 setPage；越界页码由它夹回合法区间 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

const target = ref("");

// 只放正整数进去，其余按无效输入丢掉
function jump(setPage: (page: number) => void): void {
  const next = Number(target.value);
  if (Number.isInteger(next) && next > 0) {
    setPage(next);
  }
  target.value = "";
}
</script>

<template>
  <XhPaginationRoot
    v-slot="{ pages, setPage }"
    :count="1000"
    :page-size="10"
    :default-page="5"
    style="inline-size: 100%"
  >
    <XhPaginationPrevTrigger />
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <XhPaginationEllipsis v-if="p === 'ellipsis'">…</XhPaginationEllipsis>
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />

    <XhTextFieldRoot v-model:value="target" size="sm" placeholder="页码">
      <XhTextFieldInput
        style="inline-size: 72px"
        aria-label="跳至页码"
        @keydown.enter="jump(setPage)"
      />
    </XhTextFieldRoot>
  </XhPaginationRoot>
</template>
