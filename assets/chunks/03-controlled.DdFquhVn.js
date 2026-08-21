const n=`<!-- 受控与锚点 | 传了 open 就由宿主说了算；root 的插槽给出锚点坐标与 openAt，可以从任意位置弹出 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhContextMenuRoot v-slot="{ point, openAt }" v-model:open="open">
      <XhContextMenuTrigger
        style="display: grid; place-items: center; min-block-size: 120px"
      >
        <span>右键这里，或者用下面的按钮从固定坐标弹出</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="open">
            <XhContextMenuItemText>打开</XhContextMenuItemText>
          </XhContextMenuItem>
          <XhContextMenuItem value="share">
            <XhContextMenuItemText>分享</XhContextMenuItemText>
          </XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <button type="button" @click="openAt(120, 200)">在 (120, 200) 弹出</button>
        <button type="button" @click="open = false">收起</button>
        <span>
          {{ open ? \`展开中 · 锚点 (\${point?.x}, \${point?.y})\` : "已收起" }}
        </span>
      </div>
    </XhContextMenuRoot>
  </div>
</template>
`;export{n as default};
