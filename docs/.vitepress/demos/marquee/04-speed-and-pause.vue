<!-- 速度与暂停 | speed 是每秒像素；pauseOnHover 在指针停下或焦点落进窗口时停住 -->
<script setup lang="ts">
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const speeds = [30, 60, 140] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <!--
      皮肤拿「一份内容在滚动轴上的长度」除以 speed 算一圈的时长，那个长度取自
      --xh-marquee-span（缺省 600）。内容长度与缺省差得多时把 span 改成真实长度，
      每秒滚过的像素数才逐字对得上。
    -->
    <div v-for="s in speeds" :key="s">
      <p style="margin-block-end: 6px; font-size: 12px">speed = {{ s }}（每秒 {{ s }} 像素）</p>
      <XhMarqueeRoot
        :speed="s"
        auto-fill
        pause-on-hover
        style="max-inline-size: 420px; border: 1px solid var(--xh-border-default); border-radius: 6px"
      >
        <XhMarqueeContent>
          <a href="#" style="padding: 6px 14px; white-space: nowrap">
            把指针停在这儿，或用 Tab 聚焦这条链接
          </a>
        </XhMarqueeContent>
      </XhMarqueeRoot>
    </div>
  </div>
</template>
