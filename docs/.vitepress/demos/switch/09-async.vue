<!-- 异步提交 | 受控开关在回执到达前不落位，提交期间 disabled 挡住重复点击 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSpinner, XhSwitch } from "@xihan-ui/vue";

const enabled = ref(false);
const pending = ref(false);

// 回执到达才写回 checked，中途开关停在旧值上
function onCheckedChange(details: { checked: boolean }) {
  pending.value = true;
  setTimeout(() => {
    enabled.value = details.checked;
    pending.value = false;
  }, 900);
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 10px">
    <XhSwitch :checked="enabled" :disabled="pending" @checked-change="onCheckedChange" />
    <XhSpinner v-if="pending" size="sm" label="提交中" />
    <span v-else>{{ enabled ? "已开启" : "已关闭" }}</span>
  </div>
</template>
