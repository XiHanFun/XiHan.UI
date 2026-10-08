var e=`<!-- 多选成标签 | selectionMode="multiple" 时浮层里调出的颜色是草稿，按「添加」收进值、浮层不收，可以接着添；预设色板点一下切换选中。选中的颜色在输入行里排成带色点的标签，点叉或在展开钮上按退格摘掉 -->
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerConfirmTrigger,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHiddenInput,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerSwatchPicker,
  XhColorPickerTagList,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const swatches = ["#00a98e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
const value = ref<string[]>(["#00a98e", "#3b82f6"]);
<\/script>

<template>
  <XhColorPickerRoot
    v-model:value="value"
    name="palette"
    selection-mode="multiple"
    :swatches="swatches"
  >
    <XhColorPickerLabel>配色</XhColorPickerLabel>
    <XhColorPickerControl>
      <XhColorPickerTagList />
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerHiddenInput />
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
        <XhColorPickerHueSlider />
        <XhColorPickerSwatchPicker />
        <XhColorPickerConfirmTrigger>添加</XhColorPickerConfirmTrigger>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ value.join("、") || "（空）" }}
  </span>
</template>
`;export{e as default};