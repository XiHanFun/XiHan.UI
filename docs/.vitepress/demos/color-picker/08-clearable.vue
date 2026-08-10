<!-- 空态与面板按钮 | 受控时「没有颜色」由宿主表达：值置空，触发器换成占位方框；面板底下的两个按钮是作者自己的，用插槽递出来的 setOpen 收起浮层 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
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

const color = ref("#3b82f6");

function clear(setOpen: (next: boolean) => void) {
  color.value = "";
  setOpen(false);
}

const placeholder = {
  display: "inline-flex",
  flex: "none",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "1.125rem",
  blockSize: "1.125rem",
  border: "1px dashed var(--xh-border-strong)",
  borderRadius: "var(--xh-radius-sm)",
  fontSize: "10px",
  color: "var(--xh-fg-muted)",
};

const actions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
};
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhColorPickerRoot v-slot="{ setOpen }" v-model:value="color">
      <XhColorPickerLabel>主题色</XhColorPickerLabel>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch v-if="color" />
        <span v-else :style="placeholder">∅</span>
        <XhColorPickerValueText>{{ color || "未设置" }}</XhColorPickerValueText>
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
          <div :style="actions">
            <XhButton size="sm" variant="ghost" @click="clear(setOpen)">
              清空
            </XhButton>
            <XhButton size="sm" @click="setOpen(false)">确定</XhButton>
          </div>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>

    <span>当前：{{ color || "未设置" }}</span>
  </div>
</template>
