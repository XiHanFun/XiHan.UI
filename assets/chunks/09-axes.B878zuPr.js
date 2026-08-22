const e=`<!-- 三轴 | variant 决定描边与底怎么画、tone 决定用哪族颜色、size 换几何档；三者只落在 root，浮层里的格子一并跟着换 -->
<script setup lang="ts">
import type { ControlVariant, Size, Tone } from "@xihan-ui/kernel";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerInput,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
} from "@xihan-ui/vue";

const variants: ControlVariant[] = ["outline", "subtle", "ghost"];
const tones: Tone[] = ["brand", "success", "danger"];
const sizes: Size[] = ["sm", "md", "lg"];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <div
      v-for="(row, i) in [variants, tones, sizes]"
      :key="i"
      style="display: flex; flex-wrap: wrap; gap: 16px"
    >
      <XhTimePickerRoot
        v-for="v in row"
        :key="v"
        :variant="i === 0 ? (v as ControlVariant) : undefined"
        :tone="i === 1 ? (v as Tone) : undefined"
        :size="i === 2 ? (v as Size) : undefined"
        default-value="09:30"
      >
        <XhTimePickerLabel>{{ v }}</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerInput segment="hour" />
          <span>:</span>
          <XhTimePickerInput segment="minute" />
          <XhTimePickerClearTrigger />
        </XhTimePickerControl>
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            <XhTimePickerColumn v-slot="{ options }" unit="hour">
              <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
            </XhTimePickerColumn>
            <XhTimePickerColumn v-slot="{ options }" unit="minute">
              <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
            </XhTimePickerColumn>
          </XhTimePickerContent>
        </XhTimePickerPositioner>
      </XhTimePickerRoot>
    </div>
  </div>
</template>
`;export{e as default};
