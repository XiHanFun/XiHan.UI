<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 多字段行 | 每行包含多个输入框 -->
<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayMoveDownTrigger,
  XhFieldArrayMoveUpTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

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
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    v-model:value="headers"
    movable
    :create-item="() => ({ name: '', value: '' })"
    style="max-inline-size: 480px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input
          class="xh-demo-control"
          style="inline-size: 40%"
          placeholder="字段名"
          :value="row.value.name"
          @input="patch(row.index, 'name', ($event.target as HTMLInputElement).value)"
        >
        <input
          class="xh-demo-control"
          style="inline-size: 60%"
          placeholder="字段值"
          :value="row.value.value"
          @input="patch(row.index, 'value', ($event.target as HTMLInputElement).value)"
        >
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayMoveUpTrigger />
        <XhFieldArrayMoveDownTrigger />
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加请求头</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
