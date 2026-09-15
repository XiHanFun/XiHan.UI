const a=`<!-- 形状 | 圆角是一个组件令牌，整圆、圆角方、直角都是同一个槽位换值；图片的圆角从根继承，不用另设 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot src="/images/logo.png" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot
      src="/images/logo.png"
      alt="曦寒"
      style="--xh-avatar-radius: var(--xh-radius-md)"
    >
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot
      src="/images/logo.png"
      alt="曦寒"
      style="--xh-avatar-radius: var(--xh-radius-none)"
    >
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <span style="font-size: 13px">整圆（缺省）/ 圆角方 / 直角</span>
  </div>

  <!-- 落回退态时形状一样成立 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot>
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot style="--xh-avatar-radius: var(--xh-radius-md)">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot style="--xh-avatar-radius: var(--xh-radius-none)">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>
  </div>
</template>
`;export{a as default};
