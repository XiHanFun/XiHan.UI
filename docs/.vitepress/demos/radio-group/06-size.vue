<!-- 尺寸 | size 改条目间距与字号，不写即缺省中档 -->
<script setup lang="ts">
import {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
    <XhRadioGroupRoot default-value="standard" size="sm">
      <XhRadioGroupLabel>sm</XhRadioGroupLabel>
      <XhRadioGroupItem value="free">
        <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
      </XhRadioGroupItem>
      <XhRadioGroupItem value="standard">
        <XhRadioGroupItemText>标准版</XhRadioGroupItemText>
      </XhRadioGroupItem>
    </XhRadioGroupRoot>

    <XhRadioGroupRoot default-value="standard">
      <XhRadioGroupLabel>缺省</XhRadioGroupLabel>
      <XhRadioGroupItem value="free">
        <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
      </XhRadioGroupItem>
      <XhRadioGroupItem value="standard">
        <XhRadioGroupItemText>标准版</XhRadioGroupItemText>
      </XhRadioGroupItem>
    </XhRadioGroupRoot>

    <XhRadioGroupRoot default-value="standard" size="lg">
      <XhRadioGroupLabel>lg</XhRadioGroupLabel>
      <XhRadioGroupItem value="free">
        <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
      </XhRadioGroupItem>
      <XhRadioGroupItem value="standard">
        <XhRadioGroupItemText>标准版</XhRadioGroupItemText>
      </XhRadioGroupItem>
    </XhRadioGroupRoot>
  </div>
</template>
