const e=`<!-- 随表单提交 | 给了 name 才生出表单影子：勾上才提交，半选按未勾处理，与原生复选框一致 -->
<script setup lang="ts">
import { XhButton, XhCheckbox } from "@xihan-ui/vue";
import { ref } from "vue";

const submitted = ref("");

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement);
  const keys = [...data.entries()].map(([k, v]) => \`\${k}=\${v}\`);
  submitted.value = keys.length ? keys.join("  ") : "（一个字段都没提交）";
}
<\/script>

<template>
  <form style="display: grid; gap: 12px" @submit.prevent="onSubmit">
    <label><XhCheckbox name="agree" default-checked /> 已阅读条款（勾上才提交）</label>
    <label><XhCheckbox name="news" /> 订阅周报（没勾就整条不进 FormData）</label>
    <label><XhCheckbox name="partial" default-checked="indeterminate" /> 半选（按未勾处理，不提交）</label>
    <!-- 不给 name 就没有影子节点，既有 DOM 一个字节不变 -->
    <label><XhCheckbox /> 不参与提交</label>

    <div>
      <XhButton type="submit" size="sm">提交</XhButton>
    </div>

    <span v-if="submitted">表单收到：{{ submitted }}</span>
  </form>
</template>
`;export{e as default};
