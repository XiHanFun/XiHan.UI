var e=`<!-- 图片地址 | 同源或放行了跨域的地址先取回再印出剪影 -->
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhWatermarkRoot text="XiHan" image="/images/demo-avatar.svg" :image-size="{ width: 40, height: 40 }">
    <XhWatermarkContent>
      <div style="inline-size: 320px; padding: 24px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>设计稿预览</strong>
        <p style="margin-block-end: 0">预览版本仅供内部评审，请勿外传。</p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
`;export{e as default};