<!-- 快速跳页 | 输入框按 Enter 调插槽给的 setPage；越界页码由它夹回合法区间 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhTextFieldControl,
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
      <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'">…</XhPaginationEllipsisTrigger>
      <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
    </template>
    <XhPaginationNextTrigger />

    <XhTextFieldRoot v-model:value="target" size="sm" placeholder="页码">
      <XhTextFieldControl style="inline-size: 72px">
        <XhTextFieldInput aria-label="跳至页码" @keydown.enter="jump(setPage)" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  </XhPaginationRoot>
</template>
