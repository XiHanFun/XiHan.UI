<!-- 状态与尺寸 | 禁用、只读、无效三态与 sm / lg 两档；色块与清空按钮跟着字段的尺寸档走 -->
<script setup lang="ts">
import {
  XhColorFieldClearTrigger,
  XhColorFieldControl,
  XhColorFieldInput,
  XhColorFieldLabel,
  XhColorFieldRoot,
  XhColorFieldSwatch,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhColorFieldRoot default-value="#10b981" disabled>
      <XhColorFieldLabel>禁用</XhColorFieldLabel>
      <XhColorFieldControl style="inline-size: 14rem">
        <XhColorFieldSwatch />
        <XhColorFieldInput />
        <XhColorFieldClearTrigger />
      </XhColorFieldControl>
    </XhColorFieldRoot>
    <XhColorFieldRoot default-value="#10b981" read-only>
      <XhColorFieldLabel>只读</XhColorFieldLabel>
      <XhColorFieldControl style="inline-size: 14rem">
        <XhColorFieldSwatch />
        <XhColorFieldInput />
        <XhColorFieldClearTrigger />
      </XhColorFieldControl>
    </XhColorFieldRoot>
    <XhColorFieldRoot default-value="#10b981" invalid clearable>
      <XhColorFieldLabel>无效</XhColorFieldLabel>
      <XhColorFieldControl style="inline-size: 14rem">
        <XhColorFieldSwatch />
        <XhColorFieldInput />
        <XhColorFieldClearTrigger />
      </XhColorFieldControl>
    </XhColorFieldRoot>
    <XhColorFieldRoot default-value="#10b981" size="sm" clearable>
      <XhColorFieldLabel>小号</XhColorFieldLabel>
      <XhColorFieldControl style="inline-size: 14rem">
        <XhColorFieldSwatch />
        <XhColorFieldInput />
        <XhColorFieldClearTrigger />
      </XhColorFieldControl>
    </XhColorFieldRoot>
    <XhColorFieldRoot default-value="#10b981" size="lg" clearable>
      <XhColorFieldLabel>大号</XhColorFieldLabel>
      <XhColorFieldControl style="inline-size: 14rem">
        <XhColorFieldSwatch />
        <XhColorFieldInput />
        <XhColorFieldClearTrigger />
      </XhColorFieldControl>
    </XhColorFieldRoot>
  </div>
</template>
