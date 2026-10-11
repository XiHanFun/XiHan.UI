var e=`<!-- 程序化改值 | setValue 直接写值，只受禁用、只读与字数上限约束；clear 执行清空意图，canClear 不成立时不做任何处理 -->
<script setup lang="ts">
import {
  XhButton,
  XhTextFieldControl,
  XhTextFieldCount,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhTextFieldRoot
    v-slot="{ value, canClear, setValue, clear }"
    placeholder="等着被写入"
    :max-length="12"
    clearable
    show-count
  >
    <XhTextFieldLabel>收货人</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldInput />
    </XhTextFieldControl>
    <XhTextFieldCount />
    <div style="display: flex; gap: 8px">
      <XhButton variant="outline" size="sm" @click="setValue('曦寒')">写入</XhButton>
      <XhButton variant="outline" size="sm" @click="setValue(\`\${value}·\`)">追加一个点</XhButton>
      <XhButton variant="outline" size="sm" :disabled="!canClear" @click="clear()">清空</XhButton>
    </div>
  </XhTextFieldRoot>
</template>
`;export{e as default};