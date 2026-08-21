const e=`<!-- 码点形状 | square / dot / rounded；三种形状的墨都盖住每个模块的格心，读码器按格心取样 -->
<script setup lang="ts">
import { XhQrCode } from "@xihan-ui/vue";

const shapes = ["square", "dot", "rounded"] as const;
const text = "https://ui.xihanfun.com/components/qr-code";
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div
      v-for="shape in shapes"
      :key="shape"
      style="display: grid; gap: 6px; justify-items: center"
    >
      <!-- 时序图形与校正图形不跟着变形：它们是透视校正的几何基准 -->
      <XhQrCode :value="text" :module-shape="shape" :pixel-size="128" />
      <span style="font-size: 12px">{{ shape }}</span>
    </div>
  </div>
</template>
`;export{e as default};
