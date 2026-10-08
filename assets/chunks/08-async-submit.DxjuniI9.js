var e=`<!-- 提交在途 | 提交回调返回 Promise：落定之前 submitting 为真，提交钮报在途、再按也不会重复提交；拒绝经 submit-error 报出 -->
<script setup lang="ts">
import type { FormSubmitDetails } from "@xihan-ui/headless";
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const saved = ref("");

// 保存请求在后端，这里用定时器代替
function save({ values }: FormSubmitDetails): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      saved.value = String(values.nickname ?? "");
      resolve();
    }, 1500);
  });
}
<\/script>

<template>
  <XhFormRoot
    v-slot="{ submitting }"
    :default-values="{ nickname: '小明' }"
    style="inline-size: 320px; display: grid; gap: 12px"
    @submit="save"
  >
    <XhFormFieldGroup v-slot="{ value, setValue }" name="nickname">
      <XhFieldRoot>
        <XhFieldLabel>昵称</XhFieldLabel>
        <XhFieldControl>
          <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)">
        </XhFieldControl>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormSubmitTrigger>{{ submitting ? "保存中…" : "保存" }}</XhFormSubmitTrigger>
    <p>{{ saved ? \`已保存：\${saved}\` : "尚未保存" }}</p>
  </XhFormRoot>
</template>
`;export{e as default};