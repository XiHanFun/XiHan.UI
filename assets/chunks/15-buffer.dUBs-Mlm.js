const e=`<!-- 缓冲 | buffer 在填充之后画第二段浅色填充，表示已经就绪、还没用到的那一截，如视频已缓冲到的位置 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
<\/script>

<template>
  <XhProgress :value="30" :buffer="65" value-text="已播放 30%" aria-label="播放进度" style="width: 100%" />
</template>
`;export{e as default};
