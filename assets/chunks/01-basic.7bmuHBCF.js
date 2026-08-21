const n=`<!-- 基础用法 | 加一行、删一行归组件管；行里放什么控件归作者，写在 item-content 里 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDynamicInputAddTrigger,
  XhDynamicInputItem,
  XhDynamicInputItemAction,
  XhDynamicInputItemContent,
  XhDynamicInputRemoveTrigger,
  XhDynamicInputRoot,
} from "@xihan-ui/vue";

const links = ref<string[]>(["https://xihan.fun", ""]);

// 行里的控件是作者自己的，值也由作者自己写回
function setAt(index: number, next: string) {
  links.value = links.value.map((item, i) => (i === index ? next : item));
}
<\/script>

<template>
  <XhDynamicInputRoot
    v-slot="{ items, count }"
    v-model:value="links"
    :create-item="() => ''"
    style="max-inline-size: 420px"
  >
    <!-- key 用 items 给的 row.key：它跟着这一行走，不是下标 -->
    <XhDynamicInputItem v-for="row in items" :key="row.key" :index="row.index">
      <XhDynamicInputItemContent>
        <input
          style="inline-size: 100%"
          placeholder="填一个链接"
          :value="row.value"
          @input="setAt(row.index, ($event.target as HTMLInputElement).value)"
        />
      </XhDynamicInputItemContent>
      <XhDynamicInputItemAction>
        <XhDynamicInputRemoveTrigger>×</XhDynamicInputRemoveTrigger>
      </XhDynamicInputItemAction>
    </XhDynamicInputItem>
    <XhDynamicInputAddTrigger>+ 添加链接</XhDynamicInputAddTrigger>
    <p>共 {{ count }} 条</p>
  </XhDynamicInputRoot>
</template>
`;export{n as default};
