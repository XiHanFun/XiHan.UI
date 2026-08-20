<!-- 整组禁用 | disabled 落成原生 fieldset[disabled]，组内每个控件一并停掉，不必逐个写 disabled -->
<script setup lang="ts">
import { ref } from "vue";
import { XhFieldsetHelperText, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/vue";

const locked = ref(true);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px;">
    <label style="display: flex; gap: 8px; align-items: center;">
      <input v-model="locked" type="checkbox" />
      锁定这段设置
    </label>
    <XhFieldsetRoot :disabled="locked">
      <XhFieldsetLegend>发票抬头</XhFieldsetLegend>
      <input type="text" placeholder="公司名称" style="inline-size: 100%;" />
      <input type="text" placeholder="纳税人识别号" style="inline-size: 100%;" />
      <XhFieldsetHelperText>锁定期间这两个输入框既不能聚焦，也不参与提交</XhFieldsetHelperText>
    </XhFieldsetRoot>
  </div>
</template>
