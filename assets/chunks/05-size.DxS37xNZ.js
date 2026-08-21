const e=`<!-- 尺寸 | size 只改内边距与字号，不写就是缺省档 -->
<script setup lang="ts">
import { XhBadge } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <XhBadge variant="subtle" size="sm">小</XhBadge>
    <XhBadge variant="subtle">缺省</XhBadge>
    <XhBadge variant="subtle" size="lg">大</XhBadge>
  </div>
</template>
`;export{e as default};
