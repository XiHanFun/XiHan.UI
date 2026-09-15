const e=`<!-- 尺寸 | size 三档只换字号与层级缩进，行的结构与配色都不变 -->
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = { id: 7, label: "曦寒", nested: { ok: true } };
<\/script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2" size="sm" />
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2" size="md" />
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2" size="lg" />
  </div>
</template>
`;export{e as default};
