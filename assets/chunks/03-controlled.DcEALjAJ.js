const e=`<!-- 受控 | 传入 value 后由宿主决定；value-change 除原始串外还带一份 valueAsNumber -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const qty = ref("3");
const asNumber = ref(3);
<\/script>

<template>
  <XhNumberFieldRoot
    v-model:value="qty"
    :min="0"
    :max="99"
    @value-change="asNumber = $event.valueAsNumber"
  >
    <XhNumberFieldLabel>数量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
  <span>输入串：{{ qty === "" ? "（空）" : qty }} · 数值：{{ asNumber }}</span>
</template>
`;export{e as default};
