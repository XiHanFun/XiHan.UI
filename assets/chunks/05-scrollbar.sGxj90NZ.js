const r=`<!-- 挂自绘滚动条 | 滚动容器是视口，给它一个 id 交给滚动条即可；虚拟滚动只管渲哪几条，滚动条只管画滚动位置 -->
<script setup lang="ts">
import {
  XhScrollbarRoot,
  XhScrollbarThumb,
  XhScrollbarTrack,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="10000"
    :estimate-size="36"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
  >
    <!-- 视口给个 id，滚动条按 controls 找到它；挂上后原生滚动条自动藏起来 -->
    <XhVirtualizerViewport id="virtualizer-scrollbar-viewport">
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="
            display: flex;
            align-items: center;
            height: 36px;
            padding-inline: 12px;
            border-block-end: 1px solid var(--xh-border-subtle);
          "
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
    <XhScrollbarRoot controls="virtualizer-scrollbar-viewport" type="always">
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </XhVirtualizerRoot>
</template>
`;export{r as default};
