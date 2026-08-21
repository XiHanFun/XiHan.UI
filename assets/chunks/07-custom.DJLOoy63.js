const a=`<!-- 自定义直径与配色 | 三档之外的直径、底色、字色各是一个组件令牌；按人名分配颜色就是逐个实例覆盖 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const people = [
  { text: "曦", bg: "#fee2e2", fg: "#b91c1c" },
  { text: "寒", bg: "#dcfce7", fg: "#15803d" },
  { text: "懿", bg: "#e0e7ff", fg: "#4338ca" },
  { text: "XH", bg: "#fef3c7", fg: "#b45309" },
];
<\/script>

<template>
  <!-- 直径与字号一起给，回退字才不会在大头像里显小 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot
      src="/images/logo.png"
      alt="曦寒"
      style="--xh-avatar-size: 56px; --xh-avatar-font-size: 20px"
    >
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot style="--xh-avatar-size: 56px; --xh-avatar-font-size: 20px">
      <XhAvatarImage />
      <XhAvatarFallback>曦寒</XhAvatarFallback>
    </XhAvatarRoot>

    <span style="font-size: 13px">直径 56px</span>
  </div>

  <div style="display: flex; align-items: center; gap: 8px">
    <XhAvatarRoot
      v-for="p in people"
      :key="p.text"
      :style="{ '--xh-avatar-bg': p.bg, '--xh-avatar-fg': p.fg }"
    >
      <XhAvatarImage />
      <XhAvatarFallback>{{ p.text }}</XhAvatarFallback>
    </XhAvatarRoot>

    <span style="font-size: 13px">底色与字色逐个给</span>
  </div>
</template>
`;export{a as default};
