const e=`<!-- 禁用与越界 | 禁用整组退出 Tab 序；越界只做标注，08:00 原样留着不被改写 -->
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: grid; gap: 16px">
    <XhTimeFieldRoot default-value="13:45" disabled>
      <XhTimeFieldLabel>禁用</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldControl>
    </XhTimeFieldRoot>

    <XhTimeFieldRoot default-value="08:00" min="09:00" max="18:00">
      <XhTimeFieldLabel>越界（09:00 – 18:00）</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldControl>
    </XhTimeFieldRoot>
  </div>
</template>
`;export{e as default};
