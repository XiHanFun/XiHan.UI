const r=`<!-- 值串写法 | format 只决定对外的序列化，工作色始终是同一套；三种写法各挑一个色，改动后按各自的写法产出 -->
<script setup lang="ts">
import {
  XhColorPickerArea,
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";

const cases = [
  { format: "hex", value: "#00a98e" },
  { format: "rgba", value: "rgba(59, 130, 246, 1)" },
  { format: "hsla", value: "hsla(38, 92%, 50%, 1)" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhColorPickerRoot
      v-for="item in cases"
      :key="item.format"
      :format="item.format"
      :default-value="item.value"
    >
      <XhColorPickerLabel>{{ item.format }}</XhColorPickerLabel>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
      <XhColorPickerPositioner>
        <XhColorPickerContent>
          <XhColorPickerArea>
            <XhColorPickerAreaThumb />
          </XhColorPickerArea>
          <XhColorPickerChannelSlider channel="hue">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>
  </div>
</template>
`;export{r as default};
