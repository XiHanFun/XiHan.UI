const t=`<!-- 分段 | steps 把轨道切成等宽的格，填充按整格亮起；读屏报的仍是实际值 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
import { ref } from "vue";

const step = ref(3);
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 8px">
    <XhProgress
      :value="step"
      :max="5"
      :steps="5"
      :value-text="\`第 \${step} 步，共 5 步\`"
      aria-label="注册进度"
    />
    <div style="display: flex; gap: 8px">
      <button type="button" @click="step = Math.max(0, step - 1)">上一步</button>
      <button type="button" @click="step = Math.min(5, step + 1)">下一步</button>
    </div>
  </div>
</template>
`;export{t as default};
