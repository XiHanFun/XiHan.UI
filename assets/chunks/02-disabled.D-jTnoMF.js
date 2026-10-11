var e=`<!-- 整组禁用 | disabled 写为原生 fieldset[disabled]，组内每个控件一并禁用，不必逐个写 disabled -->
<script setup lang="ts">
import {
  XhCheckbox,
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFieldsetDescription,
  XhFieldsetLegend,
  XhFieldsetRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const locked = ref(true);
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px;">
    <XhCheckbox :checked="locked" @update:checked="locked = $event === true">锁定这段设置</XhCheckbox>
    <XhFieldsetRoot :disabled="locked">
      <XhFieldsetLegend>发票抬头</XhFieldsetLegend>
      <XhFieldRoot>
        <XhFieldLabel>公司名称</XhFieldLabel>
        <XhFieldControl>
          <input type="text">
        </XhFieldControl>
      </XhFieldRoot>
      <XhFieldRoot>
        <XhFieldLabel>纳税人识别号</XhFieldLabel>
        <XhFieldControl>
          <input type="text">
        </XhFieldControl>
      </XhFieldRoot>
      <XhFieldsetDescription>锁定期间这两个输入框既不能聚焦，也不参与提交</XhFieldsetDescription>
    </XhFieldsetRoot>
  </div>
</template>
`;export{e as default};