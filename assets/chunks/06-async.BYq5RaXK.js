const n=`<!-- 异步校验 | 规则里的 validator 直接返回 Promise：提交时机器等它回来再放行或拦下，期间 validating 置真可用来标忙 -->
<script setup lang="ts">
import type { FormRules } from "@xihan-ui/headless";
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
const submitted = ref("（还没提交过）");

// 远程唯一性核验：这里用定时器模拟服务端往返
const rules: FormRules = {
  username: [
    { required: true, message: "用户名不能为空" },
    {
      validator: async (value) => {
        await new Promise((r) => setTimeout(r, 700));
        return taken.includes(String(value).trim()) ? "这个用户名已经有人用了" : undefined;
      },
    },
  ],
};

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = String(details.values.username ?? "");
}
<\/script>

<template>
  <XhFormRoot
    v-slot="{ validating }"
    :default-values="{ username: '' }"
    :rules="rules"
    style="inline-size: 320px"
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
        <XhFieldDescription>{{ validating ? "正在核验…" : "提交时先问一次服务端，占用的名字会被挡下" }}</XhFieldDescription>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormSubmitTrigger>{{ validating ? "核验中…" : "提交" }}</XhFormSubmitTrigger>
    <p style="margin: 0; font-size: 13px">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
`;export{n as default};
