const n=`<!-- 一组图共用一个预览层 | 图与图之间不必互相认识：宿主拿着地址数组与当前下标，预览层里只放一份图片实例 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhImageFallback,
  XhImageImage,
  XhImageRoot,
} from "@xihan-ui/vue";

function tile(bg: string, mark: string): string {
  return \`data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%23\${bg}%22/%3E%3Ccircle%20cx=%222%22%20cy=%221.5%22%20r=%220.8%22%20fill=%22%23\${mark}%22/%3E%3C/svg%3E\`;
}

const shots = [
  { src: tile("1e3a8a", "93c5fd"), title: "海面" },
  { src: tile("065f46", "6ee7b7"), title: "林地" },
  { src: tile("7c2d12", "fdba74"), title: "岩壁" },
];

const open = ref(false);
const index = ref(0);

function preview(at: number): void {
  index.value = at;
  open.value = true;
}

// 翻页就是下标加减，走到头回绕
function step(delta: number): void {
  index.value = (index.value + delta + shots.length) % shots.length;
}
<\/script>

<template>
  <div style="display: flex; gap: 8px">
    <XhImageRoot
      v-for="(shot, at) in shots"
      :key="shot.title"
      :src="shot.src"
      :alt="shot.title"
      role="button"
      tabindex="0"
      :aria-label="\`放大查看 \${shot.title}\`"
      style="--xh-image-w: 96px; --xh-image-ratio: 4 / 3; cursor: zoom-in"
      @click="preview(at)"
      @keydown.enter.prevent="preview(at)"
      @keydown.space.prevent="preview(at)"
    >
      <XhImageImage />
      <XhImageFallback>加载中</XhImageFallback>
    </XhImageRoot>
  </div>

  <XhDialogRoot v-model:open="open" size="lg" :translations="{ close: '关闭' }">
    <XhDialogContent>
      <XhDialogTitle>{{ shots[index].title }}</XhDialogTitle>

      <!-- 只有一份实例，src 换了机器就重走一遍加载，回退内容照常顶位 -->
      <XhImageRoot
        :src="shots[index].src"
        :alt="shots[index].title"
        style="--xh-image-w: 100%; --xh-image-ratio: 4 / 3; --xh-image-fit: contain"
      >
        <XhImageImage />
        <XhImageFallback>加载中</XhImageFallback>
      </XhImageRoot>

      <div style="display: flex; align-items: center; gap: 12px">
        <XhButton size="sm" variant="outline" @click="step(-1)">上一张</XhButton>
        <span style="font-size: 13px">{{ index + 1 }} / {{ shots.length }}</span>
        <XhButton size="sm" variant="outline" @click="step(1)">下一张</XhButton>
      </div>

      <XhDialogCloseTrigger>✕</XhDialogCloseTrigger>
    </XhDialogContent>
  </XhDialogRoot>
</template>
`;export{n as default};
