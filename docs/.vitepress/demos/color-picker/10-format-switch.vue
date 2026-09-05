<!-- 面板里切换写法 | format 只管对外的序列化：换过之后把当前值原样写回一次，值串就改按新写法产出，工作色一点不动 -->
<script setup lang="ts">
import { nextTick, ref } from "vue";
import {
  XhButton,
  XhColorPickerSaturationArea,
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";

type Format = "hex" | "rgba" | "hsla";

const formats: Format[] = ["hex", "rgba", "hsla"];

const format = ref<Format>("hex");
const color = ref("#3b82f6");

async function applyFormat(next: Format, setValue: (value: string) => void) {
  format.value = next;
  // 等新写法落到组件上，再把当前值原样写回一次
  await nextTick();
  setValue(color.value);
}

const modes = {
  display: "flex",
  gap: "6px",
};
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhColorPickerRoot
      v-slot="{ setValue }"
      v-model:value="color"
      :format="format"
    >
      <XhColorPickerLabel>强调色</XhColorPickerLabel>
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
          <XhColorPickerChannelSlider channel="hue">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
          <div :style="modes">
            <XhButton
              v-for="item in formats"
              :key="item"
              size="sm"
              :variant="item === format ? 'solid' : 'ghost'"
              @click="applyFormat(item, setValue)"
            >
              {{ item }}
            </XhButton>
          </div>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>

    <span>当前：{{ color }}</span>
  </div>
</template>
