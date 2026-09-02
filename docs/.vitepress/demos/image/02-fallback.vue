<!-- 回退与状态 | 地址写坏和压根没给 src 是同一个落点，status-change 把三态报出来，root 上的 data-state 也有一份 -->
<script setup lang="ts">
import { reactive } from "vue";
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

const cover
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";

const status = reactive<Record<string, string>>({
  ok: "idle",
  broken: "idle",
  none: "idle",
});
</script>

<template>
  <XhImageRoot
    :src="cover"
    alt="正常加载的图"
    style="--xh-image-w: 160px; --xh-image-ratio: 16 / 9;"
    @status-change="(d: { status: string }) => (status.ok = d.status)"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <XhImageRoot
    src="https://example.invalid/broken.png"
    alt="地址写坏的图"
    style="--xh-image-w: 160px; --xh-image-ratio: 16 / 9;"
    @status-change="(d: { status: string }) => (status.broken = d.status)"
  >
    <XhImageImage />
    <XhImageFallback>图挂了</XhImageFallback>
  </XhImageRoot>

  <XhImageRoot
    style="--xh-image-w: 160px; --xh-image-ratio: 16 / 9;"
    @status-change="(d: { status: string }) => (status.none = d.status)"
  >
    <XhImageImage />
    <XhImageFallback>没有来源</XhImageFallback>
  </XhImageRoot>

  <span style="font-size: 13px;">
    状态：正常 {{ status.ok }} · 坏地址 {{ status.broken }} · 无 src {{ status.none }}
  </span>
</template>
