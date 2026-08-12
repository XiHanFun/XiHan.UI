<!-- 异步提交 | 受控开关在回执到达前不落位；loading 让提交期呈现为「处理中」而非禁用——交互挂起、滑块转圈、仍可聚焦 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSwitch } from "@xihan-ui/vue";

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
    <XhSwitch :checked="enabled" :loading="pending" @checked-change="onCheckedChange" />
    <span>{{ pending ? "提交中…" : enabled ? "已开启" : "已关闭" }}</span>
  </div>
</template>
