<!-- 参与表单 | 给了 name 就带上表单影子，提交的是一份独立 SVG；表单重置会把画布清回空 -->
<script setup lang="ts">
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadHiddenInput,
  XhSignaturePadLabel,
  XhSignaturePadRoot,
  XhSignaturePadSegment,
  XhSignaturePadStatus,
} from "@xihan-ui/vue";
</script>

<template>
  <form style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 22rem" @submit.prevent>
    <XhSignaturePadRoot
      name="signature"
      required
      :translations="{ statusEmpty: '尚未签名', statusSigned: '已签名' }"
    >
      <XhSignaturePadLabel>验收签名（必填）</XhSignaturePadLabel>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadSegment />
      </XhSignaturePadControl>
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
      <!-- 画布是一张图，签没签只能从这块活区域听出来；签上与清空都会播报一次 -->
      <XhSignaturePadStatus />
      <!-- 表单影子视觉隐藏，但 required 会拦住空签名的提交 -->
      <XhSignaturePadHiddenInput />
    </XhSignaturePadRoot>
    <div style="display: flex; gap: 8px">
      <button type="submit">提交</button>
      <button type="reset">重置</button>
    </div>
  </form>
</template>
