const e=`<!-- 形态 | variant 只改皮肤怎么用颜色，加减与键盘行为三档完全一致 -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhNumberFieldRoot v-for="v in variants" :key="v" :variant="v" default-value="1">
      <XhNumberFieldLabel>{{ v }}</XhNumberFieldLabel>
      <XhNumberFieldControl>
        <XhNumberFieldDecrementTrigger />
        <XhNumberFieldInput />
        <XhNumberFieldIncrementTrigger />
      </XhNumberFieldControl>
    </XhNumberFieldRoot>
  </div>
</template>
`;export{e as default};
