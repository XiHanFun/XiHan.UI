const e=`<!-- 随表单提交 | 值串的表单出口由作者自己挂：把当前值写进一份 input[type=hidden] 就带得走；浮层就地渲染，节点始终留在 form 里 -->
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

const submitted = ref("");

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement);
  submitted.value = String(data.get("brandColor") ?? "");
}
<\/script>

<template>
  <form style="display: grid; gap: 12px" @submit.prevent="onSubmit">
    <XhColorPickerRoot v-slot="{ value }" default-value="#00a98e">
      <XhColorPickerLabel>品牌色</XhColorPickerLabel>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
      <input type="hidden" name="brandColor" :value="value" />
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

    <div>
      <XhButton type="submit" size="sm">提交</XhButton>
    </div>

    <span v-if="submitted">表单收到：{{ submitted }}</span>
  </form>
</template>
`;export{e as default};
