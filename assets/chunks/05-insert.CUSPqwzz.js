var e=`<!-- 插入与任意换位 | insert(index) 在指定位置插入一行，后面的行往后挪；move(from, to) 一步挪到任意位置，不必逐格上移 -->
<script setup lang="ts">
import {
  XhButton,
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const steps = ref<string[]>(["拉取代码", "跑构建", "发布"]);

function setAt(index: number, next: string) {
  steps.value = steps.value.map((item, i) => (i === index ? next : item));
}
<\/script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items, insert, move }"
    v-model:value="steps"
    movable
    :create-item="() => ''"
    style="max-inline-size: 480px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <span style="inline-size: 1.5rem">{{ row.index + 1 }}.</span>
        <input
          class="xh-demo-control"
          style="inline-size: 100%"
          placeholder="这一步做什么"
          :value="row.value"
          @input="setAt(row.index, ($event.target as HTMLInputElement).value)"
        >
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhButton size="sm" variant="ghost" @click="insert(row.index + 1)">下方插入</XhButton>
        <XhButton size="sm" variant="ghost" :disabled="row.index === 0" @click="move(row.index, 0)">置顶</XhButton>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加一步</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
`;export{e as default};