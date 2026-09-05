<!-- 行数上下限 | 到 min 删除把手按不动、到 max 新增把手按不动；两者都转 aria-disabled，焦点留得住 -->
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

const options = ref<string[]>(["红", "绿"]);

function setAt(index: number, next: string) {
  options.value = options.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items, count, atMin, atMax }"
    v-model:value="options"
    :min="2"
    :max="4"
    :create-item="() => ''"
    style="max-inline-size: 420px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input
          style="inline-size: 100%"
          placeholder="填一个选项"
          :value="row.value"
          @input="setAt(row.index, ($event.target as HTMLInputElement).value)"
        />
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加选项</XhFieldArrayAddTrigger>
    <p>
      {{ count }} / 4
      <span v-if="atMin"> · 至少留 2 个</span>
      <span v-if="atMax"> · 已到上限</span>
    </p>
  </XhFieldArrayRoot>
</template>
