<!-- 文字方向 | dir 换成 rtl 后轨道从右往左填，左右两键的语义跟着对调；上下键与 Home、End 不受影响 -->
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
</script>

<template>
  <div style="display: grid; gap: 20px">
    <XhSliderRoot v-slot="{ value }" :default-value="[35]" style="inline-size: 280px">
      <XhSliderLabel>从左往右：{{ value[0] }}</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <!-- 外层节点声明文字方向，轨道与滑块用的逻辑属性据此换向 -->
    <div dir="rtl">
      <XhSliderRoot
        v-slot="{ value }"
        dir="rtl"
        :default-value="[35]"
        style="inline-size: 280px"
      >
        <XhSliderLabel>从右往左：{{ value[0] }}</XhSliderLabel>
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
  </div>
</template>
