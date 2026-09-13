const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 数量限制 | 设置最少和最多行数 -->
<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const options = ref<string[]>(["红", "绿"]);

function setAt(index: number, next: string) {
  options.value = options.value.map((item, i) => (i === index ? next : item));
}
<\/script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    v-model:value="options"
    :min="2"
    :max="4"
    :create-item="() => ''"
    style="max-inline-size: 420px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input
          class="xh-demo-control"
          style="inline-size: 100%"
          placeholder="填一个选项"
          :value="row.value"
          @input="setAt(row.index, ($event.target as HTMLInputElement).value)"
        >
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加选项</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
`;export{e as default};
