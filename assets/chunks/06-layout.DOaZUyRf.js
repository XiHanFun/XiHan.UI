var e=`<!-- 布局 | 设置纵向、横向、行内或网格布局 -->
<script setup lang="ts">
import type { FormLayout } from "@xihan-ui/headless";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const layout = ref<FormLayout>("horizontal");
const layouts = (["vertical", "horizontal", "inline", "grid"] as const).map(l => ({ value: l, label: l }));

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
    <!-- 分段轨道里不排可见标题：label 只作可及名 -->
    <XhRadioGroupRoot
      variant="segmented"
      :collection="layouts"
      :value="layout"
      label="排布"
      @update:value="(next: string | null) => layout = next as FormLayout"
    />

    <XhFormRoot
      :layout="layout"
      :columns="{ base: 1, md: 2 }"
      :label-width="96"
      :rules="rules"
      :default-values="{ username: '', email: '', city: '' }"
      style="inline-size: 100%; max-inline-size: 460px"
    >
      <XhFormFieldGroup
        v-for="f in fields"
        :key="f.name"
        v-slot="{ value, setValue }"
        :name="f.name"
      >
        <XhFieldRoot>
          <XhFieldLabel>{{ f.label }}</XhFieldLabel>
          <XhFieldControl>
            <input
              :placeholder="f.placeholder"
              :value="value"
              @input="setValue(($event.target as HTMLInputElement).value)"
            >
          </XhFieldControl>
          <XhFieldErrorText />
        </XhFieldRoot>
      </XhFormFieldGroup>

      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    </XhFormRoot>
  </div>
</template>
`;export{e as default};