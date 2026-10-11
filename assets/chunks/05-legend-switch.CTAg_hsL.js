var e=`<!-- 总开关放进 legend | 按 HTML 规范，首个 legend 中的控件不受 fieldset[disabled] 连带影响，总开关因此始终可点击 -->
<script setup lang="ts">
import {
  XhCheckbox,
  XhFieldsetDescription,
  XhFieldsetLegend,
  XhFieldsetRoot,
  XhSelectRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const enabled = ref(false);
const frequencies = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
];
<\/script>

<template>
  <XhFieldsetRoot :disabled="!enabled" style="inline-size: 320px;">
    <XhFieldsetLegend>
      <XhCheckbox :checked="enabled" @update:checked="enabled = $event === true">启用自动备份</XhCheckbox>
    </XhFieldsetLegend>
    <XhSelectRoot :collection="frequencies" :default-value="['daily']" label="备份频率" />
    <XhCheckbox>失败时发通知</XhCheckbox>
    <XhFieldsetDescription>关掉总开关，下面两项跟着停用，唯独总开关自己还能点</XhFieldsetDescription>
  </XhFieldsetRoot>
</template>
`;export{e as default};