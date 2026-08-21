<!-- 校验态 | invalid 由宿主自己判定，不必挂在表单上；标出来之后值照样能改、加减钮照样能按 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

const stock = 5;
const qty = ref(8);

function onValueChange(details: { valueAsNumber: number }) {
  qty.value = details.valueAsNumber;
}
</script>

<template>
  <XhNumberFieldRoot
    default-value="8"
    :min="1"
    :max="99"
    :invalid="qty > stock"
    @value-change="onValueChange"
  >
    <XhNumberFieldLabel>购买数量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput />
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
    <span>{{ qty > stock ? "库存只有 " + stock + " 件" : "库存充足" }}</span>
  </XhNumberFieldRoot>
</template>
