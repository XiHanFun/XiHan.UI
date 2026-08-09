<!-- 形态 | variant 只改输入行的底色与描边用法，取值、过滤与键盘行为都不变 -->
<script setup lang="ts">
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhComboboxRoot
      v-for="v in variants"
      :key="v"
      :variant="v"
      open-on-click
      placeholder="选择水果"
      style="width: 240px"
    >
      <XhComboboxLabel>{{ v }}</XhComboboxLabel>
      <XhComboboxControl>
        <XhComboboxInput />
        <XhComboboxTrigger>▾</XhComboboxTrigger>
      </XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent>
          <XhComboboxItem v-for="f in fruits" :key="f.value" :value="f.value">
            <XhComboboxItemText>{{ f.label }}</XhComboboxItemText>
          </XhComboboxItem>
        </XhComboboxContent>
      </XhComboboxPositioner>
    </XhComboboxRoot>
  </div>
</template>
