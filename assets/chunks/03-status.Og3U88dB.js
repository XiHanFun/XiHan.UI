const n=`<!-- 状态与失败 | 写入是异步的也真的会失败：按下先进 copying，写成功才翻成 copied，失败一律退回 idle 并把原因报出来 -->
<script setup lang="ts">
import { ref } from "vue";
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhClipboardControl,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
  XhClipboardTrigger,
  XhIcon,
} from "@xihan-ui/vue";

const status = ref("idle");
const lastError = ref("");

function onStatusChange(details: { status: string }) {
  status.value = details.status;
}

function onCopyError(details: { error: unknown; value: string }) {
  lastError.value = String(details.error);
}
<\/script>

<template>
  <!-- timeout 决定“已复制”停留多久，到点自己回落 -->
  <XhClipboardRoot
    value="订单号 A2026-0809-117"
    :timeout="2000"
    @status-change="onStatusChange"
    @copy-error="onCopyError"
  >
    <XhClipboardControl>
      <XhClipboardInput />
      <XhClipboardTrigger>
        <XhClipboardIndicator>复制</XhClipboardIndicator>
        <XhClipboardIndicator copied><XhIcon :icon="CheckIcon" /> 已复制</XhClipboardIndicator>
      </XhClipboardTrigger>
    </XhClipboardControl>
  </XhClipboardRoot>

  <span style="font-size: 13px;">
    状态：{{ status }}
    <template v-if="lastError"> · 上次失败：{{ lastError }}</template>
  </span>
</template>
`;export{n as default};
