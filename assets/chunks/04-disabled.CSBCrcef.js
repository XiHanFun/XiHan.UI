const o=`<!-- 禁用 | disabled 同时挡住触发器与面板内的所有交互 -->
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhColorPickerRoot default-value="#9ca3af" disabled>
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
`;export{o as default};
