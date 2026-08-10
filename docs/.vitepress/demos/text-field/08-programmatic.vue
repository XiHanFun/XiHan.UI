<!-- 程序化改值 | setValue 直接写值，只受禁用、只读与字数上限约束；clear 走清空意图，canClear 不成立时按兵不动 -->
<script setup lang="ts">
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot
    v-slot="{ value, empty, canClear, setValue, clear }"
    placeholder="等着被写入"
    :max-length="12"
    clearable
  >
    <XhTextFieldLabel>收货人</XhTextFieldLabel>
    <XhTextFieldInput style="inline-size: 200px" />
    <div style="display: flex; gap: 8px">
      <button type="button" @click="setValue('曦寒')">写入</button>
      <button type="button" @click="setValue(value + '·')">追加一个点</button>
      <button type="button" :disabled="!canClear" @click="clear()">清空</button>
    </div>
    <span>{{ empty ? "（空）" : value.length + " / 12" }}</span>
  </XhTextFieldRoot>
</template>
