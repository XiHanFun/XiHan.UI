const e=`<!-- 尺寸 | size 落成 content 的 data-size，只改面板贴边方向上的厚度；三档各自一个抽屉，点开才看得出厚薄 -->
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";

// 中间档不传 size，缺省即中档
const sizes = [
  { key: "sm", size: "sm", label: "sm 薄" },
  { key: "md", size: undefined, label: "缺省" },
  { key: "lg", size: "lg", label: "lg 厚" },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhDrawerRoot
      v-for="s in sizes"
      :key="s.key"
      v-slot="{ setOpen }"
      :size="s.size"
      :translations="{ close: '关闭' }"
    >
      <XhDrawerTrigger>{{ s.label }}</XhDrawerTrigger>
      <XhDrawerContent>
        <XhDrawerTitle>{{ s.label }}抽屉</XhDrawerTitle>
        <XhDrawerDescription>
          面板贴住右边，三档只有厚度不同。
        </XhDrawerDescription>
        <XhButton variant="solid" @click="setOpen(false)">关闭</XhButton>
        <XhDrawerCloseTrigger>✕</XhDrawerCloseTrigger>
      </XhDrawerContent>
    </XhDrawerRoot>
  </div>
</template>
`;export{e as default};
