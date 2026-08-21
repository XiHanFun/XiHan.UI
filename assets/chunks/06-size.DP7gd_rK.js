const e=`<!-- 尺寸 | size 改轨道厚度与滑块直径，不写即缺省中档 -->
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: grid; gap: 20px">
    <XhSliderRoot :default-value="[50]" size="sm" style="inline-size: 280px">
      <XhSliderLabel>sm</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <XhSliderRoot :default-value="[50]" style="inline-size: 280px">
      <XhSliderLabel>缺省</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <XhSliderRoot :default-value="[50]" size="lg" style="inline-size: 280px">
      <XhSliderLabel>lg</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>
  </div>
</template>
`;export{e as default};
