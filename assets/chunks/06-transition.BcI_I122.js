const n=`<!-- 展开动画 | 收起时节点不卸载，作者接管内容区的 display，用一条行高过渡就能平滑展开 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
<\/script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhCollapsibleRoot v-model:open="open">
      <XhCollapsibleTrigger>{{ open ? "收起详情" : "展开详情" }}</XhCollapsibleTrigger>
      <!-- 行高在 0fr 与 1fr 之间过渡，不必测量内容高度；
           内边距挪到内层，收起时外层才不留白；display 被接管后，收起态改用 inert 隔离 -->
      <XhCollapsibleContent
        :inert="!open || undefined"
        :style="{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          paddingBlock: '0',
          transition:
            'grid-template-rows var(--xh-motion-duration-enter) var(--xh-motion-ease-enter)',
        }"
      >
        <div style="overflow: hidden">
          <p style="margin: 0; padding-block: 12px">
            展开与收起都走同一条过渡，中途再点一次会从当前高度掉头。
          </p>
        </div>
      </XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
`;export{n as default};
