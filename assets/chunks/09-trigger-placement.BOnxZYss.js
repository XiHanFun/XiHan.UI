const e=`<!-- 加减钮排布 | 触发器位置由作者写模板决定：放进 control 即减在左、加在右、输入框居中的一体式，不写 control 则照旧三件并排 -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhNumberFieldRoot default-value="1" :min="0" :max="9">
    <XhNumberFieldLabel>一体式（control）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="1" :min="0" :max="9">
    <XhNumberFieldLabel>三件并排（不写 control）</XhNumberFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput style="inline-size: 80px; text-align: center" />
      <XhNumberFieldIncrementTrigger />
    </div>
  </XhNumberFieldRoot>
</template>
`;export{e as default};
