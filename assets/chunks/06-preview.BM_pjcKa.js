const n=`<!-- 点开看大图 | 缩略图的点击与键盘自己接，放大层是一个对话框，里面再放一份独立的图片实例 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhImageFallback,
  XhImageImage,
  XhImageRoot,
  XhToolbarItem,
  XhToolbarRoot,
} from "@xihan-ui/vue";

const photo
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%230f172a%22/%3E%3Ccircle%20cx=%223.1%22%20cy=%220.8%22%20r=%220.35%22%20fill=%22%23fbbf24%22/%3E%3Cpath%20d=%22M0%203%201.4%201.4%202.4%202.3%203.1%201.6%204%202.4V3z%22%20fill=%22%2334d399%22/%3E%3C/svg%3E";

const open = ref(false);
const scale = ref(1);
const rotate = ref(0);

// 每次打开都从原始比例起看
function openPreview(): void {
  scale.value = 1;
  rotate.value = 0;
  open.value = true;
}

function zoom(step: number): void {
  scale.value = Math.min(3, Math.max(0.5, scale.value + step));
}

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};
<\/script>

<template>
  <!-- 缩略图当触发器：角色、Tab 位与两个按键都写在根上，组件原样透传 -->
  <XhImageRoot
    :src="photo"
    alt="山间日出"
    role="button"
    tabindex="0"
    aria-label="放大查看 山间日出"
    style="--xh-image-w: 160px; --xh-image-ratio: 4 / 3; cursor: zoom-in"
    @click="openPreview"
    @keydown.enter.prevent="openPreview"
    @keydown.space.prevent="openPreview"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <!-- 遮罩、居中定位与焦点圈禁都由对话框给，Esc 与点遮罩就是关闭预览 -->
  <XhDialogRoot v-model:open="open" size="lg" :translations="{ close: '关闭' }">
    <XhDialogContent>
      <XhDialogTitle>山间日出</XhDialogTitle>

      <!-- 放大层里是另一份图片实例：它的 alt、裁切方式与缩略图那份互不相干 -->
      <XhImageRoot
        :src="photo"
        alt="山间日出，放大查看"
        style="--xh-image-w: 100%; --xh-image-ratio: 4 / 3; --xh-image-fit: contain"
      >
        <XhImageImage
          :style="{
            transform: \`scale(\${scale}) rotate(\${rotate}deg)\`,
            transition: 'transform 120ms var(--xh-ease-standard)',
          }"
        />
        <XhImageFallback>加载中</XhImageFallback>
      </XhImageRoot>

      <!-- 缩放与旋转是两个数值加一条 transform，工具条只负责把这几颗按钮串成一个 Tab 位 -->
      <XhToolbarRoot>
        <XhToolbarItem value="zoom-in" :style="itemStyle" @click="zoom(0.25)">
          放大
        </XhToolbarItem>
        <XhToolbarItem value="zoom-out" :style="itemStyle" @click="zoom(-0.25)">
          缩小
        </XhToolbarItem>
        <XhToolbarItem value="rotate" :style="itemStyle" @click="rotate += 90">
          旋转
        </XhToolbarItem>
        <XhToolbarItem
          value="reset"
          :style="itemStyle"
          @click="scale = 1; rotate = 0"
        >
          还原
        </XhToolbarItem>
      </XhToolbarRoot>

      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
`;export{n as default};
