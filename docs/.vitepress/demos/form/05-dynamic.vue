<!-- 动态字段 | 字段容器随数组增删，值表的键跟着字段名走；校验只遍历当下这几行，删掉的行不再参与 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

let nextId = 1;
const rows = ref([{ id: nextId }]);
const submitted = ref("（还没提交过）");

// 字段名的派生规则只此一处：模板、校验、提交回调都读它
function fieldName(id: number) {
  return `tag-${id}`;
}

function add() {
  nextId += 1;
  rows.value.push({ id: nextId });
}

function remove(id: number) {
  rows.value = rows.value.filter(row => row.id !== id);
}

function validate(values: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  for (const row of rows.value) {
    const name = fieldName(row.id);
    errors[name] = String(values[name] ?? "").trim() ? "" : "标签不能为空";
  }
  return errors;
}

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = rows.value
    .map(row => String(details.values[fieldName(row.id)] ?? ""))
    .join(" / ");
}
</script>

<template>
  <XhFormRoot :validate="validate" style="inline-size: 320px;" @submit="onSubmit">
    <template v-for="(row, index) in rows" :key="row.id">
      <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" :value="fieldName(row.id)">
        <XhFieldRoot :invalid="invalid">
          <XhFieldLabel>标签 {{ index + 1 }}</XhFieldLabel>
          <XhFieldControl>
            <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)" />
          </XhFieldControl>
          <XhFieldErrorText>{{ error }}</XhFieldErrorText>
        </XhFieldRoot>
        <XhButton variant="ghost" size="sm" @click="remove(row.id)">删掉这一行</XhButton>
      </XhFormFieldGroup>
    </template>

    <div style="display: flex; gap: 8px;">
      <XhButton variant="outline" @click="add">添加一行</XhButton>
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    </div>

    <p style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
