const n=`<!-- 基础用法 | 条子贴在视口顶边（往页面最上方看）；不给 value 就是不确定进度，宽度自行往前爬，loading 翻 false 才冲到头并淡出 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";

const loading = ref(false);
// 只读进度用 value-change 接；写进 value prop 会把它变成确定进度，爬升就停了
const value = ref(0);
<\/script>

<template>
  <XhLoadingBarRoot :loading="loading" @value-change="value = $event.value">
    <XhLoadingBarTrack>
      <XhLoadingBarRange />
    </XhLoadingBarTrack>
  </XhLoadingBarRoot>

  <XhButton variant="solid" @click="loading = true">开始加载</XhButton>
  <XhButton variant="outline" @click="loading = false">结束加载</XhButton>
  <span>假进度：{{ Math.round(value) }}%</span>
</template>
`;export{n as default};
