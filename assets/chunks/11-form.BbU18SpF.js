const n=`<!-- 随表单提交 | 给了 name 才生出表单影子：开着才提交，值缺省是 on，与原生复选框一致 -->
<script setup lang="ts">
import { XhButton, XhSwitch } from "@xihan-ui/vue";
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
    <label><XhSwitch name="notify" default-checked /> 接收通知（开着，提交 notify=on）</label>
    <label><XhSwitch name="beta" /> 加入内测（没开就整条不进 FormData）</label>
    <!-- value 换掉默认的 on -->
    <label><XhSwitch name="theme" value="dark" default-checked /> 深色主题（提交 theme=dark）</label>

    <div>
      <XhButton type="submit" size="sm">提交</XhButton>
    </div>

    <span v-if="submitted">表单收到：{{ submitted }}</span>
  </form>
</template>
`;export{n as default};
