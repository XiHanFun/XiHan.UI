<!-- 基础用法 | 加一行、删一行归组件管；行里放什么控件归作者，写在 item-content 里 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/vue";

const links = ref<string[]>(["https://xihan.fun", ""]);

// 行里的控件是作者自己的，值也由作者自己写回
function setAt(index: number, next: string) {
  links.value = links.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items, count }"
    v-model:value="links"
    :create-item="() => ''"
    style="max-inline-size: 420px"
  >
    <!-- key 用 items 给的 row.key：它跟着这一行走，不是下标 -->
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input
          style="inline-size: 100%"
          placeholder="填一个链接"
          :value="row.value"
          @input="setAt(row.index, ($event.target as HTMLInputElement).value)"
        />
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加链接</XhFieldArrayAddTrigger>
    <p>共 {{ count }} 条</p>
  </XhFieldArrayRoot>
</template>
