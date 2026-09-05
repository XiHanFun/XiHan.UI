<!-- 网格排布 | columns 给列数、窄视口自动收成一列；字段自报 span 跨列，span="full" 占满整行且跟着当下列数走 -->
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

const fields = [
  { name: "name", label: "姓名", placeholder: "必填" },
  { name: "phone", label: "手机号", placeholder: "11 位数字" },
  { name: "company", label: "公司", placeholder: "选填" },
  { name: "title", label: "职位", placeholder: "选填" },
  { name: "address", label: "通讯地址", placeholder: "选填", span: "full" as const },
];

const rules = {
  name: { required: true, message: "姓名不能为空" },
  phone: { required: true, message: "手机号不能为空" },
};
</script>

<template>
  <XhFormRoot
    layout="grid"
    :columns="{ base: 1, md: 2 }"
    :rules="rules"
    :default-values="{ name: '', phone: '', company: '', title: '', address: '' }"
    style="inline-size: 100%"
  >
    <XhFormFieldGroup
      v-for="f in fields"
      :key="f.name"
      v-slot="{ value, setValue }"
      :value="f.name"
      :span="f.span"
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

    <!-- 按钮不是字段，它是网格里的普通一格：想让它自己占一行就写 grid-column -->
    <XhFormSubmitTrigger style="grid-column: 1 / -1; justify-self: start">
      提交
    </XhFormSubmitTrigger>
  </XhFormRoot>
</template>
