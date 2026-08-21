const n=`<!-- 挂在自己的滚动容器上 | 滚动容器归你，滚动条只要拿到它；把节点交给 scrollable 即可 -->
<script setup lang="ts">
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const box = ref<HTMLElement | null>(null);
const lines = Array.from({ length: 40 }, (_, i) => \`第 \${i + 1} 行内容\`);
<\/script>

<template>
  <!-- 定位上下文归容器：滚动条是绝对定位的，贴的是最近那个定位祖先 -->
  <div style="position: relative; inline-size: 240px">
    <!-- 藏掉原生滚动条的外观，滚动能力一点不动 -->
    <div
      ref="box"
      style="
        block-size: 160px;
        overflow: auto;
        scrollbar-width: none;
        border: 1px solid var(--xh-border-default);
        border-radius: var(--xh-shape-surface);
        padding: 8px;
      "
    >
      <div v-for="line in lines" :key="line" style="padding-block: 2px">
        {{ line }}
      </div>
    </div>

    <XhScrollbarRoot :scrollable="box" type="always">
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>
`;export{n as default};
