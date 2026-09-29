const a=`<!-- 偏移 | 离角多远用两个组件槽微调，不设 prop：圆形头像角上留白多，把状态点往里收一点才贴得住轮廓 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarRoot, XhBadge } from "@xihan-ui/vue";

// 正值朝行内末端、块末端挪；贴在右下角的点往里收就是两个负值
const inward = { "--xh-badge-offset-inline": "-4px", "--xh-badge-offset-block": "-4px" };
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <XhBadge dot tone="success" placement="bottom-end" label="在线">
      <XhAvatarRoot>
        <XhAvatarFallback>默</XhAvatarFallback>
      </XhAvatarRoot>
    </XhBadge>

    <XhBadge dot tone="success" placement="bottom-end" label="在线" :style="inward">
      <XhAvatarRoot>
        <XhAvatarFallback>收</XhAvatarFallback>
      </XhAvatarRoot>
    </XhBadge>
  </div>
</template>
`;export{a as default};
