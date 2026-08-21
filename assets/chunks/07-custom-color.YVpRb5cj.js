const e=`<!-- 自定义配色 | 不写 variant 时底色与文字色取自组件令牌；描边这一条直接写 border-color -->
<script setup lang="ts">
import { XhBadge } from "@xihan-ui/vue";
<\/script>

<template>
  <XhBadge style="--xh-badge-bg: #8a2be2; --xh-badge-fg: #ffffff">葡萄</XhBadge>

  <XhBadge style="--xh-badge-bg: #ffe4f0; --xh-badge-fg: #b3306e">火烈鸟</XhBadge>

  <!-- 底色留白、只留一圈描边 -->
  <XhBadge style="--xh-badge-bg: transparent; --xh-badge-fg: #555555; border-color: #555555">
    只描边
  </XhBadge>
</template>
`;export{e as default};
