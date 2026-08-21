const n=`<!-- 尺寸 | size 落成 content 的 data-size，只改面板的最大宽度；三档各自一个对话框，点开才看得出宽窄 -->
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";

// 中间档不传 size，缺省即中档
const sizes = [
  { key: "sm", size: "sm", label: "sm 窄" },
  { key: "md", size: undefined, label: "缺省" },
  { key: "lg", size: "lg", label: "lg 宽" },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhDialogRoot
      v-for="s in sizes"
      :key="s.key"
      v-slot="{ setOpen }"
      :size="s.size"
      :translations="{ close: '关闭' }"
    >
      <XhDialogTrigger>{{ s.label }}</XhDialogTrigger>
      <XhDialogContent>
        <XhDialogTitle>{{ s.label }}对话框</XhDialogTitle>
        <XhDialogDescription>
          内边距与字号三档一致，只有宽度上限不同。
        </XhDialogDescription>
        <div style="display: flex; justify-content: flex-end">
          <XhButton variant="solid" @click="setOpen(false)">知道了</XhButton>
        </div>
        <XhDialogCloseTrigger>✕</XhDialogCloseTrigger>
      </XhDialogContent>
    </XhDialogRoot>
  </div>
</template>
`;export{n as default};
