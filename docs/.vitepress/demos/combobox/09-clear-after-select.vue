<!-- 选中后清空输入 | 选中值一变就把输入串清掉，候选立刻回到全集，接着挑下一个不用先删字 -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { XhComboboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter((c) => c.label.toLowerCase().includes(q));
});
const picked = computed(() => cities.find((c) => c.value === value.value[0]) ?? null);

// 输入串受控，选中值一落地就把它清成空串
watch(value, () => {
  query.value = "";
});
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    label="城市"
    empty="无匹配城市"
    open-on-click
    placeholder="选完接着挑下一个"
  />
  <p>当前值：{{ picked?.label ?? "（未选）" }}</p>
</template>
