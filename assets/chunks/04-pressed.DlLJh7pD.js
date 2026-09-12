const t=`<!-- 真实按下 | 键帽只在可交互 owner 真正 active 时轻压 -->
<script setup lang="ts">
import { XhKbd } from "@xihan-ui/vue";
<\/script>

<template>
  <button type="button" style="display: inline-flex; align-items: center; gap: 8px">
    按住我 <XhKbd value="Enter" />
  </button>
</template>
`;export{t as default};
