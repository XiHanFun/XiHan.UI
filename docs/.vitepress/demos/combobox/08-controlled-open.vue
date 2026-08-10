<!-- 受控展开 | 传了 open 就由宿主说了算：组件只报展开意图，这里满两个字符才真的把浮层放出来 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhComboboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "london", label: "London 伦敦" },
];

const value = ref<string[]>([]);
const query = ref("");
const wantOpen = ref(false);
// 组件的展开意图与输入长度两个条件都满足才展开
const open = computed(() => wantOpen.value && query.value.trim().length >= 2);
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter((c) => c.label.toLowerCase().includes(q));
});

function onOpenChange(details: { open: boolean }): void {
  wantOpen.value = details.open;
}
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    :open="open"
    label="城市"
    empty="无匹配城市"
    placeholder="至少输入两个字符"
    @open-change="onOpenChange"
  />
  <p>浮层：{{ open ? "展开" : "收起" }} · 当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
