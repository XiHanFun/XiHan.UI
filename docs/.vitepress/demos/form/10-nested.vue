<!-- 嵌套模型与路径字段名 | 字段名直接写成路径，值仍住在宿主自己的嵌套对象里：表单只管错误、id 与摘要跳转，提交时不用把扁平表折回去 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormErrorSummary,
  XhFormErrorSummaryItem,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

const model = ref({
  user: { name: "", email: "" },
  hobbies: [{ hobby: "" }, { hobby: "" }],
});
const submitted = ref("（还没提交过）");

// 路径名的派生规则只此一处：模板、校验、摘要都读它
function hobbyName(index: number) {
  return `hobbies[${index}].hobby`;
}

// 校验不看入参，直接读宿主的嵌套模型；返回的键就是那几条路径
function validate() {
  const errors: Record<string, string> = {
    "user.name": model.value.user.name.trim() ? "" : "姓名不能为空",
    "user.email": model.value.user.email.includes("@") ? "" : "邮箱要带一个 @",
  };
  model.value.hobbies.forEach((row, index) => {
    errors[hobbyName(index)] = row.hobby.trim() ? "" : "爱好不能为空";
  });
  return errors;
}

function onSubmit() {
  submitted.value = JSON.stringify(model.value);
}
</script>

<template>
  <XhFormRoot :validate="validate" style="inline-size: 320px;" @submit="onSubmit">
    <!-- 摘要条目按路径名指过去，点一下焦点落进对应的字段容器 -->
    <XhFormErrorSummary v-slot="{ errorCount }">
      <span>共 {{ errorCount }} 处需要修改</span>
      <XhFormErrorSummaryItem v-slot="{ error }" value="user.name">姓名：{{ error }}</XhFormErrorSummaryItem>
      <XhFormErrorSummaryItem v-slot="{ error }" value="user.email">邮箱：{{ error }}</XhFormErrorSummaryItem>
      <template v-for="(row, index) in model.hobbies" :key="index">
        <XhFormErrorSummaryItem v-slot="{ error }" :value="hobbyName(index)">
          爱好 {{ index + 1 }}：{{ error }}
        </XhFormErrorSummaryItem>
      </template>
    </XhFormErrorSummary>

    <XhFormFieldGroup v-slot="{ error, invalid }" value="user.name">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>姓名</XhFieldLabel>
        <XhFieldControl>
          <!-- 控件直接绑在嵌套模型上，值不经过表单的值表 -->
          <input v-model="model.user.name" />
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormFieldGroup v-slot="{ error, invalid }" value="user.email">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl>
          <input v-model="model.user.email" type="email" />
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <template v-for="(row, index) in model.hobbies" :key="index">
      <XhFormFieldGroup v-slot="{ error, invalid }" :value="hobbyName(index)">
        <XhFieldRoot :invalid="invalid" required>
          <XhFieldLabel>爱好 {{ index + 1 }}</XhFieldLabel>
          <XhFieldControl>
            <input v-model="row.hobby" />
          </XhFieldControl>
          <XhFieldErrorText>{{ error }}</XhFieldErrorText>
        </XhFieldRoot>
      </XhFormFieldGroup>
    </template>

    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    <p style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
