const e=`<!-- 禁用与只读 | disabled 把提交、重置、写值三条路一起封死；read-only 只封写值与重置，提交照发 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

const submitted = ref("（还没提交过）");

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = JSON.stringify(details.values);
}
<\/script>

<template>
  <!-- 整表禁用：两颗按钮自带原生 disabled，控件那一侧的 disabled 由自己落 -->
  <XhFormRoot disabled :default-values="{ token: 'xh-0f2a' }" style="inline-size: 260px;">
    <XhFormFieldGroup v-slot="{ value, setValue }" value="token">
      <XhFieldRoot disabled>
        <XhFieldLabel>接入令牌</XhFieldLabel>
        <XhFieldControl>
          <input
            disabled
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          />
        </XhFieldControl>
        <XhFieldDescription>整表禁用</XhFieldDescription>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </div>
  </XhFormRoot>

  <!-- 只读：重置键置灰、写值不发生，提交仍旧把当下这份值交出去 -->
  <XhFormRoot
    read-only
    :default-values="{ token: 'xh-0f2a' }"
    style="inline-size: 260px;"
    @submit="onSubmit"
  >
    <XhFormFieldGroup v-slot="{ value, setValue }" value="token">
      <XhFieldRoot>
        <XhFieldLabel>接入令牌</XhFieldLabel>
        <XhFieldControl>
          <input
            readonly
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          />
        </XhFieldControl>
        <XhFieldDescription>只读：能提交，改不动</XhFieldDescription>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </div>
  </XhFormRoot>

  <p style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
</template>
`;export{e as default};
