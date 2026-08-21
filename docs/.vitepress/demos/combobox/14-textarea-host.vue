<!-- 多行输入宿主 | 输入部件写成 textarea 即多行宿主；此时不写 role 与 aria-expanded，textarea 保留它自带的 textbox 角色 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/vue";

const replies = [
  { value: "received", label: "已收到，稍后处理" },
  { value: "shipping", label: "商品已发出，请注意查收" },
  { value: "refund", label: "退款已提交，三个工作日内到账" },
];

const value = ref<string[]>([]);
const draft = ref("");
const filtered = computed(() => {
  const q = draft.value.trim().toLowerCase();
  return q === "" ? replies : replies.filter((r) => r.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot v-model:value="value" v-model:input-value="draft" allow-custom-value>
    <XhComboboxLabel>回复内容</XhComboboxLabel>
    <XhComboboxControl>
      <!-- 换标签只此一处；键盘、高亮与选中回填的行为一律不变 -->
      <XhComboboxInput as="textarea" rows="3" placeholder="挑一条常用语，或自己写" />
      <XhComboboxTrigger />
    </XhComboboxControl>
    <XhComboboxPositioner>
      <XhComboboxContent>
        <XhComboboxItem v-for="r in filtered" :key="r.value" :value="r.value">
          <XhComboboxItemText>{{ r.label }}</XhComboboxItemText>
          <XhComboboxItemIndicator />
        </XhComboboxItem>
      </XhComboboxContent>
    </XhComboboxPositioner>
  </XhComboboxRoot>
  <p>草稿：{{ draft || "（空）" }}</p>
</template>
