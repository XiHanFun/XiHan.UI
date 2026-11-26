<!-- 格式化显示 | formatOptions 交给 Intl.NumberFormat：失焦时显示格式化文字，聚焦编辑时换回原值；值与表单提交始终是原值 -->
<script setup lang="ts">
import { XhButton, XhNumberFieldRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const price = ref("1234.5");
const submitted = ref("");
// 选项原样交给 Intl.NumberFormat，语言取 locale；没写 locale 时取全局配置
const currency: Intl.NumberFormatOptions = { style: "currency", currency: "CNY" };

function onSubmit(event: Event) {
  submitted.value = String(new FormData(event.target as HTMLFormElement).get("price") ?? "");
}
</script>

<template>
  <form
    style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 320px"
    @submit.prevent="onSubmit"
  >
    <XhNumberFieldRoot
      v-model:value="price"
      label="单价"
      name="price"
      locale="zh-CN"
      :format-options="currency"
      :min="0"
      :step="10"
    />
    <XhButton type="submit" variant="outline" style="align-self: start">提交</XhButton>
    <span data-demo-output>值：{{ price }} · 表单收到：{{ submitted || "（还没提交）" }}</span>
  </form>
</template>
