<!-- 异步校验 | 核验结果落在宿主自己的表里，validate 同步读它；核验回来直接写受控错误表，提交这一路照样拦得住 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

const taken = ["admin", "root", "xihan"];
// 已经核验过的名字：名字 → 错误文案，空串表示这个名字可用
const checked = ref<Record<string, string>>({});
const checking = ref(false);
const errors = ref<Record<string, string>>({});
const submitted = ref("（还没提交过）");

let timer = 0;

// 值一改就发起核验，回来后把结论写进受控错误表
function onValuesChange(details: { values: Record<string, unknown> }) {
  const name = String(details.values.username ?? "").trim();
  window.clearTimeout(timer);
  if (!name || Object.hasOwn(checked.value, name)) {
    checking.value = false;
    return;
  }
  checking.value = true;
  timer = window.setTimeout(() => {
    const message = taken.includes(name) ? "这个用户名已经有人用了" : "";
    checked.value = { ...checked.value, [name]: message };
    errors.value = { ...errors.value, username: message };
    checking.value = false;
  }, 700);
}

// 校验函数是同步的：这里只读核验结果，还没回来就先把提交拦下
function validate(values: Record<string, unknown>) {
  const name = String(values.username ?? "").trim();
  if (!name)
    return { username: "用户名不能为空" };
  if (!Object.hasOwn(checked.value, name))
    return { username: "还在核验，稍等一下再提交" };
  return { username: checked.value[name] };
}

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = String(details.values.username ?? "");
}
</script>

<template>
  <XhFormRoot
    v-model:errors="errors"
    :default-values="{ username: '' }"
    :validate="validate"
    style="inline-size: 320px;"
    @values-change="onValuesChange"
    @submit="onSubmit"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="username">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>用户名</XhFieldLabel>
        <XhFieldControl>
          <input
            placeholder="试试 admin"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          />
        </XhFieldControl>
        <XhFieldDescription>{{ checking ? "正在核验…" : "改动后自动核验，占用的名字会被挡下" }}</XhFieldDescription>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    <p style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
