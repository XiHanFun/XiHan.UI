<!-- 换序 | movable 开了才出上下把手；挪完焦点跟着这一行走，键盘可以连按一路挪到底 -->
<script setup lang="ts">
import { ref } from "vue";
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

const steps = ref<string[]>(["拉取代码", "安装依赖", "跑构建", "发布"]);

function setAt(index: number, next: string) {
  steps.value = steps.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    v-model:value="steps"
    movable
    :create-item="() => ''"
    style="max-inline-size: 420px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <span style="inline-size: 1.5rem">{{ row.index + 1 }}.</span>
        <input
          style="inline-size: 100%"
          placeholder="这一步做什么"
          :value="row.value"
          @input="setAt(row.index, ($event.target as HTMLInputElement).value)"
        />
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayMoveUpTrigger />
        <XhFieldArrayMoveDownTrigger />
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加一步</XhFieldArrayAddTrigger>
    <p>顺序：{{ steps.join(" → ") }}</p>
  </XhFieldArrayRoot>
</template>
