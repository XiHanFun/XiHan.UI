const n=`<!-- 动效 | 在微光、呼吸和静止三档之间选择 -->
<script setup lang="ts">
import type { SkeletonAnimation } from "@xihan-ui/headless";
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";

const animations: SkeletonAnimation[] = ["shimmer", "pulse", "none"];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px">
    <div v-for="animation in animations" :key="animation" style="display: grid; gap: 8px">
      <span>{{ animation }}</span>
      <XhSkeletonRoot :animation="animation" style="inline-size: 140px">
        <XhSkeletonItem shape="rect" style="--xh-skeleton-rect-block-size: 64px" />
        <XhSkeletonItem style="inline-size: 70%" />
      </XhSkeletonRoot>
    </div>
  </div>
</template>
`;export{n as default};
