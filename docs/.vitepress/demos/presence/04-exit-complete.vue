<!-- 退场完成 | exit-complete 在退场动画播完、内容撤下之后才发，「退场中」与「已撤下」由它分开；退场途中改回在场不发 -->
<script setup lang="ts">
import {
  XhAlertContent,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
  XhPresence,
} from "@xihan-ui/vue";
import { ref } from "vue";

const shown = ref(true);
const status = ref("在场");

function toggle(): void {
  shown.value = !shown.value;
  status.value = shown.value ? "在场" : "退场中";
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: var(--xh-space-3)">
    <XhButton size="sm" style="justify-self: start" @click="toggle">
      {{ shown ? "收起" : "显示" }}
    </XhButton>
    <XhPresence :present="shown" @exit-complete="status = '已撤下'">
      <XhAlertRoot>
        <XhAlertContent>
          <XhAlertTitle>这条提示撤下之后才算处理完</XhAlertTitle>
        </XhAlertContent>
      </XhAlertRoot>
    </XhPresence>
  </div>
  <span data-demo-output>状态：{{ status }}</span>
</template>
