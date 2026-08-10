<!-- 随表单提交 | 根插槽把选中值交出来：在根里补一个隐藏输入承接它，值随原生表单一并提交；浮层收起时回车留给表单 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhButton,
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "hangzhou", label: "Hangzhou 杭州" },
];

const value = ref<string[]>([]);
const query = ref("");
const submitted = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter((c) => c.label.toLowerCase().includes(q));
});

function onSubmit(event: Event): void {
  const data = new FormData(event.target as HTMLFormElement);
  submitted.value = String(data.get("city") ?? "");
}
</script>

<template>
  <form
    style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 420px"
    @submit.prevent="onSubmit"
  >
    <XhComboboxRoot
      v-slot="{ value: picked }"
      v-model:value="value"
      v-model:input-value="query"
      open-on-click
      placeholder="输入城市名"
    >
      <XhComboboxLabel>常驻城市</XhComboboxLabel>
      <XhComboboxControl>
        <XhComboboxInput />
        <XhComboboxTrigger>▾</XhComboboxTrigger>
        <XhComboboxClearTrigger>✕</XhComboboxClearTrigger>
      </XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent>
          <XhComboboxItem v-for="c in filtered" :key="c.value" :value="c.value">
            <XhComboboxItemText>{{ c.label }}</XhComboboxItemText>
            <XhComboboxItemIndicator>✓</XhComboboxItemIndicator>
          </XhComboboxItem>
        </XhComboboxContent>
        <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
      </XhComboboxPositioner>
      <!-- 进表单的出口由作者补：多选时按自己的约定拼串 -->
      <input type="hidden" name="city" :value="picked.join(',')" />
    </XhComboboxRoot>
    <XhButton type="submit" variant="outline" style="align-self: start">提交</XhButton>
    <span>表单收到：{{ submitted || "（还没提交）" }}</span>
  </form>
</template>
