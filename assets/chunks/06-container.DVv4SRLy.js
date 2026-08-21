const n=`<!-- 挂在局部 | 条子默认贴视口顶边，改写成 absolute 再套一个相对定位的框子，它就只贴这块卡片的上沿 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";

const loading = ref(false);

function reload(): void {
  loading.value = true;
  window.setTimeout(() => (loading.value = false), 1600);
}
<\/script>

<template>
  <div
    style="
      position: relative;
      overflow: hidden;
      inline-size: 100%;
      max-inline-size: 420px;
      border: 1px solid var(--xh-border-subtle);
      border-radius: 8px;
    "
  >
    <XhLoadingBarRoot
      :loading="loading"
      :height="3"
      style="position: absolute"
    >
      <XhLoadingBarTrack>
        <XhLoadingBarRange />
      </XhLoadingBarTrack>
    </XhLoadingBarRoot>

    <div style="display: grid; gap: 10px; padding: 16px">
      <span>这块卡片自己的加载条，不会跑到页面最上方</span>
      <XhButton size="sm" variant="outline" @click="reload">刷新本卡片</XhButton>
    </div>
  </div>
</template>
`;export{n as default};
