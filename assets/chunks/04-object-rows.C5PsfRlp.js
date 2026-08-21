const n=`<!-- 一行多个字段 | 行数据是对象，createItem 造一个空项；改字段时整份重建数组，行号不跟着变 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDynamicInputAddTrigger,
  XhDynamicInputItem,
  XhDynamicInputItemAction,
  XhDynamicInputItemContent,
  XhDynamicInputMoveDownTrigger,
  XhDynamicInputMoveUpTrigger,
  XhDynamicInputRemoveTrigger,
  XhDynamicInputRoot,
} from "@xihan-ui/vue";

interface Header {
  name: string;
  value: string;
}

const headers = ref<Header[]>([
  { name: "Accept", value: "application/json" },
  { name: "X-Trace", value: "" },
]);

function patch(index: number, key: keyof Header, next: string) {
  headers.value = headers.value.map((row, i) =>
    i === index ? { ...row, [key]: next } : row,
  );
}
<\/script>

<template>
  <XhDynamicInputRoot
    v-slot="{ items }"
    v-model:value="headers"
    movable
    :create-item="() => ({ name: '', value: '' })"
    style="max-inline-size: 480px"
  >
    <XhDynamicInputItem v-for="row in items" :key="row.key" :index="row.index">
      <XhDynamicInputItemContent>
        <input
          style="inline-size: 40%"
          placeholder="字段名"
          :value="row.value.name"
          @input="patch(row.index, 'name', ($event.target as HTMLInputElement).value)"
        />
        <input
          style="inline-size: 60%"
          placeholder="字段值"
          :value="row.value.value"
          @input="patch(row.index, 'value', ($event.target as HTMLInputElement).value)"
        />
      </XhDynamicInputItemContent>
      <XhDynamicInputItemAction>
        <XhDynamicInputMoveUpTrigger>↑</XhDynamicInputMoveUpTrigger>
        <XhDynamicInputMoveDownTrigger>↓</XhDynamicInputMoveDownTrigger>
        <XhDynamicInputRemoveTrigger>×</XhDynamicInputRemoveTrigger>
      </XhDynamicInputItemAction>
    </XhDynamicInputItem>
    <XhDynamicInputAddTrigger>+ 添加请求头</XhDynamicInputAddTrigger>
  </XhDynamicInputRoot>
  <pre>{{ JSON.stringify(headers, null, 2) }}</pre>
</template>
`;export{n as default};
