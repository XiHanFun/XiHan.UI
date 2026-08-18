<!-- 业务取值 | checked 只认布尔，在中间换一道，进出两头拿到的都是业务值 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhCheckbox } from "@xihan-ui/vue";

// 后端收的是两个状态码，界面上只有勾与不勾
const status = ref<"enabled" | "disabled">("enabled");
const enabled = computed({
  get: () => status.value === "enabled",
  set: (next) => (status.value = next ? "enabled" : "disabled"),
});

// 也可以不落中间变量，直接在事件里写回业务值
const plan = ref<"pro" | "free">("free");
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhCheckbox v-model:checked="enabled" />
      <span>启用（{{ status }}）</span>
    </span>

    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhCheckbox
        :checked="plan === 'pro'"
        @update:checked="plan = $event ? 'pro' : 'free'"
      />
      <span>专业版（{{ plan }}）</span>
    </span>
  </div>
</template>
