var e=`<!-- 多字段行 | 每行包含多个输入框 -->
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
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
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
<\/script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    v-model:value="headers"
    movable
    :create-item="() => ({ name: '', value: '' })"
    style="inline-size: 100%; max-inline-size: 480px"
  >
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <XhTextFieldRoot
          placeholder="字段名"
          :value="row.value.name"
          @update:value="(next: string) => patch(row.index, 'name', next)"
        >
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
        <XhTextFieldRoot
          placeholder="字段值"
          :value="row.value.value"
          @update:value="(next: string) => patch(row.index, 'value', next)"
        >
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
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
`;export{e as default};