const n=`<!-- 循环引用 | 值出现在自己的祖先链上就停下并标成 [Circular]，不会无限递归；共享引用不算环，照样摊开 -->
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const shared = { id: 1 };
const node: Record<string, unknown> = { name: "root", left: shared, right: shared };
// 指回自己：摊到这里就停
node.parent = node;
<\/script>

<template>
  <XhJsonViewerRoot
    :value="node"
    :default-expanded-depth="2"
    style="inline-size: 100%; max-inline-size: 420px"
  />
</template>
`;export{n as default};
