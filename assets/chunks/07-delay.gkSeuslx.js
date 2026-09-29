const n=`<!-- 延迟露面 | delay 让转圈挂载后等一段时间才出现：快请求在这之前就回来，转圈从头到尾不露面，不会闪一下 -->
<script setup lang="ts">
import { XhButton, XhSpinner, XhSpinnerLabel } from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);
const result = ref("");

// 模拟一次耗时不同的请求：转圈只在请求在途时挂着
function query(ms: number): void {
  loading.value = true;
  result.value = "";
  window.setTimeout(() => {
    loading.value = false;
    result.value = \`用时 \${ms} ms，查询完成\`;
  }, ms);
}
<\/script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <div style="display: flex; gap: 8px">
      <XhButton variant="outline" :disabled="loading" @click="query(200)">快请求（200 ms）</XhButton>
      <XhButton variant="outline" :disabled="loading" @click="query(1500)">慢请求（1.5 s）</XhButton>
    </div>
    <XhSpinner v-if="loading" :delay="400" label="正在查询">
      <XhSpinnerLabel />
    </XhSpinner>
    <span v-else>{{ result }}</span>
  </div>
</template>
`;export{n as default};
