const t=`<!-- 形态 | outline 画描边输入面，subtle 用淡底嵌入已有表面 -->
<script setup lang="ts">
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhInputGroupRoot variant="outline">
      <XhInputGroupItem>¥</XhInputGroupItem>
      <XhTextFieldRoot placeholder="描边表面">
        <XhTextFieldControl>
          <XhTextFieldInput inputmode="decimal" aria-label="描边金额" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </XhInputGroupRoot>

    <XhInputGroupRoot variant="subtle">
      <XhInputGroupItem>¥</XhInputGroupItem>
      <XhTextFieldRoot placeholder="淡底表面">
        <XhTextFieldControl>
          <XhTextFieldInput inputmode="decimal" aria-label="淡底金额" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </XhInputGroupRoot>
  </div>
</template>
`;export{t as default};
