const a=`<!-- 回退延迟与原生属性 | fallback-delay 决定回退内容多久才露面，Infinity 表示加载期间一直不露面、只有失败才显；写在 image 部件上的原生属性照常落到底层图片元素上 -->
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

const shot
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%231e293b%22/%3E%3Crect%20x=%220.4%22%20y=%220.4%22%20width=%223.2%22%20height=%220.5%22%20fill=%22%2338bdf8%22/%3E%3Crect%20x=%220.4%22%20y=%221.2%22%20width=%222%22%20height=%220.4%22%20fill=%22%2364748b%22/%3E%3C/svg%3E";

// 加载期间一直不让回退内容露面
const untilFailed = Number.POSITIVE_INFINITY;
<\/script>

<template>
  <!-- 缺省 0：加载还没完成的那一刻回退内容就顶上 -->
  <XhImageRoot
    :src="shot"
    alt="立刻顶上回退内容"
    style="--xh-image-w: 140px; --xh-image-ratio: 4 / 3;"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <!-- 600 毫秒内加载完就一次都不闪 -->
  <XhImageRoot
    :src="shot"
    alt="慢过 600 毫秒才顶上回退内容"
    :fallback-delay="600"
    style="--xh-image-w: 140px; --xh-image-ratio: 4 / 3;"
  >
    <!-- loading 是原生图片属性，组件不拦，直接落到图片元素上 -->
    <XhImageImage loading="lazy" />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <!-- Infinity：加载途中什么都不显，只有失败才换人 -->
  <XhImageRoot
    src="https://example.invalid/shot.png"
    alt="只在失败时顶上回退内容"
    :fallback-delay="untilFailed"
    style="--xh-image-w: 140px; --xh-image-ratio: 4 / 3;"
  >
    <XhImageImage />
    <XhImageFallback>图挂了</XhImageFallback>
  </XhImageRoot>
</template>
`;export{a as default};
