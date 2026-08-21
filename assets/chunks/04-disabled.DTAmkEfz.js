const o=`<!-- 禁用 | disabled 同时挡住触发器与面板内的所有交互 -->
<script setup lang="ts">
import {
  XhColorPickerArea,
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhColorPickerRoot default-value="#9ca3af" disabled>
    <XhColorPickerTrigger>
      <XhColorPickerSwatch />
      <XhColorPickerValueText />
    </XhColorPickerTrigger>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerArea>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
`;export{o as default};
