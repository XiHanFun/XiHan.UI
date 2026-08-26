const l=`<!-- 显隐时机 | type 决定滚动条什么时候露面：缺省的 scroll-hover 滚动或指针进来都露，hover 只认指针，always 恒露占一条道 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const types = ["scroll-hover", "hover", "always", "scroll"] as const;
const lines = Array.from({ length: 20 }, (_, i) => \`第 \${i + 1} 行\`);
<\/script>

<template>
  <div style="width: 100%; display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="type in types" :key="type" style="display: grid; gap: 6px">
      <span>type = {{ type }}</span>
      <XhScrollAreaRoot :type="type" style="block-size: 140px; inline-size: 180px">
        <XhScrollAreaViewport>
          <XhScrollAreaContent style="padding: 8px 12px">
            <p v-for="line in lines" :key="line" style="margin: 0; line-height: 22px">
              {{ line }}
            </p>
          </XhScrollAreaContent>
        </XhScrollAreaViewport>
        <XhScrollAreaScrollbar orientation="vertical">
          <XhScrollAreaTrack>
            <XhScrollAreaThumb />
          </XhScrollAreaTrack>
        </XhScrollAreaScrollbar>
      </XhScrollAreaRoot>
    </div>
  </div>
</template>
`;export{l as default};
