const e=`<!-- 多选 | 选完不收起、输入串自动清空，候选立刻回到全集；框里空着时退格删掉最后一个已选项 -->
<script setup lang="ts">
import { computed, ref } from "vue";
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
<\/script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="常去城市"
    empty="无匹配城市"
    multiple
    placeholder="挑几个城市"
  />
  <p>已选：{{ value.length ? value.join("、") : "（无）" }}</p>
</template>
`;export{e as default};
