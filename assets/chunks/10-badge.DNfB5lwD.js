const n=`<!-- 挂状态点与角标 | 根自己就是定位上下文，角标直接写进默认插槽；要挂到圆外就把根的裁剪打开，图片的圆角取自自身，不靠根裁 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot, XhBadge } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <!-- 状态点落在圆内，裁剪不用动 -->
    <XhAvatarRoot size="lg" src="/images/logo.png" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
      <span
        role="img"
        aria-label="在线"
        style="
          position: absolute;
          inset-block-end: 2px;
          inset-inline-end: 2px;
          inline-size: 10px;
          block-size: 10px;
          border-radius: var(--xh-shape-pill);
          background: var(--xh-fg-success);
        "
      />
    </XhAvatarRoot>

    <!-- 计数挂到圆外：根的裁剪打开，徽标绝对定位到右上角 -->
    <XhAvatarRoot size="lg" src="/images/logo.png" alt="曦寒" style="overflow: visible">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
      <XhBadge
        variant="solid"
        tone="danger"
        size="sm"
        style="position: absolute; inset-block-start: -4px; inset-inline-end: -10px"
      >
        12
      </XhBadge>
    </XhAvatarRoot>

    <!-- 落回退态时一样成立；点描一圈底色，压在头像边上也分得开 -->
    <XhAvatarRoot size="lg" style="overflow: visible">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
      <span
        role="img"
        aria-label="离线"
        style="
          position: absolute;
          inset-block-end: 0;
          inset-inline-end: 0;
          inline-size: 12px;
          block-size: 12px;
          border: 2px solid var(--vp-c-bg);
          border-radius: var(--xh-shape-pill);
          background: var(--xh-fg-disabled);
        "
      />
    </XhAvatarRoot>
  </div>
</template>
`;export{n as default};
