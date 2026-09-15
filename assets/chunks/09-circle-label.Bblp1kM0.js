const n=`<!-- 环心文字 | 组件只负责把内容摆到环心，写什么由使用者决定 -->
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import { XhIcon, XhProgress } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
    <XhProgress variant="circle" :value="72">
      <strong style="font-size: 20px">72%</strong>
    </XhProgress>

    <!-- 进度不是百分比时补一句 value-text：读屏念到的要和眼睛看到的一致 -->
    <XhProgress variant="circle" :value="3" :max="8" value-text="第 3 步，共 8 步">
      <span>3 / 8</span>
    </XhProgress>

    <XhProgress variant="circle" :value="100" tone="success">
      <span style="font-size: 24px"><XhIcon :icon="CheckIcon" /></span>
    </XhProgress>
  </div>
</template>
`;export{n as default};
