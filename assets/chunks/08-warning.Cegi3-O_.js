const n=`<!-- 提醒但不拦下 | 可疑的值只在描述里提醒一句，不写进错误表：控件的 aria-invalid 仍是 false，提交照样放行 -->
<script setup lang="ts">
import { computed, ref } from "vue";
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

const personal = ["qq.com", "163.com", "gmail.com"];
const values = ref<Record<string, unknown>>({ email: "zhaifanhua@qq.com" });
const submitted = ref("（还没提交过）");

// 拦得住的只有格式这一条，它才进错误表
function validate(source: Record<string, unknown>) {
  return {
    email: String(source.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
  };
}

// 提醒由值现算，与错误表无关
const warning = computed(() => {
  const text = String(values.value.email ?? "");
  const domain = text.slice(text.indexOf("@") + 1).toLowerCase();
  return text.includes("@") && personal.includes(domain)
    ? "这是个人邮箱，同事之间通常填公司邮箱"
    : "";
});

// 警告档只换配色：边框取语气层的强调色，描述取语气层的文字色
const warningStyle = {
  "--xh-field-control-border": "var(--xh-_tone-soft)",
  "--xh-field-description-fg": "var(--xh-_tone-fg)",
};

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = String(details.values.email ?? "");
}
<\/script>

<template>
  <XhFormRoot
    v-model:values="values"
    :default-values="{ email: 'zhaifanhua@qq.com' }"
    :validate="validate"
    style="inline-size: 320px;"
    @submit="onSubmit"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="email">
      <XhFieldRoot
        :invalid="invalid"
        :data-tone="!invalid && warning ? 'warning' : undefined"
        :style="!invalid && warning ? warningStyle : undefined"
      >
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl>
          <input
            type="email"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          />
        </XhFieldControl>
        <!-- 描述恒在描述链里：提醒会被念出来，又不会把控件标成无效 -->
        <XhFieldDescription>{{ warning || "用于接收账单与安全提醒" }}</XhFieldDescription>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    <p style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
`;export{n as default};
