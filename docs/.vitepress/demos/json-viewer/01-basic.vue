<!-- 基础用法 | 一份 JSON 摊成可展开的树：键名与值各自成块，六种类型各自上色，默认只展开根行 -->
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  name: "曦寒视图",
  version: "1.0.0-alpha.2",
  stars: 128,
  active: true,
  homepage: null,
  tags: ["框架无关", "跨端", "无障碍"],
  author: { name: "曦寒", site: "xihanfun.com" },
};
</script>

<template>
  <XhJsonViewerRoot
    :value="payload"
    style="inline-size: 100%; max-inline-size: 420px"
  />
</template>
