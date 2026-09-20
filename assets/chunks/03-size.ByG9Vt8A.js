const a=`<!-- 尺寸 | size 三档只改变直径，回退文字的字号随之缩放；默认档不输出 data-size -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <!-- 有图的一行：图片铺满 root，跟着三档一起缩放 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot size="sm" src="/images/demo-avatar.svg" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot src="/images/demo-avatar.svg" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot size="lg" src="/images/demo-avatar.svg" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    <span style="font-size: 13px">sm / 缺省 / lg</span>
  </div>

  <!-- 落回退态的一行：小头像里的字不撑出去，大头像里的字也不显小 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot size="sm">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot>
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot size="lg">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>
    <span style="font-size: 13px">回退字随档位缩放</span>
  </div>
</template>
`;export{a as default};
