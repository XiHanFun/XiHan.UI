<!-- 禁用与程序化操作 | 禁用时三类把手全按不动；插槽里还给出 add / remove / setValue，可以从外面驱动 -->
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

const locked = ref(false);
const tasks = ref<string[]>(["写方案", "评审", "上线"]);
</script>

<template>
  <label>
    <input v-model="locked" type="checkbox" />
    锁定这份清单
  </label>

  <XhDynamicInputRoot
    v-slot="{ items, setValue, add }"
    v-model:value="tasks"
    :disabled="locked"
    :create-item="() => '新任务'"
    style="max-inline-size: 420px"
  >
    <XhDynamicInputItem v-for="row in items" :key="row.key" :index="row.index">
      <XhDynamicInputItemContent>{{ row.value }}</XhDynamicInputItemContent>
      <XhDynamicInputItemAction>
        <XhDynamicInputRemoveTrigger>×</XhDynamicInputRemoveTrigger>
      </XhDynamicInputItemAction>
    </XhDynamicInputItem>
    <XhDynamicInputAddTrigger>+ 添加任务</XhDynamicInputAddTrigger>

    <!-- add 与把手走同一条闸门，锁定时同样按不动；setValue 是整份替换，不受闸门约束 -->
    <p>
      <button type="button" @click="add()">从外面加一条</button>
      <button type="button" @click="setValue(['写方案', '评审', '上线'])">恢复默认</button>
    </p>
  </XhDynamicInputRoot>
</template>
