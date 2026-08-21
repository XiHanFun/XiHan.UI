const e=`<!-- 排布 | layout 三档：vertical 竖排（默认）、horizontal 标签左置两列（labelWidth 统一列宽、labelAlign 换对齐缘）、inline 横排一行流；整表标签对齐一个开关搞定，不必逐字段写栅格 -->
<script setup lang="ts">
import type { FormLayout } from "@xihan-ui/headless";
import { ref } from "vue";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

const layout = ref<FormLayout>("horizontal");
const layouts: FormLayout[] = ["vertical", "horizontal", "inline"];

const fields = [
  { name: "username", label: "用户名", placeholder: "字母开头" },
  { name: "email", label: "邮箱", placeholder: "you@example.com" },
  { name: "city", label: "所在城市", placeholder: "选填" },
];

const rules = {
  username: { required: true, message: "用户名不能为空" },
  email: { required: true, message: "邮箱不能为空" },
};
<\/script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <label style="display: flex; gap: 8px; align-items: center; font-size: 13px">
      排布
      <select v-model="layout">
        <option v-for="l in layouts" :key="l" :value="l">{{ l }}</option>
      </select>
    </label>

    <XhFormRoot
      :layout="layout"
      :label-width="96"
      :rules="rules"
      :default-values="{ username: '', email: '', city: '' }"
      style="inline-size: 100%; max-inline-size: 460px"
    >
      <XhFormFieldGroup
        v-for="f in fields"
        :key="f.name"
        v-slot="{ value, setValue }"
        :value="f.name"
      >
        <XhFieldRoot>
          <XhFieldLabel>{{ f.label }}</XhFieldLabel>
          <XhFieldControl>
            <input
              :placeholder="f.placeholder"
              :value="value"
              @input="setValue(($event.target as HTMLInputElement).value)"
            />
          </XhFieldControl>
          <XhFieldErrorText />
        </XhFieldRoot>
      </XhFormFieldGroup>

      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    </XhFormRoot>
  </div>
</template>
`;export{e as default};
