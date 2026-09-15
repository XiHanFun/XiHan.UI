const e=`<!-- 默认展开层数 | defaultExpandedDepth 决定初次摊到第几层：1 只展开根行，3 连孙层一起铺开 -->
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  server: {
    host: "127.0.0.1",
    port: 5173,
    tls: { enabled: false, cert: null },
  },
  build: { target: "es2022", minify: true },
};
<\/script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 100%; max-inline-size: 420px">
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="1" />
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="3" />
  </div>
</template>
`;export{e as default};
