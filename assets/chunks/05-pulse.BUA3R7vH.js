const t=`<!-- 呼吸 | pulse 让圆点呼吸，表达正在进行、给不出进度的状态；状态仍要写在文字里，减弱动效下圆点停在满亮 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarRoot, XhBadge, XhButton } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <XhBadge dot pulse tone="danger" label="录制中">
      <XhButton variant="outline">录制中</XhButton>
    </XhBadge>

    <XhBadge dot pulse tone="success" placement="bottom-end" label="通话中">
      <XhAvatarRoot>
        <XhAvatarFallback>曦</XhAvatarFallback>
      </XhAvatarRoot>
    </XhBadge>
  </div>
</template>
`;export{t as default};
