const t=`<!-- 撤掉与换色 | 文字空了就落 data-state="empty"，整层不画；印子的颜色走 --xh-watermark-fg，深浅主题各自跟着走 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";

const on = ref(true);
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <label style="display: flex; align-items: center; gap: 8px; font-size: 13px">
      <input v-model="on" type="checkbox" />
      盖上水印
    </label>
    <!-- 图样当遮罩用，颜色由这一个变量决定；写成背景图就得把颜色焊死在图里 -->
    <XhWatermarkRoot
      :text="on ? '曦寒 · 机密' : ''"
      style="--xh-watermark-fg: var(--xh-fg-danger); border: 1px solid var(--xh-border-default); border-radius: 6px"
    >
      <XhWatermarkContent>
        <div style="padding: 24px; block-size: 180px; line-height: 1.9">
          <p>取消勾选后 root 落 data-state="empty"，印子那一层整层不画。</p>
        </div>
      </XhWatermarkContent>
    </XhWatermarkRoot>
  </div>
</template>
`;export{t as default};
