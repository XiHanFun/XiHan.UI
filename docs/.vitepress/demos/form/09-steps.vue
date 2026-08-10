<!-- 分步校验 | 校验函数每次提交现读一次：闭住当前这一步，提交就只校验这一步的字段；存草稿走的是普通按钮，一条规则都不跑 -->
<script setup lang="ts">
import { computed, ref } from "vue";
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

const steps = [
  {
    title: "第 1 步 · 联系人",
    fields: [
      { name: "name", label: "姓名" },
      { name: "phone", label: "手机" },
    ],
  },
  {
    title: "第 2 步 · 任职",
    fields: [
      { name: "company", label: "公司" },
      { name: "title", label: "职位" },
    ],
  },
];

const step = ref(0);
const current = computed(() => steps[step.value]);
const isLast = computed(() => step.value === steps.length - 1);
const draft = ref("（还没存过）");
const done = ref("");

function ruleOf(name: string, text: string) {
  if (!text.trim())
    return "这一项不能为空";
  if (name === "phone" && !/^\d{11}$/.test(text.trim()))
    return "手机号要 11 位数字";
  return "";
}

// 只返回当前这一步的字段，别的步骤这一次不参与
function validate(values: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  for (const field of current.value.fields)
    errors[field.name] = ruleOf(field.name, String(values[field.name] ?? ""));
  return errors;
}

// 这一步过了才走到这里：不是最后一步就往下推一步
function onSubmit(details: { values: Record<string, unknown> }) {
  if (!isLast.value) {
    step.value += 1;
    return;
  }
  done.value = JSON.stringify(details.values);
}

function saveDraft(values: Record<string, unknown>) {
  draft.value = JSON.stringify(values);
}
</script>

<template>
  <XhFormRoot
    v-slot="{ values }"
    :default-values="{ name: '', phone: '', company: '', title: '' }"
    :validate="validate"
    style="inline-size: 320px;"
    @submit="onSubmit"
  >
    <strong style="font-size: 13px;">{{ current.title }}</strong>

    <!-- 上一步的字段容器这会儿并没渲染，值仍留在值表里 -->
    <template v-for="field in current.fields" :key="field.name">
      <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" :value="field.name">
        <XhFieldRoot :invalid="invalid" required>
          <XhFieldLabel>{{ field.label }}</XhFieldLabel>
          <XhFieldControl>
            <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)" />
          </XhFieldControl>
          <XhFieldErrorText>{{ error }}</XhFieldErrorText>
        </XhFieldRoot>
      </XhFormFieldGroup>
    </template>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>{{ isLast ? "提交" : "下一步" }}</XhFormSubmitTrigger>
      <!-- 普通按钮不是提交键，点了不发提交，也就不跑校验 -->
      <XhButton variant="outline" @click="saveDraft(values)">存草稿</XhButton>
      <XhButton v-if="step > 0" variant="ghost" @click="step -= 1">上一步</XhButton>
    </div>

    <p style="margin: 0; font-size: 13px;">草稿：{{ draft }}</p>
    <p v-if="done" style="margin: 0; font-size: 13px;">已提交：{{ done }}</p>
  </XhFormRoot>
</template>
