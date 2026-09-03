<!-- 自动开合与锁存 | 跑起来自动展开、结束自动收起；你手动开合过一次之后，阶段怎么变都不再自动 -->
<script setup lang="ts">
import type { ToolCallPhase } from "@xihan-ui/headless";
import {
  XhCodeViewCode,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallInput,
  XhToolCallLabel,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

const phase = ref<ToolCallPhase>("input-streaming");
const lastSource = ref("");

// 三秒一轮：在跑 → 完成 → 在跑
let timer = 0;
const tick = () => {
  phase.value = phase.value === "input-streaming" ? "output-available" : "input-streaming";
  timer = window.setTimeout(tick, 3000);
};
timer = window.setTimeout(tick, 3000);

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <XhToolCallRoot :phase="phase" @open-change="lastSource = $event.source">
      <XhToolCallTrigger>
        <XhToolCallIndicator>›</XhToolCallIndicator>
        <XhToolCallLabel>read_file</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallInput>
          <!-- 参数在流式期是半截 JSON，complete 接成「阶段不是参数在传」 -->
          <XhCodeViewRoot
            code='{ "path": "src/index.ts" }'
            lang="json"
            :complete="phase !== 'input-streaming'"
          >
            <XhCodeViewPre>
              <XhCodeViewCode />
            </XhCodeViewPre>
          </XhCodeViewRoot>
        </XhToolCallInput>
      </XhToolCallContent>
    </XhToolCallRoot>
    <p style="margin: 0;">上一次开合来自：{{ lastSource || "还没动过" }}</p>
  </div>
</template>
