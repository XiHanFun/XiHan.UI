const a=`<!-- 排成一列 | 头像本身不管布局，叠放与间距由外层容器决定 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const members = ["曦", "寒", "懿", "XH"];
<\/script>

<template>
  <div style="display: flex">
    <XhAvatarRoot
      v-for="(m, i) in members"
      :key="m"
      :style="{ marginLeft: i ? '-8px' : '0', outline: '2px solid var(--vp-c-bg)', borderRadius: '999px' }"
    >
      <XhAvatarImage />
      <XhAvatarFallback>{{ m }}</XhAvatarFallback>
    </XhAvatarRoot>
  </div>
</template>
`;export{a as default};
